import { z } from 'zod';
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const campaignQuizParamsSchema: z.ZodObject<{
    id: z.ZodNumber;
    quizId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
    quizId: number;
}, {
    id: number;
    quizId: number;
}>;
export declare const listCampaignsQuerySchema: z.ZodObject<{
    class_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    class_id: number;
}, {
    class_id: number;
}>;
export declare const addQuizSchema: z.ZodObject<{
    quiz_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    quiz_id: number;
}, {
    quiz_id: number;
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
export declare const reorderPlaylistSchema: z.ZodObject<{
    quiz_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    quiz_ids: number[];
}, {
    quiz_ids: number[];
}>;
//# sourceMappingURL=campaign.validators.d.ts.map