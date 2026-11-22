import crypto from 'node:crypto';
import { env } from './env.js';

// Encrypts secrets at rest (e.g. the admin-entered Groq API key) with
// AES-256-GCM. The key is derived from SESSION_SECRET, so no additional
// secret must be managed. If SESSION_SECRET is rotated, previously stored
// values can no longer be decrypted — decryptSecret returns null and callers
// prompt the admin to re-enter the value.

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';
const SALT = 'elitequest:secret-box:v1';

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey === null) {
    cachedKey = crypto.scryptSync(env.SESSION_SECRET, SALT, 32);
  }
  return cachedKey;
}

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join(
    ':'
  );
}

// Returns null when the payload was encrypted with a different key or was
// tampered with. Never throws.
export function decryptSecret(payload: string): string | null {
  try {
    const [version, ivB64, tagB64, dataB64] = payload.split(':');
    if (version !== VERSION || !ivB64 || !tagB64 || !dataB64) {
      return null;
    }
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}

// UI-safe representation: only the last 4 characters are shown.
export function maskSecret(plaintext: string): string {
  return `••••${plaintext.slice(-4)}`;
}
