import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, ClipboardList, Trash2, ArrowRight, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import JobCard from "@/components/job/JobCard";
import { jobService } from "@/services/job.service";
import { interviewService } from "@/services/interview.service";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, scoreColor, difficultyBadgeVariant } from "@/utils/helpers";

const STATUS_BADGE = {
  pending:   { label: "Pending",     variant: "outline" },
  active:    { label: "In Progress", variant: "warning" },
  completed: { label: "Completed",   variant: "success" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { displayName } = useAuth();
  const [jobs, setJobs]             = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [j, iv] = await Promise.all([
          jobService.getAll(),
          interviewService.getAll(),
        ]);
        setJobs(j);
        setInterviews(iv);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDeleteJob = async (jobId) => {
    try {
      await jobService.delete(jobId);
      setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
      toast.success("Job deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteInterview = async (e, id) => {
    e.stopPropagation(); // prevent row click navigating
    if (!window.confirm("Delete this interview? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await interviewService.delete(id);
      setInterviews((prev) => prev.filter((iv) => iv._id !== id));
      toast.success("Interview deleted");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRowClick = (iv) => {
    if (iv.status === "completed") {
      navigate(`/interview/${iv._id}/results`);
    } else {
      navigate(`/interview/${iv._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const completedCount = interviews.filter((iv) => iv.status === "completed").length;
  const avgScore = completedCount
    ? (
        interviews
          .filter((iv) => iv.status === "completed")
          .reduce((sum, iv) => sum + (iv.overallScore ?? 0), 0) / completedCount
      ).toFixed(1)
    : null;

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back{displayName ? `, ${displayName}` : ""} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {completedCount} interview{completedCount !== 1 ? "s" : ""} completed
            {avgScore ? ` · avg score ${avgScore}/10` : ""}
          </p>
        </div>
        <Button onClick={() => navigate("/jobs/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Interview
        </Button>
      </div>

      {/* Stats */}
      {interviews.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Total interviews</p>
            <p className="text-2xl font-semibold">{interviews.length}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Completed</p>
            <p className="text-2xl font-semibold">{completedCount}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg score</p>
            <p className={`text-2xl font-semibold ${avgScore ? scoreColor(parseFloat(avgScore)) : ""}`}>
              {avgScore ?? "—"}
            </p>
          </div>
        </div>
      )}

      {/* Jobs */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Your Jobs</h2>
        {jobs.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No jobs yet. Create your first interview!</p>
            <Button className="mt-4" onClick={() => navigate("/jobs/new")}>
              <Plus className="mr-2 h-4 w-4" /> Create Job
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} onDelete={handleDeleteJob} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Interviews */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Interviews</h2>

        {interviews.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground text-sm">No interviews yet.</p>
            <Button className="mt-3" size="sm" onClick={() => navigate("/jobs/new")}>
              Start your first interview
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {interviews.map((iv) => {
              const statusInfo = STATUS_BADGE[iv.status] ?? STATUS_BADGE.pending;
              const isCompleted = iv.status === "completed";

              return (
                <Card
                  key={iv._id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleRowClick(iv)}
                >
                  <CardContent className="flex items-center justify-between py-4 px-5 gap-4">
                    {/* Left — title + date */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {iv.jobId?.title ?? "Interview"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(iv.createdAt)}
                      </p>
                    </div>

                    {/* Middle — badges + score */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={difficultyBadgeVariant(iv.difficulty)}>
                        {iv.difficulty}
                      </Badge>

                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>

                      {isCompleted && iv.overallScore != null && (
                        <span className={`text-sm font-bold flex items-center gap-1 ${scoreColor(iv.overallScore)}`}>
                          <Trophy className="h-3.5 w-3.5" />
                          {iv.overallScore}/10
                        </span>
                      )}

                      {isCompleted && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Right — delete button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                      disabled={deletingId === iv._id}
                      onClick={(e) => handleDeleteInterview(e, iv._id)}
                    >
                      {deletingId === iv._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}