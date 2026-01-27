import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_DB_PATH = path.join(__dirname, '../db/gymbeauty.db');
const db = new Database(SQLITE_DB_PATH);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

for (const table of tables) {
    console.log(`\n--- Table: ${table.name} ---`);
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
    columns.forEach(col => {
        console.log(`${col.name} (${col.type})`);
    });
}
