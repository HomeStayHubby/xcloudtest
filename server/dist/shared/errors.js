export class AppError extends Error {
    code;
    statusCode;
    constructor(code, statusCode, message) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}
export function notFound(resource) {
    return new AppError('NOT_FOUND', 404, `${resource} not found`);
}
export function badRequest(message) {
    return new AppError('BAD_REQUEST', 400, message);
}
export function unauthorized(message = 'Unauthorized') {
    return new AppError('UNAUTHORIZED', 401, message);
}
export function forbidden(message = 'Forbidden') {
    return new AppError('FORBIDDEN', 403, message);
}
//# sourceMappingURL=errors.js.map