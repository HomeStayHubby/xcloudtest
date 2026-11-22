import { z } from 'zod';
import { createQuizSchema as sharedCreateQuizSchema, updateQuizSchema as sharedUpdateQuizSchema } from '@elitequest/shared';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const releaseParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
});

export const createQuizSchema = sharedCreateQuizSchema;
export const updateQuizSchema = sharedUpdateQuizSchema;
