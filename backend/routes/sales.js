import express from "express";
import supabase from "../db/supabase.js";

const router = express.Router();

// POST checkout (Sale)
router.post("/", async (req, res) => {
    try {
        const { memberId, items, totalAmount, discountAmount, paymentMethod, paymentStatus, notes } = req.body;

        if (!items || items.length === 0) return res.status(400).json({ error: "Savat bo'sh" });

        // 1. Create Sale record
        const { data: sale, error: saleError } = await supabase
            .from('sales')
            .insert({
                member_id: memberId || null,
                total_amount: totalAmount,
                discount_amount: discountAmount || 0,
                payment_method: paymentMethod || 'CASH',
                payment_status: paymentStatus || 'PAID',
                notes: notes
            })
            .select()
            .single();

        if (saleError) throw saleError;

        // 2. Create Sale Items and Update Stock
        for (const item of items) {
            // Save item
            const { error: itemError } = await supabase
                .from('sale_items')
                .insert({
                    sale_id: sale.id,
                    product_id: item.productId,
                    qty: item.qty,
                    unit_price: item.price,
                    unit_cost_snapshot: item.costPrice, // From frontend/snapshot
                    line_total: item.price * item.qty
                });

            if (itemError) throw itemError;

            // Update stock
            const { data: currentStock } = await supabase.from('inventory_stock').select('quantity_on_hand').eq('product_id', item.productId).single();
            const newTotal = (currentStock?.quantity_on_hand || 0) - item.qty;

            await supabase.from('inventory_stock').upsert({
                product_id: item.productId,
                quantity_on_hand: newTotal,
                updated_at: new Date().toISOString()
            });

            // Record movement
            await supabase.from('inventory_movements').insert({
                product_id: item.productId,
                type: 'OUT',
                qty: -item.qty,
                reason: 'sale',
                reference_type: 'sale',
                reference_id: sale.id
            });
        }

        res.json({ message: "Sotuv muvaffaqiyatli yakunlandi ✅", saleId: sale.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Sotuvni yakunlashda xatolik" });
    }
});

// GET sales history
router.get("/", async (req, res) => {
    try {
        const { from, to, memberId } = req.query;
        let query = supabase
            .from('sales')
            .select('*, members(fullname, phone)')
            .order('created_at', { ascending: false });

        if (memberId) query = query.eq('member_id', memberId);
        if (from) query = query.gte('created_at', from);
        if (to) query = query.lte('created_at', to);

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Sotuvlar tarixini olishda xatolik" });
    }
});

// GET sale details
router.get("/:id", async (req, res) => {
    try {
        const { data: sale, error: saleError } = await supabase
            .from('sales')
            .select('*, members(fullname, phone), sale_items(*, products(name, sku))')
            .eq('id', req.params.id)
            .single();

        if (saleError) throw saleError;
        res.json(sale);
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: "Sotuv topilmadi" });
    }
});

// POST refund
router.post("/:id/refund", async (req, res) => {
    try {
        const { items, totalRefund, reason } = req.body; // items: [{ saleItemId, productId, qty, amount, restock }]
        const saleId = req.params.id;

        // 1. Create Refund record
        const { data: refund, error: refundError } = await supabase
            .from('refunds')
            .insert({
                sale_id: saleId,
                total_refund: totalRefund,
                reason: reason
            })
            .select()
            .single();

        if (refundError) throw refundError;

        // 2. Process refund items
        for (const item of items) {
            const { error: riError } = await supabase
                .from('refund_items')
                .insert({
                    refund_id: refund.id,
                    sale_item_id: item.saleItemId,
                    qty: item.qty,
                    amount: item.amount,
                    restock: item.restock
                });
            if (riError) throw riError;

            if (item.restock) {
                // Update stock back
                const { data: currentStock } = await supabase.from('inventory_stock').select('quantity_on_hand').eq('product_id', item.productId).single();
                const newTotal = (currentStock?.quantity_on_hand || 0) + item.qty;

                await supabase.from('inventory_stock').upsert({
                    product_id: item.productId,
                    quantity_on_hand: newTotal,
                    updated_at: new Date().toISOString()
                });

                // Record movement
                await supabase.from('inventory_movements').insert({
                    product_id: item.productId,
                    type: 'IN',
                    qty: item.qty,
                    reason: 'refund',
                    reference_type: 'refund',
                    reference_id: refund.id
                });
            }
        }

        res.json({ message: "Qaytarish muvaffaqiyatli bajarildi ✅", refundId: refund.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Qaytarishda xatolik" });
    }
});

export default router;
