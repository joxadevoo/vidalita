import express from "express";
import db from "../db/database.js";

const router = express.Router();

// GET /api/gym-memberships - Barcha gym obunalarini olish
router.get("/", (req, res) => {
    try {
        const memberships = db.prepare(`
      SELECT 
        gm.*,
        m.fullName,
        m.phone,
        m.qrCodeId
      FROM gym_memberships gm
      LEFT JOIN members m ON gm.memberId = m.id
      ORDER BY gm.createdAt DESC
    `).all();

        res.json(memberships);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunalarini olishda xatolik" });
    }
});

// GET /api/gym-memberships/member/:memberId - A'zo uchun gym obunalarini olish
router.get("/member/:memberId", (req, res) => {
    try {
        const memberships = db.prepare(`
      SELECT * FROM gym_memberships
      WHERE memberId = ?
      ORDER BY createdAt DESC
    `).all(req.params.memberId);

        res.json(memberships);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunalarini olishda xatolik" });
    }
});

// GET /api/gym-memberships/active/:memberId - A'zoning faol gym obunasini olish
router.get("/active/:memberId", (req, res) => {
    try {
        const membership = db.prepare(`
      SELECT * FROM gym_memberships
      WHERE memberId = ? AND active = 1
      ORDER BY createdAt DESC
      LIMIT 1
    `).get(req.params.memberId);

        if (!membership) {
            return res.status(404).json({ error: "Faol gym obunasi topilmadi" });
        }

        res.json(membership);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunasini olishda xatolik" });
    }
});

// POST /api/gym-memberships - Yangi gym obunasini yaratish
router.post("/", (req, res) => {
    const { memberId, startDate, endDate, membershipType } = req.body;

    if (!memberId || !startDate) {
        return res.status(400).json({ error: "memberId va startDate majburiy" });
    }

    try {
        const stmt = db.prepare(`
      INSERT INTO gym_memberships (memberId, startDate, endDate, membershipType, active)
      VALUES (?, ?, ?, ?, 1)
    `);

        const result = stmt.run(memberId, startDate, endDate || null, membershipType || 'monthly');

        res.json({
            message: "Gym obunasi muvaffaqiyatli yaratildi ✅",
            id: result.lastInsertRowid
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunasini yaratishda xatolik" });
    }
});

// PUT /api/gym-memberships/:id - Gym obunasini yangilash
router.put("/:id", (req, res) => {
    const { startDate, endDate, membershipType, active } = req.body;

    try {
        const stmt = db.prepare(`
      UPDATE gym_memberships
      SET startDate = ?, endDate = ?, membershipType = ?, active = ?, updatedAt = datetime('now')
      WHERE id = ?
    `);

        stmt.run(
            startDate,
            endDate || null,
            membershipType || 'monthly',
            active !== undefined ? (active ? 1 : 0) : 1,
            req.params.id
        );

        res.json({ message: "Gym obunasi muvaffaqiyatli yangilandi ✅" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunasini yangilashda xatolik" });
    }
});

// DELETE /api/gym-memberships/:id - Gym obunasini o'chirish
router.delete("/:id", (req, res) => {
    try {
        const stmt = db.prepare("DELETE FROM gym_memberships WHERE id = ?");
        stmt.run(req.params.id);

        res.json({ message: "Gym obunasi muvaffaqiyatli o'chirildi ✅" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunasini o'chirishda xatolik" });
    }
});

// PATCH /api/gym-memberships/:id/deactivate - Gym obunasini faolsizlantirish
router.patch("/:id/deactivate", (req, res) => {
    try {
        const stmt = db.prepare(`
      UPDATE gym_memberships
      SET active = 0, updatedAt = datetime('now')
      WHERE id = ?
    `);

        stmt.run(req.params.id);

        res.json({ message: "Gym obunasi faolsizlantirildi ✅" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunasini faolsizlantirishda xatolik" });
    }
});

export default router;
