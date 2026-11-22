import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { app } from '../../index.js';
import {
  setup,
  makeLecturer,
  makeClass,
  makeStudent,
  uniqueId,
} from '../../testing/helpers.js';
import { createQuiz, releaseQuiz, setQuizStatus } from '../../features/quizzes/quiz.service.js';
import { createQuestion } from '../../features/questions/question.service.js';
import { database } from '../../db/database.js';
import { runAsync } from '../../db/promises.js';
import type { MyQuizResults } from '@elitequest/shared';

// Integration tests over HTTP for the student post-quiz summary endpoint:
// per-question review with answer keys gated by the quiz's
// reveal_answers_in_summary setting, group responses, and post-close access.
describe('play my-results (HTTP integration)', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await setup();
    server = app.listen(0);
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await new Promise<void>((resolve) => {
      server.closeAllConnections?.();
      resolve();
    });
  });

  beforeEach(async () => {
    await setup();
  });

  async function login(identifier: string, password: string): Promise<string> {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    expect(res.status).toBe(200);
    return res.headers.getSetCookie()[0]?.split(';')[0] ?? '';
  }

  async function submitAnswer(
    cookie: string,
    questionId: number,
    answer: unknown
  ): Promise<void> {
    const res = await fetch(`${baseUrl}/api/v1/questions/${questionId}/responses`, {
      method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    });
    expect(res.status).toBe(201);
  }

  interface PublicQuestionJson {
    id: number;
    type: string;
  }

  async function fetchQuestions(cookie: string, quizId: number): Promise<PublicQuestionJson[]> {
    const res = await fetch(`${baseUrl}/api/v1/play/quiz/${quizId}/questions`, {
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { questions: PublicQuestionJson[] } };
    return json.data.questions;
  }

  async function fetchMyResults(cookie: string, quizId: number): Promise<MyQuizResults> {
    const res = await fetch(`${baseUrl}/api/v1/play/quiz/${quizId}/my-results`, {
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: MyQuizResults };
    return json.data;
  }

  it('returns per-question review with revealed correct answers', async () => {
    const lecturer = await makeLecturer();
    const classId = (await makeClass(lecturer)).id;
    const student = await makeStudent(lecturer, classId, 'Alice');
    const suffix = uniqueId('quiz');

    const quiz = await createQuiz(lecturer, { title: `Summary ${suffix}` });
    await releaseQuiz(lecturer, quiz.id, classId);
    const q1 = await createQuestion(lecturer, quiz.id, {
      type: 'mcq_single',
      prompt: '2+2?',
      data: {
        type: 'mcq_single',
        prompt: '2+2?',
        options: [
          { id: 'a', text: '4' },
          { id: 'b', text: '5' },
        ],
        correct_option_id: 'a',
      },
      answer_mode: 'individual',
      points: 1,
    });
    const q2 = await createQuestion(lecturer, quiz.id, {
      type: 'short_answer',
      prompt: 'Capital of France?',
      data: {
        type: 'short_answer',
        prompt: 'Capital of France?',
        accepted_answers: ['Paris'],
        case_sensitive: false,
      },
      answer_mode: 'individual',
      points: 2,
    });
    const q3 = await createQuestion(lecturer, quiz.id, {
      type: 'word_cloud',
      prompt: 'One word about exams',
      data: { type: 'word_cloud', prompt: 'One word about exams', max_words_per_student: 2 },
      answer_mode: 'individual',
      points: 0,
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft', 'closed']);

    const cookie = await login(student.username, 'studentpass');
    const questions = await fetchQuestions(cookie, quiz.id);
    expect(questions.map((q) => q.id)).toEqual([q1.id, q2.id, q3.id]);

    await submitAnswer(cookie, q1.id, 'a');
    await submitAnswer(cookie, q2.id, 'paris');
    await submitAnswer(cookie, q3.id, ['stress']);

    const results = await fetchMyResults(cookie, quiz.id);
    expect(results.quiz_id).toBe(quiz.id);
    expect(results.reveal_answers).toBe(true);
    expect(results.total_score).toBe(3);
    expect(results.points_possible).toBe(3);
    expect(results.answered).toBe(3);
    expect(results.total_questions).toBe(3);

    const [item1, item2, item3] = results.items;
    expect(item1.correct).toBe(true);
    expect(item1.score).toBe(1);
    expect(item1.my_answer_display).toBe('4');
    expect(item1.correct_answer).toBe('4');

    expect(item2.correct).toBe(true);
    expect(item2.score).toBe(2);
    expect(item2.correct_answer).toBe('Paris');

    // Manual grading pending: no correctness, no answer key.
    expect(item3.score).toBeNull();
    expect(item3.correct).toBeNull();
    expect(item3.correct_answer).toBeNull();
    expect(item3.my_answer_display).toBe('stress');
  });

  it('hides correct answers when reveal_answers_in_summary is off', async () => {
    const lecturer = await makeLecturer();
    const classId = (await makeClass(lecturer)).id;
    const student = await makeStudent(lecturer, classId, 'Bob');
    const suffix = uniqueId('quiz');

    const quiz = await createQuiz(lecturer, {
      title: `Hidden ${suffix}`,
      settings: {
        randomize_questions: false,
        show_answers: true,
        reveal_answers_in_summary: false,
        default_answer_mode: 'individual',
        paced: false,
        sprint: false,
        sprint_bonus_pct: 0.25,
      },
    });
    await releaseQuiz(lecturer, quiz.id, classId);
    const q1 = await createQuestion(lecturer, quiz.id, {
      type: 'mcq_single',
      prompt: '2+2?',
      data: {
        type: 'mcq_single',
        prompt: '2+2?',
        options: [
          { id: 'a', text: '4' },
          { id: 'b', text: '5' },
        ],
        correct_option_id: 'a',
      },
      answer_mode: 'individual',
      points: 1,
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft', 'closed']);

    const cookie = await login(student.username, 'studentpass');
    await submitAnswer(cookie, q1.id, 'b');

    const results = await fetchMyResults(cookie, quiz.id);
    expect(results.reveal_answers).toBe(false);
    expect(results.items[0].correct).toBe(false);
    expect(results.items[0].correct_answer).toBeNull();
  });

  it('counts unanswered questions and stays available after the quiz closes', async () => {
    const lecturer = await makeLecturer();
    const classId = (await makeClass(lecturer)).id;
    const student = await makeStudent(lecturer, classId, 'Cara');
    const suffix = uniqueId('quiz');

    const quiz = await createQuiz(lecturer, { title: `Closed ${suffix}` });
    await releaseQuiz(lecturer, quiz.id, classId);
    await createQuestion(lecturer, quiz.id, {
      type: 'mcq_single',
      prompt: '2+2?',
      data: {
        type: 'mcq_single',
        prompt: '2+2?',
        options: [
          { id: 'a', text: '4' },
          { id: 'b', text: '5' },
        ],
        correct_option_id: 'a',
      },
      answer_mode: 'individual',
      points: 1,
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft', 'closed']);

    const cookie = await login(student.username, 'studentpass');
    const before = await fetchMyResults(cookie, quiz.id);
    expect(before.answered).toBe(0);
    expect(before.items[0].my_answer_display).toBeNull();
    expect(before.items[0].correct).toBeNull();

    await setQuizStatus(lecturer, quiz.id, 'closed', ['open']);

    const after = await fetchMyResults(cookie, quiz.id);
    expect(after.quiz_status).toBe('closed');
    expect(after.items).toHaveLength(1);
  });

  it('uses the group response for group-mode questions', async () => {
    const lecturer = await makeLecturer();
    const classId = (await makeClass(lecturer)).id;
    const alice = await makeStudent(lecturer, classId, 'Alice');
    const bob = await makeStudent(lecturer, classId, 'Bob');
    const suffix = uniqueId('quiz');

    const quiz = await createQuiz(lecturer, { title: `Group ${suffix}` });
    await releaseQuiz(lecturer, quiz.id, classId);
    const q1 = await createQuestion(lecturer, quiz.id, {
      type: 'short_answer',
      prompt: 'Team motto?',
      data: {
        type: 'short_answer',
        prompt: 'Team motto?',
        accepted_answers: ['Go team'],
        case_sensitive: false,
      },
      answer_mode: 'group',
      points: 1,
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft', 'closed']);

    // Quiz-scoped group with both students as members.
    await runAsync(database, 'INSERT INTO groups (quiz_id, name) VALUES (?, ?)', quiz.id, 'Team A');
    const groupRow = await new Promise<{ id: number }>((resolve, reject) => {
      database.get('SELECT id FROM groups WHERE quiz_id = ?', quiz.id, (err, row: { id: number }) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    await runAsync(
      database,
      'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)',
      groupRow.id,
      alice.id
    );
    await runAsync(
      database,
      'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)',
      groupRow.id,
      bob.id
    );

    // Alice submits for the group; Bob should see the same answer.
    const aliceCookie = await login(alice.username, 'studentpass');
    await submitAnswer(aliceCookie, q1.id, 'Go team');

    const bobCookie = await login(bob.username, 'studentpass');
    const results = await fetchMyResults(bobCookie, quiz.id);
    expect(results.items[0].my_answer_display).toBe('Go team');
    expect(results.items[0].correct).toBe(true);
    expect(results.answered).toBe(1);
  });

  it('rejects students from classes the quiz was not released to', async () => {
    const lecturer = await makeLecturer();
    const classId = (await makeClass(lecturer)).id;
    const otherClassId = (await makeClass(lecturer)).id;
    const insider = await makeStudent(lecturer, classId, 'In');
    const outsider = await makeStudent(lecturer, otherClassId, 'Out');
    const suffix = uniqueId('quiz');

    const quiz = await createQuiz(lecturer, { title: `Private ${suffix}` });
    await releaseQuiz(lecturer, quiz.id, classId);
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft', 'closed']);

    const insiderCookie = await login(insider.username, 'studentpass');
    await fetchMyResults(insiderCookie, quiz.id);

    const outsiderCookie = await login(outsider.username, 'studentpass');
    const res = await fetch(`${baseUrl}/api/v1/play/quiz/${quiz.id}/my-results`, {
      headers: { Cookie: outsiderCookie },
    });
    expect(res.status).toBe(400);
  });
});
