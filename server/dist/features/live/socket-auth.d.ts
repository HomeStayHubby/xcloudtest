import type { Socket } from 'socket.io';
import type { Store as SessionStore } from 'express-session';
interface SocketUser {
    id: number;
    role: 'lecturer' | 'student';
    class_id: number | null;
}
export declare function getSessionIdFromCookieHeader(cookieHeader: string | undefined): string | undefined;
export declare function getSocketUser(socket: Socket, sessionStore: SessionStore): Promise<SocketUser | undefined>;
export {};
//# sourceMappingURL=socket-auth.d.ts.map