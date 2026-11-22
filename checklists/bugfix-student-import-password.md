# Bugfix: Student import password handling

## Status

- Version target: 0.21.1
- Started: 2026-10-30
- Completed: 2026-10-30

## Tasks

- [x] Diagnose: client crash "Cannot read properties of undefined (reading 'length')" — `importStudents` returns raw `{ data }` envelope
- [x] Diagnose: `min(4)` password schema rejected 4-char passwords that Excel stored as numbers (leading zero lost, e.g. `0123` -> `123`)
- [x] Diagnose: per-row import errors were never displayed in the UI
- [x] Unwrap `{ data }` envelope in `client/src/api/classes.ts:importStudents`
- [x] Show per-row import errors in ClassDetailPage
- [x] Relax password schema: 1-50 characters, any characters (symbols, emoji), UTF-8 byte guard <= 72 (bcrypt limit)
- [x] Blank xlsx password cell = no password until set (random unusable)
- [x] Server: read xlsx cells as formatted text (`raw: false`), normalize headers (case/spacing-insensitive)
- [x] Update UI password hints (Set Password prompt, Add Student placeholder, maxLength)
- [x] Update import card help text (headers, password rules, export always has empty password column)
- [x] Server tests: short/leading-zero/emoji/blank passwords, byte-guard rejection, login verification
- [x] Shared tests: new password bounds
- [x] Run npm test, builds, lint
- [x] Version bump `version:fix` (0.21.1)

## Notes

- Excel converts `0123` typed into a General-formatted cell to the number 123; the leading zero is unrecoverable. Advise formatting the password column as Text in Excel.
- Export XLSX always writes an empty password column (only hashes are stored) — this misled the reporter into thinking passwords were not imported.
- Login schema stays `min(1)`: blank passwords can never log in.
