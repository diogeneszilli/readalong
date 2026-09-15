import openingsJson from "@/data/openings.json";
import type { Level, StoryPage, WorldId } from "./schema";

/**
 * Pre-generated first pages, keyed "world:level". Page 1 doesn't depend on
 * the reader, so serving it from disk makes the first screen instant and
 * saves one of the five API requests a story costs on the free tier.
 * Regenerate with `npm run gen:openings` (needs the dev server running).
 */
type Openings = Record<string, StoryPage[]>;
const openings = openingsJson as Openings;

export function getOpening(world: WorldId, level: Level): StoryPage | null {
  const list = openings[`${world}:${level}`];
  if (!list || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

export function openingCount(): number {
  return Object.values(openings).reduce((n, l) => n + l.length, 0);
}
