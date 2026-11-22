import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { getClassByCode } from '../classes/class.service.js';
import { unauthorized } from '../../shared/errors.js';
export async function joinClass(input) {
    const class_ = await getClassByCode(input.code);
    if (!class_) {
        throw unauthorized('Invalid class code');
    }
    if (!class_.is_active) {
        throw unauthorized('Class is not active');
    }
    if (Boolean(class_.require_pin) && !input.pin) {
        throw unauthorized('PIN is required for this class');
    }
    const existingStudents = await allAsync(database, 'SELECT * FROM students WHERE class_id = ? AND LOWER(display_name) = LOWER(?)', class_.id, input.display_name);
    if (existingStudents.length > 0) {
        const existing = existingStudents[0];
        if (Boolean(class_.require_pin)) {
            if (!existing.pin || existing.pin !== input.pin) {
                throw unauthorized('Incorrect PIN');
            }
        }
        else if (existing.pin && existing.pin !== input.pin) {
            throw unauthorized('Incorrect PIN');
        }
        return existing;
    }
    await runAsync(database, 'INSERT INTO students (class_id, display_name, pin) VALUES (?, ?, ?)', class_.id, input.display_name, input.pin ?? null);
    const created = await getAsync(database, 'SELECT * FROM students WHERE class_id = ? AND LOWER(display_name) = LOWER(?)', class_.id, input.display_name);
    if (!created) {
        throw new Error('Failed to create student');
    }
    return created;
}
//# sourceMappingURL=join.service.js.map