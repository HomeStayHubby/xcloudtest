import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errors.js';
export declare function errorHandler(err: Error | AppError, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=error-handler.d.ts.map