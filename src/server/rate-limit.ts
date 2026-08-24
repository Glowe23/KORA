import type { NextFunction, Request, Response } from 'express';

interface Counter {
  count: number;
  resetAt: number;
}

export function rateLimit(windowMs = 60_000, maximum = 120) {
  const counters = new Map<string, Counter>();

  return (request: Request, response: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = request.ip || 'local';
    const current = counters.get(key);
    const counter =
      !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    counter.count += 1;
    counters.set(key, counter);

    response.set('RateLimit-Limit', String(maximum));
    response.set('RateLimit-Remaining', String(Math.max(0, maximum - counter.count)));

    if (counter.count > maximum) {
      response.status(429).json({ error: 'rate_limited' });
      return;
    }

    next();
  };
}
