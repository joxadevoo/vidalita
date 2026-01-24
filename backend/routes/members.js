import express from "express";
import db from "../db/database.js";
import PDFDocument from "pdfkit";
import { createCanvas } from "canvas";
import JsBarcode from "jsbarcode";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

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
      const fs = (await import('fs')).default;

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
          console.warn('⚠️  Firebase configuration not found. Firebase deletion will be skipped.');
          return null;
        }
      }
      firestore = admin.firestore();
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

// Firebase'dan member va bog'liq yozuvlarni o'chirish
async function deleteMemberFromFirebase(memberId) {
  try {
    const db = await initializeFirebase();
    if (!db) {
      console.warn('⚠️  Firebase not initialized. Skipping Firebase deletion.');
      return false;
    }

    const memberIdStr = memberId.toString();
    let deletedCount = 0;

    // Member'ni o'chirish
    try {
      const memberRef = db.collection('members').doc(memberIdStr);
      const memberDoc = await memberRef.get();

      if (memberDoc.exists) {
        await memberRef.delete();
        deletedCount++;
        console.log(`✅ Deleted member ${memberIdStr} from Firebase`);
      } else {
        console.warn(`⚠️  Member ${memberIdStr} not found in Firebase (may already be deleted)`);
      }
    } catch (err) {
      console.error(`❌ Error deleting member ${memberIdStr} from Firebase:`, err.message);
      if (err.stack) {
        console.error('   Stack:', err.stack);
      }
    }

    // Bog'liq yozuvlarni o'chirish
    const collections = ['checkins', 'beauty_services', 'beauty_health_info', 'gym_info', 'gym_payments'];

    for (const collectionName of collections) {
      try {
        // memberId ni ham number ham string sifatida tekshirish
        const snapshotNumber = await db.collection(collectionName)
          .where('memberId', '==', parseInt(memberId))
          .get();

        const snapshotString = await db.collection(collectionName)
          .where('memberId', '==', memberIdStr)
          .get();

        // Ikkala natijani birlashtirish
        const allDocs = new Map();
        snapshotNumber.docs.forEach(doc => allDocs.set(doc.id, doc));
        snapshotString.docs.forEach(doc => allDocs.set(doc.id, doc));

        if (allDocs.size > 0) {
          const batch = db.batch();
          allDocs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          deletedCount += allDocs.size;
          console.log(`✅ Deleted ${allDocs.size} ${collectionName} records from Firebase for member ${memberIdStr}`);
        }
      } catch (err) {
        console.error(`❌ Error deleting ${collectionName} from Firebase:`, err.message);
        if (err.stack) {
          console.error('   Stack:', err.stack);
        }
      }
    }

    return deletedCount > 0;
  } catch (error) {
    console.error('❌ Error deleting from Firebase:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    return false;
  }
}

const router = express.Router();

// Unique ID generatsiya qilish funksiyasi (TGC + 6 ta belgi)
const generateUniqueId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let uniquePart = '';

  // 6 ta belgi generatsiya qilish
  for (let i = 0; i < 6; i++) {
    uniquePart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // TGC har doim qo'shiladi
  const uniqueId = `TGC${uniquePart}`;

  // Tekshirish - agar bunday ID mavjud bo'lsa, yangi generatsiya qilish
  const existing = db.prepare("SELECT id FROM members WHERE qrCodeId = ?").get(uniqueId);
  if (existing) {
    return generateUniqueId(); // Rekursiya orqali yangi ID generatsiya qilish
  }

  return uniqueId;
};

// Preview ID generatsiya qilish (sahifaga kirganda ko'rsatish uchun)
router.post("/preview-id", (req, res) => {
  try {
    const previewId = generateUniqueId();
    res.json({ qrCodeId: previewId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Preview ID generatsiya qilishda xatolik" });
  }
});

// Yangi a'zo qo'shish
router.post("/", (req, res) => {
  console.log('[POST /members] Request body:', JSON.stringify(req.body, null, 2));
  console.log('[POST /members] Request headers:', req.headers);

  const { fullName, phone, qrCodeId, joinDate, gymStart, gymEnd, gymActive, photo, birthDate, email, region, district } = req.body;

  // Validasyon
  if (!fullName) {
    console.error('[POST /members] Validation error: fullName is missing');
    return res.status(400).json({ error: "Ism majburiy" });
  }

  try {
    // Agar qrCodeId berilmagan bo'lsa, avtomatik generatsiya qilish
    let finalQrCodeId = qrCodeId;
    if (!finalQrCodeId || finalQrCodeId.trim() === '') {
      finalQrCodeId = generateUniqueId();
    } else {
      // Agar qrCodeId berilgan bo'lsa, unikalini tekshirish
      const existing = db.prepare("SELECT id FROM members WHERE qrCodeId = ?").get(finalQrCodeId);
      if (existing) {
        return res.status(400).json({ error: "Bu ID allaqachon mavjud. Avtomatik generatsiya qilish uchun ID maydonini bo'sh qoldiring." });
      }
    }

    const stmt = db.prepare(`
      INSERT INTO members 
      (fullName, phone, gender, qrCodeId, joinDate, gymStart, gymEnd, gymActive, beautyHasRecord, lastUpdated, photo, birthDate, email, region, district)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?)
    `);
    const params = [
      fullName || null,
      phone || null,
      null, // gender - olib tashlandi
      finalQrCodeId,
      joinDate || null,
      gymStart || null,
      gymEnd || null,
      gymActive !== undefined ? (gymActive ? 1 : 0) : 1, // gymActive - request'dan olingan yoki default 1
      0, // beautyHasRecord - har doim 0, chunki yangi a'zoda xizmat yo'q
      photo || null,
      birthDate || null,
      email || null,
      region || null,
      district || null
    ];

    console.log('[POST /members] SQL parameters count:', params.length);
    console.log('[POST /members] SQL parameters:', params.map((p, i) => `${i + 1}. ${p === null ? 'NULL' : (typeof p === 'string' && p.length > 50 ? p.substring(0, 50) + '...' : p)}`));

    const result = stmt.run(...params);
    console.log('[POST /members] Success! Inserted ID:', result.lastInsertRowid);

    res.json({
      message: "A'zo muvaffaqiyatli qo'shildi ✅",
      id: result.lastInsertRowid,
      qrCodeId: finalQrCodeId
    });
  } catch (err) {
    console.error('[POST /members] Xatolik:', err);
    console.error('[POST /members] Error stack:', err.stack);
    console.error('[POST /members] Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({
      error: "Ro'yxatga olishda xatolik yoki ID allaqachon mavjud.",
      details: err.message
    });
  }
});

// Barcha a'zolarni olish
router.get("/", (req, res) => {
  try {
    const members = db.prepare("SELECT * FROM members ORDER BY lastUpdated DESC").all();
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "A'zolarni olishda xatolik yuz berdi" });
  }
});

