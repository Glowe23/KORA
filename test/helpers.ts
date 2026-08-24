import type { AppConfig } from '../src/config.js';
import { loadConfig } from '../src/config.js';

export function testConfig(overrides: NodeJS.ProcessEnv = {}): AppConfig {
  return loadConfig({
    NODE_ENV: 'test',
    HOST: '127.0.0.1',
    PORT: '8787',
    MCP_SERVER_BEARER_TOKEN: 'test-token-that-is-at-least-thirty-two-characters',
    CW_MANAGE_ENABLED: 'false',
    CW_AUTOMATE_ENABLED: 'false',
    WRITE_ACTIONS_ENABLED: 'false',
    TICKET_WRITES_ENABLED: 'false',
    PURCHASING_WRITES_ENABLED: 'false',
    GLOBAL_WRITE_KILL_SWITCH: 'false',
    ...overrides,
  });
}
