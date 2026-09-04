# KORA Data Flow

```mermaid
sequenceDiagram
  participant C as Local client
  participant H as HTTP boundary
  participant A as Authentication and limits
  participant M as MCP handler
  participant P as Policy
  participant D as SQLite foundation
  C->>H: POST /mcp
  H->>A: Validate host, origin, size, rate, bearer token
  A->>M: Accepted request
  M->>P: Resolve operation capability
  P->>D: Record or reserve audit/idempotency state
  P-->>M: Allow, deny, or no registered tool
  M-->>C: MCP response
```

The current code has no registered ConnectWise tools. The diagram shows the implemented local request boundary and the audit/policy boundary without claiming an external data exchange.

The public `/health` route reports service metadata and enabled integration names. The `/ready` route is authenticated. Both routes are separate from MCP operation execution.
