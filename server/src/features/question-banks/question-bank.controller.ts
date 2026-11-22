import type { Request, Response, NextFunction } from 'express';
import { getAuthUser } from '../auth/auth.middleware.js';
import {
  listBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  listBankQuestions,
} from './question-bank.service.js';
import { createBankQuestion } from '../questions/question.service.js';
import {
  createQuestionBankSchema,
  updateQuestionBankSchema,
  createQuestionSchema,
} from '@elitequest/shared';
import { z } from 'zod';

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ data: await listBanks(getAuthUser(req)) });
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    res.json({ data: await getBank(getAuthUser(req), id) });
  } catch (err) {
    next(err);
  }
}

export async function store(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createQuestionBankSchema.parse(req.body);
    res.status(201).json({ data: await createBank(getAuthUser(req), input) });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = updateQuestionBankSchema.parse(req.body);
    res.json({ data: await updateBank(getAuthUser(req), id, input) });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    await deleteBank(getAuthUser(req), id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function questions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    res.json({ data: await listBankQuestions(getAuthUser(req), id) });
  } catch (err) {
    next(err);
  }
}

export async function storeQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = bankQuestionInputSchema.parse(req.body);
    res.status(201).json({ data: await createBankQuestion(getAuthUser(req), id, input) });
  } catch (err) {
    next(err);
  }
}

const bankQuestionInputSchema = createQuestionSchema.omit({ quiz_id: true, bank_id: true });
