import type { Request, Response, NextFunction } from 'express';
import { z, type AnyZodObject } from 'zod';
import type { ApiErrorResponse } from '@elitequest/shared';

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const message = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      const error: ApiErrorResponse = {
        error: 'VALIDATION_ERROR',
        message,
      };
      next(error);
      return;
    }

    next();
  };
}

export const zodErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof z.ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json({ error: 'VALIDATION_ERROR', message });
    return;
  }
  next(err);
};
