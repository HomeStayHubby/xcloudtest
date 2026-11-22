import { z } from 'zod';
export declare const campaignSchema: z.ZodObject<{
    id: z.ZodNumber;
    class_id: z.ZodNumber;
    created_by: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    class_id: number;
    created_at: string | Date;
    updated_at: string | Date;
    created_by: number;
    title: string;
    description?: string | undefined;
}, {
    id: number;
    class_id: number;
    created_at: string | Date;
    updated_at: string | Date;
    created_by: number;
    title: string;
    description?: string | undefined;
}>;
export declare const createCampaignSchema: z.ZodObject<{
    class_id: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    class_id: number;
    title: string;
    description?: string | undefined;
}, {
    class_id: number;
    title: string;
    description?: string | undefined;
}>;
export declare const updateCampaignSchema: z.ZodObject<{
    class_id: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    class_id?: number | undefined;
    description?: string | undefined;
    title?: string | undefined;
}, {
    class_id?: number | undefined;
    description?: string | undefined;
    title?: string | undefined;
}>;
export declare const campaignPlaylistItemSchema: z.ZodObject<{
    quiz_id: z.ZodNumber;
    position: z.ZodNumber;
    quiz: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    quiz_id: number;
    position: number;
    quiz: {
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
    };
}, {
    quiz_id: number;
    position: number;
    quiz: {
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
    };
}>;
export declare const campaignDetailSchema: z.ZodObject<{
    id: z.ZodNumber;
    class_id: z.ZodNumber;
    created_by: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
} & {
    items: z.ZodArray<z.ZodObject<{
        quiz_id: z.ZodNumber;
        position: z.ZodNumber;
        quiz: z.ZodObject<{
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
    }, "strip", z.ZodTypeAny, {
        quiz_id: number;
        position: number;
        quiz: {
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
        };
    }, {
        quiz_id: number;
        position: number;
        quiz: {
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
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: number;
    class_id: number;
    created_at: string | Date;
    updated_at: string | Date;
    created_by: number;
    title: string;
    items: {
        quiz_id: number;
        position: number;
        quiz: {
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
        };
    }[];
    description?: string | undefined;
}, {
    id: number;
    class_id: number;
    created_at: string | Date;
    updated_at: string | Date;
    created_by: number;
    title: string;
    items: {
        quiz_id: number;
        position: number;
        quiz: {
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
        };
    }[];
    description?: string | undefined;
}>;
export declare const reorderPlaylistSchema: z.ZodObject<{
    quiz_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    quiz_ids: number[];
}, {
    quiz_ids: number[];
}>;
export declare const campaignPerQuizResultSchema: z.ZodObject<{
    quiz_id: z.ZodNumber;
    quiz_title: z.ZodString;
    responses: z.ZodNumber;
    total_score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    quiz_id: number;
    quiz_title: string;
    total_score: number;
    responses: number;
}, {
    quiz_id: number;
    quiz_title: string;
    total_score: number;
    responses: number;
}>;
export declare const campaignResultsSchema: z.ZodObject<{
    campaign_id: z.ZodNumber;
    class_id: z.ZodNumber;
    individuals: z.ZodArray<z.ZodObject<{
        student_id: z.ZodNumber;
        display_name: z.ZodString;
        total_score: z.ZodNumber;
        responses: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        display_name: string;
        student_id: number;
        total_score: number;
        responses: number;
    }, {
        display_name: string;
        student_id: number;
        total_score: number;
        responses: number;
    }>, "many">;
    groups: z.ZodArray<z.ZodObject<{
        group_id: z.ZodNumber;
        group_name: z.ZodString;
        total_score: z.ZodNumber;
        responses: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        group_id: number;
        total_score: number;
        responses: number;
        group_name: string;
    }, {
        group_id: number;
        total_score: number;
        responses: number;
        group_name: string;
    }>, "many">;
    per_quiz: z.ZodArray<z.ZodObject<{
        quiz_id: z.ZodNumber;
        quiz_title: z.ZodString;
        responses: z.ZodNumber;
        total_score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quiz_id: number;
        quiz_title: string;
        total_score: number;
        responses: number;
    }, {
        quiz_id: number;
        quiz_title: string;
        total_score: number;
        responses: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    class_id: number;
    campaign_id: number;
    groups: {
        group_id: number;
        total_score: number;
        responses: number;
        group_name: string;
    }[];
    individuals: {
        display_name: string;
        student_id: number;
        total_score: number;
        responses: number;
    }[];
    per_quiz: {
        quiz_id: number;
        quiz_title: string;
        total_score: number;
        responses: number;
    }[];
}, {
    class_id: number;
    campaign_id: number;
    groups: {
        group_id: number;
        total_score: number;
        responses: number;
        group_name: string;
    }[];
    individuals: {
        display_name: string;
        student_id: number;
        total_score: number;
        responses: number;
    }[];
    per_quiz: {
        quiz_id: number;
        quiz_title: string;
        total_score: number;
        responses: number;
    }[];
}>;
export type Campaign = z.infer<typeof campaignSchema>;
export type CreateCampaign = z.infer<typeof createCampaignSchema>;
export type UpdateCampaign = z.infer<typeof updateCampaignSchema>;
export type CampaignPlaylistItem = z.infer<typeof campaignPlaylistItemSchema>;
export type CampaignDetail = z.infer<typeof campaignDetailSchema>;
export type ReorderPlaylist = z.infer<typeof reorderPlaylistSchema>;
export type CampaignPerQuizResult = z.infer<typeof campaignPerQuizResultSchema>;
export type CampaignResults = z.infer<typeof campaignResultsSchema>;
//# sourceMappingURL=campaign.schema.d.ts.map