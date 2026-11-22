import { z } from 'zod';
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const createResponseSchema: z.ZodObject<{
    answer: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodRecord<z.ZodString, z.ZodString>]>;
}, "strip", z.ZodTypeAny, {
    answer: string | string[] | Record<string, string>;
}, {
    answer: string | string[] | Record<string, string>;
}>;
export declare const manualScoreSchema: z.ZodObject<{
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    score: number;
}, {
    score: number;
}>;
//# sourceMappingURL=response.validators.d.ts.map