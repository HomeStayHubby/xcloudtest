# ELITEQuest on xCloud 3.0

This guide covers deploying ELITEQuest to a server managed by the
[xCloud](https://xcloud.host) panel. Two paths are supported:

| Path | When to use | Build happens |
|---|---|---|
| **A. Native Node.js site** (recommended) | Standard deployment; SQLite data stays on the server filesystem | On the server, via the xCloud deployment script |
| **B. Custom Docker** | If you prefer containerized deployments | In GitHub Actions; xCloud only pulls the image |

xCloud owns ports 80/443 with its own Nginx + SSL. ELITEQuest must never bind
those; it listens on the `PORT` xCloud provides (defaults to 3000).

## Path A — Native Node.js site (recommended)

### 1. Create the site

1. xCloud dashboard → select your server → **+ Add New Site** →
   **Deploy via Git**.
2. Select `homestayhubby/xcloudtest`, branch `main`. xCloud auto-detects the
   app type — confirm it is **Node.js**.
3. **Serving mode:** **SSR (Node process)** — ELITEQuest keeps a Node process
   running (Express + Socket.io).
4. **Start command:** `npm start` · **Application Port:** `3000` (must match
   the app; the entry point reads `PORT` when xCloud injects it and falls
   back to 3000).
5. **Node.js version:** 20 or 22 (the app supports 18+; 22 LTS recommended).
6. Domain: use the generated **staging domain (no DNS)** for the first
   deploy, or configure your live domain.

### 2. Build & deploy script

The script runs after xCloud pulls the branch, **from the site's code
folder** — it must NOT contain a `cd` line. Older templates and third-party
guides show `cd /your/site/path`; that placeholder fails with
"cd: /your/site/path: No such file or directory". For this repo the script
is simply:

```bash
$XCLOUD_NPM install --no-audit --no-fund
npm run build
```

- `$XCLOUD_NPM` is xCloud's npm variable; `npm install --no-audit --no-fund`
  works identically.
- The repo is an npm-workspaces monorepo; `npm run build` builds `shared`,
  `server`, and `client` in dependency order.
- Compiled `dist/` output is also committed to git, so the app boots even if
  the build step is skipped or fails.

### 3. Environment variables

Configure via the site's **Environment** panel (xCloud keeps an untracked
`.env` in the site root across deploys) or a `.env` file at the site root
(never committed):

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | long random string (`openssl rand -base64 48`) |
| `CORS_ORIGIN` | your public URL, e.g. `https://quest.example.edu` |
| `PORT` | optional — set it to the Application Port from SSR Configuration if xCloud does not inject it; the app defaults to `3000` |

Optional: `GROQ_API_KEY` / `GROQ_MODEL` bootstrap values for AI question
generation (admin-managed settings take precedence once stored).

The SQLite database and session store are created automatically in `data/`
at the site's code folder.

### 4. First admin account

One-time, from the site's code folder:

```bash
node server/dist/scripts/create-admin.js you@example.edu your_secure_password
```

### 5. Push to deploy

Enable xCloud's **Push to Deploy** toggle and copy the webhook URL into
GitHub → repo → Settings → Webhooks (content type `application/json`).
After that, pushing to `main` deploys.

### 6. Notes and caveats

- **Code folder resets:** each git deploy resets the code folder, so the
  tracked `dist/` files rebuilt by the deploy script never cause git
  conflicts. xCloud keeps an untracked `.env` in the site root across
  deploys; the SQLite `data/` folder is not tracked by git and survives.
  Keep a DB backup regardless (see below).
- **WebSockets:** if xCloud's Nginx does not forward `Upgrade` headers,
  Socket.io falls back to HTTP long-polling — live features still work with
  slightly higher latency. If custom Nginx directives are available, add
  `proxy_set_header Upgrade $http_upgrade;` and
  `proxy_set_header Connection "upgrade";` to the location block.
- **Verify from the server:** `curl http://127.0.0.1:3000/health` should
  return `{"status":"ok"}` (use the Application Port from SSR
  Configuration).
- **Logs:** site → Monitoring → Logs → **PM2 Log** holds the app's own
  stdout/stderr (startup messages, crashes, stack traces).
- **Backups:** schedule `scripts/backup.sh` via the xCloud cron feature:
  `0 3 * * * ELITEQUEST_ROOT=/path/to/site /path/to/site/scripts/backup.sh`.

## Path B — Custom Docker

xCloud never builds images. GitHub Actions builds the image on every push to
`main` (see `.github/workflows/docker-build.yml`) and pushes it to
`ghcr.io/homestayhubby/xcloudtest`. xCloud then only runs
`docker-compose pull && docker-compose up -d` from the repo's
`docker-compose.yml`.

### 1. One-time GitHub setup

1. After the first push to `main`, check the **Actions** tab — the
   "Build and Push Docker Image" workflow must be green.
