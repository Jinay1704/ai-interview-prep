import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { difficultyBadgeVariant } from "@/utils/helpers";

export default function QuestionCard({ question, index, total }) {
  if (!question) return null;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Question {index + 1} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={difficultyBadgeVariant(question.difficulty)}>
              {question.difficulty}
            </Badge>
            {question.category && (
              <Badge variant="outline" className="text-xs">
                {question.category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg font-medium leading-relaxed">
          {question.text}
        </CardTitle>
      </CardContent>
    </Card>
  );
}
