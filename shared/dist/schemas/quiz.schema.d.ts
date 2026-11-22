import { z } from 'zod';
export declare const quizStatusSchema: z.ZodEnum<["draft", "open", "closed", "archived"]>;
export declare const quizSettingsSchema: z.ZodObject<{
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
}>;
export declare const quizSchema: z.ZodObject<{
    id: z.ZodNumber;
    created_by: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["draft", "open", "closed", "archived"]>;
    settings: z.ZodDefault<z.ZodObject<{
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
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: string | Date;
    status: "draft" | "open" | "closed" | "archived";
    updated_at: string | Date;
    created_by: number;
    title: string;
    settings: {
        randomize_questions: boolean;
        show_answers: boolean;
        reveal_answers_in_summary: boolean;
        default_answer_mode: "individual" | "group";
        paced: boolean;
        sprint: boolean;
        sprint_bonus_pct: number;
        time_limit_seconds?: number | undefined;
    };
    description?: string | undefined;
}, {
    id: number;
    created_at: string | Date;
    status: "draft" | "open" | "closed" | "archived";
    updated_at: string | Date;
    created_by: number;
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
export declare const quizReleaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    quiz_id: z.ZodNumber;
    class_id: z.ZodNumber;
    class_name: z.ZodOptional<z.ZodString>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    class_id: number;
    created_at: string | Date;
    quiz_id: number;
    class_name?: string | undefined;
}, {
    id: number;
    class_id: number;
    created_at: string | Date;
    quiz_id: number;
    class_name?: string | undefined;
}>;
export declare const releaseQuizSchema: z.ZodObject<{
    class_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    class_id: number;
}, {
    class_id: number;
}>;
export declare const quizDetailSchema: z.ZodObject<{
    id: z.ZodNumber;
    created_by: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["draft", "open", "closed", "archived"]>;
    settings: z.ZodDefault<z.ZodObject<{
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
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
} & {
    created_by_name: z.ZodOptional<z.ZodString>;
    releases: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        quiz_id: z.ZodNumber;
        class_id: z.ZodNumber;
        class_name: z.ZodOptional<z.ZodString>;
        created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        class_id: number;
        created_at: string | Date;
        quiz_id: number;
        class_name?: string | undefined;
    }, {
        id: number;
        class_id: number;
        created_at: string | Date;
        quiz_id: number;
        class_name?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: string | Date;
    status: "draft" | "open" | "closed" | "archived";
    updated_at: string | Date;
    created_by: number;
    title: string;
    settings: {
        randomize_questions: boolean;
        show_answers: boolean;
        reveal_answers_in_summary: boolean;
        default_answer_mode: "individual" | "group";
        paced: boolean;
        sprint: boolean;
        sprint_bonus_pct: number;
        time_limit_seconds?: number | undefined;
    };
    releases: {
        id: number;
        class_id: number;
        created_at: string | Date;
        quiz_id: number;
        class_name?: string | undefined;
    }[];
    description?: string | undefined;
    created_by_name?: string | undefined;
}, {
    id: number;
    created_at: string | Date;
    status: "draft" | "open" | "closed" | "archived";
    updated_at: string | Date;
    created_by: number;
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
    created_by_name?: string | undefined;
    releases?: {
        id: number;
        class_id: number;
        created_at: string | Date;
        quiz_id: number;
        class_name?: string | undefined;
    }[] | undefined;
}>;
export declare const quizWithCampaignSchema: z.ZodObject<{
    id: z.ZodNumber;
    created_by: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["draft", "open", "closed", "archived"]>;
    settings: z.ZodDefault<z.ZodObject<{
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
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
} & {
    campaign_id: z.ZodNullable<z.ZodNumber>;
    campaign_title: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: string | Date;
    status: "draft" | "open" | "closed" | "archived";
    updated_at: string | Date;
    created_by: number;
    title: string;
    settings: {
        randomize_questions: boolean;
        show_answers: boolean;
        reveal_answers_in_summary: boolean;
        default_answer_mode: "individual" | "group";
        paced: boolean;
        sprint: boolean;
        sprint_bonus_pct: number;
        time_limit_seconds?: number | undefined;
    };
    campaign_id: number | null;
    campaign_title: string | null;
    description?: string | undefined;
}, {
    id: number;
    created_at: string | Date;
    status: "draft" | "open" | "closed" | "archived";
    updated_at: string | Date;
    created_by: number;
    title: string;
    campaign_id: number | null;
    campaign_title: string | null;
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
export type Quiz = z.infer<typeof quizSchema>;
export type CreateQuiz = z.infer<typeof createQuizSchema>;
export type UpdateQuiz = z.infer<typeof updateQuizSchema>;
export type QuizStatus = z.infer<typeof quizStatusSchema>;
export type QuizSettings = z.infer<typeof quizSettingsSchema>;
export type QuizRelease = z.infer<typeof quizReleaseSchema>;
export type ReleaseQuiz = z.infer<typeof releaseQuizSchema>;
export type QuizDetail = z.infer<typeof quizDetailSchema>;
export type QuizWithCampaign = z.infer<typeof quizWithCampaignSchema>;
//# sourceMappingURL=quiz.schema.d.ts.map