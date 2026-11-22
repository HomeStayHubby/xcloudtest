import type { Request, Response, NextFunction } from 'express';
import { type AnyZodObject } from 'zod';
export declare function validate(schema: AnyZodObject): (req: Request, _res: Response, next: NextFunction) => void;
export declare const zodErrorHandler: (err: unknown, _req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validators.d.ts.map