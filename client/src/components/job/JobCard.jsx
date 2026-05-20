import { useNavigate } from "react-router-dom";
import { Briefcase, Trash2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/helpers";

export default function JobCard({ job, onDelete }) {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <CardTitle className="text-base">{job.title || "Untitled Role"}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => onDelete(job.jobId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">{formatDate(job.createdAt)}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{job.skills.length - 6} more
              </Badge>
            )}
          </div>
        )}

        {/* Description preview */}
        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

        <Button
          size="sm"
          className="w-full"
          onClick={() => navigate(`/jobs/new?jobId=${job.jobId}`)}
        >
          Start Interview <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
