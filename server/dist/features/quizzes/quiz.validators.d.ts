import { z } from 'zod';
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const releaseParamsSchema: z.ZodObject<{
    id: z.ZodNumber;
    classId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
    classId: number;
}, {
    id: number;
    classId: number;
}>;
export declare const createQuizSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodObject<{
        randomize_questions: z.ZodDefault<z.ZodBoolean>;
        show_answers: z.ZodDefault<z.ZodBoolean>;
        reveal_answers_in_summary: z.ZodDefault<z.ZodBoolean>;
        time_limit_seconds: z.ZodOptional<z.ZodNumber>;
        default_answer_mode: z.ZodDefault<z.ZodEnum<["individual", "group"]>>;
        paced: z.ZodDefault<z.ZodBoolean>;
        sprint: z.ZodDefault<z.ZodBoolean>;
        sprint_bonus_pct: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        randomize_questions: boolean;
        show_answers: boolean;
        reveal_answers_in_summary: boolean;
        default_answer_mode: "individual" | "group";
        paced: boolean;
        sprint: boolean;
        sprint_bonus_pct: number;
        time_limit_seconds?: number | undefined;
    }, {
        randomize_questions?: boolean | undefined;
        show_answers?: boolean | undefined;
        reveal_answers_in_summary?: boolean | undefined;
        time_limit_seconds?: number | undefined;
        default_answer_mode?: "individual" | "group" | undefined;
        paced?: boolean | undefined;
        sprint?: boolean | undefined;
        sprint_bonus_pct?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description?: string | undefined;
    settings?: {
        randomize_questions: boolean;
        show_answers: boolean;
        reveal_answers_in_summary: boolean;
        default_answer_mode: "individual" | "group";
        paced: boolean;
        sprint: boolean;
        sprint_bonus_pct: number;
        time_limit_seconds?: number | undefined;
    } | undefined;
}, {
    title: string;
    description?: string | undefined;
    settings?: {
        randomize_questions?: boolean | undefined;
        show_answers?: boolean | undefined;
        reveal_answers_in_summary?: boolean | undefined;
        time_limit_seconds?: number | undefined;
        default_answer_mode?: "individual" | "group" | undefined;
        paced?: boolean | undefined;
        sprint?: boolean | undefined;
        sprint_bonus_pct?: number | undefined;
    } | undefined;
}>;
export declare const updateQuizSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    settings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        randomize_questions: z.ZodDefault<z.ZodBoolean>;
        show_answers: z.ZodDefault<z.ZodBoolean>;
        reveal_answers_in_summary: z.ZodDefault<z.ZodBoolean>;
        time_limit_seconds: z.ZodOptional<z.ZodNumber>;
        default_answer_mode: z.ZodDefault<z.ZodEnum<["individual", "group"]>>;
        paced: z.ZodDefault<z.ZodBoolean>;
        sprint: z.ZodDefault<z.ZodBoolean>;
        sprint_bonus_pct: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        randomize_questions: boolean;
        show_answers: boolean;
        reveal_answers_in_summary: boolean;
        default_answer_mode: "individual" | "group";
        paced: boolean;
        sprint: boolean;
        sprint_bonus_pct: number;
        time_limit_seconds?: number | undefined;
    }, {
        randomize_questions?: boolean | undefined;
        show_answers?: boolean | undefined;
        reveal_answers_in_summary?: boolean | undefined;
        time_limit_seconds?: number | undefined;
        default_answer_mode?: "individual" | "group" | undefined;
        paced?: boolean | undefined;
        sprint?: boolean | undefined;
        sprint_bonus_pct?: number | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    title?: string | undefined;
    settings?: {
        randomize_questions: boolean;
        show_answers: boolean;
        reveal_answers_in_summary: boolean;
        default_answer_mode: "individual" | "group";
        paced: boolean;
        sprint: boolean;
        sprint_bonus_pct: number;
        time_limit_seconds?: number | undefined;
    } | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    settings?: {
        randomize_questions?: boolean | undefined;
        show_answers?: boolean | undefined;
        reveal_answers_in_summary?: boolean | undefined;
        time_limit_seconds?: number | undefined;
        default_answer_mode?: "individual" | "group" | undefined;
        paced?: boolean | undefined;
        sprint?: boolean | undefined;
        sprint_bonus_pct?: number | undefined;
    } | undefined;
}>;
//# sourceMappingURL=quiz.validators.d.ts.map