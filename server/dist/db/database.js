import sqlite3 from 'sqlite3';
import { env } from '../shared/env.js';
const database = new sqlite3.Database(env.DATABASE_URL, (err) => {
    if (err) {
        console.error('Failed to open database', err);
    }
    else {
        console.log('Database opened:', env.DATABASE_URL);
    }
});
database.run('PRAGMA journal_mode = WAL');
database.run('PRAGMA foreign_keys = ON');
export { database };
//# sourceMappingURL=database.js.map