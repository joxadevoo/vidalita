import Database from "better-sqlite3";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_DB_PATH = path.join(__dirname, 'db/gymbeauty.db');

console.log('🔄 Testing direct sync from SQLite to Firebase...\n');

// Firebase initialization
let firebaseApp = null;
let firestore = null;

async function initializeFirebase() {
  if (!firebaseApp) {
    const serviceAccountPath = path.join(__dirname, 'config/firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey
          })
        });
      } else {
        throw new Error('Firebase configuration not found');
      }
    }

    firestore = admin.firestore();
    firestore.settings({
      ignoreUndefinedProperties: true
    });
  }
  return firestore;
}

function convertToFirestore(data) {
  const doc = {};
  const FIRESTORE_MAX_STRING_LENGTH = 1048487; // ~1MB limit for Firestore strings
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      continue;
    }
    
    // Photo field'ni o'tkazib yuboramiz, chunki u juda katta bo'lishi mumkin
    if (key === 'photo' && typeof value === 'string' && value.length > FIRESTORE_MAX_STRING_LENGTH) {
      console.warn(`   ⚠️  Skipping photo field for member ${data.id || 'unknown'} (too large: ${value.length} bytes)`);
      continue;
    }
    
    if (typeof value === 'string') {
      // Check for very long strings
      if (value.length > FIRESTORE_MAX_STRING_LENGTH) {
        console.warn(`   ⚠️  Skipping field "${key}" (too large: ${value.length} bytes)`);
        continue;
      }
      
      const datePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?/;
      if (datePattern.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          doc[key] = admin.firestore.Timestamp.fromDate(date);
        } else {
          doc[key] = value;
        }
      } else {
        doc[key] = value;
      }
    } else if (typeof value === 'number') {
      if (isNaN(value) || !isFinite(value)) {
        continue;
      }
      doc[key] = value;
    } else if (typeof value === 'boolean') {
      doc[key] = value;
    } else {
      doc[key] = value;
    }
  }
  return doc;
}

async function testSync() {
  try {
    console.log('📡 Step 1: Connecting to SQLite...');
    const sqliteDb = new Database(SQLITE_DB_PATH);
    console.log('✅ Connected to SQLite');
    
    console.log('\n📡 Step 2: Connecting to Firebase...');
    const db = await initializeFirebase();
    console.log('✅ Connected to Firebase');
    
    console.log('\n📡 Step 3: Reading members from SQLite...');
    const members = sqliteDb.prepare('SELECT * FROM members').all();
    console.log(`✅ Found ${members.length} members in SQLite`);
    
    if (members.length === 0) {
      console.log('\n⚠️  No members to sync');
      sqliteDb.close();
      return;
    }
    
    console.log('\n📡 Step 4: Syncing members to Firebase...');
    let synced = 0;
    let errors = 0;
    
    for (const member of members) {
      try {
        const memberId = member.id.toString();
        const docRef = db.collection('members').doc(memberId);
        const docData = convertToFirestore(member);
        
        await docRef.set(docData, { merge: true });
        synced++;
        console.log(`   ✅ Synced member ${memberId}: ${member.fullName || 'N/A'}`);
      } catch (error) {
        errors++;
        console.error(`   ❌ Error syncing member ${member.id}:`, error.message);
      }
    }
    
    console.log(`\n✅ Sync completed!`);
    console.log(`   Synced: ${synced}`);
    console.log(`   Errors: ${errors}`);
    
    console.log('\n📡 Step 5: Verifying sync...');
    const firebaseMembers = await db.collection('members').count().get();
    console.log(`✅ Firebase now has ${firebaseMembers.data().count} members`);
    
    sqliteDb.close();
    
    console.log('\n✅✅✅ Sync test completed successfully! ✅✅✅');
    
  } catch (error) {
    console.error('\n❌❌❌ Sync test failed! ❌❌❌');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testSync();

