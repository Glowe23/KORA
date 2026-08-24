import { describe, expect, it } from 'vitest';
import { canWrite } from '../src/authorization/policy.js';
import { redactSecrets } from '../src/security/redaction.js';
import { testConfig } from './helpers.js';

describe('security controls', () => {
  it('redacts nested secrets', () => {
    expect(
      redactSecrets({
        body: { privateKey: 'secret', summary: 'safe' },
        authorization: 'Bearer secret',
      }),
    ).toEqual({
      body: { privateKey: '[REDACTED]', summary: 'safe' },
      authorization: '[REDACTED]',
    });
  });

  it('disables writes by default', () => {
    const config = testConfig();
    expect(canWrite(config, 'ticket')).toBe(false);
    expect(canWrite(config, 'purchasing')).toBe(false);
  });

  it('makes the global kill switch override enabled ticket writes', () => {
    const config = testConfig({
      WRITE_ACTIONS_ENABLED: 'true',
      TICKET_WRITES_ENABLED: 'true',
      GLOBAL_WRITE_KILL_SWITCH: 'true',
    });
    expect(canWrite(config, 'ticket')).toBe(false);
  });
});
