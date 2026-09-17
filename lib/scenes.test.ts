import { describe, expect, it } from "vitest";
import { SCENES, resolveScene, sceneOptionsForPrompt } from "./scenes";

describe("scenes", () => {
  it("every world has at least 5 scenes with unique ids", () => {
    for (const list of Object.values(SCENES)) {
      expect(list.length).toBeGreaterThanOrEqual(5);
      expect(new Set(list.map((s) => s.id)).size).toBe(list.length);
    }
  });

  it("resolves a valid scene and falls back on an invalid one", () => {
    expect(resolveScene("forest", "stream")).toBe("stream");
    expect(resolveScene("forest", "jelly")).toBe("clearing");
    expect(resolveScene("space", undefined)).toBe("ship");
  });

  it("lists scene ids in the prompt text", () => {
    const text = sceneOptionsForPrompt("ocean");
    for (const s of SCENES.ocean) expect(text).toContain(`"${s.id}"`);
  });
});
