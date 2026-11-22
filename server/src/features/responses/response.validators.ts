import { z } from 'zod';
import { responseAnswerSchema } from '@elitequest/shared';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createResponseSchema = z.object({
  answer: responseAnswerSchema,
});

export const manualScoreSchema = z.object({
  score: z.number().min(0),
});
