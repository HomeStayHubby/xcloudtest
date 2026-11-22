# Bugfix: CPGuardX Panel 404 on Static Assets (Blank Page)

## Status

- Version target: 0.18.1
- Started: 2026-10-27
- Completed: 2026-10-27

## Tasks

- [x] Add extensionless static routes `/static/css/:name` and `/static/js/:name` in `server/src/index.ts`
- [x] Serve SPA `index.html` with asset URLs rewritten from `/assets/*.*` to `/static/*` (runtime transform)
- [x] Disable `express.static` directory index so `/` uses the transformed HTML
- [x] Guard routes against path traversal (`path.basename` + name allowlist + existence check)
- [x] Add `server/src/static-assets.test.ts` covering transformed index, css/js routes, 404s
- [x] Verify with a local boot: `/`, `/static/css/...`, `/static/js/...`, logo png, `/health`
- [x] Document the panel nginx static-interception caveat in `docs/DEPLOYMENT.md`
- [x] Bump version to 0.18.1 in `package.json` and `version.md`
- [x] Run tests and lint (67/67 tests pass; lint errors pre-existing, none in changed files)
- [x] Commit and push to `main`

## Notes

- Root cause (learned from the DeltaPULSE project, `BookingMan/DEPLOY.md`):
  cPGUARDx's nginx intercepts `*.css`/`*.js` URLs before they are proxied to
  the Node app and serves them from the panel document root, returning 404.
  Extensionless URLs are proxied normally, which is why the HTML and all
  `/api/v1/...` calls worked while only the hashed Vite assets failed.
- Images are not intercepted (DeltaPULSE ships `.png` URLs unchanged), so the
  logo needed no change.
- Source maps remain excluded from git; the runtime transform is
  hash-agnostic, so rebuilt assets need no code change.
