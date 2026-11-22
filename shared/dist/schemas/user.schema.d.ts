import { z } from 'zod';
export declare const userRoleSchema: z.ZodEnum<["lecturer", "student"]>;
export declare const userSchema: z.ZodObject<{
    id: z.ZodNumber;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    password_hash: z.ZodString;
    display_name: z.ZodString;
    role: z.ZodEnum<["lecturer", "student"]>;
    is_admin: z.ZodDefault<z.ZodBoolean>;
    class_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    password_hash: string;
    display_name: string;
    role: "lecturer" | "student";
    is_admin: boolean;
    is_active: boolean;
    created_at: string | Date;
    updated_at: string | Date;
    email?: string | null | undefined;
    username?: string | null | undefined;
    class_id?: number | null | undefined;
}, {
    id: number;
    password_hash: string;
    display_name: string;
    role: "lecturer" | "student";
    created_at: string | Date;
    updated_at: string | Date;
    email?: string | null | undefined;
    username?: string | null | undefined;
    is_admin?: boolean | undefined;
    class_id?: number | null | undefined;
    is_active?: boolean | undefined;
}>;
export declare const publicUserSchema: z.ZodObject<Omit<{
    id: z.ZodNumber;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    password_hash: z.ZodString;
    display_name: z.ZodString;
    role: z.ZodEnum<["lecturer", "student"]>;
    is_admin: z.ZodDefault<z.ZodBoolean>;
    class_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "password_hash">, "strip", z.ZodTypeAny, {
    id: number;
    display_name: string;
    role: "lecturer" | "student";
    is_admin: boolean;
    is_active: boolean;
    created_at: string | Date;
    updated_at: string | Date;
    email?: string | null | undefined;
    username?: string | null | undefined;
    class_id?: number | null | undefined;
}, {
    id: number;
    display_name: string;
    role: "lecturer" | "student";
    created_at: string | Date;
    updated_at: string | Date;
    email?: string | null | undefined;
    username?: string | null | undefined;
    is_admin?: boolean | undefined;
    class_id?: number | null | undefined;
    is_active?: boolean | undefined;
}>;
export declare const loginUserSchema: z.ZodObject<{
    identifier: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    identifier: string;
    password: string;
}, {
    identifier: string;
    password: string;
}>;
export declare const createLecturerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    display_name: z.ZodString;
    is_admin: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    display_name: string;
    is_admin: boolean;
    password: string;
}, {
    email: string;
    display_name: string;
    password: string;
    is_admin?: boolean | undefined;
}>;
export declare const updateLecturerSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    display_name: z.ZodOptional<z.ZodString>;
    is_admin: z.ZodOptional<z.ZodBoolean>;
    is_active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    display_name?: string | undefined;
    is_admin?: boolean | undefined;
    is_active?: boolean | undefined;
}, {
    email?: string | undefined;
    display_name?: string | undefined;
    is_admin?: boolean | undefined;
    is_active?: boolean | undefined;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
}, {
    password: string;
}>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type User = z.infer<typeof userSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type CreateLecturer = z.infer<typeof createLecturerSchema>;
export type UpdateLecturer = z.infer<typeof updateLecturerSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
//# sourceMappingURL=user.schema.d.ts.map