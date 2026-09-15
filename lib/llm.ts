import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/**
 * All model access goes through OpenRouter so the provider can be swapped by
 * changing one env var. Slugs verified against openrouter.ai/api/v1/models on
 * 2026-09-15.
 */
export const DEFAULT_STORY_MODEL = "google/gemini-3.8-flash";

export function getOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set. Copy .env.local.example to .env.local.");
  }
  return createOpenRouter({
    apiKey,
    headers: {
      "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
      "X-Title": "Readalong",
    },
  });
}

export function storyModelId(): string {
  return process.env.STORY_MODEL ?? DEFAULT_STORY_MODEL;
}
