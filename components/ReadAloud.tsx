"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { alignWords, wcpm, type AlignmentResult } from "@/lib/align";
import { ReadAloudRecognizer, isSpeechSupported, speak } from "@/lib/speech";
import { MicLevelMeter } from "@/lib/mic-level";

export interface ReadAloudOutcome {
  alignment: AlignmentResult;
  elapsedMs: number;
  wcpm: number;
  transcript: string;
}

interface Props {
  text: string;
  onDone(outcome: ReadAloudOutcome): void;
  /** Show the live transcript and a microphone level meter (diagnostics). */
  debug?: boolean;
}

type Status = "idle" | "listening" | "typing" | "done" | "unsupported" | "denied";

export default function ReadAloud({ text, onDone, debug = false }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [typed, setTyped] = useState("");
  const [interim, setInterim] = useState("");
  const [level, setLevel] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const meterRef = useRef<MicLevelMeter | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const recRef = useRef<ReadAloudRecognizer | null>(null);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    if (status !== "listening" && status !== "typing") return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt.current), 250);
    return () => clearInterval(id);
  }, [status]);

  const alignment = useMemo(
    () => alignWords(text, status === "typing" ? typed : transcript),
    [text, transcript, typed, status],
  );

  const start = useCallback(() => {
    if (!isSpeechSupported()) {
      setStatus("unsupported");
      return;
    }
    const rec = new ReadAloudRecognizer({
      onTranscript: (full, partial) => {
        setTranscript(full);
        setInterim(partial);
      },
      onError: (code) => {
        if (code === "not-allowed" || code === "service-not-allowed") setStatus("denied");
        else setMicError(code);
      },
    });
    recRef.current = rec;
    setTranscript("");
    setInterim("");
    setMicError(null);
    startedAt.current = Date.now();
    setElapsed(0);
    setStatus("listening");
    rec.start();
    if (debug) {
      const meter = new MicLevelMeter(setLevel);
      meterRef.current = meter;
      meter.start().catch((e: unknown) => setMicError(e instanceof Error ? e.message : String(e)));
    }
  }, [debug]);

  const startTyping = useCallback(() => {
    setTranscript("");
    setTyped("");
    startedAt.current = Date.now();
    setElapsed(0);
    setStatus("typing");
  }, []);

  const finish = useCallback(() => {
    meterRef.current?.stop();
    meterRef.current = null;
    const rec = recRef.current;
    const finalTranscript = status === "typing" ? typed : rec ? rec.stop() : transcript;
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
  }, [onDone, text, transcript, typed, status]);

  useEffect(
    () => () => {
      recRef.current?.stop();
      meterRef.current?.stop();
    },
    [],
  );

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
          computer or Android device — or a grown-up can type what you read below.
        </p>
      )}
      {status === "typing" && (
        <textarea
          autoFocus
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Type the words as they are read aloud…"
          className="min-h-24 rounded-2xl border-2 border-indigo-200 p-4 text-xl focus:border-indigo-500 focus:outline-none"
          data-testid="typed-transcript"
        />
      )}
      {status === "denied" && (
        <p className="rounded-xl bg-rose-50 p-4 text-rose-900">
          The microphone is blocked. Click the lock icon in the address bar, allow the
          microphone, and try again.
        </p>
      )}

      <div className="flex items-center gap-4">
        {(status === "idle" || status === "unsupported") && (
          <button
            type="button"
            onClick={start}
            className="rounded-full bg-indigo-600 px-8 py-4 text-xl font-semibold text-white shadow-lg hover:bg-indigo-500 active:scale-95"
          >
            🎤 Start reading
          </button>
        )}
        {(status === "idle" || status === "unsupported") && (
          <button
            type="button"
            onClick={startTyping}
            className="text-sm font-bold text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
            title="For browsers without speech recognition"
          >
            no microphone? type it
          </button>
        )}
        {(status === "listening" || status === "typing") && (
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
              {status === "typing" ? "Typing" : "Listening"}… {seconds}s
            </span>
          </>
        )}
        {status === "done" && (
          <span className="text-slate-500">
            {alignment.correct}/{alignment.total} words · {seconds}s
          </span>
        )}
      </div>

      {debug && status !== "idle" && status !== "typing" && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm" data-testid="mic-debug">
          <div className="mb-2 flex items-center gap-3">
            <span className="w-24 shrink-0 text-slate-500">mic level</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-[width] duration-75 ${level > 0.6 ? "bg-rose-500" : level > 0.15 ? "bg-emerald-500" : "bg-amber-400"}`}
                style={{ width: `${Math.round(level * 100)}%` }}
              />
            </div>
            <span className="w-10 text-right text-slate-500">{Math.round(level * 100)}</span>
          </div>
          <div className="flex gap-3">
            <span className="w-24 shrink-0 text-slate-500">hearing</span>
            <span className="min-h-5 flex-1 whitespace-pre-wrap text-slate-800">
              {transcript || <span className="text-slate-400">(nothing yet — speak now)</span>}
              {status === "listening" && interim && <span className="text-indigo-500"> {interim}</span>}
            </span>
          </div>
          <div className="mt-2 flex gap-3">
            <span className="w-24 shrink-0 text-slate-500">recognizer</span>
            <span className="text-slate-800">
              {status === "listening" ? "listening (Chrome Web Speech, en-US)" : status}
              {micError && <span className="text-rose-600"> · error: {micError}</span>}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
