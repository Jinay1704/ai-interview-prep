import { Router } from "express";
import { requireAuth } from "../middleware/clerkAuth.js";
import { geminiLimiter } from "../middleware/rateLimiter.js";
import {
  createInterview,
  getMyInterviews,
  getInterviewById,
  submitAnswer,
  completeInterview,
  getHumeToken,
  deleteInterview,
} from "../controllers/interview.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/hume-token", getHumeToken);
router.post("/", geminiLimiter, createInterview);
router.get("/", getMyInterviews);
router.get("/:id", getInterviewById);
router.post("/:id/answer", geminiLimiter, submitAnswer);
router.post("/:id/complete", completeInterview);
router.delete("/:id", deleteInterview);

export default router;