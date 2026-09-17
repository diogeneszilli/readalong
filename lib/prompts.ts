import { WORLDS, type NextPageRequest } from "./schema";
import { levelSpec, placement } from "./leveling";
import { sceneOptionsForPrompt } from "./scenes";

export const SYSTEM_PROMPT = `You are a K–3 reading specialist and a children's picture-book author. You write one page at a time of an interactive branching story that a young child will READ ALOUD to practise oral reading fluency.

Rules for every page:
- Write ONLY for the reading level you are given. Respect the word count, sentence length and phonics constraints exactly. A page that is too hard is a failed page.
- Plain prose. No markdown, no emoji, no headings, no stage directions, no all-caps words.
- Use only standard English spelling. Avoid names that are hard to decode; prefer names like Sam, Max, Pip, Mia, Bo.
- Keep it warm, funny and kind. No violence, scary content, romance, or anything a parent would not want a six-year-old to read.
- The story must be continuous: remember characters, objects and the choice the child just made, and make that choice matter.
- targetWords: 1–2 words that appear VERBATIM in this page's text, are slightly above the child's level, and are worth learning. Give a one-sentence definition a six-year-old understands.
- question: one multiple-choice comprehension question about THIS page with exactly 3 options. Only one is correct. Wrong options must be plausible, not silly. Use "literal" for levels 1–3 and mix in "inferential" for levels 4–6.
- choices: exactly 2 short, exciting choices for what happens next (start with a verb, ≤ 6 words). On the final page return an empty array and set isEnding to true with a satisfying, happy ending.
- scene: pick exactly one scene id from the SCENES list for where this page mostly happens. Use the default scene when nothing else fits. Vary scenes across pages when the story moves.
- illustrationPrompt: one sentence describing a bright, friendly picture-book illustration of this page. Never include text or letters in the image.
- Never ask for or mention the child's name, age, location or any personal information.`;

export function buildUserPrompt(req: NextPageRequest): string {
  const world = WORLDS.find((w) => w.id === req.world)!;
  const spec = levelSpec(req.level);
  const isFinal = req.pageNumber >= req.totalPages;

  const historyBlock =
    req.history.length === 0
      ? "This is the FIRST page. Name the main character in the very first sentence (third person, e.g. \"Pip the fox\"), show the setting in one sentence, and end with a small hook. Never write in first person."
      : req.history
          .map(
            (h, i) =>
              `Page ${i + 1}:\n${h.text}${h.choiceTaken ? `\n→ The child chose: "${h.choiceTaken}"` : ""}`,
          )
          .join("\n\n");

  let adaptation = "";
  if (req.lastResult) {
    const p = placement(req.lastResult.accuracy);
    const pct = Math.round(req.lastResult.accuracy * 100);
    if (p === "frustration") {
      adaptation = `The child read the last page at ${pct}% accuracy (frustration level), so this page is one level EASIER than the last. Keep sentences shorter and reuse familiar words. If it fits naturally, reuse one or two of these words they struggled with so they get another try: ${req.lastResult.missedWords.slice(0, 3).join(", ") || "none"}.`;
    } else if (p === "independent") {
      adaptation = `The child read the last page at ${pct}% accuracy (independent level), so this page is one level HARDER than the last. Stretch them slightly.`;
    } else {
      adaptation = `The child read the last page at ${pct}% accuracy (instructional level). Keep this page at the same difficulty.`;
    }
  }

  const heroLine =
    req.history.length === 0
      ? `MAIN CHARACTER: ${world.hero}`
      : "MAIN CHARACTER: keep the same characters and names as the story so far.";

  return `WORLD: ${world.name} — ${world.blurb}
${heroLine}
SCENES (choose one id for "scene"):
${sceneOptionsForPrompt(req.world)}

READING LEVEL: ${spec.label} (${spec.grade})
- About ${spec.words} words on this page (±20%).
- Sentences of at most ${spec.maxSentenceWords} words.
- ${spec.prose}

STORY SO FAR:
${historyBlock}

${adaptation}

Now write page ${req.pageNumber} of ${req.totalPages}.${isFinal ? " This is the FINAL page: resolve the story with a happy ending, set isEnding to true and return no choices." : " Do NOT end the story yet; end with 2 choices."}`;
}
