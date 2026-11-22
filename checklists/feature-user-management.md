# Feature: User Management (Roles, Advisor, Student Accounts, Banks, Releases)

## Status

- Version target: 0.20.0
- Started: 2026-10-27
- Completed: 2026-10-27

## Tasks

### Schema & Migration
- [x] Shared schemas: user (lecturer/student, is_admin, username), class (advisor_id), question-bank (new), quiz (created_by, releases), group (quiz_id)
- [x] Migration 008_user_management.sql (users rebuild, students merge, classes rebuild, banks, releases, quiz groups)
- [x] Verify migration on a copy of the dev DB (backup first) — students → accounts s76-s80, responses remapped, FK check clean

### Auth & Users
- [x] Identifier login (email or username), role routing, strip password_hash from all responses
- [x] requireLecturer / requireAdmin / requireStudent middleware
- [x] Login rate limiting (10 / 15 min per IP)
- [x] Users feature: admin-only lecturer CRUD + password reset (last-active-admin guard)
- [x] create-admin script creates lecturer with is_admin=1

### Classes & Students
- [x] Class creator becomes advisor; admin can reassign; advisor-only roster management
- [x] Student accounts CRUD by advisor (manual + XLSX import), password handling (set/activate/deactivate)

### Question Banks & Quizzes
- [x] Question banks feature (owner-scoped CRUD; admins see all)
- [x] Snapshot copy: bank question -> quiz question
- [x] Quiz created_by; quiz_releases many-to-many; release/unrelease endpoints
- [x] Quiz-scoped groups; group answering resolves via quiz groups (members from released classes)
- [x] Campaigns/games: any lecturer; campaigns + created_by; only quiz owner adds quiz to campaign

### Students & Play
- [x] Remove join-by-code feature; student login flow (username + password)
- [x] Play/responses/live require student session; socket session verification (cookies, no client-supplied ids)
- [x] Open quizzes = releases to student's class + campaign quizzes

### Client
- [x] Unified login page with role routing; remove JoinPage
- [x] Admin Users management page
- [x] Dashboard/ClassDetail advisor-aware UI
- [x] Quiz builder: release picker, quiz groups tab, bank question picker
- [x] Question banks pages (BanksPage, BankDetailPage)
- [x] PlayPage for logged-in students (/play)

### Tests & Release
- [x] Update existing tests; add coverage for roles/advisor/banks/releases/groups — 100 server tests, 7 shared, 1 client, all passing
- [x] Full test suite + builds pass
- [x] Version bump (version:feat) + changelog

## Notes

- Decisions: full student accounts (username login, one class per student, advisor-created); quiz releases to multiple classes; bank->quiz questions are snapshot copies; campaigns/games manageable by any lecturer.
- Security fixes folded in: password_hash leak (login/me), role enforcement, socket session auth, login rate limiting, PIN plaintext removed (PINs became bcrypt initial passwords; PIN-less students got random passwords — advisors should reset).
- migrate.ts now splits SQL files into single statements (the sqlite3 driver's batched exec() is unreliable with DDL sequences) and runs each migration with PRAGMA foreign_keys = OFF + a foreign_key_check before commit, per SQLite's table-rebuild procedure.
- Data migration 008-student-account-credentials (TS): bcrypt-hashes legacy PINs, assigns random passwords to PIN-less students, dedupes usernames and creates the unique username index.
- Dev DB was migrated in place after a verified dry run on a copy; pre-migration backup kept at data/elitequest.backup-pre-008.db.
