# Bugfix: Blank Run button + partial-credit checkbox spacing

## Status

- Version target: 0.25.1
- Started: 2026-10-30
- Completed: 2026-10-30

## Tasks

- [x] Add `color: #fff` to `button.success, .button.success` (global.css) so the `.success` text-utility class can't override white text on green buttons
- [x] Move "Allow partial credit" checkbox below the "Add Option" button (McqMultiEditor, questionEditors.tsx)
- [x] Rebuild client (tsc + vite), run client tests
- [x] Lint touched files — no new issues
- [x] Version bump `npm run version:fix`

## Notes

- The blank Run button was a pre-existing CSS collision, not caused by the 0.25.0 feature: `<a className="button success">` inherited `color: var(--color-success)` (green) from the `.success { color: ... }` message utility (same specificity, later in file) and rendered green-on-green. Affected every `.button.success` / `button.success` app-wide (quiz list Run, campaign Run).
- The checkbox spacing issue: the inline-flex checkbox label flowed onto the same line as the inline-flex "Add Option" button; `marginTop` never created vertical separation. Wrapped in a div so it sits on its own line.
