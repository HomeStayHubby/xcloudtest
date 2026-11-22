import { z } from 'zod';

export const classIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
