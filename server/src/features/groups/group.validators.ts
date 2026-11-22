import { z } from 'zod';

export const quizIdParamSchema = z.object({
  quizId: z.coerce.number().int().positive(),
});

export const groupIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const groupStudentParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  studentId: z.coerce.number().int().positive(),
});
