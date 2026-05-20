import { CheckCircle2, AlertCircle, Target, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function AnalysisResult({ analysis }) {
  if (!analysis) return null;
  const {
    matchScore, atsScore, summary,
    strengths = [], weaknesses = [],
    missingKeywords = [], suggestions = [],
    sections = {},
  } = analysis.analysis ?? analysis;

  const ScoreRing = ({ score, label }) => (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center w-20 h-20">
        <svg className="w-20 h-20 -rotate-90">
          <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34" fill="none"
            stroke="hsl(var(--primary))" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - score / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-lg font-bold">{score}</span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Scores */}
      <Card>
        <CardHeader><CardTitle className="text-base">Scores</CardTitle></CardHeader>
        <CardContent className="flex justify-around flex-wrap gap-6">
          <ScoreRing score={matchScore ?? 0} label="Match Score" />
          <ScoreRing score={atsScore ?? 0} label="ATS Score" />
          {sections.experience !== undefined && <ScoreRing score={(sections.experience ?? 0) * 10} label="Experience" />}
          {sections.skills !== undefined && <ScoreRing score={(sections.skills ?? 0) * 10} label="Skills" />}
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        {strengths.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm text-green-700">Strengths</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {weaknesses.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm text-yellow-700">Weaknesses</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {weaknesses.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Missing keywords */}
      {missingKeywords.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" /> Missing Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {missingKeywords.map((kw) => (
              <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestions.map((s, i) => (
              <p key={i} className="text-sm text-muted-foreground">• {s}</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