2. Make the image public: repo → Packages → `xcloudtest` → Package settings →
   Change visibility → **Public** (required so xCloud can pull it).

### 2. Create the site

1. xCloud dashboard → **+ Add New Site** → **Custom Docker**.
2. Connect the git repo `homestayhubby/xcloudtest`, branch `main`
   (xCloud reads the `docker-compose.yml` at the repo root).
3. **Exposed port:** `3000` (matches the compose `3000:3000` mapping; xCloud's
   nginx proxies 80/443 to it).
4. Environment variables (xCloud injects them into compose interpolation):

   | Variable | Value |
   |---|---|
   | `SESSION_SECRET` | long random string |
   | `CORS_ORIGIN` | your public URL |

5. Deploy.

### 3. Data and admin

- The compose file maps `./data` (relative to the repo checkout on the
  server) into the container at `/app/data`, which holds the SQLite database
  and session store. Back that directory up.
- First admin, from the server shell:

  ```bash
  docker compose -f /path/to/repo/docker-compose.yml exec app \
    node server/dist/scripts/create-admin.js you@example.edu your_secure_password
  ```

### 4. Redeploys

Every push to `main` rebuilds the GHCR image. To make xCloud pick it up
automatically, enable the commented "Trigger xCloud deploy" step in
`.github/workflows/docker-build.yml` and store the webhook URL from xCloud
(site settings → Git Deploy → Webhook URL) as the GitHub secret
`XCLOUD_DEPLOY_WEBHOOK`.

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Deploy script fails at line 1: `cd: /your/site/path: No such file or directory` (exit code 1) | The script contains an unreplaced `cd /your/site/path` placeholder from an old template. xCloud runs the script from the site's code folder after pulling — **delete the `cd` line** and keep only the install + build commands (see section 2) |
| Deployment fails during build | Open the deployment log for the exact failing command; compare with a local `npm install --no-audit --no-fund && npm run build`. If the panel prunes dev dependencies, prefix the install with `npm install --include=dev` |
| App boots but site is unresponsive / 502 | The app isn't listening on the port xCloud expects. Open SSR Configuration and confirm the **Application Port** matches the app (3000 by default; set `PORT` in Environment if you change it). Then check Monitoring → Logs → PM2 Log for a startup crash (`SESSION_SECRET` must be at least 16 chars) |
| Deployment fails at the health step: `[PM2][ERROR] File /var/www/<site>/ecosystem.config.js malformated` / `module is not defined in ES module scope`, followed by "process set is not stable" | xCloud auto-detects `ecosystem.config.js` as a custom PM2 config, but the repo root sets `"type": "module"`, so a CommonJS `module.exports` config in a `.js` file cannot load — PM2 starts 0 processes. Fixed in this repo by shipping `ecosystem.config.cjs` (no `ecosystem.config.js` exists, so xCloud uses its own start command). If you re-add a PM2 config for a panel, keep the `.cjs` extension |
| Boot crash-loops with `Failed to open database ... SQLITE_CANTOPEN` (health step then fails) | `DATABASE_URL` in the site environment is not a SQLite file path — selecting a managed database (e.g. PostgreSQL) at site creation makes xCloud inject a `postgres://` URL, which sqlite3 cannot open. Fix: Database Management → **No Database**, or set `DATABASE_URL=./data/elitequest.db` in Environment. The app now fails fast at startup with an explicit message when it sees a connection URL |
| Deployment fails with "Port already in use" during the health step | Often a misleading summary when the health check finds 0 processes or a crash loop (check the full deploy log for the real PM2 error first). If a process genuinely holds the port: SSH in as the site user: `pm2 ls`, then `pm2 kill`, confirm with `sudo ss -ltnp | grep <port>`, and deploy again. Alternative without SSH: change SSR Application Port (e.g. 3100) and add `PORT=3100` to Environment so app and probe agree |
| Login fails via HTTPS | `NODE_ENV=production` must be set so `trust proxy` and `secure` cookies work behind xCloud's nginx |
| Blank page | Hard-refresh (Ctrl+Shift+R); if a panel-side nginx intercepts `*.css`/`*.js` URLs, set `PANEL_ASSET_REWRITE=true` in the environment |
| Live features lag | WebSocket upgrade headers missing — Socket.io long-polling fallback is active; add the Nginx upgrade headers if xCloud exposes custom directives |
| Dashboard half-set-up site can't be opened | Delete the incomplete site and re-create it via **Deploy via Git** following section 1 (serving mode SSR, port 3000, no `cd` in the deploy script); use the generated staging domain for the first deploy |

## Legacy: cPGuardX

The `elitequest` repository was previously packaged for the cPGuardX panel
(start command `node index.js`, local listener 3001, forced extensionless
asset URLs). This xCloud build serves Vite's original asset URLs by default;
if you ever need the cPGuardX behavior again, set `PANEL_ASSET_REWRITE=true`
in the environment — no code change required.
