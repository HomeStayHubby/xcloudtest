export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFound(resource: string): AppError {
  return new AppError('NOT_FOUND', 404, `${resource} not found`);
}

export function badRequest(message: string): AppError {
  return new AppError('BAD_REQUEST', 400, message);
}

export function unauthorized(message = 'Unauthorized'): AppError {
  return new AppError('UNAUTHORIZED', 401, message);
}

export function forbidden(message = 'Forbidden'): AppError {
  return new AppError('FORBIDDEN', 403, message);
}
