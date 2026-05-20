import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import JobDescForm from "@/components/job/JobDescForm";
import DifficultySelect from "@/components/interview/DifficultySelect";
import { jobService } from "@/services/job.service";
import { interviewService } from "@/services/interview.service";

const STEPS = ["Job Description", "Difficulty", "Starting…"];

export default function JobSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const existingJobId = searchParams.get("jobId"); // pre-filled from JobCard

  const [step, setStep] = useState(existingJobId ? 1 : 0);
  const [createdJobId, setCreatedJobId] = useState(existingJobId || "");
  const [difficulty, setDifficulty] = useState("medium");
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Step 0 — submit job description
  const handleJobSubmit = async ({ description }) => {
    setIsCreatingJob(true);
    try {
      const job = await jobService.create(description);
      setCreatedJobId(job.jobId);
      setStep(1);
      toast.success(`Role detected: ${job.title}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsCreatingJob(false);
    }
  };

  // Step 1 — start interview
  const handleStart = async () => {
    setIsStarting(true);
    try {
      const interview = await interviewService.create(createdJobId, difficulty);
      navigate(`/interview/${interview._id}`);
    } catch (err) {
      toast.error(err.message);
      setIsStarting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                i < step
                  ? "bg-primary border-primary text-primary-foreground"
                  : i === step
                  ? "border-primary text-primary"
                  : "border-muted text-muted-foreground"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className={`text-sm ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 0 — Job description */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Paste Job Description</CardTitle>
            <CardDescription>
              We'll extract the role and skills, then generate tailored questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobDescForm onSubmit={handleJobSubmit} isLoading={isCreatingJob} />
          </CardContent>
        </Card>
      )}

      {/* Step 1 — Difficulty */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Difficulty</CardTitle>
            <CardDescription>
              Select how challenging you want the interview questions to be.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DifficultySelect value={difficulty} onChange={setDifficulty} />
            <Button className="w-full" onClick={handleStart} disabled={isStarting}>
              {isStarting ? "Creating interview…" : "Start Interview →"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
