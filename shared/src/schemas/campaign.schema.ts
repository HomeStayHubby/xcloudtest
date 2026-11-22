import { z } from 'zod';
import { quizSchema } from './quiz.schema.js';

export const campaignSchema = z.object({
  id: z.number().int().positive(),
  class_id: z.number().int().positive(),
  created_by: z.number().int().positive(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  created_at: z.string().datetime().or(z.date()),
  updated_at: z.string().datetime().or(z.date()),
});

export const createCampaignSchema = z.object({
  class_id: z.number().int().positive(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const campaignPlaylistItemSchema = z.object({
  quiz_id: z.number().int().positive(),
  position: z.number().int().nonnegative(),
  quiz: quizSchema,
});

export const campaignDetailSchema = campaignSchema.extend({
  items: z.array(campaignPlaylistItemSchema),
});

export const reorderPlaylistSchema = z.object({
  quiz_ids: z.array(z.number().int().positive()),
});

export const campaignPerQuizResultSchema = z.object({
  quiz_id: z.number().int().positive(),
  quiz_title: z.string(),
  responses: z.number().int().nonnegative(),
  total_score: z.number(),
});

export const campaignResultsSchema = z.object({
  campaign_id: z.number().int().positive(),
  class_id: z.number().int().positive(),
  individuals: z.array(
    z.object({
      student_id: z.number().int().positive(),
      display_name: z.string(),
      total_score: z.number(),
      responses: z.number().int().nonnegative(),
    })
  ),
  groups: z.array(
    z.object({
      group_id: z.number().int().positive(),
      group_name: z.string(),
      total_score: z.number(),
      responses: z.number().int().nonnegative(),
    })
  ),
  per_quiz: z.array(campaignPerQuizResultSchema),
});

export type Campaign = z.infer<typeof campaignSchema>;
export type CreateCampaign = z.infer<typeof createCampaignSchema>;
export type UpdateCampaign = z.infer<typeof updateCampaignSchema>;
export type CampaignPlaylistItem = z.infer<typeof campaignPlaylistItemSchema>;
export type CampaignDetail = z.infer<typeof campaignDetailSchema>;
export type ReorderPlaylist = z.infer<typeof reorderPlaylistSchema>;
export type CampaignPerQuizResult = z.infer<typeof campaignPerQuizResultSchema>;
export type CampaignResults = z.infer<typeof campaignResultsSchema>;
