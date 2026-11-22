import { z } from 'zod';
export const individualLeaderboardEntrySchema = z.object({
    student_id: z.number().int().positive(),
    display_name: z.string(),
    total_score: z.number(),
    responses: z.number().int().nonnegative(),
});
export const groupLeaderboardEntrySchema = z.object({
    group_id: z.number().int().positive(),
    group_name: z.string(),
    total_score: z.number(),
    responses: z.number().int().nonnegative(),
});
export const classLeaderboardSchema = z.object({
    class_id: z.number().int().positive(),
    individuals: z.array(individualLeaderboardEntrySchema),
    groups: z.array(groupLeaderboardEntrySchema),
});
//# sourceMappingURL=leaderboard.schema.js.map