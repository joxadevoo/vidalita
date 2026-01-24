// Compare members between SQLite and Firebase
import Database from "better-sqlite3";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase
let firebaseApp = null;

async function initializeFirebase() {
  if (!firebaseApp) {
    try {
      // Option 1: Service Account Key (JSON file)
      const serviceAccountPath = path.join(__dirname, '../config/firebase-service-account.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase initialized with service account file');
      } else {
        // Option 2: Environment variables
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
          console.log('✅ Firebase initialized with environment variables');
        } else {
          throw new Error('Firebase configuration not found');
        }
      }
    } catch (error) {
      console.error('❌ Firebase initialization error:', error.message);
      process.exit(1);
    }
  }
  return admin.firestore();
}

async function compareMembers() {
  try {
    console.log('🔍 Comparing members between SQLite and Firebase...\n');
    
    // Get SQLite members
    const sqliteDb = new Database(path.join(__dirname, '../db/gymbeauty.db'));
    const sqliteMembers = sqliteDb.prepare('SELECT id, fullName, qrCodeId, phone FROM members ORDER BY id').all();
    console.log(`📊 SQLite: Found ${sqliteMembers.length} members`);
    sqliteMembers.forEach(m => {
      console.log(`   - ID: ${m.id}, Name: ${m.fullName || 'N/A'}, QR: ${m.qrCodeId || 'N/A'}`);
    });
    
    // Get Firebase members
    const db = await initializeFirebase();
    const firestoreSnapshot = await db.collection('members').get();
    const firestoreMembers = firestoreSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`\n📊 Firebase: Found ${firestoreMembers.length} members`);
    firestoreMembers.forEach(m => {
      console.log(`   - ID: ${m.id}, Name: ${m.fullName || 'N/A'}, QR: ${m.qrCodeId || 'N/A'}`);
    });
    
    // Compare
    console.log('\n🔍 Comparison:');
    const sqliteIds = sqliteMembers.map(m => m.id.toString()).sort();
    const firestoreIds = firestoreMembers.map(m => m.id.toString()).sort();
    
    const missingInFirebase = sqliteIds.filter(id => !firestoreIds.includes(id));
    const extraInFirebase = firestoreIds.filter(id => !sqliteIds.includes(id));
    
    if (missingInFirebase.length > 0) {
      console.log(`\n❌ Missing in Firebase (${missingInFirebase.length}):`);
      missingInFirebase.forEach(id => {
        const member = sqliteMembers.find(m => m.id.toString() === id);
        if (member) {
          console.log(`   - ID: ${id}, Name: ${member.fullName || 'N/A'}`);
        }
      });
    }
    
    if (extraInFirebase.length > 0) {
      console.log(`\n⚠️  Extra in Firebase (${extraInFirebase.length}):`);
      extraInFirebase.forEach(id => {
        const member = firestoreMembers.find(m => m.id.toString() === id);
        if (member) {
          console.log(`   - ID: ${id}, Name: ${member.fullName || 'N/A'}`);
        }
      });
    }
    
    if (missingInFirebase.length === 0 && extraInFirebase.length === 0) {
      console.log('\n✅ All members are synced correctly!');
    } else {
      console.log(`\n⚠️  Sync mismatch detected!`);
      console.log(`   SQLite: ${sqliteMembers.length} members`);
      console.log(`   Firebase: ${firestoreMembers.length} members`);
    }
    
    sqliteDb.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

compareMembers();

