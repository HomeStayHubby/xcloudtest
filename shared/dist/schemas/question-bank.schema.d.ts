import { z } from 'zod';
export declare const questionBankSchema: z.ZodObject<{
    id: z.ZodNumber;
    owner_id: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: string | Date;
    updated_at: string | Date;
    title: string;
    owner_id: number;
    description?: string | undefined;
}, {
    id: number;
    created_at: string | Date;
    updated_at: string | Date;
    title: string;
    owner_id: number;
    description?: string | undefined;
}>;
export declare const createQuestionBankSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description?: string | undefined;
}, {
    title: string;
    description?: string | undefined;
}>;
export declare const updateQuestionBankSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    title?: string | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
}>;
export declare const questionBankDetailSchema: z.ZodObject<{
    id: z.ZodNumber;
    owner_id: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
} & {
    owner_name: z.ZodOptional<z.ZodString>;
    question_count: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: string | Date;
    updated_at: string | Date;
    title: string;
    owner_id: number;
    description?: string | undefined;
    owner_name?: string | undefined;
    question_count?: number | undefined;
}, {
    id: number;
    created_at: string | Date;
    updated_at: string | Date;
    title: string;
    owner_id: number;
    description?: string | undefined;
    owner_name?: string | undefined;
    question_count?: number | undefined;
}>;
export declare const copyBankQuestionToQuizSchema: z.ZodObject<{
    quiz_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    quiz_id: number;
}, {
    quiz_id: number;
}>;
export type QuestionBank = z.infer<typeof questionBankSchema>;
export type CreateQuestionBank = z.infer<typeof createQuestionBankSchema>;
export type UpdateQuestionBank = z.infer<typeof updateQuestionBankSchema>;
export type QuestionBankDetail = z.infer<typeof questionBankDetailSchema>;
export type CopyBankQuestionToQuiz = z.infer<typeof copyBankQuestionToQuizSchema>;
//# sourceMappingURL=question-bank.schema.d.ts.map