import { getUserById } from './auth.service.js';
import { unauthorized, forbidden } from '../../shared/errors.js';
async function loadUser(req) {
    const userId = req.session.userId;
    if (!userId) {
        throw unauthorized('Login required');
    }
    const user = await getUserById(userId);
    if (!user || !user.is_active) {
        throw unauthorized('Login required');
    }
    return user;
}
export async function requireAuth(req, _res, next) {
    try {
        req.user = await loadUser(req);
        next();
    }
    catch (err) {
        next(err);
    }
}
export async function requireLecturer(req, _res, next) {
    try {
        const user = await loadUser(req);
        if (user.role !== 'lecturer') {
            throw forbidden('Lecturer access required');
        }
        req.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
}
export async function requireAdmin(req, _res, next) {
    try {
        const user = await loadUser(req);
        if (user.role !== 'lecturer' || !user.is_admin) {
            throw forbidden('Admin access required');
        }
        req.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
}
export async function requireStudent(req, _res, next) {
    try {
        const user = await loadUser(req);
        if (user.role !== 'student') {
            throw forbidden('Student access required');
        }
        req.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
}
export function getAuthUser(req) {
    const user = req.user;
    if (!user) {
        throw unauthorized('Login required');
    }
    return user;
}
//# sourceMappingURL=auth.middleware.js.map