# ELITEQuest Technical Specification

## Architecture Overview

ELITEQuest is a single-server web application designed to run on a basic Vultr VPS. It uses a monorepo structure with a TypeScript frontend and an Express + TypeScript backend, sharing Zod schemas and TypeScript types across both.

```
ELITEQuest/
├── client/                 # Vite + React TS frontend
├── server/                 # Express TS backend
├── shared/                 # Zod schemas + shared types
├── checklists/             # Feature and bugfix checklists
├── docs/                   # Additional guides
├── version.md
└── AGENTS.md
```

## Technology Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | TypeScript + Vite + React | Type-safe, fast dev server, small bundle |
| Backend | Node.js + Express + TypeScript | Simple, fast, LLM-friendly, low VPS footprint |
| Database | SQLite (initial) | Zero-config, file-based, easy backups |
| Real-time | Socket.io | Reliable WebSocket abstraction for live features |
| Validation | Zod | Shared TS-first schemas |
| Testing | Vitest | Fast TS testing |
| Auth | bcrypt + express-session | Simple session-based auth |
| XLSX | SheetJS / `xlsx` | Import/export class rosters |
| Deployment | PM2 + Ubuntu LTS | Stable process management on VPS |

## Database

### Choice: SQLite

- File-based, no separate database server to manage.
- Sufficient for community college classroom scale.
- Easy to back up by copying the database file.
- Abstraction layer used for future migration to PostgreSQL.

### Recommended Library

- Use `better-sqlite3` for synchronous, simple queries.
- Wrap all DB access in service/repository functions.

### Migration Strategy

- Migrations stored in `server/src/db/migrations/`.
- Each migration is idempotent and timestamped.
- A simple `migrate.ts` script runs them in order.

## Core Data Models

### User (admin/instructor)

- `id`
- `email` (unique)
- `password_hash`
- `display_name`
- `role` (`admin` | `instructor`)
- `created_at`
- `updated_at`

### Class

- `id`
- `name`
- `code` (unique, join code for students)
- `description`
- `is_active`
- `created_at`
- `updated_at`

### Student

- `id`
- `class_id`
- `display_name`
- `student_id` (optional, institution ID)
- `pin` (optional, hashed if used)
- `created_at`

### Quiz

- `id`
- `class_id` (nullable — the class the quiz is assigned to for one-off play)
- `title`
- `description`
- `status` (`draft` | `open` | `closed` | `archived`)
- `settings` (JSON)
- `created_at`

Quizzes are self-contained and reusable: they are never "campaign mode" themselves. A quiz can be assigned to a class for one-off play, added to a campaign playlist, or both.

### Campaign

- `id`
- `class_id` (campaigns are class-specific)
- `title`
- `description`
- `created_at`
- `updated_at`

### CampaignPlaylistItem (`campaign_quizzes`)

- `campaign_id`
- `quiz_id`
- `position` (playlist ordering)

Campaign results are derived from current playlist membership: every response to a playlist quiz made by a student/group of the campaign's class counts toward the campaign's cumulative results, including plays made before the quiz was added to the playlist.

### Question

- `id`
- `quiz_id`
- `order_index`
- `type`
- `prompt`
- `data` (JSON: options, answers, correct mappings, etc.)
- `answer_mode` (`individual` | `group`)
- `points`
- `created_at`

Question types: `mcq_single`, `mcq_multi`, `short_answer`, `fill_blanks`, `matching`, `grouping`, `word_cloud`, `brainstorming`.

### Response

- `id`
- `question_id`
- `student_id` (nullable if group-only)
- `group_id` (nullable)
- `answer` (JSON)
- `score` (nullable, for marked questions)
- `submitted_at`

### Group

- `id`
- `class_id`
- `name`
- `created_at`

### GroupMember

- `id`
- `group_id`
- `student_id`

### Campaign Results

- Computed at request time: per-student and per-group score totals across the campaign's playlist quizzes, plus a per-quiz breakdown.
- Endpoint: `GET /api/v1/campaigns/:id/results`.

## API Conventions

- Base path: `/api/v1`
- RESTful JSON.
- Auth endpoints under `/api/v1/auth`.
- Authenticated routes require a valid session cookie.
- Error response format:

