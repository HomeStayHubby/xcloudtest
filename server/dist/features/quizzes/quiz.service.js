import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { badRequest, notFound } from '../../shared/errors.js';
import { parseQuizSettings, stringifyQuizSettings } from '../../db/json-helpers.js';
import { quizSettingsSchema } from '@elitequest/shared';
function parseQuizRow(row) {
    return {
        ...row,
        settings: parseQuizSettings(row.settings),
    };
}
function normalizeSettings(value) {
    return quizSettingsSchema.parse(value ?? {});
}
export async function listQuizzes(user) {
    const where = user.is_admin ? '' : 'WHERE q.created_by = ?';
    const params = user.is_admin ? [] : [user.id];
    const rows = await allAsync(database, `SELECT q.* FROM quizzes q ${where} ORDER BY q.created_at DESC, q.id DESC`, ...params);
    const quizzes = rows.map(parseQuizRow);
    return Promise.all(quizzes.map(attachReleases));
}
export async function getQuizById(id) {
    const row = await getAsync(database, 'SELECT * FROM quizzes WHERE id = ?', id);
    if (!row) {
        throw notFound('Quiz');
    }
    return parseQuizRow(row);
}
export async function getQuizDetail(user, id) {
    const quiz = await getQuizById(id);
    if (quiz.created_by !== user.id && !user.is_admin) {
        throw notFound('Quiz');
    }
    return attachReleases(quiz);
}
async function attachReleases(quiz) {
    const releases = await allAsync(database, `SELECT r.id, r.quiz_id, r.class_id, r.created_at, c.name AS class_name
     FROM quiz_releases r
     LEFT JOIN classes c ON c.id = r.class_id
     WHERE r.quiz_id = ?
     ORDER BY c.name`, quiz.id);
    return { ...quiz, releases };
}
export async function createQuiz(user, input) {
    const settings = stringifyQuizSettings(normalizeSettings(input.settings));
    await runAsync(database, 'INSERT INTO quizzes (created_by, title, description, status, settings) VALUES (?, ?, ?, ?, ?)', user.id, input.title, input.description ?? null, 'draft', settings);
    const quiz = await getAsync(database, 'SELECT last_insert_rowid() as id');
    if (!quiz) {
        throw new Error('Failed to create quiz');
    }
    return getQuizById(quiz.id);
}
export async function updateQuiz(user, id, input) {
    await assertQuizOwner(user, id);
    const existing = await getQuizById(id);
    const title = input.title ?? existing.title;
    const description = input.description !== undefined ? input.description : existing.description;
    const settings = stringifyQuizSettings(normalizeSettings(input.settings ?? existing.settings));
    await runAsync(database, 'UPDATE quizzes SET title = ?, description = ?, settings = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', title, description ?? null, settings, id);
    return getQuizById(id);
}
export async function deleteQuiz(user, id) {
    await assertQuizOwner(user, id);
    await runAsync(database, 'DELETE FROM quizzes WHERE id = ?', id);
}
export async function assertQuizOwner(user, quizId) {
    const quiz = await getQuizById(quizId);
    if (quiz.created_by !== user.id && !user.is_admin) {
        throw notFound('Quiz');
    }
    return quiz;
}
// Broadcasters are registered at socket setup time (see live.socket.ts) so
// this service stays decoupled from socket.io.
const quizClosedHandlers = [];
export function registerQuizClosedBroadcaster(handler) {
    quizClosedHandlers.push(handler);
}
export async function setQuizStatus(user, id, status, allowedFrom) {
    await assertQuizOwner(user, id);
    const quiz = await getQuizById(id);
    if (allowedFrom && !allowedFrom.includes(quiz.status)) {
        throw badRequest(`Cannot transition quiz from ${quiz.status} to ${status}`);
    }
    await runAsync(database, 'UPDATE quizzes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', status, id);
    if (status === 'closed') {
        for (const handler of quizClosedHandlers) {
            handler(id);
        }
    }
    return getQuizById(id);
}
// ---------------------------------------------------------------- releases --
export async function releaseQuiz(user, quizId, classId) {
    await assertQuizOwner(user, quizId);
    const class_ = await getAsync(database, 'SELECT id, is_active FROM classes WHERE id = ?', classId);
    if (!class_) {
        throw notFound('Class');
    }
    const existing = await getAsync(database, 'SELECT id FROM quiz_releases WHERE quiz_id = ? AND class_id = ?', quizId, classId);
    if (existing) {
        throw badRequest('Quiz is already released to this class');
    }
    await runAsync(database, 'INSERT INTO quiz_releases (quiz_id, class_id) VALUES (?, ?)', quizId, classId);
    const release = await getAsync(database, 'SELECT id, quiz_id, class_id, created_at FROM quiz_releases WHERE quiz_id = ? AND class_id = ?', quizId, classId);
    if (!release) {
        throw new Error('Failed to release quiz');
    }
    return release;
}
export async function unreleaseQuiz(user, quizId, classId) {
    await assertQuizOwner(user, quizId);
    await runAsync(database, 'DELETE FROM quiz_releases WHERE quiz_id = ? AND class_id = ?', quizId, classId);
}
function parseOpenQuizRow(row) {
    return {
        ...row,
        settings: parseQuizSettings(row.settings),
    };
}
// Open quizzes a student may take: released to their class, or part of a
// campaign for their class.
export async function listOpenQuizzesForStudent(classId) {
    const rows = await allAsync(database, `SELECT q.*, cq.campaign_id AS campaign_id, cam.title AS campaign_title
     FROM quizzes q
     LEFT JOIN campaign_quizzes cq ON cq.quiz_id = q.id
     LEFT JOIN campaigns cam ON cam.id = cq.campaign_id
     WHERE q.status = 'open' AND (
       q.id IN (SELECT quiz_id FROM quiz_releases WHERE class_id = ?)
       OR (cq.campaign_id IS NOT NULL AND cam.class_id = ?)
     )
     ORDER BY q.created_at DESC, q.id DESC`, classId, classId);
    return rows.map(parseOpenQuizRow);
}
export async function listQuizzesForClass(classId) {
    const rows = await allAsync(database, `SELECT q.* FROM quizzes q
     WHERE q.id IN (SELECT quiz_id FROM quiz_releases WHERE class_id = ?)
     ORDER BY q.created_at DESC, q.id DESC`, classId);
    return rows.map(parseQuizRow);
}
// A student may only access quizzes released to their class (or playable
// through a campaign for their class).
export async function assertStudentCanAccessQuiz(userId, quizId) {
    const student = await getAsync(database, "SELECT class_id FROM users WHERE id = ? AND role = 'student'", userId);
    if (!student || student.class_id === null) {
        throw badRequest('Student is not enrolled in any class');
    }
    const allowed = await getAsync(database, `SELECT q.id FROM quizzes q
     LEFT JOIN campaign_quizzes cq ON cq.quiz_id = q.id
     LEFT JOIN campaigns cam ON cam.id = cq.campaign_id
     WHERE q.id = ? AND (
       q.id IN (SELECT quiz_id FROM quiz_releases WHERE class_id = ?)
       OR (cq.campaign_id IS NOT NULL AND cam.class_id = ?)
     )`, quizId, student.class_id, student.class_id);
    if (!allowed) {
        throw badRequest('This quiz has not been released to your class');
    }
}
export async function getStudentClassId(userId) {
    const row = await getAsync(database, "SELECT class_id FROM users WHERE id = ? AND role = 'student'", userId);
    return row?.class_id ?? null;
}
//# sourceMappingURL=quiz.service.js.map