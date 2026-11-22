import { z } from 'zod';
import { createQuestionSchema as sharedCreateQuestionSchema, updateQuestionSchema as sharedUpdateQuestionSchema } from '@elitequest/shared';

export const quizIdParamSchema = z.object({
  quizId: z.coerce.number().int().positive(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const copyFromBankSchema = z.object({
  bank_id: z.coerce.number().int().positive(),
  question_id: z.coerce.number().int().positive(),
});

export const createQuestionSchema = sharedCreateQuestionSchema.omit({ quiz_id: true, bank_id: true });
export const updateQuestionSchema = sharedUpdateQuestionSchema.omit({ quiz_id: true, bank_id: true });
