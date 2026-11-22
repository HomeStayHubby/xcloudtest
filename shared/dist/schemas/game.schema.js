import { z } from 'zod';
const wheelSegmentSchema = z.object({
    label: z.string().min(1),
    weight: z.number().positive().default(1),
});
export const wheelSettingsSchema = z.object({
    segments: z.array(wheelSegmentSchema).min(2),
});
const jeopardyCellSchema = z.object({
    id: z.string().min(1),
    category_id: z.string().min(1),
    points: z.number().positive(),
    prompt: z.string().min(1),
});
const jeopardyCategorySchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
});
export const jeopardySettingsSchema = z.object({
    categories: z.array(jeopardyCategorySchema).min(1),
    cells: z.array(jeopardyCellSchema).min(1),
});
export const gameSettingsSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('wheel_of_fortune'), ...wheelSettingsSchema.shape }),
    z.object({ kind: z.literal('jeopardy'), ...jeopardySettingsSchema.shape }),
]);
export const gameSchema = z.object({
    id: z.number().int().positive(),
    class_id: z.number().int().positive(),
    name: z.string().min(1).max(150),
    type: z.enum(['wheel_of_fortune', 'jeopardy']),
    settings: gameSettingsSchema,
    created_at: z.string().datetime().or(z.date()),
});
export const createGameSchema = gameSchema.omit({
    id: true,
    created_at: true,
});
export const updateGameSchema = createGameSchema.partial().omit({ type: true, class_id: true });
//# sourceMappingURL=game.schema.js.map