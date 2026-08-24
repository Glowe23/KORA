import { McpServer } from '@modelcontextprotocol/server';

export const serviceName = 'KORA Operations Integration MCP';
export const serviceVersion = '0.1.0';

export function createKoraMcpServer(): McpServer {
  return new McpServer({ name: serviceName, version: serviceVersion });
}
