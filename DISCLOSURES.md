# Disclosures

Required by the Nerdy AI Hackathon Challenge terms (third-party materials and AI assistance).

## AI assistance

- **Claude Code (Anthropic)** was used throughout development as a coding assistant: scaffolding,
  writing and refactoring TypeScript/React, writing unit tests, drafting prompts, and debugging.
  All architecture and product decisions were made by the entrant; all generated code was
  reviewed, run, and tested by the entrant.
- **Gemini (Google AI Studio API)** is used *at runtime* by the product to write story pages,
  comprehension questions, and vocabulary definitions. No Gemini output is bundled in the repo.

## Third-party services (runtime)

| Service | Use | Data sent |
|---|---|---|
| Google Gemini API (Flash / Flash-Lite models) | Generates each story page as structured JSON | World name, reading-level constraints, the story text so far, the choice taken, and aggregate reading scores (accuracy %, WCPM, missed words). No names, ages, or other personal data. |
| Google Gemini API (same models) | Transcribes the recorded read-aloud clip | A short 16 kHz mono WAV of the child reading one page (typically 10–40 s), plus a list of story character names as vocabulary hints. No name, account, device or session identifier is sent; the app does not store the audio. Google's free tier may use API inputs to improve its services. |
| Vercel | Hosting | Standard request logs |
| Google Fonts (Nunito, OFL) | Typography | Font requests only |

Live word highlighting and text-to-speech run in the browser via the Web Speech API. Final
scoring uses a Gemini transcription of the recorded clip (see above); if that is unavailable the
browser transcript is used instead, and a typed fallback needs no audio at all. Reading results are
stored only in the browser's localStorage. No biometric identification, voice-printing or emotion
inference of any kind is performed; audio is used solely to produce a text transcript.

## Open-source dependencies (all permissive licenses; no GPL/LGPL/AGPL/SSPL)

| Package | License |
|---|---|
| next, react, react-dom | MIT |
| ai (Vercel AI SDK), @ai-sdk/google | Apache-2.0 |
| zod | MIT |
| tailwindcss, @tailwindcss/postcss | MIT |
| typescript, eslint, eslint-config-next | Apache-2.0 / MIT |
| vitest | MIT |

Run `npx license-checker --production --summary` to verify. Two transitive entries need a note:

- **`sharp` / `@img/sharp-libvips-*` (LGPL-3.0-or-later)** is an *optional* dependency of the
  Next.js framework, used only by its `<Image>` optimization pipeline. This app has no `next/image`
  usage and sets `images: { unoptimized: true }` in `next.config.ts`, so the library is never
  loaded, linked, or invoked. It is not part of the Entry's code and no Entry code derives from it.
- **`caniuse-lite` (CC-BY-4.0)** is browser-support *data* pulled in by the CSS toolchain at build
  time; it is not copyleft and ships no code into the app.

## Datasets, models, media

- No datasets were used. No models were trained or fine-tuned.
- Reading-level thresholds (95% / 90% accuracy) follow the Betts (1946) informal reading inventory
  criteria. Fluency norms (WCPM by grade) are the Hasbrouck & Tindal (2017) 50th-percentile spring
  values. Both are published research, cited in the app.
- No stock images, audio, or video. All illustrations (scene backgrounds and the three hero
  characters) are original SVG drawings created for this entry and live in
  `components/SceneArt.tsx`. Emoji are rendered by the viewer's operating system.

## Testing

- Not developed or tested with real student data. All read-aloud testing was done by the entrant
  reading sample pages himself.
- No biometric identification or emotion inference of any kind.
