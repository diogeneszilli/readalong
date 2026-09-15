import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Story generation runs on Gemini via a Google AI Studio key (free tier).
 *
 * Free-tier quotas are per model (5 req/min, 20 req/day), so we rotate across
 * several models: the first one that isn't cooling down is tried, and on a
 * quota / "high demand" error it is put on cooldown and the next one is tried.
 *
 * Non-secret defaults live in `.env` (committed):
 *   STORY_MODELS       – comma-separated Gemini model IDs, tried in order
 *   STORY_MODEL        – single-model override (also accepts "mock")
 *   STORY_API_KEY_NAME – name of the env var that holds the secret key
 * The secret itself lives in `.env.local` (git-ignored) under that name.
 */
const FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];
const FALLBACK_KEY_NAME = "GOOGLE_GENERATIVE_AI_API_KEY";

export function isMockMode(): boolean {
  return process.env.STORY_MODEL?.trim() === "mock";
}

export function storyModelChain(): string[] {
  const single = process.env.STORY_MODEL?.trim();
  if (single) return [single];
  const list = (process.env.STORY_MODELS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : FALLBACK_MODELS;
}

export function storyApiKeyName(): string {
  return process.env.STORY_API_KEY_NAME?.trim() || FALLBACK_KEY_NAME;
}

export function getStoryModel(modelId: string) {
  const keyName = storyApiKeyName();
  const apiKey = process.env[keyName];
  if (!apiKey) {
    throw new Error(`${keyName} is not set. Add it to .env.local (see .env.local.example).`);
  }
  return createGoogleGenerativeAI({ apiKey })(modelId);
}

// ---- cooldowns (per warm serverless instance; best-effort) ----------------

const cooldowns = new Map<string, number>();

export function isCoolingDown(modelId: string, now = Date.now()): boolean {
  const until = cooldowns.get(modelId);
  return until !== undefined && until > now;
}

/** Classify an error and put the model on cooldown accordingly. */
export function noteFailure(modelId: string, err: unknown, now = Date.now()): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  let reason: string;
  let ms: number;
  if (lower.includes("perday") || lower.includes("per day")) {
    reason = "daily quota";
    ms = 6 * 60 * 60 * 1000;
  } else if (lower.includes("quota") || lower.includes("rate limit") || lower.includes("429")) {
    reason = "minute quota";
    ms = 60 * 1000;
  } else if (lower.includes("high demand") || lower.includes("overloaded") || lower.includes("503")) {
    reason = "high demand";
    ms = 45 * 1000;
  } else if (lower.includes("timeout") || lower.includes("abort")) {
    reason = "timed out";
    ms = 30 * 1000;
  } else {
    reason = msg.slice(0, 120);
    ms = 0;
  }
  if (ms > 0) cooldowns.set(modelId, now + ms);
  return reason;
}

export function clearCooldowns() {
  cooldowns.clear();
}
