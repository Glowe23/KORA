const secretName =
  /(authorization|token|password|private.?key|public.?key|client.?secret|client.?id)/i;

export function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      secretName.test(key) ? '[REDACTED]' : redactSecrets(item),
    ]),
  );
}
