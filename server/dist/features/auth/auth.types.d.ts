import type { Request } from 'express';
import type { User } from '@elitequest/shared';
export type AuthRequest = Request & {
    session: Express.Session & {
        userId?: number;
    };
};
export type SessionUser = User;
//# sourceMappingURL=auth.types.d.ts.map