import { describe, expect, it } from "vitest";
import { concat, downsample, encodeWav } from "./recorder";

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
