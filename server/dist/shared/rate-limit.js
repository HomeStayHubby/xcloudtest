import { AppError } from './errors.js';
// Simple fixed-window in-memory limiter, keyed by client IP. Enough for a
// single-process VPS deployment; no external store needed.
export function rateLimit(options) {
    const buckets = new Map();
    return (req, _res, next) => {
        const key = req.ip ?? 'unknown';
        const now = Date.now();
        // Lazily prune expired buckets so the map cannot grow unbounded.
        if (buckets.size > 1000) {
            for (const [k, bucket] of buckets) {
                if (bucket.resetAt <= now) {
                    buckets.delete(k);
                }
            }
        }
        const bucket = buckets.get(key);
        if (!bucket || bucket.resetAt <= now) {
            buckets.set(key, { count: 1, resetAt: now + options.windowMs });
            next();
            return;
        }
        bucket.count += 1;
        if (bucket.count > options.max) {
            const error = new AppError('RATE_LIMITED', 429, options.message ?? 'Too many attempts, try again later');
            next(error);
            return;
        }
        next();
    };
}
//# sourceMappingURL=rate-limit.js.map