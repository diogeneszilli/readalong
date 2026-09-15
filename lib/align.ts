/**
 * Aligns the words a child was expected to read against what speech
 * recognition heard, and scores accuracy and fluency.
 *
 * Alignment is a longest-common-subsequence DP with fuzzy word equality, so
 * skipped words, inserted words and substitutions are all handled without
 * the scoring drifting off by one after the first mistake.
 */

export type WordStatus = "ok" | "close" | "missed";

export interface AlignedWord {
  /** Word as displayed (original casing and punctuation). */
  display: string;
  /** Normalised form used for matching. */
  norm: string;
  status: WordStatus;
  /** What the recogniser heard for a "close" match. */
  heard?: string;
}

export interface AlignmentResult {
  words: AlignedWord[];
  total: number;
  correct: number;
  /** correct / total, 0..1 */
  accuracy: number;
  missedWords: string[];
}

export function normalizeWord(w: string): string {
  return w
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function tokenizeDisplay(text: string): string[] {
  return text.split(/\s+/).filter((t) => normalizeWord(t).length > 0);
}

export function tokenizeHeard(transcript: string): string[] {
  return transcript
    .split(/\s+/)
    .map(normalizeWord)
    .filter((t) => t.length > 0);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  let cur = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}

/**
 * "close" tolerates recogniser noise (plurals, -ed, homophones) without
 * excusing real misreads: 1 edit for words of 4+ letters, 2 edits for 7+.
 */
export function wordMatch(expected: string, heard: string): WordStatus {
  if (expected === heard) return "ok";
  const len = Math.max(expected.length, heard.length);
  const d = levenshtein(expected, heard);
  if (len >= 7 && d <= 2) return "close";
  if (len >= 4 && d <= 1) return "close";
  return "missed";
}

export function alignWords(expectedText: string, transcript: string): AlignmentResult {
  const display = tokenizeDisplay(expectedText);
  const expected = display.map(normalizeWord);
  const heard = tokenizeHeard(transcript);
  const n = expected.length;
  const m = heard.length;

  // dp[i][j] = best score aligning expected[i..] with heard[j..]
  // ok = 2, close = 1 so an exact match is preferred over a fuzzy one.
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const status = wordMatch(expected[i], heard[j]);
      const matchScore = status === "ok" ? 2 : status === "close" ? 1 : -Infinity;
      dp[i][j] = Math.max(
        dp[i + 1][j], // skip expected word (missed)
        dp[i][j + 1], // skip heard word (insertion)
        matchScore === -Infinity ? -Infinity : matchScore + dp[i + 1][j + 1],
      );
    }
  }

  const words: AlignedWord[] = display.map((d, i) => ({
    display: d,
    norm: expected[i],
    status: "missed",
  }));

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    const status = wordMatch(expected[i], heard[j]);
    const matchScore = status === "ok" ? 2 : status === "close" ? 1 : -Infinity;
    if (matchScore !== -Infinity && dp[i][j] === matchScore + dp[i + 1][j + 1]) {
      words[i].status = status;
      if (status === "close") words[i].heard = heard[j];
      i++;
      j++;
    } else if (dp[i][j] === dp[i + 1][j]) {
      i++;
    } else {
      j++;
    }
  }

  const correct = words.filter((w) => w.status !== "missed").length;
  const missedWords = Array.from(
    new Set(words.filter((w) => w.status === "missed").map((w) => w.norm)),
  );
  return {
    words,
    total: n,
    correct,
    accuracy: n === 0 ? 1 : correct / n,
    missedWords,
  };
}

/** Words correct per minute. Guards against a zero-length timer. */
export function wcpm(correct: number, elapsedMs: number): number {
  const minutes = Math.max(elapsedMs, 1000) / 60000;
  return Math.round(correct / minutes);
}
