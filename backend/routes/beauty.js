import express from "express";
import db from "../db/database.js";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getCurrentDateTimeTashkent } from "../utils/dateUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase initialization
let firebaseApp = null;
let firestore = null;

async function initializeFirebase() {
  // Avval mavjud app'ni tekshirish
  try {
    if (admin.apps.length > 0) {
      firebaseApp = admin.app();
      firestore = admin.firestore();
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
          console.warn('⚠️  Firebase configuration not found. Firebase sync will be skipped.');
          return null;
        }
      }
      firestore = admin.firestore();
      firestore.settings({
        ignoreUndefinedProperties: true
      });
    } catch (error) {
      // Agar app allaqachon mavjud bo'lsa, uni qaytarish
      if (error.code === 'app/duplicate-app') {
        try {
          firebaseApp = admin.app();
          firestore = admin.firestore();
          return firestore;
        } catch (err) {
          console.error('❌ Firebase app error:', err.message);
          return null;
        }
      }
      console.error('❌ Firebase initialization error:', error.message);
      return null;
    }
  }
  return firestore;
}

// Firebase'ga service yozish
async function syncServiceToFirebase(service) {
  try {
    const db = await initializeFirebase();
    if (!db) {
      console.warn('⚠️  Firebase not initialized. Skipping Firebase sync.');
      return;
    }
    
    const serviceId = service.id.toString();
    const docRef = db.collection('beauty_services').doc(serviceId);
    
    // Service ma'lumotlarini Firestore formatiga o'tkazish
    const docData = {
      id: service.id,
      memberId: service.memberId,
      serviceName: service.serviceName || null,
      serviceType: service.serviceType || null,
      serviceDate: service.serviceDate ? admin.firestore.Timestamp.fromDate(new Date(service.serviceDate)) : null,
      note: service.note || null,
      amount: service.amount || 0,
      discountPercent: service.discountPercent || 0,
      paymentStatus: service.paymentStatus || 'pending',
      paymentMethod: service.paymentMethod || null,
      paymentDate: service.paymentDate ? admin.firestore.Timestamp.fromDate(new Date(service.paymentDate)) : null
    };
    
    await docRef.set(docData, { merge: true });
    console.log(`✅ Synced beauty service ${serviceId} to Firebase`);
  } catch (error) {
    console.error(`❌ Error syncing beauty service ${service.id} to Firebase:`, error.message);
  }
}

