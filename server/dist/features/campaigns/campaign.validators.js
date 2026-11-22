import { z } from 'zod';
import { createCampaignSchema as sharedCreateCampaignSchema, updateCampaignSchema as sharedUpdateCampaignSchema, reorderPlaylistSchema as sharedReorderPlaylistSchema, } from '@elitequest/shared';
export const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});
export const campaignQuizParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
    quizId: z.coerce.number().int().positive(),
});
export const listCampaignsQuerySchema = z.object({
    class_id: z.coerce.number().int().positive(),
});
export const addQuizSchema = z.object({
    quiz_id: z.coerce.number().int().positive(),
});
export const createCampaignSchema = sharedCreateCampaignSchema;
export const updateCampaignSchema = sharedUpdateCampaignSchema;
export const reorderPlaylistSchema = sharedReorderPlaylistSchema;
//# sourceMappingURL=campaign.validators.js.map