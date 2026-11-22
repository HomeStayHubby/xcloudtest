import { z } from 'zod';
// Query schema for material extraction: the filename only selects the parser.
// Any name with an optional extension is accepted — binary-vs-text is decided
// by content sniffing in the service, not by an extension whitelist.
export const extractMaterialQuerySchema = z.object({
    filename: z
        .string()
        .min(1)
        .max(255)
        .regex(/^[\w.()\- ]{1,250}(\.[a-z0-9]{1,10})?$/i, 'Invalid file name'),
});
export const modelsResponseSchema = z.object({
    models: z.array(z.string()),
});
//# sourceMappingURL=ai-generation.schema.js.map