# Feature: Manual scoring for word_cloud and brainstorming submissions

## Status

- Version target: 0.24.0
- Started: 2026-10-30
- Completed: 2026-10-30

## Tasks

- [x] Server: `PATCH /api/v1/responses/:id/score` — grade a single submission (routes/controller/validators/service)
- [x] Server: `POST /api/v1/questions/:id/scores` — grade all submissions for a question (overwrites individual scores)
- [x] Server: ownership check (question -> quiz -> assertQuizOwner), `requireLecturer`, Zod `score: number().min(0)`
- [x] Server: restrict both endpoints to word_cloud/brainstorming questions
- [x] Server: broadcast scoreboard after updates
- [x] Client: `setResponseScore` / `setQuestionScores` API functions
- [x] Client: inline per-submission score input + bulk "Score All" control on `QuizResultsPage.tsx` for word_cloud/brainstorming rows
- [x] Client: strip `|upvotes` pipe suffix in brainstorming answer display
- [x] Server tests: single/bulk scoring, ownership, validation, type restriction, scoreboard totals, resubmission reset
- [x] Verify with `npm run build`, `npm run lint`, `npm test`
- [x] Version bump: `npm run version:feat -- --note "Manual scoring for word cloud and brainstorming submissions"`

## Notes

- `responses.score` (REAL, nullable) already existed — no migration needed. Manual scores automatically flow into the live scoreboard, campaign totals, quiz averages, and the XLSX export.
- While a quiz is open, students can resubmit word_cloud/brainstorming answers (delete + re-insert), which resets that row's score; this behavior is locked in by a test. Grades are stable once the quiz is closed.
- Auto-scored question types cannot be manually overridden (rejected with a 400).
- "Score All" overwrites individual scores for that question; the count of updated submissions is confirmed in the UI notice.
- Brainstorming answers store upvotes inline as `"idea|count"`; the results page now strips the suffix for display only.
- Verification: build, typecheck, and all 118 tests (112 + 6 new) pass.
