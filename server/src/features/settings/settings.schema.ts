import { z } from 'zod';
import { updateAiSettingsSchema } from '@elitequest/shared';

export type UpdateAiSettingsInput = z.input<typeof updateAiSettingsSchema>;
