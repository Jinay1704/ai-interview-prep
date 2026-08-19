import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { geminiLimiter } from "../middleware/rateLimiter.js";
import {
  analyseResumeHandler,
  getMyResumes,
  getResumeById,
  deleteResume,
} from "../controllers/resume.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/analyse", upload.single("file"), geminiLimiter, analyseResumeHandler);
router.get("/", getMyResumes);
router.get("/:id", getResumeById);
router.delete("/:id", deleteResume);

export default router;
