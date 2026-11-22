# AGENTS.md — ELITEQuest

This file contains instructions for AI agents and other automated contributors working on ELITEQuest.

## Project Purpose

ELITEQuest is a gamified quizzing study aid for a community college. It runs on a basic Linux VPS (Vultr) and supports admin/instructor-led classes, multiple quiz question types, live engagement features, group or individual answering, and mini-games.

## Core Values

Build the app to be:

- **Simple** — no over-engineering. Prefer explicit, obvious code.
- **Fast** — low server overhead; runs on a small VPS with minimal RAM.
- **Responsible** — handle student data carefully, respect privacy (FERPA-aware), and fail safely.
- **Maintainable** — clean structure, consistent naming, good tests, and LLM-friendly code.

## Technology Stack

- **Backend:** Node.js + Express + TypeScript
- **Frontend:** TypeScript + Vite + React (lightweight usage)
- **Database:** SQLite (initial), with repository-layer abstraction for future PostgreSQL migration
- **Real-time:** Socket.io (for live word clouds, brainstorming, mini-games)
- **Validation:** Zod (shared schemas between frontend and backend)
- **Testing:** Vitest
- **Linting/Formatting:** ESLint + Prettier
- **Process Manager:** PM2 on Linux VPS

## Directory Conventions

```
ELITEQuest/
├── client/                 # Vite + React TypeScript frontend
├── server/                 # Express TypeScript backend
│   ├── src/
│   │   ├── features/       # One folder per domain
│   │   │   ├── auth/
│   │   │   ├── classes/
│   │   │   ├── students/
│   │   │   ├── quizzes/
│   │   │   ├── questions/
│   │   │   ├── responses/
│   │   │   ├── leaderboards/
│   │   │   ├── games/
│   │   │   └── ...
│   │   ├── shared/         # Shared utilities, middleware, errors
│   │   ├── db/             # Database setup, migrations, seeds
│   │   └── index.ts        # App entry point
│   └── tests/
├── shared/                 # Zod schemas + TS types shared across client and server
├── docs/                   # Additional guides if needed
├── checklists/             # Per-feature and per-bugfix checklists
├── version.md              # Version log and rules
└── AGENTS.md               # This file
```

Each feature folder should contain:

- `*.routes.ts` — Express routes
- `*.controller.ts` — Request/response handlers
- `*.service.ts` — Business logic and DB access
- `*.schema.ts` — Zod schemas (or import from `shared/`)
- `*.types.ts` — Local TypeScript types
- `*.test.ts` — Vitest tests

## Code Style

- Use TypeScript strictly. Avoid `any`.
- Prefer named exports.
- Use `async/await` over callbacks.
- Use Zod for all input validation.
- Keep functions small and focused.
- Avoid clever abstractions. Write code an LLM can regenerate reliably.
- Comment only when the reason is non-obvious. Use clear names first.

## Database Rules

- Use SQLite for the initial versions.
- All DB access goes through repository/service functions, not inline SQL in routes.
- Use parameterized queries or an ORM/query builder. (Recommended: `better-sqlite3` or `drizzle-orm`.)
- Migrations must be idempotent and recorded in `server/src/db/migrations/`.

## API Conventions

- RESTful JSON APIs.
- Base path: `/api/v1/...`
- Standard HTTP status codes.
- Error format: `{ "error": "Short code", "message": "Human-readable description" }`

## Frontend Conventions

- React functional components.
- Avoid heavy UI libraries. Use plain CSS or a lightweight utility-first approach.
- Mobile-first responsive design (students may use phones).
- All API calls centralized in a `api/` folder.
- Reuse types from `shared/`.

## Authentication

- Admin/Instructor: session-based login (email + password, bcrypt hashed).
- Students: join by class code + display name/PIN; no persistent accounts needed.
- Store session secrets in environment variables (never hard-code).

## Version and Checklist Rules

1. Read `version.md` before starting any work.
2. Every new feature must have a checklist file in `checklists/` named like `feature-<kebab-name>.md` or `bugfix-<kebab-name>.md`.
3. Update the checklist as work progresses — mark items `in_progress` and `completed`.
4. Version format is `X.Y.Z`. Bump it with the automated script before committing:
   - Feature: `npm run version:feat -- --note "Short summary"` — bumps Y, resets Z to 0.
   - Bugfix: `npm run version:fix -- --note "Short summary"` — bumps Z.
   - The script (`scripts/version-bump.mjs`) syncs every workspace `package.json`, rewrites `client/src/version.ts` (splash modal), and adds the changelog entry to `version.md` in one step.
5. Because compiled `dist/` output is committed and "push to `main` is the deploy", always run `npm run build` **after** the version bump and commit the rebuilt `dist/` artifacts with the release — otherwise the VPS serves stale code and a stale splash version. Never build on the VPS (see `docs/DEPLOYMENT.md`).
6. Major version bumps (X) are manual only — the product owner decides when. When explicitly asked, use `npm run version:major -- --note "Summary"`.
7. After running the script, review the new changelog entry in `version.md` and expand it with the notable changes if needed.

## Checklist Template

Create each checklist from this template:

```markdown
# Feature/Bugfix: <Name>

## Status

- Version target: x.y.z
- Started: YYYY-MM-DD
- Completed: YYYY-MM-DD

## Tasks

- [ ] Task 1
- [ ] Task 2
- ...

## Notes
```

## Testing

- Write unit tests for services and API routes.
- Run tests with: `npm test` (server root) or the workspace-level command.
- Tests run against an isolated database (`data/elitequest.test.db`, set in `server/vitest.config.ts`). Never point tests at the real database — test suites wipe and reseed tables.
- Aim for fast tests; avoid heavy DB setup when possible.

## Deployment

- Primary target: the xCloud 3.0 panel (xcloud.host). See `docs/DEPLOYMENT-XCLOUD.md`
  and `skill_xcloud_deployment.md` for panel rules (start via `npm start`,
  `PORT` injected by the panel, Docker path uses pre-built GHCR images).
- Manual fallback: basic Ubuntu VPS with PM2: `pm2 start ecosystem.config.cjs` (see `ecosystem.config.cjs`).
- Sessions are stored in `data/sessions.db` via `connect-sqlite3` (they survive restarts).
- Environment variables go in `.env` (see `.env.example`). See `techspecs.md` for details.
- Static frontend built with `npm run build` and served from the Express app.
- Full guide (Nginx, SSL, PM2, backups): `docs/DEPLOYMENT.md`.

## Communication

- Ask for clarification if a requirement is ambiguous.
- Prefer small, focused changes over large rewrites.
- Summarize what was changed and why when reporting back.
- Commit messages are not required unless the user asks for them.

## Privacy and Ethics Notes

- Student data is sensitive. Avoid logging PII.
- Do not expose student names or responses publicly without explicit feature design.
- Respect FERPA principles: minimize data collection, allow export/deletion where reasonable.
