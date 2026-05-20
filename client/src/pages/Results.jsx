import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Trophy, RefreshCcw, Home, BookOpen, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { interviewService } from "@/services/interview.service";
import { scoreColor, difficultyBadgeVariant, formatDate } from "@/utils/helpers";

export default function Results() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewService
      .getById(interviewId)
      .then(setInterview)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!interview) return null;

  const {
    overallScore, overallFeedback, difficulty,
    questions, answers, jobId, completedAt,
  } = interview;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Interview Complete!</h1>
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span>{jobId?.title ?? "Interview"}</span>
          <span>·</span>
          <Badge variant={difficultyBadgeVariant(difficulty)}>{difficulty}</Badge>
          <span>·</span>
          <span>{formatDate(completedAt)}</span>
        </div>
      </div>

      {/* Overall score */}
      <Card className="text-center">
        <CardContent className="pt-8 pb-6 space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Overall Score</p>
          <p className={`text-6xl font-bold ${scoreColor(overallScore)}`}>
            {overallScore}
            <span className="text-2xl text-muted-foreground">/10</span>
          </p>
          {overallFeedback && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed pt-2">
              {overallFeedback}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Per-question breakdown */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Question Breakdown</h2>
        {questions.map((q, i) => {
          const ans = answers.find((a) => String(a.questionId) === String(q._id));
          return (
            <Card key={q._id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-medium leading-relaxed flex-1">
                    Q{i + 1}. {q.text}
                  </CardTitle>
                  {ans?.score !== undefined && (
                    <span className={`text-lg font-bold shrink-0 ${scoreColor(ans.score)}`}>
                      {ans.score}/10
                    </span>
                  )}
                </div>
              </CardHeader>
              {ans && (
                <CardContent className="space-y-3 text-sm">
                  {ans.transcript && (
                    <div className="rounded-md bg-muted p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Your answer
                      </p>
                      <p>{ans.transcript}</p>
                    </div>
                  )}
                  {ans.feedback && (
                    <p className="text-muted-foreground leading-relaxed">{ans.feedback}</p>
                  )}
                  {/* Top Hume emotions */}
                  {ans.humeEmotions?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {ans.humeEmotions.slice(0, 4).map((e) => (
                        <Badge key={e.name} variant="outline" className="text-xs">
                          {e.name} {Math.round(e.score * 100)}%
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1" onClick={() => navigate("/jobs/new")}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Try Another Interview
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => navigate("/resume")}>
          <BookOpen className="mr-2 h-4 w-4" /> Analyse Resume
        </Button>
        <Button variant="ghost" className="flex-1" onClick={() => navigate("/dashboard")}>
          <Home className="mr-2 h-4 w-4" /> Dashboard
        </Button>
      </div>
    </div>
  );
}
