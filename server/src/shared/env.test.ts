import { describe, it, expect } from 'vitest';
import { assertSqliteFilePath } from './env.js';

describe('assertSqliteFilePath', () => {
  it('accepts relative and absolute SQLite file paths', () => {
    expect(() => assertSqliteFilePath('./data/elitequest.db')).not.toThrow();
    expect(() => assertSqliteFilePath('/var/www/app/data/elitequest.db')).not.toThrow();
    expect(() => assertSqliteFilePath('D:\\data\\elitequest.db')).not.toThrow();
  });

  it('rejects managed-database connection URLs with an actionable message', () => {
    const postgresUrl = 'postgresql://elitequest_user:secret@db.host:5432/elitequest';
    expect(() => assertSqliteFilePath(postgresUrl)).toThrow(/DATABASE_URL/);
    expect(() => assertSqliteFilePath(postgresUrl)).toThrow(postgresUrl);
    expect(() => assertSqliteFilePath('postgres://user@host/db')).toThrow(/No Database/);
    expect(() => assertSqliteFilePath('mysql://user@host/db')).toThrow(/DATABASE_URL/);
    expect(() => assertSqliteFilePath('mongodb://user@host/db')).toThrow(/DATABASE_URL/);
    expect(() => assertSqliteFilePath('mariadb://user@host/db')).toThrow(/DATABASE_URL/);
    expect(() => assertSqliteFilePath('mssql://user@host/db')).toThrow(/DATABASE_URL/);
  });

  it('is case-insensitive about the scheme', () => {
    expect(() => assertSqliteFilePath('POSTGRESQL://user@host/db')).toThrow(/DATABASE_URL/);
  });
});