```json
{
  "error": "SHORT_CODE",
  "message": "Human-readable description"
}
```

## Key API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Admin/instructor login |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Current session info |

### Classes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/classes` | List classes |
| POST | `/api/v1/classes` | Create class |
| GET | `/api/v1/classes/:id` | Get class details |
| PATCH | `/api/v1/classes/:id` | Update class |
| DELETE | `/api/v1/classes/:id` | Delete/archive class |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/classes/:id/students` | List students in class |
| POST | `/api/v1/classes/:id/students` | Add student |
| PATCH | `/api/v1/students/:id` | Edit student |
| DELETE | `/api/v1/students/:id` | Remove student |
| POST | `/api/v1/classes/:id/students/import` | Import from XLSX |
| GET | `/api/v1/classes/:id/students/export` | Export to XLSX |

### Join (Student)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/join` | Join class by code |

### Quizzes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/quizzes` | List quizzes |
| POST | `/api/v1/quizzes` | Create quiz |
| GET | `/api/v1/quizzes/:id` | Get quiz |
| PATCH | `/api/v1/quizzes/:id` | Update quiz |
| DELETE | `/api/v1/quizzes/:id` | Delete quiz |
| POST | `/api/v1/quizzes/:id/open` | Open quiz for participation |
| POST | `/api/v1/quizzes/:id/close` | Close quiz |

### Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/quizzes/:quizId/questions` | List questions |
| POST | `/api/v1/quizzes/:quizId/questions` | Add question |
| PATCH | `/api/v1/questions/:id` | Update question |
| DELETE | `/api/v1/questions/:id` | Delete question |

### Responses

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/questions/:id/responses` | Submit response |
| GET | `/api/v1/quizzes/:id/responses` | Get all responses |

### Live / Socket.io

- Namespace `/live` for real-time features.
- Events:
  - `join-quiz`
  - `submit-answer`
  - `next-question`
  - `question-closed`
  - `word-cloud-update`
  - `brainstorm-update`

## Frontend Structure

```
client/src/
├── main.tsx
├── App.tsx
├── api/             # API client functions
├── components/      # Reusable UI components
├── pages/           # Route-level pages
├── hooks/           # Custom React hooks
├── utils/           # Helpers
└── styles/          # Global CSS
```

### Routing

- `/login` — admin login
- `/dashboard` — class/quiz overview
- `/classes/:id` — class detail
- `/quizzes/:id/edit` — quiz builder
- `/quizzes/:id/run` — quiz runner (instructor)
- `/join` — student join page
- `/play/:code` — student participation view

## Deployment

### Server Requirements

- Ubuntu LTS
- Node.js LTS
- PM2
- Nginx (optional reverse proxy + SSL)
- 1 vCPU / 1 GB RAM minimum

### Environment Variables

```bash
NODE_ENV=production
PORT=3000
SESSION_SECRET=<random-secret>
DATABASE_URL=./data/elitequest.db
CORS_ORIGIN=https://your-domain.com
```

### Build and Run

```bash
# Server
npm install
npm run build
npm start

# Frontend
cd client
npm install
npm run build
# Static files served by Express
```

### PM2

Use `ecosystem.config.cjs` (the `.cjs` extension is required because the root
package.json sets `"type": "module"`):

```js
module.exports = {
  apps: [{
    name: 'elitequest',
    script: 'server/dist/index.js',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## Security

- bcrypt for password hashing.
- `express-session` with secure cookie settings.
- Helmet middleware for HTTP headers.
- CORS restricted to trusted origins.
- All DB queries parameterized.
- Rate limiting on login and join endpoints.

## Privacy

- Use display names in the UI; real names only if imported.
- Allow admin to export and delete class data.
- Avoid logging student PII.
- Clearly identify roles that can view responses.

## Testing

- Unit tests for service functions with Vitest.
- Route tests with a test SQLite database.
- Frontend component tests (optional).
- Run with `npm test`.

## Future Considerations

- PostgreSQL migration when scale requires it.
- OAuth/LDAP integration for institutional auth.
- LMS integration via LTI.
