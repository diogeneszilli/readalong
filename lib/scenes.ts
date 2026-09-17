import type { WorldId } from "./schema";

/**
 * A fixed pool of illustrated scenes per world. The model tags each page with
 * the closest scene id; the app renders the matching SVG (components/SceneArt).
 * Free, instant, and consistent — the trade-off is that art matches the place,
 * not the exact moment, which is how most leveled readers work anyway.
 */
export interface Scene {
  id: string;
  label: string;
  /** Shown to the model so it can pick the right one. */
  hint: string;
}

export const SCENES: Record<WorldId, Scene[]> = {
  forest: [
    { id: "clearing", label: "Sunny clearing", hint: "open grass between trees, flowers, daytime — the default" },
    { id: "log", label: "The old log", hint: "a big fallen log, mushrooms, something found on or under it" },
    { id: "stream", label: "The stream", hint: "water, stepping stones, crossing, splashing" },
    { id: "cave", label: "Dark cave", hint: "cave mouth in a hill, shadows, echoes, mystery" },
    { id: "meadow", label: "Sunflower meadow", hint: "tall sunflowers, butterflies, open field, treasure spot" },
    { id: "owl", label: "The owl's oak", hint: "huge old tree, the wise owl, night or dusk, advice" },
  ],
  space: [
    { id: "ship", label: "Inside the ship", hint: "control room, window with stars, buttons — the default" },
    { id: "crash", label: "Crash site", hint: "the ship tilted on the ground, dust, a bent wing" },
    { id: "jelly", label: "Jelly planet", hint: "pink wobbly ground, bouncing, sticky, sweet" },
    { id: "stars", label: "Open space", hint: "floating among stars and planets, spacewalk, drifting" },
    { id: "station", label: "Star Station", hint: "domes and towers, other robots, landing pad, help" },
    { id: "repair", label: "Repair bay", hint: "tools, wrench, fixing the ship, parts, sparks" },
  ],
  ocean: [
    { id: "reef", label: "Coral reef", hint: "bright coral, small fish, sunny shallow water — the default" },
    { id: "bell", label: "The sunken bell", hint: "a big old bell on the sand, ringing, treasure" },
    { id: "trench", label: "Deep trench", hint: "dark deep water, glowing lights, cold, brave" },
    { id: "squid", label: "Squid's cave", hint: "the shy giant squid, big eyes, cave, friendship" },
    { id: "sand", label: "Sandy floor", hint: "shells, seaweed, footprints, searching" },
    { id: "surface", label: "The surface", hint: "waves, sky, a boat, sunlight, going up" },
  ],
};

export const HEROES: Record<WorldId, "fox" | "robot" | "crab"> = {
  forest: "fox",
  space: "robot",
  ocean: "crab",
};

/** Returns a valid scene id for the world, falling back to the first scene. */
export function resolveScene(world: WorldId, scene: string | undefined): string {
  const list = SCENES[world];
  return list.some((s) => s.id === scene) ? (scene as string) : list[0].id;
}

export function sceneOptionsForPrompt(world: WorldId): string {
  return SCENES[world].map((s) => `"${s.id}" — ${s.hint}`).join("\n");
}
