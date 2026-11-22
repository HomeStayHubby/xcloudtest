# Feature: Production Deployment Setup

## Status

- Version target: 0.15.0
- Started: 2026-09-18
- Completed: 2026-09-18

## Tasks

- [x] Create checklist.
- [x] `ecosystem.config.js` for PM2 (auto-restart, logging, production env).
- [x] `.env.example` for server configuration templates.
- [x] Persistent session store with SQLite (sessions survive restarts).
- [x] `trust proxy` enabled in production for Nginx-secured connections.
- [x] Production-safe migrations path (independent of build output structure).
- [x] `docs/DEPLOYMENT.md` with Vultr VPS, Nginx, SSL (certbot), backup instructions.
- [x] `scripts/backup.sh` for SQLite backups.
- [x] Update `AGENTS.md` deployment section to reference the new guide.
- [x] Builds/tests green; bump to 0.15.0 and changelog.

## Notes

Target: Ubuntu LTS Vultr VPS running Node.js LTS. SQLite data lives under `data/`; backups via `sqlite3 .backup` in a script. The guide covers Nginx reverse proxy + Certbot for HTTPS.
