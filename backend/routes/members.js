import express from "express";
import supabase from "../db/supabase.js";
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

// Helper to map Supabase row (lowercase) to Frontend (CamelCase)
const mapMemberToCamelCase = (member) => {
  if (!member) return null;
  return {
    id: member.id,
    fullName: member.fullname,
    phone: member.phone,
    gender: member.gender,
    qrCodeId: member.qrcodeid,
    joinDate: member.joindate,
    gymStart: member.gymstart,
    gymEnd: member.gymend,
    gymActive: member.gymactive,
    beautyHasRecord: member.beautyhasrecord,
    lastUpdated: member.lastupdated,
    synced: member.synced,
    photo: member.photo,
    birthDate: member.birthdate,
    email: member.email,
    region: member.region,
    district: member.district
  };
};

const mapGymInfoToCamelCase = (info) => {
  if (!info) return null;
  return {
    id: info.id,
    memberId: info.memberid,
    emergencyName: info.emergencyname,
    emergencyPhone: info.emergencyphone,
    emergencyRelation: info.emergencyrelation,
    medicalConditions: info.medicalconditions,
    medications: info.medications,
    fitnessGoals: info.fitnessgoals,
    membershipType: info.membershiptype,
    membershipTypeOther: info.membershiptypeother,
    paymentMethod: info.paymentmethod,
    paymentMethodOther: info.paymentmethodother
  };
};

const mapHealthInfoToCamelCase = (info) => {
  if (!info) return null;
  return {
    id: info.id,
    memberId: info.memberid,
    bloodPressure: info.bloodpressure,
    diabetes: info.diabetes,
    cancer: info.cancer,
    cancerDetails: info.cancerdetails,
    cancerTreatment: info.cancertreatment,
    cancerTreatmentDetails: info.cancertreatmentdetails,
    hormonal: info.hormonal,
    thyroid: info.thyroid,
    skin: info.skin,
    skinDetails: info.skindetails,
    alcohol: info.alcohol,
    prosthesis: info.prosthesis,
    platinum: info.platinum,
    implants: info.implants,
    crowns: info.crowns,
    surgery: info.surgery,
    surgeryDetails: info.surgerydetails,
    surgeryDate: info.surgerydate,
    smoking: info.smoking,
    medications: info.medications
  };
};

const router = express.Router();

// Unique ID generatsiya qilish funksiyasi (TGC + 6 ta belgi)
const generateUniqueId = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let uniquePart = '';

  // 6 ta belgi generatsiya qilish
  for (let i = 0; i < 6; i++) {
    uniquePart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // TGC har doim qo'shiladi
  const uniqueId = `TGC${uniquePart}`;

  // Tekshirish - agar bunday ID mavjud bo'lsa, yangi generatsiya qilish
  const { data: existing } = await supabase.from('members').select('id').eq('qrcodeid', uniqueId).single();
  if (existing) {
    return generateUniqueId(); // Rekursiya orqali yangi ID generatsiya qilish
  }

  return uniqueId;
};

