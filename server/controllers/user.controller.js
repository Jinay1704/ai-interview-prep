import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/User.model.js";

// GET /api/user/me
export const getMe = asyncHandler(async (req, res) => {
  res.json(ApiResponse.success(req.dbUser));
});

// POST /api/user/sync  — called internally by webhook controller
export const syncUser = async ({ clerkId, email, firstName, lastName, imageUrl }) => {
  return User.findOneAndUpdate(
    { clerkId },
    { clerkId, email, firstName, lastName, imageUrl },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

// DELETE /api/user/me
export const deleteMe = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.dbUser._id);
  res.json(ApiResponse.success(null, "Account deleted"));
});
