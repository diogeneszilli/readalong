import { generateText, NoObjectGeneratedError, Output } from "ai";
import { NextPageRequestSchema, StoryPageSchema, type StoryPage } from "@/lib/schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import { getOpenRouter, storyModelId } from "@/lib/llm";

export const maxDuration = 60;

async function generatePage(prompt: string): Promise<StoryPage> {
  const openrouter = getOpenRouter();
  const { output } = await generateText({
    model: openrouter(storyModelId()),
    system: SYSTEM_PROMPT,
    prompt,
    output: Output.object({ schema: StoryPageSchema }),
    temperature: 0.8,
    maxOutputTokens: 1200,
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
      "The story got cut off before the page was finished. This usually means the OpenRouter account is out of credits.";
  }
  return Response.json({ error: message }, { status: 502 });
}
