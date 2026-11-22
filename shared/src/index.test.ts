import { describe, it, expect } from 'vitest';
import {
  loginUserSchema,
  createClassSchema,
  createStudentAccountSchema,
  createLecturerSchema,
  releaseQuizSchema,
  setStudentPasswordSchema,
  bulkStudentActionSchema,
} from './index.js';

describe('shared schemas', () => {
  it('validates login with email identifier', () => {
    const result = loginUserSchema.safeParse({ identifier: 'test@example.com', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('validates login with username identifier', () => {
    const result = loginUserSchema.safeParse({ identifier: 'alice.s1023', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('validates class creation', () => {
    const result = createClassSchema.safeParse({ name: 'Biology 101', description: 'Intro' });
    expect(result.success).toBe(true);
  });

  it('validates student account creation', () => {
    const result = createStudentAccountSchema.safeParse({
      username: 'alice.s1023',
      display_name: 'Alice Tan',
      password: 'pass1234',
    });
    expect(result.success).toBe(true);
  });

  it('rejects student usernames with spaces', () => {
    const result = createStudentAccountSchema.safeParse({
      username: 'alice tan',
      display_name: 'Alice Tan',
    });
    expect(result.success).toBe(false);
  });

  it('accepts student passwords from 1 to 50 characters incl. symbols and emoji', () => {
    const make = (password: string) =>
      setStudentPasswordSchema.safeParse({ password });
    expect(make('a').success).toBe(true);
    expect(make('0123').success).toBe(true);
    expect(make('p@ss!😀').success).toBe(true);
    expect(make('a'.repeat(50)).success).toBe(true);
    expect(make('').success).toBe(false);
    expect(make('a'.repeat(51)).success).toBe(false);
    // 25 emoji = 50 chars but 100 UTF-8 bytes: past bcrypt's 72-byte limit.
    expect(make('😀'.repeat(25)).success).toBe(false);
    expect(make('😀'.repeat(12) + 'a'.repeat(2)).success).toBe(true); // 50 bytes
  });

  it('validates bulk student actions', () => {
    const valid = bulkStudentActionSchema.safeParse({ ids: [1, 2, 3], action: 'delete' });
    expect(valid.success).toBe(true);

    const empty = bulkStudentActionSchema.safeParse({ ids: [], action: 'delete' });
    expect(empty.success).toBe(false);

    const badAction = bulkStudentActionSchema.safeParse({ ids: [1], action: 'nuke' });
    expect(badAction.success).toBe(false);
  });

  it('validates lecturer creation', () => {
    const result = createLecturerSchema.safeParse({
      email: 'lect@example.com',
      password: 'longpassword1',
      display_name: 'Mr Lim',
    });
    expect(result.success).toBe(true);
  });

  it('validates quiz release', () => {
    const result = releaseQuizSchema.safeParse({ class_id: 1 });
    expect(result.success).toBe(true);
  });
});
