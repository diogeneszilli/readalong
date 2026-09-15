"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WORLDS, type Level, type WorldId } from "@/lib/schema";
import { LEVELS } from "@/lib/leveling";
import { createSession, listSessions, type Session } from "@/lib/storage";

const GRADES: { label: string; level: Level }[] = [
  { label: "Kindergarten", level: 1 },
  { label: "Grade 1", level: 2 },
  { label: "Grade 2", level: 4 },
  { label: "Grade 3", level: 5 },
];

export default function Home() {
  const router = useRouter();
  const [world, setWorld] = useState<WorldId>("forest");
  const [level, setLevel] = useState<Level>(2);
  const [recent, setRecent] = useState<Session[]>([]);

  useEffect(() => {
    // localStorage is only available after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(listSessions().slice(0, 5));
  }, []);

  function start() {
    const s = createSession(world, level);
    router.push(`/read/${s.id}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-12">
      <header className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-indigo-700">📖 Readalong</h1>
        <p className="mt-3 text-lg text-slate-600">
          Pick a world. Read the story out loud. The story listens and grows with you.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Choose a world
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {WORLDS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setWorld(w.id)}
              className={[
                "rounded-3xl border-4 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5",
                world === w.id ? "border-indigo-500" : "border-transparent",
              ].join(" ")}
            >
              <div className="text-5xl">{w.emoji}</div>
              <div className="mt-2 text-xl font-extrabold">{w.name}</div>
              <div className="mt-1 text-sm text-slate-500">{w.blurb}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Reading level to start
        </h2>
        <div className="flex flex-wrap gap-3">
          {GRADES.map((g) => (
            <button
              key={g.level}
              type="button"
              onClick={() => setLevel(g.level)}
              className={[
                "rounded-full px-5 py-3 text-lg font-bold transition",
                level === g.level
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white text-slate-700 hover:bg-indigo-50",
              ].join(" ")}
            >
              {g.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Don&apos;t worry about getting this exactly right — the story adjusts after every page.
          Starting text: {LEVELS[level].prose.split(".")[0]}.
        </p>
      </section>

      <button
        type="button"
        onClick={start}
        className="rounded-full bg-emerald-500 px-10 py-5 text-2xl font-extrabold text-white shadow-lg transition hover:bg-emerald-400 active:scale-95"
      >
        Start the story →
      </button>

      {recent.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            Recent stories
          </h2>
          <ul className="divide-y divide-amber-200 rounded-2xl bg-white">
            {recent.map((s) => {
              const w = WORLDS.find((x) => x.id === s.world)!;
              const title = s.pages[0]?.page.title ?? w.name;
              return (
                <li key={s.id} className="flex items-center justify-between px-5 py-3">
                  <span>
                    {w.emoji} <span className="font-bold">{title}</span>
                    <span className="ml-2 text-sm text-slate-500">
                      {new Date(s.createdAt).toLocaleDateString()} · {s.pages.length} pages
                    </span>
                  </span>
                  <span className="flex gap-3 text-sm font-bold">
                    {!s.finished && (
                      <Link href={`/read/${s.id}`} className="text-indigo-600">
                        Continue
                      </Link>
                    )}
                    <Link href={`/report/${s.id}`} className="text-slate-600">
                      Report
                    </Link>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <footer className="text-center text-xs text-slate-400">
        Works best in Google Chrome. Nothing you read is stored on a server.
      </footer>
    </main>
  );
}
