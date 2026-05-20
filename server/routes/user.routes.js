import { Router } from "express";
import { requireAuth } from "../middleware/clerkAuth.js";
import { getMe, deleteMe } from "../controllers/user.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/me", getMe);
router.delete("/me", deleteMe);

export default router;
