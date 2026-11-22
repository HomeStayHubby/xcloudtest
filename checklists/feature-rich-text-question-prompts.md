# Feature: Rich text (Markdown) for question prompts + multi-line MCQ options

## Status

- Version target: 0.25.0
- Started: 2026-10-30
- Completed: 2026-10-30

## Tasks

- [x] Install client deps: markdown-it, dompurify, @types/markdown-it
- [x] Create `client/src/lib/markdown.ts` (renderMarkdown: markdown-it html:false + DOMPurify)
- [x] Create `client/src/lib/markdown.test.ts` (paragraphs, breaks, code, XSS escaping, legacy plain text)
- [x] Create `client/src/components/MarkdownText.tsx`
- [x] Create `client/src/components/MarkdownEditor.tsx` + `MarkdownEditor.module.css` (toolbar, cheat sheet, preview)
- [x] Wire `MarkdownEditor` into `questionEditors.tsx` prompt (all 8 types)
- [x] MCQ single/multi option inputs -> multi-line textareas
- [x] Render prompt via `MarkdownText`: PlayPage, QuizRunPage, LiveDisplayPage, GamePlayPage, QuizResultsPage, QuizEditPage list, BankDetailPage list
- [x] OptionCards option text: `white-space: pre-wrap`
- [x] Add `.rich-text` styles to global.css
- [x] Shared schema: prompt `.max(20000)` (markdown comment), option text `.max(2000)`
- [x] Run tests (root + client), build, lint
- [x] Version bump `npm run version:feat`

## Verification

- shared: `tsc` build + 9 tests pass
- client: vitest 8 tests pass (7 new markdown tests), `tsc && vite build` passes
- server: 112 tests pass (18 files) against isolated test DB
- lint: no new error classes; repo-wide pre-existing baseline unchanged (CSS-module type resolution affects existing components identically)

## Notes

- Markdown stored raw in existing TEXT columns; converted to sanitized HTML only at render time. No DB migration.
- Student-typed answers stay single-line (per decision).
- Legacy plain-text prompts render essentially unchanged (`breaks: true`).
- XSS defense in depth: markdown-it `html:false` escapes raw HTML; DOMPurify sanitizes output; only lecturers author content.
