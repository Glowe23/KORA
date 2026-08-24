import 'dotenv/config';
import { mkdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { ZodError } from 'zod';
import { openAuditDatabase } from './audit/database.js';
import { loadConfig } from './config.js';
import { createLogger } from './logger.js';
import { createApp } from './server/app.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger(config);
  const dataDirectory = resolve(config.DATA_DIRECTORY);
  mkdirSync(dataDirectory, { recursive: true });
  const auditDatabase = openAuditDatabase(resolve(dataDirectory, 'kora-audit.sqlite3'));
  const { app, close } = createApp(config, logger);
  const httpServer = createServer(app);

  httpServer.requestTimeout = 60_000;
  httpServer.headersTimeout = 65_000;
  httpServer.listen(config.PORT, config.HOST, () => {
    logger.info({ host: config.HOST, port: config.PORT }, 'KORA MCP server started');
  });

  let stopping = false;
  const stop = async (signal: string): Promise<void> => {
    if (stopping) return;
    stopping = true;
    logger.info({ signal }, 'KORA MCP server stopping');
    httpServer.close();
    await close();
    auditDatabase.close();
  };

  process.once('SIGINT', () => void stop('SIGINT'));
  process.once('SIGTERM', () => void stop('SIGTERM'));
}

main().catch((error: unknown) => {
  const message =
    error instanceof ZodError
      ? error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      : ['Startup failed'];
  console.error(message.join('\n'));
  process.exitCode = 1;
});
