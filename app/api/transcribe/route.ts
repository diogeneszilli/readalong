import { generateText } from "ai";
import { z } from "zod";
import { getStoryModel, isCoolingDown, noteFailure, storyModelChain } from "@/lib/llm";

export const maxDuration = 60;

const MODEL_TIMEOUT_MS = 15_000;
/** ~30 s of 16 kHz 16-bit mono WAV, base64. Keeps requests small on the free tier. */
const MAX_AUDIO_BASE64 = 1_400_000;

const BodySchema = z.object({
  audio: z.string().min(100).max(MAX_AUDIO_BASE64),
  mediaType: z.enum(["audio/wav", "audio/webm", "audio/ogg", "audio/mp4"]).default("audio/wav"),
  /** Vocabulary of the passage (unordered, deduplicated) + hero names — phrase hints, never the passage itself. */
  hints: z.array(z.string().max(30)).max(80).default([]),
});

const PROMPT = (hints: string[]) => `A young child is practising reading aloud from a short passage. Transcribe exactly what is spoken, word for word.
- Lowercase, no punctuation, words separated by single spaces.
- Keep mistakes, repeated words, false starts and self-corrections exactly as spoken. Do not fix them.
- Never add words that were not said. Never guess a "correct" version.
- If there is no speech, output an empty line.
${
  hints.length
    ? `Phrase hints — the passage's vocabulary, in no particular order: ${hints.join(", ")}.
Use these only to resolve audio that is genuinely ambiguous (e.g. a muffled consonant on a phone-quality microphone). If the child clearly says a different word, write what they said.`
    : ""
}
Output only the words.`;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  const { audio, mediaType, hints } = parsed.data;
  const failures: string[] = [];

  for (const modelId of storyModelChain()) {
    if (isCoolingDown(modelId)) continue;
    const started = Date.now();
    try {
      const { text } = await generateText({
        model: getStoryModel(modelId),
        messages: [
          {
            role: "user",
            content: [
              { type: "file", mediaType, data: audio },
              { type: "text", text: PROMPT(hints) },
            ],
          },
        ],
        temperature: 0,
        maxOutputTokens: 600,
        providerOptions: { google: { thinkingConfig: { thinkingLevel: "low" } } },
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
      });
      const transcript = text
        .toLowerCase()
        .replace(/[^a-z0-9'\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return Response.json({ transcript, model: modelId, ms: Date.now() - started, failures });
    } catch (err) {
      const reason = noteFailure(modelId, err instanceof Error ? err.message : String(err));
      failures.push(`${modelId}: ${reason}`);
      console.warn(`transcribe ${modelId} failed after ${Date.now() - started}ms: ${reason}`);
    }
  }

  return Response.json(
    { error: "Transcription unavailable right now; using the browser's transcript.", failures },
    { status: 503 },
  );
}
