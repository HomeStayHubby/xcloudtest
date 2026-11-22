# Feature: AI Quiz Question Generation (Groq)

## Status

- Version target: 0.28.0
- Started: 2026-10-30
- Completed: 2026-10-30

## Tasks

### Backend — settings infrastructure
- [x] Migration `010_app_settings.sql` (`app_settings` key/value table)
- [x] `server/src/shared/secret-box.ts` — AES-256-GCM encrypt/decrypt (key from `SESSION_SECRET`)
- [x] `server/src/features/settings/` — routes/controller/service/schema + tests
- [x] `GET /api/v1/settings/ai` (masked key, model), `PUT /api/v1/settings/ai` (admin only)

### Backend — AI generation
- [x] Migration `009_question_bloom_level.sql` (nullable `bloom_level` on `questions`)
- [x] Shared: `bloomLevelSchema`, question schema `bloom_level`, `ai-generation.schema.ts`
- [x] `server/src/features/ai-generation/` — routes/controller/service/schema/types
- [x] `POST /api/v1/ai/extract-material` — txt/md/pdf/docx/pptx → text (transient)
- [x] `POST /api/v1/ai/generate-questions` — Groq call, 8 types, Bloom 1–3, validation + repair retry
- [x] `GET /api/v1/ai/models` — proxy Groq models list using stored key
- [x] Question service/controller persist + return `bloom_level`
- [x] Env: optional `GROQ_API_KEY`/`GROQ_MODEL` bootstrap fallback

### Frontend
- [x] `client/src/api/settings.ts` + `client/src/api/ai.ts`
- [x] `AdminSettingsPage` (`/settings`, admin-gated link on Dashboard)
- [x] AI Generate page (material input, prompt, Bloom chips, count, model dropdown)
- [x] Review list with Bloom badges → edit via existing editors → save to quiz/bank
- [x] Bloom select in question editors (manual authoring)

### Testing & wrap-up
- [x] Tests: secret-box round-trip/tamper, settings service (masking, unreadable key, env fallback), generation (mocked fetch: keys, model override, repair retry, warnings, provider errors), models list, extraction (txt/md/pptx/truncation), bloom persistence
- [x] Lint (new files match repo baseline; remaining warnings pre-existing repo-wide) + typecheck (shared/server/client) + full test suite (144 passed)
- [x] `.env.example` updated
- [x] Version bump 0.28.0 + changelog review

## Notes

- Admin = lecturer with `is_admin = 1`; guard with existing `requireAdmin`.
- API key stored encrypted (AES-256-GCM, key derived from `SESSION_SECRET`); never returned in full by the API.
- Uploaded materials are processed in memory only — never persisted (FERPA-minimal).
- Scanned PDFs produce "no text found" (acceptable, surfaced to user).
- `SESSION_SECRET` rotation invalidates the stored key → UI prompts re-entry (graceful).
- Model: admin default + per-run override dropdown (live from Groq `/models`).
