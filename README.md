# ELITEQuest

A gamified quizzing study aid for community college. Instructors create classes and quizzes; students join with a class code (no accounts needed) and answer live from their phones or laptops.

## Features

- **Quiz builder** — 8 question types: multiple choice (single/multi), short answer, fill in the blanks, matching, grouping, word cloud, and brainstorming
- **Live sessions** — instructor-paced mode with real-time question advance, live aggregation, and scoreboards over WebSockets
- **Flexible play** — reusable one-off quizzes, class-specific campaigns with quiz playlists, individual or group answering, optional timers, sprint-mode speed bonuses
- **Classes & rosters** — auto-generated join codes, optional student PINs, XLSX roster import/export
- **Results & reports** — cumulative campaign results, per-question stats, XLSX results export
- **Mini-games** — Wheel of Fortune and Jeopardy boards for in-class engagement

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | TypeScript + Vite + React |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite (file-based, zero-config) |
| Real-time | Socket.io |
| Validation | Zod (schemas shared between client and server) |
| Testing | Vitest |
| Auth | bcrypt + express-session |
| Deployment | xCloud 3.0 panel (Node.js site or Custom Docker; see `docs/DEPLOYMENT-XCLOUD.md`) |

## Repository Layout

```
client/    Vite + React frontend
server/    Express backend (features/, db/, shared/)
shared/    Zod schemas + TypeScript types used by both sides
checklists/  Per-feature and per-bugfix checklists
docs/      Deployment guide
```

## Getting Started

**Prerequisites:** Node.js 18+

```bash
npm install        # installs all workspaces (client, server, shared)
npm run dev        # runs server (:3000) and client (:5173) together
```

Then open http://localhost:5173. The Vite dev server proxies `/api` and `/socket.io` to the Express server automatically.

Create your first instructor account:

```bash
cd server
npm run create-admin -- you@example.edu yourpassword "Your Name"
```

Students never need accounts — they join from the home page with the class code shown on the instructor's dashboard and quiz session pages.

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| root | `npm run dev` | Run server + client in dev mode |
| root | `npm run build` | Build shared, server, and client |
| root | `npm test` | Run shared + server tests |
| root | `npm start` | Start the production server (`node index.js`; serves built client) |
| root | `npm run version:feat -- --note "..."` | Bump minor version (Y) and update changelog |
| root | `npm run version:fix -- --note "..."` | Bump patch version (Z) and update changelog |
| server | `npm run migrate` | Run database migrations |
| server | `npm run create-admin -- <email> <password> [name]` | Create an admin/instructor account |

## Environment Variables

Copy `.env.example` to `.env` and adjust. Required for production: a long random `SESSION_SECRET` (e.g. `openssl rand -base64 48`) and your public origin in `CORS_ORIGIN`. Defaults work out of the box for local dev.

## Testing

Tests use Vitest and run against an isolated SQLite database (`data/elitequest.test.db`) — never the real one.

```bash
npm test          # root: shared + server tests
```

## Deployment

Primary target: the **xCloud 3.0 panel** — native Node.js site (build command
`npm run build`, start command `npm start`) or Custom Docker (GHCR image built
by GitHub Actions). Full xCloud guide: [docs/DEPLOYMENT-XCLOUD.md](docs/DEPLOYMENT-XCLOUD.md).

Manual Ubuntu VPS with PM2 + Nginx is also supported: the Express server
serves the built client and stores data in `data/`. See
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Project Conventions

- `AGENTS.md` — architecture, coding style, and contribution rules
- `version.md` — version log and changelog
- `checklists/` — per-feature and per-bugfix task checklists
