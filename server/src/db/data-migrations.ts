import crypto from 'node:crypto';
import { database } from './database.js';
import { runAsync, getAsync, allAsync, execAsync } from './promises.js';
import { hashPassword } from '../features/auth/password.js';

// Some migrations need TypeScript (e.g. bcrypt hashing), which cannot run in
// plain SQL. These run once after the SQL migrations, tracked in their own
// table so they stay idempotent across restarts.

interface DataMigration {
  filename: string;
  description: string;
  run: () => Promise<void>;
}

async function ensureDataMigrationsTable(): Promise<void> {
  await execAsync(
    database,
    `CREATE TABLE IF NOT EXISTS data_migrations (
      filename TEXT PRIMARY KEY,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  );
}

async function isApplied(filename: string): Promise<boolean> {
  const row = await getAsync<{ filename: string }>(
    database,
    'SELECT filename FROM data_migrations WHERE filename = ?',
    filename
  );
  return row !== undefined;
}

function randomPassword(): string {
  return crypto.randomBytes(12).toString('hex');
}

// 008: turn legacy student PINs into bcrypt passwords, give PIN-less students
// a random password (advisor resets), and enforce unique usernames.
const studentAccountCredentials: DataMigration = {
  filename: '008-student-account-credentials',
  description: 'Hash legacy student PINs into passwords; enforce unique usernames',
  run: async () => {
    const columns = await allAsync<{ name: string }>(database, 'PRAGMA table_info(users)');
    const hasLegacyPin = columns.some((c) => c.name === 'legacy_pin');

    if (hasLegacyPin) {
      const pending = await allAsync<{ id: number; legacy_pin: string | null }>(
        database,
        "SELECT id, legacy_pin FROM users WHERE role = 'student' AND legacy_pin IS NOT NULL"
      );
      for (const row of pending) {
        const pin = row.legacy_pin ?? '';
        const password = pin.trim().length >= 4 ? pin.trim() : randomPassword();
        const hash = await hashPassword(password);
        await runAsync(
          database,
          'UPDATE users SET password_hash = ?, legacy_pin = NULL WHERE id = ?',
          hash,
          row.id
        );
      }

      const empty = await allAsync<{ id: number }>(
        database,
        "SELECT id FROM users WHERE role = 'student' AND password_hash = ''"
      );
      for (const row of empty) {
        const hash = await hashPassword(randomPassword());
        await runAsync(database, 'UPDATE users SET password_hash = ? WHERE id = ?', hash, row.id);
      }

      await execAsync(database, 'ALTER TABLE users DROP COLUMN legacy_pin');
    }

    // Dedupe usernames case-insensitively, keeping the lowest user id.
    const dupes = await allAsync<{ username: string }>(
      database,
      `SELECT username FROM users
       WHERE role = 'student' AND username IS NOT NULL
       GROUP BY username COLLATE NOCASE HAVING COUNT(*) > 1`
    );
    for (const { username } of dupes) {
      const rows = await allAsync<{ id: number }>(
        database,
        "SELECT id FROM users WHERE role = 'student' AND username = ? COLLATE NOCASE ORDER BY id",
        username
      );
      for (let i = 1; i < rows.length; i++) {
        await runAsync(
          database,
          'UPDATE users SET username = ? WHERE id = ?',
          `${username}-${rows[i].id}`,
          rows[i].id
        );
      }
    }

    await execAsync(
      database,
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username COLLATE NOCASE)'
    );
  },
};

const DATA_MIGRATIONS: DataMigration[] = [studentAccountCredentials];

export async function runDataMigrations(): Promise<string[]> {
  await ensureDataMigrationsTable();
  const applied: string[] = [];
  for (const migration of DATA_MIGRATIONS) {
    if (await isApplied(migration.filename)) {
      continue;
    }
    await migration.run();
    await runAsync(database, 'INSERT INTO data_migrations (filename) VALUES (?)', migration.filename);
    applied.push(migration.filename);
  }
  return applied;
}
