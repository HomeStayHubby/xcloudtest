import { z } from 'zod';
export declare const resultClassSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
}, {
    id: number;
    name: string;
}>;
export declare const questionResultSummarySchema: z.ZodObject<{
    question_id: z.ZodNumber;
    order_index: z.ZodNumber;
    prompt: z.ZodString;
    type: z.ZodString;
    answer_mode: z.ZodString;
    points: z.ZodNumber;
    response_count: z.ZodNumber;
    average_score: z.ZodNullable<z.ZodNumber>;
    correct_rate: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: string;
    prompt: string;
    order_index: number;
    answer_mode: string;
    points: number;
    question_id: number;
    response_count: number;
    average_score: number | null;
    correct_rate: number | null;
}, {
    type: string;
    prompt: string;
    order_index: number;
    answer_mode: string;
    points: number;
    question_id: number;
    response_count: number;
    average_score: number | null;
    correct_rate: number | null;
}>;
export declare const responseRowSchema: z.ZodObject<{
    response_id: z.ZodNumber;
    question_id: z.ZodNumber;
    order_index: z.ZodNumber;
    prompt: z.ZodString;
    type: z.ZodString;
    student_name: z.ZodNullable<z.ZodString>;
    class_name: z.ZodNullable<z.ZodString>;
    group_name: z.ZodNullable<z.ZodString>;
    answer: z.ZodString;
    score: z.ZodNullable<z.ZodNumber>;
    submitted_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    type: string;
    class_name: string | null;
    prompt: string;
    answer: string;
    order_index: number;
    question_id: number;
    score: number | null;
    submitted_at: string | Date;
    group_name: string | null;
    response_id: number;
    student_name: string | null;
}, {
    type: string;
    class_name: string | null;
    prompt: string;
    answer: string;
    order_index: number;
    question_id: number;
    score: number | null;
    submitted_at: string | Date;
    group_name: string | null;
    response_id: number;
    student_name: string | null;
}>;
export declare const quizResultsSchema: z.ZodObject<{
    quiz_id: z.ZodNumber;
    quiz_title: z.ZodString;
    class_id: z.ZodNullable<z.ZodNumber>;
    classes: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
    }, {
        id: number;
        name: string;
    }>, "many">;
    summary: z.ZodArray<z.ZodObject<{
        question_id: z.ZodNumber;
        order_index: z.ZodNumber;
        prompt: z.ZodString;
        type: z.ZodString;
        answer_mode: z.ZodString;
        points: z.ZodNumber;
        response_count: z.ZodNumber;
        average_score: z.ZodNullable<z.ZodNumber>;
        correct_rate: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        prompt: string;
        order_index: number;
        answer_mode: string;
        points: number;
        question_id: number;
        response_count: number;
        average_score: number | null;
        correct_rate: number | null;
    }, {
        type: string;
        prompt: string;
        order_index: number;
        answer_mode: string;
        points: number;
        question_id: number;
        response_count: number;
        average_score: number | null;
        correct_rate: number | null;
    }>, "many">;
    responses: z.ZodArray<z.ZodObject<{
        response_id: z.ZodNumber;
        question_id: z.ZodNumber;
        order_index: z.ZodNumber;
        prompt: z.ZodString;
        type: z.ZodString;
        student_name: z.ZodNullable<z.ZodString>;
        class_name: z.ZodNullable<z.ZodString>;
        group_name: z.ZodNullable<z.ZodString>;
        answer: z.ZodString;
        score: z.ZodNullable<z.ZodNumber>;
        submitted_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        class_name: string | null;
        prompt: string;
        answer: string;
        order_index: number;
        question_id: number;
        score: number | null;
        submitted_at: string | Date;
        group_name: string | null;
        response_id: number;
        student_name: string | null;
    }, {
        type: string;
        class_name: string | null;
        prompt: string;
        answer: string;
        order_index: number;
        question_id: number;
        score: number | null;
        submitted_at: string | Date;
        group_name: string | null;
        response_id: number;
        student_name: string | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    class_id: number | null;
    quiz_id: number;
    quiz_title: string;
    responses: {
        type: string;
        class_name: string | null;
        prompt: string;
        answer: string;
        order_index: number;
        question_id: number;
        score: number | null;
        submitted_at: string | Date;
        group_name: string | null;
        response_id: number;
        student_name: string | null;
    }[];
    classes: {
        id: number;
        name: string;
    }[];
    summary: {
        type: string;
        prompt: string;
        order_index: number;
        answer_mode: string;
        points: number;
        question_id: number;
        response_count: number;
        average_score: number | null;
        correct_rate: number | null;
    }[];
}, {
    class_id: number | null;
    quiz_id: number;
    quiz_title: string;
    responses: {
        type: string;
        class_name: string | null;
        prompt: string;
        answer: string;
        order_index: number;
        question_id: number;
        score: number | null;
        submitted_at: string | Date;
        group_name: string | null;
        response_id: number;
        student_name: string | null;
    }[];
    classes: {
        id: number;
        name: string;
    }[];
    summary: {
        type: string;
        prompt: string;
        order_index: number;
        answer_mode: string;
        points: number;
        question_id: number;
        response_count: number;
        average_score: number | null;
        correct_rate: number | null;
    }[];
}>;
export type ResultClass = z.infer<typeof resultClassSchema>;
export type QuestionResultSummary = z.infer<typeof questionResultSummarySchema>;
export type ResponseRow = z.infer<typeof responseRowSchema>;
export type QuizResults = z.infer<typeof quizResultsSchema>;
//# sourceMappingURL=results.schema.d.ts.map