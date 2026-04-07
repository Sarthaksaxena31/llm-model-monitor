import sqlite3 from 'sqlite3';
import { type Database } from 'sqlite';
export declare function getDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>>;
export declare function initDb(): Promise<void>;
//# sourceMappingURL=schema.d.ts.map