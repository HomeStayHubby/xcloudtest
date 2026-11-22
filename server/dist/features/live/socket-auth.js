import { database } from '../../db/database.js';
import { getAsync } from '../../db/promises.js';
// Resolves the logged-in user from the socket's session cookie. The handshake
// shares the express-session cookie (withCredentials), so identity comes from
// the server-side session store — never from the client payload.
export function getSessionIdFromCookieHeader(cookieHeader) {
    if (!cookieHeader) {
        return undefined;
    }
    const raw = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith('connect.sid='));
    if (!raw) {
        return undefined;
    }
    let value = decodeURIComponent(raw.slice('connect.sid='.length));
    if (value.startsWith('s:')) {
        value = value.slice(2);
    }
    const dot = value.lastIndexOf('.');
    if (dot > 0) {
        value = value.slice(0, dot);
    }
    return value || undefined;
}
export async function getSocketUser(socket, sessionStore) {
    const sid = getSessionIdFromCookieHeader(socket.handshake.headers.cookie);
    if (!sid) {
        return undefined;
    }
    const session = await new Promise((resolve) => {
        sessionStore.get(sid, (err, result) => {
            if (err) {
                console.error('Failed to load session for socket', err);
                resolve(undefined);
            }
            else {
                resolve(result ?? undefined);
            }
        });
    });
    if (!session?.userId) {
        return undefined;
    }
    const user = await getAsync(database, 'SELECT id, role, class_id FROM users WHERE id = ? AND is_active = 1', session.userId);
    return user ?? undefined;
}
//# sourceMappingURL=socket-auth.js.map