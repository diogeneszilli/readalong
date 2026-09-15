import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Story generation runs on Gemini via a Google AI Studio key. Model ID
 * verified against ai.google.dev/gemini-api/docs/models on 2026-09-15.
 * STORY_MODEL overrides the default without a code change.
 */
export const DEFAULT_STORY_MODEL = "gemini-3.8-flash";

export function storyModelId(): string {
  return process.env.STORY_MODEL ?? DEFAULT_STORY_MODEL;
}

export function getStoryModel() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not set. Copy .env.local.example to .env.local.",
    );
  }
  const google = createGoogleGenerativeAI({ apiKey });
  return google(storyModelId());
}
