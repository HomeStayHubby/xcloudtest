import { AppError } from './errors.js';
export function errorHandler(err, _req, res, _next) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
    const message = err.message || 'Something went wrong';
    const response = {
        error: code,
        message,
    };
    res.status(statusCode).json(response);
}
//# sourceMappingURL=error-handler.js.map