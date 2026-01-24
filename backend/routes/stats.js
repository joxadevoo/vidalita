import express from "express";
import db from "../db/database.js";

const router = express.Router();

// GET /api/stats - Umumiy statistika
router.get("/", (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Bugungi kirishlar
    const todayCheckins = db.prepare(`
      SELECT COUNT(*) as count
      FROM checkins
      WHERE date(date) = date(?)
    `).get(today);

    // Bu hafta kirishlar
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Hafta boshiga
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    const weekCheckins = db.prepare(`
      SELECT COUNT(*) as count
      FROM checkins
      WHERE date(date) >= date(?)
    `).get(weekStartStr);

    // Bu oy kirishlar
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().slice(0, 10);

    const monthCheckins = db.prepare(`
      SELECT COUNT(*) as count
      FROM checkins
      WHERE date(date) >= date(?)
    `).get(monthStartStr);

    // Faol gym obunalari (faqat tugamagan)
    const activeMembers = db.prepare(`
      SELECT COUNT(*) as count
      FROM gym_memberships
      WHERE active = 1
        AND (endDate IS NULL OR date(endDate) >= date('now'))
    `).get();

    // Obuna muddati yaqinlashayotgan gym obunalari (7 kun ichida)
    const expiringSoon = db.prepare(`
      SELECT COUNT(*) as count
      FROM gym_memberships
      WHERE active = 1
        AND endDate IS NOT NULL
        AND date(endDate) >= date('now')
        AND date(endDate) <= date('now', '+7 days')
    `).get();

    // Obuna muddati tugagan gym obunalari
    const expiredMembers = db.prepare(`
      SELECT COUNT(*) as count
      FROM gym_memberships
      WHERE active = 1
        AND endDate IS NOT NULL
        AND date(endDate) < date('now')
    `).get();

    // Jami a'zolar
    const totalMembers = db.prepare(`
      SELECT COUNT(*) as count
      FROM members
    `).get();

    // Jami beauty services
    const totalBeautyServices = db.prepare(`
      SELECT COUNT(*) as count
      FROM beauty_services
    `).get();

    // Bugungi beauty services
    const todayBeautyServices = db.prepare(`
      SELECT COUNT(*) as count
      FROM beauty_services
      WHERE date(serviceDate) = date(?)
    `).get(today);

    res.json({
      checkins: {
        today: todayCheckins.count || 0,
        thisWeek: weekCheckins.count || 0,
        thisMonth: monthCheckins.count || 0
      },
      members: {
        total: totalMembers.count || 0,
        active: activeMembers.count || 0,
        expiringSoon: expiringSoon.count || 0,
        expired: expiredMembers.count || 0
      },
      beautyServices: {
        total: totalBeautyServices.count || 0,
        today: todayBeautyServices.count || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Statistikani olishda xatolik yuz berdi" });
  }
});

// GET /api/stats/daily-checkins - Kunlik kirishlar statistikasi (oxirgi 30 kun)
router.get("/daily-checkins", (req, res) => {
  try {
    const dailyCheckins = db.prepare(`
      SELECT 
        date(date) as date,
        COUNT(*) as count
      FROM checkins
      WHERE date(date) >= date('now', '-30 days')
      GROUP BY date(date)
      ORDER BY date(date) DESC
    `).all();

    res.json(dailyCheckins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kunlik kirishlar statistikasini olishda xatolik" });
  }
});

// GET /api/stats/active-memberships - Faol obunalar statistikasi
router.get("/active-memberships", (req, res) => {
  try {
    const memberships = db.prepare(`
      SELECT 
        m.id,
        m.fullName,
        m.phone,
        m.qrCodeId,
        gm.startDate as gymStart,
        gm.endDate as gymEnd,
        CASE 
          WHEN gm.endDate IS NULL THEN 'no_end_date'
          WHEN date(gm.endDate) < date('now') THEN 'expired'
          WHEN date(gm.endDate) <= date('now', '+7 days') THEN 'expiring_soon'
          ELSE 'active'
        END as status,
        CASE 
          WHEN gm.endDate IS NOT NULL THEN 
            CAST(julianday(gm.endDate) - julianday('now') AS INTEGER)
          ELSE NULL
        END as daysRemaining
      FROM gym_memberships gm
      LEFT JOIN members m ON gm.memberId = m.id
      WHERE gm.active = 1
      ORDER BY 
        CASE 
          WHEN gm.endDate IS NULL THEN 0
          WHEN date(gm.endDate) < date('now') THEN 1
          WHEN date(gm.endDate) <= date('now', '+7 days') THEN 2
          ELSE 3
        END,
        gm.endDate ASC
    `).all();

    res.json(memberships);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Faol obunalar statistikasini olishda xatolik" });
  }
});

export default router;

