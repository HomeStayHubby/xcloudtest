import { z } from 'zod';
export const quizStatusSchema = z.enum(['draft', 'open', 'closed', 'archived']);
export const quizSettingsSchema = z.object({
    randomize_questions: z.boolean().default(false),
    show_answers: z.boolean().default(true),
    reveal_answers_in_summary: z.boolean().default(true),
    time_limit_seconds: z.number().int().positive().optional(),
    default_answer_mode: z.enum(['individual', 'group']).default('individual'),
    paced: z.boolean().default(false),
    sprint: z.boolean().default(false),
    sprint_bonus_pct: z.number().min(0).max(2).default(0.25),
});
export const quizSchema = z.object({
    id: z.number().int().positive(),
    created_by: z.number().int().positive(),
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    status: quizStatusSchema,
    settings: quizSettingsSchema.default({}),
    created_at: z.string().datetime().or(z.date()),
    updated_at: z.string().datetime().or(z.date()),
});
export const createQuizSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    settings: quizSettingsSchema.optional(),
});
export const updateQuizSchema = createQuizSchema.partial();
// A quiz release makes a quiz visible to one class.
export const quizReleaseSchema = z.object({
    id: z.number().int().positive(),
    quiz_id: z.number().int().positive(),
    class_id: z.number().int().positive(),
    class_name: z.string().optional(),
    created_at: z.string().datetime().or(z.date()),
});
export const releaseQuizSchema = z.object({
    class_id: z.number().int().positive(),
});
// Quiz with its releases (lecturer-facing detail).
export const quizDetailSchema = quizSchema.extend({
    created_by_name: z.string().optional(),
    releases: z.array(quizReleaseSchema).default([]),
});
// An open quiz as seen from the student play flow, annotated with the campaign
// it is being played through (if any).
export const quizWithCampaignSchema = quizSchema.extend({
    campaign_id: z.number().int().positive().nullable(),
    campaign_title: z.string().nullable(),
});
//# sourceMappingURL=quiz.schema.js.map