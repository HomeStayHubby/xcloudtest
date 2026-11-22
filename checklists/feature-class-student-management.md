# Feature: Class & Student Management

## Status

- Version target: 0.3.0
- Started: 2026-08-25
- Completed: (in progress)

## Tasks

- [x] Create feature checklist for class & student management.
- [x] Add `requireAuth` middleware to protect instructor/admin routes.
- [x] Implement classes backend: create, list, read, update, delete, auto-generate class code.
- [x] Implement students backend: create, list, update, delete.
- [x] Implement XLSX student import (with duplicate detection per class).
- [x] Implement XLSX student export.
- [x] Add backend tests for class and student services.
- [x] Wire `/api/v1/classes` and `/api/v1/classes/:id/students` routes into the server.
- [x] Create admin client pages for classes and students.
- [x] Bump version to 0.3.0 and add changelog entry.

## Notes

Completed 2026-08-27.

## Notes

This feature covers admin/instructor manual roster management as well as spreadsheet import/export required by the user reqs.
