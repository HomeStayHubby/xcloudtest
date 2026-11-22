import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errors.js';
import type { ApiErrorResponse } from '@elitequest/shared';

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
  const message = err.message || 'Something went wrong';

  const response: ApiErrorResponse = {
    error: code,
    message,
  };

  res.status(statusCode).json(response);
}
