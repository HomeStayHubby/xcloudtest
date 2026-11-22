# Bugfix: Open Quiz From Session Page + Student Auto-Refresh

## Status

- Version target: 0.15.3
- Started: 2026-09-28
- Completed: 2026-09-28

## Tasks

- [x] Create checklist.
- [x] `QuizRunPage`: "Open Quiz" button when the quiz is draft/closed (Close when open).
- [x] `QuizRunPage`: prominent warning banner when the quiz is not open.
- [x] `PlayPage`: poll open quizzes every 5s while the student is on the quiz picker.
- [x] `PlayPage`: clear the "no open quizzes" message automatically when a quiz appears; friendlier waiting text.
- [x] Build/tests green.

## Notes

Root cause: the session (Run) page had no way to open a quiz — only the quiz list did. An instructor could land on the session page with a draft quiz and see the full session UI (join code, pacing, questions) while students saw "No open quizzes for this class right now." because the quiz status was still draft. Additionally, PlayPage fetched open quizzes only once, so students who joined before the quiz was opened were stuck until manual refresh.
