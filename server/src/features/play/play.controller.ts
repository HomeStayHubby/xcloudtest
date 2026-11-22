import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  listOpenQuizzesForStudent,
  getQuizById,
  assertStudentCanAccessQuiz,
  getStudentClassId,
} from '../quizzes/quiz.service.js';
import { listQuestionsRawByQuiz } from '../questions/question.service.js';
import { sanitizeQuestion } from './sanitize.js';
import { forbidden } from '../../shared/errors.js';
import { getQuizScoreboard } from '../live/scoreboard.service.js';
import { getMyQuizResults } from './my-results.service.js';
import { getAuthUser } from '../auth/auth.middleware.js';
import type { PublicQuestion } from '@elitequest/shared';

const quizIdParamSchema = z.object({
  quizId: z.coerce.number().int().positive(),
});

export async function listOpen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthUser(req);
    const classId = await getStudentClassId(user.id);
    if (classId === null) {
      throw forbidden('You are not enrolled in any class yet');
    }
    const quizzes = await listOpenQuizzesForStudent(classId);
    res.json({ data: quizzes });
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function publicQuestions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { quizId } = quizIdParamSchema.parse(req.params);
    const user = getAuthUser(req);
    await assertStudentCanAccessQuiz(user.id, quizId);

    const quiz = await getQuizById(quizId);
    if (quiz.status !== 'open') {
      throw forbidden('Quiz is not open');
    }
    let questions = await listQuestionsRawByQuiz(quizId);
    if (quiz.settings.randomize_questions && !quiz.settings.paced) {
      questions = shuffle(questions);
    }
    const publicQuestions: PublicQuestion[] = questions.map(sanitizeQuestion);
    res.json({
      data: {
        quiz: {
          id: quiz.id,
          title: quiz.title,
          settings: quiz.settings,
        },
        questions: publicQuestions,
      },
    });
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function scoreboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { quizId } = quizIdParamSchema.parse(req.params);
    const user = getAuthUser(req);
    await assertStudentCanAccessQuiz(user.id, quizId);

    const quiz = await getQuizById(quizId);
    if (quiz.status !== 'open') {
      throw forbidden('Quiz is not open');
    }
    const result = await getQuizScoreboard(quizId);
    res.json({ data: result });
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function myResults(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { quizId } = quizIdParamSchema.parse(req.params);
    const user = getAuthUser(req);
    const results = await getMyQuizResults(user.id, quizId);
    res.json({ data: results });
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
  }
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
