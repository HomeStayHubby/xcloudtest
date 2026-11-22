import { z } from 'zod';
export const classSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(150),
    code: z.string().min(4).max(20),
    description: z.string().max(500).optional(),
    is_active: z.boolean().default(true),
    advisor_id: z.number().int().positive().nullable().optional(),
    created_at: z.string().datetime().or(z.date()),
    updated_at: z.string().datetime().or(z.date()),
});
export const createClassSchema = z.object({
    name: z.string().min(1).max(150),
    code: z.string().min(4).max(20).optional(),
    description: z.string().max(500).optional(),
    is_active: z.boolean().optional(),
});
export const updateClassSchema = z.object({
    name: z.string().min(1).max(150).optional(),
    description: z.string().max(500).optional(),
    is_active: z.boolean().optional(),
    // Only admins may reassign the class advisor (enforced server-side).
    advisor_id: z.number().int().positive().nullable().optional(),
});
export const classSummarySchema = classSchema.extend({
    advisor_name: z.string().nullable().optional(),
    student_count: z.number().int().nonnegative().optional(),
});
//# sourceMappingURL=class.schema.js.map