import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);