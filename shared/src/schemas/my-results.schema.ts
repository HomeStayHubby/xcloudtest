import { z } from 'zod';
import { questionTypeSchema } from './question.schema.js';
import { quizStatusSchema } from './quiz.schema.js';

// One question in the student's post-quiz summary. `correct` is null when the
// question was not answered or awaits manual grading (word cloud,
// brainstorming). Display strings are pre-formatted server-side so the client
// renders them directly.
export const myResultsItemSchema = z.object({
  question_id: z.number().int().positive(),
  order_index: z.number().int().nonnegative(),
  prompt: z.string(),
  type: questionTypeSchema,
  answer_mode: z.enum(['individual', 'group']),
  points: z.number().min(0),
  my_answer_display: z.string().nullable(),
  score: z.number().min(0).nullable(),
  correct: z.boolean().nullable(),
  // Human-readable answer key; only present when the quiz setting allows it.
  correct_answer: z.string().nullable(),
});

export const myQuizResultsSchema = z.object({
  quiz_id: z.number().int().positive(),
  quiz_title: z.string(),
  quiz_status: quizStatusSchema,
  reveal_answers: z.boolean(),
  total_score: z.number(),
  points_possible: z.number(),
  answered: z.number().int().nonnegative(),
  total_questions: z.number().int().nonnegative(),
  items: z.array(myResultsItemSchema),
});

export type MyResultsItem = z.infer<typeof myResultsItemSchema>;
export type MyQuizResults = z.infer<typeof myQuizResultsSchema>;
