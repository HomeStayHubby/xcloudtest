import { z } from 'zod';
export declare const individualLeaderboardEntrySchema: z.ZodObject<{
    student_id: z.ZodNumber;
    display_name: z.ZodString;
    total_score: z.ZodNumber;
    responses: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    student_id: number;
    display_name: string;
    total_score: number;
    responses: number;
}, {
    student_id: number;
    display_name: string;
    total_score: number;
    responses: number;
}>;
export declare const groupLeaderboardEntrySchema: z.ZodObject<{
    group_id: z.ZodNumber;
    group_name: z.ZodString;
    total_score: z.ZodNumber;
    responses: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total_score: number;
    responses: number;
    group_id: number;
    group_name: string;
}, {
    total_score: number;
    responses: number;
    group_id: number;
    group_name: string;
}>;
export declare const classLeaderboardSchema: z.ZodObject<{
    class_id: z.ZodNumber;
    individuals: z.ZodArray<z.ZodObject<{
        student_id: z.ZodNumber;
        display_name: z.ZodString;
        total_score: z.ZodNumber;
        responses: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        student_id: number;
        display_name: string;
        total_score: number;
        responses: number;
    }, {
        student_id: number;
        display_name: string;
        total_score: number;
        responses: number;
    }>, "many">;
    groups: z.ZodArray<z.ZodObject<{
        group_id: z.ZodNumber;
        group_name: z.ZodString;
        total_score: z.ZodNumber;
        responses: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total_score: number;
        responses: number;
        group_id: number;
        group_name: string;
    }, {
        total_score: number;
        responses: number;
        group_id: number;
        group_name: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    class_id: number;
    individuals: {
        student_id: number;
        display_name: string;
        total_score: number;
        responses: number;
    }[];
    groups: {
        total_score: number;
        responses: number;
        group_id: number;
        group_name: string;
    }[];
}, {
    class_id: number;
    individuals: {
        student_id: number;
        display_name: string;
        total_score: number;
        responses: number;
    }[];
    groups: {
        total_score: number;
        responses: number;
        group_id: number;
        group_name: string;
    }[];
}>;
export type IndividualLeaderboardEntry = z.infer<typeof individualLeaderboardEntrySchema>;
export type GroupLeaderboardEntry = z.infer<typeof groupLeaderboardEntrySchema>;
export type ClassLeaderboard = z.infer<typeof classLeaderboardSchema>;
//# sourceMappingURL=leaderboard.schema.d.ts.map