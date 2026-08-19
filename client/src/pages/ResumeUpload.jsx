import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, FileText, Trash2, Brain, BarChart2, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ResumeDropzone from "@/components/resume/ResumeDropzone";
import AnalysisResult from "@/components/resume/AnalysisResult";
import { useResume } from "@/hooks/useResume";
import { resumeService } from "@/services/resume.service";

const atsColor = (score) => {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-500";
};

const atsBg = (score) => {
  if (score >= 75) return "bg-green-50 border-green-200";
  if (score >= 50) return "bg-yellow-50 border-yellow-200";
  return "bg-red-50 border-red-200";
};

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [file, setFile]         = useState(null);
  const [myResumes, setMyResumes]   = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId]   = useState(null);
  const { analyse, isAnalysing, result } = useResume();

  // Load saved resumes list
  useEffect(() => {
    resumeService
      .getAll()
      .then(setMyResumes)
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, []);

  const handleSubmit = async () => {
    if (!file) return toast.warning("Please upload a PDF resume first.");
    const newResume = await analyse(file);
    if (newResume) {
      // Prepend to list
      setMyResumes((prev) => [newResume, ...prev]);
      setFile(null);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this resume? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await resumeService.delete(id);
      setMyResumes((prev) => prev.filter((r) => r._id !== id));
      toast.success("Resume deleted");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl space-y-10">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold">Resume Hub</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload your resume for ATS analysis, or use a saved resume to start a personalised interview.
        </p>
      </div>

      {/* ── Upload & Analyse ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          Analyse a Resume
        </h2>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Resume</CardTitle>
            <CardDescription>PDF only · max 5 MB · ATS score + improvement suggestions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ResumeDropzone onFileSelect={setFile} />

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isAnalysing || !file}
            >
              {isAnalysing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analysing & storing embeddings…
                </>
              ) : (
                "Analyse Resume"
              )}
            </Button>

            {isAnalysing && (
              <p className="text-xs text-center text-muted-foreground animate-pulse">
                Generating ATS report and indexing resume in vector store for interview use…
              </p>
            )}
          </CardContent>
        </Card>

        {result && <AnalysisResult analysis={result} />}
      </section>

      {/* ── My Resumes ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          My Resumes
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            Use any resume to start an interview
          </span>
        </h2>

        {loadingList ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : myResumes.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-muted/20 space-y-2">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No resumes saved yet. Upload one above!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myResumes.map((resume) => (
              <Card key={resume._id} className={`border ${atsBg(resume.matchScore ?? 0)}`}>
                <CardContent className="flex items-center gap-4 py-4 px-5">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-white border flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{resume.fileName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {resume.extractedRole && (
                        <span className="text-xs text-muted-foreground">{resume.extractedRole}</span>
                      )}
                      {resume.matchScore != null && (
                        <Badge variant="outline" className={`text-xs ${atsColor(resume.matchScore)}`}>
                          ATS {resume.matchScore}
                        </Badge>
                      )}
                      {resume.chunkCount > 0 && (
                        <Badge variant="outline" className="text-xs text-blue-600">
                          {resume.chunkCount} chunks indexed
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs"
                      onClick={() => navigate(`/jobs/new?resumeId=${resume._id}`)}
                    >
                      Interview <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      disabled={deletingId === resume._id}
                      onClick={(e) => handleDelete(resume._id, e)}
                    >
                      {deletingId === resume._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Plus className="h-4 w-4 mr-1" /> Upload another resume
        </Button>
      </section>
    </div>
  );
}