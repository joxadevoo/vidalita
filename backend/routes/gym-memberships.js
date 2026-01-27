import express from "express";
import supabase from "../db/supabase.js";

const router = express.Router();

// Helper to map Supabase gym membership to CamelCase
const mapMembershipToCamelCase = (item) => {
    if (!item) return null;
    return {
        id: item.id,
        memberId: item.memberid,
        startDate: item.startdate,
        endDate: item.enddate,
        membershipType: item.membershiptype,
        active: item.active,
        createdAt: item.createdat,
        updatedAt: item.updatedat,
        fullName: item.members?.fullname || null,
        phone: item.members?.phone || null,
        qrCodeId: item.members?.qrcodeid || null
    };
};

// GET /api/gym-memberships - Barcha gym obunalarini olish
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase.from('gym_memberships').select('*, members(fullname, phone, qrcodeid)').order('createdat', { ascending: false });
        if (error) throw error;
        res.json(data.map(mapMembershipToCamelCase));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunalarini olishda xatolik" });
    }
});

// GET /api/gym-memberships/member/:memberId - A'zo uchun gym obunalarini olish
router.get("/member/:memberId", async (req, res) => {
    try {
        const { data, error } = await supabase.from('gym_memberships').select('*').eq('memberid', req.params.memberId).order('createdat', { ascending: false });
        if (error) throw error;
        res.json(data.map(mapMembershipToCamelCase));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunalarini olishda xatolik" });
    }
});

// GET /api/gym-memberships/active/:memberId - A'zoning faol gym obunasini olish
router.get("/active/:memberId", async (req, res) => {
    try {
        const { data, error } = await supabase.from('gym_memberships')
            .select('*')
            .eq('memberid', req.params.memberId)
            .eq('active', 1)
            .order('createdat', { ascending: false })
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: "Faol gym obunasi topilmadi" });
        }

        res.json(mapMembershipToCamelCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunasini olishda xatolik" });
    }
});

// POST /api/gym-memberships - Yangi gym obunasini yaratish
router.post("/", async (req, res) => {
    const { memberId, startDate, endDate, membershipType } = req.body;

    if (!memberId || !startDate) {
        return res.status(400).json({ error: "memberId va startDate majburiy" });
    }

    try {
        const { data, error } = await supabase.from('gym_memberships').insert({
            memberid: memberId,
            startdate: startDate,
            enddate: endDate || null,
            membershiptype: membershipType || 'monthly',
            active: 1
        }).select().single();

        if (error) throw error;

        res.json({
            message: "Gym obunasi muvaffaqiyatli yaratildi ✅",
            id: data.id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunasini yaratishda xatolik" });
    }
});

// PUT /api/gym-memberships/:id - Gym obunasini yangilash
router.put("/:id", async (req, res) => {
    const { startDate, endDate, membershipType, active } = req.body;

    try {
        const { error } = await supabase.from('gym_memberships').update({
            startdate: startDate,
            enddate: endDate || null,
            membershiptype: membershipType || 'monthly',
            active: active !== undefined ? (active ? 1 : 0) : 1,
            updatedat: new Date().toISOString()
        }).eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: "Gym obunasi muvaffaqiyatli yangilandi ✅" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunasini yangilashda xatolik" });
    }
});

// DELETE /api/gym-memberships/:id - Gym obunasini o'chirish
router.delete("/:id", async (req, res) => {
    try {
        const { error } = await supabase.from('gym_memberships').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Gym obunasi muvaffaqiyatli o'chirildi ✅" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunasini o'chirishda xatolik" });
    }
});

// PATCH /api/gym-memberships/:id/deactivate - Gym obunasini faolsizlantirish
router.patch("/:id/deactivate", async (req, res) => {
    try {
        const { error } = await supabase.from('gym_memberships').update({
            active: 0,
            updatedat: new Date().toISOString()
        }).eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: "Gym obunasi faolsizlantirildi ✅" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gym obunasini faolsizlantirishda xatolik" });
    }
});

export default router;
