import { database } from '../../db/database.js';
import { allAsync } from '../../db/promises.js';
import { getQuizById } from '../quizzes/quiz.service.js';
import type {
  QuestionResultSummary,
  QuizResults,
  ResponseRow,
  ResultClass,
} from '@elitequest/shared';

interface RawRow {
  response_id: number;
  question_id: number;
  order_index: number;
  prompt: string;
  type: string;
  answer_mode: string;
  points: number;
  student_name: string | null;
  class_name: string | null;
  group_name: string | null;
  answer: string;
  score: number | null;
  submitted_at: string;
}

export async function getQuizResults(
  quizId: number,
  classId?: number
): Promise<QuizResults> {
  const quiz = await getQuizById(quizId);

  // Responses always carry the submitting student, and students can only
  // answer quizzes released to their class — so the student's class identifies
  // the response's class (group-mode included).
  const classFilter = classId ? 'AND s.class_id = ?' : '';
  const rows = await allAsync<RawRow>(
    database,
    `SELECT r.id AS response_id,
            q.id AS question_id,
            q.order_index,
            q.prompt,
            q.type,
            q.answer_mode,
            q.points,
            s.display_name AS student_name,
            sc.name AS class_name,
            g.name AS group_name,
            r.answer,
            r.score,
            r.submitted_at
     FROM responses r
     JOIN questions q ON q.id = r.question_id
     LEFT JOIN users s ON s.id = r.student_id
     LEFT JOIN classes sc ON sc.id = s.class_id
     LEFT JOIN groups g ON g.id = r.group_id
     WHERE q.quiz_id = ?
     ${classFilter}
     ORDER BY q.order_index, r.submitted_at`,
    ...(classId ? [quizId, classId] : [quizId])
  );

  const releasedClasses = await allAsync<ResultClass>(
    database,
    `SELECT c.id, c.name
     FROM quiz_releases r
     JOIN classes c ON c.id = r.class_id
     WHERE r.quiz_id = ?
     ORDER BY c.name`,
    quizId
  );

  const responses: ResponseRow[] = rows.map((row) => ({
    response_id: row.response_id,
    question_id: row.question_id,
    order_index: row.order_index,
    prompt: row.prompt,
    type: row.type,
    student_name: row.student_name,
    class_name: row.class_name,
    group_name: row.group_name,
    answer: row.answer,
    score: row.score,
    submitted_at: row.submitted_at,
  }));

  const byQuestion = new Map<number, RawRow[]>();
  for (const row of rows) {
    const existing = byQuestion.get(row.question_id) ?? [];
    existing.push(row);
    byQuestion.set(row.question_id, existing);
  }

  const summary: QuestionResultSummary[] = [...byQuestion.entries()].map(
    ([questionId, questionRows]) => {
      const first = questionRows[0];
      const scored = questionRows.filter((r) => r.score !== null);
      const correct = scored.filter((r) => r.score !== null && r.score >= first.points);
      return {
        question_id: questionId,
        order_index: first.order_index,
        prompt: first.prompt,
        type: first.type,
        answer_mode: first.answer_mode,
        points: first.points,
        response_count: questionRows.length,
        average_score:
          scored.length > 0
            ? scored.reduce((sum, r) => sum + (r.score ?? 0), 0) / scored.length
            : null,
        correct_rate: scored.length > 0 ? correct.length / scored.length : null,
      };
    }
  );
  summary.sort((a, b) => a.order_index - b.order_index);

  return {
    quiz_id: quiz.id,
    quiz_title: quiz.title,
    class_id: classId ?? null,
    classes: releasedClasses,
    summary,
    responses,
  };
}
