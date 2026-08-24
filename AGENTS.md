# Repository instructions

- Preserve loopback-only binding unless Gary explicitly authorizes local-network exposure.
- Never commit or log credentials, tokens, authorization headers, tunnel files, or customer data.
- Keep ConnectWise Automate and all write capabilities disabled by default.
- Do not invent ConnectWise routes, fields, or authentication behavior. Use current official documentation.
- Every write must be authorized, idempotent, audited, and independently verified.
- Use mocked ConnectWise responses in automated tests. Never write to production during tests.
- Run `npm run check` before reporting completion.
