# Feature: Professional but Fun UI Redesign

## Status

- Version target: 0.16.0
- Started: 2026-09-29
- Completed: 2026-09-29

## Tasks

- [x] Load Outfit font and refresh global CSS tokens + checkbox fix
- [x] Install @dnd-kit dependencies in client
- [x] Build reusable DnD/MatchGraph/WordCloud/Brainstorm components
- [x] Update PlayPage interactive question widgets
- [x] Update QuizEditPage grouping/matching editors
- [x] Update QuizRunPage word cloud + brainstorming panels
- [x] Update LiveDisplayPage word cloud + brainstorming panels
- [x] Update server aggregation for per-submitter brainstorming data
- [x] Apply layout polish to remaining pages
- [x] Bump version and changelog
- [x] Run builds and tests, fix regressions

## Notes

Keep React, add @dnd-kit/core + sortable + utilities. Use Outfit from Google Fonts.
Scoped CSS modules for new interactive widgets; refresh global.css tokens.
Matching: click left/right island pairs with animated SVG curves (v1).
Word cloud: size by frequency, colours, click to fade-in submitters modal.
Brainstorming: post-it notes, per-author colours, name toggle (default off).
Fix checkbox alignment across forms.
