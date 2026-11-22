import { z } from 'zod';
export const resultClassSchema = z.object({
    id: z.number().int().positive(),
    name: z.string(),
});
export const questionResultSummarySchema = z.object({
    question_id: z.number().int().positive(),
    order_index: z.number().int().nonnegative(),
    prompt: z.string(),
    type: z.string(),
    answer_mode: z.string(),
    points: z.number(),
    response_count: z.number().int().nonnegative(),
    average_score: z.number().nullable(),
    correct_rate: z.number().nullable(),
});
export const responseRowSchema = z.object({
    response_id: z.number().int().positive(),
    question_id: z.number().int().positive(),
    order_index: z.number().int().nonnegative(),
    prompt: z.string(),
    type: z.string(),
    student_name: z.string().nullable(),
    class_name: z.string().nullable(),
    group_name: z.string().nullable(),
    answer: z.string(),
    score: z.number().nullable(),
    submitted_at: z.string().or(z.date()),
});
export const quizResultsSchema = z.object({
    quiz_id: z.number().int().positive(),
    quiz_title: z.string(),
    class_id: z.number().int().positive().nullable(),
    classes: z.array(resultClassSchema),
    summary: z.array(questionResultSummarySchema),
    responses: z.array(responseRowSchema),
});
//# sourceMappingURL=results.schema.js.map