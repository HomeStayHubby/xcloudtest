import { database } from '../../db/database.js';
import { getAsync, runAsync } from '../../db/promises.js';
import { env } from '../../shared/env.js';
import { decryptSecret, encryptSecret, maskSecret } from '../../shared/secret-box.js';
import type { AiSettings } from '@elitequest/shared';
import type { UpdateAiSettingsInput } from './settings.schema.js';

// Settings keys in app_settings. The API key is stored encrypted.
const AI_KEY_SETTING = 'ai.groq.api_key_enc';
const AI_MODEL_SETTING = 'ai.groq.model';

async function getSetting(key: string): Promise<string | null> {
  const row = await getAsync<{ value: string }>(
    database,
    'SELECT value FROM app_settings WHERE key = ?',
    key
  );
  return row?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  await runAsync(
    database,
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
    key,
    value
  );
}

export async function getAiSettings(): Promise<AiSettings> {
  const encrypted = await getSetting(AI_KEY_SETTING);
  let hasKey = false;
  let maskedKey: string | null = null;
  let keyError = false;

  if (encrypted !== null) {
    const plaintext = decryptSecret(encrypted);
    if (plaintext === null) {
      // Stored key is unreadable (e.g. SESSION_SECRET rotated): admin must re-enter.
      keyError = true;
    } else {
      hasKey = true;
      maskedKey = maskSecret(plaintext);
    }
  }

  const model = (await getSetting(AI_MODEL_SETTING)) ?? env.GROQ_MODEL ?? null;
  return { has_key: hasKey, masked_key: maskedKey, model, key_error: keyError };
}

// Resolved credentials for the AI features: DB settings first, env vars as a
// bootstrap fallback so the feature works before the admin enters a key.
export async function resolveGroqCredentials(): Promise<{
  apiKey: string | null;
  model: string | null;
  keyError: boolean;
}> {
  const settings = await getAiSettings();
  const apiKey = settings.has_key
    ? decryptSecret((await getSetting(AI_KEY_SETTING)) as string)
    : env.GROQ_API_KEY ?? null;
  return { apiKey, model: settings.model, keyError: settings.key_error };
}

export async function updateAiSettings(input: UpdateAiSettingsInput): Promise<AiSettings> {
  if (input.api_key !== undefined) {
    await setSetting(AI_KEY_SETTING, encryptSecret(input.api_key));
  }
  if (input.model !== undefined) {
    if (input.model === null) {
      await runAsync(database, 'DELETE FROM app_settings WHERE key = ?', AI_MODEL_SETTING);
    } else {
      await setSetting(AI_MODEL_SETTING, input.model);
    }
  }
  return getAiSettings();
}
