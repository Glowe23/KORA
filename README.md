# KORA Operations Integration MCP

Secure, locally hosted Model Context Protocol server for KORA operations integrations.

Current milestone:

- MCP Streamable HTTP endpoint at `/mcp`
- Public minimal health endpoint at `/health`
- Authenticated readiness endpoint at `/ready`
- Loopback-only binding
- Bearer-token authentication
- Host and Origin validation
- Structured logging with secret redaction
- Rate limiting and request-size limits
- SQLite audit and idempotency schema
- Write controls disabled by default
- ConnectWise Automate disabled

ConnectWise PSA tools are intentionally not registered yet. A valid Developer Client ID and access to the current gated ConnectWise API documentation are required before those routes are implemented.

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `CW_MANAGE_ENABLED=false` until the ConnectWise Client ID is available.
3. Run `scripts/generate-mcp-token.ps1` and paste the clipboard value into `MCP_SERVER_BEARER_TOKEN` in `.env`.
4. Run `npm install`.
5. Run `npm run check`.
6. Run `npm run build` and `npm start`.

The server binds only to `127.0.0.1:8787` by default. Do not commit `.env`, tunnel credentials, databases, or logs.

## Deployment boundary

Cloudflare Tunnel and ConnectWise credentials require manual authenticated setup. The tunnel must use a named stable hostname and route only to `http://127.0.0.1:8787`.
