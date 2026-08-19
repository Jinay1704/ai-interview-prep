import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { FileText, Plus, Loader2, ChevronRight, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DifficultySelect from "@/components/interview/DifficultySelect";
import { resumeService } from "@/services/resume.service";
import { interviewService } from "@/services/interview.service";

const STEPS = ["Select Resume", "Type & Difficulty", "Starting…"];

export default function JobSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedId = searchParams.get("resumeId");

  const [step, setStep]               = useState(preSelectedId ? 1 : 0);
  const [resumes, setResumes]         = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [difficulty, setDifficulty]   = useState("medium");
  const [type, setType]               = useState("technical");
  const [isStarting, setIsStarting]   = useState(false);

  // Load user's resumes
  useEffect(() => {
    resumeService
      .getAll()
      .then((data) => {
        setResumes(data);
        // Pre-select if resumeId was in URL
        if (preSelectedId) {
          const found = data.find((r) => r._id === preSelectedId);
          if (found) setSelectedResume(found);
        }
      })
      .catch(() => toast.error("Failed to load resumes"))
      .finally(() => setLoadingResumes(false));
  }, [preSelectedId]);

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
    setStep(1);
  };

  const handleStart = async () => {
    if (!selectedResume) return;
    setIsStarting(true);
    try {
      const interview = await interviewService.create(selectedResume._id, difficulty, type);
      navigate(`/interview/${interview._id}`);
    } catch (err) {
      toast.error(err.message);
      setIsStarting(false);
    }
  };

  const atsColor = (score) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-500";
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
            <span className={`text-sm ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 0 — Select Resume */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Select Your Resume
            </CardTitle>
            <CardDescription>
              We'll generate personalised interview questions based on your actual experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingResumes ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-10 border rounded-lg bg-muted/20 space-y-3">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground text-sm">
                  No resumes uploaded yet.
                </p>
                <Button onClick={() => navigate("/resume")} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Upload a Resume
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {resumes.map((resume) => (
                    <button
                      key={resume._id}
                      onClick={() => handleSelectResume(resume)}
                      className="w-full text-left rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all p-4 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{resume.fileName}</p>
                          {resume.extractedRole && (
                            <p className="text-xs text-muted-foreground truncate">{resume.extractedRole}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {resume.matchScore != null && (
                          <Badge variant="outline" className={atsColor(resume.matchScore)}>
                            ATS {resume.matchScore}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => navigate("/resume")}
                >
                  <Plus className="h-4 w-4 mr-1" /> Upload a new resume
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 1 — Difficulty */}
      {step === 1 && selectedResume && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Settings</CardTitle>
            <CardDescription>
              Interview will be based on{" "}
              <span className="font-medium text-foreground">{selectedResume.fileName}</span>
              {selectedResume.extractedRole && ` · ${selectedResume.extractedRole}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Interview Type</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={type === "technical" ? "default" : "outline"}
                  onClick={() => setType("technical")}
                  className="w-full"
                >
                  Technical
                </Button>
                <Button
                  variant={type === "behavioral" ? "default" : "outline"}
                  onClick={() => setType("behavioral")}
                  className="w-full"
                >
                  Behavioral
                </Button>
              </div>
            </div>

            <DifficultySelect value={difficulty} onChange={setDifficulty} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                ← Back
              </Button>
              <Button className="flex-1" onClick={handleStart} disabled={isStarting}>
                {isStarting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating questions…
                  </>
                ) : (
                  "Start Interview →"
                )}
              </Button>
            </div>
            {isStarting && (
              <p className="text-xs text-center text-muted-foreground animate-pulse">
                Retrieving resume context and generating personalised questions…
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
