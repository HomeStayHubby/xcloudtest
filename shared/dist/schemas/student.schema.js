import { z } from 'zod';
// Student passwords: 1-50 characters of anything (letters, digits, symbols,
// emoji). bcrypt only hashes the first 72 UTF-8 bytes, so also cap the byte
// length to avoid silent truncation.
export const studentPasswordSchema = z
    .string()
    .min(1)
    .max(50)
    .refine((password) => new TextEncoder().encode(password).length <= 72, {
    message: 'Password is too long (more than 72 UTF-8 bytes)',
});
// Students are user accounts (role 'student') created and managed by their
// class advisor. They log in with username + password.
export const studentAccountSchema = z.object({
    id: z.number().int().positive(),
    class_id: z.number().int().positive(),
    username: z.string().min(3).max(50),
    display_name: z.string().min(1).max(100),
    student_number: z.string().max(50).nullable().optional(),
    is_active: z.boolean().default(true),
    created_at: z.string().datetime().or(z.date()),
});
export const createStudentAccountSchema = z.object({
    username: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9._-]+$/, 'Username may only contain letters, numbers, dots, underscores and dashes'),
    display_name: z.string().min(1).max(100),
    password: studentPasswordSchema.optional(),
    student_number: z.string().max(50).optional(),
});
export const updateStudentAccountSchema = z.object({
    username: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9._-]+$/, 'Username may only contain letters, numbers, dots, underscores and dashes')
        .optional(),
    display_name: z.string().min(1).max(100).optional(),
    student_number: z.string().max(50).nullable().optional(),
    is_active: z.boolean().optional(),
});
export const setStudentPasswordSchema = z.object({
    password: studentPasswordSchema,
});
// One row of an advisor's roster XLSX import.
export const studentImportRowSchema = z.object({
    username: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9._-]+$/, 'Username may only contain letters, numbers, dots, underscores and dashes'),
    display_name: z.string().min(1).max(100),
    student_number: z.string().max(50).optional(),
    password: studentPasswordSchema.optional(),
});
export const studentImportResultSchema = z.object({
    created: z.number().int().nonnegative(),
    updated: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative(),
    errors: z.array(z.object({ row: z.number().int().nonnegative(), message: z.string() })),
});
// Bulk roster actions from the student table (advisor only).
export const bulkStudentActionSchema = z.object({
    ids: z.array(z.number().int().positive()).min(1).max(500),
    action: z.enum(['activate', 'deactivate', 'delete']),
});
export const bulkStudentActionResultSchema = z.object({
    updated: z.number().int().nonnegative(),
    deleted: z.number().int().nonnegative(),
    errors: z.array(z.object({ id: z.number().int().positive(), message: z.string() })),
});
//# sourceMappingURL=student.schema.js.map