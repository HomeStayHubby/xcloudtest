# Skill: xCloud 3.0 Node.js App Deployment

Audience: AI agent coding on any Node.js app that will be deployed through the
xCloud panel (xcloud.host, v3.0) from a GitHub repository.

Apply this skill whenever you are:

- Preparing an app for xCloud deployment, or
- Fixing an xCloud deployment that is online but broken (blank page, 404s,
  wrong port, crash on boot).

All rules are mandatory unless marked optional. Each rule exists because of a
concrete panel constraint — see section 2.

---

## 1. TL;DR checklist

- [ ] package.json has a `start` script (xCloud's default start: `npm start`)
- [ ] App listens on `process.env.PORT` (xCloud injects it); never 80/443
- [ ] Build command works from a cold clone: `npm install --include=dev` then
      `npm run build`
- [ ] Build tools (tsc/vite) are devDependencies but installed with
      `--include=dev` in the deployment script
- [ ] `.env` values are configured via the xCloud environment panel or a
      gitignored `.env` at the app directory root
- [ ] For Custom Docker: no `build:` in compose, no host ports 80/443, single
      exposed port, image pre-pushed to a public registry (GHCR)
- [ ] WebSockets survive without Upgrade headers (Socket.io long-polling
      fallback) — never hard-depend on WebSocket-only transport
- [ ] Verified locally before push: build, tests, boot via `npm start`, curl
      checks

---

## 2. Panel constraints (read first — every rule traces to one of these)

xCloud 3.0 supports two relevant deployment modes:

### Mode A — Native Node.js site

1. Clones the repo (chosen branch, typically `main`) into the site directory.
2. Runs the configurable **deployment script** on every push
   (default: `cd /site/path && npm install && npm run build`).
3. Starts the app with the configured **start command** (default
   `npm start`) under panel-managed supervision. Injects `PORT`.
4. Reverse-proxies the domain to the app port over HTTP; provisions SSL
   itself (ports 80/443 belong to xCloud's nginx).

### Mode B — Custom Docker

1. On every git push, xCloud runs `git pull` then
   `docker-compose pull && docker-compose up -d` **from the repo root**.
2. xCloud **never runs `docker build`** — images must be pre-built by CI
   (GitHub Actions → GHCR) and referenced by `image:` in compose.
3. Compose rules: no `build:` directives (silently ignored), no host port
   80/443 bindings, single exposed port, env vars via the xCloud UI
   (`${VAR}` interpolation), relative volume paths only.
4. If the container listens on port 80, publish it as `3080:80` and set
   xCloud's exposed port to `3080`.

Consequences for both modes:

- The panel owns 80/443, SSL, and the reverse proxy. The app must never
  duplicate them.
- Environment secrets come from the xCloud environment panel (Mode A writes
  them into the site's environment / `.env`; Mode B injects them into compose
  interpolation). Never hard-code.
- The panel's nginx may not forward WebSocket `Upgrade` headers. Socket.io
  silently falls back to HTTP long-polling: functional, slightly less
  efficient.
- Node versions available: 18, 20, 22.

---

## 3. Mandatory packaging rules

### R1 — Start via package.json `start` script

- Root `"start"` must boot the app directly (e.g. `"node index.js"` for a
  shim, or `"node server.js"`). Avoid `cd x && npm start` chains — the panel
  runs the start command from the app directory root.
- Never bind port 80/443. Use `process.env.PORT` with a sensible fallback
  (3000).

### R2 — Build must work from a cold clone

- `npm run build` must succeed on a fresh clone with dev dependencies
  installed (`npm install --include=dev`).
- In an npm-workspaces monorepo, prefer `npm run build --workspaces
  --if-present` over `cd`-chained workspace builds.
- Ship compiled `dist/` in git as a resilience net (boots even if the panel
  build step is skipped), and expect the panel-side build to rewrite those
  tracked files. If a later `git pull` refuses ("local changes would be
  overwritten"): `git checkout -- . && git pull`.

### R3 — Dependencies

- Native modules must compile or ship prebuilts for Node 18/20/22 on Linux
  glibc (e.g. `sqlite3`, `bcrypt` — both proven).
- Docker images: multi-stage build; install `python3 make g++` in the build
  stage so native modules can compile when no prebuilt binary matches; run
  `npm ci --omit=dev` for the runtime layer.

### R4 — Environment configuration

- Required production env: `NODE_ENV=production`, `SESSION_SECRET` (long
  random), `CORS_ORIGIN` (public URL). `PORT` is injected by xCloud.
- Enable `trust proxy` in production so `secure` cookies work behind the
  panel proxy.

### R5 — One-time provisioning must be scripted

- Anything needed after the first deploy (create first admin, seed data)
  must be an idempotent script that exists as compiled output, e.g.
  `node server/dist/scripts/create-admin.js <email> <password>`
  (Docker: `docker compose exec app node server/dist/scripts/create-admin.js ...`).

---

## 4. Pre-push verification gate (never skip)

1. `npm run build` — all outputs produced.
2. Test suite passes.
3. Boot exactly as the panel will: `NODE_ENV=production npm start`.
4. Curl checks against the local port:
   - `/health` → 200
   - `/` → HTML referencing `/assets/*.css|js` (default mode) or
     `/static/css|js` (when `PANEL_ASSET_REWRITE=true`)
   - one CSS and one JS asset URL from the HTML → 200 with correct MIME
   - a deep SPA route → 200 (fallback returns index.html)
5. Only then commit and push.

---

## 5. Deploy workflow

- Mode A: push to `main` → deployment script runs → app restarts. Verify
  `curl http://127.0.0.1:$PORT/health` on the server.
- Mode B: push to `main` → Actions builds/pushes GHCR image → xCloud pulls
  and restarts (manually or via the optional webhook step in the workflow).
- Browsers may cache old HTML after a fix: hard-refresh (Ctrl+Shift+R).

---

## 6. Panel settings template

### Mode A (native Node.js)

| Setting | Value |
|---|---|
| Site type | Node.js → Clone a Git Repository |
| Repository | `<user>/<repo>`, branch `main` |
| Node.js version | 20 or 22 |
| Build command | `npm run build` |
| Start command | `npm start` |
| Deployment script | `cd /site/path && npm install --include=dev && npm run build` |
| Env vars | `NODE_ENV=production`, `SESSION_SECRET`, `CORS_ORIGIN` |

### Mode B (Custom Docker)

| Setting | Value |
|---|---|
| Site type | Custom Docker |
| Repository | `<user>/<repo>`, branch `main` |
| Compose file | `docker-compose.yml` (repo root) |
| Exposed port | `3000` (the single host port in compose) |
| Env vars | `SESSION_SECRET`, `CORS_ORIGIN` (injected into compose) |
| Registry | `ghcr.io/<user>/<repo>:latest` (public, built by GitHub Actions) |

---

## 7. Known limitations & gotchas

- **WebSockets:** the panel proxy may omit `Upgrade` headers; Socket.io falls
  back to long-polling. Verify live features after deploy.
- **Docker never builds:** a compose file with `build:` silently breaks on
  xCloud — always reference a pre-built registry image.
- **Reserved ports:** host ports 80/443 belong to xCloud's nginx; the app's
  exposed port must be >=1024.
- **Re-clone risk:** if the panel re-clones the site directory, `.env` and
  `data/` are lost (gitignored). Keep DB backups (xCloud cron +
  `scripts/backup.sh`).
- **Tracked dist churn:** the panel-side build rewrites committed `dist/`
  files; use `git checkout -- . && git pull` if a later pull conflicts.
- **Node version:** pick 20 or 22 in the panel; match the Dockerfile's Node
  version when building images.

---

## 8. Reference implementations

- ELITEQuest (Vite + React SPA, Express API):
  - root `index.js` — start shim (`npm start` → `node index.js`), PORT
    fallback 3000
  - `docker-compose.yml`, `Dockerfile`,
    `.github/workflows/docker-build.yml` — Custom Docker path
  - `docs/DEPLOYMENT-XCLOUD.md` — per-path settings and steps
  - `server/src/index.ts` — `PANEL_ASSET_REWRITE` opt-in for nginx quirks

Consult these before improvising; the patterns are proven on this panel.
