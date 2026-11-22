# Feature: Class Session Page (Run a Class In-Class Activity)

## Status

- Version target: 0.14.0
- Started: 2026-09-18
- Completed: 2026-09-18

## Tasks

- [x] Create checklist.
- [x] Create `QuizRunPage` at `/quizzes/:id/run` that combines question display, pacing controls, live aggregation (word cloud / brainstorm), live scoreboard, join info for students, and response counts.
- [x] Refresh per-question response counts and aggregations when `scoreboard-update` events arrive.
- [x] Show per-question correct rate and response count on the session page.
- [x] Move the `Live` button from Quizzes list to `Run` linking to the session page.
- [x] Allow closing the quiz from the session page.
- [x] Builds/tests green.
- [x] Bump version to 0.14.0 and changelog.

## Notes

This replaces the older `LiveDisplayPage` with a combined in-class session experience — every feature needed to host a quiz live in one view.
