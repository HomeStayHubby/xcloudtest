# Bugfix: VPS build failure (test files compiled into production build)

## Status

- Version target: 0.28.1
- Started: 2026-10-30
- Completed: 2026-10-30

## Tasks

- [x] Remove `as typeof fetch` cast in `stubFetch` (`ai-generation.service.test.ts`) so the mock return type is `unknown` and compiles under any TS/vitest version
- [x] Exclude `src/**/*.test.ts` from production builds in `server/tsconfig.json`, `shared/tsconfig.json`, `client/tsconfig.json`
- [x] Delete stale committed `*.test.js` / `*.test.d.ts` artifacts from `server/dist` and `shared/dist`
- [x] `docs/DEPLOYMENT.md` §9: never build on the VPS + `npm ci` note; §10: troubleshooting row for "git pull refuses (local changes)"
- [x] Verify: `npm run build` (all workspaces), full test suite (144 passed), dist contains no test artifacts, lint clean on touched files
- [x] Version bump 0.28.1 + changelog review

## Notes

- The failing file was a test file only; the committed runtime artifacts were never affected, so a VPS restart after `git pull` alone would have worked.
- Root cause of the environment discrepancy: the VPS resolved stricter TypeScript/vitest typings than the dev machine; removing the cast makes the test file version-agnostic.
- Excluding tests from `tsc` builds means vitest (esbuild transform) is the only thing that compiles tests at runtime — verified by the full suite still passing.
