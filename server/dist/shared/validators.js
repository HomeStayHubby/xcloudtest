import { z } from 'zod';
export function validate(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        if (!result.success) {
            const message = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
            const error = {
                error: 'VALIDATION_ERROR',
                message,
            };
            next(error);
            return;
        }
        next();
    };
}
export const zodErrorHandler = (err, _req, res, next) => {
    if (err instanceof z.ZodError) {
        const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        res.status(400).json({ error: 'VALIDATION_ERROR', message });
        return;
    }
    next(err);
};
//# sourceMappingURL=validators.js.map