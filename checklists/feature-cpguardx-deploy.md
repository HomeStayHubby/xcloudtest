# Feature: CPGuardX Panel Deployment (GitHub Node.js App Mode)

## Status

- Version target: 0.18.0
- Started: 2026-10-27
- Completed: 2026-10-27

## Tasks

- [x] Create root `index.js` entry point for the panel start command (`node index.js`)
- [x] Default `PORT` to `3001` (panel local listener) when unset
- [x] Track build artifacts (`shared/dist`, `server/dist`, `client/dist`) in git
- [x] Verify `npm run build` produces all three dist outputs
- [x] Verify `node index.js` boots and serves `/health` + SPA root
- [x] Document CPGuardX deployment in `docs/DEPLOYMENT.md`
- [x] Bump version to 0.18.0 in `package.json` and `version.md`
- [x] Run tests and lint (63/63 tests pass; lint errors are pre-existing, none in changed files)
- [x] Commit and push to `main`
- [x] Commit previously uncommitted 0.16.0/0.17.0 feature work first (user-approved)

## Notes

- CPGuardX Node.js app mode has no build step; compiled output is committed so
  push = deploy. Chosen per AGENTS.md guidance for low-memory VPS instances.
- Panel reverse-proxies `quest.mrchristian.fyi` over http to local listener 3001.
- `.env` and `data/` live only on the VPS (gitignored); recreate `.env` if the
  panel ever re-clones the application directory.
- Socket.io may fall back to HTTP long-polling if the panel proxy lacks
  WebSocket Upgrade headers; live features remain functional.
