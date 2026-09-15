"use client";

import type { StoryPage } from "@/lib/schema";
import { speak } from "@/lib/speech";

export default function ChoiceButtons({
  choices,
  onChoose,
}: {
  choices: StoryPage["choices"];
  onChoose(label: string): void;
}) {
  return (
    <div className="animate-pop flex flex-col gap-5 rounded-3xl bg-white p-8 shadow">
      <h2 className="text-2xl font-extrabold">What happens next?</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {choices.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => onChoose(c.label)}
            className="rounded-3xl border-4 border-amber-300 bg-amber-100 px-6 py-6 text-2xl font-extrabold text-amber-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-200 active:scale-95"
          >
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                speak(c.label);
              }}
              className="mr-2"
            >
              🔊
            </span>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
