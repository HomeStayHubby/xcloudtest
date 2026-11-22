import { z } from 'zod';
export declare const quizIdParamSchema: z.ZodObject<{
    quizId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    quizId: number;
}, {
    quizId: number;
}>;
export declare const groupIdParamSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const groupStudentParamsSchema: z.ZodObject<{
    id: z.ZodNumber;
    studentId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
    studentId: number;
}, {
    id: number;
    studentId: number;
}>;
//# sourceMappingURL=group.validators.d.ts.map