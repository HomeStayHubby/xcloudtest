import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { badRequest, forbidden, notFound } from '../../shared/errors.js';
import type { Actor } from '../../shared/permissions.js';
import { getQuestionById } from '../questions/question.service.js';
import { getQuizById, assertStudentCanAccessQuiz, assertQuizOwner } from '../quizzes/quiz.service.js';
import { scoreResponse } from '../marker/marker.js';
import { getStudentGroup } from '../groups/group.service.js';
import { broadcastScoreboard } from '../live/scoreboard.service.js';
import { getQuestionStartedAt } from '../live/pacing.service.js';
import type { Response, ResponseAnswer } from '@elitequest/shared';

export async function submitResponse(
  questionId: number,
  studentId: number,
  answer: ResponseAnswer
): Promise<Response> {
  const question = await getQuestionById(questionId);
  if (question.quiz_id === null || question.quiz_id === undefined) {
    throw badRequest('Bank questions cannot be answered directly');
  }
  const quiz = await getQuizById(question.quiz_id);

  if (quiz.status !== 'open') {
    throw forbidden('Quiz is not open for responses');
  }
  await assertStudentCanAccessQuiz(studentId, quiz.id);

  let effectiveGroupId: number | undefined;
  const scoredQuestion = question.type !== 'word_cloud' && question.type !== 'brainstorming';

  if (question.answer_mode === 'individual') {
    const existing = await getAsync<{ id: number }>(
      database,
      'SELECT id FROM responses WHERE question_id = ? AND student_id = ?',
      questionId,
      studentId
    );
    if (existing) {
      if (scoredQuestion) {
        throw badRequest('You have already submitted an answer for this question');
      }
      await runAsync(database, 'DELETE FROM responses WHERE id = ?', existing.id);
    }
  }

  if (question.answer_mode === 'group') {
    // Groups are quiz-scoped: resolve the student's group for this quiz.
    const group = await getStudentGroup(quiz.id, studentId);
    effectiveGroupId = group?.id;
    if (!effectiveGroupId) {
      throw badRequest('Group membership required for group question');
    }
    const existing = await getAsync<{ id: number }>(
      database,
      'SELECT id FROM responses WHERE question_id = ? AND group_id = ?',
      questionId,
      effectiveGroupId
    );
    if (existing) {
      if (scoredQuestion) {
        throw badRequest('Your group has already submitted an answer for this question');
      }
      await runAsync(database, 'DELETE FROM responses WHERE id = ?', existing.id);
    }
  }

  let score = scoreResponse(question.data, answer, question.points);

  if (
    score !== null &&
    quiz.settings.sprint &&
    quiz.settings.paced &&
    question.time_limit_seconds
  ) {
    const startedAt = getQuestionStartedAt(question.quiz_id);
    if (startedAt) {
      const elapsedSeconds = (Date.now() - startedAt) / 1000;
      const remainingFraction = Math.max(0, 1 - elapsedSeconds / question.time_limit_seconds);
      const bonus = score * quiz.settings.sprint_bonus_pct * remainingFraction;
      score = score + Math.round(bonus * 100) / 100;
    }
  }

  await runAsync(
    database,
    'INSERT INTO responses (question_id, student_id, group_id, answer, score) VALUES (?, ?, ?, ?, ?)',
    questionId,
    studentId,
    effectiveGroupId ?? null,
    JSON.stringify(answer),
    score
  );

  const created = await getAsync<{ id: number }>(database, 'SELECT last_insert_rowid() as id');
  if (!created) {
    throw new Error('Failed to create response');
  }

  try {
    await broadcastScoreboard(quiz.id);
  } catch (broadcastError) {
    // Broadcasting is best-effort; response persistence is the primary contract.
    console.error('Failed to broadcast scoreboard', broadcastError);
  }

  return getResponseById(created.id);
}

export async function getResponseById(id: number): Promise<Response> {
  const row = await getAsync<ResponseRow>(database, 'SELECT * FROM responses WHERE id = ?', id);
  if (!row) {
    throw notFound('Response');
  }
  return parseResponseRow(row);
}

export async function getResponsesByQuiz(quizId: number): Promise<Response[]> {
  const rows = await getResponsesByQuizRaw(quizId);
  return rows.map(parseResponseRow);
}

export async function getResponsesByQuizRaw(quizId: number): Promise<ResponseRow[]> {
  return allAsync<ResponseRow>(
    database,
    `SELECT r.* FROM responses r
     JOIN questions q ON r.question_id = q.id
     WHERE q.quiz_id = ?
     ORDER BY r.submitted_at`,
    quizId
  );
}

const MANUALLY_SCORABLE_TYPES = ['word_cloud', 'brainstorming'];

function assertManuallyScorable(type: string): void {
  if (!MANUALLY_SCORABLE_TYPES.includes(type)) {
    throw badRequest('Only word cloud and brainstorming responses can be manually scored');
  }
}

export async function setResponseScore(
  user: Actor,
  responseId: number,
  score: number
): Promise<Response> {
  const row = await getAsync<ResponseRow>(database, 'SELECT * FROM responses WHERE id = ?', responseId);
  if (!row) {
    throw notFound('Response');
  }
  const question = await getQuestionById(row.question_id);
  assertManuallyScorable(question.type);
  if (question.quiz_id === null || question.quiz_id === undefined) {
    throw badRequest('Bank questions cannot be scored');
  }
  const quiz = await assertQuizOwner(user, question.quiz_id);

  await runAsync(database, 'UPDATE responses SET score = ? WHERE id = ?', score, responseId);

  try {
    await broadcastScoreboard(quiz.id);
  } catch (broadcastError) {
    console.error('Failed to broadcast scoreboard', broadcastError);
  }

  return getResponseById(responseId);
}

export async function setQuestionScores(
  user: Actor,
  questionId: number,
  score: number
): Promise<{ updated: number }> {
  const question = await getQuestionById(questionId);
  assertManuallyScorable(question.type);
  if (question.quiz_id === null || question.quiz_id === undefined) {
    throw badRequest('Bank questions cannot be scored');
  }
  const quiz = await assertQuizOwner(user, question.quiz_id);

  const existing = await getAsync<{ count: number }>(
    database,
    'SELECT COUNT(*) as count FROM responses WHERE question_id = ?',
    questionId
  );
  await runAsync(database, 'UPDATE responses SET score = ? WHERE question_id = ?', score, questionId);

  try {
    await broadcastScoreboard(quiz.id);
  } catch (broadcastError) {
    console.error('Failed to broadcast scoreboard', broadcastError);
  }

  return { updated: existing?.count ?? 0 };
}

export type ResponseRow = Omit<Response, 'answer'> & { answer: string };

function parseResponseRow(row: ResponseRow): Response {
  return {
    ...row,
    answer: JSON.parse(row.answer) as ResponseAnswer,
  };
}
