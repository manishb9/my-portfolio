import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

declare global {
  var _sqliteDb: Database | undefined;
}

export async function getDb(): Promise<Database> {
  if (!global._sqliteDb) {
    global._sqliteDb = await open({
      filename: './portfolio.db',
      driver: sqlite3.Database
    });

    await global._sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        script TEXT,
        date TEXT,
        qty INTEGER,
        price REAL,
        amount REAL,
        holding_days INTEGER,
        tax REAL,
        remark TEXT
      )
    `);
  }
  return global._sqliteDb;
}
