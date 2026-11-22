import { describe, it, expect, beforeEach } from 'vitest';
import {
  createClass,
  getClassById,
  getClassByCode,
  listClasses,
  updateClass,
  deleteClass,
  assertClassManager,
} from './class.service.js';
import { forbidden } from '../../shared/errors.js';
import { setup, makeLecturer, makeClass, makeStudent } from '../../testing/helpers.js';

describe('class service', () => {
  beforeEach(setup);

  it('creates a class with an auto-generated code and creator as advisor', async () => {
    const lecturer = await makeLecturer();
    const class_ = await makeClass(lecturer, 'Biology 101');
    expect(class_.name).toBe('Biology 101');
    expect(class_.code).toMatch(/^B[0-9]{4,}/);
    expect(class_.advisor_id).toBe(lecturer.id);
  });

  it('finds a class by code case-insensitively', async () => {
    const lecturer = await makeLecturer();
    const class_ = await makeClass(lecturer);
    const found = await getClassByCode(class_.code.toLowerCase());
    expect(found?.id).toBe(class_.id);
  });

  it('lists classes with advisor names and student counts', async () => {
    const lecturer = await makeLecturer();
    const other = await makeLecturer();
    const first = await makeClass(lecturer, 'Class A');
    const second = await makeClass(other, 'Class B');
    await makeStudent(lecturer, first.id, 'Alice');

    const classes = await listClasses();
    expect(classes.map((c) => c.id)).toEqual([second.id, first.id]);
    const firstRow = classes.find((c) => c.id === first.id)!;
    expect(firstRow.advisor_name).toBe(lecturer.display_name);
    expect(firstRow.student_count).toBe(1);
  });

  it('updates a class (advisor or admin)', async () => {
    const lecturer = await makeLecturer();
    const class_ = await makeClass(lecturer, 'Class A');
    const updated = await updateClass(class_.id, { name: 'Class A Updated' }, lecturer);
    expect(updated.name).toBe('Class A Updated');
  });

  it('lets an admin reassign the advisor, but not a plain lecturer', async () => {
    const advisor = await makeLecturer();
    const newAdvisor = await makeLecturer();
    const admin = await makeLecturer(true);
    const class_ = await makeClass(advisor);

    const updated = await updateClass(class_.id, { advisor_id: newAdvisor.id }, admin);
    expect(updated.advisor_id).toBe(newAdvisor.id);

    await expect(
      updateClass(class_.id, { advisor_id: advisor.id }, newAdvisor)
    ).rejects.toThrow('Only an admin can reassign');
  });

  it('deletes a class (advisor or admin only)', async () => {
    const advisor = await makeLecturer();
    const outsider = await makeLecturer();
    const class_ = await makeClass(advisor, 'Class A');

    await expect(deleteClass(class_.id, outsider)).rejects.toThrow('Only the class advisor');
    await deleteClass(class_.id, advisor);
    await expect(getClassById(class_.id)).rejects.toThrow('Class not found');
  });

  it('assertClassManager blocks non-advisor lecturers and allows admin', async () => {
    const advisor = await makeLecturer();
    const outsider = await makeLecturer();
    const admin = await makeLecturer(true);
    const class_ = await makeClass(advisor);

    await expect(assertClassManager(outsider, class_.id)).rejects.toThrow(
      'Only the class advisor'
    );
    await expect(assertClassManager(admin, class_.id)).resolves.toBeTruthy();
    await expect(assertClassManager(advisor, class_.id)).resolves.toBeTruthy();
    expect(forbidden('x').statusCode).toBe(403);
  });
});