// Preview ID generatsiya qilish (sahifaga kirganda ko'rsatish uchun)
router.post("/preview-id", async (req, res) => {
  try {
    const previewId = await generateUniqueId();
    res.json({ qrCodeId: previewId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Preview ID generatsiya qilishda xatolik" });
  }
});

// Yangi a'zo qo'shish
router.post("/", async (req, res) => {
  console.log('[POST /members] Request body:', JSON.stringify(req.body, null, 2));

  const { fullName, phone, qrCodeId, joinDate, gymStart, gymEnd, gymActive, photo, birthDate, email, region, district } = req.body;

  // Validaxon
  if (!fullName) {
    return res.status(400).json({ error: "Ism majburiy" });
  }

  try {
    // Agar qrCodeId berilmagan bo'lsa, avtomatik generatsiya qilish
    let finalQrCodeId = qrCodeId;
    if (!finalQrCodeId || finalQrCodeId.trim() === '') {
      finalQrCodeId = await generateUniqueId();
    } else {
      // Agar qrCodeId berilgan bo'lsa, unikalini tekshirish
      const { data: existing } = await supabase.from('members').select('id').eq('qrcodeid', finalQrCodeId).single();
      if (existing) {
        return res.status(400).json({ error: "Bu ID allaqachon mavjud. Avtomatik generatsiya qilish uchun ID maydonini bo'sh qoldiring." });
      }
    }

    const memberData = {
      fullname: fullName || null,
      phone: phone || null,
      qrcodeid: finalQrCodeId,
      joindate: joinDate || null,
      gymstart: gymStart || null,
      gymend: gymEnd || null,
      gymactive: gymActive !== undefined ? (gymActive ? 1 : 0) : 1,
      beautyhasrecord: 0,
      lastupdated: new Date().toISOString(),
      photo: photo || null,
      birthdate: birthDate || null,
      email: email || null,
      region: region || null,
      district: district || null
    };

    const { data, error } = await supabase.from('members').insert(memberData).select().single();

    if (error) throw error;

    res.json({
      message: "A'zo muvaffaqiyatli qo'shildi ✅",
      id: data.id,
      qrCodeId: finalQrCodeId
    });
  } catch (err) {
    console.error('[POST /members] Xatolik:', err);
    res.status(500).json({
      error: "Ro'yxatga olishda xatolik yoki ID allaqachon mavjud.",
      details: err.message
    });
  }
});

// Barcha a'zolarni olish
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from('members').select('*').order('lastupdated', { ascending: false });
    if (error) throw error;
    res.json(data.map(mapMemberToCamelCase));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "A'zolarni olishda xatolik yuz berdi" });
  }
});

// ID orqali a'zo topish
router.get("/qr/:code", async (req, res) => {
  try {
    const { data, error } = await supabase.from('members').select('*').eq('qrcodeid', req.params.code).maybeSingle();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "A'zo topilmadi" });
    }
    res.json(mapMemberToCamelCase(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "A'zo qidirishda xatolik yuz berdi" });
  }
});

// A'zoning gym ma'lumotlarini olish (/:id dan oldin bo'lishi kerak)
router.get("/:id/gym-info", async (req, res) => {
  try {
    const { data, error } = await supabase.from('gym_info').select('*').eq('memberid', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Gym ma'lumotlari topilmadi" });
    }
    res.json(mapGymInfoToCamelCase(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gym ma'lumotlarini olishda xatolik yuz berdi" });
  }
});

// A'zoning beauty sog'liq ma'lumotlarini olish (/:id dan oldin bo'lishi kerak)
router.get("/:id/beauty-health", async (req, res) => {
  try {
    const { data, error } = await supabase.from('beauty_health_info').select('*').eq('memberid', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Sog'liq ma'lumotlari topilmadi" });
    }
    res.json(mapHealthInfoToCamelCase(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sog'liq ma'lumotlarini olishda xatolik yuz berdi" });
  }
});

// ID orqali a'zo olish
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('members').select('*').eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "A'zo topilmadi" });
    }
    res.json(mapMemberToCamelCase(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "A'zoni olishda xatolik yuz berdi" });
  }
});

// Barcha a'zolarni va ularning ma'lumotlarini o'chirish (/:id dan oldin bo'lishi kerak)
router.delete("/all", async (req, res) => {
  try {
    const { count, error } = await supabase.from('members').delete({ count: 'exact' }).gt('id', 0);
    if (error) throw error;

    res.json({
      message: "Barcha a'zolar va ularning ma'lumotlari muvaffaqiyatli o'chirildi ✅",
      deletedCount: count
    });
  } catch (err) {
    console.error('[DELETE /members/all] Xatolik:', err);
    res.status(500).json({ error: "O'chirishda xatolik", details: err.message });
  }
});

