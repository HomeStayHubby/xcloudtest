import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Resolve the project root from this file's location so relative paths work
// no matter which directory the process is started from (tsx source or built dist).
const fileDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(fileDir, '..', '..', '..');

dotenv.config({ path: path.join(projectRoot, '.env') });

function toAbsoluteMaybe(p: string): string {
  return path.isAbsolute(p) ? p : path.join(projectRoot, p);
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  DATABASE_URL: z.string().default('./data/elitequest.db').transform(toAbsoluteMaybe),
  SESSION_SECRET: z.string().min(16).default('change-me-in-production-secret'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  // Bootstrap fallbacks for the AI generation feature. The admin-managed
  // settings (app_settings table) take precedence when set.
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_MODEL: z.string().min(1).optional(),
});

// ELITEQuest stores data in SQLite (a file path), not a database server.
// Hosting panels inject a DATABASE_URL connection string (e.g. a postgres://
// URL) when a managed database is attached to the site, and sqlite3 would
// only fail later with a cryptic SQLITE_CANTOPEN. Fail fast instead, naming
// the variable and value so the fix is obvious.
const NON_SQLITE_DB_SCHEMES = [
  'postgres://',
  'postgresql://',
  'mysql://',
  'mariadb://',
  'mongodb://',
  'mssql://',
];

export function assertSqliteFilePath(value: string): void {
  const lowered = value.toLowerCase();
  if (NON_SQLITE_DB_SCHEMES.some((scheme) => lowered.startsWith(scheme))) {
    throw new Error(
      `DATABASE_URL must be a SQLite file path, but it is set to a database connection URL ("${value}"). ` +
        'Set the hosting panel\'s database option to "No Database", or set DATABASE_URL to a file path such as ./data/elitequest.db.'
    );
  }
}

assertSqliteFilePath(process.env.DATABASE_URL ?? './data/elitequest.db');

const baseEnv = envSchema.parse(process.env);

const DATA_DIR = path.join(projectRoot, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

export const env = {
  ...baseEnv,
  PROJECT_ROOT: projectRoot,
  DATA_DIR,
  CLIENT_DIST: path.join(projectRoot, 'client', 'dist'),
};
