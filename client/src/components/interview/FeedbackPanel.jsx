import { CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scoreColor } from "@/utils/helpers";

export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null;

  const { feedback: text, score, strengths = [], improvements = [] } = feedback;

  return (
    <Card className="border-l-4 border-l-green-500 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Answer Feedback</CardTitle>
          <span className={`text-2xl font-bold ${scoreColor(score)}`}>
            {score}<span className="text-sm text-muted-foreground">/10</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>

        {strengths.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Strengths</p>
            {strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}

        {improvements.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">To improve</p>
            {improvements.map((imp, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                <span>{imp}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
