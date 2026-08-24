import pino, { type Logger } from 'pino';
import type { AppConfig } from './config.js';

const redactedPaths = [
  'authorization',
  'headers.authorization',
  'req.headers.authorization',
  '*.MCP_SERVER_BEARER_TOKEN',
  '*.CW_MANAGE_PUBLIC_KEY',
  '*.CW_MANAGE_PRIVATE_KEY',
  '*.CW_MANAGE_CLIENT_ID',
  '*.CW_AUTOMATE_CLIENT_SECRET',
];

export function createLogger(config: Pick<AppConfig, 'LOG_LEVEL'>): Logger {
  return pino({
    level: config.LOG_LEVEL,
    redact: { paths: redactedPaths, censor: '[REDACTED]' },
  });
}
