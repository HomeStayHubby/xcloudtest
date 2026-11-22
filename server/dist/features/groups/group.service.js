import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { badRequest, notFound } from '../../shared/errors.js';
import { assertQuizOwner } from '../quizzes/quiz.service.js';
async function membersOf(groupId) {
    return allAsync(database, `SELECT u.id, u.class_id, u.username, u.display_name, u.student_number, u.is_active, u.created_at
     FROM users u
     JOIN group_members gm ON gm.student_id = u.id
     WHERE gm.group_id = ?
     ORDER BY u.display_name`, groupId);
}
export async function listGroupsByQuiz(user, quizId) {
    await assertQuizOwner(user, quizId);
    const groups = await allAsync(database, 'SELECT * FROM groups WHERE quiz_id = ? ORDER BY name', quizId);
    return Promise.all(groups.map(async (group) => ({
        ...group,
        members: await membersOf(group.id),
    })));
}
export async function getGroupById(id) {
    const group = await getAsync(database, 'SELECT * FROM groups WHERE id = ?', id);
    if (!group) {
        throw notFound('Group');
    }
    return group;
}
async function assertGroupOwner(user, groupId) {
    const group = await getGroupById(groupId);
    await assertQuizOwner(user, group.quiz_id);
    return group;
}
export async function createGroup(user, quizId, input) {
    await assertQuizOwner(user, quizId);
    await runAsync(database, 'INSERT INTO groups (quiz_id, name) VALUES (?, ?)', quizId, input.name);
    const created = await getAsync(database, 'SELECT last_insert_rowid() as id');
    if (!created) {
        throw new Error('Failed to create group');
    }
    return getGroupById(created.id);
}
export async function updateGroup(user, id, input) {
    const existing = await assertGroupOwner(user, id);
    await runAsync(database, 'UPDATE groups SET name = ? WHERE id = ?', input.name ?? existing.name, id);
    return getGroupById(id);
}
export async function deleteGroup(user, id) {
    await assertGroupOwner(user, id);
    await runAsync(database, 'DELETE FROM groups WHERE id = ?', id);
}
export async function listGroupMembers(user, groupId) {
    await assertGroupOwner(user, groupId);
    return membersOf(groupId);
}
export async function addGroupMember(user, groupId, studentId) {
    const group = await assertGroupOwner(user, groupId);
    // Members must be students of a class the quiz is released to.
    const student = await getAsync(database, 'SELECT id, class_id, role FROM users WHERE id = ?', studentId);
    if (!student || student.role !== 'student') {
        throw notFound('Student');
    }
    const released = await getAsync(database, 'SELECT id FROM quiz_releases WHERE quiz_id = ? AND class_id = ?', group.quiz_id, student.class_id ?? -1);
    if (!released) {
        throw badRequest('Student is not enrolled in a class this quiz is released to');
    }
    const existing = await getAsync(database, 'SELECT id FROM group_members WHERE group_id = ? AND student_id = ?', groupId, studentId);
    if (existing) {
        throw badRequest('Student is already in this group');
    }
    await runAsync(database, 'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)', groupId, studentId);
    const created = await getAsync(database, 'SELECT last_insert_rowid() as id');
    if (!created) {
        throw new Error('Failed to add group member');
    }
    const member = await getAsync(database, 'SELECT * FROM group_members WHERE id = ?', created.id);
    if (!member) {
        throw new Error('Failed to add group member');
    }
    return member;
}
export async function removeGroupMember(user, groupId, studentId) {
    await assertGroupOwner(user, groupId);
    await runAsync(database, 'DELETE FROM group_members WHERE group_id = ? AND student_id = ?', groupId, studentId);
}
// Which quiz group is this student in for this quiz?
export async function getStudentGroup(quizId, studentId) {
    return getAsync(database, `SELECT g.* FROM groups g
     JOIN group_members gm ON gm.group_id = g.id
     WHERE g.quiz_id = ? AND gm.student_id = ?`, quizId, studentId);
}
//# sourceMappingURL=group.service.js.map