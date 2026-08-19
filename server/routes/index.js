import { Router } from "express";
import { apiLimiter } from "../middleware/rateLimiter.js";
import authRoutes      from "./auth.routes.js";
import userRoutes      from "./user.routes.js";
import jobRoutes       from "./job.routes.js";
import interviewRoutes from "./interview.routes.js";
import resumeRoutes    from "./resume.routes.js";

const router = Router();

// Rate limit all API routes
router.use(apiLimiter);

// Public auth routes (no JWT needed)
router.use("/auth", authRoutes);

// Protected routes (JWT required — each route applies requireAuth internally)
router.use("/user",       userRoutes);
router.use("/jobs",       jobRoutes);
router.use("/interviews", interviewRoutes);
router.use("/resume",     resumeRoutes);

export default router;