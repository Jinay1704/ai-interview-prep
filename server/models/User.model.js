import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId:    { type: String, required: true, unique: true },
    email:      { type: String, required: true },
    firstName:  { type: String, default: "" },
    lastName:   { type: String, default: "" },
    imageUrl:   { type: String, default: "" },

    // ── SaaS plan ────────────────────────────────────────────────
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },

    // ── Usage counters ───────────────────────────────────────────
    interviewsUsed:  { type: Number, default: 0 },
    resumesUsed:     { type: Number, default: 0 },

    // Resets every billing cycle (monthly for pro/enterprise)
    billingCycleStart: { type: Date, default: Date.now },

    // Razorpay subscription tracking
    razorpayOrderId:      { type: String, default: "" },
    razorpayPaymentId:    { type: String, default: "" },
    subscriptionActiveUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Virtual: plan limits ──────────────────────────────────────────
userSchema.virtual("limits").get(function () {
  const LIMITS = {
    free:       { interviews: 5,    resumes: 10,  voice: false },
    pro:        { interviews: 50,   resumes: -1,  voice: true  }, // -1 = unlimited
    enterprise: { interviews: 1000, resumes: -1,  voice: true  },
  };
  return LIMITS[this.plan] ?? LIMITS.free;
});

// ── Method: check if billing cycle needs reset ────────────────────
userSchema.methods.resetCycleIfNeeded = async function () {
  if (this.plan === "free") return; // free plan never resets
  const now = new Date();
  const cycleStart = new Date(this.billingCycleStart);
  const daysSince = (now - cycleStart) / (1000 * 60 * 60 * 24);
  if (daysSince >= 30) {
    this.interviewsUsed  = 0;
    this.resumesUsed     = 0;
    this.billingCycleStart = now;
    await this.save();
  }
};

// ── Method: can user do action? ───────────────────────────────────
userSchema.methods.canDo = function (action) {
  const limits = this.limits;
  if (action === "interview") {
    return limits.interviews === -1 || this.interviewsUsed < limits.interviews;
  }
  if (action === "resume") {
    return limits.resumes === -1 || this.resumesUsed < limits.resumes;
  }
  if (action === "voice") {
    return limits.voice;
  }
  return false;
};

export const User = mongoose.model("User", userSchema);