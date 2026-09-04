# KORA Operations Integration MCP

KORA is a local, governed operations-integration layer built around the Model Context Protocol (MCP). It is intended to help an AI assistant work with operational systems without treating connectivity as permission to change production data.

The problem is practical: important work is spread across ticketing systems, business applications, vendor portals, inboxes, and manual processes. KORA is an experiment in creating a controlled path between those systems and an AI workflow.

## What is implemented

- Streamable HTTP MCP endpoint at `/mcp`
- Minimal public health endpoint at `/health`
- Authenticated readiness endpoint at `/ready`
- Loopback-only binding at `127.0.0.1:8787` by default
- Bearer-token authentication with Host and Origin validation
- Structured logging with secret redaction
- Rate limiting and request-size limits
- SQLite audit-event and idempotency schemas
- Write controls disabled by default
- ConnectWise Automate disabled

ConnectWise PSA tools are intentionally not registered yet. A valid Developer Client ID and current official API documentation are required before those routes can be implemented responsibly.

## Security and governance

KORA separates intelligence from authority. An AI system may identify a problem or recommend an action without having permission to execute it. Read-only access comes before write access, and sensitive writes must be explicitly enabled, authorized, idempotent, audited, and independently verified.

The repository is designed for local operation. Do not commit `.env`, tunnel credentials, databases, logs, or production data. Cloudflare Tunnel and ConnectWise credentials require separate, manual authenticated setup. ConnectWise Automate remains disabled.

## Current status

### Implemented

The local MCP server foundation, request security controls, configuration validation, logging redaction, audit/idempotency schema, and automated security tests are present.

### In development

The integration boundary and test coverage are being refined before any live PSA routes are added.

### Planned

Future work may include narrow, read-only ConnectWise PSA tools, followed by controlled write capabilities only after the API contract, authorization model, and verification workflow are established.

## Local setup

1. Copy `.env.example` to `.env`.
2. Keep `CW_MANAGE_ENABLED=false` until the ConnectWise Client ID is available.
3. Run `scripts/generate-mcp-token.ps1` and place the generated value in `MCP_SERVER_BEARER_TOKEN`.
4. Run `npm install`.
5. Run `npm run check`.
6. Run `npm run build` and `npm start`.

Use the current official ConnectWise documentation when implementing PSA routes. Do not guess routes, fields, or authentication behavior.
