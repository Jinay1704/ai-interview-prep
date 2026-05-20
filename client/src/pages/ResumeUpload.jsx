import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResumeDropzone from "@/components/resume/ResumeDropzone";
import AnalysisResult from "@/components/resume/AnalysisResult";
import { useResume } from "@/hooks/useResume";
import { jobService } from "@/services/job.service";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("none"); // "none" instead of ""
  const { analyse, isAnalysing, result } = useResume();

  useEffect(() => {
    jobService.getAll().then(setJobs).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!file) return toast.warning("Please upload a PDF resume first.");
    // Pass empty string to backend when no job selected
    const jobId = selectedJobId === "none" ? "" : selectedJobId;
    await analyse(file, jobId);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Resume Analysis</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload your PDF resume for an instant ATS score and improvement suggestions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Resume</CardTitle>
          <CardDescription>PDF only · max 5 MB</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ResumeDropzone onFileSelect={setFile} />

          {jobs.length > 0 && (
            <div className="space-y-2">
              <Label>Match against a job (optional)</Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job description…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No job — general analysis</SelectItem>
                  {jobs.map((j) => (
                    <SelectItem key={j.jobId} value={j.jobId}>
                      {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button className="w-full" onClick={handleSubmit} disabled={isAnalysing || !file}>
            {isAnalysing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analysing…</>
            ) : (
              "Analyse Resume"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && <AnalysisResult analysis={result} />}
    </div>
  );
}