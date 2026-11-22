import { describe, it, expect } from 'vitest';
import { encryptSecret, decryptSecret, maskSecret } from './secret-box.js';

describe('secret-box', () => {
  it('round-trips a plaintext secret', () => {
    const payload = 'gsk_test_key_1234567890';
    const encrypted = encryptSecret(payload);
    expect(encrypted).not.toContain(payload);
    expect(encrypted.startsWith('v1:')).toBe(true);
    expect(decryptSecret(encrypted)).toBe(payload);
  });

  it('produces different ciphertexts for the same plaintext (random IV)', () => {
    expect(encryptSecret('same-value')).not.toBe(encryptSecret('same-value'));
  });

  it('returns null for tampered payloads', () => {
    const encrypted = encryptSecret('another-secret');
    const parts = encrypted.split(':');
    parts[3] = Buffer.from('tampered-data').toString('base64');
    expect(decryptSecret(parts.join(':'))).toBeNull();
  });

  it('returns null for payloads from a different key or malformed input', () => {
    expect(decryptSecret('garbage')).toBeNull();
    expect(decryptSecret('v2:aaa:bbb:ccc')).toBeNull();
    expect(decryptSecret('')).toBeNull();
  });

  it('masks everything but the last 4 characters', () => {
    expect(maskSecret('gsk_abcd1234')).toBe('••••1234');
    expect(maskSecret('ab')).toBe('••••ab');
  });
});
