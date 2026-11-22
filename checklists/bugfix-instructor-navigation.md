# Bugfix: Instructor Navigation Dead-End

## Status

- Version target: 0.15.1
- Started: 2026-09-28
- Completed: 2026-09-28

## Tasks

- [x] Create checklist.
- [x] Add "Back to dashboard" link to `QuizzesPage` (was a dead end).
- [x] Instructor-aware header in `App.tsx`: Dashboard link and Logout button when logged in; logo links to dashboard for instructors.
- [x] Header layout CSS in `styles/global.css`.
- [x] Builds green.

## Notes

Root cause: `QuizzesPage` never got a back link, and every quiz subpage (Edit/Run/Results) links back only to `/quizzes`, so instructors could not reach the dashboard via the UI. There was also no logout control anywhere. The header now checks the instructor session (`GET /auth/me`) on each route change; students never see instructor links.
