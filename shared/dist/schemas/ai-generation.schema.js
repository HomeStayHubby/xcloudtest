import { z } from 'zod';
import { questionDataSchema, questionTypeSchema, bloomLevelSchema } from './question.schema.js';
// Request for AI question generation. material_text comes from the
// extract-material endpoint (or a lecturer paste); nothing is persisted.
export const generateQuestionsRequestSchema = z.object({
    material_text: z.string().min(1).max(100000),
    prompt: z.string().max(2000).optional(),
    count: z.number().int().min(1).max(20).default(5),
    // Bloom levels 1-3. Omitted = the AI distributes across all three.
    bloom_levels: z.array(bloomLevelSchema).min(1).max(3).optional(),
    // Per-run model override; falls back to the admin-configured default.
    model: z.string().min(1).max(200).optional(),
});
// One AI-proposed question, validated against the same union as manually
// created questions. Saving still goes through the normal create endpoints
// after lecturer review — nothing is inserted automatically.
export const candidateQuestionSchema = z
    .object({
    type: questionTypeSchema,
    prompt: z.string().min(1).max(20000),
    data: questionDataSchema,
    answer_mode: z.enum(['individual', 'group']).default('individual'),
    points: z.number().min(0),
    bloom_level: bloomLevelSchema,
})
    .refine((candidate) => candidate.type === candidate.data.type, {
    message: 'type must match data.type',
});
export const generateQuestionsResponseSchema = z.object({
    questions: z.array(candidateQuestionSchema),
    // Present when some candidates failed validation and were dropped/repaired.
    warning: z.string().optional(),
});
export const extractedMaterialSchema = z.object({
    text: z.string(),
    truncated: z.boolean(),
});
//# sourceMappingURL=ai-generation.schema.js.map