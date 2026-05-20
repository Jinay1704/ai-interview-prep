import { nanoid } from "nanoid";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Job } from "../models/Job.model.js";
import { extractJobMeta } from "../services/gemini.service.js";

// POST /api/jobs
// Body: { description }
export const createJob = asyncHandler(async (req, res) => {
  const { description } = req.body;
  if (!description || description.trim().length < 20) {
    return res.status(400).json(ApiResponse.error("Please provide a detailed job description"));
  }

  // Use Gemini to extract title + skills
  const { title, skills } = await extractJobMeta(description.trim());

  const job = await Job.create({
    jobId: nanoid(10),
    userId: req.dbUser._id,
    title,
    description: description.trim(),
    skills,
  });

  res.status(201).json(ApiResponse.success(job, "Job created"));
});

// GET /api/jobs
// Returns all jobs for the authenticated user
export const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ userId: req.dbUser._id }).sort({ createdAt: -1 });
  res.json(ApiResponse.success(jobs));
});

// GET /api/jobs/:jobId
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ jobId: req.params.jobId, userId: req.dbUser._id });
  if (!job) return res.status(404).json(ApiResponse.error("Job not found"));
  res.json(ApiResponse.success(job));
});

// DELETE /api/jobs/:jobId
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndDelete({ jobId: req.params.jobId, userId: req.dbUser._id });
  if (!job) return res.status(404).json(ApiResponse.error("Job not found"));
  res.json(ApiResponse.success(null, "Job deleted"));
});
