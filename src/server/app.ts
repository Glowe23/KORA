import { randomUUID } from 'node:crypto';
import { createMcpExpressApp } from '@modelcontextprotocol/express';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { createMcpHandler } from '@modelcontextprotocol/server';
import type { NextFunction, Request, Response } from 'express';
import type { Logger } from 'pino';
import type { AppConfig } from '../config.js';
import { enabledIntegrations } from '../config.js';
import { createKoraMcpServer, serviceName, serviceVersion } from '../mcp/server.js';
import { bearerAuthentication } from './authentication.js';
import { rateLimit } from './rate-limit.js';

export function createApp(config: AppConfig, logger: Logger) {
  const startedAt = Date.now();
  const publicHostname = config.PUBLIC_MCP_URL
    ? new URL(config.PUBLIC_MCP_URL).hostname
    : undefined;
  const allowedHosts = ['127.0.0.1', 'localhost', ...(publicHostname ? [publicHostname] : [])];
  const app = createMcpExpressApp({
    host: config.HOST,
    allowedHosts,
    allowedOrigins: allowedHosts,
    jsonLimit: '64kb',
  });
  const authenticate = bearerAuthentication(config.MCP_SERVER_BEARER_TOKEN);
  const limiter = rateLimit();
  const mcpHandler = createMcpHandler(() => createKoraMcpServer(), {
    onerror: (error) => logger.error({ err: error }, 'MCP request failed'),
  });
  const nodeHandler = toNodeHandler(mcpHandler, {
    onerror: (error) => logger.error({ err: error }, 'MCP adapter failed'),
  });

  app.disable('x-powered-by');
  app.use((request: Request, response: Response, next: NextFunction) => {
    const supplied = request.get('x-correlation-id');
    const correlationId =
      supplied && /^[a-zA-Z0-9._:-]{1,100}$/.test(supplied) ? supplied : randomUUID();
    response.set('x-correlation-id', correlationId);
    next();
  });

  app.get('/health', (_request, response) => {
    response.json({
      service: serviceName,
      version: serviceVersion,
      status: 'ok',
      uptime: Math.floor((Date.now() - startedAt) / 1000),
      enabledIntegrations: enabledIntegrations(config),
    });
  });

  app.get('/ready', limiter, authenticate, (_request, response) => {
    response.json({
      status: 'ready',
      configurationValid: true,
      enabledIntegrations: enabledIntegrations(config),
    });
  });

  app.post('/mcp', limiter, authenticate, async (request, response) => {
    await nodeHandler(request, response, request.body);
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    void _next;
    logger.error({ err: error }, 'Unhandled request error');
    if (!response.headersSent) response.status(500).json({ error: 'unexpected_error' });
  });

  return { app, close: () => mcpHandler.close() };
}
