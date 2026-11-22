import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getQuizById, assertQuizOwner, assertStudentCanAccessQuiz } from '../quizzes/quiz.service.js';
import {
  advanceQuestion,
  getCurrentQuestionIndex,
  retreatQuestion,
} from './pacing.service.js';
import { listQuestionsRawByQuiz } from '../questions/question.service.js';
import { notFound, badRequest } from '../../shared/errors.js';
import { getAuthUser } from '../auth/auth.middleware.js';

export async function getPacingState(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const quizId = Number(req.params.quizId);
    const quiz = await getQuizById(quizId);
    if (!quiz) {
      throw notFound('Quiz');
    }
    const user = getAuthUser(req);
    if (user.role === 'student') {
      await assertStudentCanAccessQuiz(user.id, quizId);
    }
    const questions = await listQuestionsRawByQuiz(quizId);
    const currentIndex = getCurrentQuestionIndex(quizId);
    const current = questions[currentIndex] ?? null;
    res.json({
      data: {
        quiz_id: quizId,
        current_index: currentIndex,
        question_id: current?.id ?? null,
        total_questions: questions.length,
        title: quiz.title,
      },
    });
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function advance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const quizId = Number(req.params.quizId);
    const user = getAuthUser(req);
    const quiz = await assertQuizOwner(user, quizId);
    if (!quiz) {
      throw notFound('Quiz');
    }
    const questions = await listQuestionsRawByQuiz(quizId);
    if (questions.length === 0) {
      throw badRequest('Quiz has no questions');
    }
    const newIndex = advanceQuestion(quizId, questions.length);
    broadcastPacing({
      quizId,
      currentIndex: newIndex,
      currentQuestionId: questions[newIndex]?.id ?? null,
    });
    res.json({
      data: {
        quiz_id: quizId,
        current_index: newIndex,
        question_id: questions[newIndex]?.id ?? null,
        total_questions: questions.length,
      },
    });
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function retreat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const quizId = Number(req.params.quizId);
    const user = getAuthUser(req);
    await assertQuizOwner(user, quizId);
    const questions = await listQuestionsRawByQuiz(quizId);
    const newIndex = retreatQuestion(quizId);
    broadcastPacing({
      quizId,
      currentIndex: newIndex,
      currentQuestionId: questions[newIndex]?.id ?? null,
    });
    res.json({
      data: {
        quiz_id: quizId,
        current_index: newIndex,
        question_id: questions[newIndex]?.id ?? null,
        total_questions: questions.length,
      },
    });
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
  }
}

const broadcastPacingHandlers: ((payload: {
  quizId: number;
  currentIndex: number;
  currentQuestionId: number | null;
}) => void)[] = [];

export function registerBroadcaster(
  handler: (payload: { quizId: number; currentIndex: number; currentQuestionId: number | null }) => void
): void {
  broadcastPacingHandlers.push(handler);
}

export function broadcastPacing(payload: {
  quizId: number;
  currentIndex: number;
  currentQuestionId: number | null;
}): void {
  for (const handler of broadcastPacingHandlers) {
    handler(payload);
  }
}
