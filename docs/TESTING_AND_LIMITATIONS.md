# KORA Testing and Limitations

## Tested in the repository

- Configuration accepts disabled integrations without their credentials.
- Enabling Manage without required fields fails validation.
- Non-loopback binding fails validation.
- Bearer tokens are compared using digests and constant-time comparison.
- Health is public and readiness is protected.
- Unauthenticated MCP requests are rejected.
- Sensitive-looking nested fields are redacted.
- Default write policy denies ticket and purchasing writes.
- The global write kill switch overrides an enabled ticket-write configuration.
- SQLite creates audit and idempotency tables.

## Not yet evidenced

- Live ConnectWise PSA operations.
- Production deployment.
- Cloudflare Tunnel behavior.
- External connector retries and failure recovery.
- Human approval UX or approval persistence.
- Multi-process rate limiting.
- A full end-to-end integration test against a vendor sandbox.

KORA is a secure local foundation. It is not a completed MSP automation platform.
