import type { Socket } from 'socket.io';
import type { Store as SessionStore } from 'express-session';
import { database } from '../../db/database.js';
import { getAsync } from '../../db/promises.js';

interface SocketUser {
  id: number;
  role: 'lecturer' | 'student';
  class_id: number | null;
}

// Resolves the logged-in user from the socket's session cookie. The handshake
// shares the express-session cookie (withCredentials), so identity comes from
// the server-side session store — never from the client payload.
export function getSessionIdFromCookieHeader(cookieHeader: string | undefined): string | undefined {
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

export async function getSocketUser(
  socket: Socket,
  sessionStore: SessionStore
): Promise<SocketUser | undefined> {
  const sid = getSessionIdFromCookieHeader(socket.handshake.headers.cookie);
  if (!sid) {
    return undefined;
  }
  const session = await new Promise<{ userId?: number } | undefined>((resolve) => {
    sessionStore.get(sid, (err: unknown, result?: { userId?: number } | null) => {
      if (err) {
        console.error('Failed to load session for socket', err);
        resolve(undefined);
      } else {
        resolve(result ?? undefined);
      }
    });
  });
  if (!session?.userId) {
    return undefined;
  }
  const user = await getAsync<SocketUser>(
    database,
    'SELECT id, role, class_id FROM users WHERE id = ? AND is_active = 1',
    session.userId
  );
  return user ?? undefined;
}
