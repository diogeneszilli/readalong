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

## What did you build?

Readalong is a read-aloud story game for K–3 readers that acts as the patient listener most kids
never get enough of.

The child picks a world and a starting grade. Gemini writes a branching story one page at a time,
constrained to one of six reading levels (word count, sentence length, phonics patterns, sight
words). The child reads each page out loud; the browser's speech recognition produces a
transcript, and a word-alignment algorithm scores every word as correct, close, or missed, lighting
them up live and computing accuracy and words-correct-per-minute (WCPM). Nothing leaves the device:
audio, transcripts and results all stay in the browser.

After each page the app applies the Betts informal-reading-inventory rule schools have used for
decades: ≥95% accuracy means the text is independent-level and the next page steps up, 90–94% holds,
below 90% steps down. The child then answers one comprehension question (literal at lower levels,
inferential higher up), learns one or two vocabulary words from the page with tap-to-hear
pronunciation, and chooses what happens next. A "read it again" button turns any page into
repeated-reading practice and shows the WCPM gain.

At the end, a parent/tutor report shows fluency per page against Hasbrouck–Tindal grade-level norms,
the level path the story took, comprehension results, and a tap-to-hear list of words to practise.

Why it matters: oral reading fluency is the strongest early predictor of comprehension, and it is
built by reading aloud at the right level with someone listening. Readalong makes that daily
practice possible without an adult having to sit through it, and gives the adult a specialist-grade
picture of how it went.

Scoring is done from the recorded audio: the browser's speech recognition highlights words live for
immediate feedback, and when the child finishes, the clip is transcribed verbatim by Gemini and
aligned word by word with spelling and sound-alike tolerance. On my own test reads, browser
recognition alone scored 58–67%; the audio path scores 96–100%, on a built-in mic and on AirPods.
Every page is illustrated from a pool of hand-drawn SVG scenes the model tags per page.

Built solo in three days with Next.js, the Vercel AI SDK and Gemini, deployed on Vercel. The story
API rotates across several Gemini models with per-model cooldowns and serves pre-generated opening
pages, so it runs entirely on the free tier. Full details, pedagogy notes and disclosures are in the
repo README, docs/PRD.md and DISCLOSURES.md.

## Anything else (optional upload)

- Screenshot of the report page.
- Optionally the 30-second "how it's built" architecture slide from the video.

## Pre-submit checklist

- [ ] Video ≤ 3:00, only me on camera/voice, no other identifiable people
- [x] Repo public, README + DISCLOSURES.md + LICENSE present (2026-09-17)
- [x] License scan reviewed 2026-09-17: only copyleft entry is Next.js's optional sharp/libvips, unused and documented in DISCLOSURES.md
- [x] Live URL: automated full-story walkthrough passed on production 2026-09-17 (real model pages, typed fallback). Manual mic run-through: pending (Diógenes)
- [ ] LinkedIn Nerdy end date updated to May 2026
- [x] Vercel env has GOOGLE_GENERATIVE_AI_API_KEY (unused OpenRouter key removed); `.env` model chain committed
