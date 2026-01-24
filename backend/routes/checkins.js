import express from "express";
import db from "../db/database.js";
import { getCurrentDateTimeSQLite } from "../utils/dateUtils.js";

const router = express.Router();

// Check-in işlemi
router.post("/", (req, res) => {
  const { qrCodeId, verifiedBy } = req.body;

  if (!qrCodeId) {
    return res.status(400).json({ error: "ID majburiy" });
  }

  try {
    const member = db.prepare("SELECT * FROM members WHERE qrCodeId = ?").get(qrCodeId);

    if (!member) {
      return res.status(404).json({ error: "A'zo topilmadi. ID noto'g'ri." });
    }

    if (member.gymActive !== 1) {
      return res.status(400).json({ error: "A'zolik faol emas" });
    }

    // Obuna muddatini tekshirish
    if (member.gymEnd) {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD formatida
      const endDate = member.gymEnd.slice(0, 10); // YYYY-MM-DD formatida
      
      if (endDate < today) {
        const formattedDate = new Date(member.gymEnd).toLocaleDateString('uz-UZ', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        return res.status(400).json({ 
          error: `Obuna muddati tugagan. Tugash sanasi: ${formattedDate}` 
        });
      }
    }

    // Bugungi kirishni tekshirish (bir kunda bir marta kirish)
    const todayCheckin = db.prepare(`
      SELECT * FROM checkins 
      WHERE memberId = ? AND date(checkins.date) = date('now')
      LIMIT 1
    `).get(member.id);

    if (todayCheckin) {
      return res.status(400).json({ 
        error: "Bugun allaqachon kirish qayd etilgan" 
      });
    }

    // Tashkent timezone'da hozirgi vaqtni olish
    const currentDateTime = getCurrentDateTimeSQLite();

    db.prepare(`
      INSERT INTO checkins (memberId, qrCodeId, date, verifiedBy, synced)
      VALUES (?, ?, ?, ?, 0)
    `).run(member.id, qrCodeId, currentDateTime, verifiedBy || "system");

    res.json({ 
      message: "Kirish muvaffaqiyatli ✅", 
      member: {
        id: member.id,
        fullName: member.fullName,
        phone: member.phone,
        qrCodeId: member.qrCodeId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kirish-chiqish saqlashda xatolik yuz berdi" });
  }
});

// Barcha kirish-chiqishlarni olish
router.get("/", (req, res) => {
  try {
    const checkins = db.prepare(`
      SELECT c.*, m.fullName, m.phone 
      FROM checkins c
      LEFT JOIN members m ON c.memberId = m.id
      ORDER BY c.date DESC
    `).all();
    res.json(checkins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kirish-chiqishlarni olishda xatolik yuz berdi" });
  }
});

// Muayyan a'zoning kirish-chiqishlarini olish
router.get("/member/:memberId", (req, res) => {
  try {
    const checkins = db.prepare(`
      SELECT c.*, m.fullName, m.phone 
      FROM checkins c
      LEFT JOIN members m ON c.memberId = m.id
      WHERE c.memberId = ?
      ORDER BY c.date DESC
    `).all(req.params.memberId);
    res.json(checkins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kirish-chiqishlarni olishda xatolik yuz berdi" });
  }
});

// Muayyan sana oralig'idagi kirish-chiqishlarni olish
router.get("/date/:startDate/:endDate", (req, res) => {
  try {
    const checkins = db.prepare(`
      SELECT c.*, m.fullName, m.phone 
      FROM checkins c
      LEFT JOIN members m ON c.memberId = m.id
      WHERE date(c.date) BETWEEN date(?) AND date(?)
      ORDER BY c.date DESC
    `).all(req.params.startDate, req.params.endDate);
    res.json(checkins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kirish-chiqishlarni olishda xatolik yuz berdi" });
  }
});

// Kirish-chiqishni o'chirish
router.delete("/:id", (req, res) => {
  try {
    const stmt = db.prepare("DELETE FROM checkins WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ message: "Kirish-chiqish muvaffaqiyatli o'chirildi ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "O'chirishda xatolik" });
  }
});

export default router;

