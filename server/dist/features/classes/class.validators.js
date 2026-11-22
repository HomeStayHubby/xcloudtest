import { z } from 'zod';
import { createClassSchema as sharedCreateClassSchema, updateClassSchema as sharedUpdateClassSchema } from '@elitequest/shared';
export const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});
export const createClassSchema = sharedCreateClassSchema;
export const updateClassSchema = sharedUpdateClassSchema;
//# sourceMappingURL=class.validators.js.map