import { Router } from "express";
import { requireAuth } from "../middleware/clerkAuth.js";
import {
  createJob,
  getMyJobs,
  getJobById,
  deleteJob,
} from "../controllers/job.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createJob);
router.get("/", getMyJobs);
router.get("/:jobId", getJobById);
router.delete("/:jobId", deleteJob);

export default router;
