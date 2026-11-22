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

1. xCloud dashboard → select your server → **+ Add New Site**.
2. Choose the **Node.js** tab → **Clone a Git Repository**.
3. Connect GitHub and select `homestayhubby/xcloudtest`, branch `main`.
4. **Node.js version:** 20 or 22 (the app supports 18+; 22 LTS recommended).
5. Domain: add your domain (xCloud provisions SSL automatically).

### 2. App settings

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Start command | `npm start` |
| Node.js version | 20 or 22 |

- `npm start` runs `node index.js` (repo root), which loads
  `server/dist/index.js`. xCloud injects `PORT` automatically; the entry point
  falls back to `3000` if unset.
- The repo is an npm-workspaces monorepo; `npm run build` builds `shared`,
  `server`, and `client` in dependency order.
- Compiled `dist/` output is also committed to git, so the app boots even if
  the panel-side build step is skipped or fails.

### 3. Deployment script

xCloud runs a deployment script on every push (Push to Deploy). Make sure it
includes the install and build steps:

```bash
cd /your/site/path
npm install --include=dev
npm run build
```

`--include=dev` matters: TypeScript, Vite, and other build tools are
devDependencies, and some panels install with dev dependencies omitted.

### 4. Environment variables

Add these in the xCloud site settings (environment panel) or in a `.env` file
at the application directory root (never committed):

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | long random string (`openssl rand -base64 48`) |
| `CORS_ORIGIN` | your public URL, e.g. `https://quest.example.edu` |
| `PORT` | optional — xCloud injects it; app defaults to `3000` |

Optional: `GROQ_API_KEY` / `GROQ_MODEL` bootstrap values for AI question
generation (admin-managed settings take precedence once stored).

The SQLite database and session store are created automatically in `data/`
at the application directory root.

### 5. First admin account

One-time, from the application directory root:

```bash
node server/dist/scripts/create-admin.js you@example.edu your_secure_password
```

### 6. Push to deploy

Enable xCloud's **Push to Deploy** toggle and copy the webhook URL into
GitHub → repo → Settings → Webhooks (content type `application/json`).
After that, pushing to `main` deploys.

### 7. Notes and caveats

- **Tracked dist vs git pull:** `npm run build` rewrites the tracked
  `dist/` files on the server. If a later `git pull` refuses with
  "local changes would be overwritten", run
  `git checkout -- . && git pull` in the application directory (or
  `git stash push -m "pre-pull"` first and drop it after a clean pull).
- **WebSockets:** if xCloud's Nginx does not forward `Upgrade` headers,
  Socket.io falls back to HTTP long-polling — live features still work with
  slightly higher latency. If custom Nginx directives are available, add
  `proxy_set_header Upgrade $http_upgrade;` and
  `proxy_set_header Connection "upgrade";` to the location block.
- **Verify from the server:** `curl http://127.0.0.1:$PORT/health` should
  return `{"status":"ok"}`.
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
| Deployment fails during build | Check the xCloud build log: usually missing dev dependencies — the deployment script must run `npm install --include=dev` before `npm run build` |
| App boots but site is unresponsive | Port mismatch — confirm the exposed/listener port matches `PORT` (app defaults to 3000 when xCloud does not inject it) |
| 502 after deploy | Container/app crashed on boot — read logs (`pm2 logs` on native, `docker compose logs app` on Docker); `SESSION_SECRET` must be at least 16 chars |
| Login fails via HTTPS | `NODE_ENV=production` must be set so `trust proxy` and `secure` cookies work behind xCloud's nginx |
| Blank page | Hard-refresh (Ctrl+Shift+R); if a panel-side nginx intercepts `*.css`/`*.js` URLs, set `PANEL_ASSET_REWRITE=true` in the environment |
| Live features lag | WebSocket upgrade headers missing — Socket.io long-polling fallback is active; add the Nginx upgrade headers if xCloud exposes custom directives |

## Legacy: cPGuardX

The `elitequest` repository was previously packaged for the cPGuardX panel
(start command `node index.js`, local listener 3001, forced extensionless
asset URLs). This xCloud build serves Vite's original asset URLs by default;
if you ever need the cPGuardX behavior again, set `PANEL_ASSET_REWRITE=true`
in the environment — no code change required.
