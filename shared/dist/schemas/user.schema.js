import { z } from 'zod';
export const userRoleSchema = z.enum(['lecturer', 'student']);
export const userSchema = z.object({
    id: z.number().int().positive(),
    email: z.string().email().nullable().optional(),
    username: z.string().min(3).max(50).nullable().optional(),
    password_hash: z.string().min(1),
    display_name: z.string().min(1).max(100),
    role: userRoleSchema,
    is_admin: z.boolean().default(false),
    class_id: z.number().int().positive().nullable().optional(),
    is_active: z.boolean().default(true),
    created_at: z.string().datetime().or(z.date()),
    updated_at: z.string().datetime().or(z.date()),
});
// Safe shape returned by the API — never includes password_hash.
export const publicUserSchema = userSchema.omit({ password_hash: true });
// Lecturers log in with their email, students with their username.
export const loginUserSchema = z.object({
    identifier: z.string().min(1).max(200),
    password: z.string().min(1),
});
// Admin-only: create a lecturer account.
export const createLecturerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    display_name: z.string().min(1).max(100),
    is_admin: z.boolean().optional().default(false),
});
export const updateLecturerSchema = z.object({
    email: z.string().email().optional(),
    display_name: z.string().min(1).max(100).optional(),
    is_admin: z.boolean().optional(),
    is_active: z.boolean().optional(),
});
export const resetPasswordSchema = z.object({
    password: z.string().min(8).max(100),
});
//# sourceMappingURL=user.schema.js.map