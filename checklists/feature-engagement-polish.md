# Feature: Engagement Polish (Scoreboard Push + Confetti)

## Status

- Version target: 0.12.0
- Started: 2026-09-18
- Completed: 2026-09-18

## Tasks

- [x] Create checklist for engagement polish.
- [x] Shared scoreboard schemas (per-quiz participant + group scores).
- [x] Scoreboard service computing quiz-level totals.
- [x] Broadcast scoreboard updates over Socket.io after every new response.
- [x] Public scoreboard endpoint for PlayPage.
- [x] LiveDisplayPage: live scoreboard panel that updates with every submission.
- [x] PlayPage: confetti burst on correct answers and visible score feedback.
- [x] Tests for scoreboard service and broadcast wiring.
- [x] Builds/tests green; bump to 0.12.0 and changelog.

## Notes

Deliver engagement improvements without touching marking logic. Scoreboard covers both individual and group modes.
