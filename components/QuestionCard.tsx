"use client";

import { useState } from "react";
import type { StoryPage } from "@/lib/schema";
import { speak } from "@/lib/speech";

export default function QuestionCard({
  question,
  onAnswered,
}: {
  question: StoryPage["question"];
  onAnswered(correct: boolean): void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === question.answerIndex;

  return (
    <div className="animate-pop flex flex-col gap-5 rounded-3xl bg-white p-8 shadow">
      <div className="text-sm font-bold uppercase tracking-wide text-slate-500">Quick question</div>
      <h2 className="text-2xl font-extrabold">
        <button type="button" onClick={() => speak(question.prompt)} className="mr-2" title="Read it to me">
          🔊
        </button>
        {question.prompt}
      </h2>
      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => {
          const isAnswer = i === question.answerIndex;
          const isPicked = i === picked;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => {
                setPicked(i);
                speak(opt);
              }}
              className={[
                "rounded-2xl border-2 px-5 py-4 text-left text-xl font-bold transition",
                !answered && "border-slate-200 bg-slate-50 hover:border-indigo-400",
                answered && isAnswer && "border-emerald-500 bg-emerald-50 text-emerald-900",
                answered && isPicked && !isAnswer && "border-rose-400 bg-rose-50 text-rose-900",
                answered && !isPicked && !isAnswer && "border-slate-100 text-slate-400",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">
            {correct ? "🎉 That's right!" : "Good thinking — the green one is the answer."}
          </p>
          <button
            type="button"
            onClick={() => onAnswered(correct)}
            className="rounded-full bg-indigo-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-indigo-500"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
