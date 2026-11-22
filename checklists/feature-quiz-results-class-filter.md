# Feature: Per-class filtering on quiz results

## Status

- Version target: 0.26.0
- Started: 2026-10-30
- Completed: 2026-10-30

## Tasks

- [x] Create checklist.
- [x] Shared: extend results schema (`resultClassSchema`, `class_name` on response rows, `class_id` + `classes` on quiz results).
- [x] Backend: `getQuizResults(quizId, classId?)` filters responses by the responding student's class.
- [x] Backend: include released classes (id + name) in the results payload for the dropdown.
- [x] Backend: validate optional `?classId=` query param on results + export endpoints; export filename notes the class.
- [x] Backend: XLSX export includes a class column.
- [x] Backend tests: class filter, group-mode filter, class list with no responses, filtered export.
- [x] Frontend: class selector on QuizResultsPage (All classes default), export honors selection, scoring reloads keep selection.
- [x] Frontend: Class column in the responses table for the "All classes" view.
- [x] Builds/tests green (115/115 server tests, shared 9/9, build + lint baseline unchanged).

## Notes

A quiz can be released to many classes (`quiz_releases`), but results were scoped
only by quiz id, merging every class into one table. Responses always store the
submitting student and students only answer quizzes released to their class, so
the responding student's `users.class_id` reliably identifies a response's class —
no schema/migration changes needed. Group-mode rows are quiz-scoped groups but
still carry the responding student, so the same filter covers them.

Side fix: `scripts/version-bump.mjs` now tolerates CRLF line endings in
version.md (a Windows editor/git checkout had converted the file, which made
the bump script fail to find the Current Version block).
