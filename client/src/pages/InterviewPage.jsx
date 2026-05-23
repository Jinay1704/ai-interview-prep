import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Mic, Keyboard, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import InterviewerAvatar from "@/components/interview/InterviewerAvatar";
import VoiceInterview from "@/components/interview/VoiceInterview";
import FeedbackPanel from "@/components/interview/FeedbackPanel";
import { interviewService } from "@/services/interview.service";
import { useInterview } from "@/hooks/useInterview";
import { usePricingModal } from "@/App";
import { cn } from "@/utils/helpers";

export default function InterviewPage() {
  const { interviewId } = useParams();
  const navigate        = useNavigate();

  // ── Pull plan from context (no more hard-coded `const { canVoice } = true`) ─
  const { userPlan, openPricing } = usePricingModal();
  const canVoice = userPlan === "pro" || userPlan === "enterprise";

  const [interview, setInterview]           = useState(null);
  const [humeToken, setHumeToken]           = useState(null);
  const [loading, setLoading]               = useState(true);
  const [transcript, setTranscript]         = useState("");
  const [humeEmotions, setHumeEmotions]     = useState([]);
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [answerMode, setAnswerMode]         = useState("text"); // default text; switch to voice if canVoice
  const [avatarDoneSpeak, setAvatarDoneSpeak] = useState(false);

  const {
    currentIndex, currentQuestion, isLast,
    isSubmitting, isCompleting,
    submitAnswer, nextQuestion, completeInterview,
  } = useInterview(interview);

  // Load interview + optionally hume token
  useEffect(() => {
    const load = async () => {
      try {
        const iv = await interviewService.getById(interviewId);
        if (iv.status === "completed") {
          navigate(`/interview/${interviewId}/results`, { replace: true });
          return;
        }
        setInterview(iv);

        if (canVoice) {
          try {
            const token = await interviewService.getHumeToken();
            setHumeToken(token);
            setAnswerMode("voice");
          } catch {
            setAnswerMode("text");
            toast.warning("Voice unavailable — using text mode");
          }
        } else {
          setAnswerMode("text");
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [interviewId, navigate, canVoice]);

  // Reset per question
  useEffect(() => {
    setTranscript("");
    setHumeEmotions([]);
    setAvatarDoneSpeak(false);
    setLatestFeedback(null);
  }, [currentIndex]);

  const handleTranscript = useCallback((t) => setTranscript(t), []);
  const handleEmotions   = useCallback((e) => setHumeEmotions(e), []);
  const handleFallback   = useCallback(() => {
    setAnswerMode("text");
    toast.info("Switched to text mode");
  }, []);

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      toast.warning(answerMode === "voice" ? "Please speak your answer first." : "Please type your answer first.");
      return;
    }
    const feedback = await submitAnswer({ transcript, humeEmotions });
    if (feedback) setLatestFeedback(feedback);
  };

  const handleNext = () => {
    nextQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleComplete = async () => {
    const results = await completeInterview();
    if (results) navigate(`/interview/${interviewId}/results`);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  const total    = interview?.questions?.length ?? 0;
  const progress = total ? Math.round((currentIndex / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-medium text-sm truncate">
              {interview?.jobId?.title ?? "Interview"}
            </span>
          </div>

          <div className="flex-1 max-w-xs space-y-1 hidden sm:block">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Question {currentIndex + 1} of {total}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          <div className="text-xs text-muted-foreground shrink-0">{progress}% complete</div>
        </div>
      </div>

      {/* Main layout */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {!latestFeedback ? (
          <div className="grid md:grid-cols-2 gap-4 min-h-[520px]">

            {/* LEFT — Interviewer */}
            <div className="bg-background rounded-xl border flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Interviewer</span>
              </div>
              <div className="flex-1">
                <InterviewerAvatar
                  question={currentQuestion}
                  questionIndex={currentIndex}
                  total={total}
                  onSpeakEnd={() => setAvatarDoneSpeak(true)}
                />
              </div>
            </div>

            {/* RIGHT — Answer */}
            <div className="bg-background rounded-xl border flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your answer</span>
                </div>

                {/* Mode toggle — only if user has voice access */}
                {canVoice && (
                  <div className="flex items-center gap-1 p-0.5 rounded-md bg-muted">
                    <button
                      onClick={() => setAnswerMode("voice")}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all",
                        answerMode === "voice"
                          ? "bg-background text-foreground shadow-sm font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <Mic className="h-3 w-3" /> Voice
                    </button>
                    <button
                      onClick={() => setAnswerMode("text")}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all",
                        answerMode === "text"
                          ? "bg-background text-foreground shadow-sm font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <Keyboard className="h-3 w-3" /> Text
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col p-4 gap-4">
                {/* Voice mode */}
                {answerMode === "voice" && canVoice && (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <VoiceInterview
                      accessToken={humeToken}
                      onTranscript={handleTranscript}
                      onEmotions={handleEmotions}
                      isSubmitting={isSubmitting}
                      onFallback={handleFallback}
                    />
                  </div>
                )}

                {/* Text mode */}
                {(answerMode === "text" || !canVoice) && (
                  <div className="flex-1 flex flex-col gap-3">
                    {/* Upgrade nudge for free users */}
                    {!canVoice && (
                      <div className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                        Voice mode is available on Pro and Enterprise plans.{" "}
                        <button
                          onClick={openPricing}
                          className="underline text-primary font-medium hover:opacity-80 transition-opacity"
                        >
                          Upgrade →
                        </button>
                      </div>
                    )}
                    <Textarea
                      placeholder="Type your answer here…"
                      className="flex-1 min-h-[200px] resize-none text-sm"
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                    />
                  </div>
                )}

                {/* Transcript preview in voice mode */}
                {answerMode === "voice" && transcript && (
                  <div className="rounded-lg bg-muted/50 p-3 border border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                      Captured answer
                    </p>
                    <p className="text-sm leading-relaxed">{transcript}</p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !transcript.trim()}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Evaluating answer…</>
                  ) : (
                    <>Submit Answer <ChevronRight className="ml-1 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Feedback view */
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Answer submitted — here's your feedback</span>
            </div>

            <FeedbackPanel feedback={latestFeedback} />

            <div className="flex gap-3">
              {isLast ? (
                <Button className="flex-1" size="lg" onClick={handleComplete} disabled={isCompleting}>
                  {isCompleting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating final results…</>
                    : "Finish Interview & See Results →"}
                </Button>
              ) : (
                <Button className="flex-1" size="lg" onClick={handleNext}>
                  Next Question →
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}