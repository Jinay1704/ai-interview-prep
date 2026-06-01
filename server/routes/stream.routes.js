// server/routes/stream.routes.js
import { Router } from "express";
import { getStreamToken } from "../controllers/stream.controller.js";
import { requireAuth } from "../middleware/clerkAuth.js"; // Adjust import based on your auth middleware

const router = Router();
router.get("/token", requireAuth, getStreamToken);

export default router;