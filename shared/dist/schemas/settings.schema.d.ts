import { z } from 'zod';
export declare const aiSettingsSchema: z.ZodObject<{
    has_key: z.ZodBoolean;
    masked_key: z.ZodNullable<z.ZodString>;
    model: z.ZodNullable<z.ZodString>;
    key_error: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    model: string | null;
    has_key: boolean;
    masked_key: string | null;
    key_error: boolean;
}, {
    model: string | null;
    has_key: boolean;
    masked_key: string | null;
    key_error: boolean;
}>;
export declare const updateAiSettingsSchema: z.ZodEffects<z.ZodObject<{
    api_key: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    model?: string | null | undefined;
    api_key?: string | undefined;
}, {
    model?: string | null | undefined;
    api_key?: string | undefined;
}>, {
    model?: string | null | undefined;
    api_key?: string | undefined;
}, {
    model?: string | null | undefined;
    api_key?: string | undefined;
}>;
export type AiSettings = z.infer<typeof aiSettingsSchema>;
export type UpdateAiSettings = z.infer<typeof updateAiSettingsSchema>;
//# sourceMappingURL=settings.schema.d.ts.map