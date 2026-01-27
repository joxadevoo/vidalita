import express from "express";
import supabase from "../db/supabase.js";
import { getCurrentDateTimeSQLite } from "../utils/dateUtils.js";

const router = express.Router();

// Helper to map Supabase checkin to CamelCase
const mapCheckinToCamelCase = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    memberId: item.memberid,
    qrCodeId: item.qrcodeid,
    date: item.date,
    verifiedBy: item.verifiedby,
    synced: item.synced,
    fullName: item.members?.fullname || null,
    phone: item.members?.phone || null
  };
};

// Check-in işlemi
router.post("/", async (req, res) => {
  const { qrCodeId, verifiedBy } = req.body;

  if (!qrCodeId) {
    return res.status(400).json({ error: "ID majburiy" });
  }

  try {
    const { data: member, error: memberError } = await supabase.from('members').select('*').eq('qrcodeid', qrCodeId).maybeSingle();
    if (memberError) throw memberError;

    if (!member) {
      return res.status(404).json({ error: "A'zo topilmadi. ID noto'g'ri." });
    }

    if (member.gymactive !== 1) {
      return res.status(400).json({ error: "A'zolik faol emas" });
    }

    // Obuna muddatini tekshirish
    if (member.gymend) {
      const today = new Date().toISOString().slice(0, 10);
      const endDate = member.gymend.slice(0, 10);

      if (endDate < today) {
        const formattedDate = new Date(member.gymend).toLocaleDateString('uz-UZ', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        return res.status(400).json({
          error: `Obuna muddati tugagan. Tugash sanasi: ${formattedDate}`
        });
      }
    }

    // Bugungi kirishni tekshirish
    const today = new Date().toISOString().slice(0, 10);
    const { data: todayCheckin, error: checkinErr } = await supabase.from('checkins')
      .select('*')
      .eq('memberid', member.id)
      .gte('date', today)
      .lt('date', new Date(new Date(today).getTime() + 86400000).toISOString())
      .maybeSingle();

    if (checkinErr) throw checkinErr;
    if (todayCheckin) {
      return res.status(400).json({
        error: "Bugun allaqachon kirish qayd etilgan"
      });
    }

    const currentDateTime = getCurrentDateTimeSQLite();
    const { error: insertErr } = await supabase.from('checkins').insert({
      memberid: member.id,
      qrcodeid: qrCodeId,
      date: currentDateTime,
      verifiedby: verifiedBy || "system",
      synced: 0
    });
    if (insertErr) throw insertErr;

    res.json({
      message: "Kirish muvaffaqiyatli ✅",
      member: {
        id: member.id,
        fullName: member.fullname,
        phone: member.phone,
        qrCodeId: member.qrcodeid
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kirish-chiqish saqlashda xatolik yuz berdi" });
  }
});

// Barcha kirish-chiqishlarni olish
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from('checkins').select('*, members(fullname, phone)').order('date', { ascending: false });
    if (error) throw error;
    res.json(data.map(mapCheckinToCamelCase));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kirish-chiqishlarni olishda xatolik yuz berdi" });
  }
});

// Muayyan a'zoning kirish-chiqishlarini olish
router.get("/member/:memberId", async (req, res) => {
  try {
    const { data, error } = await supabase.from('checkins').select('*, members(fullname, phone)').eq('memberid', req.params.memberId).order('date', { ascending: false });
    if (error) throw error;
    res.json(data.map(mapCheckinToCamelCase));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kirish-chiqishlarni olishda xatolik yuz berdi" });
  }
});

// Muayyan sana oralig'idagi kirish-chiqishlarni olish
router.get("/date/:startDate/:endDate", async (req, res) => {
  try {
    const { data, error } = await supabase.from('checkins')
      .select('*, members(fullname, phone)')
      .gte('date', req.params.startDate)
      .lte('date', req.params.endDate)
      .order('date', { ascending: false });
    if (error) throw error;
    res.json(data.map(mapCheckinToCamelCase));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kirish-chiqishlarni olishda xatolik yuz berdi" });
  }
});

// Kirish-chiqishni o'chirish
router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase.from('checkins').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: "Kirish-chiqish muvaffaqiyatli o'chirildi ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "O'chirishda xatolik" });
  }
});

