# Demo video — shot list (target 2:45, hard cap 3:00)

Record in Chrome at 1280×800 or larger, mic allowed, on https://readalong-ten.vercel.app.
**Use the Mac's built-in microphone, not AirPods** — Bluetooth mics drop to phone-quality audio.
Screen recording + your voice only (terms: nobody else on camera or audio). QuickTime or Loom.
Do one dry run first so the story you record is a good one.

Before recording: clear "Recent stories" by opening DevTools → Application → Local Storage → delete
`readalong:sessions:v1` (or use a fresh Chrome profile). Close other tabs. Turn off notifications.

| Time | On screen | Say (roughly) |
|---|---|---|
| 0:00–0:20 | Home page, cursor still | "Oral reading fluency is the best early predictor of reading comprehension, and you build it one way: reading aloud at the right level while someone listens. The listener is the bottleneck. Readalong is the listener." |
| 0:20–0:35 | Click Whispering Forest, Grade 1, Start. Page 1 appears instantly with the scene art. | "Pick a world and a starting grade. The story is written one page at a time at one of six reading levels." |
| 0:35–1:00 | Start reading. Read page 1 aloud at a child's pace, clearly. Words light up green. Click I'm done. | Don't narrate over your own reading. After: "The browser hears every word and scores it. Nothing leaves the device." |
| 1:00–1:15 | Result card (should be independent-level → confetti). Point at words-right and WCPM. Click Next. | "Above 95% accuracy is independent level, so the next page steps up. That's the same Betts rule schools use in reading inventories." |
| 1:15–1:30 | Question → answer → vocab card → tap the word to hear it → choice card, pick one. | "One comprehension question, one vocabulary word with a kid-sized definition, and the child chooses what happens next." |
| 1:30–1:55 | Page 2 loads with a new scene. Read it deliberately worse: skip three or four words. Result shows frustration message and missed words; tap one to hear it. Click Read it again, read it well, show the WCPM gain. | "When a page is too hard, the app says so kindly and eases off. Read it again turns the page into repeated-reading practice and shows the gain." |
| 1:55–2:10 | Click through pages 3–5 quickly (you can cut here in editing). Ending screen. | "Five pages, adapting after each one." |
| 2:10–2:35 | Report page: scroll slowly past the tiles, fluency chart with the norm line, level path, words to practise. | "The report is what a reading specialist would write: fluency against Hasbrouck–Tindal grade norms, the level path the story took, and the exact words to practise, each one tap-to-hear." |
| 2:35–2:55 | Quick cut to the README architecture block or the `/scenes` gallery. | "Built solo in three days: Next.js, the Vercel AI SDK, Gemini with structured output, and hand-drawn SVG scenes the model tags per page. It runs on the free tier by rotating models and caching openings." |
| 2:55–3:00 | Home page with URL visible. | "Readalong. Live at readalong-ten.vercel.app." |

## Tips

- Read at a real Grade 1 pace: slow, word by word. Fast adult reading can make recognition drop words.
- If a page takes more than 10 seconds to load, cut that wait in editing; it's a free-tier hiccup, not the product.
- Keep the cursor still while talking. Move it only to point at something.
- Export at 1080p. Upload unlisted to YouTube; paste the link in the submission form.

## Editing cuts that keep it under 3:00

1. Trim the wait between clicking I'm done and the result card.
2. Speed up pages 3–5 to 4x with music, or cut to the ending directly.
3. If over time, drop the architecture shot; the README covers it.

## Narration script (read this; ~2:45 with the two read-aloud pauses)

**0:00 · Home page, cursor still**
"Oral reading fluency is the best early predictor of how well a child will read. And it's built one way: reading out loud, at the right level, with someone listening. The listener is the bottleneck. Readalong is a picture book that listens."

**0:20 · Click Whispering Forest, Grade 1, Start**
"Pick a world and a starting grade. Every page is written on the spot, at one of six reading levels, and every page gets a scene."

**0:35 · Tap Start reading, wait for the green Go**
(Read page 1 aloud, slowly, like a first grader. Tap I'm done. Pause a second so "Checking your reading…" is visible.)

**1:00 · Result card**
"While I read, the browser lit up each word. When I finished, the recording was transcribed and scored word by word. Ninety-five percent or better is independent level, so the next page steps up. That's the same rule schools use in reading inventories."

**1:15 · Question, vocab, choice**
"One comprehension question. One new word, with a kid-sized definition I can tap to hear. And the child chooses what happens next."

**1:30 · Page 2 loads with a new scene**
(Read it deliberately badly: skip three or four words. Tap I'm done.)
"When a page is too hard, the app says so kindly, shows the words to practise, and eases off. Read it again turns the page into repeated-reading practice…"
(Tap Read it again, read it well, tap I'm done.)
"…and shows the gain."

**1:55 · Click through to the ending**
"Five pages, adapting after every one."

**2:10 · Report page, scroll slowly**
"This is the report a reading specialist would write. Fluency against grade-level norms. The level path the story took. Comprehension. And the exact words to work on, each one tap-to-hear."

**2:35 · Cut to the README or the /scenes gallery**
"Built solo in three days: Next.js, the Vercel AI SDK, Gemini for the story and the transcription, and hand-drawn scenes the model tags per page. It runs on the free tier by rotating models and caching openings."

**2:52 · Home page with the URL visible**
"Readalong. Live at readalong dash ten dot vercel dot app."
