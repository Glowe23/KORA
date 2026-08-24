import { once } from 'node:events';
import { createServer } from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';
import { createLogger } from '../src/logger.js';
import { createApp } from '../src/server/app.js';
import { tokensMatch } from '../src/server/authentication.js';
import { testConfig } from './helpers.js';

const openServers: ReturnType<typeof createServer>[] = [];

afterEach(async () => {
  await Promise.all(
    openServers
      .splice(0)
      .map((server) => new Promise<void>((resolve) => server.close(() => resolve()))),
  );
});

async function startTestServer() {
  const config = testConfig({ LOG_LEVEL: 'silent' });
  const service = createApp(config, createLogger(config));
  const server = createServer(service.app).listen(0, '127.0.0.1');
  openServers.push(server);
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind');
  return { baseUrl: `http://127.0.0.1:${address.port}`, config, closeHandler: service.close };
}

describe('authentication', () => {
  it('compares bearer tokens safely', () => {
    expect(tokensMatch('same', 'same')).toBe(true);
    expect(tokensMatch('short', 'different-length-value')).toBe(false);
  });

  it('keeps health public and readiness private', async () => {
    const { baseUrl, config, closeHandler } = await startTestServer();

    const health = await fetch(`${baseUrl}/health`);
    expect(health.status).toBe(200);
    expect(Object.keys(await health.json()).sort()).toEqual(
      ['enabledIntegrations', 'service', 'status', 'uptime', 'version'].sort(),
    );

    expect((await fetch(`${baseUrl}/ready`)).status).toBe(401);
    expect(
      (
        await fetch(`${baseUrl}/ready`, {
          headers: { Authorization: `Bearer ${config.MCP_SERVER_BEARER_TOKEN}` },
        })
      ).status,
    ).toBe(200);
    await closeHandler();
  });

  it('rejects unauthenticated MCP requests', async () => {
    const { baseUrl, closeHandler } = await startTestServer();
    expect(
      (
        await fetch(`${baseUrl}/mcp`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{}',
        })
      ).status,
    ).toBe(401);
    await closeHandler();
  });
});
