import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Interview } from "../models/Interview.model.js";
import { Resume } from "../models/Resume.model.js";
import { getHumeAccessToken } from "../services/hume.service.js";
import {
  generateQuestionsFromResume,
  evaluateAnswersBulk,
} from "../services/gemini.service.js";
import { getCache, setCache, delCache } from "../config/redis.js";

// Cache interview list per user for 60 seconds.
const INTERVIEWS_TTL = 60; // seconds
const interviewsKey  = (userId) => `interviews:${userId}`;

// POST /api/interviews
// Body: { resumeId, difficulty, type }
export const createInterview = asyncHandler(async (req, res) => {
  const { resumeId, difficulty, type = "technical" } = req.body;

  if (!resumeId || !difficulty) {
    return res.status(400).json(ApiResponse.error("resumeId and difficulty are required"));
  }

  // 1. Verify the resume belongs to this user
  const resume = await Resume.findOne({ _id: resumeId, userId: req.dbUser._id });
  if (!resume) {
    return res.status(404).json(ApiResponse.error("Resume not found"));
  }

  // 2. Build context chunks from parsedText directly
  if (!resume.parsedText || resume.parsedText.trim().length < 50) {
    return res
      .status(400)
      .json(ApiResponse.error("Resume has no stored text. Please re-upload your resume."));
  }

  const words = resume.parsedText.split(/\s+/).filter(Boolean);
  const chunkSize = Math.ceil(words.length / 3);
  const topChunks = [];
  for (let i = 0; i < 3 && i * chunkSize < words.length; i++) {
    topChunks.push(words.slice(i * chunkSize, (i + 1) * chunkSize).join(" "));
  }

  // 3. Generate questions grounded in top chunks
  const { questions } = await generateQuestionsFromResume(topChunks, difficulty, type, 10);

  // 4. Create interview document
  const interview = await Interview.create({
    resumeId: resume._id,
    userId:   req.dbUser._id,
    difficulty,
    type,
    questions,
    retrievedChunks: topChunks,
    status: "active",
  });

  // ── Invalidate the user's cached interview list ──────────────────────────
  await delCache(interviewsKey(req.dbUser._id));

  res.status(201).json(ApiResponse.success(interview, "Interview created"));
});

// GET /api/interviews
export const getMyInterviews = asyncHandler(async (req, res) => {
  const cacheKey = interviewsKey(req.dbUser._id);

  // ── Redis cache look-up ──────────────────────────────────────────────────
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json(ApiResponse.success(cached));
  }

  // ── Cache miss — query MongoDB ───────────────────────────────────────────
  const interviews = await Interview.find({ userId: req.dbUser._id })
    .populate("resumeId", "fileName extractedRole matchScore")
    .sort({ createdAt: -1 });

  await setCache(cacheKey, interviews, INTERVIEWS_TTL);

  res.json(ApiResponse.success(interviews));
});

// GET /api/interviews/:id
export const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    userId: req.dbUser._id,
  }).populate("resumeId", "fileName extractedRole matchScore");

  if (!interview) return res.status(404).json(ApiResponse.error("Interview not found"));
  res.json(ApiResponse.success(interview));
});

// POST /api/interviews/:id/answer
export const submitAnswer = asyncHandler(async (req, res) => {
  const { questionId, transcript } = req.body;

  if (!transcript || !transcript.trim()) {
    return res.status(400).json(ApiResponse.error("Transcript is required"));
  }

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

  interview.answers.push({
    questionId,
    transcript: transcript.trim(),
  });
  await interview.save();

  res.json(ApiResponse.success(null, "Answer saved successfully"));
});

// POST /api/interviews/:id/complete
export const completeInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    userId: req.dbUser._id,
  });

  if (!interview) return res.status(404).json(ApiResponse.error("Interview not found"));

  // Build context string from resume
  const resume = await Resume.findById(interview.resumeId).select("fileName extractedRole");
  const context = resume?.extractedRole
    ? `${resume.extractedRole} (from resume: ${resume.fileName})`
    : resume?.fileName || "Software Engineer";

  // Bulk evaluate all answers + overall feedback
  const qnaList = interview.answers.map(ans => {
    const q = interview.questions.id(ans.questionId);
    return {
      questionId: ans.questionId,
      question: q ? q.text : "Unknown",
      transcript: ans.transcript
    };
  });

  const { evaluatedAnswers, overallFeedback, overallScore, topStrengths, areasToImprove, recommendedResources } =
    await evaluateAnswersBulk(context, interview.difficulty, interview.type, qnaList);

  // Update individual answers with feedback/scores
  for (const evalAns of evaluatedAnswers) {
    const dbAns = interview.answers.find(a => a.questionId.toString() === evalAns.questionId);
    if (dbAns) {
      dbAns.feedback = evalAns.feedback;
      dbAns.score = evalAns.score;
    }
  }

  interview.overallFeedback = overallFeedback;
  interview.overallScore    = overallScore;
  interview.status          = "completed";
  interview.completedAt     = new Date();
  await interview.save();

  // ── Invalidate the cached interview list (status changed to "completed") ─
  await delCache(interviewsKey(req.dbUser._id));

  res.json(
    ApiResponse.success(
      { overallFeedback, overallScore, topStrengths, areasToImprove, recommendedResources, evaluatedAnswers },
      "Interview completed"
    )
  );
});

// DELETE /api/interviews/:id
export const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOneAndDelete({
    _id: req.params.id,
    userId: req.dbUser._id,
  });
  if (!interview) return res.status(404).json(ApiResponse.error("Interview not found"));

  // ── Invalidate the cached interview list ─────────────────────────────────
  await delCache(interviewsKey(req.dbUser._id));

  res.json(ApiResponse.success(null, "Interview deleted"));
});

// GET /api/interviews/hume-token
// Returns a short-lived Hume AI access token for the browser SDK
export const getHumeToken = asyncHandler(async (req, res) => {
  const accessToken = await getHumeAccessToken();
  res.json(ApiResponse.success({ accessToken }, "Hume token generated"));
});