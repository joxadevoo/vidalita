import express from "express";
import supabase from "../db/supabase.js";

const router = express.Router();

// GET /api/stats - Umumiy statistika
router.get("/", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(new Date().getTime() + 86400000).toISOString().slice(0, 10);

    // Bugungi kirishlar
    const { count: todayCheckins } = await supabase.from('checkins').select('*', { count: 'exact', head: true })
      .gte('date', today)
      .lt('date', tomorrow);

    // Bu hafta kirishlar
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const { count: weekCheckins } = await supabase.from('checkins').select('*', { count: 'exact', head: true })
      .gte('date', weekStartStr);

    // Bu oy kirishlar
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().slice(0, 10);
    const { count: monthCheckins } = await supabase.from('checkins').select('*', { count: 'exact', head: true })
      .gte('date', monthStartStr);

    // Faol gym obunalari
    const { count: activeMembers } = await supabase.from('gym_memberships').select('*', { count: 'exact', head: true })
      .eq('active', 1)
      .or(`enddate.is.null,enddate.gte.${today}`);

    // Obuna muddati yaqinlashayotgan (7 kun ichida)
    const nextWeek = new Date(new Date().getTime() + 7 * 86400000).toISOString().slice(0, 10);
    const { count: expiringSoon } = await supabase.from('gym_memberships').select('*', { count: 'exact', head: true })
      .eq('active', 1)
      .not('enddate', 'is', null)
      .gte('enddate', today)
      .lte('enddate', nextWeek);

    // Obuna muddati tugagan
    const { count: expiredMembers } = await supabase.from('gym_memberships').select('*', { count: 'exact', head: true })
      .eq('active', 1)
      .not('enddate', 'is', null)
      .lt('enddate', today);

    // Jami a'zolar
    const { count: totalMembers } = await supabase.from('members').select('*', { count: 'exact', head: true });

    // Jami beauty services
    const { count: totalBeautyServices } = await supabase.from('beauty_services').select('*', { count: 'exact', head: true });

    // Bugungi beauty services
    const { count: todayBeautyServices } = await supabase.from('beauty_services').select('*', { count: 'exact', head: true })
      .gte('servicedate', today)
      .lt('servicedate', tomorrow);

    res.json({
      checkins: {
        today: todayCheckins || 0,
        thisWeek: weekCheckins || 0,
        thisMonth: monthCheckins || 0
      },
      members: {
        total: totalMembers || 0,
        active: activeMembers || 0,
        expiringSoon: expiringSoon || 0,
        expired: expiredMembers || 0
      },
      beautyServices: {
        total: totalBeautyServices || 0,
        today: todayBeautyServices || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Statistikani olishda xatolik yuz berdi" });
  }
});

// GET /api/stats/daily-checkins - Kunlik kirishlar statistikasi (oxirgi 30 kun)
router.get("/daily-checkins", async (req, res) => {
  try {
    const last30Days = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Supabase select with raw SQL style is not direct, so we'll fetch and group in JS 
    // or use a custom function. For simplicity, we fetch the 30 days and group.
    const { data, error } = await supabase.from('checkins')
      .select('date')
      .gte('date', last30Days)
      .order('date', { ascending: false });

    if (error) throw error;

    const grouped = data.reduce((acc, curr) => {
      const date = curr.date.slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([date, count]) => ({ date, count }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kunlik kirishlar statistikasini olishda xatolik" });
  }
});

// GET /api/stats/active-memberships - Faol obunalar statistikasi
router.get("/active-memberships", async (req, res) => {
  try {
    const { data, error } = await supabase.from('gym_memberships')
      .select('*, members(fullname, phone, qrcodeid)')
      .eq('active', 1);

    if (error) throw error;

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 86400000);

    const memberships = data.map(gm => {
      const endDate = gm.enddate ? new Date(gm.enddate) : null;
      let status = 'active';
      let daysRemaining = null;

      if (!endDate) {
        status = 'no_end_date';
      } else {
        daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        if (endDate < today) {
          status = 'expired';
        } else if (endDate <= nextWeek) {
          status = 'expiring_soon';
        }
      }

      return {
        id: gm.members?.id,
        fullName: gm.members?.fullname,
        phone: gm.members?.phone,
        qrCodeId: gm.members?.qrcodeid,
        gymStart: gm.startdate,
        gymEnd: gm.enddate,
        status,
        daysRemaining
      };
    });

    // Sort memberships: no_end_date (0), expired (1), expiring_soon (2), active (3)
    const statusOrder = { 'no_end_date': 0, 'expired': 1, 'expiring_soon': 2, 'active': 3 };
    memberships.sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (!a.gymEnd) return -1;
      if (!b.gymEnd) return 1;
      return new Date(a.gymEnd) - new Date(b.gymEnd);
    });

    res.json(memberships);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Faol obunalar statistikasini olishda xatolik" });
  }
});

export default router;