// Firebase'dan service o'chirish
async function deleteServiceFromFirebase(serviceId) {
  try {
    const db = await initializeFirebase();
    if (!db) {
      console.warn('⚠️  Firebase not initialized. Skipping Firebase deletion.');
      return false;
    }
    
    const serviceIdStr = serviceId.toString();
    const docRef = db.collection('beauty_services').doc(serviceIdStr);
    
    // Avval document mavjudligini tekshirish
    const doc = await docRef.get();
    if (!doc.exists) {
      console.warn(`⚠️  Beauty service ${serviceIdStr} not found in Firebase (may already be deleted)`);
      return false;
    }
    
    await docRef.delete();
    console.log(`✅ Deleted beauty service ${serviceIdStr} from Firebase`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting beauty service ${serviceId} from Firebase:`, error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    return false;
  }
}
import { 
  BEAUTY_SERVICE_TYPES, 
  BEAUTY_SERVICE_LABELS, 
  BEAUTY_SERVICE_CATEGORIES,
  BEAUTY_SERVICE_PRICES,
  isValidServiceType,
  getAllServiceTypes,
  getServiceLabel,
  getServicePrice
} from "../constants/beautyServices.js";

const router = express.Router();

// Xizmat turlarini olish (enum qiymatlarini qaytarish)
router.get("/service-types", (req, res) => {
  try {
    res.json({
      types: getAllServiceTypes(),
      labels: BEAUTY_SERVICE_LABELS,
      categories: BEAUTY_SERVICE_CATEGORIES,
      prices: BEAUTY_SERVICE_PRICES
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xizmat turlarini olishda xatolik yuz berdi" });
  }
});

// Yangi go'zallik xizmati qo'shish
router.post("/", async (req, res) => {
  const { memberId, serviceName, serviceType, serviceDate, note, amount, discountPercent, paymentStatus, paymentMethod, paymentDate } = req.body;

  if (!memberId || !serviceName) {
    return res.status(400).json({ error: "A'zo ID va xizmat nomi majburiy" });
  }

  // Agar serviceType berilgan bo'lsa, uni tekshirish
  if (serviceType && !isValidServiceType(serviceType)) {
    return res.status(400).json({ 
      error: "Noto'g'ri xizmat turi",
      validTypes: getAllServiceTypes()
    });
  }

  try {
    // Üyenin var olup olmadığını kontrol et
    const member = db.prepare("SELECT * FROM members WHERE id = ?").get(memberId);
    if (!member) {
      return res.status(404).json({ error: "A'zo topilmadi" });
    }

    // Service kaydını ekle
    const stmt = db.prepare(`
      INSERT INTO beauty_services (
        memberId, serviceName, serviceType, serviceDate, note, 
        amount, discountPercent, paymentStatus, paymentMethod, paymentDate
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      memberId, 
      serviceName, 
      serviceType || null,  // Enum qiymati
      serviceDate || getCurrentDateTimeTashkent(), 
      note || "",
      amount || 0,
      discountPercent || 0,
      paymentStatus || 'pending',
      paymentMethod || null,
      paymentDate || null
    );

    // Yangi qo'shilgan service'ni olish
    const newService = db.prepare("SELECT * FROM beauty_services WHERE id = ?").get(result.lastInsertRowid);

    // Üyenin beautyHasRecord flag'ini güncelle
    db.prepare("UPDATE members SET beautyHasRecord = 1, lastUpdated = datetime('now') WHERE id = ?").run(memberId);

    // Firebase'ga avtomatik sync qilish
    try {
      await syncServiceToFirebase(newService);
    } catch (firebaseError) {
      console.error('⚠️  Firebase sync error (non-critical):', firebaseError.message);
      // Firebase xatosi kritik emas, SQLite'ga yozilgan
    }

    res.json({ message: "Xizmat yozuvi muvaffaqiyatli qo'shildi ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xizmat yozuvini qo'shishda xatolik yuz berdi" });
  }
});

// Barcha go'zallik xizmatlari yozuvlarini olish
router.get("/", (req, res) => {
  try {
    const services = db.prepare(`
      SELECT bs.*, m.fullName, m.phone, m.qrCodeId
      FROM beauty_services bs
      LEFT JOIN members m ON bs.memberId = m.id
      ORDER BY bs.serviceDate DESC
    `).all();
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xizmat yozuvlarini olishda xatolik yuz berdi" });
  }
});

// Muayyan a'zoning go'zallik xizmatlari yozuvlarini olish
router.get("/member/:memberId", (req, res) => {
  try {
    const services = db.prepare(`
      SELECT bs.*, m.fullName, m.phone, m.qrCodeId
      FROM beauty_services bs
      LEFT JOIN members m ON bs.memberId = m.id
      WHERE bs.memberId = ?
      ORDER BY bs.serviceDate DESC
    `).all(req.params.memberId);
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xizmat yozuvlarini olishda xatolik yuz berdi" });
  }
});

// Muayyan xizmat yozuvini olish
router.get("/:id", (req, res) => {
  try {
    const service = db.prepare(`
      SELECT bs.*, m.fullName, m.phone, m.qrCodeId
      FROM beauty_services bs
      LEFT JOIN members m ON bs.memberId = m.id
      WHERE bs.id = ?
    `).get(req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: "Hizmet kaydı bulunamadı" });
    }
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xizmat yozuvini olishda xatolik yuz berdi" });
  }
});

