import { z } from 'zod';
export declare const myResultsItemSchema: z.ZodObject<{
    question_id: z.ZodNumber;
    order_index: z.ZodNumber;
    prompt: z.ZodString;
    type: z.ZodEnum<["mcq_single", "mcq_multi", "short_answer", "fill_blanks", "matching", "grouping", "word_cloud", "brainstorming"]>;
    answer_mode: z.ZodEnum<["individual", "group"]>;
    points: z.ZodNumber;
    my_answer_display: z.ZodNullable<z.ZodString>;
    score: z.ZodNullable<z.ZodNumber>;
    correct: z.ZodNullable<z.ZodBoolean>;
    correct_answer: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
    prompt: string;
    order_index: number;
    answer_mode: "individual" | "group";
    points: number;
    question_id: number;
    score: number | null;
    my_answer_display: string | null;
    correct: boolean | null;
    correct_answer: string | null;
}, {
    type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
    prompt: string;
    order_index: number;
    answer_mode: "individual" | "group";
    points: number;
    question_id: number;
    score: number | null;
    my_answer_display: string | null;
    correct: boolean | null;
    correct_answer: string | null;
}>;
export declare const myQuizResultsSchema: z.ZodObject<{
    quiz_id: z.ZodNumber;
    quiz_title: z.ZodString;
    quiz_status: z.ZodEnum<["draft", "open", "closed", "archived"]>;
    reveal_answers: z.ZodBoolean;
    total_score: z.ZodNumber;
    points_possible: z.ZodNumber;
    answered: z.ZodNumber;
    total_questions: z.ZodNumber;
    items: z.ZodArray<z.ZodObject<{
        question_id: z.ZodNumber;
        order_index: z.ZodNumber;
        prompt: z.ZodString;
        type: z.ZodEnum<["mcq_single", "mcq_multi", "short_answer", "fill_blanks", "matching", "grouping", "word_cloud", "brainstorming"]>;
        answer_mode: z.ZodEnum<["individual", "group"]>;
        points: z.ZodNumber;
        my_answer_display: z.ZodNullable<z.ZodString>;
        score: z.ZodNullable<z.ZodNumber>;
        correct: z.ZodNullable<z.ZodBoolean>;
        correct_answer: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
        prompt: string;
        order_index: number;
        answer_mode: "individual" | "group";
        points: number;
        question_id: number;
        score: number | null;
        my_answer_display: string | null;
        correct: boolean | null;
        correct_answer: string | null;
    }, {
        type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
        prompt: string;
        order_index: number;
        answer_mode: "individual" | "group";
        points: number;
        question_id: number;
        score: number | null;
        my_answer_display: string | null;
        correct: boolean | null;
        correct_answer: string | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    quiz_id: number;
    items: {
        type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
        prompt: string;
        order_index: number;
        answer_mode: "individual" | "group";
        points: number;
        question_id: number;
        score: number | null;
        my_answer_display: string | null;
        correct: boolean | null;
        correct_answer: string | null;
    }[];
    quiz_title: string;
    quiz_status: "draft" | "open" | "closed" | "archived";
    reveal_answers: boolean;
    total_score: number;
    points_possible: number;
    answered: number;
    total_questions: number;
}, {
    quiz_id: number;
    items: {
        type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
        prompt: string;
        order_index: number;
        answer_mode: "individual" | "group";
        points: number;
        question_id: number;
        score: number | null;
        my_answer_display: string | null;
        correct: boolean | null;
        correct_answer: string | null;
    }[];
    quiz_title: string;
    quiz_status: "draft" | "open" | "closed" | "archived";
    reveal_answers: boolean;
    total_score: number;
    points_possible: number;
    answered: number;
    total_questions: number;
}>;
export type MyResultsItem = z.infer<typeof myResultsItemSchema>;
export type MyQuizResults = z.infer<typeof myQuizResultsSchema>;
//# sourceMappingURL=my-results.schema.d.ts.map