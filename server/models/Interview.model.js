import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text:       { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  category:   { type: String, default: "general" },
});

const answerSchema = new mongoose.Schema({
  questionId:   { type: mongoose.Schema.Types.ObjectId },
  transcript:   { type: String, default: "" },
  humeEmotions: { type: mongoose.Schema.Types.Mixed, default: {} },
  feedback:     { type: String, default: "" },
  score:        { type: Number, default: 0 },
});

const interviewSchema = new mongoose.Schema(
  {
    // Resume-based flow (new) — required when creating via resume
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },

    // Legacy job-based field — kept for backward compatibility
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["behavioral", "technical"],
      default: "technical",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    // Top-K resume chunks used to generate questions (audit trail)
    retrievedChunks: { type: [String], default: [] },

    questions:      [questionSchema],
    answers:        [answerSchema],
    overallScore:   { type: Number, default: 0 },
    overallFeedback:{ type: String, default: "" },
    status:         { type: String, enum: ["pending", "active", "completed"], default: "pending" },
    completedAt:    { type: Date },
  },
  { timestamps: true }
);

export const Interview = mongoose.model("Interview", interviewSchema);
