#!/usr/bin/env node

/**
 * Firebase'dagi ortiqcha yozuvlarni (SQLite'da mavjud bo'lmagan) o'chirish scripti
 * 
 * Usage: node backend/scripts/cleanup-firebase.js
 */

import Database from "better-sqlite3";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQLite database path
const SQLITE_DB_PATH = path.join(__dirname, '../db/gymbeauty.db');

// Firebase initialization
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
      const serviceAccountPath = process.pkg
        ? path.join(path.dirname(process.execPath), 'config', 'firebase-service-account.json')
        : path.join(__dirname, '../config/firebase-service-account.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase initialized with service account file');
        console.log('   Project ID:', serviceAccount.project_id);
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
          console.log('✅ Firebase initialized with environment variables');
          console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
        } else {
          throw new Error('Firebase configuration not found. Please set environment variables or provide firebase-service-account.json file.');
        }
      }
      firestore = admin.firestore();
      firestore.settings({
        ignoreUndefinedProperties: true
      });
      console.log('✅ Firebase Firestore initialized');
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
      throw error;
    }
  }
  return firestore;
}

async function cleanupOrphanedServices() {
  try {
    console.log('\n🔍 Checking for orphaned beauty services...');
    
    // Firebase va SQLite'ni initialize qilish
    const db = await initializeFirebase();
    const sqliteDb = new Database(SQLITE_DB_PATH);
    
    // SQLite'dagi barcha service ID'larni olish
    const sqliteServices = sqliteDb.prepare("SELECT id FROM beauty_services").all();
    const sqliteServiceIds = new Set(sqliteServices.map(s => s.id.toString()));
    
    console.log(`📊 SQLite'da ${sqliteServiceIds.size} ta service mavjud`);
    
    // Firebase'dagi barcha servicelarni olish
    const firebaseServicesSnapshot = await db.collection('beauty_services').get();
    const firebaseServices = firebaseServicesSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }));
    
    console.log(`📊 Firebase'da ${firebaseServices.length} ta service mavjud`);
    
    // Ortiqcha servicelarni topish
    const orphanedServices = firebaseServices.filter(service => {
      const serviceId = service.id;
      return !sqliteServiceIds.has(serviceId);
    });
    
    if (orphanedServices.length === 0) {
      console.log('✅ Ortiqcha service topilmadi. Barcha servicelar sinxron.');
      sqliteDb.close();
      return;
    }
    
    console.log(`⚠️  ${orphanedServices.length} ta ortiqcha service topildi:`);
    orphanedServices.forEach(service => {
      console.log(`   - Service ID: ${service.id}, Member ID: ${service.data.memberId || 'N/A'}`);
    });
    
    // O'chirishni tasdiqlash
    console.log('\n🗑️  Ortiqcha servicelarni o\'chirish...');
    
    const batch = db.batch();
    orphanedServices.forEach(service => {
      batch.delete(db.collection('beauty_services').doc(service.id));
    });
    
    await batch.commit();
    
    console.log(`✅ ${orphanedServices.length} ta ortiqcha service Firebase'dan o'chirildi`);
    
    sqliteDb.close();
    console.log('✅ SQLite connection yopildi');
  } catch (error) {
    console.error('❌ Error cleaning up orphaned services:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    throw error;
  }
}

async function cleanupOrphanedCheckins() {
  try {
    console.log('\n🔍 Checking for orphaned checkins...');
    
    const db = await initializeFirebase();
    const sqliteDb = new Database(SQLITE_DB_PATH);
    
    // SQLite'dagi barcha checkin ID'larni olish
    const sqliteCheckins = sqliteDb.prepare("SELECT id FROM checkins").all();
    const sqliteCheckinIds = new Set(sqliteCheckins.map(c => c.id.toString()));
    
    console.log(`📊 SQLite'da ${sqliteCheckinIds.size} ta checkin mavjud`);
    
    // Firebase'dagi barcha checkinlarni olish
    const firebaseCheckinsSnapshot = await db.collection('checkins').get();
    const firebaseCheckins = firebaseCheckinsSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }));
    
    console.log(`📊 Firebase'da ${firebaseCheckins.length} ta checkin mavjud`);
    
    // Ortiqcha checkinlarni topish
    const orphanedCheckins = firebaseCheckins.filter(checkin => {
      return !sqliteCheckinIds.has(checkin.id);
    });
    
    if (orphanedCheckins.length === 0) {
      console.log('✅ Ortiqcha checkin topilmadi. Barcha checkinlar sinxron.');
      sqliteDb.close();
      return;
    }
    
    console.log(`⚠️  ${orphanedCheckins.length} ta ortiqcha checkin topildi`);
    
    // O'chirish
    const batch = db.batch();
    orphanedCheckins.forEach(checkin => {
      batch.delete(db.collection('checkins').doc(checkin.id));
    });
    
    await batch.commit();
    
    console.log(`✅ ${orphanedCheckins.length} ta ortiqcha checkin Firebase'dan o'chirildi`);
    
    sqliteDb.close();
    console.log('✅ SQLite connection yopildi');
  } catch (error) {
    console.error('❌ Error cleaning up orphaned checkins:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    throw error;
  }
}

async function main() {
  try {
    console.log('🧹 Firebase cleanup script boshlandi...\n');
    
    await cleanupOrphanedServices();
    await cleanupOrphanedCheckins();
    
    console.log('\n✅ Cleanup yakunlandi!');
    
    // Firebase connection'ni yopish
    if (firebaseApp) {
      try {
        await admin.app().delete();
        console.log('✅ Firebase connection yopildi');
      } catch (err) {
        // Ignore cleanup errors
      }
    }
    
    // Process'ni to'xtatish
    setTimeout(() => {
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error('\n❌ Cleanup xatolik bilan yakunlandi:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    
    // Firebase connection'ni yopish
    if (firebaseApp) {
      try {
        await admin.app().delete();
      } catch (err) {
        // Ignore cleanup errors
      }
    }
    
    setTimeout(() => {
      process.exit(1);
    }, 500);
  }
}

// Signal handlers - Ctrl+C yoki boshqa signal'lar uchun
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Script to\'xtatildi (SIGINT)');
  if (firebaseApp) {
    admin.app().delete().then(() => {
      process.exit(0);
    }).catch(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Script to\'xtatildi (SIGTERM)');
  if (firebaseApp) {
    admin.app().delete().then(() => {
      process.exit(0);
    }).catch(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

main();

