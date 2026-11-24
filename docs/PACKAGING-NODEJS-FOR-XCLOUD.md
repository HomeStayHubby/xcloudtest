# Packaging a Node.js App for xCloud (Git Deployment)

A generic, battle-tested guide for packaging **any** Node.js application so it
can be pushed to GitHub and deployed through the
[xCloud](https://xcloud.host) panel's **Deploy via Git** flow.

Distilled from a real cPGuardX → xCloud 3.0 migration (Nov 2026) and verified
against the official docs. Every rule below traces to a concrete failure we
hit or a documented panel constraint.

Related docs in this repo:

- `skill_xcloud_deployment.md` — agent-oriented rule summary
- `docs/DEPLOYMENT-XCLOUD.md` — ELITEQuest-specific deployment guide

---

## 1. TL;DR checklist

Before pushing to GitHub, make sure:

- [ ] `package.json` has a `start` script that boots the app directly
      (e.g. `"start": "node server.js"`) — xCloud's default start is
      `npm run start`
- [ ] The app reads `process.env.PORT` with a fallback (e.g. 3000) and never
      binds 80/443
- [ ] The app listens on **all interfaces** (the default for
      `server.listen(port)`), not just `localhost`
- [ ] `npm install --no-audit --no-fund && npm run build` succeeds from a
      cold clone (build tools live in devDependencies and get installed)
- [ ] If the repo root has `"type": "module"`, any PM2 config is named
      `ecosystem.config.cjs` — or ship no PM2 config at all (preferred)
- [ ] The SQLite file path / database expectation matches what the panel will
      inject — SQLite apps must run with **No Database** in xCloud
- [ ] `.gitignore` covers `node_modules/`, `.env`, and runtime data; `.env`
      itself is never committed
- [ ] One-time provisioning (first admin, seeds) is an idempotent script that
      runs from built output
- [ ] You know which **serving mode** the app needs: SSR (Node process) for
      APIs/SPAs served by Express, Static for pre-built output only
- [ ] Verified locally: build → tests → `NODE_ENV=production npm start` →
      `curl http://127.0.0.1:3000/health`

---

## 2. How xCloud's git deploy actually works

```
git push → xCloud: git pull → Build & deploy script → PM2 start → health probe
```

1. **Pull**: xCloud resets the site's code folder to the selected branch on
   every deploy. An untracked `.env` in the site root survives; anything else
   untracked (outside `.env`) is wiped.
2. **Build & deploy script**: runs **from the site's code folder** — a correct
   script contains **no `cd` line**. Older templates and third-party guides
   show `cd /your/site/path`; that is a placeholder that always fails.
   xCloud pre-fills the install command for your package manager and adds
   `npm run build` when `package.json` defines a build script. For npm:
   `$XCLOUD_NPM install --no-audit --no-fund` then `npm run build`.
   New sites stop the script at the first failing command.
3. **PM2 start**: the app runs under PM2 (fork mode) as the site's Linux
   user, started with the configured start command. PM2 is auto-configured as
   a systemd service (`pm2-<user>.service`) for boot persistence.
4. **Health probe**: xCloud waits for the app to answer on the configured
   **Application Port** and requires the process set to stay stable
   (online, same name, at most one restart) during the health window.

**Division of responsibility**: xCloud owns Nginx on 80/443, SSL, and domain
routing. Your app owns a single port (>= 1024) that xCloud proxies to at
`127.0.0.1:<Application Port>`. Never bind 80/443, never add your own SSL.

**Serving modes** (chosen at site creation):

| Mode | Use for |
|---|---|
| **SSR (Node process)** | Express/NestJS APIs, SPA + API served by one process, Next.js SSR |
| **Static** | Pre-built static output only (no persistent Node process) |
| **Hybrid** | Generated static assets **plus** a running Node process |

---

## 3. Repository packaging rules

### R1 — package.json contract

```json
{
  "name": "my-app",
  "type": "module",
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "start": "node index.js"
  },
  "engines": { "node": ">=18.0.0" }
}
```

- `start` must boot the app directly from the repo root. Avoid
  `cd subfolder && npm start` chains — the panel runs it from the code
  folder.
- Commit an up-to-date lockfile (`package-lock.json` for npm). xCloud picks
  the package manager from the `packageManager` field, then the lockfile,
  then defaults to npm. Two different lockfiles trigger a warning and an npm
  fallback.
- Monorepos: `npm run build --workspaces --if-present` beats `cd`-chained
  workspace builds (dependency order is respected topologically).

### R2 — Port and network binding

```js
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on port ${port}`));
```

- Read `PORT` from the environment; keep a fallback. Never hardcode and never
  use 80/443.
- **Bind all interfaces.** If you bind `localhost` explicitly, note that on
  current Node versions `localhost` can resolve to IPv6 `::1` — the app then
  works over SSH but xCloud's probe (which targets `127.0.0.1`) sees nothing
  and the site 502s. Omitting the host argument binds `::`/`0.0.0.0` and
  covers both.
- The **Application Port** in the panel's SSR Configuration must equal the
  port the app actually listens on. If you change one, change both (or set
  `PORT` in the site Environment to the panel's value and always read it).

### R3 — Cold-clone buildability

- TypeScript/Vite/etc. are devDependencies; xCloud's default install
  **includes** dev dependencies. If a deployment log shows missing build
  tools, make the script explicit: `npm install --include=dev`.
- Building on small VPS instances is xCloud's normal flow and is fine for
  typical apps. As a resilience net you may also commit built `dist/` output
  (optional): the app then boots even if the build step is skipped, and the
  code-folder reset means tracked `dist/` never causes git conflicts on
  xCloud (unlike manual `git pull` servers).

### R4 — PM2 config: the `.cjs` trap (important)

xCloud auto-detects `ecosystem.config.js` at the repo root and treats it as a
**custom ecosystem config** whose every process must stay online, keep its
name, and restart at most once during the health window. Two pitfalls:

1. If the root `package.json` sets `"type": "module"` (typical for modern
   Node apps), a CommonJS `ecosystem.config.js` (`module.exports = {...}`)
   **cannot be loaded by PM2** — the deploy fails with
   `[PM2][ERROR] File .../ecosystem.config.js malformated — ReferenceError:
   module is not defined in ES module scope`, 0 processes start, and the
   health gate fails (often mislabeled "Port already in use" in the summary).
2. If a custom ecosystem config IS loaded, its settings (script, env, name)
   override the panel's SSR start command — a stale config can silently point
   PM2 at the wrong script or port.

**Recommendation: ship no PM2 config at all** and let xCloud manage the
process from the SSR settings. If you need one for manual VPS deployments,
name it `ecosystem.config.cjs` (the `.cjs` extension parses as CommonJS even
under `"type": "module"`), keep it minimal, and make sure its script, env,
and port match the panel settings exactly.

### R5 — Environment variables

- Secrets and runtime config go in the panel: site → **Environment**
  (xCloud keeps an untracked `.env` in the site root across deploys).
- Never commit `.env`. Keep it in `.gitignore` — a committed `.env` is
  replaced on every deploy, and an untracked `.env` in a subfolder is
  removed.
- xCloud may draft the initial env file from the repo's `.env.example`
  (sample first, AI draft second). Review it: example values like
  `CORS_ORIGIN=http://localhost:5173` are dev defaults — same-origin
  deployments tolerate them, but set the real values for production anyway.
