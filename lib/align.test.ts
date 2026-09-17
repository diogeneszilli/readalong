import { describe, expect, it } from "vitest";
import { alignWords, normalizeWord, wcpm, wordMatch } from "./align";

describe("normalizeWord", () => {
  it("strips punctuation and case", () => {
    expect(normalizeWord("Hello,")).toBe("hello");
    expect(normalizeWord("don't")).toBe("dont");
    expect(normalizeWord("“Yes!”")).toBe("yes");
  });
});

describe("wordMatch", () => {
  it("exact match is ok", () => {
    expect(wordMatch("cat", "cat")).toBe("ok");
  });
  it("short words must match exactly (cat vs cap is a misread)", () => {
    expect(wordMatch("cat", "cap")).toBe("missed");
  });
  it("tolerates one edit on 4+ letter words (plural/tense noise)", () => {
    expect(wordMatch("jumps", "jump")).toBe("close");
    expect(wordMatch("looked", "looks")).toBe("missed"); // 2 edits on 6 letters
  });
  it("tolerates two edits on 7+ letter words", () => {
    expect(wordMatch("breakfast", "brekfast")).toBe("close");
  });
});

describe("alignWords", () => {
  it("scores a perfect read at 100%", () => {
    const r = alignWords("The cat sat on the mat.", "the cat sat on the mat");
    expect(r.accuracy).toBe(1);
    expect(r.words.every((w) => w.status === "ok")).toBe(true);
  });

  it("marks a skipped word as missed without derailing the rest", () => {
    const r = alignWords("The cat sat on the mat.", "the cat on the mat");
    expect(r.words.map((w) => w.status)).toEqual(["ok", "ok", "missed", "ok", "ok", "ok"]);
    expect(r.missedWords).toEqual(["sat"]);
    expect(r.accuracy).toBeCloseTo(5 / 6);
  });

  it("ignores inserted words the child added", () => {
    const r = alignWords("The cat sat.", "the um cat sat");
    expect(r.accuracy).toBe(1);
  });

  it("marks a substitution as missed", () => {
    const r = alignWords("The dog ran fast.", "the dog can fast");
    expect(r.words[2].status).toBe("missed");
    expect(r.missedWords).toEqual(["ran"]);
  });

  it("handles repeated words in the text", () => {
    const r = alignWords("Run, Sam, run!", "run sam run");
    expect(r.accuracy).toBe(1);
  });

  it("handles an empty transcript", () => {
    const r = alignWords("The cat sat.", "");
    expect(r.accuracy).toBe(0);
    expect(r.correct).toBe(0);
  });

  it("records what was heard for close matches", () => {
    const r = alignWords("Pip jumps high.", "pip jump high");
    expect(r.words[1].status).toBe("close");
    expect(r.words[1].heard).toBe("jump");
  });
});

describe("wcpm", () => {
  it("computes words correct per minute", () => {
    expect(wcpm(30, 30_000)).toBe(60);
  });
  it("guards against tiny timers", () => {
    expect(wcpm(10, 0)).toBe(600);
  });
});

describe("sound-alike matching", () => {
  it("forgives recogniser homophones and near-homophones", () => {
    expect(wordMatch("hat", "head")).toBe("close");
    expect(wordMatch("sam", "some")).toBe("close");
    expect(wordMatch("there", "their")).toBe("close");
    expect(wordMatch("red", "read")).toBe("close");
  });
  it("still catches real misreads", () => {
    expect(wordMatch("cat", "dog")).toBe("missed");
    expect(wordMatch("big", "pig")).toBe("missed");
  });
  it("forgives vowel-only differences (recogniser noise outweighs decoding errors here)", () => {
    expect(wordMatch("run", "ran")).toBe("close");
  });
});
