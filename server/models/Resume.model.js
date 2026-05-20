import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    parsedText: { type: String, default: "" },
    analysis: { type: mongoose.Schema.Types.Mixed, default: {} },
    matchScore: { type: Number, default: 0 },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null },
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", resumeSchema);
