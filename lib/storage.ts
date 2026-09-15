import type { Level, StoryPage, WorldId } from "./schema";

/**
 * Session persistence. localStorage for now; the shape is flat and id-keyed so
 * swapping in a database later is a matter of replacing these five functions.
 * No personal data is ever stored — only reading results.
 */

export interface ReadRecord {
  accuracy: number;
  wcpm: number;
  correct: number;
  total: number;
  missedWords: string[];
  elapsedMs: number;
}

export interface PageRecord {
  pageNumber: number;
  level: Level;
  page: StoryPage;
  /** First cold read — used for level placement. */
  read?: ReadRecord;
  /** Optional repeated readings of the same page (fluency practice). */
  rereads?: ReadRecord[];
  questionCorrect?: boolean;
  choiceTaken?: string;
}

export interface Session {
  id: string;
  world: WorldId;
  startLevel: Level;
  level: Level;
  totalPages: number;
  createdAt: string;
  finished: boolean;
  pages: PageRecord[];
}

const KEY = "readalong:sessions:v1";

function read(): Record<string, Session> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, Session>) : {};
  } catch {
    return {};
  }
}

function write(all: Record<string, Session>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* private mode / quota — the session still works in memory */
  }
}

export function createSession(world: WorldId, level: Level, totalPages = 5): Session {
  const session: Session = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    world,
    startLevel: level,
    level,
    totalPages,
    createdAt: new Date().toISOString(),
    finished: false,
    pages: [],
  };
  saveSession(session);
  return session;
}

export function getSession(id: string): Session | null {
  return read()[id] ?? null;
}

export function saveSession(session: Session) {
  const all = read();
  all[session.id] = session;
  write(all);
}

export function listSessions(): Session[] {
  return Object.values(read()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
