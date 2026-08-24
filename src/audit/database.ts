import Database from 'better-sqlite3';

export function openAuditDatabase(path: string): Database.Database {
  const database = new Database(path);
  database.pragma('journal_mode = WAL');
  database.exec(`
    CREATE TABLE IF NOT EXISTS audit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp_utc TEXT NOT NULL,
      correlation_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      customer_id TEXT,
      target_type TEXT,
      target_id TEXT,
      decision TEXT NOT NULL,
      result TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS idempotency_records (
      namespace TEXT NOT NULL,
      idempotency_key TEXT NOT NULL,
      request_fingerprint TEXT NOT NULL,
      status TEXT NOT NULL,
      result_summary TEXT,
      created_utc TEXT NOT NULL,
      updated_utc TEXT NOT NULL,
      PRIMARY KEY (namespace, idempotency_key)
    );
  `);
  return database;
}
