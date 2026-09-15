import { generateText, NoObjectGeneratedError, Output } from "ai";
import { NextPageRequestSchema, StoryPageSchema, type StoryPage } from "@/lib/schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import { getStoryModel, storyModelId } from "@/lib/llm";
import { mockPage } from "@/lib/mock-story";

export const maxDuration = 60;

async function generatePage(prompt: string): Promise<StoryPage> {
  const { output } = await generateText({
    model: getStoryModel(),
    system: SYSTEM_PROMPT,
    prompt,
    output: Output.object({ schema: StoryPageSchema }),
    temperature: 0.8,
    // A page is ~300 output tokens; the rest is headroom so thinking never
    // starves the JSON. Gemini 3 thinks by default, so keep it low here (not every Flash model accepts "minimal") —
    // the task is constrained prose, not reasoning.
    maxOutputTokens: 2500,
    providerOptions: { google: { thinkingConfig: { thinkingLevel: "low" } } },
    // Free-tier Gemini allows ~5 requests/min; one retry with backoff keeps a page to ≤ 2 requests.
    maxRetries: 1,
  });
  return output;
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

  if (storyModelId() === "mock") {
    return Response.json({ page: mockPage(parsed.data), model: "mock" });
  }

  const prompt = buildUserPrompt(parsed.data);

  // One retry: structured output occasionally fails schema validation.
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const page = await generatePage(prompt);
      return Response.json({ page, model: storyModelId() });
    } catch (err) {
      lastError = err;
      console.error(`story/next attempt ${attempt + 1} failed`, err);
    }
  }

  let message = lastError instanceof Error ? lastError.message : "Story generation failed";
  if (NoObjectGeneratedError.isInstance(lastError) && lastError.finishReason === "length") {
    message =
      "The story got cut off before the page was finished. This usually means the model hit its output limit or the API quota.";
  }
  return Response.json({ error: message }, { status: 502 });
}
