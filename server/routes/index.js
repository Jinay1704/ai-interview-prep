import { Router } from "express";
import { clerkAuth } from "../middleware/clerkAuth.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import webhookRoutes from "./webhook.routes.js";
import userRoutes from "./user.routes.js";
import jobRoutes from "./job.routes.js";
import interviewRoutes from "./interview.routes.js";
import resumeRoutes from "./resume.routes.js";

const router = Router();

// Apply Clerk auth to all routes (sets req.auth, does NOT enforce login)
router.use(clerkAuth);

// Rate limit all API routes
router.use(apiLimiter);

// Webhooks — raw body, no auth
router.use("/webhooks", webhookRoutes);

// Protected routes
router.use("/user", userRoutes);
router.use("/jobs", jobRoutes);
router.use("/interviews", interviewRoutes);
router.use("/resume", resumeRoutes);

export default router;
