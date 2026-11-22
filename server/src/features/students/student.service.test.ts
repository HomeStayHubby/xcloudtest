import { describe, it, expect, beforeEach } from 'vitest';
import {
  listStudentsByClass,
  createStudentAccount,
  updateStudentAccount,
  setStudentPassword,
  deleteStudentAccount,
  bulkStudentAction,
  importStudentsFromXlsx,
  exportStudentsToXlsx,
} from './student.service.js';
import { authenticateUser } from '../auth/auth.service.js';
import { setup, makeLecturer, makeClass, uniqueId } from '../../testing/helpers.js';
import * as XLSX from 'xlsx';

function writeXlsx(rows: Record<string, string>[]): Buffer {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Students');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

describe('student account service', () => {
  let advisor: Awaited<ReturnType<typeof makeLecturer>>;
  let classId: number;

  beforeEach(async () => {
    await setup();
    advisor = await makeLecturer();
    classId = (await makeClass(advisor)).id;
  });

  it('creates and lists student accounts in a class', async () => {
    await createStudentAccount(advisor, classId, {
      username: 'alice.t',
      display_name: 'Alice',
      password: 'pass1234',
      student_number: 'A001',
    });
    const students = await listStudentsByClass(classId);
    expect(students).toHaveLength(1);
    expect(students[0].username).toBe('alice.t');
    expect(students[0].display_name).toBe('Alice');
    expect(students[0].student_number).toBe('A001');
    expect(students).not.toHaveProperty('password_hash');
  });

  it('rejects duplicate usernames across the system', async () => {
    await createStudentAccount(advisor, classId, {
      username: 'bob.k',
      display_name: 'Bob',
    });
    await expect(
      createStudentAccount(advisor, classId, { username: 'BOB.K', display_name: 'Bob2' })
    ).rejects.toThrow('Username already taken');
  });

  it('only the advisor can create/update/delete students', async () => {
    const outsider = await makeLecturer();
    await expect(
      createStudentAccount(outsider, classId, { username: 'eve.x', display_name: 'Eve' })
    ).rejects.toThrow('Only the class advisor');

    const admin = await makeLecturer(true);
    await expect(
      createStudentAccount(admin, classId, { username: 'adam.a', display_name: 'Adam' })
    ).resolves.toBeTruthy();
  });

  it('updates a student account', async () => {
    const student = await createStudentAccount(advisor, classId, {
      username: 'carl.z',
      display_name: 'Carl',
    });
    const updated = await updateStudentAccount(advisor, student.id, {
      display_name: 'Carl Zhang',
      student_number: 'S1',
    });
    expect(updated.display_name).toBe('Carl Zhang');
    expect(updated.student_number).toBe('S1');
  });

  it('sets a student password the student can log in with', async () => {
    const student = await createStudentAccount(advisor, classId, {
      username: 'dee.w',
      display_name: 'Dee',
    });
    await setStudentPassword(advisor, student.id, 'newpass123');
    const authenticated = await authenticateUser({
      identifier: 'dee.w',
      password: 'newpass123',
    });
    expect(authenticated.id).toBe(student.id);
  });

  it('deletes a student account', async () => {
    const student = await createStudentAccount(advisor, classId, {
      username: 'eva.q',
      display_name: 'Eva',
    });
    await deleteStudentAccount(advisor, student.id);
    const students = await listStudentsByClass(classId);
    expect(students).toHaveLength(0);
  });

  it('imports students from xlsx: creates and updates', async () => {
    const existing = await createStudentAccount(advisor, classId, {
      username: 'exist.one',
      display_name: 'Existing',
    });

    const buffer = writeXlsx([
      { username: 'exist.one', display_name: 'Existing Renamed' },
      { username: `new.${uniqueId('s').toLowerCase()}`, display_name: 'New Student', student_number: 'S002' },
      { username: 'bad username!', display_name: 'Broken' },
      { username: 'missing.name' },
    ]);

    const result = await importStudentsFromXlsx(advisor, classId, buffer);
    expect(result.created).toBe(1);
    expect(result.updated).toBe(1);
    expect(result.errors.length).toBe(2);

    const students = await listStudentsByClass(classId);
    const renamed = students.find((s) => s.id === existing.id);
    expect(renamed?.display_name).toBe('Existing Renamed');
  });

  it('refuses to import a username belonging to another class', async () => {
    const otherClass = await makeClass(advisor);
    await createStudentAccount(advisor, otherClass.id, {
      username: 'taken.one',
      display_name: 'Taken',
    });

    const buffer = writeXlsx([{ username: 'taken.one', display_name: 'Imposter' }]);

    const result = await importStudentsFromXlsx(advisor, classId, buffer);
    expect(result.created).toBe(0);
    expect(result.errors[0].message).toContain('another class');
  });

  it('imports passwords of any length, leading zeros and emoji, and blank means none', async () => {
    const suffix = uniqueId('pw').toLowerCase();
    const username = (tag: string) => `${tag}.${suffix}`;
    const buffer = writeXlsx([
      { username: username('short'), display_name: 'Short', password: 'ab1' },
      { username: username('zero'), display_name: 'Zero', password: '0123' },
      { username: username('emoji'), display_name: 'Emoji', password: '😀a1' },
      { username: username('blank'), display_name: 'Blank' },
    ]);

    const result = await importStudentsFromXlsx(advisor, classId, buffer);
    expect(result.errors).toHaveLength(0);
    expect(result.created).toBe(4);

    const short = await authenticateUser({ identifier: username('short'), password: 'ab1' });
    const zero = await authenticateUser({ identifier: username('zero'), password: '0123' });
    const emoji = await authenticateUser({ identifier: username('emoji'), password: '😀a1' });
    expect(short.id).toBeGreaterThan(0);
    expect(zero.id).toBeGreaterThan(0);
    expect(emoji.id).toBeGreaterThan(0);

    // Blank password cell -> unusable random password: any guess fails.
    await expect(
      authenticateUser({ identifier: username('blank'), password: 'guess' })
    ).rejects.toThrow('Invalid identifier or password');
  });

  it('matches xlsx headers case-insensitively with flexible spacing', async () => {
    const suffix = uniqueId('hd').toLowerCase();
    const buffer = writeXlsx([
      { 'User Name': `header.${suffix}`, 'Display  Name': 'Header Case', PASSWORD: '0abc' },
    ]);

    const result = await importStudentsFromXlsx(advisor, classId, buffer);
    expect(result.errors).toHaveLength(0);
    expect(result.created).toBe(1);

    const authenticated = await authenticateUser({
      identifier: `header.${suffix}`,
      password: '0abc',
    });
    expect(authenticated.display_name).toBe('Header Case');
  });

  it('rejects passwords longer than 72 UTF-8 bytes on import', async () => {
    const longEmojiPassword = '😀'.repeat(25); // 50 chars but 100 bytes
    const buffer = writeXlsx([
      { username: 'too.long', display_name: 'Too Long', password: longEmojiPassword },
    ]);

    const result = await importStudentsFromXlsx(advisor, classId, buffer);
    expect(result.created).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('too long');
  });

  it('deletes, activates and deactivates students in bulk', async () => {
    const s1 = await createStudentAccount(advisor, classId, { username: 'bulk.a', display_name: 'Bulk A' });
    const s2 = await createStudentAccount(advisor, classId, { username: 'bulk.b', display_name: 'Bulk B' });
    const s3 = await createStudentAccount(advisor, classId, { username: 'bulk.c', display_name: 'Bulk C' });

    const deactivated = await bulkStudentAction(advisor, classId, {
      ids: [s1.id, s2.id],
      action: 'deactivate',
    });
    expect(deactivated.updated).toBe(2);
    expect(deactivated.deleted).toBe(0);
    let students = await listStudentsByClass(classId);
    expect(students.find((s) => s.id === s1.id)?.is_active).toBe(false);
    expect(students.find((s) => s.id === s2.id)?.is_active).toBe(false);

    const activated = await bulkStudentAction(advisor, classId, { ids: [s1.id], action: 'activate' });
    expect(activated.updated).toBe(1);
    students = await listStudentsByClass(classId);
    expect(students.find((s) => s.id === s1.id)?.is_active).toBe(true);

    const deleted = await bulkStudentAction(advisor, classId, { ids: [s2.id, s3.id], action: 'delete' });
    expect(deleted.deleted).toBe(2);
    students = await listStudentsByClass(classId);
    expect(students).toHaveLength(1);
    expect(students[0].id).toBe(s1.id);
  });

  it('reports ids from other classes as errors without touching them', async () => {
    const otherClass = await makeClass(advisor);
    const otherStudent = await createStudentAccount(advisor, otherClass.id, {
      username: 'other.class',
      display_name: 'Other',
    });
    const mine = await createStudentAccount(advisor, classId, {
      username: 'mine.ok',
      display_name: 'Mine',
    });

    const result = await bulkStudentAction(advisor, classId, {
      ids: [mine.id, otherStudent.id, 999999],
      action: 'delete',
    });

    expect(result.deleted).toBe(1);
    expect(result.errors).toHaveLength(2);
    expect(result.errors.map((e) => e.id).sort((a, b) => a - b)).toEqual([otherStudent.id, 999999]);
    // The other class student must still exist.
    const otherStudents = await listStudentsByClass(otherClass.id);
    expect(otherStudents).toHaveLength(1);
  });

  it('only the advisor can run bulk actions', async () => {
    const student = await createStudentAccount(advisor, classId, { username: 'perm.a', display_name: 'Perm' });
    const outsider = await makeLecturer();
    await expect(
      bulkStudentAction(outsider, classId, { ids: [student.id], action: 'deactivate' })
    ).rejects.toThrow('Only the class advisor');

    const admin = await makeLecturer(true);
    const result = await bulkStudentAction(admin, classId, { ids: [student.id], action: 'deactivate' });
    expect(result.updated).toBe(1);
  });

  it('exports students to xlsx', async () => {
    await createStudentAccount(advisor, classId, {
      username: 'fox.p',
      display_name: 'Fox',
      student_number: 'P001',
    });
    const buffer = await exportStudentsToXlsx(advisor, classId);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
