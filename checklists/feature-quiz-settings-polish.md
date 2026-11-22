# Feature: Quiz Settings Polish

## Status

- Version target: 0.9.0
- Started: 2026-09-18
- Completed: 2026-09-18

## Tasks

- [x] Create checklist.
- [x] Add `time_limit_seconds` to question schema + migration 002.
- [x] Public student endpoint for questions with answer sanitization.
- [x] Question randomization when quiz `settings.randomize_questions` is true.
- [x] Wire `time_limit_seconds` through question create/update service.
- [x] QuizEditPage: quiz settings editor (randomize, quiz time limit, show answers) + per-question time limit field.
- [x] PlayPage: use public endpoint, show question/quiz countdown timers, feedback when `show_answers` is enabled.
- [x] Backend tests for sanitization and time limits.
- [x] Builds/tests green.
- [x] Bump version to 0.9.0 and changelog.

## Notes

This feature also fixes a security issue: students previously fetched questions through instructor routes that exposed correct answers. The public play endpoint strips all correct-answer data and optionally shuffles question order.
