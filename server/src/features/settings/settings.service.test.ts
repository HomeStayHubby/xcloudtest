import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAiSettings,
  updateAiSettings,
  resolveGroqCredentials,
} from './settings.service.js';
import { setup } from '../../testing/helpers.js';
import { env } from '../../shared/env.js';
import { database } from '../../db/database.js';
import { runAsync } from '../../db/promises.js';

describe('settings service (AI settings)', () => {
  beforeEach(async () => {
    await setup();
    // Isolate tests from real environment fallbacks.
    env.GROQ_API_KEY = undefined;
    env.GROQ_MODEL = undefined;
  });

  it('starts unconfigured', async () => {
    const settings = await getAiSettings();
    expect(settings.has_key).toBe(false);
    expect(settings.masked_key).toBeNull();
    expect(settings.model).toBeNull();
    expect(settings.key_error).toBe(false);

    const creds = await resolveGroqCredentials();
    expect(creds.apiKey).toBeNull();
    expect(creds.model).toBeNull();
  });

  it('stores the key encrypted and exposes only a masked copy', async () => {
    await updateAiSettings({ api_key: 'gsk_secret_abcd1234' });

    const settings = await getAiSettings();
    expect(settings.has_key).toBe(true);
    expect(settings.masked_key).toBe('••••1234');
    expect(JSON.stringify(settings)).not.toContain('gsk_secret');

    const creds = await resolveGroqCredentials();
    expect(creds.apiKey).toBe('gsk_secret_abcd1234');
  });

  it('lets the admin set and clear the default model', async () => {
    await updateAiSettings({ api_key: 'gsk_secret_abcd1234', model: 'llama-3.3-70b-versatile' });
    expect((await getAiSettings()).model).toBe('llama-3.3-70b-versatile');

    await updateAiSettings({ model: null });
    expect((await getAiSettings()).model).toBeNull();
  });

  it('falls back to the env model when the admin has not set one', async () => {
    env.GROQ_MODEL = 'env-model';
    await updateAiSettings({ api_key: 'gsk_secret_abcd1234', model: 'admin-model' });
    expect((await getAiSettings()).model).toBe('admin-model');

    await updateAiSettings({ model: null });
    expect((await getAiSettings()).model).toBe('env-model');
  });

  it('flags unreadable stored keys (e.g. SESSION_SECRET rotated)', async () => {
    await updateAiSettings({ api_key: 'gsk_secret_abcd1234' });
    await runAsync(
      database,
      "UPDATE app_settings SET value = 'not-an-encrypted-payload' WHERE key = 'ai.groq.api_key_enc'"
    );

    const settings = await getAiSettings();
    expect(settings.has_key).toBe(false);
    expect(settings.key_error).toBe(true);

    const creds = await resolveGroqCredentials();
    expect(creds.keyError).toBe(true);
    expect(creds.apiKey).toBeNull();
  });

  it('falls back to the env API key when no admin key is stored', async () => {
    env.GROQ_API_KEY = 'gsk_from_env_123456';

    const settings = await getAiSettings();
    expect(settings.has_key).toBe(false);

    const creds = await resolveGroqCredentials();
    expect(creds.apiKey).toBe('gsk_from_env_123456');
    expect(creds.keyError).toBe(false);
  });
});
