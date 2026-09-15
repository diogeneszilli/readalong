import { afterEach, describe, expect, it } from "vitest";
import { clearCooldowns, isCoolingDown, noteFailure, storyModelChain } from "./llm";

afterEach(() => {
  clearCooldowns();
  delete process.env.STORY_MODEL;
  delete process.env.STORY_MODELS;
});

describe("noteFailure cooldowns", () => {
  it("puts a model on a long cooldown for a daily quota error", () => {
    const now = 1_000_000;
    const reason = noteFailure(
      "m",
      "Quota exceeded for metric: GenerateRequestsPerDayPerProjectPerModel-FreeTier",
      now,
    );
    expect(reason).toBe("daily quota");
    expect(isCoolingDown("m", now + 5 * 60 * 60 * 1000)).toBe(true);
    expect(isCoolingDown("m", now + 7 * 60 * 60 * 1000)).toBe(false);
  });

  it("puts a model on a one-minute cooldown for a per-minute quota error", () => {
    const now = 0;
    expect(noteFailure("m", "You exceeded your current quota", now)).toBe("minute quota");
    expect(isCoolingDown("m", now + 30_000)).toBe(true);
    expect(isCoolingDown("m", now + 61_000)).toBe(false);
  });

  it("cools down briefly on high demand", () => {
    expect(noteFailure("m", "This model is currently experiencing high demand", 0)).toBe(
      "high demand",
    );
    expect(isCoolingDown("m", 10_000)).toBe(true);
    expect(isCoolingDown("m", 50_000)).toBe(false);
  });

  it("does not cool down on an unrelated error", () => {
    expect(noteFailure("m", "invalid page", 0)).toBe("invalid page");
    expect(isCoolingDown("m", 1)).toBe(false);
  });
});

describe("storyModelChain", () => {
  it("uses STORY_MODEL as a single override", () => {
    process.env.STORY_MODEL = "gemini-x";
    expect(storyModelChain()).toEqual(["gemini-x"]);
  });
  it("parses STORY_MODELS", () => {
    process.env.STORY_MODELS = " a , b ,,c";
    expect(storyModelChain()).toEqual(["a", "b", "c"]);
  });
  it("falls back to the built-in list", () => {
    expect(storyModelChain().length).toBeGreaterThan(2);
  });
});
