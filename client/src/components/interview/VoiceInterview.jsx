import { useEffect, useRef, useState, useCallback } from "react";
import { VoiceProvider, useVoice } from "@humeai/voice-react";
import { Mic, MicOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/helpers";
import { toast } from "sonner";

// ─── Inner component — lives inside VoiceProvider ────────────────────────────
function VoiceControls({ accessToken, onTranscript, onEmotions, isSubmitting, onFallback }) {
  const { connect, disconnect, status, messages } = useVoice();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected]   = useState(false);
  const [error, setError]               = useState("");
  const [localTranscript, setLocalTranscript] = useState("");
  const processedIds = useRef(new Set());

  // Pick up transcript + emotions from Hume messages
  useEffect(() => {
    if (!messages?.length) return;
    const latest = messages[messages.length - 1];
    if (!latest) return;

    const id = `${latest.type}-${latest.receivedAt}-${latest.message?.content}`;
    if (processedIds.current.has(id)) return;
    processedIds.current.add(id);

    if (latest.type === "user_message" && latest.message?.content) {
      const t = latest.message.content;
      setLocalTranscript((prev) => prev ? `${prev} ${t}` : t);
      onTranscript(t);
      const emotions =
        latest?.models?.prosody?.grouped_predictions?.[0]
          ?.predictions?.[0]?.emotions ?? [];
      onEmotions(emotions);
    }
  }, [messages, onTranscript, onEmotions]);

  // Sync status
  useEffect(() => {
    if (status?.value === "connected") {
      setIsConnected(true);
      setIsConnecting(false);
    }
    if (status?.value === "disconnected" || status?.value === "error") {
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, [status]);

  const handleConnect = async () => {
    setError("");
    setIsConnecting(true);

    // Step 1 — request mic permission explicitly first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      setIsConnecting(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Microphone blocked. Click the mic icon in your browser address bar and allow access, then try again.");
      } else if (err.name === "NotFoundError") {
        setError("No microphone detected. Plug in a mic or use text mode.");
      } else {
        setError(`Mic error: ${err.message}`);
      }
      return;
    }

    // Step 2 — connect Hume with audioConstraints in connect options
    try {
      await connect({
        auth: { type: "accessToken", value: accessToken },
        audioConstraints: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      toast.success("Voice connected — speak your answer");
    } catch (err) {
      console.error("Hume connect error:", err);
      setError(`Voice connection failed: ${err?.message ?? "Unknown error"}. Use text mode instead.`);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsConnected(false);
    setLocalTranscript("");
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Mic ring */}
      <div
        onClick={isConnected ? handleDisconnect : (!isConnecting ? handleConnect : undefined)}
        className={cn(
          "relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 cursor-pointer select-none",
          isConnected ? "bg-red-50 ring-4 ring-red-300"
          : error      ? "bg-destructive/10 ring-4 ring-destructive/20 cursor-default"
          : "bg-muted ring-4 ring-muted hover:ring-primary/30"
        )}
      >
        {isConnecting ? (
          <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
        ) : error ? (
          <AlertCircle className="h-10 w-10 text-destructive" />
        ) : isConnected ? (
          <Mic className="h-10 w-10 text-red-500" />
        ) : (
          <MicOff className="h-10 w-10 text-muted-foreground" />
        )}
        {isConnected && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-40 animate-ping" />
        )}
      </div>

      {/* Status */}
      <p className="text-sm text-muted-foreground text-center">
        {isConnecting  ? "Requesting mic access…"
         : isConnected ? "Listening — speak your answer clearly"
         : error       ? ""
         : "Click the mic or button to start"}
      </p>

      {/* Error box */}
      {error && (
        <div className="w-full rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center leading-relaxed">
          {error}
        </div>
      )}

      {/* Live transcript */}
      {localTranscript && (
        <div className="w-full rounded-md bg-muted p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Captured answer
          </p>
          <p className="text-sm leading-relaxed">{localTranscript}</p>
        </div>
      )}

      {/* Buttons */}
      {isConnected ? (
        <Button type="button" variant="destructive" onClick={handleDisconnect} disabled={isSubmitting} className="w-44">
          Stop Recording
        </Button>
      ) : (
        <Button type="button" onClick={handleConnect} disabled={isConnecting || isSubmitting} className="w-44">
          {isConnecting
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connecting…</>
            : "Start Speaking"}
        </Button>
      )}

      {/* Fallback link — always visible */}
      <button
        type="button"
        onClick={onFallback}
        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
      >
        Switch to text mode instead →
      </button>
    </div>
  );
}

// ─── Public wrapper ───────────────────────────────────────────────────────────
export default function VoiceInterview({ accessToken, onTranscript, onEmotions, isSubmitting, onFallback }) {
  if (!accessToken) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading voice session…
      </div>
    );
  }

  return (
    <VoiceProvider>
      <VoiceControls
        accessToken={accessToken}
        onTranscript={onTranscript}
        onEmotions={onEmotions}
        isSubmitting={isSubmitting}
        onFallback={onFallback}
      />
    </VoiceProvider>
  );
}