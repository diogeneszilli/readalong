import { LEVELS } from "@/lib/leveling";
import type { Level } from "@/lib/schema";

/** Page progress + current level, shown above every card in the story loop. */
export default function ProgressDots({
  page,
  total,
  level,
}: {
  page: number;
  total: number;
  level: Level;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2" aria-label={`Page ${page} of ${total}`}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const state = n < page ? "done" : n === page ? "current" : "todo";
          return (
            <span
              key={n}
              className={[
                "h-3 rounded-full transition-all",
                state === "done" && "w-3 bg-emerald-400",
                state === "current" && "w-8 bg-indigo-500",
                state === "todo" && "w-3 bg-slate-200",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          );
        })}
        <span className="ml-2 text-sm font-bold text-slate-500">
          Page {page} of {total}
        </span>
      </div>
      <span
        className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-extrabold text-indigo-800"
        title={LEVELS[level].grade}
      >
        {LEVELS[level].label}
      </span>
    </div>
  );
}
