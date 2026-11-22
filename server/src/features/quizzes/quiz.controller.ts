import type { Request, Response, NextFunction } from 'express';
import {
  idParamSchema,
  createQuizSchema,
  updateQuizSchema,
  releaseParamsSchema,
} from './quiz.validators.js';
import { releaseQuizSchema } from '@elitequest/shared';
import { getAuthUser } from '../auth/auth.middleware.js';
import {
  listQuizzes,
  getQuizDetail,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  setQuizStatus,
  releaseQuiz,
  unreleaseQuiz,
} from './quiz.service.js';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ data: await listQuizzes(getAuthUser(req)) });
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    res.json({ data: await getQuizDetail(getAuthUser(req), id) });
  } catch (err) {
    next(err);
  }
}

export async function store(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createQuizSchema.parse(req.body);
    res.status(201).json({ data: await createQuiz(getAuthUser(req), input) });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = updateQuizSchema.parse(req.body);
    res.json({ data: await updateQuiz(getAuthUser(req), id, input) });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    await deleteQuiz(getAuthUser(req), id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function open(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const quiz = await setQuizStatus(getAuthUser(req), id, 'open', ['draft', 'closed']);
    res.json({ data: quiz });
  } catch (err) {
    next(err);
  }
}

export async function close(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const quiz = await setQuizStatus(getAuthUser(req), id, 'closed', ['open']);
    res.json({ data: quiz });
  } catch (err) {
    next(err);
  }
}

export async function release(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = releaseQuizSchema.parse(req.body);
    res.json({ data: await releaseQuiz(getAuthUser(req), id, input.class_id) });
  } catch (err) {
    next(err);
  }
}

export async function unrelease(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id, classId } = releaseParamsSchema.parse(req.params);
    await unreleaseQuiz(getAuthUser(req), id, classId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
