import { z } from 'zod';

const booleanValue = z.enum(['true', 'false']).transform((value) => value === 'true');

const optionalUrl = z.union([z.literal(''), z.url()]).transform((value) => value || undefined);
const optionalString = z.string().transform((value) => value.trim() || undefined);
const optionalMoney = z
  .union([z.literal(''), z.coerce.number().positive()])
  .transform((value) => value || undefined);

const configSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
    HOST: z.literal('127.0.0.1').default('127.0.0.1'),
    PORT: z.coerce.number().int().min(1).max(65535).default(8787),
    PUBLIC_MCP_URL: optionalUrl.optional(),
    MCP_SERVER_BEARER_TOKEN: z.string().min(32),
    DATA_DIRECTORY: z.string().min(1).default('./data'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),

    CW_MANAGE_ENABLED: booleanValue.default(false),
    CW_MANAGE_BASE_URL: optionalUrl.optional(),
    CW_MANAGE_COMPANY_ID: optionalString.optional(),
    CW_MANAGE_PUBLIC_KEY: optionalString.optional(),
    CW_MANAGE_PRIVATE_KEY: optionalString.optional(),
    CW_MANAGE_CLIENT_ID: optionalString.optional(),
    CW_MANAGE_API_VERSION: optionalString.optional(),
    CW_MANAGE_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(30000),
    CW_MANAGE_MAX_RESULTS: z.coerce.number().int().min(1).max(250).default(100),

    WRITE_ACTIONS_ENABLED: booleanValue.default(false),
    TICKET_WRITES_ENABLED: booleanValue.default(false),
    PURCHASING_WRITES_ENABLED: booleanValue.default(false),
    MAX_PURCHASE_AMOUNT: optionalMoney.optional(),
    GLOBAL_WRITE_KILL_SWITCH: booleanValue.default(false),

    CW_AUTOMATE_ENABLED: booleanValue.default(false),
    CW_AUTOMATE_BASE_URL: optionalUrl.optional(),
    CW_AUTOMATE_CLIENT_ID: optionalString.optional(),
    CW_AUTOMATE_CLIENT_SECRET: optionalString.optional(),
  })
  .superRefine((config, context) => {
    if (config.CW_MANAGE_ENABLED) {
      for (const field of [
        'CW_MANAGE_BASE_URL',
        'CW_MANAGE_COMPANY_ID',
        'CW_MANAGE_PUBLIC_KEY',
        'CW_MANAGE_PRIVATE_KEY',
        'CW_MANAGE_CLIENT_ID',
        'CW_MANAGE_API_VERSION',
      ] as const) {
        if (!config[field]) {
          context.addIssue({
            code: 'custom',
            path: [field],
            message: 'Required when Manage is enabled',
          });
        }
      }
    }

    if (config.CW_AUTOMATE_ENABLED) {
      context.addIssue({
        code: 'custom',
        path: ['CW_AUTOMATE_ENABLED'],
        message: 'ConnectWise Automate is not implemented and must remain disabled',
      });
    }

    if (config.PURCHASING_WRITES_ENABLED && !config.MAX_PURCHASE_AMOUNT) {
      context.addIssue({
        code: 'custom',
        path: ['MAX_PURCHASE_AMOUNT'],
        message: 'Required when purchasing writes are enabled',
      });
    }
  });

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse(environment);
}

export function enabledIntegrations(config: AppConfig): string[] {
  return [
    config.CW_MANAGE_ENABLED && 'connectwise-manage',
    config.CW_AUTOMATE_ENABLED && 'connectwise-automate',
  ].filter((value): value is string => Boolean(value));
}
