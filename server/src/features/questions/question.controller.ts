import type { Request, Response, NextFunction } from 'express';
import {
  quizIdParamSchema,
  idParamSchema,
  createQuestionSchema,
  updateQuestionSchema,
  copyFromBankSchema,
} from './question.validators.js';
import { getAuthUser } from '../auth/auth.middleware.js';
import {
  listQuestionsByQuiz,
  createQuestion,
  copyBankQuestionToQuiz,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from './question.service.js';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { quizId } = quizIdParamSchema.parse(req.params);
    const questions = await listQuestionsByQuiz(getAuthUser(req), quizId);
    res.json({ data: questions });
  } catch (err) {
    next(err);
  }
}

export async function store(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { quizId } = quizIdParamSchema.parse(req.params);
    const input = createQuestionSchema.parse(req.body);
    const question = await createQuestion(getAuthUser(req), quizId, input);
    res.status(201).json({ data: question });
  } catch (err) {
    next(err);
  }
}

export async function copyFromBank(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { quizId } = quizIdParamSchema.parse(req.params);
    const input = copyFromBankSchema.parse(req.body);
    const question = await copyBankQuestionToQuiz(
      getAuthUser(req),
      input.bank_id,
      input.question_id,
      quizId
    );
    res.status(201).json({ data: question });
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const question = await getQuestionById(id);
    res.json({ data: question });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = updateQuestionSchema.parse(req.body);
    const question = await updateQuestion(getAuthUser(req), id, input);
    res.json({ data: question });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    await deleteQuestion(getAuthUser(req), id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
