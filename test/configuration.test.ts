import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';
import { testConfig } from './helpers.js';

describe('configuration', () => {
  it('accepts disabled integrations without their credentials', () => {
    expect(testConfig().CW_MANAGE_ENABLED).toBe(false);
  });

  it('requires Manage credentials when enabled', () => {
    expect(() =>
      loadConfig({ MCP_SERVER_BEARER_TOKEN: 'x'.repeat(32), CW_MANAGE_ENABLED: 'true' }),
    ).toThrow();
  });

  it('rejects non-loopback binding', () => {
    expect(() => testConfig({ HOST: '0.0.0.0' })).toThrow();
  });
});
