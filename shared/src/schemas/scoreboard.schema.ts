import { z } from 'zod';

export const scoreboardEntrySchema = z.object({
  name: z.string(),
  total_score: z.number(),
  responses: z.number().int().nonnegative(),
});

export const quizScoreboardSchema = z.object({
  quiz_id: z.number().int().positive(),
  individuals: z.array(scoreboardEntrySchema),
  groups: z.array(scoreboardEntrySchema),
});

export type ScoreboardEntry = z.infer<typeof scoreboardEntrySchema>;
export type QuizScoreboard = z.infer<typeof quizScoreboardSchema>;
