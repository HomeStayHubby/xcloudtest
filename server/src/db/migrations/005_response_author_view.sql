-- Provide a stable author name for responses by joining students/groups.
-- SQLite does not support CREATE OR REPLACE VIEW, so we drop first to keep idempotent.
DROP VIEW IF EXISTS v_response_author;

CREATE VIEW v_response_author AS
SELECT
  r.id,
  r.question_id,
  r.student_id,
  r.group_id,
  r.answer,
  r.score,
  r.submitted_at,
  COALESCE(s.display_name, g.name, 'Anonymous') AS author
FROM responses r
LEFT JOIN students s ON r.student_id = s.id
LEFT JOIN groups g ON r.group_id = g.id;
