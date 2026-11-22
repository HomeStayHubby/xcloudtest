# Feature: Live Quiz Pacing

## Status

- Version target: 0.11.0
- Started: 2026-09-18
- Completed: 2026-09-18

## Tasks

- [x] Create checklist.
- [x] Shared schema: quiz settings `paced` flag.
- [x] Pacing service per quiz (in-memory, per-process current question index).
- [x] Instructor endpoint `POST /quizzes/:id/pacing/goto` (auth) that broadcasts `question-change` over Socket.io.
- [x] Public endpoint `GET /play/quiz/:quizId/state` for late joiners.
- [x] Randomization disabled when pacing is enabled (so instructor control stays consistent).
- [x] LiveDisplayPage: teacher prev/next controls when quiz is paced.
- [x] PlayPage: follow instructor pacing via socket; wait state when paced.
- [x] Tests.
- [x] Bump version to 0.11.0.

## Notes

Pacing is per-process; a server restart resets to the first question. A later feature could persist pacing state.
