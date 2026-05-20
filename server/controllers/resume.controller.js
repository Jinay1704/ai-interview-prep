import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Resume } from "../models/Resume.model.js";
import { Job } from "../models/Job.model.js";
import { extractTextFromPDF } from "../services/resume.service.js";
import { analyseResume } from "../services/gemini.service.js";

// POST /api/resume/analyse
// multipart/form-data: file (PDF), optional jobId
export const analyseResumeHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(ApiResponse.error("Please upload a PDF resume"));
  }

  const { jobId } = req.body;
  let jobDescription = "";
  let jobObjectId = null;

  if (jobId) {
    const job = await Job.findOne({ jobId, userId: req.dbUser._id });
    if (job) {
      jobDescription = job.description;
      jobObjectId = job._id;
    }
  }

  // Extract text from PDF buffer
  const parsedText = await extractTextFromPDF(req.file.buffer);

  if (!parsedText || parsedText.trim().length < 50) {
    return res
      .status(400)
      .json(ApiResponse.error("Could not extract text from PDF. Please upload a text-based PDF."));
  }

  // Analyse with Gemini
  const analysis = await analyseResume(parsedText, jobDescription);

  const resume = await Resume.create({
    userId: req.dbUser._id,
    fileName: req.file.originalname,
    parsedText,
    analysis,
    matchScore: analysis.matchScore ?? 0,
    jobId: jobObjectId,
  });

  res.status(201).json(ApiResponse.success(resume, "Resume analysed successfully"));
});

// GET /api/resume
// Returns all resumes for the authenticated user
export const getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.dbUser._id })
    .populate("jobId", "title jobId")
    .sort({ createdAt: -1 })
    .select("-parsedText"); // Don't send full text in list
  res.json(ApiResponse.success(resumes));
});

// GET /api/resume/:id
export const getResumeById = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.dbUser._id,
  }).populate("jobId", "title jobId");

  if (!resume) return res.status(404).json(ApiResponse.error("Resume not found"));
  res.json(ApiResponse.success(resume));
});

// DELETE /api/resume/:id
export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOneAndDelete({
    _id: req.params.id,
    userId: req.dbUser._id,
  });
  if (!resume) return res.status(404).json(ApiResponse.error("Resume not found"));
  res.json(ApiResponse.success(null, "Resume deleted"));
});
