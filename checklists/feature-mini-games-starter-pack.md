# Feature: Mini-Games Starter Pack

## Status

- Version target: 0.13.0
- Started: 2026-09-18
- Completed: 2026-09-18

## Tasks

- [x] Create checklist.
- [x] Migration 004 for `games` table; shared schemas for game configs (wheel, jeopardy).
- [x] Games service: CRUD per class.
- [x] Wheel of Fortune: weighted spin endpoint, broadcast `game-spin` over Socket.io.
- [x] Jeopardy board: config with categories, cells (prompt + points), UI to reveal prompts.
- [x] Sprint mode: quiz setting adds time bonus to fast correct answers in paced quizzes.
- [x] Frontend: games management page per class; wheel UI with animation; jeopardy board UI.
- [x] PlayPage and LiveDisplayPage show game spin results.
- [x] Tests + builds green.
- [x] Bump version to 0.13.0.

## Notes

Wheel config and jeopardy config are reusable per class. Sprint mode applies speed bonuses when a paced question's timer is running. Jeopardy cells reveal manual prompts; in a later pass they can link to automarked quiz questions.
