import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/utils/helpers";

/**
 * useSpeak — Web Speech API hook
 * Speaks text aloud using the browser's built-in TTS engine.
 * No API key needed — works in all modern browsers.
 */
export const useSpeak = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const speak = (text, onEnd) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Pick a good voice — prefer a natural English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
    ) ?? voices.find((v) => v.lang.startsWith("en")) ?? voices[0];

    if (preferred) utterance.voice = preferred;
    utterance.rate   = 0.92;   // slightly slower — interviewer pacing
    utterance.pitch  = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => { setIsSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setIsSpeaking(false); onEnd?.(); };

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  // Voices load async in Chrome — wait for them
  useEffect(() => {
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
  }, []);

  return { speak, stop, isSpeaking };
};

/**
 * InterviewerAvatar
 * Shows a pulsing avatar that speaks the current question aloud.
 * Props:
 *   question      — { text, difficulty, category }
 *   questionIndex — 0-based current index
 *   total         — total questions count
 *   onSpeakEnd    — called when the question finishes speaking
 */
export default function InterviewerAvatar({ question, questionIndex, total, onSpeakEnd }) {
  const { speak, stop, isSpeaking } = useSpeak();
  const [hasSpoken, setHasSpoken]   = useState(false);
  const lastTextRef = useRef("");

  // Auto-speak whenever the question changes
  useEffect(() => {
    if (!question?.text) return;
    if (question.text === lastTextRef.current) return; // already spoken this one
    lastTextRef.current = question.text;
    setHasSpoken(false);

    // Small delay so the UI settles before speaking
    const timer = setTimeout(() => {
      speak(question.text, () => {
        setHasSpoken(true);
        onSpeakEnd?.();
      });
    }, 600);

    return () => { clearTimeout(timer); stop(); };
  }, [question?.text]);

  const handleReplay = () => {
    if (!question?.text) return;
    setHasSpoken(false);
    speak(question.text, () => { setHasSpoken(true); onSpeakEnd?.(); });
  };

  return (
    <div className="flex flex-col items-center gap-5 h-full justify-center px-4">
      {/* Avatar circle with speaking ring */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring — shows while speaking */}
        {isSpeaking && (
          <>
            <span className="absolute inline-flex h-36 w-36 rounded-full bg-blue-100 opacity-60 animate-ping" />
            <span className="absolute inline-flex h-32 w-32 rounded-full bg-blue-200 opacity-40 animate-ping [animation-delay:200ms]" />
          </>
        )}

        {/* Avatar */}
        <div
          className={cn(
            "relative w-28 h-28 rounded-full flex items-center justify-center text-3xl font-semibold transition-all duration-300",
            isSpeaking
              ? "bg-blue-100 ring-4 ring-blue-400 text-blue-800"
              : "bg-muted ring-4 ring-muted text-muted-foreground"
          )}
        >
          AI

          {/* Speaking wave bars inside avatar bottom */}
          {isSpeaking && (
            <div className="absolute bottom-2 flex items-end gap-0.5">
              {[4, 8, 12, 8, 4].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-blue-500"
                  style={{
                    height: `${h}px`,
                    animation: `waveBar 0.6s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Name + title */}
      <div className="text-center">
        <p className="font-medium text-sm">Alex — AI Interviewer</p>
        <p className="text-xs text-muted-foreground">Senior Technical Recruiter</p>
      </div>

      {/* Question display below avatar */}
      <div className="w-full rounded-xl border bg-muted/40 p-4 space-y-3">
        {/* Status chip */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
              isSpeaking
                ? "bg-blue-100 text-blue-800"
                : hasSpoken
                ? "bg-green-100 text-green-800"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isSpeaking ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
                Speaking…
              </>
            ) : hasSpoken ? (
              "✓ Question asked"
            ) : (
              "Preparing…"
            )}
          </span>

          <span className="text-xs text-muted-foreground">
            {questionIndex + 1} / {total}
          </span>
        </div>

        {/* Question text */}
        <p className="text-sm leading-relaxed font-medium">
          {question?.text ?? "Loading question…"}
        </p>

        {/* Badges row */}
        {question && (
          <div className="flex items-center gap-2 flex-wrap">
            {question.difficulty && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  question.difficulty === "easy"   && "bg-green-100 text-green-800",
                  question.difficulty === "medium" && "bg-yellow-100 text-yellow-800",
                  question.difficulty === "hard"   && "bg-red-100 text-red-800"
                )}
              >
                {question.difficulty}
              </span>
            )}
            {question.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                {question.category}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Replay button */}
      <button
        onClick={handleReplay}
        disabled={isSpeaking}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RefreshCw className="h-3 w-3" />
        Replay question
      </button>

      {/* CSS for wave bars */}
      <style>{`
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
          50%       { transform: scaleY(1.5); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
