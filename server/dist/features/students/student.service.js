import crypto from 'node:crypto';
import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { badRequest, notFound } from '../../shared/errors.js';
import { hashPassword } from '../auth/password.js';
import { getClassById, assertClassManager } from '../classes/class.service.js';
import { studentImportRowSchema } from '@elitequest/shared';
import * as XLSX from 'xlsx';
function toAccount(row) {
    return {
        id: row.id,
        class_id: row.class_id,
        username: row.username,
        display_name: row.display_name,
        student_number: row.student_number,
        is_active: !!row.is_active,
        created_at: row.created_at,
    };
}
function randomPassword() {
    return crypto.randomBytes(6).toString('hex');
}
export async function listStudentsByClass(classId) {
    await getClassById(classId);
    const rows = await allAsync(database, "SELECT id, class_id, username, display_name, student_number, is_active, created_at FROM users WHERE role = 'student' AND class_id = ? ORDER BY display_name", classId);
    return rows.map(toAccount);
}
export async function getStudentAccountById(id) {
    const row = await getAsync(database, "SELECT id, class_id, username, display_name, student_number, is_active, created_at FROM users WHERE id = ? AND role = 'student'", id);
    if (!row) {
        throw notFound('Student');
    }
    return toAccount(row);
}
async function isUsernameTaken(username, excludeId) {
    const row = await getAsync(database, 'SELECT id FROM users WHERE username = ? COLLATE NOCASE AND id != ?', username, excludeId ?? -1);
    return row !== undefined;
}
export async function createStudentAccount(actor, classId, input) {
    await assertClassManager(actor, classId);
    if (await isUsernameTaken(input.username)) {
        throw badRequest('Username already taken');
    }
    const password_hash = await hashPassword(input.password ?? randomPassword());
    await runAsync(database, "INSERT INTO users (username, password_hash, display_name, role, class_id, student_number, is_active) VALUES (?, ?, ?, 'student', ?, ?, 1)", input.username, password_hash, input.display_name, classId, input.student_number ?? null);
    const row = await getAsync(database, 'SELECT id FROM users WHERE username = ? COLLATE NOCASE', input.username);
    if (!row) {
        throw new Error('Failed to create student account');
    }
    return getStudentAccountById(row.id);
}
export async function updateStudentAccount(actor, id, input) {
    const existing = await getStudentAccountById(id);
    await assertClassManager(actor, existing.class_id);
    if (input.username !== undefined && input.username !== existing.username) {
        if (await isUsernameTaken(input.username, id)) {
            throw badRequest('Username already taken');
        }
    }
    await runAsync(database, 'UPDATE users SET username = ?, display_name = ?, student_number = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', input.username ?? existing.username, input.display_name ?? existing.display_name, input.student_number !== undefined ? input.student_number : existing.student_number ?? null, (input.is_active ?? existing.is_active) ? 1 : 0, id);
    return getStudentAccountById(id);
}
export async function setStudentPassword(actor, id, password) {
    const existing = await getStudentAccountById(id);
    await assertClassManager(actor, existing.class_id);
    const password_hash = await hashPassword(password);
    await runAsync(database, 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', password_hash, id);
}
export async function deleteStudentAccount(actor, id) {
    const existing = await getStudentAccountById(id);
    await assertClassManager(actor, existing.class_id);
    await runAsync(database, "DELETE FROM users WHERE id = ? AND role = 'student'", id);
}
export async function bulkStudentAction(actor, classId, input) {
    await assertClassManager(actor, classId);
    const ids = [...new Set(input.ids)];
    const idPlaceholders = ids.map(() => '?').join(', ');
    const found = await allAsync(database, `SELECT id FROM users WHERE id IN (${idPlaceholders}) AND role = 'student' AND class_id = ?`, ...ids, classId);
    const foundIds = new Set(found.map((row) => row.id));
    const targetIds = ids.filter((id) => foundIds.has(id));
    const result = { updated: 0, deleted: 0, errors: [] };
    for (const id of ids) {
        if (!foundIds.has(id)) {
            result.errors.push({ id, message: 'Student not found in this class' });
        }
    }
    if (targetIds.length === 0) {
        return result;
    }
    const targetPlaceholders = targetIds.map(() => '?').join(', ');
    if (input.action === 'delete') {
        await runAsync(database, `DELETE FROM users WHERE role = 'student' AND class_id = ? AND id IN (${targetPlaceholders})`, classId, ...targetIds);
        result.deleted = targetIds.length;
    }
    else {
        const active = input.action === 'activate' ? 1 : 0;
        await runAsync(database, `UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE role = 'student' AND class_id = ? AND id IN (${targetPlaceholders})`, active, classId, ...targetIds);
        result.updated = targetIds.length;
    }
    return result;
}
function pickString(row, keys) {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
            const text = String(value).trim();
            if (text !== '') {
                return text;
            }
        }
    }
    return '';
}
// Spreadsheet headers are matched case-insensitively and ignore spaces,
// underscores and dashes ("Password", "PASSWORD ", "Pass Word" all match
// the alias "password").
function normalizeHeader(key) {
    return key.trim().toLowerCase().replace(/[\s_-]+/g, '');
}
function normalizeRowKeys(row) {
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
        normalized[normalizeHeader(key)] = value;
    }
    return normalized;
}
export async function importStudentsFromXlsx(actor, classId, buffer) {
    await assertClassManager(actor, classId);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // raw: false reads each cell's formatted text, so numbers formatted with
    // leading zeros (custom format "0000") survive; plain number cells still
    // lose them at Excel's end. All values come back as strings.
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
    const normalizedRows = rows.map(normalizeRowKeys);
    const result = { created: 0, updated: 0, skipped: 0, errors: [] };
    for (let i = 0; i < normalizedRows.length; i++) {
        const rowNumber = i + 2; // header row offset
        const username = pickString(normalizedRows[i], ['username', 'user']);
        const displayName = pickString(normalizedRows[i], ['displayname', 'name']);
        const studentNumber = pickString(normalizedRows[i], ['studentnumber', 'studentid', 'studentno']) || undefined;
        // Blank password cell = no password yet (account is unusable until set).
        const password = pickString(normalizedRows[i], ['password', 'pin', 'pwd']) || undefined;
        if (!username || !displayName) {
            result.errors.push({ row: rowNumber, message: 'Row missing username or display_name' });
            continue;
        }
        try {
            const parsed = studentImportRowSchema.parse({ username, display_name: displayName, student_number: studentNumber, password });
            const existing = await getAsync(database, "SELECT id, class_id FROM users WHERE username = ? COLLATE NOCASE AND role = 'student'", parsed.username);
            if (existing) {
                if (existing.class_id !== classId) {
                    result.errors.push({ row: rowNumber, message: `${parsed.username} already belongs to another class` });
                    continue;
                }
                await updateStudentAccount(actor, existing.id, {
                    display_name: parsed.display_name,
                    student_number: parsed.student_number ?? null,
                });
                if (parsed.password) {
                    await setStudentPassword(actor, existing.id, parsed.password);
                }
                result.updated++;
            }
            else {
                await createStudentAccount(actor, classId, parsed);
                result.created++;
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            result.errors.push({ row: rowNumber, message });
        }
    }
    return result;
}
export async function exportStudentsToXlsx(actor, classId) {
    await assertClassManager(actor, classId);
    const students = await listStudentsByClass(classId);
    const rows = students.map((student) => ({
        username: student.username,
        display_name: student.display_name,
        student_number: student.student_number ?? '',
        password: '',
    }));
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Students');
    const output = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return output;
}
//# sourceMappingURL=student.service.js.map