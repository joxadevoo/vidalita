import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Firebase connection...\n');

// Firebase initialization
let firebaseApp = null;
let firestore = null;

async function initializeFirebase() {
  if (!firebaseApp) {
    try {
      // Option 1: Service Account Key (JSON file)
      const serviceAccountPath = path.join(__dirname, 'config/firebase-service-account.json');
      
      console.log('📁 Checking for Firebase service account file...');
      console.log('   Path:', serviceAccountPath);
      console.log('   Exists:', fs.existsSync(serviceAccountPath));
      
      if (fs.existsSync(serviceAccountPath)) {
        console.log('✅ Found service account file');
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase initialized with service account file');
        console.log('   Project ID:', serviceAccount.project_id);
        console.log('   Client Email:', serviceAccount.client_email);
      } else {
        console.log('⚠️  Service account file not found, checking environment variables...');
        
        // Option 2: Environment variables
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
          console.log('✅ Found environment variables');
          console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
          console.log('   Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
          console.log('   Private Key:', process.env.FIREBASE_PRIVATE_KEY.substring(0, 50) + '...');
          
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
          const missing = [];
          if (!process.env.FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');
          if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
          if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');
          
          throw new Error(`Firebase configuration not found. Missing: ${missing.join(', ')}. Please set environment variables or provide firebase-service-account.json file in backend/config/ directory.`);
        }
      }
    } catch (error) {
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
    firestore.settings({
      ignoreUndefinedProperties: true
    });
  }
  return firestore;
}

async function testConnection() {
  try {
    console.log('\n📡 Step 1: Initializing Firebase...');
    const db = await initializeFirebase();
    
    if (!db) {
      throw new Error('Firebase initialization returned null');
    }
    
    console.log('✅ Firebase initialized successfully');
    console.log('   Project ID:', firebaseApp.options.projectId);
    
    console.log('\n📡 Step 2: Testing write operation...');
    const testDoc = db.collection('_test').doc('connection');
    await testDoc.set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Connection test successful',
      testTime: new Date().toISOString()
    });
    console.log('✅ Write test successful');
    
    console.log('\n📡 Step 3: Testing read operation...');
    const doc = await testDoc.get();
    if (!doc.exists) {
      throw new Error('Test document not found after write');
    }
    const data = doc.data();
    console.log('✅ Read test successful');
    console.log('   Document data:', {
      message: data.message,
      testTime: data.testTime,
      timestamp: data.timestamp?.toDate?.() || data.timestamp
    });
    
    console.log('\n📡 Step 4: Testing delete operation...');
    await testDoc.delete();
    console.log('✅ Delete test successful');
    
    console.log('\n📡 Step 5: Testing collection query...');
    const membersSnapshot = await db.collection('members').limit(5).get();
    console.log(`✅ Query test successful`);
    console.log(`   Found ${membersSnapshot.size} members in Firebase`);
    
    if (membersSnapshot.size > 0) {
      console.log('   Sample member IDs:', membersSnapshot.docs.map(d => d.id).join(', '));
    }
    
    console.log('\n✅✅✅ All Firebase tests passed! ✅✅✅');
    console.log('\nFirebase connection is working correctly.');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌❌❌ Firebase connection test failed! ❌❌❌');
    console.error('\nError details:');
    console.error('   Message:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check if firebase-service-account.json exists in backend/config/');
    console.error('   2. Check if environment variables are set:');
    console.error('      - FIREBASE_PROJECT_ID');
    console.error('      - FIREBASE_CLIENT_EMAIL');
    console.error('      - FIREBASE_PRIVATE_KEY');
    console.error('   3. Verify Firebase project credentials');
    console.error('   4. Check internet connection');
    console.error('   5. Check Firebase project permissions');
    
    process.exit(1);
  }
}

// Run test
testConnection();

