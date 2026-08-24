import { describe, expect, it } from 'vitest';
import { openAuditDatabase } from '../src/audit/database.js';

describe('audit database', () => {
  it('creates audit and idempotency tables', () => {
    const database = openAuditDatabase(':memory:');
    const names = database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((row) => (row as { name: string }).name);
    expect(names).toContain('audit_events');
    expect(names).toContain('idempotency_records');
    database.close();
  });
});
