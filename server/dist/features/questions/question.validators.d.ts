import { z } from 'zod';
export declare const quizIdParamSchema: z.ZodObject<{
    quizId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    quizId: number;
}, {
    quizId: number;
}>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const copyFromBankSchema: z.ZodObject<{
    bank_id: z.ZodNumber;
    question_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    bank_id: number;
    question_id: number;
}, {
    bank_id: number;
    question_id: number;
}>;
export declare const createQuestionSchema: z.ZodObject<Omit<{
    type: z.ZodEnum<["mcq_single", "mcq_multi", "short_answer", "fill_blanks", "matching", "grouping", "word_cloud", "brainstorming"]>;
    time_limit_seconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    quiz_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    prompt: z.ZodString;
    bank_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    data: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"mcq_single">;
        options: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            text: string;
        }, {
            id: string;
            text: string;
        }>, "many">;
        correct_option_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_single";
        prompt: string;
        correct_option_id: string;
    }, {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_single";
        prompt: string;
        correct_option_id: string;
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"mcq_multi">;
        options: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            text: string;
        }, {
            id: string;
            text: string;
        }>, "many">;
        correct_option_ids: z.ZodArray<z.ZodString, "many">;
        allow_partial: z.ZodDefault<z.ZodBoolean>;
        partial_points: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_multi";
        prompt: string;
        correct_option_ids: string[];
        allow_partial: boolean;
        partial_points: number;
    }, {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_multi";
        prompt: string;
        correct_option_ids: string[];
        allow_partial?: boolean | undefined;
        partial_points?: number | undefined;
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"short_answer">;
        accepted_answers: z.ZodArray<z.ZodString, "many">;
        case_sensitive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "short_answer";
        prompt: string;
        accepted_answers: string[];
        case_sensitive: boolean;
    }, {
        type: "short_answer";
        prompt: string;
        accepted_answers: string[];
        case_sensitive?: boolean | undefined;
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"fill_blanks">;
        segments: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            blank: z.ZodDefault<z.ZodBoolean>;
            answer: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            blank: boolean;
            answer?: string | undefined;
        }, {
            text: string;
            blank?: boolean | undefined;
            answer?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "fill_blanks";
        prompt: string;
        segments: {
            text: string;
            blank: boolean;
            answer?: string | undefined;
        }[];
    }, {
        type: "fill_blanks";
        prompt: string;
        segments: {
            text: string;
            blank?: boolean | undefined;
            answer?: string | undefined;
        }[];
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"matching">;
        left_items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            text: string;
        }, {
            id: string;
            text: string;
        }>, "many">;
        right_items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            text: string;
        }, {
            id: string;
            text: string;
        }>, "many">;
        correct_pairs: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "matching";
        prompt: string;
        left_items: {
            id: string;
            text: string;
        }[];
        right_items: {
            id: string;
            text: string;
        }[];
        correct_pairs: Record<string, string>;
    }, {
        type: "matching";
        prompt: string;
        left_items: {
            id: string;
            text: string;
        }[];
        right_items: {
            id: string;
            text: string;
        }[];
        correct_pairs: Record<string, string>;
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"grouping">;
        groups: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>, "many">;
        items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
            group_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            text: string;
            group_id: string;
        }, {
            id: string;
            text: string;
            group_id: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "grouping";
        prompt: string;
        groups: {
            id: string;
            name: string;
        }[];
        items: {
            id: string;
            text: string;
            group_id: string;
        }[];
    }, {
        type: "grouping";
        prompt: string;
        groups: {
            id: string;
            name: string;
        }[];
        items: {
            id: string;
            text: string;
            group_id: string;
        }[];
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"word_cloud">;
        max_words_per_student: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "word_cloud";
        prompt: string;
        max_words_per_student: number;
    }, {
        type: "word_cloud";
        prompt: string;
        max_words_per_student?: number | undefined;
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"brainstorming">;
        allow_upvotes: z.ZodDefault<z.ZodBoolean>;
        max_ideas_per_student: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "brainstorming";
        prompt: string;
        allow_upvotes: boolean;
        max_ideas_per_student?: number | undefined;
    }, {
        type: "brainstorming";
        prompt: string;
        allow_upvotes?: boolean | undefined;
        max_ideas_per_student?: number | undefined;
    }>]>;
    answer_mode: z.ZodDefault<z.ZodEnum<["individual", "group"]>>;
    points: z.ZodDefault<z.ZodNumber>;
    bloom_level: z.ZodOptional<z.ZodNullable<z.ZodEnum<["remember", "understand", "apply"]>>>;
} & {
    order_index: z.ZodOptional<z.ZodNumber>;
}, "bank_id" | "quiz_id">, "strip", z.ZodTypeAny, {
    type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
    data: {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_single";
        prompt: string;
        correct_option_id: string;
    } | {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_multi";
        prompt: string;
        correct_option_ids: string[];
        allow_partial: boolean;
        partial_points: number;
    } | {
        type: "short_answer";
        prompt: string;
        accepted_answers: string[];
        case_sensitive: boolean;
    } | {
        type: "fill_blanks";
        prompt: string;
        segments: {
            text: string;
            blank: boolean;
            answer?: string | undefined;
        }[];
    } | {
        type: "matching";
        prompt: string;
        left_items: {
            id: string;
            text: string;
        }[];
        right_items: {
            id: string;
            text: string;
        }[];
        correct_pairs: Record<string, string>;
    } | {
        type: "grouping";
        prompt: string;
        groups: {
            id: string;
            name: string;
        }[];
        items: {
            id: string;
            text: string;
            group_id: string;
        }[];
    } | {
        type: "word_cloud";
        prompt: string;
        max_words_per_student: number;
    } | {
        type: "brainstorming";
        prompt: string;
        allow_upvotes: boolean;
        max_ideas_per_student?: number | undefined;
    };
    prompt: string;
    answer_mode: "individual" | "group";
    points: number;
    time_limit_seconds?: number | null | undefined;
    bloom_level?: "remember" | "understand" | "apply" | null | undefined;
    order_index?: number | undefined;
}, {
    type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
    data: {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_single";
        prompt: string;
        correct_option_id: string;
    } | {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_multi";
        prompt: string;
        correct_option_ids: string[];
        allow_partial?: boolean | undefined;
        partial_points?: number | undefined;
    } | {
        type: "short_answer";
        prompt: string;
        accepted_answers: string[];
        case_sensitive?: boolean | undefined;
    } | {
        type: "fill_blanks";
        prompt: string;
        segments: {
            text: string;
            blank?: boolean | undefined;
            answer?: string | undefined;
        }[];
    } | {
        type: "matching";
        prompt: string;
        left_items: {
            id: string;
            text: string;
        }[];
        right_items: {
            id: string;
            text: string;
        }[];
        correct_pairs: Record<string, string>;
    } | {
        type: "grouping";
        prompt: string;
        groups: {
            id: string;
            name: string;
        }[];
        items: {
            id: string;
            text: string;
            group_id: string;
        }[];
    } | {
        type: "word_cloud";
        prompt: string;
        max_words_per_student?: number | undefined;
    } | {
        type: "brainstorming";
        prompt: string;
        allow_upvotes?: boolean | undefined;
        max_ideas_per_student?: number | undefined;
    };
    prompt: string;
    time_limit_seconds?: number | null | undefined;
    answer_mode?: "individual" | "group" | undefined;
    points?: number | undefined;
    bloom_level?: "remember" | "understand" | "apply" | null | undefined;
    order_index?: number | undefined;
}>;
export declare const updateQuestionSchema: z.ZodObject<Omit<{
    type: z.ZodOptional<z.ZodEnum<["mcq_single", "mcq_multi", "short_answer", "fill_blanks", "matching", "grouping", "word_cloud", "brainstorming"]>>;
    time_limit_seconds: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    quiz_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    prompt: z.ZodOptional<z.ZodString>;
    bank_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    data: z.ZodOptional<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"mcq_single">;
        options: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            text: string;
        }, {
            id: string;
            text: string;
        }>, "many">;
        correct_option_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_single";
        prompt: string;
        correct_option_id: string;
    }, {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_single";
        prompt: string;
        correct_option_id: string;
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"mcq_multi">;
        options: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            text: string;
        }, {
            id: string;
            text: string;
        }>, "many">;
        correct_option_ids: z.ZodArray<z.ZodString, "many">;
        allow_partial: z.ZodDefault<z.ZodBoolean>;
        partial_points: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_multi";
        prompt: string;
        correct_option_ids: string[];
        allow_partial: boolean;
        partial_points: number;
    }, {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_multi";
        prompt: string;
        correct_option_ids: string[];
        allow_partial?: boolean | undefined;
        partial_points?: number | undefined;
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"short_answer">;
        accepted_answers: z.ZodArray<z.ZodString, "many">;
        case_sensitive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "short_answer";
        prompt: string;
        accepted_answers: string[];
        case_sensitive: boolean;
    }, {
        type: "short_answer";
        prompt: string;
        accepted_answers: string[];
        case_sensitive?: boolean | undefined;
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"fill_blanks">;
        segments: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            blank: z.ZodDefault<z.ZodBoolean>;
            answer: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            blank: boolean;
            answer?: string | undefined;
        }, {
            text: string;
            blank?: boolean | undefined;
            answer?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "fill_blanks";
        prompt: string;
        segments: {
            text: string;
            blank: boolean;
            answer?: string | undefined;
        }[];
    }, {
        type: "fill_blanks";
        prompt: string;
        segments: {
            text: string;
            blank?: boolean | undefined;
            answer?: string | undefined;
        }[];
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"matching">;
        left_items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            text: string;
        }, {
            id: string;
            text: string;
        }>, "many">;
        right_items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            text: string;
        }, {
            id: string;
            text: string;
        }>, "many">;
        correct_pairs: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "matching";
        prompt: string;
        left_items: {
            id: string;
            text: string;
        }[];
        right_items: {
            id: string;
            text: string;
        }[];
        correct_pairs: Record<string, string>;
    }, {
        type: "matching";
        prompt: string;
        left_items: {
            id: string;
            text: string;
        }[];
        right_items: {
            id: string;
            text: string;
        }[];
        correct_pairs: Record<string, string>;
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"grouping">;
        groups: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>, "many">;
        items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
            group_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            text: string;
            group_id: string;
        }, {
            id: string;
            text: string;
            group_id: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "grouping";
        prompt: string;
        groups: {
            id: string;
            name: string;
        }[];
        items: {
            id: string;
            text: string;
            group_id: string;
        }[];
    }, {
        type: "grouping";
        prompt: string;
        groups: {
            id: string;
            name: string;
        }[];
        items: {
            id: string;
            text: string;
            group_id: string;
        }[];
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"word_cloud">;
        max_words_per_student: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "word_cloud";
        prompt: string;
        max_words_per_student: number;
    }, {
        type: "word_cloud";
        prompt: string;
        max_words_per_student?: number | undefined;
    }>, z.ZodObject<{
        prompt: z.ZodString;
    } & {
        type: z.ZodLiteral<"brainstorming">;
        allow_upvotes: z.ZodDefault<z.ZodBoolean>;
        max_ideas_per_student: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "brainstorming";
        prompt: string;
        allow_upvotes: boolean;
        max_ideas_per_student?: number | undefined;
    }, {
        type: "brainstorming";
        prompt: string;
        allow_upvotes?: boolean | undefined;
        max_ideas_per_student?: number | undefined;
    }>]>>;
    answer_mode: z.ZodOptional<z.ZodDefault<z.ZodEnum<["individual", "group"]>>>;
    points: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    bloom_level: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodEnum<["remember", "understand", "apply"]>>>>;
    order_index: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, "bank_id" | "quiz_id">, "strip", z.ZodTypeAny, {
    type?: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming" | undefined;
    data?: {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_single";
        prompt: string;
        correct_option_id: string;
    } | {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_multi";
        prompt: string;
        correct_option_ids: string[];
        allow_partial: boolean;
        partial_points: number;
    } | {
        type: "short_answer";
        prompt: string;
        accepted_answers: string[];
        case_sensitive: boolean;
    } | {
        type: "fill_blanks";
        prompt: string;
        segments: {
            text: string;
            blank: boolean;
            answer?: string | undefined;
        }[];
    } | {
        type: "matching";
        prompt: string;
        left_items: {
            id: string;
            text: string;
        }[];
        right_items: {
            id: string;
            text: string;
        }[];
        correct_pairs: Record<string, string>;
    } | {
        type: "grouping";
        prompt: string;
        groups: {
            id: string;
            name: string;
        }[];
        items: {
            id: string;
            text: string;
            group_id: string;
        }[];
    } | {
        type: "word_cloud";
        prompt: string;
        max_words_per_student: number;
    } | {
        type: "brainstorming";
        prompt: string;
        allow_upvotes: boolean;
        max_ideas_per_student?: number | undefined;
    } | undefined;
    time_limit_seconds?: number | null | undefined;
    prompt?: string | undefined;
    answer_mode?: "individual" | "group" | undefined;
    points?: number | undefined;
    bloom_level?: "remember" | "understand" | "apply" | null | undefined;
    order_index?: number | undefined;
}, {
    type?: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming" | undefined;
    data?: {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_single";
        prompt: string;
        correct_option_id: string;
    } | {
        options: {
            id: string;
            text: string;
        }[];
        type: "mcq_multi";
        prompt: string;
        correct_option_ids: string[];
        allow_partial?: boolean | undefined;
        partial_points?: number | undefined;
    } | {
        type: "short_answer";
        prompt: string;
        accepted_answers: string[];
        case_sensitive?: boolean | undefined;
    } | {
        type: "fill_blanks";
        prompt: string;
        segments: {
            text: string;
            blank?: boolean | undefined;
            answer?: string | undefined;
        }[];
    } | {
        type: "matching";
        prompt: string;
        left_items: {
            id: string;
            text: string;
        }[];
        right_items: {
            id: string;
            text: string;
        }[];
        correct_pairs: Record<string, string>;
    } | {
        type: "grouping";
        prompt: string;
        groups: {
            id: string;
            name: string;
        }[];
        items: {
            id: string;
            text: string;
            group_id: string;
        }[];
    } | {
        type: "word_cloud";
        prompt: string;
        max_words_per_student?: number | undefined;
    } | {
        type: "brainstorming";
        prompt: string;
        allow_upvotes?: boolean | undefined;
        max_ideas_per_student?: number | undefined;
    } | undefined;
    time_limit_seconds?: number | null | undefined;
    prompt?: string | undefined;
    answer_mode?: "individual" | "group" | undefined;
    points?: number | undefined;
    bloom_level?: "remember" | "understand" | "apply" | null | undefined;
    order_index?: number | undefined;
}>;
//# sourceMappingURL=question.validators.d.ts.map