- Required for production: `NODE_ENV=production`, a long random
  `SESSION_SECRET` (16+ chars), and the public origin for CORS if the app
  enforces it. Enable `trust proxy` in production so `secure` cookies work
  behind xCloud's Nginx.
- Changing Environment values restarts the managed process (brief blip).

### R6 — Databases: the managed-DB injection trap

Selecting a managed database (e.g. PostgreSQL 17) at site creation makes
xCloud inject `DATABASE_URL=postgresql://...` (plus companion vars) into the
site environment.

- **SQLite apps must not receive that variable.** sqlite3 opens file paths;
  a `postgres://` URL produces a `SQLITE_CANTOPEN` crash loop (and the
  misleading "Port already in use" summary). Either pick **No Database** at
  creation, or override/delete `DATABASE_URL` in the site Environment.
- Fail fast in code: validate `DATABASE_URL` at startup and refuse
  connection-URL values with a message that names the variable and the fix.
- Postgres-backed apps: keep the selection — xCloud creates the DB and role
  and injects the connection vars for you.

### R7 — One-time provisioning must be scripted

Anything needed after the first deploy (first admin, seed data) must be an
idempotent script that runs from **built output**, e.g.:

```bash
node server/dist/scripts/create-admin.js you@example.edu yourpassword
```

Run it once from the code folder via the panel's file manager/SSH. Document
the exact command in the repo.

### R8 — Static assets and same-origin serving

An SSR deployment serves both the API and (if applicable) the built SPA from
one process and one origin — same-origin requests bypass CORS entirely, so
strict CORS defaults are safe. Keep asset URLs relative to the deployment
root (Vite defaults are fine). Do not add your own reverse proxy, SSL, or
absolute asset URLs pointing at another origin.

### R9 — `.gitignore` requirements

```gitignore
node_modules/
.env
.env.local
*.log
data/          # runtime data (SQLite files, sessions, uploads)
dist/**/*.map  # optional: keep source maps out of committed dist
```

---

## 4. Site creation settings (copy-paste)

xCloud dashboard → server → **+ Add New Site** → **Deploy via Git**:

