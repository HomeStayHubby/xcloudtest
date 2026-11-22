-- 008_user_management.sql
--
-- User management overhaul:
--   * users: roles become 'lecturer' | 'student' (the old admin privilege is
--     now an is_admin flag on lecturers); students are real accounts that log
--     in with username + password; each student belongs to exactly one class.
--     The old students table is merged into users (legacy PINs are kept in a
--     temporary legacy_pin column and bcrypt-hashed by the 008 data migration).
--   * classes: gain advisor_id; require_pin is removed (accounts replaced PINs).
--   * quizzes: gain created_by; the single class_id is replaced by the
--     quiz_releases many-to-many table (a quiz can be released to any classes).
--   * question_banks are introduced; questions gain a nullable bank_id and
--     quiz_id becomes nullable.
--   * groups become quiz-scoped: every old class group is copied into each
--     same-class quiz that uses group questions, and existing responses keep
--     their group attribution via the group_map mapping.

DROP VIEW IF EXISTS v_response_author;

-- ---------------------------------------------------------------- users ----

ALTER TABLE users RENAME TO users_old;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  username TEXT,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('lecturer', 'student')),
  is_admin INTEGER NOT NULL DEFAULT 0 CHECK (is_admin IN (0, 1)),
  class_id INTEGER,
  student_number TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  legacy_pin TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  CHECK (role <> 'lecturer' OR email IS NOT NULL),
  CHECK (role <> 'student' OR username IS NOT NULL),
  CHECK (is_admin = 0 OR role = 'lecturer')
);

-- Staff: admin -> lecturer + is_admin, instructor -> lecturer.
INSERT INTO users (id, email, password_hash, display_name, role, is_admin, is_active, created_at, updated_at)
SELECT id,
       email,
       password_hash,
       display_name,
       'lecturer',
       CASE WHEN role = 'admin' THEN 1 ELSE 0 END,
       1,
       created_at,
       updated_at
FROM users_old;

-- Students: new ids offset past existing staff ids; usernames come from the
-- institution student id when present. The data migration finalises usernames
-- (dedupe + unique index) and hashes the legacy PIN into the password.
CREATE TEMP TABLE student_offset AS
SELECT COALESCE((SELECT MAX(id) FROM users), 0) AS id_off;

INSERT INTO users (id, username, password_hash, display_name, role, is_admin, class_id, student_number, legacy_pin, is_active, created_at)
SELECT (SELECT id_off FROM student_offset) + s.id,
       COALESCE(NULLIF(TRIM(s.student_id), ''), 's' || ((SELECT id_off FROM student_offset) + s.id)),
       '',
       s.display_name,
       'student',
       0,
       s.class_id,
       NULLIF(TRIM(s.student_id), ''),
       s.pin,
       1,
       s.created_at
FROM students s;

CREATE TEMP TABLE student_ids AS
SELECT s.id AS old_id, (SELECT id_off FROM student_offset) + s.id AS new_id
FROM students s;

DROP TABLE student_offset;

DROP TABLE users_old;

-- -------------------------------------------------------------- classes ----

ALTER TABLE classes ADD COLUMN advisor_id INTEGER REFERENCES users(id);
ALTER TABLE classes DROP COLUMN require_pin;

-- ------------------------------------------- campaigns / games ownership ----

ALTER TABLE campaigns ADD COLUMN created_by INTEGER REFERENCES users(id);
UPDATE campaigns
SET created_by = (SELECT id FROM users WHERE is_admin = 1 ORDER BY id LIMIT 1);

-- -------------------------------------------------------- question banks ----

CREATE TABLE IF NOT EXISTS question_banks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------- quizzes ----

ALTER TABLE quizzes RENAME TO quizzes_old;

CREATE TABLE quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'archived')),
  settings TEXT NOT NULL DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

INSERT INTO quizzes (id, created_by, title, description, status, settings, created_at, updated_at)
SELECT id,
       COALESCE(
         (SELECT id FROM users WHERE is_admin = 1 ORDER BY id LIMIT 1),
         (SELECT id FROM users WHERE role = 'lecturer' ORDER BY id LIMIT 1)
       ),
       title, description, status, settings, created_at, updated_at
FROM quizzes_old;

-- The legacy single-class assignment becomes a release.
CREATE TABLE quiz_releases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE (quiz_id, class_id)
);

INSERT INTO quiz_releases (quiz_id, class_id, created_at)
SELECT id, class_id, created_at FROM quizzes_old WHERE class_id IS NOT NULL;

-- ------------------------------------------------------------ questions ----

ALTER TABLE questions RENAME TO questions_old;

CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER,
  bank_id INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN (
    'mcq_single', 'mcq_multi', 'short_answer', 'fill_blanks',
    'matching', 'grouping', 'word_cloud', 'brainstorming'
  )),
  prompt TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  answer_mode TEXT NOT NULL DEFAULT 'individual' CHECK (answer_mode IN ('individual', 'group')),
  points REAL NOT NULL DEFAULT 1,
  time_limit_seconds INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (bank_id) REFERENCES question_banks(id) ON DELETE CASCADE,
  CHECK (quiz_id IS NOT NULL OR bank_id IS NOT NULL)
);

INSERT INTO questions (id, quiz_id, bank_id, order_index, type, prompt, data, answer_mode, points, time_limit_seconds, created_at)
SELECT id, quiz_id, NULL, order_index, type, prompt, data, answer_mode, points, time_limit_seconds, created_at
FROM questions_old;

