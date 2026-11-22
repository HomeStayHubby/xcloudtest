import { z } from 'zod';

// A question bank holds reusable questions owned by the lecturer who created
// it. Adding a bank question to a quiz snapshot-copies it into the quiz.
export const questionBankSchema = z.object({
  id: z.number().int().positive(),
  owner_id: z.number().int().positive(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  created_at: z.string().datetime().or(z.date()),
  updated_at: z.string().datetime().or(z.date()),
});

export const createQuestionBankSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export const updateQuestionBankSchema = createQuestionBankSchema.partial();

export const questionBankDetailSchema = questionBankSchema.extend({
  owner_name: z.string().optional(),
  question_count: z.number().int().nonnegative().optional(),
});

export const copyBankQuestionToQuizSchema = z.object({
  quiz_id: z.number().int().positive(),
});

export type QuestionBank = z.infer<typeof questionBankSchema>;
export type CreateQuestionBank = z.infer<typeof createQuestionBankSchema>;
export type UpdateQuestionBank = z.infer<typeof updateQuestionBankSchema>;
export type QuestionBankDetail = z.infer<typeof questionBankDetailSchema>;
export type CopyBankQuestionToQuiz = z.infer<typeof copyBankQuestionToQuizSchema>;
