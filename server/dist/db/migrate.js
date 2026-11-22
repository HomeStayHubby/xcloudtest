import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { database } from './database.js';
import { runAsync, allAsync, execAsync } from './promises.js';
import { env } from '../shared/env.js';
import { runDataMigrations } from './data-migrations.js';
const MIGRATIONS_DIR = path.join(env.PROJECT_ROOT, 'server', 'src', 'db', 'migrations');
async function initMigrationsTable() {
    await execAsync(database, `
    CREATE TABLE IF NOT EXISTS migrations (
      filename TEXT PRIMARY KEY,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
async function getAppliedMigrations() {
    const rows = await allAsync(database, 'SELECT filename FROM migrations');
    return new Set(rows.map((row) => row.filename));
}
// The sqlite3 driver's batched exec() is unreliable with long DDL sequences
// (statements fail depending on preceding migrations), so each migration file
// is split into single statements and executed in order. Migration SQL is
// plain DDL/DML: full-line -- comments, no semicolons inside string literals.
export function splitSqlStatements(sql) {
    const withoutComments = sql
        .split('\n')
        .filter((line) => !line.trimStart().startsWith('--'))
        .join('\n');
    const statements = [];
    let current = '';
    let inString = false;
    for (const char of withoutComments) {
        if (char === "'") {
            inString = !inString;
        }
        if (char === ';' && !inString) {
            const statement = current.trim();
            if (statement.length > 0) {
                statements.push(statement);
            }
            current = '';
        }
        else {
            current += char;
        }
    }
    const last = current.trim();
    if (last.length > 0) {
        statements.push(last);
    }
    return statements;
}
async function applyMigration(filename) {
    const filepath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filepath, 'utf-8');
    const statements = splitSqlStatements(sql);
    // Table-rebuild migrations need foreign keys disabled. The pragma is a
    // no-op inside a transaction, so it is toggled outside — per SQLite's
    // documented rebuild procedure. Row integrity is verified with
    // PRAGMA foreign_key_check before the transaction commits.
    await execAsync(database, 'PRAGMA foreign_keys = OFF');
    await execAsync(database, 'BEGIN TRANSACTION');
    try {
        for (const statement of statements) {
            await runAsync(database, statement);
        }
        const violations = await allAsync(database, 'PRAGMA foreign_key_check');
        if (violations.length > 0) {
            throw new Error(`foreign_key_check failed after ${filename}: ${JSON.stringify(violations.slice(0, 10))}`);
        }
        await runAsync(database, 'INSERT INTO migrations (filename) VALUES (?)', filename);
        await execAsync(database, 'COMMIT');
    }
    catch (err) {
        await execAsync(database, 'ROLLBACK');
        throw err;
    }
    finally {
        await execAsync(database, 'PRAGMA foreign_keys = ON');
    }
}
export async function runMigrations() {
    await initMigrationsTable();
    const applied = await getAppliedMigrations();
    const files = fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((name) => name.endsWith('.sql'))
        .sort();
    const newlyApplied = [];
    for (const file of files) {
        if (!applied.has(file)) {
            await applyMigration(file);
            newlyApplied.push(file);
        }
    }
    // TypeScript data migrations (e.g. bcrypt-hashing legacy PINs) run after the
    // SQL schema migrations.
    const dataApplied = await runDataMigrations();
    newlyApplied.push(...dataApplied);
    return newlyApplied;
}
// Compare resolved file URLs so the CLI entry point also matches on Windows,
// where import.meta.url uses file:///C:/... but process.argv[1] is a drive path.
const invokedAsScript = process.argv[1] !== undefined &&
    import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedAsScript) {
    runMigrations()
        .then((applied) => {
        if (applied.length > 0) {
            console.log('Applied migrations:', applied.join(', '));
        }
        else {
            console.log('No new migrations to apply.');
        }
    })
        .catch((err) => {
        console.error('Migration failed:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=migrate.js.map