-- ------------------------------------------------- groups (quiz-scoped) ----

ALTER TABLE groups RENAME TO groups_old;

CREATE TABLE groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Every old class group is copied into each same-class quiz that uses group
-- questions. group_map records old_group_id + quiz_id -> new_group_id so
-- responses keep pointing at the right group.
CREATE TEMP TABLE group_offset AS
SELECT COALESCE(MAX(id), 0) AS id_off FROM groups_old;

CREATE TEMP TABLE group_map AS
WITH pairs AS (
  SELECT
    g.id AS old_group_id,
    q.id AS quiz_id,
    g.name AS name,
    g.created_at AS created_at,
    (SELECT id_off FROM group_offset) +
      ROW_NUMBER() OVER (ORDER BY g.id, q.id) AS new_group_id
  FROM groups_old g
  JOIN quizzes_old q ON q.class_id = g.class_id
  WHERE EXISTS (
    SELECT 1 FROM questions_old qq
    WHERE qq.quiz_id = q.id AND qq.answer_mode = 'group'
  )
)
SELECT * FROM pairs;

INSERT INTO groups (id, quiz_id, name, created_at)
SELECT new_group_id, quiz_id, name, created_at FROM group_map;

DROP TABLE group_offset;

-- -------------------------------------------------------- group members ----

ALTER TABLE group_members RENAME TO group_members_old;

CREATE TABLE group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (group_id, student_id)
);

INSERT INTO group_members (group_id, student_id, created_at)
SELECT m.new_group_id, sm.new_id, gmo.created_at
FROM group_members_old gmo
JOIN group_map m ON m.old_group_id = gmo.group_id
JOIN student_ids sm ON sm.old_id = gmo.student_id;

-- ------------------------------------------------------------ responses ----

ALTER TABLE responses RENAME TO responses_old;

CREATE TABLE responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  student_id INTEGER,
  group_id INTEGER,
  answer TEXT NOT NULL,
  score REAL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
);

INSERT INTO responses (id, question_id, student_id, group_id, answer, score, submitted_at)
SELECT r.id,
       r.question_id,
       sm.new_id,
       m.new_group_id,
       r.answer, r.score, r.submitted_at
FROM responses_old r
LEFT JOIN student_ids sm ON sm.old_id = r.student_id
LEFT JOIN group_map m
  ON m.old_group_id = r.group_id
 AND m.quiz_id = (SELECT qq.quiz_id FROM questions_old qq WHERE qq.id = r.question_id);

-- ---------------------------------------------------- brainstorm upvotes ----

ALTER TABLE brainstorm_upvotes RENAME TO brainstorm_upvotes_old;

CREATE TABLE brainstorm_upvotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  student_id INTEGER,
  group_id INTEGER,
  idea TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (question_id, student_id, group_id, idea),
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

INSERT INTO brainstorm_upvotes (id, question_id, student_id, group_id, idea, created_at)
SELECT b.id, b.question_id, sm.new_id, m.new_group_id, b.idea, b.created_at
FROM brainstorm_upvotes_old b
LEFT JOIN student_ids sm ON sm.old_id = b.student_id
LEFT JOIN group_map m
  ON m.old_group_id = b.group_id
 AND m.quiz_id = (SELECT qq.quiz_id FROM questions_old qq WHERE qq.id = b.question_id);

-- ------------------------------------------------------ campaign quizzes ----

ALTER TABLE campaign_quizzes RENAME TO campaign_quizzes_old;

CREATE TABLE campaign_quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  quiz_id INTEGER NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  UNIQUE (campaign_id, quiz_id)
);

INSERT INTO campaign_quizzes (id, campaign_id, quiz_id, position, created_at)
SELECT id, campaign_id, quiz_id, position, created_at FROM campaign_quizzes_old;

-- ------------------------------------------------------- drop legacy ----

DROP TABLE students;
DROP TABLE group_members_old;
DROP TABLE responses_old;
DROP TABLE brainstorm_upvotes_old;
DROP TABLE questions_old;
DROP TABLE groups_old;
DROP TABLE quizzes_old;
DROP TABLE campaign_quizzes_old;

-- --------------------------------------------------------------- view ----

CREATE VIEW v_response_author AS
SELECT
  r.id,
  r.question_id,
  r.student_id,
  r.group_id,
  r.answer,
  r.score,
  r.submitted_at,
  COALESCE(u.display_name, g.name, 'Anonymous') AS author
FROM responses r
LEFT JOIN users u ON r.student_id = u.id
LEFT JOIN groups g ON r.group_id = g.id;

-- ------------------------------------------------------------ indexes ----

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_class ON users(class_id);
CREATE INDEX IF NOT EXISTS idx_releases_class ON quiz_releases(class_id);
CREATE INDEX IF NOT EXISTS idx_releases_quiz ON quiz_releases(quiz_id);
CREATE INDEX IF NOT EXISTS idx_groups_quiz ON groups(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_banks_owner ON question_banks(owner_id);
CREATE INDEX IF NOT EXISTS idx_questions_bank ON questions(bank_id);
CREATE INDEX IF NOT EXISTS idx_responses_student ON responses(student_id);

DROP TABLE IF EXISTS temp.group_map;
DROP TABLE IF EXISTS temp.student_ids;
