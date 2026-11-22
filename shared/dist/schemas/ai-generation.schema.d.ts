import { z } from 'zod';
export declare const generateQuestionsRequestSchema: z.ZodObject<{
    material_text: z.ZodString;
    prompt: z.ZodOptional<z.ZodString>;
    count: z.ZodDefault<z.ZodNumber>;
    bloom_levels: z.ZodOptional<z.ZodArray<z.ZodEnum<["remember", "understand", "apply"]>, "many">>;
    model: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    material_text: string;
    count: number;
    prompt?: string | undefined;
    bloom_levels?: ("remember" | "understand" | "apply")[] | undefined;
    model?: string | undefined;
}, {
    material_text: string;
    prompt?: string | undefined;
    count?: number | undefined;
    bloom_levels?: ("remember" | "understand" | "apply")[] | undefined;
    model?: string | undefined;
}>;
export declare const candidateQuestionSchema: z.ZodEffects<z.ZodObject<{
    type: z.ZodEnum<["mcq_single", "mcq_multi", "short_answer", "fill_blanks", "matching", "grouping", "word_cloud", "brainstorming"]>;
    prompt: z.ZodString;
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
    points: z.ZodNumber;
    bloom_level: z.ZodEnum<["remember", "understand", "apply"]>;
}, "strip", z.ZodTypeAny, {
    type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
    prompt: string;
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
    answer_mode: "individual" | "group";
    points: number;
    bloom_level: "remember" | "understand" | "apply";
}, {
    type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
    prompt: string;
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
    points: number;
    bloom_level: "remember" | "understand" | "apply";
    answer_mode?: "individual" | "group" | undefined;
}>, {
    type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
    prompt: string;
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
    answer_mode: "individual" | "group";
    points: number;
    bloom_level: "remember" | "understand" | "apply";
}, {
    type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
    prompt: string;
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
    points: number;
    bloom_level: "remember" | "understand" | "apply";
    answer_mode?: "individual" | "group" | undefined;
}>;
export declare const generateQuestionsResponseSchema: z.ZodObject<{
    questions: z.ZodArray<z.ZodEffects<z.ZodObject<{
        type: z.ZodEnum<["mcq_single", "mcq_multi", "short_answer", "fill_blanks", "matching", "grouping", "word_cloud", "brainstorming"]>;
        prompt: z.ZodString;
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
        points: z.ZodNumber;
        bloom_level: z.ZodEnum<["remember", "understand", "apply"]>;
    }, "strip", z.ZodTypeAny, {
        type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
        prompt: string;
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
        answer_mode: "individual" | "group";
        points: number;
        bloom_level: "remember" | "understand" | "apply";
    }, {
        type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
        prompt: string;
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
        points: number;
        bloom_level: "remember" | "understand" | "apply";
        answer_mode?: "individual" | "group" | undefined;
    }>, {
        type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
        prompt: string;
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
        answer_mode: "individual" | "group";
        points: number;
        bloom_level: "remember" | "understand" | "apply";
    }, {
        type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
        prompt: string;
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
        points: number;
        bloom_level: "remember" | "understand" | "apply";
        answer_mode?: "individual" | "group" | undefined;
    }>, "many">;
    warning: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    questions: {
        type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
        prompt: string;
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
        answer_mode: "individual" | "group";
        points: number;
        bloom_level: "remember" | "understand" | "apply";
    }[];
    warning?: string | undefined;
}, {
    questions: {
        type: "mcq_single" | "mcq_multi" | "short_answer" | "fill_blanks" | "matching" | "grouping" | "word_cloud" | "brainstorming";
        prompt: string;
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
        points: number;
        bloom_level: "remember" | "understand" | "apply";
        answer_mode?: "individual" | "group" | undefined;
    }[];
    warning?: string | undefined;
}>;
export declare const extractedMaterialSchema: z.ZodObject<{
    text: z.ZodString;
    truncated: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    text: string;
    truncated: boolean;
}, {
    text: string;
    truncated: boolean;
}>;
export type GenerateQuestionsRequest = z.infer<typeof generateQuestionsRequestSchema>;
export type CandidateQuestion = z.infer<typeof candidateQuestionSchema>;
export type GenerateQuestionsResponse = z.infer<typeof generateQuestionsResponseSchema>;
export type ExtractedMaterial = z.infer<typeof extractedMaterialSchema>;
//# sourceMappingURL=ai-generation.schema.d.ts.map