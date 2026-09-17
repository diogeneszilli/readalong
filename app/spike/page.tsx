"use client";

import { useState } from "react";
import ReadAloud, { type ReadAloudOutcome } from "@/components/ReadAloud";
import { placement } from "@/lib/leveling";

const SAMPLES: Record<number, string> = {
  1: "Sam has a red hat. The hat is big. Sam can run. Run, Sam, run!",
  3: "Pip the fox found a shiny key under the old oak tree. \"Who lost this?\" she said. A little bird flapped down and chirped, \"Follow me!\"",
  5: "Max tightened the straps on his backpack and peered into the misty cave. Somewhere inside, a strange humming echoed off the walls. He took a deep breath and stepped forward.",
};

export default function SpikePage() {
  const [level, setLevel] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<ReadAloudOutcome | null>(null);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
      <h1 className="text-2xl font-bold">Speech spike</h1>
      <div className="flex gap-2">
        {Object.keys(SAMPLES).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => {
              setLevel(Number(l));
              setAttempt((a) => a + 1);
              setOutcome(null);
            }}
            className={`rounded-lg border px-4 py-2 ${level === Number(l) ? "bg-indigo-600 text-white" : "bg-white"}`}
          >
            Level {l}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setAttempt((a) => a + 1);
            setOutcome(null);
          }}
          className="rounded-lg border px-4 py-2"
        >
          Reset
        </button>
      </div>

      <p className="text-sm text-slate-500">
        The panel below shows the microphone level (should move when you talk) and the live
        transcript the recognizer produces. If the level moves but nothing is heard, speech
        recognition is the problem; if the level stays flat, the microphone is.
      </p>
      <ReadAloud key={`${level}-${attempt}`} text={SAMPLES[level]} onDone={setOutcome} debug />

      {outcome && (
        <section className="rounded-2xl bg-slate-50 p-6">
          <h2 className="mb-2 text-lg font-semibold">Result</h2>
          <ul className="space-y-1 text-slate-700">
            <li>Accuracy: {(outcome.alignment.accuracy * 100).toFixed(0)}% ({placement(outcome.alignment.accuracy)})</li>
            <li>WCPM: {outcome.wcpm}</li>
            <li>Missed: {outcome.alignment.missedWords.join(", ") || "none"}</li>
            <li className="text-sm text-slate-500">Heard: “{outcome.transcript}”</li>
          </ul>
        </section>
      )}
    </main>
  );
}
