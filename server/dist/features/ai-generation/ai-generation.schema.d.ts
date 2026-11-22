import { z } from 'zod';
export declare const extractMaterialQuerySchema: z.ZodObject<{
    filename: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filename: string;
}, {
    filename: string;
}>;
export declare const modelsResponseSchema: z.ZodObject<{
    models: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    models: string[];
}, {
    models: string[];
}>;
export type ExtractMaterialQuery = z.infer<typeof extractMaterialQuerySchema>;
//# sourceMappingURL=ai-generation.schema.d.ts.map