# Feature: Multi-file uploads for AI question generation

## Status

- Version target: 0.30.0
- Started: 2026-11-02
- Completed: 2026-11-02

## Tasks

- [x] Create `client/src/lib/materialText.ts` with `buildMaterialText` (merge sources into a single `material_text` under the 100,000-char budget, per-file inclusion report) and `lastSentences` (last-included content preview)
- [x] Create `client/src/lib/materialText.test.ts` unit tests (merge order, budget math, word-boundary cut, not-included status, sentence extraction)
- [x] Update `client/src/pages/AiGeneratePage.tsx`: `multiple` file input, per-file list state with extract status, remove buttons, merged text on generate
- [x] Show per-file inclusion badges (fully included / partially included / not included) and a warning block listing which files were trimmed, with the last 3 included sentences for truncated files
- [x] Keep the textarea as an optional "Pasted notes" section included in the merge
- [x] Run client tests, root lint, and typecheck/build
- [x] Version bump (`npm run version:feat`) and changelog review

## Notes

- Server needs no changes: `POST /api/v1/ai/extract-material` is stateless and per-file; the client calls it once per file.
- Two truncation sources stay distinct: server-side per-file extraction cap (`ExtractedMaterial.truncated`) vs. the client-side combined 100,000-char merge budget.
- Warn + truncate was chosen over blocking generation; "until where" is reported as the last 3 included sentences per truncated file.
- The merge is a pure function of current state, computed live — badges and warnings can never go stale.
- Verification: client tests 23/23 (15 new), shared 9/9, server 149/149; root `npm run build` passes (dist refreshed for the no-build-on-VPS deploy).
- Lint shows only pre-existing repo-wide errors; the three touched/added client files are lint-clean.
