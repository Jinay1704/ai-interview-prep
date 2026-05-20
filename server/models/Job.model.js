import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },   // nanoid
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "" },
    description: { type: String, required: true },
    skills: [{ type: String }],                              // extracted by Gemini
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
