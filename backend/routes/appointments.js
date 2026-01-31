import express from "express";
import supabase from "../db/supabase.js";

const router = express.Router();

// --- STAFF ---
router.get("/staff", async (req, res) => {
    try {
        const { data, error } = await supabase.from('staff').select('*').order('full_name');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Xodimlarni olishda xatolik" });
    }
});

router.post("/staff", async (req, res) => {
    try {
        const { fullName, role, isActive, workingHours } = req.body;
        const { data, error } = await supabase
            .from('staff')
            .insert({ full_name: fullName, role, is_active: isActive, working_hours_json: workingHours })
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Xodim qo'shishda xatolik" });
    }
});

// --- ROOMS ---
router.get("/rooms", async (req, res) => {
    try {
        const { data, error } = await supabase.from('rooms').select('*').order('name');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Xonalarni olishda xatolik" });
    }
});

// --- APPOINTMENTS ---
router.get("/", async (req, res) => {
    try {
        const { from, to, staffId, status } = req.query;
        let query = supabase
            .from('appointments')
            .select('*, members(fullname, phone), staff(full_name), rooms(name)')
            .order('start_time', { ascending: true });

        if (staffId) query = query.eq('staff_id', staffId);
        if (status) query = query.eq('status', status);
        if (from) query = query.gte('start_time', from);
        if (to) query = query.lte('start_time', to);

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Randevularni olishda xatolik" });
    }
});

router.post("/", async (req, res) => {
    try {
        const {
            memberId, guestName, guestPhone, serviceId, staffId, roomId,
            startTime, endTime, price, discount, depositAmount, notes
        } = req.body;

        // Conflict check
        const { data: conflicts, error: conflictError } = await supabase
            .from('appointments')
            .select('id')
            .eq('staff_id', staffId)
            .neq('status', 'CANCELLED')
            .or(`start_time.lt.${endTime},end_time.gt.${startTime}`); // Overlap check

        if (conflictError) throw conflictError;
        if (conflicts && conflicts.length > 0) {
            return res.status(400).json({ error: "Bu vaqtda xodim band" });
        }

        const { data, error } = await supabase
            .from('appointments')
            .insert({
                member_id: memberId || null,
                guest_name: guestName,
                guest_phone: guestPhone,
                service_id: serviceId,
                staff_id: staffId,
                room_id: roomId || null,
                start_time: startTime,
                end_time: endTime,
                price,
                discount: discount || 0,
                deposit_amount: depositAmount || 0,
                notes
            })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Randevu yaratishda xatolik" });
    }
});

router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const { data, error } = await supabase
            .from('appointments')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Statusni yangilashda xatolik" });
    }
});

export default router;
