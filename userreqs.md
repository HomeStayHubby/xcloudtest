# ELITEQuest User Requirements

## Overview

ELITEQuest is a gamified quizzing study aid for a community college. It allows instructors to create classes, manage students, build and run quizzes, and engage students with interactive mini-games. It is designed to run on a basic Vultr VPS with minimal resources.

## Actors

1. **Admin / Instructor**
   - Creates and manages classes.
   - Manages student rosters (add, edit, delete).
   - Imports and exports student lists via XLSX.
   - Creates quizzes and quiz campaigns.
   - Launches live quizzes and mini-games.
   - Views results, leaderboards, and aggregated responses.

2. **Student**
   - Joins a class by class code.
   - Participates in quizzes and mini-games.
   - Answers questions individually or as part of a group.
   - Sees leaderboards (where enabled).

## Functional Requirements

### Authentication

- Admin/instructor logs in with email and password.
- Students join using a class code + display name/PIN.
- Student accounts are not persistent; their participation is tied to the session/class.

### Classes

- Admin can create, edit, and delete classes.
- Each class has:
  - Name
  - Code (auto-generated for joining)
  - Description
  - Active/inactive status
- Admin can archive classes.

### Students

- Admin can manually add, edit, and remove students from a class.
- Student record contains:
  - Class ID
  - Display name
  - Optional student ID
  - Optional PIN
- Admin can import students from an XLSX file.
- Admin can export the class roster to XLSX.
- Duplicate detection should warn on import.

### Quizzes

- A quiz can be:
  - **One-off:** a single session with no persistent leaderboard.
  - **Campaign:** linked to a class and contributes to an ongoing leaderboard.
- Quizzes have:
  - Title
  - Description
  - Class association (optional for one-off)
  - Settings (randomize questions, show answers, time limits, individual vs. group mode default)

### Question Types — Auto-Marked

| Type | Description |
|------|-------------|
| MCQ single select | One correct answer from multiple options. |
| MCQ multi-select | Multiple correct answers; full/partial marking configurable. |
| Short answer | Free text matched against accepted answers (case-insensitive, allow alternate answers). |
| Fill in the blanks | Sentence(s) with missing words to fill in; automarked against expected answers. |
| Matching | Match items in two columns. |
| Grouping | Sort items into the correct groups. |

### Question Modes

- Every question supports individual answering.
- Every question can optionally support group answering.
- Group mode is chosen per question.

### Non-Marking Engagement Questions

| Type | Description |
|------|-------------|
| Word cloud | Students submit short words/phrases; results displayed as a live tag cloud. |
| Brainstorming | Students submit ideas; collected in real time, optionally upvoted. |

### Mini-Games

| Game | Description |
|------|-------------|
| Wheel of Fortune | Spin a wheel to award random bonuses, categories, or point multipliers. |
| Jeopardy-style board | Grid of topic/value cells; teams pick questions to answer. |
| Timer sprint | Students or groups race to answer correctly first. |
| Matching pairs | Memory-style matching game for terms and definitions. |
| Brainstorm storm | Timed brainstorm where students submit and upvote ideas. |

### Leaderboards

- Campaign-mode quizzes generate points per student or per group.
- Leaderboards update after each scored quiz.
- Admin can view and reset leaderboards.

### Quiz Flow

- Instructor can run quizzes in either:
  - **Instructor-paced mode** (questions revealed one at a time, live).
  - **Self-paced mode** (students take the quiz at their own pace).
- Instructor can open/close quizzes and see live participation.

### Results and Reporting

- View per-student and per-question response summaries.
- Export results to XLSX.
- Aggregate word-cloud and brainstorming responses.

## Non-Functional Requirements

### Performance

- Runs on a basic Vultr VPS (1 vCPU / 1–2 GB RAM).
- Page loads should feel snappy on desktop and mobile.
- Support at least 100 simultaneous student connections per class.

### Reliability

- Student answers are saved as soon as submitted.
- If the instructor disconnects, student answers persist.
- Fails safely: show friendly errors, never crash the app on bad input.

### Security

- Passwords are bcrypt hashed.
- Session secrets kept in environment variables.
- SQL injection prevented via parameterized queries / ORM.
- No hard-coded credentials.

### Privacy

- Minimize student PII.
- Display names used in class; real names optional.
- Allow export and deletion of class data.
- Avoid logging PII.

### Maintainability

- Clear feature folders.
- TypeScript everywhere.
- Shared Zod schemas for validation.
- Tests for service logic.

## Out of Scope for v1.0

- Third-party LMS integration (Canvas, Blackboard).
- Analytics dashboards beyond basic leaderboards.
- Paid subscription or multi-tenant hosting.
- AI-generated questions.
- Advanced anti-cheating measures.

## Acceptance Criteria (Summary)

1. An admin can create a class, add students, and export the roster.
2. An admin can create a quiz with any auto-marked question type and launch it.
3. Students can join by class code and submit answers.
4. Responses are auto-marked where applicable.
5. Non-marking responses are aggregated in real time.
6. Mini-games can be launched and contribute to engagement.
7. Leaderboards display campaign progress.
8. The app deploys and runs on a Vultr VPS.

