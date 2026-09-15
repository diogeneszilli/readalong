"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WORLDS } from "@/lib/schema";
import { LEVELS, placement } from "@/lib/leveling";
import { getSession, type Session } from "@/lib/storage";
import { speak } from "@/lib/speech";

const PLACEMENT_STYLE = {
  independent: "bg-emerald-100 text-emerald-900",
  instructional: "bg-amber-100 text-amber-900",
  frustration: "bg-rose-100 text-rose-900",
};

export default function ReportView({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(getSession(sessionId));
  }, [sessionId]);

  if (session === undefined) return null;
  if (!session) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <p>We couldn&apos;t find that story on this device.</p>
        <Link href="/" className="font-bold text-indigo-600">
          Home
        </Link>
      </main>
    );
  }

  const world = WORLDS.find((w) => w.id === session.world)!;
  const readPages = session.pages.filter((p) => p.read);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const avgAccuracy = avg(readPages.map((p) => p.read!.accuracy));
  const avgWcpm = Math.round(avg(readPages.map((p) => p.read!.wcpm)));
  const norm = LEVELS[session.startLevel].wcpmNorm;
  const answered = session.pages.filter((p) => p.questionCorrect !== undefined);
  const questionsRight = answered.filter((p) => p.questionCorrect).length;
  const rereadCount = session.pages.reduce((n, p) => n + (p.rereads?.length ?? 0), 0);
  const practiceWords = Array.from(new Set(readPages.flatMap((p) => p.read!.missedWords)));
  const levelPath = session.pages.map((p) => p.level);
  const totalWords = readPages.reduce((n, p) => n + p.read!.total, 0);
  const totalMinutes = readPages.reduce((n, p) => n + p.read!.elapsedMs, 0) / 60000;
  const maxWcpm = Math.max(norm, ...readPages.map((p) => p.read!.wcpm), 1);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-lg font-extrabold text-indigo-700">
          📖 Readalong
        </Link>
        {!session.finished && (
          <Link href={`/read/${session.id}`} className="font-bold text-indigo-600">
            Back to the story →
          </Link>
        )}
      </header>

      <section>
        <div className="text-sm font-bold uppercase tracking-wide text-slate-500">Reading report</div>
        <h1 className="text-3xl font-extrabold">
          {world.emoji} {session.pages[0]?.page.title ?? world.name}
        </h1>
        <p className="text-slate-500">
          {new Date(session.createdAt).toLocaleString()} · started at {LEVELS[session.startLevel].label} (
          {LEVELS[session.startLevel].grade})
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-4">
        <Stat label="Words read aloud" value={String(totalWords)} sub={`${totalMinutes.toFixed(1)} min`} />
        <Stat label="Accuracy" value={`${Math.round(avgAccuracy * 100)}%`} sub={placement(avgAccuracy)} />
        <Stat label="Fluency" value={`${avgWcpm}`} sub={`WCPM · grade norm ${norm}`} />
        <Stat
          label="Comprehension"
          value={`${questionsRight}/${answered.length}`}
          sub={rereadCount > 0 ? `questions right · ${rereadCount} re-read${rereadCount > 1 ? "s" : ""}` : "questions right"}
        />
      </section>

      <section className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-extrabold">Fluency by page</h2>
        <p className="mb-4 text-sm text-slate-500">
          Words correct per minute (WCPM). The dashed line is the 50th-percentile spring norm for the
          starting grade (Hasbrouck &amp; Tindal, 2017).
        </p>
        <div className="relative flex h-48 items-end gap-3 border-b border-slate-200 pb-1">
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-indigo-300"
            style={{ bottom: `${(norm / maxWcpm) * 100}%` }}
          >
            <span className="absolute -top-5 right-0 text-xs font-bold text-indigo-400">norm {norm}</span>
          </div>
          {readPages.map((p) => {
            const pl = placement(p.read!.accuracy);
            return (
              <div key={p.pageNumber} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-sm font-bold">{p.read!.wcpm}</span>
                <div
                  className={`w-full rounded-t-xl ${PLACEMENT_STYLE[pl]}`}
                  style={{ height: `${(p.read!.wcpm / maxWcpm) * 100}%`, minHeight: 6 }}
                  title={`${Math.round(p.read!.accuracy * 100)}% accuracy · ${pl}`}
                />
                <span className="text-xs text-slate-500">p{p.pageNumber}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-2 text-xl font-extrabold">Level path</h2>
        <p className="mb-4 text-sm text-slate-500">
          After each page the text moved up, held, or eased off using the independent / instructional /
          frustration thresholds (95% / 90% accuracy).
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {levelPath.map((l, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-100 px-3 py-1 font-bold text-indigo-800">
                L{l}
              </span>
              {i < levelPath.length - 1 && <span className="text-slate-400">→</span>}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-2 text-xl font-extrabold">Page by page</h2>
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2">Page</th>
              <th>Level</th>
              <th>Accuracy</th>
              <th>WCPM</th>
              <th>Question</th>
              <th>Choice</th>
            </tr>
          </thead>
          <tbody>
            {session.pages.map((p) => (
              <tr key={p.pageNumber} className="border-t border-slate-100">
                <td className="py-2 font-bold">{p.pageNumber}</td>
                <td>L{p.level}</td>
                <td>
                  {p.read ? (
                    <span className={`rounded-full px-2 py-0.5 ${PLACEMENT_STYLE[placement(p.read.accuracy)]}`}>
                      {Math.round(p.read.accuracy * 100)}%
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {p.read?.wcpm ?? "—"}
                  {p.rereads?.length ? (
                    <span className="ml-1 text-emerald-700" title="after re-reading">
                      → {p.rereads.at(-1)!.wcpm}
                    </span>
                  ) : null}
                </td>
                <td>{p.questionCorrect === undefined ? "—" : p.questionCorrect ? "✅" : "❌"}</td>
                <td className="text-slate-500">{p.choiceTaken ?? (p.page.isEnding ? "The End" : "—")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-2 text-xl font-extrabold">Words to practise</h2>
        {practiceWords.length === 0 ? (
          <p className="text-slate-500">No missed words. 🎉</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {practiceWords.map((w) => (
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
        )}
        <h3 className="mt-6 mb-2 font-extrabold">New words learned</h3>
        <div className="flex flex-wrap gap-2">
          {session.pages.flatMap((p) => p.page.targetWords).map((w) => (
            <button
              key={w.word}
              type="button"
              onClick={() => speak(`${w.word}. ${w.kidDefinition}`)}
              className="rounded-full bg-indigo-100 px-4 py-2 font-bold text-indigo-900 hover:bg-indigo-200"
              title={w.kidDefinition}
            >
              🔊 {w.word}
            </button>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-slate-400">
        This report lives only in this browser. Nothing is sent to a server.
      </p>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-extrabold text-indigo-700">{value}</div>
      <div className="text-sm text-slate-500">{sub}</div>
    </div>
  );
}
