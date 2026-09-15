// Regenerates data/openings.json by asking the running dev server for page 1 of
// every world × starting level. Spaced out to respect free-tier rate limits.
// Usage: npm run gen:openings   (dev server must be running on :3000)
import { readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.APP_URL ?? "http://localhost:3000";
const WORLDS = ["forest", "space", "ocean"];
const LEVELS = [1, 2, 4, 5]; // the four starting grades on the home page
const VARIANTS = Number(process.env.VARIANTS ?? 1);
const GAP_MS = Number(process.env.GAP_MS ?? 13_000);
const file = new URL("../data/openings.json", import.meta.url);
const openings = JSON.parse(readFileSync(file, "utf8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const world of WORLDS) {
  for (const level of LEVELS) {
    const key = `${world}:${level}`;
    openings[key] ??= [];
    while (openings[key].length < VARIANTS) {
      let data;
      try {
        const res = await fetch(`${BASE}/api/story/next`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ world, level, pageNumber: 1, totalPages: 5, skipCache: true }),
        });
        data = await res.json();
      } catch (err) {
        console.log(`${key}: network error (${err.cause?.code ?? err.message}); retrying in 10s`);
        await sleep(10_000);
        continue;
      }
      if (!data.page) {
        console.log(`${key}: FAILED ${data.error} ${JSON.stringify(data.failures ?? [])}`);
        await sleep(60_000);
        continue;
      }
      openings[key].push(data.page);
      writeFileSync(file, JSON.stringify(openings, null, 2) + "\n");
      console.log(`${key} via ${data.model} (${data.ms}ms): ${data.page.text.slice(0, 70)}…`);
      await sleep(GAP_MS);
    }
  }
}
console.log("done");
