import { z } from 'zod';
export declare const classSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    code: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    advisor_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    is_active: boolean;
    created_at: string | Date;
    code: string;
    updated_at: string | Date;
    name: string;
    description?: string | undefined;
    advisor_id?: number | null | undefined;
}, {
    id: number;
    created_at: string | Date;
    code: string;
    updated_at: string | Date;
    name: string;
    is_active?: boolean | undefined;
    description?: string | undefined;
    advisor_id?: number | null | undefined;
}>;
export declare const createClassSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    is_active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    is_active?: boolean | undefined;
    code?: string | undefined;
    description?: string | undefined;
}, {
    name: string;
    is_active?: boolean | undefined;
    code?: string | undefined;
    description?: string | undefined;
}>;
export declare const updateClassSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    is_active: z.ZodOptional<z.ZodBoolean>;
    advisor_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    is_active?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    advisor_id?: number | null | undefined;
}, {
    is_active?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    advisor_id?: number | null | undefined;
}>;
export declare const classSummarySchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    code: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    advisor_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
} & {
    advisor_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    student_count: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: number;
    is_active: boolean;
    created_at: string | Date;
    code: string;
    updated_at: string | Date;
    name: string;
    description?: string | undefined;
    advisor_id?: number | null | undefined;
    advisor_name?: string | null | undefined;
    student_count?: number | undefined;
}, {
    id: number;
    created_at: string | Date;
    code: string;
    updated_at: string | Date;
    name: string;
    is_active?: boolean | undefined;
    description?: string | undefined;
    advisor_id?: number | null | undefined;
    advisor_name?: string | null | undefined;
    student_count?: number | undefined;
}>;
export type Class = z.infer<typeof classSchema>;
export type CreateClass = z.infer<typeof createClassSchema>;
export type UpdateClass = z.infer<typeof updateClassSchema>;
export type ClassSummary = z.infer<typeof classSummarySchema>;
//# sourceMappingURL=class.schema.d.ts.map