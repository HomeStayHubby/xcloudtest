import { z } from 'zod';

// Admin-visible AI settings. The API key itself never leaves the server —
// only a masked tail and whether a (readable) key exists.
export const aiSettingsSchema = z.object({
  has_key: z.boolean(),
  masked_key: z.string().nullable(),
  model: z.string().nullable(),
  // True when a key is stored but cannot be decrypted (e.g. SESSION_SECRET
  // rotated). The admin must re-enter the key.
  key_error: z.boolean(),
});

export const updateAiSettingsSchema = z
  .object({
    api_key: z.string().min(10).max(500).optional(),
    model: z.string().min(1).max(200).nullable().optional(),
  })
  .refine((input) => input.api_key !== undefined || input.model !== undefined, {
    message: 'Nothing to update',
  });

export type AiSettings = z.infer<typeof aiSettingsSchema>;
export type UpdateAiSettings = z.infer<typeof updateAiSettingsSchema>;
