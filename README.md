# 📖 Readalong

**An adaptive read-aloud story game for K–3 readers.** The child picks a world, an AI writes a
leveled story one page at a time, the child reads each page *out loud*, the browser scores every
word, and the next page gets easier or harder based on how the reading went. A parent/tutor report
shows fluency against grade-level norms and which words to practise.

Built solo for the [Nerdy AI Hackathon Challenge](https://hackathon.nerdy.com) (Prompt 03:
English Reading Game), September 2026.

**Live:** https://readalong-ten.vercel.app · works best in Google Chrome. Any microphone works;
the computer's built-in mic or a wired headset scores most accurately (Bluetooth headsets use
phone-quality audio for their mic, which the app compensates for with volume normalisation and
phrase hints, and flags with a banner).

## Why this exists

Oral reading fluency is the strongest single predictor of reading comprehension in the early
grades, and the way you build it is simple: read aloud, a lot, at the right level, with someone
listening. The bottleneck is the listener. Parents and tutors can't sit through twenty minutes of
read-aloud every day, so most kids get far less fluency practice than they need.

Readalong is the listener. It hears the child read, scores accuracy and words-correct-per-minute
in the browser, keeps the text at the child's instructional level page by page, and hands the
adult a report they'd otherwise need a reading specialist to produce.

## Pedagogy, not just prompts

- **Leveling** follows the Betts informal-reading-inventory criteria used in schools for decades:
  ≥ 95% word accuracy is *independent* (move up), 90–94% is *instructional* (hold), below 90% is
  *frustration* (move down). Every page is a fresh placement decision.
- **Fluency** is reported as WCPM against the Hasbrouck & Tindal (2017) 50th-percentile norms for
  the starting grade, so the number on the report means something to a teacher.
- **Six reading levels** (K → late Grade 3) constrain word count, sentence length, and phonics
  patterns (CVC words and pre-primer sight words at Level 1; blends, digraphs, long vowels,
  multisyllabic words as levels rise). The model is told exactly what a page at each level looks
  like.
- **Comprehension** gets one question per page, literal at lower levels and inferential as the
  level rises, with plausible distractors rather than silly ones.
- **Vocabulary** is 1–2 target words per page that appear verbatim in the text, each with a
  definition a six-year-old understands and tap-to-hear pronunciation.
- **Engagement** comes from a branching story: the child's choice changes what happens next, and
  the ending is always a good one.
- **Illustrations** come from a pool of six hand-drawn scenes per world plus a hero character.
  The model tags each page with the closest scene, so every page has a picture with no image API,
  no latency and no licensing questions.
- **Words to practise** are collected across the story and read aloud by the browser on tap, so
  the practice loop closes without an adult.

## How it works

```
Home  →  pick world + starting grade
  │
  ▼
/api/story/next  ── page 1 from a pre-generated cache (instant)
  │                 pages 2–5 from Gemini, given: story so far, choice taken,
  │                 last read's accuracy + missed words, target level
  ▼
Read aloud  ── live: Web Speech API highlights words as the child reads
  │            on "I'm done": the recorded clip (16 kHz WAV) is transcribed by Gemini,
  │            then LCS word alignment (spelling + sound-alike) scores every word;
  │            falls back to the browser transcript if transcription is unavailable
  ▼
Result → Question → Vocab → Choice → next page (level adjusted) … → Ending → Report
```

- **Story generation** is a single structured-output call per page (Vercel AI SDK +
  `@ai-sdk/google`, Zod-validated). Gemini's free tier is 5 requests/min and 20/day *per model*,
  so the route rotates across several Flash models with per-model cooldowns, and page 1 is served
  from `data/openings.json`. A story costs four live requests.
- **Speech scoring** uses two transcripts. The browser's Web Speech API gives instant word
  highlighting while the child reads. When they finish, the recorded audio goes to Gemini for an
  accurate verbatim transcript (browser recognition alone scored a clean adult read at 58–67%;
  the audio path scores the same reads at 96–100%, including on a Bluetooth headset). The
  transcriber gets the passage's vocabulary as unordered phrase hints, the way production
  speech APIs do, and was verified to keep deliberate misreads as spoken.
  Alignment is a longest-common-subsequence DP with spelling *and* sound-alike matching, so
  skipped, inserted and substituted words score correctly and recognizer homophones (hat/head)
  aren't counted against the child.
- **Privacy:** sessions and results live in `localStorage`; no accounts, no analytics. The story
  API sees only story text, level constraints and aggregate scores. The transcription API receives
  the short audio clip of the page being read, with no name or other identifier attached, and
  the clip is not stored by the app. A "type it" fallback works with no audio at all.

## Run it locally

```bash
npm install
cp .env.local.example .env.local   # add a Google AI Studio key (free tier is fine)
npm run dev                         # http://localhost:3000
```

Useful scripts:

| Command | What it does |
|---|---|
| `npm test` | Unit tests for word alignment, leveling rules, model rotation |
| `npm run typecheck` / `npm run lint` | Type and lint checks |
| `npm run gen:openings` | Regenerates the page-1 cache via the running dev server |
| `STORY_MODEL=mock npm run dev` | Canned pages, zero API calls — for UI work |

Configuration lives in `.env` (committed, non-secret) and `.env.local` (your key).

## Repo map

```
app/                 Next.js App Router pages + the story API route
components/          ReadAloud (mic + live highlighting), Result/Question/Vocab/Choice cards, ReportView, SceneArt (SVG scenes)
lib/scenes.ts        scene pool per world + hero; scene tag validation
lib/align.ts         transcript ↔ text alignment, accuracy, WCPM
lib/leveling.ts      Betts thresholds, level specs, WCPM norms
lib/prompts.ts       system prompt + per-page prompt with adaptation notes
lib/llm.ts           model chain, cooldowns
lib/storage.ts       localStorage sessions (shaped for an easy DB swap)
data/openings.json   pre-generated first pages
```

## Disclosures

AI assistance, third-party services and licenses are listed in [DISCLOSURES.md](./DISCLOSURES.md).

## License

MIT
