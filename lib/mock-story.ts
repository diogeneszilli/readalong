import type { NextPageRequest, StoryPage } from "./schema";

/**
 * Deterministic pages for local UI work and tests when STORY_MODEL=mock.
 * Never used in production unless someone sets that env var on purpose.
 * The page picked depends on the requested level, so adaptation is visible.
 */
const PAGES: Record<number, string> = {
  1: "Pip is a red fox. Pip can hop. Pip sees a map. The map is on a log. Can Pip get it?",
  2: "Pip the fox found an old map under a log. The map had a red X on it. Pip felt very brave. She ran to find the spot.",
  3: "Pip the fox raced through the tall grass with the map in her mouth. She stopped at a stream. \"The X is on the other side,\" she said. A frog hopped up beside her.",
  4: "Pip stared across the rushing stream and wondered how to cross it. The frog grinned and pointed at a row of shiny stepping stones. \"Follow me, and don't look down,\" he croaked, hopping onto the first one.",
  5: "Balancing carefully, Pip followed the frog from stone to stone while the water sparkled beneath her paws. Halfway across, her map slipped and fluttered toward the current. She lunged, caught the corner in her teeth, and scrambled onto the far bank with her heart pounding.",
  6: "The far bank opened onto a meadow that Pip had never seen before, where enormous sunflowers swayed like slow dancers. The map's red X pointed to the tallest one, and beneath its leaves something glinted in the afternoon light. Pip glanced back at the frog, who only shrugged and said, \"Some treasures prefer to be discovered.\"",
};

const VOCAB: Record<number, StoryPage["targetWords"]> = {
  1: [{ word: "map", kidDefinition: "A picture that shows you where things are." }],
  2: [{ word: "brave", kidDefinition: "Not scared to do something hard." }],
  3: [{ word: "stream", kidDefinition: "A small river you can hop across." }],
  4: [{ word: "stepping stones", kidDefinition: "Flat rocks you walk on to cross water." }],
  5: [{ word: "current", kidDefinition: "The way water moves in a river." }, { word: "lunged", kidDefinition: "Jumped forward very fast." }],
  6: [{ word: "meadow", kidDefinition: "A big grassy field with flowers." }, { word: "glinted", kidDefinition: "Shined for just a moment." }],
};

export function mockPage(req: NextPageRequest): StoryPage {
  const isFinal = req.pageNumber >= req.totalPages;
  const text = PAGES[req.level] ?? PAGES[2];
  return {
    title: "Pip and the Lost Map",
    text: isFinal ? `${text} And that is how Pip found the treasure. The End.` : text,
    targetWords: VOCAB[req.level] ?? VOCAB[2],
    question: {
      kind: req.level >= 4 ? "inferential" : "literal",
      prompt: req.level >= 4 ? "How do you think Pip felt on the stones?" : "What did Pip find?",
      options: req.level >= 4 ? ["Bored", "Nervous but brave", "Sleepy"] : ["A map", "A hat", "A cup"],
      answerIndex: req.level >= 4 ? 1 : 0,
    },
    choices: isFinal ? [] : [{ label: "Follow the map" }, { label: "Ask the frog for help" }],
    isEnding: isFinal,
    scene: ({ 1: "clearing", 2: "log", 3: "stream", 4: "stream", 5: "stream", 6: "meadow" } as Record<number, string>)[req.level] ?? "clearing",
    illustrationPrompt: "A small red fox holding a paper map in a sunny forest.",
  };
}
