import { database } from '../../db/database.js';
import { getAsync } from '../../db/promises.js';
import { verifyPassword } from './password.js';
import { unauthorized } from '../../shared/errors.js';
export async function getUserById(id) {
    const row = await getAsync(database, 'SELECT * FROM users WHERE id = ?', id);
    return row;
}
export async function authenticateUser(input) {
    const identifier = input.identifier.trim();
    const user = await getAsync(database, 'SELECT * FROM users WHERE (email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE) AND is_active = 1', identifier, identifier);
    if (!user) {
        throw unauthorized('Invalid identifier or password');
    }
    const valid = await verifyPassword(input.password, user.password_hash);
    if (!valid) {
        throw unauthorized('Invalid identifier or password');
    }
    return user;
}
//# sourceMappingURL=auth.service.js.map