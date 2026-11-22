import { z } from 'zod';
export declare const scoreboardEntrySchema: z.ZodObject<{
    name: z.ZodString;
    total_score: z.ZodNumber;
    responses: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    total_score: number;
    responses: number;
}, {
    name: string;
    total_score: number;
    responses: number;
}>;
export declare const quizScoreboardSchema: z.ZodObject<{
    quiz_id: z.ZodNumber;
    individuals: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        total_score: z.ZodNumber;
        responses: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        total_score: number;
        responses: number;
    }, {
        name: string;
        total_score: number;
        responses: number;
    }>, "many">;
    groups: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        total_score: z.ZodNumber;
        responses: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        total_score: number;
        responses: number;
    }, {
        name: string;
        total_score: number;
        responses: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    quiz_id: number;
    groups: {
        name: string;
        total_score: number;
        responses: number;
    }[];
    individuals: {
        name: string;
        total_score: number;
        responses: number;
    }[];
}, {
    quiz_id: number;
    groups: {
        name: string;
        total_score: number;
        responses: number;
    }[];
    individuals: {
        name: string;
        total_score: number;
        responses: number;
    }[];
}>;
export type ScoreboardEntry = z.infer<typeof scoreboardEntrySchema>;
export type QuizScoreboard = z.infer<typeof quizScoreboardSchema>;
//# sourceMappingURL=scoreboard.schema.d.ts.map