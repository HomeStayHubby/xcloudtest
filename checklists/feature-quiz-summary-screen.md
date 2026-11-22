# Feature: Student post-quiz summary screen

## Status

- Version target: 0.29.0
- Started: 2026-10-30
- Completed: 2026-10-30

## Tasks

- [x] Add `reveal_answers_in_summary` quiz setting (shared schema, default true)
- [x] Add shared `myQuizResults` Zod schema
- [x] Backend: `GET /api/v1/play/quiz/:quizId/my-results` (student access-checked)
- [x] Backend: broadcast `quiz-closed` socket event when quiz status → closed
- [x] Client: `QuizSummary` component (total, per-question review, badges)
- [x] Client: PlayPage summary phase (unpaced: after last answer; paced: on quiz-closed)
- [x] Client: quiz editor checkbox for `reveal_answers_in_summary`
- [x] Server tests: access control, reveal flag, group mode, pending grading
- [x] Run tests, lint, typecheck
- [x] Version bump

## Notes

- Summary shows in-session (PlayPage state); closed-quiz re-entry from picker is out of scope.
- `word_cloud` / `brainstorming` show "Pending grading" until manually scored.
- Correct answers only included when `reveal_answers_in_summary` is on; correctness badges still show.
- Also fixed a pre-existing flake: `static-assets.test.ts` hung in `afterAll` on undici keep-alive sockets; now calls `server.closeAllConnections()` before `server.close()`.
- New files: `shared/src/schemas/my-results.schema.ts`, `server/src/features/play/my-results.service.ts`, `server/src/features/play/my-results.test.ts`, `client/src/components/QuizSummary.tsx`.
