# Bugfix: Student Play Routes Blocked by Auth Wall

## Status

- Version target: 0.15.2
- Started: 2026-09-28
- Completed: 2026-09-28

## Tasks

- [x] Create checklist.
- [x] Reorder route mounts in `server/src/index.ts` so public student routers (`playRoutes`, `pacingRoutes`, `responseRoutes`) mount before routers with router-level `requireAuth`.
- [x] Guard `main()` so importing the app in tests does not bind a port.
- [x] Integration test: student endpoints reachable with no session; instructor routes still 401 without a session.
- [x] Tests/builds green.

## Notes

Root cause: `studentRoutes` is mounted at the bare `/api/v1` prefix with router-level `requireAuth`. Every `/api/v1/*` request not already handled flows through it; for students (no instructor session) `requireAuth` calls `next(err)`, which aborts routing entirely — so the public play/pacing/response routers mounted below were never consulted. Students got 401 "Login required" (previously masked client-side as "Failed to load quizzes"). The bug was invisible whenever the testing browser also held an instructor session.
