# Bugfix: Delete requests fail with "Unexpected end of JSON input"

## Status

- Version target: 0.28.2 (shipped)
- Started: 2026-10-30
- Completed: 2026-10-30

## Tasks

- [x] Reproduce: deleting a question from a quiz throws JSON parse error in client
- [x] Root cause: server responds `204 No Content` (empty body) for deletes; `client/src/api/client.ts` unconditionally called `response.json()`
- [x] Fix: read response as text, parse JSON only when body is non-empty, treat empty body as `{ data: null }`
- [x] Confirm all delete endpoints (quizzes, questions, groups, classes, banks, campaigns, games) return 204 and now resolve as `void`
- [x] Typecheck/build client passes
- [x] Server tests pass

## Notes

- Affected all DELETE endpoints, not just questions — any successful delete surfaced the same client error.
- Fixed on the client side only; server `204` behavior is correct REST practice.
