# Feature: Project Scaffold

## Status

- Version target: 0.2.0
- Started: 2026-08-25
- Completed: 2026-08-25

## Tasks

- [x] Create monorepo directory structure (`client/`, `server/`, `shared/`, `data/`, `docs/`).
- [x] Create root `package.json` with workspaces, scripts, and engines.
- [x] Create root `tsconfig.json`, `.eslintrc.json`, `.prettierrc`, `.gitignore`.
- [x] Set up `shared/` package with Zod schemas for users, classes, students, quizzes, questions, responses.
- [x] Add shared Vitest tests for core schemas.
- [x] Set up `server/` package with Express, TypeScript, `sqlite3`, `bcrypt`, `socket.io`, sessions, helmet, cors.
- [x] Add initial migration creating users, classes, students, groups, quizzes, questions, responses tables.
- [x] Add async SQLite promise wrapper and migration runner.
- [x] Implement basic auth feature (service, controller, routes, tests).
- [x] Set up `client/` package with Vite + React + TypeScript + React Router.
- [x] Add client pages: Home, Login, Dashboard, Join.
- [x] Add client API client and auth API helpers.
- [x] Build shared package and run shared tests successfully.
- [x] Run server tests successfully and fix SQLite database path issues.

## Notes

Stack switched from `better-sqlite3` to `sqlite3` because the former failed to compile against the installed Node.js version on Windows. `sqlite3` has reliable prebuilt binaries and supports our VPS deployment target.
