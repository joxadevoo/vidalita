import express from "express";
import Database from "better-sqlite3";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// SQLite database path - executable uchun to'g'ri path
const SQLITE_DB_PATH = process.pkg 
  ? path.join(path.dirname(process.execPath), 'db', 'gymbeauty.db')
  : path.join(__dirname, '../db/gymbeauty.db');

// Firebase Admin SDK initialization
let firebaseApp = null;
let firestore = null;

async function initializeFirebase() {
  // Avval mavjud app'ni tekshirish
  try {
    if (admin.apps.length > 0) {
      firebaseApp = admin.app();
      firestore = admin.firestore();
      firestore.settings({
        ignoreUndefinedProperties: true
      });
      return firestore;
    }
  } catch (err) {
    // App mavjud emas, yangi initialize qilamiz
  }
  
  if (!firebaseApp) {
    try {
      // Option 1: Service Account Key (JSON file)
      const serviceAccountPath = process.pkg
        ? path.join(path.dirname(process.execPath), 'config', 'firebase-service-account.json')
        : path.join(__dirname, '../config/firebase-service-account.json');
      const fs = (await import('fs')).default;
      
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase initialized with service account file');
        console.log('   Project ID:', serviceAccount.project_id);
      } else {
        // Option 2: Environment variables
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
          // Private key formatini to'g'rilash
          let privateKey = process.env.FIREBASE_PRIVATE_KEY;
          // Agar quoted string bo'lsa, qo'shtirnoqlarni olib tashlash
          if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
          }
          // \n belgilarini haqiqiy newline'ga o'zgartirish
          privateKey = privateKey.replace(/\\n/g, '\n');
          
          firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: privateKey
            })
          });
          console.log('✅ Firebase initialized with environment variables');
          console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
        } else {
          const missing = [];
          if (!process.env.FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');
          if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
          if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');
          throw new Error(`Firebase configuration not found. Missing: ${missing.join(', ')}. Please set environment variables or provide firebase-service-account.json file in backend/config/ directory.`);
        }
      }
    } catch (error) {
      // Agar app allaqachon mavjud bo'lsa, uni qaytarish
      if (error.code === 'app/duplicate-app') {
        try {
          firebaseApp = admin.app();
          firestore = admin.firestore();
          firestore.settings({
            ignoreUndefinedProperties: true
          });
          return firestore;
        } catch (err) {
          console.error('❌ Firebase app error:', err.message);
          throw err;
        }
      }
      console.error('❌ Firebase initialization error:', error.message);
      if (error.code) {
        console.error('   Error code:', error.code);
      }
      if (error.stack) {
        console.error('   Stack:', error.stack);
      }
      throw error;
    }

    firestore = admin.firestore();
    // Firestore settings
    firestore.settings({
      ignoreUndefinedProperties: true
    });
  }
  return firestore;
}

// GET /api/sync/test - Firebase connection test
router.get("/test", async (req, res) => {
  try {
    console.log('🧪 Testing Firebase connection...');
    const db = await initializeFirebase();
    
    // Test write and read
    const testDoc = db.collection('_test').doc('connection');
    await testDoc.set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Connection test successful'
    });
    
    const doc = await testDoc.get();
    const data = doc.data();
    
    // Clean up test document
    await testDoc.delete();
    
    res.json({
      success: true,
      message: "Firebase connection successful",
      timestamp: data.timestamp?.toDate(),
      projectId: firebaseApp.options.projectId
    });
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      suggestion: 'Please check your Firebase configuration. Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set, or provide firebase-service-account.json file.'
    });
  }
});

