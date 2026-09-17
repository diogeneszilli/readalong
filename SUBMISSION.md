# Submission draft — Nerdy AI Hackathon Challenge

Form: https://hackathon.nerdy.com (bottom of page). Deadline Fri Sep 18, 2026, 11:59 PM CT.
Target: submit by 6 PM CT. Flip the GitHub repo to public first.

## Fields

**Company:** Zilli Technologies (or leave blank)

**Your name:** Diógenes Zilli

**Email:** diogenes@zillitechnologies.com

**Which prompt?** Prompt 03 — English Reading Game (Literacy)

**Demo video:** <YouTube/Loom link, ≤ 3:00>

**Code repo:** https://github.com/diogeneszilli/readalong

**Live demo:** https://readalong-ten.vercel.app (Chrome, allow the microphone)

## What did you build? (form prompt: what it does, how you built it, what you'd do next)

**What it does**

Readalong is a read-aloud story game for K–3 readers: a picture book that comes alive as the child
reads it aloud. Words light up as they're spoken, the scene changes with the story, and the next
page adapts to how the reading went.

The child picks a world and a starting grade. Gemini writes a branching story one page at a time,
constrained to one of six reading levels (word count, sentence length, phonics patterns, sight
words). The child reads each page out loud; words light up as they're recognized, and when the
child finishes, the read is scored word by word: accuracy, words-correct-per-minute (WCPM), and the
exact words missed, each tap-to-hear.

After each page the app applies the Betts informal-reading-inventory rule schools have used for
decades: ≥95% accuracy means the text is independent-level and the next page steps up, 90–94% holds,
below 90% steps down. The child then answers one comprehension question (literal at lower levels,
inferential higher up), learns one or two vocabulary words from the page with tap-to-hear
pronunciation, and chooses what happens next. A "read it again" button turns any page into
repeated-reading practice and shows the WCPM gain. Every page is illustrated from a pool of
hand-drawn scenes the model tags per page.

At the end, a parent/tutor report shows fluency per page against Hasbrouck–Tindal grade-level norms,
the level path the story took, comprehension results, and a tap-to-hear list of words to practise.

Why it matters: oral reading fluency is the strongest early predictor of comprehension, and it is
built by reading aloud at the right level with someone listening. Readalong makes that daily
practice possible without an adult having to sit through it, and gives the adult a specialist-grade
picture of how it went.

**How I built it**

Next.js and TypeScript on Vercel, with the Vercel AI SDK and Gemini via a Google AI Studio key on
the free tier. Each page is a single structured-output call validated with Zod. Because the free
tier allows 20 requests per model per day, the story API rotates across five Gemini models with
per-model cooldowns and serves pre-generated opening pages, so a story costs four live calls.

Scoring uses two transcripts. The browser's Web Speech API gives live word highlighting, but on my
own test reads it scored a clean read at 58–67%. So the read is also recorded and transcribed
verbatim by Gemini, with the page's vocabulary as unordered phrase hints, which I verified keeps
deliberate misreads as spoken. Words are aligned with a longest-common-subsequence algorithm plus
spelling and sound-alike tolerance. The audio path scores the same reads at 96–100%, on a built-in
mic and on AirPods. Sessions and results stay in the browser; no accounts, no analytics; the only
data sent is story text and the short audio clip of one page, with no identifier attached. Built
solo in three days with Claude Code as a coding assistant. Full details, pedagogy notes and
disclosures are in the repo README, docs/PRD.md and DISCLOSURES.md.

**What I'd do next**

1. Field-test with real K–3 readers and their tutors, and calibrate the level thresholds against a
   human-scored reading inventory.
2. Progress across sessions and devices, so a tutor can see a child's WCPM trend over weeks.
3. Per-moment illustrations and expressive read-back, once off the free tier.
4. Session intelligence for the tutor: which phonics patterns a child keeps missing, turned into
   the next story's constraints.

## Anything else (optional upload)

- Screenshot of the report page: `docs/screenshots/report.png` (also `reading.png`, `scenes.png`).
- Optionally the 30-second "how it's built" architecture slide from the video.

## Pre-submit checklist

- [ ] Video ≤ 3:00, only me on camera/voice, no other identifiable people
- [x] Repo public, README + DISCLOSURES.md + LICENSE present (2026-09-17)
- [x] License scan reviewed 2026-09-17: only copyleft entry is Next.js's optional sharp/libvips, unused and documented in DISCLOSURES.md
- [x] Live URL: automated full-story walkthrough passed on production 2026-09-17 (real model pages, typed fallback). Manual mic run-through: pending (Diógenes)
- [ ] LinkedIn Nerdy end date updated to May 2026
- [x] Vercel env has GOOGLE_GENERATIVE_AI_API_KEY (unused OpenRouter key removed); `.env` model chain committed
