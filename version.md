# ELITEQuest Version Log

Version format: `MajorVer.MinorVer.PatchNum`

## Version Bump Rules

1. `MajorVer` is incremented manually by the product owner only.
2. `MinorVer` is incremented for every new feature merged.
3. `PatchNum` is incremented for every bugfix merged.
4. Bump with the automated script (`scripts/version-bump.mjs`):
   - `npm run version:feat -- --note "Short summary"` for features.
   - `npm run version:fix -- --note "Short summary"` for bugfixes.
   - `npm run version:major -- --note "Summary"` for manual major bumps only.
5. The script syncs all workspace `package.json` files, `client/src/version.ts`, and this file's Current Version block + changelog.
6. The current version is recorded in the Current Version block below and in every `package.json`.

---

## Current Version

**0.30.3**

Bugfix: Harden DATABASE_URL handling: fail fast on managed-database connection strings (xCloud Postgres selection injects a postgres:// URL that sqlite3 cannot open) and log the resolved DB path on open errors

---

## Changelog

### 0.30.3 — Harden DATABASE_URL handling: fail fast on managed-database connection strings (xCloud Postgres selection injects a postgres:// URL that sqlite3 cannot open) and log the resolved DB path on open errors
- Bugfix: Harden DATABASE_URL handling: fail fast on managed-database connection strings (xCloud Postgres selection injects a postgres:// URL that sqlite3 cannot open) and log the resolved DB path on open errors.

### 0.30.2 — Rebuild for xCloud 3.0 panel: npm-start entry shim on injected PORT, workspace build script, opt-in PANEL_ASSET_REWRITE for panel nginx quirks, Docker + GHCR workflow for Custom Docker deploys, xCloud deployment docs
- Bugfix: Rebuild for xCloud 3.0 panel: npm-start entry shim on injected PORT, workspace build script, opt-in PANEL_ASSET_REWRITE for panel nginx quirks, Docker + GHCR workflow for Custom Docker deploys, xCloud deployment docs.

### 0.30.1 — Accept any text or source-code file in AI material upload; add xlsx extraction
- **No more extension whitelist**: The AI material upload (`POST /api/v1/ai/extract-material`) now accepts any text or source-code file (`.py`, `.dart`, `.java`, `.c`, …) plus extensionless files like `Makefile`. The filename regex accepts any name with an optional extension, and the service treats every non-recognized upload as UTF-8 text — no list to maintain when a new language or format comes along.
- **Binary content sniffing**: Files are no longer trusted by extension alone — the first 8 KB are checked for NUL bytes and invalid-UTF-8 (U+FFFD) density. Binary payloads (`.zip`, images, executables, Word 97 `.doc`) are rejected with a clear "appears to be binary, not text" message instead of sending garbage to the AI; UTF-16 "Unicode" text files are rejected the same way (previously they silently produced mojibake).
- **New xlsx/xls extraction**: Spreadsheets are parsed with the existing SheetJS dependency (already used by roster import) — one line per non-empty row, tab-separated cells, sheets in workbook order.
- **Frontend**: The file-picker `accept` filter was removed (all files selectable, server decides) and the helper text now mentions source-code files and `.xlsx`.
- **Tests**: New service tests for source-code/extensionless extraction, binary rejection (fake PNG + UTF-16), and xlsx extraction; the removed "unsupported file type" case was the old whitelist behavior.

### 0.30.0 — Allow multiple reference file uploads for AI question generation
- **Multi-file upload**: The "Generate Questions with AI" page now accepts several reference files at once (`.txt`, `.md`, `.pdf`, `.docx`, `.pptx`). Each upload is extracted through the existing per-file endpoint and appears in a reference-materials list with its character count and a Remove button; a failed extraction is reported per file without affecting the others.
- **Merged material**: On generate, all files are combined into one `material_text` with per-file section headers (`=== filename ===`), followed by the textarea's "Pasted notes" as an optional extra section — the AI sees clear file boundaries. Textarea text and uploaded files are no longer merged into one editable buffer (previously a second upload silently overwrote the first).
- **100,000-character budget with per-file report**: The combined content (all files + pasted notes, section headers included) fills a single 100,000-char budget in upload order. When it exceeds the limit, generation still proceeds with trimmed content and a warning block shows, per source: fully included / included X of Y chars / not included. For each truncated source it also shows the last 3 included sentences ("Cut off after: …"), falling back to the last lines for bullet-style content without sentence punctuation.
- **Per-file status badges**: Each file row keeps a live badge — Fully included (green), Partially included (amber), Not included (gray) — recomputed from current state, so editing or removing material updates statuses immediately.
- **Client-only change**: No server, schema, or API changes — the extraction endpoint was already stateless and per-file. New pure helpers `buildMaterialText`/`lastSentences` in `client/src/lib/materialText.ts` (15 unit tests).

### 0.29.0 — Student post-quiz summary screen with per-question review
- **Feature**: Students now see a summary screen after finishing a quiz instead of a bare "All done!" message — total score, points possible, correct/answered counts, and a per-question review (your answer, correctness badge, points earned).
- **Answer reveal setting**: New quiz setting `reveal_answers_in_summary` (default on) with a checkbox in the quiz editor; when on, the summary also shows the correct answer for each question.
- **Paced mode**: In instructor-paced quizzes the summary appears when the instructor ends (closes) the quiz, via a new `quiz-closed` socket broadcast; in self-paced mode it appears right after the last answer.
- **Backend**: New student endpoint `GET /api/v1/play/quiz/:quizId/my-results` (release-based access check, works while open or after close); group-mode questions show the group's response; word cloud / brainstorming show "Pending grading" until manually scored.
- **Test fix**: `static-assets.test.ts` no longer hangs in `afterAll` waiting on keep-alive sockets (`server.closeAllConnections()` is now called before `server.close()`).

### 0.28.2 — Fix JSON parse error when deleting questions from a quiz
- Bugfix: Fix JSON parse error when deleting questions from a quiz.

### 0.28.1 — Fix VPS build failure: exclude test files from production tsc builds, remove version-sensitive cast in AI generation test, remove stale test artifacts from committed dist, document no-build-on-VPS deploy rule
- **Why**: `npm run build` on the VPS failed in `ai-generation.service.test.ts` — the dev machine's TypeScript/vitest typings accepted a cast (`vi.fn(handler as typeof fetch)`) that the VPS's stricter typings rejected. The failing file was test-only; the committed runtime artifacts were never affected.
- **Test exclusion**: `src/**/*.test.ts` files are now excluded from the production `tsc` builds of all three workspaces (`server`, `shared`, `client`), so test-only code can never break a deploy build again. Vitest still compiles and runs all tests itself (full suite verified passing, 144 tests).
- **Cast removed**: the `stubFetch` mock helper in the AI generation test now types the fetch mock as returning `unknown`, which type-checks under any TypeScript/vitest version.
- **Stale artifacts**: previously committed `*.test.js` / `*.test.d.ts` files were removed from `server/dist` and `shared/dist` so committed build output matches what the build actually produces. Source maps were already gitignored.
- **Deployment docs**: `docs/DEPLOYMENT.md` §9 now states that no build step is needed on the VPS (never run `npm run build` there — it rewrites tracked `dist/` files and blocks future pulls) and notes `npm ci` for lockfile-drift recovery; §10 gained a troubleshooting row for `git pull` refusing due to local generated-file changes, with the exact discard/stash procedure.

### 0.28.0 — Groq-powered AI question generation from uploaded materials with Bloom's taxonomy levels and admin-managed API settings

**AI question generation (Groq)**
- Lecturers can generate quiz questions from study material: paste text or upload a .txt, .md, .pdf, .docx or .pptx file (extracted in memory, never stored), add optional instructions, and pick how many questions they want. The AI chooses the best question type per question from all 8 supported types (facts → MCQ/fill-blanks, terms → matching, categories → grouping, concepts → short answer, open engagement → word cloud/brainstorming) and returns candidates for review.
- Nothing is saved automatically: every generated question appears in a review list, can be edited with the existing per-type editors or discarded, and only approved questions are written to the quiz or question bank (entry points: "Generate with AI" on the quiz editor and bank detail pages).
- Invalid AI output is repaired automatically (one retry with the validation errors) and questions that still fail validation are dropped, with a warning explaining how many passed.

**Bloom's taxonomy**
- Questions gain an optional Bloom's level tag covering the first three levels of the revised taxonomy: Remember, Understand, Apply. The generator lets lecturers multi-select levels (none selected = AI decides per question) and tags every generated question; the review list shows the level per question.
- The level is stored on the question (nullable `bloom_level` column, migration `009`) and can also be set manually in every question editor, for quiz and bank questions alike.

**Admin-managed AI settings**
- Admins configure the Groq API key and default model in Dashboard → AI Settings instead of editing server config. The key is stored AES-256-GCM encrypted (key derived from `SESSION_SECRET`) and never shown again — only its last 4 characters. If the server secret changes, the UI flags the stored key as unreadable and asks for re-entry.
- Lecturers can override the model per generation run via a dropdown fetched live from the provider (falls back to the admin default, then to optional `GROQ_API_KEY`/`GROQ_MODEL` env vars as a bootstrap). Generation is rate-limited and lecturer-only.
- New tables/migrations: `app_settings` (migration `010`) for the encrypted key and default model.

### 0.27.0 — Rename Run button to Present
- The quiz card button (Quizzes page) and the playlist item button (campaign detail page) now read **Present** instead of Run. "Run" suggested it would start the quiz for students; the button actually opens the instructor's live session console (question display, live responses, scoreboard, pacing). "Present" describes that view.
- Label change only — no behavior change. Student visibility and answering are still controlled solely by the quiz's Open/Close status; the route (`/quizzes/:id/run`) and internal component names are unchanged.

### 0.26.0 — Per-class filtering on quiz results
- **Per-class results**: the quiz Results page now has a class selector (default "All classes"). A quiz released to several classes previously merged every class's responses into one undifferentiated table; results can now be filtered to a single class, and the XLSX export honors the selection (the filename notes the class). The responses table gains a Class column when viewing all classes, so mixed submissions are identifiable at a glance.
- **How scoping works**: every response stores the submitting student, and students can only answer quizzes released to their class, so the responding student's class identifies each response's class (group-mode included) — no database migration needed.
- **Tooling**: the version-bump script now tolerates CRLF line endings in version.md (a Windows editor/git checkout had converted the file, which made the bump script fail to find the Current Version block).

### 0.25.1 — Fix blank Run button and partial-credit checkbox spacing
- **Blank Run button**: green buttons rendered with no visible text — the `.success { color: var(--color-success) }` message-text utility overrode the white `color` from `.button` (same specificity, later in the stylesheet), producing green-on-green text on every `.button.success` link and `button.success` (quiz list Run, campaign Run). Fixed by adding `color: #fff` to the `button.success, .button.success` rule, which outranks the utility regardless of order.
- **Checkbox spacing**: in the MCQ (multi) editor, the inline-flex "Allow partial credit" label flowed onto the same line as the "Add Option" button (its `marginTop` never created vertical separation). The label now sits on its own line below the button.

### 0.25.0 — Markdown rich text for question prompts and multi-line MCQ options

**Markdown prompts for all question types**
- The question prompt editor now supports Markdown: multi-paragraph questions, bold/italic, lists, links, headings, and fenced code blocks that preserve lines and indentation exactly as typed (for code snippets, poems, structured work). The editor has a formatting toolbar, a collapsible cheat sheet, and a Preview toggle; the prompt field is labeled as Markdown-enabled.
- Prompts are stored as raw Markdown in the existing `TEXT` column (no migration) and rendered to sanitized HTML everywhere students or instructors see them: student PlayPage, instructor QuizRunPage, LiveDisplayPage, GamePlayPage (jeopardy reveal), QuizResultsPage, the quiz/bank question lists, and the editor preview. Legacy plain-text prompts render essentially unchanged.
- XSS safety in depth: markdown-it runs with `html: false` (raw HTML in the source is escaped) and output is sanitized with DOMPurify; only lecturers/admins author questions.

**Multi-line MCQ options**
- Multiple-choice (single and multi) option fields are now multi-line textareas instead of single-line inputs; option text wraps and preserves line breaks on the student's option cards. Options stay plain text (no Markdown), as decided.
- Shared schema guards: prompt max 20,000 chars, option text max 2,000 chars. Student-typed answers (short answer, word cloud) intentionally remain single-line inputs.

**New client modules**: `client/src/lib/markdown.ts` (`renderMarkdown`, 7 unit tests), `client/src/components/MarkdownText.tsx` (render), `client/src/components/MarkdownEditor.tsx` (editor with toolbar/cheat sheet/preview). New deps: `markdown-it`, `dompurify`.

### 0.24.0 — Manual scoring for word cloud and brainstorming submissions

**Manual grading on the quiz results page**
- Word Cloud and Brainstorming submissions were permanently unscored (`null`); instructors can now assign points on the quiz results page — per submission (inline score input in the All Responses table) or all at once ("Score All" column in the Question Summary table, which overwrites individual scores for that question).
- New endpoints: `PATCH /api/v1/responses/:id/score` (`{ score }`) and `POST /api/v1/questions/:id/scores` (`{ score }`) — lecturer-only with quiz ownership checks, Zod-validated `score >= 0`, restricted to word_cloud/brainstorming (auto-scored types cannot be overridden), and the live scoreboard is rebroadcast after every update.
- Manual scores flow everywhere automatically: live scoreboard, campaign totals, quiz averages, and the XLSX export — no migration needed (the nullable `responses.score` column already existed).
- Brainstorming answers store upvotes inline as `"idea|count"`; the results page now strips the suffix and shows idea text only.
- While the quiz is open, students can still change their submission (which resets that row's score); grades are stable once the quiz is closed. Covered by 6 new service tests (scoring, bulk totals, ownership, type restriction, resubmission reset, validation).

### 0.23.0 — Question bank form supports all 8 question types

**Question Banks: full type support**
- The "Add Question" form on the question bank page previously offered only mcq_single, mcq_multi, and short_answer; it now offers all 8 types (Fill in the Blanks, Matching, Grouping, Word Cloud, Brainstorming included). Server validation, grading, and student rendering already supported all 8 — this was purely an authoring-form restriction.
- New shared module `client/src/components/questionEditors.tsx`: `useQuestionEditor()` hook (type/prompt/per-type state with `populate`/`reset`/`buildData`), `<QuestionTypeFields>` component, and the 8 per-type editor components — now used by both the quiz editor and the bank form, removing ~800 lines of duplication from QuizEditPage.
- Bank form prompt is now a textarea (matching the quiz editor); bank questions keep their `individual` answer-mode default.

### 0.22.0 — Student roster table: sortable, filterable, bulk actions

**Student table (replaces the card list on the class page)**
- Sortable columns (name, username, student number, status, created), text search across name/username/student number, and an active/inactive status filter.
- Checkbox selection with select-all (indeterminate state) and a bulk toolbar: Activate, Deactivate, Delete (with confirm), Clear — advisors only; non-advisors see the same table read-only.
- Inline row editing: Edit turns the row into inputs (username, display name, student number) with Save/Cancel.
- New endpoint `POST /api/v1/classes/:id/students/bulk` (`{ ids, action }`): advisor-only, every statement scoped by `class_id` + `role='student'`; ids belonging to other classes are reported as per-id errors and never touched. Shared schemas `bulkStudentActionSchema` / `bulkStudentActionResultSchema`.

### 0.21.1 — Student XLSX import: crash fix, visible row errors, flexible password rules

- Fixed "Cannot read properties of undefined (reading 'length')": the import API client returned the raw `{ data }` envelope instead of unwrapping it, crashing the result handler before the roster refresh — imports actually succeeded server-side while the UI showed an error and stale data.
- Per-row import errors (e.g. password validation failures) are now listed under the import summary instead of being silently dropped.
- Password rules relaxed to **1-50 characters, any characters** (letters, digits, symbols, emoji). The old `min(4)` rule rejected 4-character passwords that Excel had converted to numbers (e.g. `0123` stored as `123`). A UTF-8 byte guard (72 bytes, bcrypt's limit) prevents silent truncation of long emoji passwords.
- Blank password cell = no password yet: the account stays unusable until the advisor sets one. Login still requires a non-empty password.
- XLSX headers are matched case-insensitively regardless of spacing/underscores (`PASSWORD`, `Pass Word`, `Pin`, `pwd` all work), and cells are read as formatted text so number-formatted passwords survive.
- Note: Excel itself strips leading zeros when digits are typed into a General-formatted cell — format the password column as Text in Excel first. The exported roster always shows an empty password column (hashes can't be exported); this does not mean passwords are missing.

### 0.21.0 — User Management: Roles, Class Advisors, Student Accounts, Question Banks, Quiz Releases

**Roles & permissions**
- Unified `users` table with roles `lecturer` | `student`. The old `admin`/`instructor` roles became a single lecturer role with an `is_admin` privilege flag; `create-admin` now creates a lecturer with admin privilege.
- New role middleware (`requireLecturer`, `requireAdmin`, `requireStudent`) enforced across all routers; ownership checks throughout services (quizzes/banks/groups belong to their creator, rosters to the advisor).
- Admin-only lecturer management: `GET/POST /api/v1/users`, `PATCH /users/:id`, `POST /users/:id/password` (with a guard that never removes the last active admin); new admin Users page in the client.
- Single identifier-based login (`POST /auth/login` with `identifier` + `password`): lecturers use their email, students their username; the client routes each role to its home (dashboard vs. /play).
- Security fixes: login and `/auth/me` no longer leak `password_hash`; login is rate-limited (10 attempts / 15 min per IP); Socket.io identity is now resolved from the server-side session cookie instead of trusting client-supplied `handshake.auth` payloads.

**Student accounts & class advisors**
- Students are now real accounts (username + bcrypt password) instead of join-by-code identities; the `join` feature was removed, `require_pin` is gone, and legacy PINs were migrated into bcrypt initial passwords (PIN-less students received unusable random passwords — advisors should set them).
- Classes carry a single **Class Advisor** (the lecturer who created the class; admins can reassign). Only the advisor (or an admin) can manage the roster: create, edit, deactivate, delete accounts, set passwords, and import/export XLSX.
- Any lecturer can view the class list and roster (module lecturers), release their quizzes to any class, define groups for their quizzes, and manage campaigns and games for any class.
- One student belongs to exactly one class; their open quizzes are everything released to their class plus campaign quizzes for it.

**Question banks & quiz releases**
- New question banks (owner-scoped CRUD + client pages); adding a bank question to a quiz **snapshot-copies** it, so later bank edits never change running quizzes.
- Quizzes gain `created_by` and a many-to-many `quiz_releases` table: one quiz can be released to multiple classes at once (replacing the single `class_id`), with release/unrelease endpoints and a release picker in the quiz builder.
- Groups are now **quiz-scoped** (`quizzes/:quizId/groups`): any lecturer defines groups for their quiz, members are students of any released class, and group answering resolves through the quiz's groups.

**Infrastructure**
- Migration `008_user_management.sql` rebuilds `users`/`quizzes`/`questions`/`groups`, merges `students` into `users` with response remapping, and is the first migration to run under `PRAGMA foreign_keys = OFF` with a `foreign_key_check` before commit (per SQLite's table-rebuild procedure). `migrate.ts` now executes migration files statement-by-statement — the sqlite3 driver's batched `exec()` proved unreliable with long DDL sequences.
- TypeScript data migrations (`server/src/db/data-migrations.ts`) run after SQL migrations; 008 hashes legacy PINs and finalises unique usernames.
- Dev DB was migrated in place after a verified dry run on a copy (pre-migration backup kept at `data/elitequest.backup-pre-008.db`).
- Tests: full rewrite of the suite against the new model plus new coverage for auth/users, advisor enforcement, student accounts (incl. XLSX import rules), banks (incl. snapshot-copy isolation), releases, quiz-scoped groups and release-gated responses; 100 server tests, 7 shared, 1 client — all passing.

### 0.19.0 — Campaigns & Quiz Playlist
- Campaigns are now first-class, class-specific entities with an ordered quiz playlist (`campaigns` + `campaign_quizzes` tables, migration 007).
- Quizzes are self-contained and reusable by any class: the `mode` column is gone; `class_id` is only the one-off play assignment, and quizzes can be played purely through a campaign.
- Playing a playlist quiz records results on the quiz instance and rolls them into the campaign's cumulative results; plays made before a quiz was added to a campaign still count (results are derived from current playlist membership, filtered to the campaign's class).
- Students discover campaign quizzes through their class code; the play page badges open quizzes with their campaign name.
- New campaigns feature: CRUD, playlist add/remove/reorder, and `GET /api/v1/campaigns/:id/results` (individual + group standings, per-quiz breakdown) replacing the old class-wide pseudo-campaign leaderboard.
- Class detail page gains a Campaigns section; new campaign detail and cumulative results pages.
- Quiz creation no longer requires a class (optional "assign for one-off play"); campaign membership grants class visibility.
- Group answering now resolves the student's group via the student's class, so group questions work for campaign-only quizzes.
- UI layout fixes: PlayPage waiting state (no contradictory "Loading...", header persists), QuizRunPage responsive two-column layout and correct loading vs. empty states, QuizEditPage question list no longer double-numbered, QuizResultsPage tables styled and horizontally scrollable on mobile.
- Added shared/table CSS utilities (`.data-table`, `.results-grid`, playlist styles) and mobile collapse for fixed grids.
- Fixed `npm run migrate` silently doing nothing on Windows (file-URL comparison in the CLI guard).
- Added `scripts/version-bump.mjs` with `npm run version:feat` / `version:fix` / `version:major`: bumps the version, syncs all workspace `package.json` files, rewrites `client/src/version.ts`, and updates this changelog in one step.
- Tests: new campaign service suite (CRUD, playlist rules, cumulative results incl. pre-campaign plays, cross-class exclusion) and open-quizzes-via-campaign coverage; all 71 server tests and client tests pass.

### 0.18.1 — CPGuardX Panel Static Asset Fix
- Fixed blank page behind the CPGuardX panel: its nginx intercepts `*.css`/`*.js` URLs before they reach Node, so Vite's hashed `/assets/...` files 404'd.
- The SPA's `index.html` is now served with extensionless asset URLs (`/static/css/<name>`, `/static/js/<name>`) backed by Express routes, following the proven DeltaPULSE approach.
- Routes validate asset names (`path.basename` + allowlist + existence check) against path traversal.
- Added `server/src/static-assets.test.ts` covering the transformed index, css/js routes, and 404 handling.
- Documented the caveat in `docs/DEPLOYMENT.md`; images such as the logo are unaffected.

### 0.18.0 — CPGuardX Panel Deployment
- Added root `index.js` entry point so the CPGuardX panel's start command (`node index.js`) boots the compiled server.
- Entry point defaults `PORT` to `3001` (panel local listener) when unset.
- Build artifacts (`shared/dist`, `server/dist`, `client/dist`) are now committed so pushing to `main` deploys without a build step on the VPS.
- Source maps excluded from committed dists (devtools-only, avoids ~2 MB churn per build).
- Documented CPGuardX Node.js app mode deployment in `docs/DEPLOYMENT.md` section 11: panel settings, one-time `.env`, first admin, backups via `ELITEQUEST_ROOT`, WebSocket caveats.

### 0.17.0 — Logo Integration & Splash Modal
- Added the ELITEQuest logo to the login screen and app header.
- Clicking the logo opens a full-screen splash modal with the large logo and version number.
- Splash modal closes on backdrop click, Escape key, or the close button.
- Added `client/src/components/Logo.tsx`, `SplashModal.tsx`, and `version.ts`.
- Copied logo asset into `client/public/` for Vite static serving.

### 0.16.0 — Visual Redesign & Interactive Widgets
- Added Outfit font and refreshed global CSS: shadows, 3D buttons, animations, checkbox alignment fixes.
- Replaced small radio/checkbox inputs with large tappable option cards for MCQ answers.
- Added drag-and-drop grouping buckets in student play and quiz builder.
- Added click-to-connect matching graph with animated SVG curves in play and builder.
- Redesigned word cloud: multi-coloured, size-weighted by frequency, animated float, click word to fade in submitters modal.
- Redesigned brainstorming: post-it notes with per-author colours and a submitter-name toggle (default off).
- Updated server aggregation to include per-submitter data via `v_response_author` view.
- Polished dashboard, quizzes, leaderboard, games list, join, login, and home pages.
- Added `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` to the client.



### 0.15.3 — Open Quiz From Session Page Bugfix
- Fixed instructors running a session while students saw "No open quizzes": the session page had no way to open a draft quiz.
- Session (Run) page now has an "Open Quiz" button when the quiz is draft/closed, and a warning banner whenever the quiz is not open.
- Student play page now polls for open quizzes every 5 seconds while waiting, so quizzes appear as soon as the instructor opens them; the waiting message clears automatically.

### 0.15.2 — Student Play Route Order Bugfix
- Fixed students getting 401 "Login required" when loading quizzes, questions, pacing state, or submitting answers.
- Root cause: routers with router-level requireAuth were mounted at the bare /api/v1 prefix above the public student routers; an auth failure aborts routing, so the student endpoints were never reached.
- Public student routers (play, pacing, responses) now mount before the instructor-only routers in server/src/index.ts.
- Server main() no longer binds a port when imported in the test environment.
- Added student-access integration tests covering the public endpoints with no session and confirming instructor routes still require login.

### 0.15.1 — Navigation & Quiz Assignment Bugfixes
- Fixed instructor navigation dead-end: Quizzes page now has a "Back to dashboard" link.
- Header is instructor-aware: logo links to the dashboard, plus persistent Dashboard and Logout controls when logged in.
- Fixed students seeing "failed to load quiz": quizzes are now assigned to a class at creation (required class picker), and the assigned class can be changed on the quiz edit page.
- Quiz list shows each quiz's assigned class (or "Unassigned") so bad data is visible at a glance.
- Class codes now match case-insensitively when students join and when listing open quizzes.
- PlayPage surfaces the server's error message when loading open quizzes fails.
- Server tests now run against an isolated test database (`data/elitequest.test.db`) instead of the development database.

### 0.15.0 — Production Deployment
- Added ecosystem.config.js for PM2 with logging, auto-restart, and production env.
- Added .env.example showing required env vars.
- Sessions now persist through restarts via connect-sqlite3.
- Express now 	rusts proxy in production for correct secure-cookie behavior behind Nginx.
- Migrations path resolution made robust for compiled server output.
- Added docs/DEPLOYMENT.md: Ubuntu/Vultr/PM2/Nginx/SSL/backup instructions.
- Added scripts/backup.sh template for SQLite backups.
- Updated AGENTS.md deployment section.

### 0.14.0 — Class Session Page
- New /quizzes/:id/run instructor view combining pacing controls, question display, live aggregation, live scoreboard, per-question counts, and student join info in one page.
- Response counts and correct rate refresh when students submit answers.
- Session page can close a quiz directly.
- Quizzes list links use the new Run session page instead of the older live display.
- Question content preview on the session page helps the instructor see options/items at a glance.

### 0.13.0 — Mini-Games Starter Pack
- New games table, schemas and CRUD service for reusable class mini-game configs.
- Wheel of Fortune: weighted segment spin endpoint broadcasting game-spin to the class room; animated CSS wheel UI.
- Jeopardy board: per-class categories/cells with prompts and point values; click-to-reveal board UI.
- Sprint mode: quiz setting adds time-based bonus points for fast answers in paced quizzes.
- Games page for class managers; play/spin page per game; banners on student and live display pages.

### 0.12.0 — Engagement Polish
- New shared scoreboard schemas for quiz-level participant and group totals.
- Scoreboard service computes per-quiz scores for individuals and groups.
- Scoreboard broadcast after every submission over Socket.io.
- Public GET /api/v1/play/quiz/:quizId/scoreboard endpoint.
- LiveDisplayPage shows a live scoreboard panel that updates as answers arrive.
- PlayPage now shows the scoreboard to students and a CSS confetti burst on correct answers.

### 0.11.0 — Live Quiz Pacing
- Quiz settings now support paced mode: students follow instructor controls in real time.
- New pacing service tracks the active question per quiz.
- New routes: GET /play/quiz/:quizId/pacing (public state) plus instructor dvance and etreat actions that broadcast over Socket.io.
- PlayPage shows a waiting indicator and follows pacing broadcasts; timers still apply per question.
- LiveDisplayPage gets instructor Previous/Next controls in paced mode.
- Randomization disabled when pacing is enabled to keep order consistent.

### 0.10.0 — Student PIN Enforcement
- Added equire_pin column on classes (migration 003) and shared schema.
- Class create/update persist the equire_pin flag.
- Join flow: a PIN is required when the class enables it; PINs are stored at first join and validated on rejoin.
- Dashboard create-class form has a PIN-required checkbox.
- Class detail page can toggle PIN enforcement.

### 0.9.0 — Quiz Settings Polish
- New public play endpoint serves student-safe questions (correct answers stripped) and optional randomization.
- Added per-question 	ime_limit_seconds (migration 002) and quiz-level timer support.
- QuizEditPage now edits quiz settings (randomize, show answers, quiz time limit, default answer mode) plus per-question time limit.
- PlayPage uses countdown timers, disables submission when time expires, and shows score feedback when allowed.
- Sanitizer tests verify all answer keys are removed before being sent to students.

### 0.8.0 — Results & Reporting
- Shared schemas for per-question summary and response rows.
- Results service aggregates per-question stats (count, average score, correct rate).
- XLSX export of quiz results with Summary and Responses sheets.
- Routes GET /api/v1/quizzes/:id/results and /export.\n- Frontend quiz results page with summary table, full responses, and export button.

### 0.7.0 — Campaign Leaderboards
- Leaderboard schemas (individual + group entries).
- Leaderboard service aggregates response scores across campaign-mode quizzes per class.
- Route GET /api/v1/classes/:id/leaderboard for instructors.
- Class leaderboard page in the frontend with link from the class detail view.

### 0.6.0 — Group Management & Group Answering
- Added groups and group membership management per class (teacher-assigned).
- Shared schemas for groups and group members.
- Responses support group answering: one response per group per question; latest submission wins.
- Individual questions replace the student's previous submission.
- Added public endpoint listing open quizzes by class code; PlayPage now lists and launches open quizzes.
- Group management UI on the class detail page.

### 0.5.0 — Live Engagement & Non-Marking Questions
- Added Socket.io rooms for live quiz participation.
- Implemented word cloud aggregation.
- Implemented brainstorming idea submission and upvote aggregation.
- Added live REST endpoints for aggregation and upvoting.
- Added student play page for submitting answers.
- Added instructor live display page for word cloud and brainstorming.
- Wired live routes and socket handlers into the server.

### 0.4.0 — Quiz Builder & Engine
- Added student join flow with session support.
- Implemented quiz CRUD and open/close lifecycle.
- Implemented question CRUD for all auto-marked and non-marked types.
- Added auto-marking for MCQ, short answer, fill blanks, matching, grouping.
- Added response submission endpoint.
- Added quiz list and builder React pages.
- Wired join, quiz, question, and response routes.

### 0.3.0 — Class & Student Management
- Added `requireAuth` middleware for protected routes.
- Implemented backend CRUD for classes with auto-generated join codes.
- Implemented backend CRUD for students within classes.
- Added XLSX import with duplicate detection and XLSX export for student rosters.
- Added `create-admin` CLI script.
- Created admin client dashboard, class detail page, and roster management UI.
- Updated `shared` class schemas to make `createClass` fields optional/defaulted.
- All server and client builds pass; server tests pass.
- Created checklist `feature-class-student-management.md`.

### 0.2.0 — Project Scaffold
- Created monorepo with workspaces: `client/`, `server/`, `shared/`.
- Added root tooling: TypeScript, ESLint, Prettier, Vitest, concurrent dev scripts.
- Built shared package with Zod schemas and TypeScript types.
- Built server scaffold: Express, `sqlite3`, migrations, sessions, auth feature with tests.
- Built client scaffold: Vite + React + React Router, pages and API client.
- Created checklist `feature-project-scaffold.md`.

### 0.1.0 — Project Scaffold & Documentation
- Created `AGENTS.md`, `userreqs.md`, `techspecs.md`, `version.md`.
- Created `checklists/` directory and initial checklist template.
- Established version-bump rules.

