import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errors.js';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

// Simple fixed-window in-memory limiter, keyed by client IP. Enough for a
// single-process VPS deployment; no external store needed.
export function rateLimit(options: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();

  return (req: Request, _res: Response, next: NextFunction): void => {
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
      const error = new AppError(
        'RATE_LIMITED',
        429,
        options.message ?? 'Too many attempts, try again later'
      );
      next(error);
      return;
    }

    next();
  };
}
