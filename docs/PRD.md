# Readalong — Product Requirements Document

| | |
|---|---|
| **Product** | Readalong: adaptive read-aloud story game for K–3 readers |
| **Author** | Diógenes Zilli |
| **Status** | v1.0 — hackathon build (Nerdy AI Hackathon Challenge, Prompt 03: English Reading Game) |
| **Date** | September 17, 2026 |
| **Live** | https://readalong-ten.vercel.app · repo: github.com/diogeneszilli/readalong |

## 1. Problem

Oral reading fluency (reading connected text accurately, at a reasonable pace, with expression) is
the strongest early predictor of reading comprehension. It is built the same way every time: a
child reads aloud, at a level that is challenging but not frustrating, while someone listens,
catches the misreads, and keeps the text at the right level.

The bottleneck is the listener. A parent or tutor cannot sit through twenty minutes of read-aloud
every day, and a classroom teacher cannot do it for twenty-five children. So most K–3 readers get a
fraction of the fluency practice they need, and the adults around them have no reliable picture of
how the child is actually reading.

## 2. Product vision

Readalong is the patient listener. It generates a story the child wants to read, listens while they
read it aloud, scores every word, keeps the next page at the child's instructional level, and hands
the adult a specialist-grade report. No sign-up, no adult in the loop during practice, nothing
leaves the device except story text.

## 3. Users

| User | Needs | How Readalong serves them |
|---|---|---|
| **Child, K–3 (ages 5–9)** | A story worth reading, immediate feedback that feels like encouragement, control over what happens next, no reading level that feels impossible | Branching story with a hero and choices; live word highlighting; result screen that celebrates or reassures; text that adapts after every page |
| **Parent** | Daily practice without supervising it; knowing whether the child is on track | Child can run it alone in a browser; report shows accuracy, fluency vs grade norms, and words to practise |
| **Tutor / teacher** | Objective placement and progress data; something to assign between sessions | Betts-based level placement per page, WCPM against Hasbrouck–Tindal norms, level path across the story, re-read gains |

## 4. Goals and non-goals

**Goals (v1)**

1. A child can complete a 5-page story alone in a browser in under 15 minutes.
2. Every page is written at one of six defined reading levels, and the level moves after every page
   based on measured accuracy.
3. Reading is scored per word, live, in the browser, with accuracy and WCPM computed locally.
4. The adult report is meaningful to a reading specialist without explanation.
5. Runs on a free-tier LLM budget and degrades gracefully when the model is unavailable.

**Non-goals (v1)**

- Accounts, classrooms, multi-child households, cloud sync.
- Languages other than English.
- Phonics instruction, decoding lessons, or writing.
- Native mobile apps.
- Assessment-grade reliability of WCPM (browser speech recognition is not a proctored test).
- Per-moment AI-generated illustrations (no free-tier image model). v1 uses a fixed pool of
  in-repo scenes instead — see FR-29.

## 5. User stories

- As a child, I pick a world and start reading with one tap, so I don't need a grown-up to set it up.
- As a child, I see words light up as I read, so I know the app is really listening.
- As a child, when I stumble I'm told the next page will be easier, not that I failed.
- As a child, I choose what happens next, so the story is mine.
- As a child, I can tap any word to hear it, and tap the vocab word to hear what it means.
- As a child, I can read a page again to beat my own speed.
- As a parent, I open the report and see in ten seconds whether reading went well.
- As a tutor, I see accuracy per page, the level path, and the exact words to work on.
- As a parent without Chrome or a microphone, I can type what the child read so we still get a report.

## 6. Functional requirements

### 6.1 Story setup
- FR-1 Three story worlds (Whispering Forest, Star Station, Coral Kingdom), each with a fixed hero.
- FR-2 Four starting grades (K, 1, 2, 3) mapped to internal levels 1, 2, 4, 5.
- FR-3 A story is 5 pages; the last page is an ending with no choices.

### 6.2 Story generation
- FR-4 Each page is generated as structured JSON: title, text, 1–2 target words with kid
  definitions, one 3-option comprehension question, 2 choices (0 on the last page), ending flag.
- FR-5 The generator receives: world, hero, target level spec (word count, max sentence length,
  phonics/sight-word constraints), the full story so far with choices taken, and the last read's
  accuracy and missed words, with an explicit instruction to go easier / hold / stretch.
- FR-6 Page 1 is served from a pre-generated cache per world × starting grade; pages 2–5 are live.
- FR-7 Content rules: third-person named hero, plain prose, no markdown/emoji, warm and safe,
  no requests for or mention of personal information.

