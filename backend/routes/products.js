import express from "express";
import supabase from "../db/supabase.js";

const router = express.Router();

// Helper to map Product to CamelCase
const mapProductToCamelCase = (p) => {
    if (!p) return null;
    return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        categoryId: p.category_id,
        category: p.product_categories ? { id: p.product_categories.id, name: p.product_categories.name } : null,
        sku: p.sku,
        barcode: p.barcode,
        unit: p.unit,
        salePrice: p.sale_price,
        costPriceDefault: p.cost_price_default,
        isActive: p.is_active,
        reorderLevel: p.reorder_level,
        imageUrl: p.image_url,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        currentStock: p.inventory_stock ? p.inventory_stock.quantity_on_hand : 0
    };
};

// GET all products
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, product_categories(id, name), inventory_stock(quantity_on_hand)')
            .order('name');

        if (error) throw error;
        res.json(data.map(mapProductToCamelCase));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Mahsulotlarni olishda xatolik" });
    }
});

// GET categories
router.get("/categories", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('product_categories')
            .select('*')
            .order('name');

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Kategoriyalarni olishda xatolik" });
    }
});

// POST new category
router.post("/categories", async (req, res) => {
    try {
        const { name } = req.body;
        const { data, error } = await supabase
            .from('product_categories')
            .insert({ name })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Kategoriya qo'shishda xatolik" });
    }
});

// POST new product
router.post("/", async (req, res) => {
    try {
        const {
            name, brand, categoryId, sku, barcode, unit,
            salePrice, costPriceDefault, reorderLevel, imageUrl
        } = req.body;

        const productData = {
            name,
            brand,
            category_id: categoryId,
            sku,
            barcode,
            unit,
            sale_price: salePrice,
            cost_price_default: costPriceDefault,
            reorder_level: reorderLevel,
            image_url: imageUrl
        };

        const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (error) throw error;

        // Initialize stock record
        await supabase.from('inventory_stock').insert({ product_id: data.id, quantity_on_hand: 0 });

        res.json(mapProductToCamelCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Mahsulot qo'shishda xatolik" });
    }
});

// GET product by ID
router.get("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, product_categories(id, name), inventory_stock(quantity_on_hand)')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json(mapProductToCamelCase(data));
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: "Mahsulot topilmadi" });
    }
});

// PUT update product
router.put("/:id", async (req, res) => {
    try {
        const {
            name, brand, categoryId, sku, barcode, unit,
            salePrice, costPriceDefault, reorderLevel, imageUrl, isActive
        } = req.body;

        const updateData = {
            name,
            brand,
            category_id: categoryId,
            sku,
            barcode,
            unit,
            sale_price: salePrice,
            cost_price_default: costPriceDefault,
            reorder_level: reorderLevel,
            image_url: imageUrl,
            is_active: isActive,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(mapProductToCamelCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Mahsulotni yangilashda xatolik" });
    }
});

// DELETE product
router.delete("/:id", async (req, res) => {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: "Mahsulot o'chirildi ✅" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Mahsulotni o'chirishda xatolik" });
    }
});

export default router;
