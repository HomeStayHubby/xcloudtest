# ELITEQuest Deployment Guide

> **Primary deployment target is now the xCloud 3.0 panel** — see
> [DEPLOYMENT-XCLOUD.md](DEPLOYMENT-XCLOUD.md). This guide remains for manual
> Ubuntu VPS deployments (PM2 + Nginx) and documents the legacy cPGuardX
> panel setup in section 11.

This guide covers deploying ELITEQuest to a basic Vultr VPS running Ubuntu LTS.

## Prerequisites

- Ubuntu 22.04+ (Vultr default)
- A domain pointed at your VPS (optional, HTTPS recommended)
- Node.js LTS (v20+ recommended)
- npm, pm2, nginx, sqlite3 installed
- At least 1 vCPU / 1–2 GB RAM
- Port 22 open; 80 and 443 for HTTP/HTTPS

## 1. Server preparation

Log in as a sudo-capable user:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx sqlite3
node -v || curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
pm2 startup | sudo -u $(whoami) sh
```

## 2. App checkout and build

```bash
cd /srv
sudo git clone <your-repo> elitequest
sudo chown -R $USER:$USER /srv/elitequest
cd /srv/elitequest
npm ci --include=dev
npm run build
npm prune --omit=dev
```

> On low-memory instances, run `npm install && npm run build && npm prune --omit=dev` in stages, or build locally and upload the `dist` output.

## 3. Configure environment

```bash
cp .env.example .env
nano .env
```

Update these values:

| Variable | Notes |
|---|---|
| `SESSION_SECRET` | Random long string: `openssl rand -base64 48` |
| `CORS_ORIGIN` | Your public URL, e.g. `https://elitequest.example.edu` |
| `PORT` | `3000` is fine (Nginx proxies to it) |

The data directory (`data/`) and sessions store are created automatically.

## 4. Create your first admin

```bash
cd server
npm run create-admin -- you@example.com your_secure_password
```

## 5. Start the app with PM2

```bash
cd /srv/elitequest
pm2 start ecosystem.config.cjs
pm2 save
```

Confirm it resumed after a reboot:

```bash
sudo reboot now
pm2 status
```

## 6. Nginx reverse proxy

Create `/etc/nginx/sites-available/elitequest`:

```nginx
server {
    listen 80;
    server_name elitequest.example.edu;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/elitequest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

The `proxy_set_header Upgrade` + `Connection` lines are required for Socket.io.

## 7. HTTPS (recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d elitequest.example.edu
```

This will update the server block and add the redirect automatically.

> Note: with HTTPS from Nginx, session cookies will use `secure: true` (set automatically when `NODE_ENV=production`). The `trust proxy` setting required for this is enabled in `server/src/index.ts` for production.

## 8. Backups

- `data/elitequest.db` — the primary database (students, classes, quizzes, responses, etc.)
- `data/sessions.db` — session store (optional to back up)

Install cron and schedule the backup script:

```bash
chmod +x /srv/elitequest/scripts/backup.sh
crontab -e
# Add:
0 3 * * * /srv/elitequest/scripts/backup.sh >> /var/log/elitequest-backup.log 2>&1
```

To restore:

```bash
pm2 stop elitequest
cp backups/elitequest-YYYYMMDD-HHMMSS.db data/elitequest.db
pm2 restart elitequest
```

## 9. Updating

```bash
cd /srv/elitequest
git pull
npm install
pm2 restart elitequest
```

Migrations run automatically at startup. No build step is needed — compiled
output is committed to the repository (see section 11).

> **Never run `npm run build` on the VPS.** Building on the server rewrites
> the tracked `dist/` files, which makes the next `git pull` fail with
> "local changes would be overwritten". On a CPGuardX-panel deployment
> (section 11) the same applies, and building there also risks exhausting
> small-memory instances.
>
> If `node_modules` seems out of sync with the committed lockfile (e.g. after
> an accidental bare `npm install` with a different npm version), use
> `npm ci` once to reinstall exactly what `package-lock.json` pins.

## 10. Monitoring

- `pm2 logs elitequest` — live logs in `logs/` (`out.log`, `error.log`, `combined.log`).
- `pm2 status` — uptime, memory.
- Check `curl http://127.0.0.1:3000/health` from inside the VPS.

## Troubleshooting

