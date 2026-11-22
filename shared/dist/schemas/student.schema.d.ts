import { z } from 'zod';
export declare const studentPasswordSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const studentAccountSchema: z.ZodObject<{
    id: z.ZodNumber;
    class_id: z.ZodNumber;
    username: z.ZodString;
    display_name: z.ZodString;
    student_number: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    username: string;
    display_name: string;
    class_id: number;
    is_active: boolean;
    created_at: string | Date;
    student_number?: string | null | undefined;
}, {
    id: number;
    username: string;
    display_name: string;
    class_id: number;
    created_at: string | Date;
    is_active?: boolean | undefined;
    student_number?: string | null | undefined;
}>;
export declare const createStudentAccountSchema: z.ZodObject<{
    username: z.ZodString;
    display_name: z.ZodString;
    password: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    student_number: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    username: string;
    display_name: string;
    password?: string | undefined;
    student_number?: string | undefined;
}, {
    username: string;
    display_name: string;
    password?: string | undefined;
    student_number?: string | undefined;
}>;
export declare const updateStudentAccountSchema: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    display_name: z.ZodOptional<z.ZodString>;
    student_number: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    username?: string | undefined;
    display_name?: string | undefined;
    is_active?: boolean | undefined;
    student_number?: string | null | undefined;
}, {
    username?: string | undefined;
    display_name?: string | undefined;
    is_active?: boolean | undefined;
    student_number?: string | null | undefined;
}>;
export declare const setStudentPasswordSchema: z.ZodObject<{
    password: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    password: string;
}, {
    password: string;
}>;
export declare const studentImportRowSchema: z.ZodObject<{
    username: z.ZodString;
    display_name: z.ZodString;
    student_number: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    username: string;
    display_name: string;
    password?: string | undefined;
    student_number?: string | undefined;
}, {
    username: string;
    display_name: string;
    password?: string | undefined;
    student_number?: string | undefined;
}>;
export declare const studentImportResultSchema: z.ZodObject<{
    created: z.ZodNumber;
    updated: z.ZodNumber;
    skipped: z.ZodNumber;
    errors: z.ZodArray<z.ZodObject<{
        row: z.ZodNumber;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        row: number;
    }, {
        message: string;
        row: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    created: number;
    updated: number;
    skipped: number;
    errors: {
        message: string;
        row: number;
    }[];
}, {
    created: number;
    updated: number;
    skipped: number;
    errors: {
        message: string;
        row: number;
    }[];
}>;
export declare const bulkStudentActionSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
    action: z.ZodEnum<["activate", "deactivate", "delete"]>;
}, "strip", z.ZodTypeAny, {
    ids: number[];
    action: "activate" | "deactivate" | "delete";
}, {
    ids: number[];
    action: "activate" | "deactivate" | "delete";
}>;
export declare const bulkStudentActionResultSchema: z.ZodObject<{
    updated: z.ZodNumber;
    deleted: z.ZodNumber;
    errors: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        message: string;
    }, {
        id: number;
        message: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    updated: number;
    errors: {
        id: number;
        message: string;
    }[];
    deleted: number;
}, {
    updated: number;
    errors: {
        id: number;
        message: string;
    }[];
    deleted: number;
}>;
export type StudentAccount = z.infer<typeof studentAccountSchema>;
export type CreateStudentAccount = z.infer<typeof createStudentAccountSchema>;
export type UpdateStudentAccount = z.infer<typeof updateStudentAccountSchema>;
export type SetStudentPassword = z.infer<typeof setStudentPasswordSchema>;
export type StudentImportRow = z.infer<typeof studentImportRowSchema>;
export type StudentImportResult = z.infer<typeof studentImportResultSchema>;
export type BulkStudentAction = z.infer<typeof bulkStudentActionSchema>;
export type BulkStudentActionResult = z.infer<typeof bulkStudentActionResultSchema>;
//# sourceMappingURL=student.schema.d.ts.map