// A'zoni yangilash
router.put("/:id", async (req, res) => {
  const { fullName, phone, qrCodeId, joinDate, gymStart, gymEnd, gymActive, photo, birthDate, email, region, district } = req.body;

  try {
    const updateData = {
      fullname: fullName,
      phone: phone,
      qrcodeid: qrCodeId,
      joindate: joinDate,
      gymstart: gymStart,
      gymend: gymEnd,
      gymactive: gymActive ? 1 : 0,
      photo: photo || null,
      birthdate: birthDate || null,
      email: email || null,
      region: region || null,
      district: district || null,
      lastupdated: new Date().toISOString()
    };

    const { error } = await supabase.from('members').update(updateData).eq('id', req.params.id);
    if (error) throw error;

    res.json({ message: "A'zo muvaffaqiyatli yangilandi ✅" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Yangilashda xatolik" });
  }
});

// Gym ma'lumotlarini saqlash
router.post("/gym-info", async (req, res) => {
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
    const gymData = {
      memberid: memberId,
      emergencyname: emergencyName,
      emergencyphone: emergencyPhone,
      emergencyrelation: emergencyRelation,
      medicalconditions: medicalConditions,
      medications: medications,
      fitnessgoals: fitnessGoals,
      membershiptype: membershipType,
      membershiptypeother: membershipTypeOther,
      paymentmethod: paymentMethod,
      paymentmethodother: paymentMethodOther
    };

    const { data: existing } = await supabase.from('gym_info').select('id').eq('memberid', memberId).maybeSingle();

    if (existing) {
      const { error } = await supabase.from('gym_info').update(gymData).eq('memberid', memberId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('gym_info').insert(gymData);
      if (error) throw error;
    }

    res.json({ message: "Gym ma'lumotlari muvaffaqiyatli saqlandi ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gym ma'lumotlarini saqlashda xatolik yuz berdi" });
  }
});

// Beauty sog'liq ma'lumotlarini saqlash
router.post("/beauty-health", async (req, res) => {
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
    const healthData = {
      memberid: memberId,
      bloodpressure: bloodPressure,
      diabetes: diabetes,
      cancer: cancer,
      cancerdetails: cancerDetails,
      cancertreatment: cancerTreatment,
      cancertreatmentdetails: cancerTreatmentDetails,
      hormonal: hormonal,
      thyroid: thyroid,
      skin: skin,
      skindetails: skinDetails,
      alcohol: alcohol,
      prosthesis: prosthesis,
      platinum: platinum,
      implants: implants,
      crowns: crowns,
      surgery: surgery,
      surgerydetails: surgeryDetails,
      surgerydate: surgeryDate,
      smoking: smoking,
      medications: medications
    };

    const { data: existing } = await supabase.from('beauty_health_info').select('id').eq('memberid', memberId).maybeSingle();

    if (existing) {
      const { error } = await supabase.from('beauty_health_info').update(healthData).eq('memberid', memberId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('beauty_health_info').insert(healthData);
      if (error) throw error;
    }

    res.json({ message: "Sog'liq ma'lumotlari muvaffaqiyatli saqlandi ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sog'liq ma'lumotlarini saqlashda xatolik yuz berdi" });
  }
});

// A'zo rasmini yangilash
router.put("/:id/photo", async (req, res) => {
  const { photo } = req.body;

  if (!photo) {
    return res.status(400).json({ error: "Rasm majburiy" });
  }

  try {
    const { error } = await supabase.from('members').update({ photo, lastupdated: new Date().toISOString() }).eq('id', req.params.id);
    if (error) throw error;
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
    const { data: member, error: memberError } = await supabase.from('members').select('*').eq('id', memberId).maybeSingle();
    if (memberError) throw memberError;
    if (!member) {
      return res.status(404).json({ error: "A'zo topilmadi" });
    }

    // Barcha bog'liq yozuvlarni tekshirish (faqat xizmatlar uchun bloklash mantiqi saqlanadi)
    const { count: servicesCount } = await supabase.from('beauty_services').select('*', { count: 'exact', head: true }).eq('memberid', memberId);

    // Faqat xizmatlar mavjud bo'lsa o'chirishni bloklash
    if (servicesCount > 0) {
      return res.status(400).json({
        error: "A'zoni o'chirib bo'lmaydi",
        message: "Bu a'zoda xizmatlar mavjud. Avval xizmatlarni o'chiring yoki boshqa amal bajaring."
      });
    }

    // Barcha bog'liq yozuvlarni avtomatik o'chirish (CASCADE orqali)
    // 1. A'zoni o'chirish
    const { error: deleteError } = await supabase.from('members').delete().eq('id', memberId);
    if (deleteError) throw deleteError;

    res.json({
      message: "A'zo va bog'liq yozuvlar o'chirildi ✅"
    });
  } catch (err) {
    console.error('[DELETE /members/:id] Xatolik:', err);
    res.status(500).json({ error: "O'chirishda xatolik", details: err.message });
  }
});

export default router;
