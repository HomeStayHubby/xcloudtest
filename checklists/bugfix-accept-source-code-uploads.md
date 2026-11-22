# Bugfix: Accept any text/source-code file in AI material upload

## Status

- Version target: 0.30.1
- Started: 2026-11-02
- Completed: 2026-11-02

## Tasks

- [x] Relax filename whitelist in `ai-generation.schema.ts` (any name, optional extension)
- [x] Treat all non-binary uploads as UTF-8 text in `ai-generation.service.ts` (no extension whitelist)
- [x] Add binary sniff (NUL bytes / U+FFFD ratio) with a clear error message
- [x] Add xlsx/xls extraction via the existing SheetJS dependency
- [x] Remove frontend `accept` filter and update helper copy in `AiGeneratePage.tsx`
- [x] Update service tests (source-code files, extensionless files, binary rejection, xlsx extraction)
- [x] `npm test` passes (151 tests, shared + server)
- [x] Version bump with `npm run version:fix` → 0.30.1

## Notes

- Uploads stay in-memory only (FERPA-friendly); the endpoint is lecturer-only and the 10 MB `express.raw` cap is unchanged.
- Binary formats pdf/docx/pptx keep their dedicated parsers; xlsx/xls is parsed with SheetJS (already a dependency for roster import).
- Legacy binary formats that are not recognized (e.g. Word 97 `.doc`, `.zip`, images) are rejected by the binary sniff with a clear message instead of sending garbage to the AI.
- UTF-16 "Unicode" text files (NUL bytes) are now rejected with the binary message — previously they silently produced mojibake.
