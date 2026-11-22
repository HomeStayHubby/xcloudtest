import { z } from 'zod';
export declare const responseAnswerSchema: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodRecord<z.ZodString, z.ZodString>]>;
export declare const responseSchema: z.ZodObject<{
    id: z.ZodNumber;
    question_id: z.ZodNumber;
    student_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    group_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    answer: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodRecord<z.ZodString, z.ZodString>]>;
    score: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    submitted_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    answer: string | string[] | Record<string, string>;
    question_id: number;
    submitted_at: string | Date;
    group_id?: number | null | undefined;
    student_id?: number | null | undefined;
    score?: number | null | undefined;
}, {
    id: number;
    answer: string | string[] | Record<string, string>;
    question_id: number;
    submitted_at: string | Date;
    group_id?: number | null | undefined;
    student_id?: number | null | undefined;
    score?: number | null | undefined;
}>;
export declare const createResponseSchema: z.ZodObject<Omit<{
    id: z.ZodNumber;
    question_id: z.ZodNumber;
    student_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    group_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    answer: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodRecord<z.ZodString, z.ZodString>]>;
    score: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    submitted_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "id" | "score" | "submitted_at">, "strip", z.ZodTypeAny, {
    answer: string | string[] | Record<string, string>;
    question_id: number;
    group_id?: number | null | undefined;
    student_id?: number | null | undefined;
}, {
    answer: string | string[] | Record<string, string>;
    question_id: number;
    group_id?: number | null | undefined;
    student_id?: number | null | undefined;
}>;
export type ResponseAnswer = z.infer<typeof responseAnswerSchema>;
export type Response = z.infer<typeof responseSchema>;
export type CreateResponse = z.infer<typeof createResponseSchema>;
//# sourceMappingURL=response.schema.d.ts.map