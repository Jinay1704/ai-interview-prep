import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName:   { type: String, required: true },
    parsedText: { type: String, default: "" },
    analysis:   { type: mongoose.Schema.Types.Mixed, default: {} },
    matchScore: { type: Number, default: 0 },

    // Number of chunks stored in ChromaDB for this resume
    chunkCount: { type: Number, default: 0 },

    // Optional: extracted role/title from resume analysis for display
    extractedRole: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", resumeSchema);
