import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Interview } from "../models/Interview.model.js";
import { Job } from "../models/Job.model.js";
import { getHumeAccessToken } from "../services/hume.service.js";
import {
  generateQuestions,
  evaluateAnswer,
  generateOverallFeedback,
} from "../services/gemini.service.js";

// POST /api/interviews
export const createInterview = asyncHandler(async (req, res) => {
  const { jobId, difficulty } = req.body;
  if (!jobId || !difficulty) {
    return res.status(400).json(ApiResponse.error("jobId and difficulty are required"));
  }

  const job = await Job.findOne({ jobId, userId: req.dbUser._id });
  if (!job) return res.status(404).json(ApiResponse.error("Job not found"));

  const { questions } = await generateQuestions(job.title, job.skills, difficulty);

  const interview = await Interview.create({
    jobId: job._id,
    userId: req.dbUser._id,
    difficulty,
    questions,
    status: "active",
  });

  res.status(201).json(ApiResponse.success(interview, "Interview created"));
});

// GET /api/interviews
export const getMyInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ userId: req.dbUser._id })
    .populate("jobId", "title jobId")
    .sort({ createdAt: -1 });
  res.json(ApiResponse.success(interviews));
});

// GET /api/interviews/:id
export const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    userId: req.dbUser._id,
  }).populate("jobId", "title jobId skills");

  if (!interview) return res.status(404).json(ApiResponse.error("Interview not found"));
  res.json(ApiResponse.success(interview));
});

// POST /api/interviews/:id/answer
export const submitAnswer = asyncHandler(async (req, res) => {
  const { questionId, transcript, humeEmotions } = req.body;

  if (!transcript || !transcript.trim()) {
    return res.status(400).json(ApiResponse.error("Transcript is required"));
  }

  // Fetch interview WITHOUT populate first
  const interview = await Interview.findOne({
    _id: req.params.id,
    userId: req.dbUser._id,
  });

  if (!interview) return res.status(404).json(ApiResponse.error("Interview not found"));
  if (interview.status === "completed") {
    return res.status(400).json(ApiResponse.error("Interview is already completed"));
  }

  const question = interview.questions.id(questionId);
  if (!question) return res.status(404).json(ApiResponse.error("Question not found"));

  // Fetch job separately to get title safely
  const job = await Job.findById(interview.jobId).select("title");
  const jobTitle = job?.title || "Software Engineer"; // safe fallback

  const { feedback, score, strengths, improvements } = await evaluateAnswer(
    question.text,
    transcript.trim(),
    jobTitle
  );

  interview.answers.push({
    questionId,
    transcript: transcript.trim(),
    humeEmotions: humeEmotions || [],
    feedback,
    score,
  });
  await interview.save();

  res.json(ApiResponse.success({ feedback, score, strengths, improvements }));
});

// POST /api/interviews/:id/complete
export const completeInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    userId: req.dbUser._id,
  });

  if (!interview) return res.status(404).json(ApiResponse.error("Interview not found"));

  // Fetch job separately
  const job = await Job.findById(interview.jobId).select("title");
  const jobTitle = job?.title || "Software Engineer";

  const { overallFeedback, overallScore, topStrengths, areasToImprove, recommendedResources } =
    await generateOverallFeedback(
      jobTitle,
      interview.difficulty,
      interview.answers
    );

  interview.overallFeedback = overallFeedback;
  interview.overallScore    = overallScore;
  interview.status          = "completed";
  interview.completedAt     = new Date();
  await interview.save();

  res.json(
    ApiResponse.success(
      { overallFeedback, overallScore, topStrengths, areasToImprove, recommendedResources },
      "Interview completed"
    )
  );
});

// GET /api/interviews/hume-token
export const getHumeToken = asyncHandler(async (_req, res) => {
  const accessToken = await getHumeAccessToken();
  res.json(ApiResponse.success({ accessToken }));
});

// DELETE /api/interviews/:id
export const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOneAndDelete({
    _id: req.params.id,
    userId: req.dbUser._id,
  });
  if (!interview) return res.status(404).json(ApiResponse.error("Interview not found"));
  res.json(ApiResponse.success(null, "Interview deleted"));
});