// ID orqali a'zo topish
router.get("/qr/:code", (req, res) => {
  try {
    const member = db.prepare("SELECT * FROM members WHERE qrCodeId = ?").get(req.params.code);
    if (!member) {
      return res.status(404).json({ error: "A'zo topilmadi" });
    }
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "A'zo qidirishda xatolik yuz berdi" });
  }
});

// A'zoning gym ma'lumotlarini olish (/:id dan oldin bo'lishi kerak)
router.get("/:id/gym-info", (req, res) => {
  try {
    const gymInfo = db.prepare("SELECT * FROM gym_info WHERE memberId = ?").get(req.params.id);
    if (!gymInfo) {
      return res.status(404).json({ error: "Gym ma'lumotlari topilmadi" });
    }
    res.json(gymInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gym ma'lumotlarini olishda xatolik yuz berdi" });
  }
});

// A'zoning beauty sog'liq ma'lumotlarini olish (/:id dan oldin bo'lishi kerak)
router.get("/:id/beauty-health", (req, res) => {
  try {
    const health = db.prepare("SELECT * FROM beauty_health_info WHERE memberId = ?").get(req.params.id);
    if (!health) {
      return res.status(404).json({ error: "Sog'liq ma'lumotlari topilmadi" });
    }
    res.json(health);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sog'liq ma'lumotlarini olishda xatolik yuz berdi" });
  }
});

// ID orqali a'zo olish
router.get("/:id", (req, res) => {
  try {
    const member = db.prepare("SELECT * FROM members WHERE id = ?").get(req.params.id);
    if (!member) {
      return res.status(404).json({ error: "A'zo topilmadi" });
    }
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "A'zoni olishda xatolik yuz berdi" });
  }
});

