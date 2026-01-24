import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_DB_PATH = path.join(__dirname, 'db/gymbeauty.db');

console.log('📊 Checking SQLite database...\n');
console.log('   Database path:', SQLITE_DB_PATH);

try {
  const db = new Database(SQLITE_DB_PATH);
  
  console.log('✅ Connected to SQLite database\n');
  
  // Count records
  const membersCount = db.prepare("SELECT COUNT(*) as count FROM members").get().count;
  const usersCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  const checkinsCount = db.prepare("SELECT COUNT(*) as count FROM checkins").get().count;
  const servicesCount = db.prepare("SELECT COUNT(*) as count FROM beauty_services").get().count;
  
  console.log('📈 SQLite Database Statistics:');
  console.log(`   Members: ${membersCount}`);
  console.log(`   Users: ${usersCount}`);
  console.log(`   Checkins: ${checkinsCount}`);
  console.log(`   Beauty Services: ${servicesCount}`);
  console.log(`   Total: ${membersCount + usersCount + checkinsCount + servicesCount} records\n`);
  
  if (membersCount > 0) {
    console.log('📋 Sample members:');
    const members = db.prepare("SELECT id, fullName, qrCodeId FROM members LIMIT 5").all();
    members.forEach(m => {
      console.log(`   - ID: ${m.id}, Name: ${m.fullName || 'N/A'}, QR: ${m.qrCodeId || 'N/A'}`);
    });
  }
  
  db.close();
  console.log('\n✅ SQLite check completed');
  
  if (membersCount === 0) {
    console.log('\n⚠️  No members found in SQLite database. Nothing to sync.');
  } else {
    console.log(`\n💡 Ready to sync ${membersCount} members to Firebase.`);
    console.log('   Run: POST /api/sync');
  }
  
} catch (error) {
  console.error('❌ SQLite error:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}

