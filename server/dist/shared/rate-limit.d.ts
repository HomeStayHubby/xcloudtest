import type { Request, Response, NextFunction } from 'express';
interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
}
export declare function rateLimit(options: RateLimitOptions): (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=rate-limit.d.ts.map