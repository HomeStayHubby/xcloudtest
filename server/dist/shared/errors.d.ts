export declare class AppError extends Error {
    code: string;
    statusCode: number;
    constructor(code: string, statusCode: number, message: string);
}
export declare function notFound(resource: string): AppError;
export declare function badRequest(message: string): AppError;
export declare function unauthorized(message?: string): AppError;
export declare function forbidden(message?: string): AppError;
//# sourceMappingURL=errors.d.ts.map