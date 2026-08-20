import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { getCache, setCache } from "../config/redis.js";

// Cache authenticated users for 5 minutes to avoid hitting MongoDB on every request.
const USER_CACHE_TTL = 5 * 60; // seconds

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(ApiResponse.error("Unauthorized"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Redis cache look-up ────────────────────────────────────────────────
    const cacheKey = `user:${decoded.userId}`;
    const cachedUser = await getCache(cacheKey);

    if (cachedUser) {
      req.dbUser = cachedUser;
      return next();
    }

    // ── Cache miss — fetch from MongoDB and cache result ───────────────────
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return res.status(401).json(ApiResponse.error("User not found"));
    }

    await setCache(cacheKey, user, USER_CACHE_TTL);

    req.dbUser = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json(ApiResponse.error("Invalid or expired token"));
    }
    next(err);
  }
};