// POST /api/sync - Barcha ma'lumotlarni SQLite'dan Firebase'ga ko'chirish
router.post("/", async (req, res) => {
  let sqliteDb = null;
  
  try {
    console.log('🔄 Starting sync from SQLite to Firebase...');
    console.log('   Timestamp:', new Date().toISOString());
    
    // SQLite'ga ulanish
    try {
      sqliteDb = new Database(SQLITE_DB_PATH);
      console.log('✅ Connected to SQLite');
      console.log('   Database path:', SQLITE_DB_PATH);
    } catch (sqliteError) {
      console.error('❌ SQLite connection error:', sqliteError);
      console.error('   Error details:', sqliteError.message);
      console.error('   Stack:', sqliteError.stack);
      return res.status(500).json({
        success: false,
        error: `SQLite connection failed: ${sqliteError.message}`,
        details: process.env.NODE_ENV === 'development' ? sqliteError.stack : undefined
      });
    }
    
    // Firebase connection test
    let db = null;
    try {
      db = await initializeFirebase();
      if (!db) {
        throw new Error('Firebase initialization returned null');
      }
      console.log('✅ Connected to Firebase Firestore');
      console.log('   Project ID:', firebaseApp?.options?.projectId || 'N/A');
      
      // Test write
      const testDoc = db.collection('_sync_test').doc('connection');
      await testDoc.set({ timestamp: admin.firestore.FieldValue.serverTimestamp() });
      await testDoc.delete();
      console.log('✅ Firebase write test successful');
    } catch (firebaseError) {
      console.error('❌ Firebase connection error:', firebaseError);
      console.error('   Error message:', firebaseError.message);
      console.error('   Error code:', firebaseError.code || 'N/A');
      console.error('   Stack:', firebaseError.stack);
      
      if (sqliteDb) {
        try {
          sqliteDb.close();
        } catch (e) {
          console.error('Error closing SQLite:', e);
        }
      }
      
      return res.status(500).json({
        success: false,
        error: `Firebase connection failed: ${firebaseError.message}`,
        errorCode: firebaseError.code,
        suggestion: 'Please check your Firebase configuration and credentials. Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set, or provide firebase-service-account.json file in backend/config/ directory.',
        details: process.env.NODE_ENV === 'development' ? firebaseError.stack : undefined
      });
    }

    // Barcha ma'lumotlarni ko'chirish
    const stats = {
      members: 0,
      users: 0,
      checkins: 0,
      beautyServices: 0,
      gymInfo: 0,
      healthInfo: 0,
      payments: 0
    };
    
    const errors = [];
    const startTime = Date.now();
    
    console.log('📦 Starting data synchronization...');
    
    try {
      console.log('\n🔄 Syncing members...');
      stats.members = await syncMembers(sqliteDb);
    } catch (err) {
      console.error('❌ Error syncing members:', err);
      console.error('   Stack:', err.stack);
      errors.push(`Members: ${err.message}`);
    }
    
    try {
      console.log('\n🔄 Syncing users...');
      stats.users = await syncUsers(sqliteDb);
    } catch (err) {
      console.error('❌ Error syncing users:', err);
      console.error('   Stack:', err.stack);
      errors.push(`Users: ${err.message}`);
    }
    
    try {
      console.log('\n🔄 Syncing checkins...');
      stats.checkins = await syncCheckins(sqliteDb);
    } catch (err) {
      console.error('❌ Error syncing checkins:', err);
      console.error('   Stack:', err.stack);
      errors.push(`Checkins: ${err.message}`);
    }
    
    try {
      console.log('\n🔄 Syncing beauty services...');
      stats.beautyServices = await syncBeautyServices(sqliteDb);
    } catch (err) {
      console.error('❌ Error syncing beauty services:', err);
      console.error('   Stack:', err.stack);
      errors.push(`Beauty Services: ${err.message}`);
    }
    
    try {
      console.log('\n🔄 Syncing gym info...');
      stats.gymInfo = await syncGymInfo(sqliteDb);
    } catch (err) {
      console.error('❌ Error syncing gym info:', err);
      console.error('   Stack:', err.stack);
      errors.push(`Gym Info: ${err.message}`);
    }
    
    try {
      console.log('\n🔄 Syncing health info...');
      stats.healthInfo = await syncHealthInfo(sqliteDb);
    } catch (err) {
      console.error('❌ Error syncing health info:', err);
      console.error('   Stack:', err.stack);
      errors.push(`Health Info: ${err.message}`);
    }
    
    try {
      console.log('\n🔄 Syncing payments...');
      stats.payments = await syncPayments(sqliteDb);
    } catch (err) {
      console.error('❌ Error syncing payments:', err);
      console.error('   Stack:', err.stack);
      errors.push(`Payments: ${err.message}`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalSynced = stats.members + stats.users + stats.checkins + 
                       stats.beautyServices + stats.gymInfo + stats.healthInfo + stats.payments;
    
    console.log('\n✅ Sync completed!');
    console.log('📊 Statistics:');
    console.log(`   Members: ${stats.members}`);
    console.log(`   Users: ${stats.users}`);
    console.log(`   Checkins: ${stats.checkins}`);
    console.log(`   Beauty Services: ${stats.beautyServices}`);
    console.log(`   Gym Info: ${stats.gymInfo}`);
    console.log(`   Health Info: ${stats.healthInfo}`);
    console.log(`   Payments: ${stats.payments}`);
    console.log(`   Total: ${totalSynced} records`);
    console.log(`   Duration: ${duration}s`);
    
    if (errors.length > 0) {
      console.warn(`\n⚠️  ${errors.length} sync operation(s) failed:`);
      errors.forEach(err => console.warn(`   - ${err}`));
    }

    res.json({
      success: errors.length === 0,
      message: errors.length === 0 
        ? `Sync completed successfully! ${totalSynced} records synced in ${duration}s` 
        : `Sync completed with ${errors.length} error(s). ${totalSynced} records synced in ${duration}s`,
      stats,
      totalSynced,
      duration: `${duration}s`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('❌ Sync error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (sqliteDb) {
      try {
        sqliteDb.close();
        console.log('✅ SQLite connection closed');
      } catch (e) {
        console.error('Error closing SQLite:', e);
      }
    }
  }
});

// GET /api/sync/status - Sync holatini tekshirish
router.get("/status", async (req, res) => {
  let sqliteDb = null;
  try {
    // Firebase initialization
    const db = await initializeFirebase();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: "Firebase not initialized"
      });
    }
    
    // SQLite'dan ma'lumotlar sonini olish
    sqliteDb = new Database(SQLITE_DB_PATH);
    const membersCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM members").get().count;
    const usersCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM users").get().count;
    const checkinsCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM checkins").get().count;
    const servicesCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM beauty_services").get().count;
    
    // Firebase'dan ma'lumotlar sonini olish
    const firebaseMembers = await db.collection('members').count().get();
    const firebaseUsers = await db.collection('users').count().get();
    const firebaseCheckins = await db.collection('checkins').count().get();
    const firebaseServices = await db.collection('beauty_services').count().get();
    
    res.json({
      success: true,
      sqlite: {
        members: membersCount,
        users: usersCount,
        checkins: checkinsCount,
        services: servicesCount
      },
      firebase: {
        members: firebaseMembers.data().count,
        users: firebaseUsers.data().count,
        checkins: firebaseCheckins.data().count,
        services: firebaseServices.data().count
      },
      needsSync: {
        members: membersCount !== firebaseMembers.data().count,
        users: usersCount !== firebaseUsers.data().count,
        checkins: checkinsCount !== firebaseCheckins.data().count,
        services: servicesCount !== firebaseServices.data().count
      }
    });
  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (sqliteDb) {
      try {
        sqliteDb.close();
      } catch (e) {
        console.error('Error closing SQLite:', e);
      }
    }
  }
});

// Helper function to convert SQLite row to Firestore document
function convertToFirestore(data) {
  const doc = {};
  const FIRESTORE_MAX_STRING_LENGTH = 1048487; // ~1MB limit for Firestore strings
  
  for (const [key, value] of Object.entries(data)) {
    // Skip null/undefined values
    if (value === null || value === undefined) {
      continue;
    }
    
    // Photo field'ni oldindan tekshirish va o'tkazib yuborish (juda katta bo'lsa)
    if (key === 'photo' && typeof value === 'string' && value.length > FIRESTORE_MAX_STRING_LENGTH) {
      console.warn(`⚠️  Skipping photo field for ${data.id || 'unknown'} (too large: ${value.length} bytes)`);
      continue;
    }
    
    // Convert dates if needed
    if (typeof value === 'string') {
      // Check for very long strings (like base64 images)
      if (value.length > FIRESTORE_MAX_STRING_LENGTH) {
        console.warn(`⚠️  Field '${key}' is too long (${value.length} chars), skipping...`);
        // Barcha juda katta field'larni o'tkazib yuboramiz
        continue;
      } else {
        // Check if it's a date string (ISO format or SQLite date format)
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
      }
    } else if (typeof value === 'number') {
      // Ensure numbers are valid (not NaN or Infinity)
      if (isNaN(value) || !isFinite(value)) {
        continue; // Skip invalid numbers
      }
      doc[key] = value;
    } else if (typeof value === 'boolean') {
      doc[key] = value;
    } else if (Buffer.isBuffer(value)) {
      // Convert Buffer to base64 string, but check size
      const base64 = value.toString('base64');
      if (base64.length > FIRESTORE_MAX_STRING_LENGTH) {
        console.warn(`⚠️  Buffer field '${key}' is too large, skipping...`);
        continue;
      }
      doc[key] = base64;
    } else {
      doc[key] = value;
    }
  }
  return doc;
}

async function syncMembers(sqliteDb) {
  const members = sqliteDb.prepare('SELECT * FROM members').all();
  console.log(`📊 Found ${members.length} members to sync`);
  
  if (members.length === 0) {
    console.log('⚠️  No members found in SQLite database');
    return 0;
  }
  
  // Log all member IDs before sync
  const memberIds = members.map(m => m.id).join(', ');
  console.log(`   Member IDs: ${memberIds}`);
  
  let count = 0;
  let errorCount = 0;
  const failedMembers = [];
  const db = await initializeFirebase();
  const batchSize = 500; // Firestore batch limit
  let batchCount = 0;
  let batch = db.batch();
  
  for (const member of members) {
    try {
      const memberId = member.id.toString();
      const docRef = db.collection('members').doc(memberId);
      const docData = convertToFirestore(member);
      
      // Validate member data
      if (!member.id) {
        console.error(`❌ Member has no ID:`, member);
        errorCount++;
        failedMembers.push({ id: 'N/A', name: member.fullName || 'N/A', error: 'Missing ID' });
        continue;
      }
      
      batch.set(docRef, docData, { merge: true });
      count++;
      batchCount++;
      
      console.log(`   ✓ Prepared member ${memberId}: ${member.fullName || 'N/A'}`);
      
      // Firestore batch limit: 500 operations
      if (batchCount >= batchSize) {
        try {
          await batch.commit();
          console.log(`  ✅ Committed batch: ${count}/${members.length} members prepared...`);
        } catch (commitError) {
          console.error(`❌ Batch commit error:`, commitError.message);
          console.error(`   Failed members in this batch: ${batchCount}`);
          errorCount += batchCount;
          // Track which members failed in this batch
          const startIndex = count - batchCount;
          for (let i = startIndex; i < count; i++) {
            if (members[i]) {
              failedMembers.push({ 
                id: members[i].id, 
                name: members[i].fullName || 'N/A', 
                error: commitError.message 
              });
            }
          }
        }
        batch = db.batch(); // Yangi batch yaratish
        batchCount = 0;
      }
    } catch (error) {
      console.error(`❌ Error preparing member ${member.id} (${member.fullName || 'N/A'}):`, error.message);
      console.error(`   Error details:`, error);
      errorCount++;
      failedMembers.push({ 
        id: member.id, 
        name: member.fullName || 'N/A', 
        error: error.message 
      });
    }
  }
  
  // Commit remaining batch
  if (batchCount > 0) {
    try {
      await batch.commit();
      console.log(`  ✅ Committed final batch: ${count}/${members.length} members prepared...`);
    } catch (commitError) {
      console.error(`❌ Final batch commit error:`, commitError.message);
      console.error(`   Error code:`, commitError.code);
      console.error(`   Failed members in final batch: ${batchCount}`);
      
      // Try to sync members one by one to identify the problematic one
      console.log(`   🔍 Attempting individual sync for failed final batch...`);
      const startIndex = count - batchCount;
      for (let i = startIndex; i < count; i++) {
        if (members[i]) {
          try {
            const singleMember = members[i];
            const singleDocRef = db.collection('members').doc(singleMember.id.toString());
            const singleDocData = convertToFirestore(singleMember);
            await singleDocRef.set(singleDocData, { merge: true });
            console.log(`      ✅ Individual sync successful for member ${singleMember.id}`);
            errorCount--; // Reduce error count as this one succeeded
          } catch (singleError) {
            console.error(`      ❌ Individual sync failed for member ${members[i].id}:`, singleError.message);
            failedMembers.push({ 
              id: members[i].id, 
              name: members[i].fullName || 'N/A', 
              error: singleError.message 
            });
            errorCount++;
          }
        }
      }
    }
  }
  
  // Verify sync by reading from Firestore
  console.log(`\n🔍 Verifying sync...`);
  try {
    const firestoreMembers = await db.collection('members').get();
    const syncedIds = firestoreMembers.docs.map(doc => doc.id);
    console.log(`   Firebase has ${firestoreMembers.size} members`);
    console.log(`   Firebase member IDs: ${syncedIds.join(', ')}`);
    
    // Find missing members
    const localIds = members.map(m => m.id.toString());
    const missingIds = localIds.filter(id => !syncedIds.includes(id));
    if (missingIds.length > 0) {
      console.warn(`   ⚠️  Missing members in Firebase: ${missingIds.join(', ')}`);
      missingIds.forEach(id => {
        const member = members.find(m => m.id.toString() === id);
        if (member) {
          console.warn(`      - ID ${id}: ${member.fullName || 'N/A'}`);
        }
      });
    }
  } catch (verifyError) {
    console.error(`❌ Error verifying sync:`, verifyError.message);
  }
  
  if (errorCount > 0 || failedMembers.length > 0) {
    console.warn(`\n⚠️  ${errorCount} members failed to sync:`);
    failedMembers.forEach(fm => {
      console.warn(`   - ID ${fm.id}: ${fm.name} - Error: ${fm.error}`);
    });
  }
  
  const successCount = count - errorCount;
  console.log(`\n✅ Sync summary: ${successCount}/${members.length} members synced successfully`);
  return successCount;
}

async function syncUsers(sqliteDb) {
  const users = sqliteDb.prepare('SELECT * FROM users').all();
  console.log(`📊 Found ${users.length} users to sync`);
  let count = 0;
  let errorCount = 0;
  const db = await initializeFirebase();
  let batch = db.batch();
  let batchCount = 0;
  
  for (const user of users) {
    try {
      const docRef = db.collection('users').doc(user.id.toString());
      const docData = convertToFirestore(user);
      batch.set(docRef, docData, { merge: true });
      count++;
      batchCount++;
      
      if (batchCount >= 500) {
        try {
          await batch.commit();
          console.log(`  ✅ Synced ${count}/${users.length} users...`);
        } catch (commitError) {
          console.error(`❌ Batch commit error:`, commitError.message);
          errorCount += batchCount;
        }
        batch = db.batch();
        batchCount = 0;
      }
    } catch (error) {
      console.error(`❌ Error preparing user ${user.id} (${user.username || 'N/A'}):`, error.message);
      errorCount++;
    }
  }
  
  if (batchCount > 0) {
    try {
      await batch.commit();
    } catch (commitError) {
      console.error(`❌ Final batch commit error:`, commitError.message);
      errorCount += batchCount;
    }
  }
  
  if (errorCount > 0) {
    console.warn(`⚠️  ${errorCount} users failed to sync`);
  }
  console.log(`✅ Synced ${count - errorCount}/${users.length} users successfully`);
  return count - errorCount;
}

async function syncCheckins(sqliteDb) {
  const checkins = sqliteDb.prepare('SELECT * FROM checkins').all();
  console.log(`📊 Found ${checkins.length} checkins to sync`);
  let count = 0;
  let errorCount = 0;
  const db = await initializeFirebase();
  let batch = db.batch();
  let batchCount = 0;
  
  for (const checkin of checkins) {
    try {
      const docRef = db.collection('checkins').doc(checkin.id.toString());
      const docData = convertToFirestore(checkin);
      batch.set(docRef, docData, { merge: true });
      count++;
      batchCount++;
      
      if (batchCount >= 500) {
        try {
          await batch.commit();
          console.log(`  ✅ Synced ${count}/${checkins.length} checkins...`);
        } catch (commitError) {
          console.error(`❌ Batch commit error:`, commitError.message);
          errorCount += batchCount;
        }
        batch = db.batch();
        batchCount = 0;
      }
    } catch (error) {
      console.error(`❌ Error preparing checkin ${checkin.id}:`, error.message);
      errorCount++;
    }
  }
  
  if (batchCount > 0) {
    try {
      await batch.commit();
    } catch (commitError) {
      console.error(`❌ Final batch commit error:`, commitError.message);
      errorCount += batchCount;
    }
  }
  
  if (errorCount > 0) {
    console.warn(`⚠️  ${errorCount} checkins failed to sync`);
  }
  console.log(`✅ Synced ${count - errorCount}/${checkins.length} checkins successfully`);
  return count - errorCount;
}

async function syncBeautyServices(sqliteDb) {
  const services = sqliteDb.prepare('SELECT * FROM beauty_services').all();
  console.log(`📊 Found ${services.length} beauty services to sync`);
  let count = 0;
  let errorCount = 0;
  const db = await initializeFirebase();
  let batch = db.batch();
  let batchCount = 0;
  
  for (const service of services) {
    try {
      const docRef = db.collection('beauty_services').doc(service.id.toString());
      const docData = convertToFirestore(service);
      batch.set(docRef, docData, { merge: true });
      count++;
      batchCount++;
      
      if (batchCount >= 500) {
        try {
          await batch.commit();
          console.log(`  ✅ Synced ${count}/${services.length} beauty services...`);
        } catch (commitError) {
          console.error(`❌ Batch commit error:`, commitError.message);
          errorCount += batchCount;
        }
        batch = db.batch();
        batchCount = 0;
      }
    } catch (error) {
      console.error(`❌ Error preparing beauty service ${service.id}:`, error.message);
      errorCount++;
    }
  }
  
  if (batchCount > 0) {
    try {
      await batch.commit();
    } catch (commitError) {
      console.error(`❌ Final batch commit error:`, commitError.message);
      errorCount += batchCount;
    }
  }
  
  if (errorCount > 0) {
    console.warn(`⚠️  ${errorCount} beauty services failed to sync`);
  }
  console.log(`✅ Synced ${count - errorCount}/${services.length} beauty services successfully`);
  return count - errorCount;
}

async function syncGymInfo(sqliteDb) {
  const gymInfo = sqliteDb.prepare('SELECT * FROM gym_info').all();
  console.log(`📊 Found ${gymInfo.length} gym info records to sync`);
  let count = 0;
  let errorCount = 0;
  const db = await initializeFirebase();
  let batch = db.batch();
  let batchCount = 0;
  
  for (const gym of gymInfo) {
    try {
      const docRef = db.collection('gym_info').doc(gym.id.toString());
      const docData = convertToFirestore(gym);
      batch.set(docRef, docData, { merge: true });
      count++;
      batchCount++;
      
      if (batchCount >= 500) {
        try {
          await batch.commit();
          console.log(`  ✅ Synced ${count}/${gymInfo.length} gym info records...`);
        } catch (commitError) {
          console.error(`❌ Batch commit error:`, commitError.message);
          errorCount += batchCount;
        }
        batch = db.batch();
        batchCount = 0;
      }
    } catch (error) {
      console.error(`❌ Error preparing gym info ${gym.id} (member ${gym.memberId || 'N/A'}):`, error.message);
      errorCount++;
    }
  }
  
  if (batchCount > 0) {
    try {
      await batch.commit();
    } catch (commitError) {
      console.error(`❌ Final batch commit error:`, commitError.message);
      errorCount += batchCount;
    }
  }
  
  if (errorCount > 0) {
    console.warn(`⚠️  ${errorCount} gym info records failed to sync`);
  }
  console.log(`✅ Synced ${count - errorCount}/${gymInfo.length} gym info records successfully`);
  return count - errorCount;
}

async function syncHealthInfo(sqliteDb) {
  const healthInfo = sqliteDb.prepare('SELECT * FROM beauty_health_info').all();
  console.log(`📊 Found ${healthInfo.length} health info records to sync`);
  let count = 0;
  let errorCount = 0;
  const db = await initializeFirebase();
  let batch = db.batch();
  let batchCount = 0;
  
  for (const health of healthInfo) {
    try {
      const docRef = db.collection('beauty_health_info').doc(health.id.toString());
      const docData = convertToFirestore(health);
      batch.set(docRef, docData, { merge: true });
      count++;
      batchCount++;
      
      if (batchCount >= 500) {
        try {
          await batch.commit();
          console.log(`  ✅ Synced ${count}/${healthInfo.length} health info records...`);
        } catch (commitError) {
          console.error(`❌ Batch commit error:`, commitError.message);
          errorCount += batchCount;
        }
        batch = db.batch();
        batchCount = 0;
      }
    } catch (error) {
      console.error(`❌ Error preparing health info ${health.id} (member ${health.memberId || 'N/A'}):`, error.message);
      errorCount++;
    }
  }
  
  if (batchCount > 0) {
    try {
      await batch.commit();
    } catch (commitError) {
      console.error(`❌ Final batch commit error:`, commitError.message);
      errorCount += batchCount;
    }
  }
  
  if (errorCount > 0) {
    console.warn(`⚠️  ${errorCount} health info records failed to sync`);
  }
  console.log(`✅ Synced ${count - errorCount}/${healthInfo.length} health info records successfully`);
  return count - errorCount;
}

async function syncPayments(sqliteDb) {
  const payments = sqliteDb.prepare('SELECT * FROM gym_payments').all();
  console.log(`📊 Found ${payments.length} payments to sync`);
  let count = 0;
  let errorCount = 0;
  const db = await initializeFirebase();
  let batch = db.batch();
  let batchCount = 0;
  
  for (const payment of payments) {
    try {
      const docRef = db.collection('gym_payments').doc(payment.id.toString());
      const docData = convertToFirestore(payment);
      batch.set(docRef, docData, { merge: true });
      count++;
      batchCount++;
      
      if (batchCount >= 500) {
        try {
          await batch.commit();
          console.log(`  ✅ Synced ${count}/${payments.length} payments...`);
        } catch (commitError) {
          console.error(`❌ Batch commit error:`, commitError.message);
          errorCount += batchCount;
        }
        batch = db.batch();
        batchCount = 0;
      }
    } catch (error) {
      console.error(`❌ Error preparing payment ${payment.id}:`, error.message);
      errorCount++;
    }
  }
  
  if (batchCount > 0) {
    try {
      await batch.commit();
    } catch (commitError) {
      console.error(`❌ Final batch commit error:`, commitError.message);
      errorCount += batchCount;
    }
  }
  
  if (errorCount > 0) {
    console.warn(`⚠️  ${errorCount} payments failed to sync`);
  }
  console.log(`✅ Synced ${count - errorCount}/${payments.length} payments successfully`);
  return count - errorCount;
}

export default router;