// Barcha a'zolarni va ularning ma'lumotlarini o'chirish (/:id dan oldin bo'lishi kerak)
router.delete("/all", (req, res) => {
  try {
    // CASCADE DELETE tufayli members jadvalini tozalash barcha bog'liq yozuvlarni ham o'chiradi
    const result = db.prepare("DELETE FROM members").run();

    res.json({
      message: "Barcha a'zolar va ularning ma'lumotlari muvaffaqiyatli o'chirildi ✅",
      deletedCount: result.changes
    });
  } catch (err) {
    console.error('[DELETE /members/all] Xatolik:', err);
    res.status(500).json({ error: "O'chirishda xatolik", details: err.message });
  }
});

// A'zoni yangilash
router.put("/:id", (req, res) => {
  const { fullName, phone, qrCodeId, joinDate, gymStart, gymEnd, gymActive, photo, birthDate, email, region, district } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE members 
      SET fullName = ?, phone = ?, gender = ?, qrCodeId = ?, joinDate = ?, 
          gymStart = ?, gymEnd = ?, gymActive = ?, photo = ?, birthDate = ?, 
          email = ?, region = ?, district = ?, lastUpdated = datetime('now')
      WHERE id = ?
    `);
    stmt.run(
      fullName,
      phone,
      null, // gender - olib tashlandi
      qrCodeId,
      joinDate,
      gymStart,
      gymEnd,
      gymActive ? 1 : 0,
      photo || null,
      birthDate || null,
      email || null,
      region || null,
      district || null,
      req.params.id
    );

    res.json({ message: "A'zo muvaffaqiyatli yangilandi ✅" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Yangilashda xatolik" });
  }
});

// Gym ma'lumotlarini saqlash
router.post("/gym-info", (req, res) => {
  const {
    memberId,
    emergencyName,
    emergencyPhone,
    emergencyRelation,
    medicalConditions,
    medications,
    fitnessGoals,
    membershipType,
    membershipTypeOther,
    paymentMethod,
    paymentMethodOther
  } = req.body;

  if (!memberId) {
    return res.status(400).json({ error: "A'zo ID majburiy" });
  }

  try {
    // Avval mavjud yozuvni tekshirish
    const existing = db.prepare("SELECT id FROM gym_info WHERE memberId = ?").get(memberId);

    if (existing) {
      // Yangilash
      const stmt = db.prepare(`
        UPDATE gym_info SET
          emergencyName = ?, emergencyPhone = ?, emergencyRelation = ?,
          medicalConditions = ?, medications = ?, fitnessGoals = ?,
          membershipType = ?, membershipTypeOther = ?,
          paymentMethod = ?, paymentMethodOther = ?
        WHERE memberId = ?
      `);
      stmt.run(
        emergencyName, emergencyPhone, emergencyRelation,
        medicalConditions, medications, fitnessGoals,
        membershipType, membershipTypeOther,
        paymentMethod, paymentMethodOther, memberId
      );
    } else {
      // Yangi yozuv
      const stmt = db.prepare(`
        INSERT INTO gym_info (
          memberId, emergencyName, emergencyPhone, emergencyRelation,
          medicalConditions, medications, fitnessGoals,
          membershipType, membershipTypeOther,
          paymentMethod, paymentMethodOther
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        memberId, emergencyName, emergencyPhone, emergencyRelation,
        medicalConditions, medications, fitnessGoals,
        membershipType, membershipTypeOther,
        paymentMethod, paymentMethodOther
      );
    }

    res.json({ message: "Gym ma'lumotlari muvaffaqiyatli saqlandi ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gym ma'lumotlarini saqlashda xatolik yuz berdi" });
  }
});

