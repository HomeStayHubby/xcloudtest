import { z } from 'zod';
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
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
//# sourceMappingURL=class.validators.d.ts.map