### 6.3 Reading and scoring
- FR-8 Browser speech recognition (Web Speech API, continuous, interim results) produces a live
  transcript for word highlighting while the child reads; the session auto-restarts across
  Chrome's silence timeouts. Reading starts only after the recognizer confirms it is capturing
  ("Get ready… / Go!"), so the first words are not lost.
- FR-8b The read is recorded (16 kHz mono WAV). On "I'm done" the clip is transcribed server-side by
  Gemini (verbatim, lowercase, no corrections, hero names as hints) and that transcript is the one
  scored. If transcription is unavailable, the browser transcript is used. Rationale: browser
  recognition scored a clean adult read at 58–67%; Gemini transcribed a synthetic clip
  word-perfectly.
- FR-9 Words are aligned to the transcript with a longest-common-subsequence algorithm, spelling
  tolerance (1 edit on 4+ letters, 2 on 7+) and sound-alike tolerance (identical phonetic key, e.g.
  hat/head, there/their), producing per-word ok / close / missed.
- FR-10 Accuracy = (ok + close) / total words. WCPM = correct words / elapsed minutes.
- FR-11 Words highlight live; missed words are marked after the child finishes; any word is
  tap-to-hear via browser TTS.
- FR-12 Fallback: "no microphone? type it" lets an adult type the read for scoring.
- FR-13 "Read it to me first" reads the page aloud via TTS.

### 6.4 Adaptation
- FR-14 After each page, placement follows Betts criteria: ≥95% independent → level +1;
  90–94% instructional → hold; <90% frustration → level −1. Clamped to levels 1–6.
- FR-15 Placement uses the first cold read of a page, never a re-read.
- FR-16 Question type is literal at levels 1–3 and may be inferential at 4–6.

### 6.5 Between pages
- FR-17 Result card: placement-specific message, words right, WCPM, tap-to-hear missed words,
  Next and Read-it-again.
- FR-18 Re-read: same page, new timer; result shows WCPM gain over the first read.
- FR-19 Comprehension question with immediate green/red feedback; wrong answers reveal the right one.
- FR-20 Vocab card with word and definition, both tap-to-hear.
- FR-21 Choice card with two options; choice is recorded and shapes the next page.

### 6.6 Report
- FR-22 Summary tiles: words read, accuracy with placement label, average WCPM with grade norm,
  comprehension score and re-read count.
- FR-23 Fluency-by-page bar chart with the grade norm as a reference line.
- FR-24 Level path (e.g. L2 → L3 → L4 → L3 → L4).
- FR-25 Page-by-page table: level, accuracy, WCPM (with re-read gain), question result, choice.
- FR-26 Words to practise (deduplicated missed words) and new words learned, all tap-to-hear.
- FR-27 Home page lists recent stories with Continue / Report links.