// Beauty sog'liq ma'lumotlarini saqlash
router.post("/beauty-health", (req, res) => {
  const {
    memberId,
    bloodPressure,
    diabetes,
    cancer,
    cancerDetails,
    cancerTreatment,
    cancerTreatmentDetails,
    hormonal,
    thyroid,
    skin,
    skinDetails,
    alcohol,
    prosthesis,
    platinum,
    implants,
    crowns,
    surgery,
    surgeryDetails,
    surgeryDate,
    smoking,
    medications
  } = req.body;

  if (!memberId) {
    return res.status(400).json({ error: "A'zo ID majburiy" });
  }

  try {
    // Avval mavjud yozuvni tekshirish
    const existing = db.prepare("SELECT id FROM beauty_health_info WHERE memberId = ?").get(memberId);

    if (existing) {
      // Yangilash
      const stmt = db.prepare(`
        UPDATE beauty_health_info SET
          bloodPressure = ?, diabetes = ?, cancer = ?, cancerDetails = ?,
          cancerTreatment = ?, cancerTreatmentDetails = ?, hormonal = ?,
          thyroid = ?, skin = ?, skinDetails = ?, alcohol = ?,
          prosthesis = ?, platinum = ?, implants = ?, crowns = ?,
          surgery = ?, surgeryDetails = ?, surgeryDate = ?,
          smoking = ?, medications = ?
        WHERE memberId = ?
      `);
      stmt.run(
        bloodPressure, diabetes, cancer, cancerDetails,
        cancerTreatment, cancerTreatmentDetails, hormonal,
        thyroid, skin, skinDetails, alcohol,
        prosthesis, platinum, implants, crowns,
        surgery, surgeryDetails, surgeryDate,
        smoking, medications, memberId
      );
    } else {
      // Yangi yozuv
      const stmt = db.prepare(`
        INSERT INTO beauty_health_info (
          memberId, bloodPressure, diabetes, cancer, cancerDetails,
          cancerTreatment, cancerTreatmentDetails, hormonal,
          thyroid, skin, skinDetails, alcohol,
          prosthesis, platinum, implants, crowns,
          surgery, surgeryDetails, surgeryDate,
          smoking, medications
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        memberId, bloodPressure, diabetes, cancer, cancerDetails,
        cancerTreatment, cancerTreatmentDetails, hormonal,
        thyroid, skin, skinDetails, alcohol,
        prosthesis, platinum, implants, crowns,
        surgery, surgeryDetails, surgeryDate,
        smoking, medications
      );
    }

    res.json({ message: "Sog'liq ma'lumotlari muvaffaqiyatli saqlandi ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sog'liq ma'lumotlarini saqlashda xatolik yuz berdi" });
  }
});

// A'zo rasmini yangilash
router.put("/:id/photo", (req, res) => {
  const { photo } = req.body;

  if (!photo) {
    return res.status(400).json({ error: "Rasm majburiy" });
  }

  try {
    const stmt = db.prepare("UPDATE members SET photo = ?, lastUpdated = datetime('now') WHERE id = ?");
    stmt.run(photo, req.params.id);
    res.json({ message: "Rasm muvaffaqiyatli yangilandi ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Rasmni yangilashda xatolik" });
  }
});

// ID card PDF yaratish
router.get("/:id/id-card-pdf", async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = db.prepare("SELECT * FROM members WHERE id = ?").get(memberId);

    if (!member) {
      return res.status(404).json({ error: "A'zo topilmadi" });
    }

    // PDF yaratish - bitta sahifa
    const doc = new PDFDocument({
      size: [125, 88], // mm (ID card o'lchami)
      margin: 0,
      layout: 'landscape'
    });

    // Response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ID-Card-${member.qrCodeId}.pdf"`);

    doc.pipe(res);

    // PDF o'lchamlari (mm dan point'ga: 1mm = 2.83465 points)
    const pageWidth = 125 * 2.83465;  // ~354 points
    const pageHeight = 88 * 2.83465;  // ~249 points

    // Background - och sariq/beige
    doc.rect(0, 0, pageWidth, pageHeight)
      .fillColor('#fef3c7')
      .fill();

    // Padding
    const padding = 12;
    const contentWidth = pageWidth - (padding * 2);
    const contentHeight = pageHeight - (padding * 2);

    // Header - markazda
    const headerY = padding + 5;
    doc.fillColor('#d97706')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('VIDALITA', padding, headerY, {
        width: contentWidth,
        align: 'center'
      });

    doc.fillColor('#f59e0b')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('GYM & BEAUTY', padding, headerY + 20, {
        width: contentWidth,
        align: 'center'
      });

    // Header chiziq
    const lineY = headerY + 35;
    doc.strokeColor('#f59e0b')
      .lineWidth(3)
      .moveTo(padding, lineY)
      .lineTo(pageWidth - padding, lineY)
      .stroke();

    // Ma'lumotlar va rasm uchun joy
    const contentStartY = lineY + 12;
    const leftSectionWidth = contentWidth - 90; // Rasm uchun 90 point
    const rightImageX = pageWidth - padding - 80;
    const rightImageY = contentStartY;
    const imageSize = 70;

    // ID
    doc.fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('ID:', padding, contentStartY);

    doc.fillColor('#1e293b')
      .fontSize(16)
      .font('Courier-Bold')
      .text(member.qrCodeId || 'N/A', padding, contentStartY + 12);

    // Name
    doc.fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Name:', padding, contentStartY + 35);

    doc.fillColor('#1e293b')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(member.fullName || 'N/A', padding, contentStartY + 47, {
        width: leftSectionWidth
      });

    // Date
    if (member.birthDate || member.joinDate) {
      const dateStr = member.birthDate || member.joinDate;
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

      doc.fillColor('#64748b')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Date:', padding, contentStartY + 65);

      doc.fillColor('#475569')
        .fontSize(10)
        .font('Helvetica')
        .text(formattedDate, padding, contentStartY + 77);
    }

    // Member rasmi - o'ng tomonda
    if (member.photo) {
      try {
        let imageBuffer = null;

        if (member.photo.startsWith('data:image')) {
          const base64Data = member.photo.replace(/^data:image\/\w+;base64,/, '');
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else if (member.photo.startsWith('http://') || member.photo.startsWith('https://')) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const imageResponse = await fetch(member.photo, {
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (imageResponse.ok) {
              imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            }
          } catch (fetchErr) {
            console.error('Rasm URL yuklashda xatolik:', fetchErr);
          }
        }

        if (imageBuffer) {
          // Rasm uchun border
          doc.rect(rightImageX - 2, rightImageY - 2, imageSize + 4, imageSize + 4)
            .fillColor('#ffffff')
            .fill()
            .strokeColor('#0284c7')
            .lineWidth(2)
            .stroke();

          doc.image(imageBuffer, rightImageX, rightImageY, {
            width: imageSize,
            height: imageSize,
            fit: [imageSize, imageSize]
          });
        }
      } catch (err) {
        console.error('Rasm yuklashda xatolik:', err);
      }
    }

    // Barcode - pastki qismda, markazda
    const barcodeY = pageHeight - padding - 30;
    const barcodeWidth = contentWidth - 20;
    const barcodeHeight = 20;

    try {
      // Canvas yaratish
      const canvasWidth = Math.min(Math.round(barcodeWidth * 1.5), 500);
      const canvasHeight = Math.min(Math.round(barcodeHeight * 1.5), 50);
      const canvas = createCanvas(canvasWidth, canvasHeight);

      // Barcode yaratish
      JsBarcode(canvas, member.qrCodeId || 'TGC000000', {
        format: 'CODE128',
        width: 2,
        height: canvasHeight,
        displayValue: false,
        margin: 0,
        background: '#ffffff',
        lineColor: '#000000'
      });

      const barcodeBuffer = canvas.toBuffer('image/png');

      // Barcode container - oq background
      const barcodeX = padding + 10;
      doc.rect(barcodeX - 3, barcodeY - 3, barcodeWidth + 6, barcodeHeight + 6)
        .fillColor('#ffffff')
        .fill()
        .strokeColor('#cbd5e1')
        .lineWidth(1)
        .stroke();

      // Barcode'ni qo'shish
      doc.image(barcodeBuffer, barcodeX, barcodeY, {
        width: barcodeWidth,
        height: barcodeHeight
      });
    } catch (err) {
      console.error('Barcode yaratishda xatolik:', err);
      doc.fillColor('#000000')
        .fontSize(8)
        .font('Courier')
        .text(member.qrCodeId || 'N/A', padding, barcodeY, {
          align: 'center',
          width: contentWidth
        });
    }

    doc.end();
  } catch (err) {
    console.error('PDF yaratishda xatolik:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: "PDF yaratishda xatolik yuz berdi", details: err.message });
    }
  }
});

// A'zoni o'chirish
router.delete("/:id", async (req, res) => {
  try {
    const memberId = req.params.id;

    // Avval a'zo mavjudligini tekshirish
    const member = db.prepare("SELECT * FROM members WHERE id = ?").get(memberId);
    if (!member) {
      return res.status(404).json({ error: "A'zo topilmadi" });
    }

    // Barcha bog'liq yozuvlarni tekshirish
    const checkinsCount = db.prepare("SELECT COUNT(*) as count FROM checkins WHERE memberId = ?").get(memberId);
    const servicesCount = db.prepare("SELECT COUNT(*) as count FROM beauty_services WHERE memberId = ?").get(memberId);
    const healthCount = db.prepare("SELECT COUNT(*) as count FROM beauty_health_info WHERE memberId = ?").get(memberId);
    const gymInfoCount = db.prepare("SELECT COUNT(*) as count FROM gym_info WHERE memberId = ?").get(memberId);
    const paymentsCount = db.prepare("SELECT COUNT(*) as count FROM gym_payments WHERE memberId = ?").get(memberId);

    const totalRecords = checkinsCount.count + servicesCount.count + healthCount.count + gymInfoCount.count + paymentsCount.count;

    console.log(`[DELETE /members/${memberId}] Bog'liq yozuvlar:`, {
      checkins: checkinsCount.count,
      services: servicesCount.count,
      health: healthCount.count,
      gymInfo: gymInfoCount.count,
      payments: paymentsCount.count,
      total: totalRecords
    });

    // Faqat xizmatlar mavjud bo'lsa o'chirishni bloklash
    if (servicesCount.count > 0) {
      return res.status(400).json({
        error: "A'zoni o'chirib bo'lmaydi",
        message: "Bu a'zoda xizmatlar mavjud. Avval xizmatlarni o'chiring yoki boshqa amal bajaring.",
        records: {
          checkins: checkinsCount.count,
          services: servicesCount.count,
          payments: paymentsCount.count,
          health: healthCount.count,
          gymInfo: gymInfoCount.count
        }
      });
    }

    // Barcha bog'liq yozuvlarni avtomatik o'chirish
    // 1. Kirish tarixi
    const deletedCheckins = db.prepare("DELETE FROM checkins WHERE memberId = ?").run(memberId);

    // 2. Gym to'lovlar
    const deletedPayments = db.prepare("DELETE FROM gym_payments WHERE memberId = ?").run(memberId);

    // 3. Beauty health info
    const deletedHealth = db.prepare("DELETE FROM beauty_health_info WHERE memberId = ?").run(memberId);

    // 4. Gym info
    const deletedGymInfo = db.prepare("DELETE FROM gym_info WHERE memberId = ?").run(memberId);

    console.log(`[DELETE /members/${memberId}] O'chirilgan yozuvlar:`, {
      checkins: deletedCheckins.changes,
      payments: deletedPayments.changes,
      health: deletedHealth.changes,
      gymInfo: deletedGymInfo.changes
    });

    // 3. A'zoni o'chirish
    const deletedMember = db.prepare("DELETE FROM members WHERE id = ?").run(memberId);

    if (deletedMember.changes === 0) {
      return res.status(500).json({ error: "A'zo o'chirilmadi" });
    }

    // Firebase'dan ham o'chirish
    let firebaseDeleted = false;
    try {
      console.log(`[DELETE /members/${memberId}] Firebase'dan o'chirilmoqda...`);
      firebaseDeleted = await deleteMemberFromFirebase(memberId);
      if (firebaseDeleted) {
        console.log(`[DELETE /members/${memberId}] Firebase'dan muvaffaqiyatli o'chirildi`);
      } else {
        console.warn(`[DELETE /members/${memberId}] Firebase'dan o'chirilmadi (non-critical)`);
      }
    } catch (firebaseError) {
      console.error(`[DELETE /members/${memberId}] Firebase deletion error (non-critical):`, firebaseError.message);
      if (firebaseError.stack) {
        console.error('   Stack:', firebaseError.stack);
      }
      // Firebase xatosi kritik emas, SQLite'dan o'chirilgan
    }

    res.json({
      message: "A'zo va bog'liq yozuvlar (kirish tarixi, to'lovlar, sog'liq/gym ma'lumotlari) o'chirildi ✅",
      deleted: {
        checkins: deletedCheckins.changes,
        payments: deletedPayments.changes,
        health: deletedHealth.changes,
        gymInfo: deletedGymInfo.changes
      },
      firebaseDeleted: firebaseDeleted
    });
  } catch (err) {
    console.error('[DELETE /members/:id] Xatolik:', err);
    res.status(500).json({ error: "O'chirishda xatolik", details: err.message });
  }
});

export default router;
