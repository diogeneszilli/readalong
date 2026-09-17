import { describe, expect, it } from "vitest";
import { SILENCE_RMS, concat, downsample, encodeWav, levels, normalize } from "./recorder";

describe("recorder helpers", () => {
  it("concatenates chunks", () => {
    const out = concat([new Float32Array([1, 2]), new Float32Array([3])]);
    expect(Array.from(out)).toEqual([1, 2, 3]);
  });

  it("downsamples by averaging", () => {
    const out = downsample(new Float32Array([0, 1, 0, 1, 0, 1, 0, 1]), 32000, 16000);
    expect(out.length).toBe(4);
    expect(Array.from(out)).toEqual([0.5, 0.5, 0.5, 0.5]);
  });

  it("writes a valid 16-bit mono WAV header", () => {
    const buf = encodeWav(new Float32Array([0, 0.5, -0.5]), 16000);
    const v = new DataView(buf);
    const str = (o: number, n: number) =>
      Array.from({ length: n }, (_, i) => String.fromCharCode(v.getUint8(o + i))).join("");
    expect(str(0, 4)).toBe("RIFF");
    expect(str(8, 4)).toBe("WAVE");
    expect(v.getUint16(22, true)).toBe(1); // mono
    expect(v.getUint32(24, true)).toBe(16000);
    expect(v.getUint16(34, true)).toBe(16);
    expect(v.getUint32(40, true)).toBe(6); // 3 samples × 2 bytes
    expect(buf.byteLength).toBe(44 + 6);
    expect(v.getInt16(46, true)).toBeGreaterThan(16000); // 0.5 → ~16383
  });
});

describe("levels and normalisation", () => {
  it("measures rms and peak", () => {
    const { rms, peak } = levels(new Float32Array([0.5, -0.5, 0.5, -0.5]));
    expect(peak).toBe(0.5);
    expect(rms).toBeCloseTo(0.5);
  });
  it("treats near-zero clips as silence", () => {
    expect(levels(new Float32Array(1000).fill(0.001)).rms).toBeLessThan(SILENCE_RMS);
  });
  it("boosts a quiet clip to -3 dBFS and leaves loud or silent clips alone", () => {
    const quiet = normalize(new Float32Array([0.1, -0.1]), 0.1);
    expect(quiet[0]).toBeCloseTo(0.7);
    const loud = normalize(new Float32Array([0.9]), 0.9);
    expect(loud[0]).toBe(0.9);
    const silent = normalize(new Float32Array([0.001]), 0.001);
    expect(silent[0]).toBe(0.001);
  });
});
