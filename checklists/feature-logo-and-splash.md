# Feature: Logo and Splash Modal

## Status

- Version target: 0.17.0
- Started: 2026-09-30
- Completed: 2026-09-30

## Tasks

- [x] Copy `assets/EliteQuest_Logo.png` to `client/public/ELITEQuest_Logo.png`.
- [x] Create `client/src/version.ts` exporting the app version.
- [x] Create `client/src/components/Logo.tsx` with header/login/splash sizes and click support.
- [x] Create `client/src/components/SplashModal.tsx` with fade-in, Esc, and backdrop click close.
- [x] Wire logo into `App.tsx` header (clickable, links to dashboard/home).
- [x] Wire logo into `LoginPage.tsx` above the form title.
- [x] Add splash and logo styles to `client/src/styles/global.css`.
- [x] Bump version to `0.17.0` in `version.md` and `package.json`.
- [x] Run `npm run build` and `npm test` to verify.

## Notes

- Logo stays at the repo root `assets/` and a copy is kept in `client/public/` for Vite static serving.
- Splash modal is intentionally simple: full backdrop, big centered logo, version text below.
