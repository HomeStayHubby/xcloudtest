import { describe, it, expect, beforeEach } from 'vitest';
import { authenticateUser } from './auth.service.js';
import {
  listLecturers,
  createLecturer,
  updateLecturer,
  resetLecturerPassword,
} from '../users/user.service.js';
import {
  setup,
  makeLecturer,
  makeClass,
  makeStudent,
  uniqueId,
} from '../../testing/helpers.js';
import { badRequest } from '../../shared/errors.js';

describe('auth + users service', () => {
  beforeEach(setup);

  it('authenticates a lecturer by email', async () => {
    const lecturer = await makeLecturer(false, 'Ms. Smith');
    const authenticated = await authenticateUser({
      identifier: lecturer.email!,
      password: 'password123',
    });
    expect(authenticated.id).toBe(lecturer.id);
    expect(authenticated.role).toBe('lecturer');
  });

  it('authenticates a student by username, case-insensitively', async () => {
    const lecturer = await makeLecturer();
    const class_ = await makeClass(lecturer);
    const student = await makeStudent(lecturer, class_.id, 'Alice');
    const authenticated = await authenticateUser({
      identifier: student.username.toUpperCase(),
      password: 'studentpass',
    });
    expect(authenticated.id).toBe(student.id);
    expect(authenticated.role).toBe('student');
    expect(authenticated.class_id).toBe(class_.id);
  });

  it('rejects wrong passwords and unknown identifiers', async () => {
    const lecturer = await makeLecturer();
    await expect(
      authenticateUser({ identifier: lecturer.email!, password: 'wrong' })
    ).rejects.toThrow('Invalid identifier or password');
    await expect(
      authenticateUser({ identifier: 'nobody@nowhere.io', password: 'password123' })
    ).rejects.toThrow('Invalid identifier or password');
  });

  it('blocks deactivated accounts from logging in', async () => {
    const lecturer = await makeLecturer();
    await updateLecturer(lecturer.id, { is_active: false });
    await expect(
      authenticateUser({ identifier: lecturer.email!, password: 'password123' })
    ).rejects.toThrow('Invalid identifier or password');
  });

  it('creates lecturers and rejects duplicate emails', async () => {
    const email = `${uniqueId('lect')}@example.com`;
    const created = await createLecturer({
      email,
      password: 'longpassword1',
      display_name: 'New Lecturer',
      is_admin: false,
    });
    expect(created.role).toBe('lecturer');
    expect(created.is_admin).toBe(false);

    await expect(
      createLecturer({ email, password: 'longpassword2', display_name: 'Dup' })
    ).rejects.toThrow('Email already registered');
  });

  it('lists lecturers (not students)', async () => {
    const lecturer = await makeLecturer();
    const class_ = await makeClass(lecturer);
    await makeStudent(lecturer, class_.id);
    const lecturers = await listLecturers();
    expect(lecturers.length).toBe(1);
    expect(lecturers[0].role).toBe('lecturer');
    expect(lecturers[0]).not.toHaveProperty('password_hash');
  });

  it('updates lecturer admin flag and active state', async () => {
    const lecturer = await makeLecturer();
    const promoted = await updateLecturer(lecturer.id, { is_admin: true });
    expect(promoted.is_admin).toBe(true);

    // A non-admin lecturer can be deactivated freely.
    const plain = await makeLecturer();
    const deactivated = await updateLecturer(plain.id, { is_active: false });
    expect(deactivated.is_active).toBe(false);
  });

  it('refuses to remove or deactivate the last active admin', async () => {
    const admin = await makeLecturer(true);
    await expect(updateLecturer(admin.id, { is_admin: false })).rejects.toThrow(
      'last active admin'
    );
    await expect(updateLecturer(admin.id, { is_active: false })).rejects.toThrow(
      'last active admin'
    );

    // With a second active admin it works.
    const secondAdmin = await makeLecturer(true);
    const demoted = await updateLecturer(secondAdmin.id, { is_admin: false });
    expect(demoted.is_admin).toBe(false);
  });

  it('resets a lecturer password', async () => {
    const lecturer = await makeLecturer();
    await resetLecturerPassword(lecturer.id, 'brandnewpass');
    const authenticated = await authenticateUser({
      identifier: lecturer.email!,
      password: 'brandnewpass',
    });
    expect(authenticated.id).toBe(lecturer.id);
  });

  it('rejects lecturer emails that are not emails', async () => {
    await expect(
      createLecturer({
        email: 'not-an-email',
        password: 'longpassword1',
        display_name: 'Bad',
      })
    ).rejects.toThrow();
    // Sanity: badRequest for duplicates comes from the service, zod for shape.
    expect(badRequest('x').statusCode).toBe(400);
  });
});
