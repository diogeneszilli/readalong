// End-to-end walkthrough on mock mode (STORY_MODEL=mock in .env.local, dev server on :3000).
// Usage: CHROME_PATH=<headless chromium> node scripts/walkthrough.mjs [--mobile]
// Screenshots land in ./.shots (git-ignored).
// Walks a full mock story with the typed fallback and screenshots every screen.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const OUT = process.env.SHOTS_DIR ?? "./.shots";
mkdirSync(OUT, { recursive: true });
const EXE = process.env.CHROME_PATH ??
  "/Users/diogeneszilli/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const mobile = process.argv.includes("--mobile");
const tag = mobile ? "m" : "d";

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({
  viewport: mobile ? { width: 400, height: 800 } : { width: 1100, height: 800 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
page.on("console", (m) => m.type() === "error" && console.log("CONSOLE", m.text().slice(0, 200)));
const shot = async (name) => { await page.waitForTimeout(450); await page.screenshot({ path: `${OUT}/${tag}-${name}.png`, fullPage: true }); };

await page.goto(`${BASE}/`);
await page.waitForSelector("text=Start the story");
await shot("01-home");
await page.click("text=Grade 1");
await page.click("text=Start the story");
await page.waitForURL(/\/read\//);

// Reads: perfect, perfect, sloppy (skip words), ok, perfect
const readStyles = ["perfect", "perfect", "sloppy", "ok", "perfect"];
for (let n = 1; n <= 5; n++) {
  await page.waitForSelector("text=Start reading", { timeout: 20000 });
  if (n === 1) await shot("02-reading");
  const text = await page.$eval("p.text-3xl", (el) => el.innerText);
  const words = text.split(/\s+/);
  let typed;
  if (readStyles[n - 1] === "perfect") typed = text;
  else if (readStyles[n - 1] === "sloppy") typed = words.filter((_, i) => i % 4 !== 1).join(" ");
  else typed = words.filter((_, i) => i !== 3).join(" ");
  await page.click("text=no microphone? type it");
  await page.fill('[data-testid="typed-transcript"]', typed);
  await page.waitForTimeout(1200);
  if (n === 3) await shot("03-typing-live");
  await page.click("text=I'm done");
  await page.waitForSelector("text=Next →");
  if (n === 1) await shot("04-result-independent");
  if (n === 3) await shot("05-result-frustration");
  if (n === 3) {
    await page.click("text=Read it again");
    await page.waitForSelector("text=Start reading");
    await page.click("text=no microphone? type it");
    await page.fill('[data-testid="typed-transcript"]', text);
    await page.click("text=I'm done");
    await page.waitForSelector("text=Next →");
    await shot("06-result-reread");
  }
  await page.click("text=Next →");
  await page.waitForSelector("text=Quick question");
  if (n === 1) await shot("07-question");
  await page.click("button.rounded-2xl >> nth=1");
  await page.waitForSelector("text=Next →");
  if (n === 1) await shot("08-question-answered");
  await page.click("text=Next →");
  await page.waitForSelector("text=Got it");
  if (n === 1) await shot("09-vocab");
  await page.click("text=Got it");
  if (n < 5) {
    await page.waitForSelector("text=What happens next?");
    if (n === 1) await shot("10-choice");
    await page.click("button.border-amber-300 >> nth=0");
  }
}
await page.waitForSelector("text=The End!");
await shot("11-ending");
await page.click("text=See my report");
await page.waitForSelector("text=Reading report");
await page.waitForTimeout(500);
await shot("12-report");
await page.goto(`${BASE}/`);
await page.waitForSelector("text=Recent stories");
await shot("13-home-recent");
await browser.close();
console.log("walk complete");
