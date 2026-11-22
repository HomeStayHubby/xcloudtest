import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { hashPassword } from '../auth/password.js';
import { badRequest, notFound, forbidden } from '../../shared/errors.js';
import { toPublicUser } from '../../shared/user-serialize.js';
import { createLecturerSchema } from '@elitequest/shared';
export async function listLecturers() {
    const rows = await allAsync(database, "SELECT * FROM users WHERE role = 'lecturer' ORDER BY created_at DESC, id DESC");
    return rows.map(toPublicUser);
}
export async function getLecturerById(id) {
    const row = await getAsync(database, "SELECT * FROM users WHERE id = ? AND role = 'lecturer'", id);
    if (!row) {
        throw notFound('Lecturer');
    }
    return toPublicUser(row);
}
async function isEmailTaken(email, excludeId) {
    const row = await getAsync(database, 'SELECT id FROM users WHERE email = ? COLLATE NOCASE AND id != ?', email, excludeId ?? -1);
    return row !== undefined;
}
async function activeAdminCount(excludeId) {
    const row = await getAsync(database, "SELECT COUNT(*) AS n FROM users WHERE role = 'lecturer' AND is_admin = 1 AND is_active = 1 AND id != ?", excludeId ?? -1);
    return row?.n ?? 0;
}
export async function createLecturer(input) {
    const parsed = createLecturerSchema.parse(input);
    if (await isEmailTaken(parsed.email)) {
        throw badRequest('Email already registered');
    }
    const password_hash = await hashPassword(parsed.password);
    await runAsync(database, "INSERT INTO users (email, password_hash, display_name, role, is_admin, is_active) VALUES (?, ?, ?, 'lecturer', ?, 1)", parsed.email, password_hash, parsed.display_name, parsed.is_admin ? 1 : 0);
    const row = await getAsync(database, 'SELECT * FROM users WHERE email = ? COLLATE NOCASE', parsed.email);
    if (!row) {
        throw new Error('Failed to create lecturer');
    }
    return toPublicUser(row);
}
export async function updateLecturer(id, input) {
    const existing = await getLecturerById(id);
    if (input.email !== undefined && input.email !== existing.email) {
        if (await isEmailTaken(input.email, id)) {
            throw badRequest('Email already registered');
        }
    }
    // Never leave the system without an active admin.
    const losingAdmin = existing.is_admin && ((input.is_admin === false) || input.is_active === false);
    if (losingAdmin && (await activeAdminCount(id)) === 0) {
        throw forbidden('Cannot remove the last active admin');
    }
    await runAsync(database, 'UPDATE users SET email = ?, display_name = ?, is_admin = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', input.email ?? existing.email, input.display_name ?? existing.display_name, (input.is_admin ?? existing.is_admin) ? 1 : 0, (input.is_active ?? existing.is_active) ? 1 : 0, id);
    return getLecturerById(id);
}
export async function resetLecturerPassword(id, password) {
    await getLecturerById(id);
    const password_hash = await hashPassword(password);
    await runAsync(database, 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', password_hash, id);
}
//# sourceMappingURL=user.service.js.map