import { describe, expect, it } from "vitest";
import { fluencyRatio, nextLevel, placement } from "./leveling";

const result = (accuracy: number) => ({ accuracy, wcpm: 50, missedWords: [] });

describe("placement (Betts criteria)", () => {
  it("≥95% is independent", () => {
    expect(placement(0.95)).toBe("independent");
    expect(placement(1)).toBe("independent");
  });
  it("90–94% is instructional", () => {
    expect(placement(0.9)).toBe("instructional");
    expect(placement(0.949)).toBe("instructional");
  });
  it("<90% is frustration", () => {
    expect(placement(0.899)).toBe("frustration");
    expect(placement(0)).toBe("frustration");
  });
});

describe("nextLevel", () => {
  it("moves up on independent", () => {
    expect(nextLevel(2, result(0.97))).toBe(3);
  });
  it("holds on instructional", () => {
    expect(nextLevel(2, result(0.92))).toBe(2);
  });
  it("moves down on frustration", () => {
    expect(nextLevel(2, result(0.8))).toBe(1);
  });
  it("clamps to 1..6", () => {
    expect(nextLevel(1, result(0.5))).toBe(1);
    expect(nextLevel(6, result(1))).toBe(6);
  });
  it("holds when there is no result yet", () => {
    expect(nextLevel(3, undefined)).toBe(3);
  });
});

describe("fluencyRatio", () => {
  it("compares WCPM to the grade norm", () => {
    expect(fluencyRatio(50, 4)).toBeCloseTo(0.5); // grade 2 norm is 100
  });
  it("caps at 1.5", () => {
    expect(fluencyRatio(1000, 1)).toBe(1.5);
  });
});
