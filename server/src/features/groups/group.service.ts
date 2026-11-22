import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { badRequest, notFound } from '../../shared/errors.js';
import type { Actor } from '../../shared/permissions.js';
import { assertQuizOwner } from '../quizzes/quiz.service.js';
import type { Group, CreateGroup, UpdateGroup, GroupMember, StudentAccount } from '@elitequest/shared';

export type GroupWithMembers = Group & { members: StudentAccount[] };

async function membersOf(groupId: number): Promise<StudentAccount[]> {
  return allAsync<StudentAccount>(
    database,
    `SELECT u.id, u.class_id, u.username, u.display_name, u.student_number, u.is_active, u.created_at
     FROM users u
     JOIN group_members gm ON gm.student_id = u.id
     WHERE gm.group_id = ?
     ORDER BY u.display_name`,
    groupId
  );
}

export async function listGroupsByQuiz(user: Actor, quizId: number): Promise<GroupWithMembers[]> {
  await assertQuizOwner(user, quizId);
  const groups = await allAsync<Group>(
    database,
    'SELECT * FROM groups WHERE quiz_id = ? ORDER BY name',
    quizId
  );
  return Promise.all(
    groups.map(async (group) => ({
      ...group,
      members: await membersOf(group.id),
    }))
  );
}

export async function getGroupById(id: number): Promise<Group> {
  const group = await getAsync<Group>(database, 'SELECT * FROM groups WHERE id = ?', id);
  if (!group) {
    throw notFound('Group');
  }
  return group;
}

async function assertGroupOwner(user: Actor, groupId: number): Promise<Group> {
  const group = await getGroupById(groupId);
  await assertQuizOwner(user, group.quiz_id);
  return group;
}

export async function createGroup(user: Actor, quizId: number, input: CreateGroup): Promise<Group> {
  await assertQuizOwner(user, quizId);
  await runAsync(database, 'INSERT INTO groups (quiz_id, name) VALUES (?, ?)', quizId, input.name);
  const created = await getAsync<{ id: number }>(database, 'SELECT last_insert_rowid() as id');
  if (!created) {
    throw new Error('Failed to create group');
  }
  return getGroupById(created.id);
}

export async function updateGroup(user: Actor, id: number, input: UpdateGroup): Promise<Group> {
  const existing = await assertGroupOwner(user, id);
  await runAsync(
    database,
    'UPDATE groups SET name = ? WHERE id = ?',
    input.name ?? existing.name,
    id
  );
  return getGroupById(id);
}

export async function deleteGroup(user: Actor, id: number): Promise<void> {
  await assertGroupOwner(user, id);
  await runAsync(database, 'DELETE FROM groups WHERE id = ?', id);
}

export async function listGroupMembers(user: Actor, groupId: number): Promise<StudentAccount[]> {
  await assertGroupOwner(user, groupId);
  return membersOf(groupId);
}

export async function addGroupMember(user: Actor, groupId: number, studentId: number): Promise<GroupMember> {
  const group = await assertGroupOwner(user, groupId);

  // Members must be students of a class the quiz is released to.
  const student = await getAsync<{ id: number; class_id: number | null; role: string }>(
    database,
    'SELECT id, class_id, role FROM users WHERE id = ?',
    studentId
  );
  if (!student || student.role !== 'student') {
    throw notFound('Student');
  }
  const released = await getAsync<{ id: number }>(
    database,
    'SELECT id FROM quiz_releases WHERE quiz_id = ? AND class_id = ?',
    group.quiz_id,
    student.class_id ?? -1
  );
  if (!released) {
    throw badRequest('Student is not enrolled in a class this quiz is released to');
  }

  const existing = await getAsync<{ id: number }>(
    database,
    'SELECT id FROM group_members WHERE group_id = ? AND student_id = ?',
    groupId,
    studentId
  );
  if (existing) {
    throw badRequest('Student is already in this group');
  }

  await runAsync(
    database,
    'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)',
    groupId,
    studentId
  );
  const created = await getAsync<{ id: number }>(database, 'SELECT last_insert_rowid() as id');
  if (!created) {
    throw new Error('Failed to add group member');
  }
  const member = await getAsync<GroupMember>(
    database,
    'SELECT * FROM group_members WHERE id = ?',
    created.id
  );
  if (!member) {
    throw new Error('Failed to add group member');
  }
  return member;
}

export async function removeGroupMember(user: Actor, groupId: number, studentId: number): Promise<void> {
  await assertGroupOwner(user, groupId);
  await runAsync(
    database,
    'DELETE FROM group_members WHERE group_id = ? AND student_id = ?',
    groupId,
    studentId
  );
}

// Which quiz group is this student in for this quiz?
export async function getStudentGroup(quizId: number, studentId: number): Promise<Group | undefined> {
  return getAsync<Group>(
    database,
    `SELECT g.* FROM groups g
     JOIN group_members gm ON gm.group_id = g.id
     WHERE g.quiz_id = ? AND gm.student_id = ?`,
    quizId,
    studentId
  );
}
