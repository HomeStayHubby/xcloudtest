# Feature: Rename "Run" button to "Present"

## Status

- Version target: 0.27.0
- Started: 2026-10-30
- Completed: 2026-10-30

## Tasks

- [x] Create checklist.
- [x] Rename the quiz card button label "Run" to "Present" (QuizzesPage).
- [x] Rename the campaign playlist item button label "Run" to "Present" (CampaignDetailPage).
- [x] Keep route `/quizzes/:id/run`, `QuizRunPage` component name, and ClassDetailPage's "run campaigns/games" copy unchanged (internal identifiers, not user-visible).
- [x] Build green, lint baseline unchanged.

## Notes

"Run" sounded like it would start the quiz for students, but it only opens the
instructor's live session console (question display, live responses, scoreboard,
pacing). "Present" describes that console view; student visibility/answering
remains controlled exclusively by the quiz's Open/Close status, so no behavior
changed — only the label.
