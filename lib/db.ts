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
        symbol TEXT NOT NULL,
        type TEXT NOT NULL,
        exchange TEXT NOT NULL,
        date TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL
      )
    `);
  }
  return global._sqliteDb;
}
