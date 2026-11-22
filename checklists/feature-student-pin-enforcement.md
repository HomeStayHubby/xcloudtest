# Feature: Student PIN Enforcement

## Status

- Version target: 0.10.0
- Started: 2026-09-18
- Completed: 2026-09-18

## Tasks

- [x] Create checklist.
- [x] Migration 003: `classes.require_pin` column (default 0).
- [x] Shared class schema: `require_pin` flag.
- [x] Class service: create/update persist `require_pin`.
- [x] Join flow: PIN required when class enables it; validate existing student PINs; persist PIN on first join.
- [x] UI: require-PIN checkbox on create-class form and class detail page toggle.
- [x] Tests: join rejected without PIN; correct PIN joins; wrong PIN rejected.
- [x] Builds/tests green; bump to 0.10.0 and changelog.

## Notes

This lets instructors optionally require a per-student PIN when students join classes, useful in public spaces like projectors or hallways.
