# Feature: Quiz Builder & Engine

## Status

- Version target: 0.4.0
- Started: 2026-08-27
- Completed: 2026-08-27

## Tasks

- [x] Create feature checklist for quiz builder & engine.
- [x] Add `studentId` to session types and implement `/join` endpoint.
- [x] Update quiz/question JSON storage helpers and parse rows from SQLite.
- [x] Implement quiz CRUD backend with settings and open/close actions.
- [x] Implement question CRUD backend for all auto-marked and non-marked types.
- [x] Implement auto-marking engine for MCQ, short answer, fill blanks, matching, grouping.
- [x] Implement response submission endpoint and result aggregation.
- [x] Add backend tests for quizzes, questions, marking, and join flow.
- [x] Create frontend quiz list and builder pages.
- [x] Wire all routes into the server and bump version to 0.4.0.

## Notes

This feature wires up the core quiz engine. It assumes class/student management is already in place. Group answering and live Socket.io pacing will be handled in later features.
