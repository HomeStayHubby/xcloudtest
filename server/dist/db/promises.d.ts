import type { Database } from 'sqlite3';
export declare function runAsync(db: Database, sql: string, ...params: unknown[]): Promise<void>;
export declare function getAsync<T>(db: Database, sql: string, ...params: unknown[]): Promise<T | undefined>;
export declare function allAsync<T>(db: Database, sql: string, ...params: unknown[]): Promise<T[]>;
export declare function execAsync(db: Database, sql: string): Promise<void>;
//# sourceMappingURL=promises.d.ts.map