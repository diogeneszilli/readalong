"use client";

import type { StoryPage } from "@/lib/schema";
import { speak } from "@/lib/speech";

export default function VocabCard({
  words,
  onNext,
}: {
  words: StoryPage["targetWords"];
  onNext(): void;
}) {
  return (
    <div className="animate-pop flex flex-col gap-5 rounded-3xl bg-white p-8 shadow">
      <div className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {words.length === 1 ? "Word to remember" : "Words to remember"}
      </div>
      {words.map((w) => (
        <div key={w.word} className="rounded-2xl bg-indigo-50 p-5">
          <button
            type="button"
            onClick={() => speak(w.word)}
            className="text-3xl font-extrabold text-indigo-800"
          >
            🔊 {w.word}
          </button>
          <p className="mt-2 text-lg text-slate-700">
            <button type="button" onClick={() => speak(w.kidDefinition)} className="mr-1" title="Read it to me">
              🔊
            </button>
            {w.kidDefinition}
          </p>
        </div>
      ))}
      <button
        type="button"
        onClick={onNext}
        className="self-start rounded-full bg-indigo-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-indigo-500"
      >
        Got it →
      </button>
    </div>
  );
}