// Xizmat yozuvini yangilash
router.put("/:id", async (req, res) => {
  const { serviceName, serviceType, serviceDate, note, amount, discountPercent, paymentStatus, paymentMethod, paymentDate } = req.body;

  if (!serviceName) {
    return res.status(400).json({ error: "Xizmat nomi majburiy" });
  }

  // Agar serviceType berilgan bo'lsa, uni tekshirish
  if (serviceType && !isValidServiceType(serviceType)) {
    return res.status(400).json({ 
      error: "Noto'g'ri xizmat turi",
      validTypes: getAllServiceTypes()
    });
  }

  try {
    const stmt = db.prepare(`
      UPDATE beauty_services 
      SET serviceName = ?, serviceType = ?, serviceDate = ?, note = ?,
          amount = ?, discountPercent = ?, paymentStatus = ?, paymentMethod = ?, paymentDate = ?
      WHERE id = ?
    `);
    stmt.run(
      serviceName, 
      serviceType || null,
      serviceDate, 
      note || "",
      amount || 0,
      discountPercent || 0,
      paymentStatus || 'pending',
      paymentMethod || null,
      paymentDate || null,
      req.params.id
    );
    
    // Yangilangan service'ni olish
    const updatedService = db.prepare("SELECT * FROM beauty_services WHERE id = ?").get(req.params.id);
    
    // Firebase'ga avtomatik sync qilish
    try {
      await syncServiceToFirebase(updatedService);
    } catch (firebaseError) {
      console.error('⚠️  Firebase sync error (non-critical):', firebaseError.message);
    }
    
    res.json({ message: "Xizmat yozuvi muvaffaqiyatli yangilandi ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Yangilashda xatolik" });
  }
});

// Service kaydını sil
router.delete("/:id", async (req, res) => {
  try {
    const serviceId = req.params.id;
    console.log(`[DELETE /beauty/${serviceId}] Xizmatni o'chirish boshlandi`);
    
    // Avval service kaydini olish
    const service = db.prepare("SELECT * FROM beauty_services WHERE id = ?").get(serviceId);
    
    if (!service) {
      console.log(`[DELETE /beauty/${serviceId}] Xizmat topilmadi`);
      return res.status(404).json({ error: "Xizmat topilmadi" });
    }

    console.log(`[DELETE /beauty/${serviceId}] SQLite'dan o'chirilmoqda...`);
    // Service kaydini SQLite'dan o'chirish
    const deleteResult = db.prepare("DELETE FROM beauty_services WHERE id = ?").run(serviceId);
    
    if (deleteResult.changes === 0) {
      console.log(`[DELETE /beauty/${serviceId}] SQLite'dan o'chirilmadi (changes: 0)`);
      return res.status(500).json({ error: "Xizmat o'chirilmadi" });
    }

    console.log(`[DELETE /beauty/${serviceId}] SQLite'dan muvaffaqiyatli o'chirildi`);

    // Agar a'zoning boshqa service kaydi yo'q bo'lsa beautyHasRecord flag'ini yangilash
    const remainingServices = db.prepare("SELECT COUNT(*) as count FROM beauty_services WHERE memberId = ?").get(service.memberId);
    if (remainingServices.count === 0) {
      db.prepare("UPDATE members SET beautyHasRecord = 0, lastUpdated = datetime('now') WHERE id = ?").run(service.memberId);
      console.log(`[DELETE /beauty/${serviceId}] Member ${service.memberId} uchun beautyHasRecord = 0 qilindi`);
    }

    // Firebase'dan ham o'chirish
    let firebaseDeleted = false;
    try {
      console.log(`[DELETE /beauty/${serviceId}] Firebase'dan o'chirilmoqda...`);
      firebaseDeleted = await deleteServiceFromFirebase(serviceId);
      if (firebaseDeleted) {
        console.log(`[DELETE /beauty/${serviceId}] Firebase'dan muvaffaqiyatli o'chirildi`);
      } else {
        console.warn(`[DELETE /beauty/${serviceId}] Firebase'dan o'chirilmadi (non-critical)`);
      }
    } catch (firebaseError) {
      console.error(`[DELETE /beauty/${serviceId}] Firebase deletion error (non-critical):`, firebaseError.message);
      if (firebaseError.stack) {
        console.error('   Stack:', firebaseError.stack);
      }
    }

    res.json({ 
      message: "Xizmat yozuvi muvaffaqiyatli o'chirildi ✅",
      firebaseDeleted: firebaseDeleted
    });
  } catch (err) {
    console.error('[DELETE /beauty/:id] Xatolik:', err);
    res.status(500).json({ error: "O'chirishda xatolik", details: err.message });
  }
});

export default router;

