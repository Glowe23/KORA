import { createHash, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

function digest(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

export function tokensMatch(candidate: string, expected: string): boolean {
  return timingSafeEqual(digest(candidate), digest(expected));
}

export function bearerAuthentication(expectedToken: string) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const header = request.get('authorization');
    const match = /^Bearer\s+(.+)$/i.exec(header ?? '');

    if (!match?.[1] || !tokensMatch(match[1], expectedToken)) {
      response.set('WWW-Authenticate', 'Bearer');
      response.status(401).json({ error: 'unauthorized' });
      return;
    }

    request.auth = { token: match[1], clientId: 'kora', scopes: ['mcp'] };
    next();
  };
}
