import { generateText, NoObjectGeneratedError, Output } from "ai";
import { NextPageRequestSchema, StoryPageSchema, type StoryPage } from "@/lib/schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import {
  getStoryModel,
  isCoolingDown,
  isMockMode,
  noteFailure,
  storyModelChain,
} from "@/lib/llm";
import { mockPage } from "@/lib/mock-story";
import { getOpening } from "@/lib/openings";
import { resolveScene } from "@/lib/scenes";

export const maxDuration = 60;

/** Per-model timeout so a stalled endpoint falls through to the next model. */
const MODEL_TIMEOUT_MS = 20_000;

async function generatePage(modelId: string, prompt: string): Promise<StoryPage> {
  const { output } = await generateText({
    model: getStoryModel(modelId),
    system: SYSTEM_PROMPT,
    prompt,
    output: Output.object({ schema: StoryPageSchema }),
    temperature: 0.8,
    // A page is ~300 output tokens; the rest is headroom so thinking never
    // starves the JSON. Gemini 3 thinks by default, so keep it low here
    // (not every Flash model accepts "minimal") — the task is constrained prose.
    maxOutputTokens: 2500,
    providerOptions: { google: { thinkingConfig: { thinkingLevel: "low" } } },
    // Rotation across models is our retry; don't also retry inside a model.
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
  });
  return output;
}

function describe(err: unknown): string {
  if (NoObjectGeneratedError.isInstance(err)) {
    return err.finishReason === "length" ? "output cut off" : "invalid page";
  }
  return err instanceof Error ? err.message : String(err);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = NextPageRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const req = parsed.data;

  if (isMockMode()) {
    return Response.json({ page: mockPage(req), model: "mock" });
  }

  // Page 1 doesn't depend on the reader: serve a pre-generated opening.
  if (req.pageNumber === 1 && req.history.length === 0 && !req.skipCache) {
    const opening = getOpening(req.world, req.level);
    if (opening) return Response.json({ page: opening, model: "cache" });
  }

  const prompt = buildUserPrompt(req);
  const failures: string[] = [];
  let skipped = 0;

  for (const modelId of storyModelChain()) {
    if (isCoolingDown(modelId)) {
      skipped++;
      continue;
    }
    const started = Date.now();
    try {
      const page = await generatePage(modelId, prompt);
      page.scene = resolveScene(req.world, page.scene);
      return Response.json({ page, model: modelId, ms: Date.now() - started, failures });
    } catch (err) {
      const reason = noteFailure(modelId, describe(err));
      failures.push(`${modelId}: ${reason}`);
      console.warn(`story/next ${modelId} failed after ${Date.now() - started}ms: ${reason}`);
    }
  }

  const hint =
    skipped > 0 && failures.length === 0
      ? "All story models are cooling down after quota or demand errors. Try again in a minute."
      : "Every story model failed. The free tier may be rate-limited right now — try again in a minute.";
  return Response.json({ error: hint, failures, skipped }, { status: 503 });
}