| Setting | Value |
|---|---|
| Repository / branch | `<user>/<repo>` / `main` |
| Application type | Node.js (confirm auto-detection) |
| Serving mode | **SSR (Node process)** for APIs / SPA+API |
| Start command | `npm start` |
| Application Port | `3000` (must match the app; the app reads `PORT` when injected) |
| Node.js version | 20 or 22 |
| Database | **No Database** for SQLite apps; PostgreSQL for PG-backed apps |
| Build & deploy script | `$XCLOUD_NPM install --no-audit --no-fund` then `npm run build` — **no `cd` line** |
| Domain | Use the generated **staging domain (no DNS)** for the first deploy |

Push-to-deploy: enable the toggle, copy the webhook URL into
GitHub → repo → Settings → Webhooks (content type `application/json`).
After that, pushing to `main` deploys.

---

## 5. Post-deploy verification

1. **Deployment log**: no `[PM2][ERROR]` lines; script ran install + build
   cleanly.
2. **PM2 Log** (site → Monitoring → Logs → **PM2 Log**): expect your startup
   line, e.g. `Server running on port 3000` / `Database opened: <path>`.
3. **Staging domain**: loads the app (hard-refresh Ctrl+Shift+R to bypass
   cache).
4. From SSH (as the site user):

   ```bash
   curl http://127.0.0.1:3000/health   # whatever your health endpoint is
   ```

5. Exercise one real flow (login, one API call) before pointing DNS at it.

---

## 6. Troubleshooting (battle-tested signatures)

| Symptom (exact log text) | Real cause / fix |
|---|---|
| `cd: /your/site/path: No such file or directory` at script line 1 | Unreplaced placeholder from an old template. xCloud runs the script from the code folder — **delete the `cd` line** |
| Build step fails, missing `tsc`/`vite` | Dev dependencies were pruned. Script must install with `npm install --include=dev` before `npm run build` |
| `[PM2][ERROR] File .../ecosystem.config.js malformated` + `module is not defined in ES module scope` | Root `package.json` has `"type": "module"`; a CJS `.js` PM2 config can't load → 0 processes → health gate fails. Remove the config or rename to `ecosystem.config.cjs` |
| Crash loop with `Failed to open database ... SQLITE_CANTOPEN` | `DATABASE_URL` env holds a `postgres://` URL (injected because a managed database was selected) but the app expects a SQLite file. Fix: **No Database**, or override `DATABASE_URL=./data/app.db` in Environment |
| Summary says **"Port already in use"** but nothing listens on the port | Misleading generic summary for any health-gate failure (0 processes, crash loop). Read the full deploy log for the real PM2 error first. Genuine conflicts: `pm2 ls` / `pm2 kill`, `sudo ss -ltnp \| grep <port>` |
| Site 502s; app works over SSH | App bound `localhost` (resolves to IPv6 `::1`), probe targets `127.0.0.1`. Bind all interfaces (omit the host in `listen()`). Also confirm Application Port == app port |
| App boots but page is blank | Old cached HTML — hard refresh. If a panel-side nginx intercepts `*.css`/`*.js` URLs (rare on xCloud), serve assets through a same-origin route or opt-in rewrite flag |
| Live features lag | WebSocket `Upgrade` headers missing through the proxy — Socket.io falls back to HTTP long-polling (works, slightly slower). Add upgrade headers via custom Nginx directives if available |
| Deployment fails during build with no clear error | Open the deployment log for the exact failing command; reproduce locally with a cold clone: `npm install --no-audit --no-fund && npm run build` |

---

## 7. Appendix — Custom Docker path (alternative)

For containerized apps, xCloud offers **Custom Docker** sites. The model is
different: xCloud **never builds images** — on every push it runs
`docker-compose pull && docker-compose up -d` from the repo's
`docker-compose.yml`.

Rules (all mandatory):

- No `build:` directives — images must be pre-built by CI (GitHub Actions →
  GHCR is the usual flow) and referenced via `image: ghcr.io/<user>/<repo>:latest`
- Never bind host ports 80/443 (xCloud's nginx owns them); expose exactly one
  host port (>= 1024) and set it as the site's **exposed port**
- Secrets via `${VAR}` interpolation from the panel; never hardcode
- Relative volume paths only (working directory = repo checkout)
- Make the GHCR package **public** or xCloud cannot pull it

---

## 8. Reference implementation

ELITEQuest (Express API + Vite/React SPA, SQLite, npm-workspaces monorepo) —
deployed on xCloud exactly per this guide:

- Repo: <https://github.com/HomeStayHubby/xcloudtest>
- Root `index.js` — start shim (`npm start` → `node index.js`), `PORT`
  fallback
- `server/src/shared/env.ts` — `DATABASE_URL` fail-fast validation
- `ecosystem.config.cjs` — manual-VPS PM2 config kept out of xCloud's way
- `docs/DEPLOYMENT-XCLOUD.md` — per-app settings, env, admin, backups
- `.github/workflows/docker-build.yml` + `docker-compose.yml` + `Dockerfile`
  — the Custom Docker alternative, GHCR-built
