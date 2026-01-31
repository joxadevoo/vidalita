import express from "express";
import supabase from "../db/supabase.js";

const router = express.Router();

// GET all stock levels
router.get("/stock", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('inventory_stock')
            .select('*, products(name, brand, sku, barcode)');

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ombor qoldiqlarini olishda xatolik" });
    }
});

// POST stock-in (Purchase/Arrival)
router.post("/stock-in", async (req, res) => {
    try {
        const { productId, qty, unitCost, reason, supplier } = req.body;

        if (!productId || !qty) return res.status(400).json({ error: "Ma'lumotlar yetarli emas" });

        // 1. Record movement
        const { error: moveError } = await supabase
            .from('inventory_movements')
            .insert({
                product_id: productId,
                type: 'IN',
                qty: qty,
                unit_cost: unitCost,
                reason: reason || 'purchase',
                reference_type: 'purchase'
            });

        if (moveError) throw moveError;

        // 2. Update current stock (Atomic-ish)
        // Note: In a real app we'd use a RPC/stored procedure for perfect atomicity
        const { data: currentStock } = await supabase.from('inventory_stock').select('quantity_on_hand').eq('product_id', productId).single();
        const newTotal = (currentStock?.quantity_on_hand || 0) + parseInt(qty);

        const { error: stockError } = await supabase
            .from('inventory_stock')
            .upsert({ product_id: productId, quantity_on_hand: newTotal, updated_at: new Date().toISOString() });

        if (stockError) throw stockError;

        res.json({ message: "Omborga kirim qilindi ✅", newTotal });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Omborga kirim qilishda xatolik" });
    }
});

// POST adjustment (Damage/Loss/Manual fix)
router.post("/adjust", async (req, res) => {
    try {
        const { productId, qty, type, reason } = req.body; // type is 'IN' or 'OUT'

        if (!productId || !qty || !type) return res.status(400).json({ error: "Ma'lumotlar yetarli emas" });

        const adjustmentQty = type === 'OUT' ? -Math.abs(qty) : Math.abs(qty);

        // 1. Record movement
        const { error: moveError } = await supabase
            .from('inventory_movements')
            .insert({
                product_id: productId,
                type: 'ADJUST',
                qty: adjustmentQty,
                reason: reason || 'manual adjustment',
                reference_type: 'adjustment'
            });

        if (moveError) throw moveError;

        // 2. Update stock
        const { data: currentStock } = await supabase.from('inventory_stock').select('quantity_on_hand').eq('product_id', productId).single();
        const newTotal = (currentStock?.quantity_on_hand || 0) + adjustmentQty;

        const { error: stockError } = await supabase
            .from('inventory_stock')
            .upsert({ product_id: productId, quantity_on_hand: newTotal, updated_at: new Date().toISOString() });

        if (stockError) throw stockError;

        res.json({ message: "Ombor tuzatildi ✅", newTotal });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Omborni tuzatishda xatolik" });
    }
});

// GET movements history
router.get("/movements", async (req, res) => {
    try {
        const { productId, from, to } = req.query;
        let query = supabase
            .from('inventory_movements')
            .select('*, products(name, sku)')
            .order('created_at', { ascending: false });

        if (productId) query = query.eq('product_id', productId);
        if (from) query = query.gte('created_at', from);
        if (to) query = query.lte('created_at', to);

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Harakatlar tarixini olishda xatolik" });
    }
});

export default router;
