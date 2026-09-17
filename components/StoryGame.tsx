"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReadAloud, { type ReadAloudOutcome } from "@/components/ReadAloud";
import ResultCard from "@/components/ResultCard";
import QuestionCard from "@/components/QuestionCard";
import VocabCard from "@/components/VocabCard";
import ChoiceButtons from "@/components/ChoiceButtons";
import ProgressDots from "@/components/ProgressDots";
import SceneArt from "@/components/SceneArt";
import { WORLDS, type StoryPage } from "@/lib/schema";
import { nextLevel } from "@/lib/leveling";
import { getSession, saveSession, type PageRecord, type Session } from "@/lib/storage";
import { speak } from "@/lib/speech";

type Phase = "loading" | "reading" | "result" | "question" | "vocab" | "choice" | "ending" | "error";

const LOADING_LINES = [
  "The owl is writing the next page…",
  "Sharpening the pencils…",
  "Sprinkling in a new word…",
  "Almost ready…",
];

export default function StoryGame({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadingLine, setLoadingLine] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [retryIn, setRetryIn] = useState<number | null>(null);
  const fetching = useRef(false);

  const current: PageRecord | undefined = session?.pages[session.pages.length - 1];
  const world = session ? WORLDS.find((w) => w.id === session.world)! : null;

  /** Clone → mutate the clone → save → set state. Keeps React state immutable. */
  const update = useCallback((s: Session, fn: (draft: Session) => void): Session => {
    const draft = structuredClone(s);
    fn(draft);
    saveSession(draft);
    setSession(draft);
    return draft;
  }, []);

  const fetchNextPage = useCallback(
    async (s: Session) => {
      if (fetching.current) return;
      fetching.current = true;
      setPhase("loading");
      setError(null);
      const last = s.pages[s.pages.length - 1];
      const lastRead = last?.read;
      const body = {
        world: s.world,
        level: s.level,
        pageNumber: s.pages.length + 1,
        totalPages: s.totalPages,
        history: s.pages.map((p) => ({ text: p.page.text, choiceTaken: p.choiceTaken })),
        lastResult: lastRead
          ? { accuracy: lastRead.accuracy, wcpm: lastRead.wcpm, missedWords: lastRead.missedWords }
          : undefined,
      };
      try {
        const res = await fetch("/api/story/next", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as { page?: StoryPage; error?: string };
        if (!res.ok || !data.page) throw new Error(data.error ?? `HTTP ${res.status}`);
        update(s, (d) => {
          d.pages.push({ pageNumber: d.pages.length + 1, level: d.level, page: data.page! });
        });
        setAttempt(0);
        setPhase("reading");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Something went wrong";
        setError(msg);
        // Free-tier quota / demand errors clear themselves; retry automatically.
        setRetryIn(/minute|cooling|rate-limited|high demand/i.test(msg) ? 45 : null);
        setPhase("error");
      } finally {
        fetching.current = false;
      }
    },
    [update],
  );

  // Load the session once on mount; resume where the child left off.
  useEffect(() => {
    const s = getSession(sessionId);
    if (!s) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("We couldn't find that story. Start a new one from the home page.");
      setPhase("error");
      return;
    }
    setSession(s);
    const last = s.pages[s.pages.length - 1];
    if (!last) {
      void fetchNextPage(s);
    } else if (s.finished) {
      setPhase("ending");
    } else if (!last.read) {
      setPhase("reading");
    } else if (last.questionCorrect === undefined) {
      setPhase("question");
    } else if (last.page.isEnding) {
      setPhase("ending");
    } else if (!last.choiceTaken) {
      setPhase("choice");
    } else {
      void fetchNextPage(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    if (phase !== "error" || retryIn === null || !session) return;
    const id = setTimeout(() => {
      if (retryIn <= 1) {
        setRetryIn(null);
        void fetchNextPage(session);
      } else {
        setRetryIn(retryIn - 1);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [phase, retryIn, session, fetchNextPage]);

  useEffect(() => {
    if (phase !== "loading") return;
    const id = setInterval(() => setLoadingLine((i) => (i + 1) % LOADING_LINES.length), 1800);
    return () => clearInterval(id);
  }, [phase]);

  const onReadDone = useCallback(
    (o: ReadAloudOutcome) => {
      if (!session || !current) return;
      const record = {
        accuracy: o.alignment.accuracy,
        wcpm: o.wcpm,
        correct: o.alignment.correct,
        total: o.alignment.total,
        missedWords: o.alignment.missedWords,
        elapsedMs: o.elapsedMs,
      };
      update(session, (d) => {
        const page = d.pages[d.pages.length - 1];
        if (page.read) (page.rereads ??= []).push(record);
        else page.read = record;
      });
      setPhase("result");
    },
    [session, current, update],
  );

  const onAnswered = useCallback(
    (correct: boolean) => {
      if (!session || !current) return;
      update(session, (d) => {
        d.pages[d.pages.length - 1].questionCorrect = correct;
      });
      setPhase("vocab");
    },
    [session, current, update],
  );

  const onVocabDone = useCallback(() => {
    if (!session || !current) return;
    if (current.page.isEnding) {
      update(session, (d) => {
        d.finished = true;
      });
      setPhase("ending");
    } else {
      setPhase("choice");
    }
  }, [session, current, update]);

  const onChoose = useCallback(
    (label: string) => {
      if (!session || !current) return;
      const next = update(session, (d) => {
        d.pages[d.pages.length - 1].choiceTaken = label;
        d.level = nextLevel(d.level, current.read);
      });
      void fetchNextPage(next);
    },
    [session, current, update, fetchNextPage],
  );

  if (phase === "error") {
    return (
      <Shell world={world} session={session}>
        <div className="rounded-3xl bg-white p-8 shadow">
          <h2 className="text-2xl font-extrabold">{retryIn !== null ? "The owl needs a breather…" : "Oops."}</h2>
          <p className="mt-2 text-slate-600">{error}</p>
          {retryIn !== null && (
            <p className="mt-2 font-bold text-indigo-700">Trying again in {retryIn}s…</p>
          )}
          <div className="mt-6 flex gap-3">
            {session && (
              <button
                type="button"
                onClick={() => {
                  setRetryIn(null);
                  void fetchNextPage(session);
                }}
                className="rounded-full bg-indigo-600 px-6 py-3 font-bold text-white"
              >
                Try again now
              </button>
            )}
            <Link href="/" className="rounded-full bg-slate-200 px-6 py-3 font-bold">
              Home
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  if (!session || !world) return null;

  return (
    <Shell world={world} session={session}>
      {phase === "loading" && (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-12 text-center shadow">
          <div className="animate-bounce text-6xl">{world.emoji}</div>
          <p className="text-xl font-bold text-slate-600">{LOADING_LINES[loadingLine]}</p>
        </div>
      )}

      {current && phase === "reading" && (
        <div className="flex flex-col gap-6 overflow-hidden rounded-3xl bg-white shadow">
          <SceneArt world={session.world} scene={current.page.scene} className="aspect-[5/2]" />
          <div className="flex flex-col gap-6 px-8 pb-8">
          <ProgressDots page={current.pageNumber} total={session.totalPages} level={current.level} />
          <h2 className="text-2xl font-extrabold text-indigo-700">{current.page.title}</h2>
          <p className="text-slate-500">
            Read this page out loud. Tap any word to hear it.{" "}
            <button type="button" onClick={() => speak(current.page.text, 0.8)} className="font-bold text-indigo-600">
              🔊 Read it to me first
            </button>
          </p>
          {attempt > 0 && (
            <p className="rounded-xl bg-indigo-50 px-4 py-2 font-bold text-indigo-800">
              🔁 Reading it again — see if you can beat {current.read?.wcpm ?? 0} words per minute!
            </p>
          )}
          <ReadAloud key={`${current.pageNumber}-${attempt}`} text={current.page.text} onDone={onReadDone} />
          </div>
        </div>
      )}

      {current && phase !== "reading" && phase !== "loading" && phase !== "ending" && (
        <ProgressDots page={current.pageNumber} total={session.totalPages} level={current.level} />
      )}

      {current?.read && phase === "result" && (
        <ResultCard
          read={current.rereads?.at(-1) ?? current.read}
          firstRead={current.rereads?.length ? current.read : undefined}
          onNext={() => setPhase("question")}
          onReadAgain={() => {
            setAttempt((a) => a + 1);
            setPhase("reading");
          }}
        />
      )}

      {current && phase === "question" && (
        <QuestionCard key={current.pageNumber} question={current.page.question} onAnswered={onAnswered} />
      )}

      {current && phase === "vocab" && (
        <VocabCard words={current.page.targetWords} onNext={onVocabDone} />
      )}

      {current && phase === "choice" && (
        <ChoiceButtons choices={current.page.choices} onChoose={onChoose} />
      )}

      {phase === "ending" && (
        <div className="animate-pop flex flex-col items-center gap-5 overflow-hidden rounded-3xl bg-white pb-10 text-center shadow">
          <SceneArt world={session.world} scene={current?.page.scene} className="aspect-[5/2]" />
          <div className="text-7xl">🏆</div>
          <h2 className="text-3xl font-extrabold">The End!</h2>
          <p className="text-lg text-slate-600">
            You read {session.pages.reduce((n, p) => n + (p.read?.total ?? 0), 0)} words out loud.
            Amazing.
          </p>
          <div className="flex gap-3">
            <Link
              href={`/report/${session.id}`}
              className="rounded-full bg-indigo-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-indigo-500"
            >
              See my report
            </Link>
            <Link href="/" className="rounded-full bg-slate-200 px-8 py-4 text-xl font-bold">
              New story
            </Link>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({
  world,
  session,
  children,
}: {
  world: (typeof WORLDS)[number] | null;
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-lg font-extrabold text-indigo-700">
          📖 Readalong
        </Link>
        {world && session && (
          <span className="text-sm font-bold text-slate-500">
            {world.emoji} {world.name}
            <span className="ml-3 text-slate-400">·</span>
            <Link href={`/report/${session.id}`} className="ml-3 text-indigo-600">
              Report
            </Link>
          </span>
        )}
      </header>
      {children}
    </main>
  );
}
