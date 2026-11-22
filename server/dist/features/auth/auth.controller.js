import { authenticateUser, getUserById } from './auth.service.js';
import { toPublicUser } from '../../shared/user-serialize.js';
import { loginUserSchema } from '@elitequest/shared';
import { unauthorized } from '../../shared/errors.js';
export async function login(req, res, next) {
    try {
        const input = loginUserSchema.parse(req.body);
        const user = await authenticateUser(input);
        req.session.userId = user.id;
        res.json({ data: { user: toPublicUser(user) } });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export function logout(req, res, next) {
    req.session.destroy((err) => {
        if (err) {
            next(err);
            return;
        }
        res.json({ data: null });
    });
}
export async function me(req, res, next) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            throw unauthorized('No active session');
        }
        const user = await getUserById(userId);
        if (!user) {
            throw unauthorized('No active session');
        }
        res.json({ data: toPublicUser(user) });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
//# sourceMappingURL=auth.controller.js.map