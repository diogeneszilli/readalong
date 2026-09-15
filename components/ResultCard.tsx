"use client";

import { placement } from "@/lib/leveling";
import { speak } from "@/lib/speech";
import type { ReadRecord } from "@/lib/storage";

const MESSAGES = {
  independent: { emoji: "🌟", title: "Wow, smooth reading!", sub: "That was easy for you. Next page gets a little bigger." },
  instructional: { emoji: "👍", title: "Great job!", sub: "Just right. Let's keep going at this level." },
  frustration: { emoji: "💪", title: "Nice try, that was a tough one!", sub: "The next page will be a bit easier so you can shine." },
};

export default function ResultCard({
  read,
  firstRead,
  onNext,
  onReadAgain,
}: {
  read: ReadRecord;
  /** Present when this is a re-read; used to show improvement. */
  firstRead?: ReadRecord;
  onNext(): void;
  onReadAgain(): void;
}) {
  const p = placement(read.accuracy);
  const m = MESSAGES[p];
  const gain = firstRead ? read.wcpm - firstRead.wcpm : 0;
  return (
    <div className="animate-pop relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-white p-8 shadow">
      {p === "independent" && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-around text-3xl">
          {["🎉", "⭐", "🎊", "✨", "🌟", "🎉"].map((e, i) => (
            <span key={i} className="animate-confetti" style={{ animationDelay: `${i * 120}ms` }}>
              {e}
            </span>
          ))}
        </div>
      )}
      <div className="text-6xl">{firstRead ? "🔁" : m.emoji}</div>
      <h2 className="text-3xl font-extrabold">
        {firstRead ? (gain > 0 ? `Faster by ${gain} words a minute!` : "Nice, you read it again!") : m.title}
      </h2>
      <p className="text-lg text-slate-600">
        {firstRead
          ? "Reading the same page twice is how readers get smooth. Ready to move on?"
          : m.sub}
      </p>
      <div className="flex gap-6 text-lg">
        <div>
          <div className="text-4xl font-extrabold text-indigo-700">{read.correct}/{read.total}</div>
          <div className="text-sm text-slate-500">words read right</div>
        </div>
        <div>
          <div className="text-4xl font-extrabold text-indigo-700">{read.wcpm}</div>
          <div className="text-sm text-slate-500">words per minute</div>
        </div>
      </div>
      {read.missedWords.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            Tap a word to hear it
          </div>
          <div className="flex flex-wrap gap-2">
            {read.missedWords.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => speak(w)}
                className="rounded-full bg-rose-100 px-4 py-2 text-lg font-bold text-rose-900 hover:bg-rose-200"
              >
                🔊 {w}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-indigo-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-indigo-500"
        >
          Next →
        </button>
        <button
          type="button"
          onClick={onReadAgain}
          className="rounded-full bg-white px-8 py-4 text-xl font-bold text-indigo-700 ring-2 ring-indigo-200 hover:bg-indigo-50"
        >
          🔁 Read it again
        </button>
      </div>
    </div>
  );
}
