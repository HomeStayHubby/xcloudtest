import { api } from './client.js';
import type { AiSettings, UpdateAiSettings } from '@elitequest/shared';
export type { AiSettings, UpdateAiSettings } from '@elitequest/shared';

export function getAiSettings(): Promise<AiSettings> {
  return api.get<AiSettings>('/settings/ai');
}

export function updateAiSettings(input: UpdateAiSettings): Promise<AiSettings> {
  return api.put<AiSettings>('/settings/ai', input);
}
