import type { Level, ReadResult } from "./schema";

/**
 * Reading-level placement follows the classic Betts (1946) criteria used in
 * informal reading inventories:
 *   ≥ 95% word accuracy  → independent level  (text is easy; move up)
 *   90–94%               → instructional level (just right; hold)
 *   < 90%                → frustration level   (too hard; move down)
 */
export const INDEPENDENT_THRESHOLD = 0.95;
export const FRUSTRATION_THRESHOLD = 0.9;

export type Placement = "independent" | "instructional" | "frustration";

export function placement(accuracy: number): Placement {
  if (accuracy >= INDEPENDENT_THRESHOLD) return "independent";
  if (accuracy >= FRUSTRATION_THRESHOLD) return "instructional";
  return "frustration";
}

export function nextLevel(current: Level, result: ReadResult | undefined): Level {
  if (!result) return current;
  const p = placement(result.accuracy);
  if (p === "independent") return Math.min(6, current + 1) as Level;
  if (p === "frustration") return Math.max(1, current - 1) as Level;
  return current;
}

export interface LevelSpec {
  level: Level;
  label: string;
  grade: string;
  /** Words per page, approximate. */
  words: number;
  /** Max words per sentence. */
  maxSentenceWords: number;
  /** Prose constraints handed to the model. */
  prose: string;
  /** 50th-percentile spring oral-reading-fluency norm, words correct per minute. */
  wcpmNorm: number;
}

/**
 * WCPM norms are the Hasbrouck & Tindal (2017) 50th-percentile spring values:
 * Grade 1: 60, Grade 2: 100, Grade 3: 112. Kindergarten has no published ORF
 * norm; 20 is a conservative placeholder so the report still has a bar.
 */
export const LEVELS: Record<Level, LevelSpec> = {
  1: {
    level: 1,
    label: "Level 1",
    grade: "Kindergarten",
    words: 25,
    maxSentenceWords: 6,
    prose:
      "Use only short CVC words (cat, sun, big) and pre-primer sight words (the, a, I, see, can, go, my, it, is). Sentences of 3–6 words. One idea per sentence. Lots of repetition.",
    wcpmNorm: 20,
  },
  2: {
    level: 2,
    label: "Level 2",
    grade: "Grade 1 (early)",
    words: 40,
    maxSentenceWords: 8,
    prose:
      "Mostly one-syllable decodable words with simple blends (st, fr, pl) and primer sight words (was, they, said, look, come). Sentences of 4–8 words. Simple past tense is fine.",
    wcpmNorm: 45,
  },
  3: {
    level: 3,
    label: "Level 3",
    grade: "Grade 1 (late)",
    words: 55,
    maxSentenceWords: 10,
    prose:
      "Digraphs (sh, ch, th), long-vowel patterns (cake, boat), and a few common two-syllable words (little, happy). Sentences up to 10 words. One line of simple dialogue is fine.",
    wcpmNorm: 60,
  },
  4: {
    level: 4,
    label: "Level 4",
    grade: "Grade 2",
    words: 75,
    maxSentenceWords: 12,
    prose:
      "Two-syllable words with common suffixes (-ing, -ed, -er), some compound words, and dialogue. Sentences up to 12 words. Begin to show feelings through actions.",
    wcpmNorm: 100,
  },
  5: {
    level: 5,
    label: "Level 5",
    grade: "Grade 3 (early)",
    words: 95,
    maxSentenceWords: 14,
    prose:
      "Multisyllabic words, richer verbs, and a sprinkling of vivid vocabulary that can be inferred from context. Sentences up to 14 words. Include a small problem to solve.",
    wcpmNorm: 105,
  },
  6: {
    level: 6,
    label: "Level 6",
    grade: "Grade 3 (late)",
    words: 120,
    maxSentenceWords: 16,
    prose:
      "Chapter-book prose: varied sentence length, figurative language used sparingly, character motivation shown not told. Sentences up to 16 words.",
    wcpmNorm: 112,
  },
};

export function levelSpec(level: Level): LevelSpec {
  return LEVELS[level];
}

/** Fraction of the grade-level fluency norm the child reached, capped at 1.5. */
export function fluencyRatio(wcpm: number, level: Level): number {
  return Math.min(1.5, wcpm / LEVELS[level].wcpmNorm);
}
