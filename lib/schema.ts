import { z } from "zod";

/** Reading levels 1–6 map to K → Grade 3 (see lib/leveling.ts). */
export const LevelSchema = z.number().int().min(1).max(6);
export type Level = z.infer<typeof LevelSchema>;

export const WORLDS = [
  {
    id: "forest",
    name: "Whispering Forest",
    emoji: "🌲",
    blurb: "Talking animals, a lost map, and a very old owl.",
    hero: "Mia the fox",
  },
  {
    id: "space",
    name: "Star Station",
    emoji: "🚀",
    blurb: "A tiny robot, a broken ship, and a planet made of jelly.",
    hero: "Bo the robot",
  },
  {
    id: "ocean",
    name: "Coral Kingdom",
    emoji: "🐠",
    blurb: "A brave crab, a sunken bell, and a shy giant squid.",
    hero: "Sam the crab",
  },
] as const;
export type WorldId = (typeof WORLDS)[number]["id"];
export const WorldIdSchema = z.enum(["forest", "space", "ocean"]);

export const TargetWordSchema = z.object({
  word: z.string().describe("A single vocabulary word that appears verbatim in the page text."),
  kidDefinition: z
    .string()
    .describe("A one-sentence definition a 6-year-old would understand."),
});

export const QuestionSchema = z.object({
  kind: z
    .enum(["literal", "inferential"])
    .describe("literal = answer is stated in the text; inferential = must be reasoned from it."),
  prompt: z.string(),
  options: z.array(z.string()).length(3),
  answerIndex: z.number().int().min(0).max(2),
});

export const ChoiceSchema = z.object({
  label: z.string().describe("Short, exciting, ≤ 6 words. Starts with a verb."),
});

export const StoryPageSchema = z.object({
  title: z.string().describe("Story title. Same on every page of one story."),
  text: z
    .string()
    .describe("The page text the child will read aloud. Plain prose, no markdown, no emoji."),
  targetWords: z.array(TargetWordSchema).min(1).max(2),
  question: QuestionSchema,
  choices: z
    .array(ChoiceSchema)
    .max(2)
    .describe("Exactly 2 choices on non-final pages; empty array on the final page."),
  isEnding: z.boolean(),
  scene: z
    .string()
    .describe("The id of the scene from the SCENES list that best matches where this page happens."),
  illustrationPrompt: z
    .string()
    .describe("One sentence describing a picture-book illustration of this page. No text in image."),
});
export type StoryPage = z.infer<typeof StoryPageSchema>;

/** Result of one read-aloud attempt, sent back so the next page can adapt. */
export const ReadResultSchema = z.object({
  accuracy: z.number().min(0).max(1),
  wcpm: z.number().min(0),
  missedWords: z.array(z.string()),
});
export type ReadResult = z.infer<typeof ReadResultSchema>;

export const HistoryEntrySchema = z.object({
  text: z.string(),
  choiceTaken: z.string().optional(),
});

export const NextPageRequestSchema = z.object({
  world: WorldIdSchema,
  level: LevelSchema,
  pageNumber: z.number().int().min(1).max(12),
  totalPages: z.number().int().min(2).max(12).default(5),
  history: z.array(HistoryEntrySchema).default([]),
  lastResult: ReadResultSchema.optional(),
  /** Dev/tooling only: bypass the pre-generated opening cache. */
  skipCache: z.boolean().optional(),
});
export type NextPageRequest = z.infer<typeof NextPageRequestSchema>;
