# Feature: Student table with sorting, filtering, bulk actions

## Status

- Version target: 0.22.0
- Started: 2026-10-30
- Completed: 2026-10-30

## Tasks

- [x] Shared: `bulkStudentActionSchema` (ids 1-500, action activate/deactivate/delete) + result schema
- [x] Server: `POST /api/v1/classes/:id/students/bulk` route + controller
- [x] Server: `bulkStudentAction` service (advisor-only, one UPDATE/DELETE scoped by class_id)
- [x] Server tests: bulk happy paths, cross-class id rejection, non-advisor 403
- [x] Client: `bulkStudentAction` API function
- [x] Client: `StudentTable` component — checkbox selection, select-all, sortable headers, search filter, status filter
- [x] Client: bulk toolbar (Activate / Deactivate / Delete with confirm / Clear) shown when rows selected
- [x] Client: inline row editing (Edit turns row into inputs + Save/Cancel)
- [x] Client: non-advisor read-only view (no checkboxes/actions)
- [x] Replace card list in ClassDetailPage with StudentTable
- [x] CSS: minor additions (sortable header cursor, bulk bar) reusing `.data-table`
- [x] Run npm test, builds, lint
- [x] Version bump `version:feat` (0.22.0)

## Notes

- Bulk endpoint scopes every statement by `class_id` and `role='student'`; ids from other classes are reported as per-id errors, never touched.
- Client-side sorting/filtering is fine at roster scale; server list stays unchanged.
- Bulk counts come from the verified id set (SELECT before acting) since `runAsync` returns void.
