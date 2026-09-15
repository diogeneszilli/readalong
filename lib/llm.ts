import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Story generation runs on Gemini via a Google AI Studio key.
 *
 * Non-secret defaults live in `.env` (committed):
 *   STORY_MODEL        – Gemini model ID (verified at ai.google.dev/gemini-api/docs/models)
 *   STORY_API_KEY_NAME – name of the env var that holds the secret key
 * The secret itself lives in `.env.local` (git-ignored) under that name.
 */
const FALLBACK_MODEL = "gemini-3.8-flash";
const FALLBACK_KEY_NAME = "GOOGLE_GENERATIVE_AI_API_KEY";

export function storyModelId(): string {
  return process.env.STORY_MODEL?.trim() || FALLBACK_MODEL;
}

export function storyApiKeyName(): string {
  return process.env.STORY_API_KEY_NAME?.trim() || FALLBACK_KEY_NAME;
}

export function getStoryModel() {
  const keyName = storyApiKeyName();
  const apiKey = process.env[keyName];
  if (!apiKey) {
    throw new Error(`${keyName} is not set. Add it to .env.local (see .env.local.example).`);
  }
  const google = createGoogleGenerativeAI({ apiKey });
  return google(storyModelId());
}
