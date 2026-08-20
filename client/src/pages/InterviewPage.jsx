// client/src/pages/InterviewPage.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ChevronRight, Mic, MicOff, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { VoiceProvider, useVoice, VoiceReadyState } from "@humeai/voice-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { interviewService } from "@/services/interview.service";
import { useInterview } from "@/hooks/useInterview";
import InterviewerAvatar from "@/components/interview/InterviewerAvatar";

// ── Inner component that uses Hume voice hooks ─────────────────────────────
function VoiceInterviewInner({
  interview,
  currentIndex,
  currentQuestion,
  isLast,
  isSubmitting,
  isCompleting,
  submitAnswer,
  nextQuestion,
  completeInterview,
  onComplete,
}) {
  const { connect, disconnect, readyState, messages } = useVoice();
  const [mode, setMode]           = useState("voice"); // "voice" | "text"
  const [transcript, setTranscript] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isListening, setIsListening]         = useState(false);
  const prevIndexRef = useRef(currentIndex);

  // Reset transcripts when question changes
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      setTranscript("");
      setVoiceTranscript("");
      setIsListening(false);
      prevIndexRef.current = currentIndex;
    }
  }, [currentIndex]);

  // Collect Hume final transcripts from messages
  useEffect(() => {
    const latest = [...messages].reverse().find(
      (m) => m.type === "user_message" && m.message?.content
    );
    if (latest) {
      setVoiceTranscript(latest.message.content);
    }
  }, [messages]);

  const handleStartListening = async () => {
    try {
      await connect({});
      setIsListening(true);
    } catch (err) {
      toast.error("Could not start voice: " + (err.message ?? "Unknown error"));
    }
  };

  const handleStopListening = () => {
    disconnect();
    setIsListening(false);
  };

  const handleSubmit = async () => {
    const answer = mode === "voice" ? voiceTranscript : transcript;
    if (!answer.trim()) {
      toast.warning("Please provide an answer first.");
      return;
    }
    if (isListening) handleStopListening();

    await submitAnswer({ transcript: answer });

    if (isLast) {
      const results = await completeInterview();
      if (results) onComplete();
    } else {
      nextQuestion();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activeTranscript = mode === "voice" ? voiceTranscript : transcript;
  const canSubmit = activeTranscript.trim().length > 0 && !isSubmitting && !isCompleting;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      {/* Two column layout */}
      <div className="grid md:grid-cols-2 gap-5 min-h-[520px]">

        {/* Left — AI Interviewer */}
        <div className="bg-background rounded-xl border flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              AI Interviewer
            </span>
          </div>
          <div className="flex-1">
            <InterviewerAvatar
              question={currentQuestion}
              questionIndex={currentIndex}
              total={interview.questions?.length ?? 0}
            />
          </div>
        </div>

        {/* Right — Your Answer */}
        <div className="bg-background rounded-xl border flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Your Answer
              </span>
            </div>
            {/* Mode toggle */}
            <div className="flex items-center gap-1 rounded-md border p-0.5 bg-muted/30">
              <button
                onClick={() => setMode("voice")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  mode === "voice"
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mic className="h-3 w-3" /> Voice
              </button>
              <button
                onClick={() => {
                  if (isListening) handleStopListening();
                  setMode("text");
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  mode === "text"
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Keyboard className="h-3 w-3" /> Text
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-4 gap-4">
            {mode === "voice" ? (
              <div className="flex-1 flex flex-col gap-4">
                {/* Voice controls */}
                <div className="flex flex-col items-center justify-center flex-1 gap-4">
                  <button
                    onClick={isListening ? handleStopListening : handleStartListening}
                    disabled={readyState === VoiceReadyState.CONNECTING}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 ring-4 ring-red-200 animate-pulse"
                        : "bg-primary hover:bg-primary/90 ring-4 ring-primary/20"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {readyState === VoiceReadyState.CONNECTING ? (
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : isListening ? (
                      <MicOff className="h-8 w-8 text-white" />
                    ) : (
                      <Mic className="h-8 w-8 text-white" />
                    )}
                  </button>

                  <p className="text-sm text-muted-foreground text-center">
                    {isListening
                      ? "Listening… tap to stop"
                      : voiceTranscript
                      ? "Tap to re-record"
                      : "Tap to start speaking"}
                  </p>
                </div>

                {/* Voice transcript preview */}
                {voiceTranscript && (
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed max-h-40 overflow-y-auto">
                    <p className="text-xs text-muted-foreground mb-1 font-medium">Transcript:</p>
                    <p>{voiceTranscript}</p>
                  </div>
                )}
              </div>
            ) : (
              <Textarea
                placeholder="Type your answer here…"
                className="flex-1 min-h-[260px] resize-none text-sm"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                disabled={isSubmitting || isCompleting}
              />
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting || isCompleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCompleting ? "Evaluating all answers…" : "Saving answer…"}
                </>
              ) : isLast ? (
                <>Finish Interview <ChevronRight className="ml-1 h-4 w-4" /></>
              ) : (
                <>Submit Answer <ChevronRight className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────────────────
export default function InterviewPage() {
  const { interviewId } = useParams();
  const navigate        = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [humeToken, setHumeToken] = useState(null);

  const {
    currentIndex,
    currentQuestion,
    isLast,
    isSubmitting,
    isCompleting,
    submitAnswer,
    nextQuestion,
    completeInterview,
  } = useInterview(interview);

  useEffect(() => {
    const load = async () => {
      try {
        const [iv, token] = await Promise.all([
          interviewService.getById(interviewId),
          interviewService.getHumeToken().catch(() => null), // graceful fallback
        ]);

        if (iv.status === "completed") {
          navigate(`/interview/${interviewId}/results`, { replace: true });
          return;
        }
        setInterview(iv);
        setHumeToken(token);
      } catch (err) {
        toast.error(err.message ?? "Failed to load interview");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [interviewId, navigate]);

  const handleComplete = useCallback(() => {
    navigate(`/interview/${interviewId}/results`);
  }, [interviewId, navigate]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Interview not found.</p>
      </div>
    );
  }

  const total    = interview.questions?.length ?? 0;
  const progress = total ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  // ── Main ──
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sticky top bar */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <span className="font-medium text-sm truncate">
            {interview.resumeId?.fileName ?? "Interview"}
          </span>

          <div className="flex-1 max-w-xs space-y-1 hidden sm:block">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Question {currentIndex + 1} of {total}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          <div className="flex items-center gap-2">
            {interview.type && (
              <Badge variant="outline" className="text-xs capitalize hidden sm:inline-flex">
                {interview.type}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground sm:hidden">
              {currentIndex + 1} / {total}
            </span>
          </div>
        </div>
      </div>

      {/* Body — wrap with VoiceProvider if we have a Hume token */}
      {humeToken ? (
        <VoiceProvider
          auth={{ type: "accessToken", value: humeToken }}
          sessionSettings={{ audio: true }}
        >
          <VoiceInterviewInner
            interview={interview}
            currentIndex={currentIndex}
            currentQuestion={currentQuestion}
            isLast={isLast}
            isSubmitting={isSubmitting}
            isCompleting={isCompleting}
            submitAnswer={submitAnswer}
            nextQuestion={nextQuestion}
            completeInterview={completeInterview}
            onComplete={handleComplete}
          />
        </VoiceProvider>
      ) : (
        // Fallback: Hume token not available — text only
        <VoiceInterviewInner
          interview={interview}
          currentIndex={currentIndex}
          currentQuestion={currentQuestion}
          isLast={isLast}
          isSubmitting={isSubmitting}
          isCompleting={isCompleting}
          submitAnswer={submitAnswer}
          nextQuestion={nextQuestion}
          completeInterview={completeInterview}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}