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

const baseEnv = envSchema.parse(process.env);

const DATA_DIR = path.join(projectRoot, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

export const env = {
  ...baseEnv,
  PROJECT_ROOT: projectRoot,
  DATA_DIR,
  CLIENT_DIST: path.join(projectRoot, 'client', 'dist'),
};
