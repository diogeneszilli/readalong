"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { alignWords, wcpm, type AlignmentResult } from "@/lib/align";
import { ReadAloudRecognizer, isSpeechSupported, speak } from "@/lib/speech";

export interface ReadAloudOutcome {
  alignment: AlignmentResult;
  elapsedMs: number;
  wcpm: number;
  transcript: string;
}

interface Props {
  text: string;
  onDone(outcome: ReadAloudOutcome): void;
  /** Lets the parent re-key the component to reset it for a new page. */
  autoFocusMic?: boolean;
}

type Status = "idle" | "listening" | "done" | "unsupported" | "denied";

export default function ReadAloud({ text, onDone }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const recRef = useRef<ReadAloudRecognizer | null>(null);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    if (!isSpeechSupported()) setStatus("unsupported");
  }, []);

  useEffect(() => {
    if (status !== "listening") return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt.current), 250);
    return () => clearInterval(id);
  }, [status]);

  const alignment = useMemo(() => alignWords(text, transcript), [text, transcript]);

  const start = useCallback(() => {
    const rec = new ReadAloudRecognizer({
      onTranscript: (full) => setTranscript(full),
      onError: (code) => {
        if (code === "not-allowed" || code === "service-not-allowed") setStatus("denied");
      },
    });
    recRef.current = rec;
    setTranscript("");
    startedAt.current = Date.now();
    setElapsed(0);
    setStatus("listening");
    rec.start();
  }, []);

  const finish = useCallback(() => {
    const rec = recRef.current;
    const finalTranscript = rec ? rec.stop() : transcript;
    const elapsedMs = Date.now() - startedAt.current;
    const finalAlignment = alignWords(text, finalTranscript);
    setTranscript(finalTranscript);
    setElapsed(elapsedMs);
    setStatus("done");
    onDone({
      alignment: finalAlignment,
      elapsedMs,
      wcpm: wcpm(finalAlignment.correct, elapsedMs),
      transcript: finalTranscript,
    });
  }, [onDone, text, transcript]);

  useEffect(() => () => { recRef.current?.stop(); }, []);

  const seconds = (elapsed / 1000).toFixed(0);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-3xl leading-relaxed font-medium tracking-wide" aria-live="polite">
        {alignment.words.map((w, i) => (
          <span key={i}>
            <button
              type="button"
              onClick={() => speak(w.norm)}
              className={[
                "rounded-md px-1 transition-colors",
                status === "idle" && "text-slate-800",
                status !== "idle" && w.status === "ok" && "bg-emerald-100 text-emerald-900",
                status !== "idle" && w.status === "close" && "bg-amber-100 text-amber-900",
                status === "done" && w.status === "missed" && "bg-rose-100 text-rose-900 underline decoration-wavy",
                status === "listening" && w.status === "missed" && "text-slate-800",
              ]
                .filter(Boolean)
                .join(" ")}
              title={w.status === "close" && w.heard ? `heard "${w.heard}"` : "tap to hear"}
            >
              {w.display}
            </button>{" "}
          </span>
        ))}
      </p>

      {status === "unsupported" && (
        <p className="rounded-xl bg-amber-50 p-4 text-amber-900">
          Your browser can&apos;t listen yet. Please open Readalong in Google Chrome on a
          computer or Android device.
        </p>
      )}
      {status === "denied" && (
        <p className="rounded-xl bg-rose-50 p-4 text-rose-900">
          The microphone is blocked. Click the lock icon in the address bar, allow the
          microphone, and try again.
        </p>
      )}

      <div className="flex items-center gap-4">
        {status === "idle" && (
          <button
            type="button"
            onClick={start}
            className="rounded-full bg-indigo-600 px-8 py-4 text-xl font-semibold text-white shadow-lg hover:bg-indigo-500 active:scale-95"
          >
            🎤 Start reading
          </button>
        )}
        {status === "listening" && (
          <>
            <button
              type="button"
              onClick={finish}
              className="rounded-full bg-emerald-600 px-8 py-4 text-xl font-semibold text-white shadow-lg hover:bg-emerald-500 active:scale-95"
            >
              ✅ I&apos;m done
            </button>
            <span className="flex items-center gap-2 text-slate-500">
              <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-rose-500" />
              Listening… {seconds}s
            </span>
          </>
        )}
        {status === "done" && (
          <span className="text-slate-500">
            {alignment.correct}/{alignment.total} words · {seconds}s
          </span>
        )}
      </div>
    </div>
  );
}
