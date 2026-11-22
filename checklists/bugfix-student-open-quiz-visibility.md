# Bugfix: Student "Failed to Load Quiz" (Open Quiz Visibility)

## Status

- Version target: 0.15.1
- Started: 2026-09-28
- Completed: 2026-09-28

## Tasks

- [x] Create checklist.
- [x] `QuizzesPage`: required class dropdown in Create Quiz form; sends `class_id`.
- [x] `QuizzesPage`: show each quiz's assigned class (or "Unassigned") in the list.
- [x] `QuizEditPage`: class dropdown in quiz settings form so existing quizzes can be assigned/reassigned.
- [x] Server: case-insensitive class code lookup (`getClassByCode`, `listOpenQuizzesByClassCode`).
- [x] `PlayPage`: surface server error message when open-quiz fetch fails.
- [x] Server tests: case-insensitive code lookup; open-quiz listing includes assigned open quizzes and excludes unassigned/closed.
- [x] Isolate test database (`server/vitest.config.ts` sets `DATABASE_URL` to `data/elitequest.test.db`) so test suites never wipe the real database.
- [x] Tests/builds green.

## Notes

Root cause: quizzes were created without a `class_id` (the UI never sent one, though the API and DB support it). `listOpenQuizzesByClassCode` INNER JOINs quizzes to classes, so unassigned open quizzes were invisible to students, who saw "No open quizzes for this class right now." after joining. Existing unassigned quizzes can be repaired via the new class dropdown on the quiz edit page — no SQL needed.
