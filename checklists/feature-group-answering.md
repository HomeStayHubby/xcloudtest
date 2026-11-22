# Feature: Group Management & Group Answering

## Status

- Version target: 0.6.0
- Started: 2026-08-27
- Completed: 2026-09-18

## Tasks

- [x] Create checklist.
- [x] Shared schemas for groups and group membership.
- [x] Backend: group CRUD within a class + student membership management.
- [x] Backend: responses support group answering (one response per group per question).
- [x] Public student endpoint: list open quizzes by class code; fix PlayPage accordingly.
- [x] Frontend: group management UI on class detail page.
- [x] Backend tests for groups and group responses.
- [x] Builds/tests green.
- [x] Bump version to 0.6.0 and changelog.

## Notes

Groups are teacher-assigned. A group-mode question accepts a single response recorded under the group; any member's submission counts for the group.
