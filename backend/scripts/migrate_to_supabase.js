import 'dotenv/config';
import Database from 'better-sqlite3';
import supabase from '../db/supabase.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_DB_PATH = path.join(__dirname, '../db/gymbeauty.db');
const db = new Database(SQLITE_DB_PATH);

async function migrateTable(tableName) {
    console.log(`🚀 Migrating table: ${tableName}...`);
    try {
        const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
        console.log(`📊 Found ${rows.length} rows in ${tableName}`);

        if (rows.length === 0) {
            console.log(`⚠️ No data to migrate for ${tableName}`);
            return;
        }

        // Lowercase keys to match Supabase schema
        const lowercasedRows = rows.map(row => {
            const newRow = {};
            for (const key of Object.keys(row)) {
                newRow[key.toLowerCase()] = row[key];
            }
            return newRow;
        });

        // Supabase insert
        const { error } = await supabase.from(tableName).insert(lowercasedRows);

        if (error) {
            console.error(`❌ Error migrating ${tableName}:`, error.message);
        } else {
            console.log(`✅ Successfully migrated ${tableName}!`);
        }
    } catch (err) {
        console.error(`❌ Failed to migrate ${tableName}:`, err.message);
    }
}

async function startMigration() {
    console.log('🏁 Starting migration from SQLite to Supabase...');

    const tables = [
        'members',
        'checkins',
        'beauty_services',
        'beauty_health_info',
        'gym_info',
        'gym_payments',
        'gym_memberships',
        'users'
    ];

    for (const table of tables) {
        await migrateTable(table);
    }

    console.log('🏁 Migration finished!');
    process.exit(0);
}

startMigration();
