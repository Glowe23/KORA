# Security

- Never commit `.env`, API keys, bearer tokens, tunnel credentials, databases, or logs.
- Keep `HOST=127.0.0.1`.
- Keep all write switches disabled until controlled testing is complete.
- Set `GLOBAL_WRITE_KILL_SWITCH=true` to block every write path.
- Rotate the MCP bearer token after suspected exposure.
- Rotate the ConnectWise API key pair after suspected exposure.
- Do not reuse another vendor's ConnectWise Developer Client ID.
- Stop if the work network blocks Cloudflare Tunnel. Request the required outbound policy instead of bypassing it.

Report suspected compromise by disabling the tunnel, stopping the server, enabling the global kill switch, and rotating affected credentials before restarting.
