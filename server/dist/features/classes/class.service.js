import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { badRequest, forbidden, notFound } from '../../shared/errors.js';
import { canManageClass, isAdminUser } from '../../shared/permissions.js';
function generateCodeFromName(name) {
    const base = name
        .split(/\s+/)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${base}${random}`.slice(0, 10);
}
export async function listClasses() {
    return allAsync(database, `SELECT c.*, u.display_name AS advisor_name,
            (SELECT COUNT(*) FROM users s WHERE s.class_id = c.id AND s.role = 'student') AS student_count
     FROM classes c
     LEFT JOIN users u ON u.id = c.advisor_id
     ORDER BY c.created_at DESC, c.id DESC`);
}
export async function getClassById(id) {
    const class_ = await getAsync(database, 'SELECT * FROM classes WHERE id = ?', id);
    if (!class_) {
        throw notFound('Class');
    }
    return class_;
}
export async function getClassByCode(code) {
    return getAsync(database, 'SELECT * FROM classes WHERE code = ? COLLATE NOCASE', code);
}
// Loads the class and enforces advisor/admin management rights.
export async function assertClassManager(user, classId) {
    const class_ = await getClassById(classId);
    if (!canManageClass(user, class_.advisor_id)) {
        throw forbidden('Only the class advisor can manage this class');
    }
    return class_;
}
async function isCodeUnique(code) {
    const existing = await getClassByCode(code);
    return !existing;
}
export async function createClass(input, advisorId) {
    let code = input.code;
    if (!code) {
        let attempts = 0;
        do {
            code = generateCodeFromName(input.name);
            attempts++;
        } while (!(await isCodeUnique(code)) && attempts < 10);
    }
    if (!code || !(await isCodeUnique(code))) {
        throw badRequest('Could not generate a unique class code');
    }
    await runAsync(database, 'INSERT INTO classes (name, code, description, is_active, advisor_id) VALUES (?, ?, ?, ?, ?)', input.name, code, input.description ?? null, input.is_active ?? true, advisorId);
    const class_ = await getClassByCode(code);
    if (!class_) {
        throw new Error('Failed to create class');
    }
    return class_;
}
export async function updateClass(id, input, actor) {
    const existing = await getClassById(id);
    // Only admins may reassign the advisor.
    if (input.advisor_id !== undefined && !isAdminUser(actor)) {
        throw forbidden('Only an admin can reassign the class advisor');
    }
    if (input.advisor_id !== null && input.advisor_id !== undefined) {
        const advisor = await getAsync(database, 'SELECT role, is_active FROM users WHERE id = ?', input.advisor_id);
        if (!advisor || advisor.role !== 'lecturer' || !advisor.is_active) {
            throw badRequest('Advisor must be an active lecturer');
        }
    }
    // Name/description/active changes are advisor-or-admin (enforced by callers
    // via assertClassManager; admins may also edit any class).
    const name = input.name ?? existing.name;
    const description = input.description ?? existing.description;
    const isActive = input.is_active ?? existing.is_active;
    const advisorId = input.advisor_id !== undefined ? input.advisor_id : existing.advisor_id;
    await runAsync(database, 'UPDATE classes SET name = ?, description = ?, is_active = ?, advisor_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', name, description ?? null, isActive, advisorId ?? null, id);
    return getClassById(id);
}
export async function deleteClass(id, actor) {
    const class_ = await getClassById(id);
    if (!canManageClass(actor, class_.advisor_id)) {
        throw forbidden('Only the class advisor can delete this class');
    }
    await runAsync(database, 'DELETE FROM classes WHERE id = ?', id);
}
//# sourceMappingURL=class.service.js.map