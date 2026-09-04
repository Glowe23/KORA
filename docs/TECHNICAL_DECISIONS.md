# KORA Technical Decisions

## Keep the server loopback-only

**Problem:** A local integration server should not become an accidental network service.

**Decision:** Restrict `HOST` to `127.0.0.1` and allow only configured local/public host values at the MCP boundary.

**Tradeoff:** Remote use requires a separately configured, authenticated tunnel or gateway. That friction is accepted to reduce exposure.

**Status:** Implemented.

## Disable writes by default

**Problem:** AI connectivity can be mistaken for authority.

**Decision:** Require explicit write switches and honor a global kill switch.

**Tradeoff:** Early development is slower and read-only work must precede automation.

**Status:** Implemented policy; no write tools are currently registered.

## Keep audit and idempotency in the foundation

**Problem:** Sensitive operations need traceability and safe retry behavior.

**Decision:** Create SQLite schemas before implementing external write routes.

**Tradeoff:** The schema exists before the full workflow that consumes it.

**Status:** Implemented schema; connector usage is future work.

## Do not guess vendor API behavior

**Problem:** Incorrect routes or authentication assumptions can create unsafe integrations.

**Decision:** Require current official API documentation and valid credentials before implementing ConnectWise routes.

**Status:** Implemented as a project boundary.
