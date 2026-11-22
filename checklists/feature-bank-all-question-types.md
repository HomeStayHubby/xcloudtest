# Feature: Question bank form supports all 8 question types

## Status

- Version target: 0.23.0
- Started: 2026-10-30
- Completed: 2026-10-30

## Tasks

- [x] Extract `QUESTION_TYPES`, `generateId()`, and the 8 per-type editor components from `QuizEditPage.tsx` into `client/src/components/questionEditors.tsx`
- [x] Add `useQuestionEditor()` hook (type/prompt/per-type state, `populate`, `reset`, `buildData`) and `<QuestionTypeFields>` component
- [x] Refactor `QuizEditPage.tsx` to consume the shared hook/component
- [x] Update `BankDetailPage.tsx` "Add Question" form to offer all 8 types via `<QuestionTypeFields>`; remove the 3-type restriction and explanatory note
- [x] Verify with `npm run build`, `npm run lint`, `npm test`
- [x] Version bump: `npm run version:feat -- --note "Question bank form supports all 8 question types"`

## Notes

- Nothing was removed from the type system — the bank form had intentionally hardcoded 3 simple types (mcq_single, mcq_multi, short_answer). Instructors authoring via Question Banks only ever saw those 3; the quiz editor always had all 8.
- word_cloud/brainstorming are unscored live types (0 points); they author fine in banks and insert into quizzes correctly. They can now also be scored manually (see feature-manual-scoring-live-types.md).
- The bank form keeps its `answer_mode: 'individual'` default; the prompt input became a textarea to match the quiz editor.
- QuizEditPage shrank from ~1350 to ~580 lines; the per-type editors, state handling (`populate`/`reset`/`buildData`), and type dropdown now live in one shared module used by both pages.
- Verification: build, typecheck, and all 112 tests pass. Lint on touched files is clean apart from repo-wide pre-existing patterns (async route handlers, useEffect calls).
