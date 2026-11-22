import type { AiSettings } from '@elitequest/shared';
import type { UpdateAiSettingsInput } from './settings.schema.js';
export declare function getAiSettings(): Promise<AiSettings>;
export declare function resolveGroqCredentials(): Promise<{
    apiKey: string | null;
    model: string | null;
    keyError: boolean;
}>;
export declare function updateAiSettings(input: UpdateAiSettingsInput): Promise<AiSettings>;
//# sourceMappingURL=settings.service.d.ts.map