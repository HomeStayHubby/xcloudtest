import type { Request, Response, NextFunction } from 'express';
import type { User } from '@elitequest/shared';
export declare function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function requireLecturer(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function requireAdmin(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function requireStudent(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function getAuthUser(req: Request): User;
//# sourceMappingURL=auth.middleware.d.ts.map