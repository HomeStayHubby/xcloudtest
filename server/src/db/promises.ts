import type { Database } from 'sqlite3';

export function runAsync(db: Database, sql: string, ...params: unknown[]): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function getAsync<T>(db: Database, sql: string, ...params: unknown[]): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row: T | undefined) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function allAsync<T>(db: Database, sql: string, ...params: unknown[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows: T[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function execAsync(db: Database, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
