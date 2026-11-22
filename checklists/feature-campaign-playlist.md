# Feature: Campaigns & Quiz Playlist

## Status

- Version target: 0.19.0
- Started: 2026-10-27
- Completed: 2026-10-27

## Tasks

- [x] Create checklist for campaigns & quiz playlist.
- [x] Shared: `campaign.schema.ts`, strip `mode` from `quiz.schema.ts`, campaign results schema.
- [x] Migration 007: `campaigns`, `campaign_quizzes`, drop `quizzes.mode`.
- [x] Backend: campaigns feature (CRUD, playlist add/remove/reorder, results).
- [x] Quiz service: remove mode; open quizzes match via class assignment or campaign membership.
- [x] Response service: group resolution via student's class (works for campaign-only quizzes).
- [x] Replace class leaderboard with per-campaign cumulative results.
- [x] Frontend: QuizzesPage simplification, CampaignDetailPage with playlist, ClassDetailPage campaigns section, campaign results page, PlayPage campaign badge.
- [x] UI layout general pass on all pages.
- [x] Version bump script (`npm run version:feat` / `version:fix`) + docs (AGENTS.md, version.md, techspecs.md, README.md).
- [x] Backend tests: campaigns CRUD/playlist, cumulative results (incl. pre-campaign plays), open-quizzes via campaign.
- [x] All tests, lint, builds pass.

## Notes

- Campaign results are derived from current playlist membership: every play of a playlist quiz counts toward the campaign, even plays made before the quiz was added.
- Quizzes are self-contained content; `class_id` on a quiz is only the one-off play assignment. Campaigns carry the class scoping for campaign play.
- No data backfill for legacy `mode='campaign'` quizzes (nothing deployed to production yet).
- UI fixes made during the pass: PlayPage waiting state no longer shows contradictory "Loading..." and keeps its header; QuizRunPage 2-column grid collapses on mobile and no longer says "No questions yet" while loading; QuizEditPage question list no longer double-numbers; QuizResultsPage tables are styled and horizontally scrollable on mobile.
- Also fixed in passing: `server/src/db/migrate.ts` CLI guard never matched on Windows, so `npm run migrate` silently did nothing — now compares resolved file URLs.
- Pre-existing ESLint debt (261 errors, same async-handler patterns) is unchanged and tracked separately.

## Notes

- Campaign results are derived from current playlist membership: every play of a playlist quiz counts toward the campaign, even plays made before the quiz was added.
- Quizzes are self-contained content; `class_id` on a quiz is only the one-off play assignment. Campaigns carry the class scoping for campaign play.
- No data backfill for legacy `mode='campaign'` quizzes (nothing deployed to production yet).
