import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json(ApiResponse.error("Email and password are required"));
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json(ApiResponse.error("Email already registered"));
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    firstName: firstName || "",
    lastName: lastName || "",
  });

  const token = signToken(user._id);

  res.status(201).json(
    ApiResponse.success(
      {
        token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          plan: user.plan,
        },
      },
      "Registration successful"
    )
  );
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(ApiResponse.error("Email and password are required"));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    return res.status(401).json(ApiResponse.error("Invalid credentials"));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json(ApiResponse.error("Invalid credentials"));
  }

  const token = signToken(user._id);

  res.json(
    ApiResponse.success(
      {
        token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          plan: user.plan,
        },
      },
      "Login successful"
    )
  );
});
