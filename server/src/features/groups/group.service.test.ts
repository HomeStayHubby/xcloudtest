import { describe, it, expect, beforeEach } from 'vitest';
import {
  createGroup,
  listGroupsByQuiz,
  addGroupMember,
  removeGroupMember,
  listGroupMembers,
  getStudentGroup,
} from './group.service.js';
import { createQuiz, releaseQuiz } from '../quizzes/quiz.service.js';
import { setup, makeLecturer, makeClass, makeStudent } from '../../testing/helpers.js';

describe('quiz group service', () => {
  let lecturer: Awaited<ReturnType<typeof makeLecturer>>;
  let classId: number;
  let quizId: number;

  beforeEach(async () => {
    await setup();
    lecturer = await makeLecturer();
    classId = (await makeClass(lecturer)).id;
    const quiz = await createQuiz(lecturer, { title: 'Team Quiz' });
    await releaseQuiz(lecturer, quiz.id, classId);
    quizId = quiz.id;
  });

  it('creates and lists quiz-scoped groups', async () => {
    await createGroup(lecturer, quizId, { name: 'Team A' });
    const groups = await listGroupsByQuiz(lecturer, quizId);
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Team A');
    expect(groups[0].quiz_id).toBe(quizId);
    expect(groups[0].members).toHaveLength(0);
  });

  it('only the quiz owner manages groups', async () => {
    const outsider = await makeLecturer();
    await expect(createGroup(outsider, quizId, { name: 'Hax' })).rejects.toThrow(
      'Quiz not found'
    );
    const group = await createGroup(lecturer, quizId, { name: 'Team A' });
    await expect(listGroupMembers(outsider, group.id)).rejects.toThrow('Quiz not found');
  });

  it('adds and removes members from released classes', async () => {
    const student = await makeStudent(lecturer, classId, 'Alice');
    const group = await createGroup(lecturer, quizId, { name: 'Team A' });

    await addGroupMember(lecturer, group.id, student.id);
    let members = await listGroupMembers(lecturer, group.id);
    expect(members).toHaveLength(1);
    expect(members[0].display_name).toBe('Alice');

    const found = await getStudentGroup(quizId, student.id);
    expect(found?.id).toBe(group.id);

    await removeGroupMember(lecturer, group.id, student.id);
    members = await listGroupMembers(lecturer, group.id);
    expect(members).toHaveLength(0);
  });

  it('rejects students whose class has no release of the quiz', async () => {
    const otherClass = await makeClass(lecturer);
    const outsiderStudent = await makeStudent(lecturer, otherClass.id, 'Bob');
    const group = await createGroup(lecturer, quizId, { name: 'G' });

    await expect(addGroupMember(lecturer, group.id, outsiderStudent.id)).rejects.toThrow(
      'not enrolled in a class this quiz is released to'
    );
  });

  it('rejects duplicate membership and non-student members', async () => {
    const student = await makeStudent(lecturer, classId, 'Alice');
    const group = await createGroup(lecturer, quizId, { name: 'G' });
    await addGroupMember(lecturer, group.id, student.id);
    await expect(addGroupMember(lecturer, group.id, student.id)).rejects.toThrow(
      'already in this group'
    );
    await expect(addGroupMember(lecturer, group.id, lecturer.id)).rejects.toThrow(
      'Student not found'
    );
  });
});
