import { z } from 'zod';

export const responseAnswerSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.record(z.string()),
]);

export const responseSchema = z.object({
  id: z.number().int().positive(),
  question_id: z.number().int().positive(),
  student_id: z.number().int().positive().nullable().optional(),
  group_id: z.number().int().positive().nullable().optional(),
  answer: responseAnswerSchema,
  score: z.number().min(0).nullable().optional(),
  submitted_at: z.string().datetime().or(z.date()),
});

export const createResponseSchema = responseSchema.omit({
  id: true,
  score: true,
  submitted_at: true,
});

export type ResponseAnswer = z.infer<typeof responseAnswerSchema>;
export type Response = z.infer<typeof responseSchema>;
export type CreateResponse = z.infer<typeof createResponseSchema>;