| Issue | Action |
|---|---|
| `secure: true` login fails via HTTP | Ensure Nginx + certbot are serving HTTPS, and `NODE_ENV=production` is set |
| WebSocket connect fails in Safari/Chrome | Check Nginx `Upgrade`/`Connection` proxy headers |
| Disk full | Prune old backups in `backups/` |
| Server won't start | Check `port 3000` is free (`ss -ltnp`), look at `pm2 logs elitequest` |
| Blank page, 404 on `/assets/*.css`/`*.js` | Panel nginx intercepts static extensions — fixed since 0.18.1 via `/static/...` routes; redeploy latest `main` and restart |
| `git pull` refuses with "local changes would be overwritten" | The working tree holds generated files (from an accidental on-server build or `npm install` lockfile rewrite). If `git status` shows only `dist/` and/or `package-lock.json` changes, discard them and pull: `git checkout -- . && git pull` (or keep a safety copy first: `git stash push -m "pre-pull"` then `git stash drop` after a successful pull) |

## 11. CPGuardX panel deployment (Node.js app mode)

On a VPS managed by the CPGuardX control panel (Nginx + Apache), use the panel's
Node.js app mode instead of sections 5–7. The panel clones this repository,
manages the PM2 process, and reverse-proxies a domain to a local listener port.
Compiled output (`shared/dist`, `server/dist`, `client/dist`) is committed to the
repository, so **pushing to `main` is the deploy** — no build step is needed on
the VPS (safe for 1–2 GB RAM instances).

### Panel settings

| Setting | Value |
|---|---|
| Application directory | `elitequest` |
| Repository name | `EliteQUEST` |
| Repository URL | `https://github.com/HomeStayHubby/EliteQUEST.git` (fine-grained PAT) |
| Branch | `main` |
| PM2 process name | `elitequest` |
| Start command | `node index.js` |
| Auto restart | `true` |
| Process watch | `false` |
| Reverse proxy connection type | `http` |
| Local listener | `3001` |
| Public path | `/` |

The root `index.js` is the entry point for the panel's start command. It
defaults `PORT` to `3001` (the panel's local listener) and loads
`server/dist/index.js`.

### One-time VPS setup

1. Point the DNS record for `quest.mrchristian.fyi` at the VPS, then create the
   site and Node.js app in CPGuardX with the settings above. Provision SSL
   through the panel (Let's Encrypt).

2. Create `.env` in the application directory root (gitignored, never
   committed):

   ```env
   NODE_ENV=production
   CORS_ORIGIN=https://quest.mrchristian.fyi
   SESSION_SECRET=<output of: openssl rand -base64 48>
   ```

   `PORT` is optional — the entry point defaults it to `3001`. `DATABASE_URL`
   defaults to `./data/elitequest.db` at the application directory root, where
   the SQLite database and session store are created automatically.

3. Create the first admin from the application directory root:

   ```bash
   node server/dist/scripts/create-admin.js you@example.edu your_secure_password
   ```

4. Deploy: push to `main`; the panel pulls and restarts the PM2 process
   (`elitequest`). Verify with `curl http://127.0.0.1:3001/health` from the VPS.

### Backups on CPGuardX

`scripts/backup.sh` defaults to `/srv/elitequest`; set its root via
`ELITEQUEST_ROOT` to the panel's application directory, e.g. in crontab:

```
0 3 * * * ELITEQUEST_ROOT=/path/to/elitequest /path/to/elitequest/scripts/backup.sh >> /var/log/elitequest-backup.log 2>&1
```

### Notes and caveats

- Panel nginx setups commonly intercept `*.css` and `*.js` URLs before they
  reach Node, which would 404 Vite's hashed `/assets/...` files and render the
  SPA blank. ELITEQuest handles this automatically: `index.html` is served with
  extensionless asset URLs (`/static/css/<name>`, `/static/js/<name>`) backed by
  Express routes. This behaves identically behind a standard Nginx reverse
  proxy (section 6), so no per-environment configuration is needed. Images
  (e.g. `/ELITEQuest_Logo.png`) are not intercepted and are served normally.
- `.env` and `data/` are gitignored and live only on the VPS. If the panel ever
  re-clones the repository from scratch (rather than `git pull`), recreate
  `.env` and restore `data/elitequest.db` from backup (section 8).
- Panel reverse proxies often omit the WebSocket `Upgrade` headers. Socket.io
  then falls back to HTTP long-polling: live features still work, with higher
  latency and overhead. If CPGuardX exposes custom Nginx directives for the
  site, add these to the location block:

  ```nginx
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  ```

- `ecosystem.config.cjs` is not used by the panel (it manages PM2 itself); it
  remains for manual deployments per section 5. The `.cjs` extension is
  required because the root package.json sets `"type": "module"` — a
  `module.exports` config in a `.js` file would fail to load under Node 22+
  (this is also why hosting panels that auto-detect PM2 configs need the
  `.cjs` form; see `docs/DEPLOYMENT-XCLOUD.md`).
