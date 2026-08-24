import type { AppConfig } from '../config.js';

export type WriteCapability = 'ticket' | 'purchasing';

export function canWrite(config: AppConfig, capability: WriteCapability): boolean {
  if (config.GLOBAL_WRITE_KILL_SWITCH || !config.WRITE_ACTIONS_ENABLED) return false;
  return capability === 'ticket' ? config.TICKET_WRITES_ENABLED : config.PURCHASING_WRITES_ENABLED;
}
