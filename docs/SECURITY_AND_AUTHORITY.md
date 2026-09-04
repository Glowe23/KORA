# KORA Security and Authority Model

KORA separates intelligence from authority. Understanding or recommending an action does not grant permission to execute it.

## Verified controls

- `HOST` is restricted to `127.0.0.1`.
- MCP and readiness routes require bearer authentication.
- Host and Origin allowlists are passed to the MCP Express boundary.
- JSON request bodies are limited to 64 KB.
- A process-local rate limiter returns HTTP 429 after its configured threshold.
- Correlation IDs are validated or generated for requests.
- Pino redacts authorization and configured credential fields.
- Recursive redaction protects sensitive-looking object keys.
- SQLite schemas provide audit-event and idempotency storage.
- Write policy is disabled by default and the global kill switch overrides it.
- ConnectWise Automate is rejected as enabled because it is not implemented.

## Authority terms

| Term       | Meaning in KORA                                                   |
| ---------- | ----------------------------------------------------------------- |
| Capability | A code path that could perform an operation.                      |
| Permission | Configuration and policy conditions that allow a capability.      |
| Authority  | Deliberate approval to use that permission for a specific action. |
| Execution  | The actual external side effect.                                  |
| Approval   | The human control that must precede sensitive execution.          |

The current repository implements configuration-level write gates and no external write tools. A complete human approval workflow remains future work and must not be described as implemented.

## Planned architecture

Any future write connector must require explicit authorization, an idempotency key, an audit event, a bounded operation, and independent verification. This is planned architecture, not current functionality.