### 6.7 Illustration
- FR-29 Each world has a pool of six hand-drawn SVG scenes (e.g. forest: clearing, log, stream,
  cave, meadow, owl's oak) and a hero character. The model tags every page with the closest scene
  id; the app renders that scene with the hero above the text. Invalid tags fall back to the
  world's default scene. Art is in-repo, license-free, instant, and identical across devices.
- FR-30 Home world cards and the ending screen reuse the same art. A `/scenes` page lists all
  scenes for review.

### 6.8 Persistence
- FR-28 Sessions and results are stored in `localStorage`, keyed by session id; a story can be
  resumed at the exact phase it was left.

## 7. Pedagogical requirements

| Requirement | Basis |
|---|---|
| Six-level text specification (word count, sentence length, phonics progression from CVC + pre-primer sight words to multisyllabic, figurative language) | Standard leveled-reader progressions for K–3 |
| Placement thresholds 95% / 90% | Betts (1946) informal reading inventory, still the default in school IRIs |
| WCPM norms: Grade 1 = 60, Grade 2 = 100, Grade 3 = 112 (spring, 50th percentile); K uses a 20 placeholder | Hasbrouck & Tindal (2017) |
| Repeated reading of the same passage | One of the best-evidenced fluency interventions (NRP 2000) |
| One comprehension question per page, literal → inferential | Keeps reading purposeful; avoids "barking at print" |
| Vocabulary in context with child-level definitions and pronunciation | Tier-2 vocabulary instruction practice |
| Encouraging, non-punitive feedback; frustration-level reads trigger easier text, not a "fail" | Motivation research on early readers |

## 8. Non-functional requirements

- **Privacy:** no accounts; no analytics; sessions in localStorage. The story API sees only story
  text, level constraints and aggregate scores. The transcription API receives the short clip of one
  page being read with no identifier attached and the app does not store it; a typed fallback
  needs no audio. No real student data used in development.
- **Safety:** no biometric or emotion inference; content constraints in the system prompt; only
  the author appears in demo media.
- **Performance:** page 1 instant (cache); pages 2–5 target < 6 s on Gemini Flash; UI transitions
  ≤ 250 ms.
- **Cost:** must run on Google AI Studio's free tier (5 req/min, 20 req/day per model). Achieved via
  model rotation with per-model cooldowns, cached openings, and low-thinking generation. A story
  costs 4 page requests + up to 5 transcription requests (+ re-reads); five models × 20/day ≈ 10
  stories/day.
- **Resilience:** quota/demand errors show a friendly countdown and auto-retry; every model failing
  yields a clear message, never a blank page.
- **Compatibility:** Chrome desktop/Android for speech; all browsers for the typed fallback and
  report. Responsive to 400 px.
- **Licensing:** MIT; no copyleft dependencies in the entry's code (see DISCLOSURES.md).

## 9. Success metrics

**Hackathon (v1)**
- Judges can follow a complete story → report flow in a ≤ 3-minute video.
- Live URL completes a 5-page story without manual intervention on the free tier.
- Prose lands on level: word count within ±20% and max sentence length within spec on ≥ 90% of pages.

**Product (if continued)**
- Median session ≥ 3 pages read aloud; ≥ 40% of sessions reach the report.
- Re-read used on ≥ 25% of frustration-level pages.
- Week-over-week WCPM improvement visible for returning readers.
- Parent report opened within 24 h of a session for ≥ 50% of sessions.

## 10. Scope by milestone

| Milestone | Included | Status |
|---|---|---|
| **M1 Core loop** (Tue) | Schema, prompts, leveling, alignment, speech wrapper, API route, all cards, report, localStorage | Done |
| **M2 Free-tier hardening** (Tue/Wed) | Model rotation + cooldowns, cached openings, mock mode, auto-retry UX, typed fallback | Done |
| **M3 Quality pass** (Wed) | Real-model story reviews at each level, prompt tuning, mobile polish, E2E walkthrough | In progress |
| **M4 Demo** (Thu–Fri) | Mic test, rough → final video, README/SUBMISSION/DISCLOSURES, public repo, submission | Planned |
| **M3b Scene art** (Wed) | 18 SVG scenes + 3 heroes, scene tagging in the prompt/schema, art on reading/ending/home | Done |
| **Stretch** | Supabase progress across devices with keep-alive; per-moment AI illustrations (needs paid image model); second world | If ahead |

## 11. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Free-tier quota exhausted or "high demand" during judging | Story stalls after page 1 | Rotation across 5 models; cached page 1; countdown auto-retry; video carries the demo; billing toggle removes the risk entirely |
| Speech recognition misreads a fluent child | Unfair frustration placement | Server transcription of the recorded audio (primary); sound-alike + spelling tolerance; start gate so first words aren't lost; re-read option; typed fallback |
| Model writes off-level prose | Child frustrated or bored | Explicit per-level spec in prompt; adaptation note with missed words; reviewed per level in M3 |
| Chrome-only speech | Some families excluded | Typed fallback; clear message naming Chrome |
| Eligibility (residency clause) | Entry disqualified | Entrant's decision to proceed under LATAM hiring; direct application track in parallel |

## 12. Open questions

1. Should placement require two consecutive independent reads before stepping up, to reduce
   bouncing (L3 → L4 → L3)? Current: one read.
2. Should WCPM from the typed fallback be hidden or labelled, since it measures typing speed?
3. Story length: 5 pages fits a demo; is 8–10 better for a real practice session?
4. Kindergarten norm: no published ORF norm exists; keep the placeholder or drop the reference line?
5. Animation: pages are static apart from word highlighting, card pop-ins and result confetti. Is a
   subtle hero idle animation worth the distraction risk for early readers?

## 13. Appendix: level specification (summary)

| Level | Grade | ~Words/page | Max sentence | Text constraints |
|---|---|---|---|---|
| 1 | K | 25 | 6 | CVC words, pre-primer sight words, heavy repetition |
| 2 | 1 early | 40 | 8 | Simple blends, primer sight words, simple past |
| 3 | 1 late | 55 | 10 | Digraphs, long vowels, a few two-syllable words, one line of dialogue |
| 4 | 2 | 75 | 12 | Suffixes, compounds, dialogue, feelings shown through action |
| 5 | 3 early | 95 | 14 | Multisyllabic words, vivid vocabulary inferable from context, a small problem |
| 6 | 3 late | 120 | 16 | Chapter-book prose, varied sentence length, sparing figurative language |
