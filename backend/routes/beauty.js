import express from "express";
import supabase from "../db/supabase.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getCurrentDateTimeTashkent } from "../utils/dateUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase initialization
let firebaseApp = null;
const router = express.Router();

// Helper to map Supabase beauty service to CamelCase
const mapBeautyServiceToCamelCase = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    memberId: item.memberid,
    serviceName: item.servicename,
    serviceType: item.servicetype,
    serviceDate: item.servicedate,
    note: item.note,
    amount: item.amount,
    discountPercent: item.discountpercent,
    paymentStatus: item.paymentstatus,
    paymentMethod: item.paymentmethod,
    paymentDate: item.paymentdate,
    fullName: item.members?.fullname || null,
    phone: item.members?.phone || null,
    qrCodeId: item.members?.qrcodeid || null
  };
};
import {
  BEAUTY_SERVICE_TYPES,
  BEAUTY_SERVICE_LABELS,
  BEAUTY_SERVICE_CATEGORIES,
  BEAUTY_SERVICE_PRICES,
  isValidServiceType,
  getAllServiceTypes,
  getServiceLabel,
  getServicePrice
} from "../constants/beautyServices.js";

// Xizmat turlarini olish (enum qiymatlarini qaytarish)
router.get("/service-types", (req, res) => {
  try {
    res.json({
      types: getAllServiceTypes(),
      labels: BEAUTY_SERVICE_LABELS,
      categories: BEAUTY_SERVICE_CATEGORIES,
      prices: BEAUTY_SERVICE_PRICES
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xizmat turlarini olishda xatolik yuz berdi" });
  }
});

// Yangi go'zallik xizmati qo'shish
router.post("/", async (req, res) => {
  const { memberId, serviceName, serviceType, serviceDate, note, amount, discountPercent, paymentStatus, paymentMethod, paymentDate } = req.body;

  if (!memberId || !serviceName) {
    return res.status(400).json({ error: "A'zo ID va xizmat nomi majburiy" });
  }

  // Xizmat turini tekshirish
  if (serviceType && !isValidServiceType(serviceType)) {
    return res.status(400).json({
      error: "Noto'g'ri xizmat turi",
      validTypes: getAllServiceTypes()
    });
  }

  try {
    // A'zo mavjudligini tekshirish
    const { data: member, error: memberErr } = await supabase.from('members').select('id').eq('id', memberId).maybeSingle();
    if (memberErr) throw memberErr;
    if (!member) {
      return res.status(404).json({ error: "A'zo topilmadi" });
    }

    const serviceData = {
      memberid: memberId,
      servicename: serviceName,
      servicetype: serviceType || null,
      servicedate: serviceDate || getCurrentDateTimeTashkent(),
      note: note || "",
      amount: amount || 0,
      discountpercent: discountPercent || 0,
      paymentstatus: paymentStatus || 'pending',
      paymentmethod: paymentMethod || null,
      paymentdate: paymentDate || null
    };

    const { error: insertErr } = await supabase.from('beauty_services').insert(serviceData);
    if (insertErr) throw insertErr;

    // A'zoning beautyHasRecord flag'ini yangilash
    await supabase.from('members').update({ beautyhasrecord: 1, lastupdated: new Date().toISOString() }).eq('id', memberId);

    res.json({ message: "Xizmat yozuvi muvaffaqiyatli qo'shildi ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xizmat yozuvini qo'shishda xatolik yuz berdi" });
  }
});

// Barcha go'zallik xizmatlari yozuvlarini olish
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from('beauty_services').select('*, members(fullname, phone, qrcodeid)').order('servicedate', { ascending: false });
    if (error) throw error;
    res.json(data.map(mapBeautyServiceToCamelCase));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xizmat yozuvlarini olishda xatolik yuz berdi" });
  }
});

// Muayyan a'zoning go'zallik xizmatlari yozuvlarini olish
router.get("/member/:memberId", async (req, res) => {
  try {
    const { data, error } = await supabase.from('beauty_services').select('*, members(fullname, phone, qrcodeid)').eq('memberid', req.params.memberId).order('servicedate', { ascending: false });
    if (error) throw error;
    res.json(data.map(mapBeautyServiceToCamelCase));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xizmat yozuvlarini olishda xatolik yuz berdi" });
  }
});

// Muayyan xizmat yozuvini olish
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from('beauty_services').select('*, members(fullname, phone, qrcodeid)').eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Xizmat yozuvi topilmadi" });
    }
    res.json(mapBeautyServiceToCamelCase(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xizmat yozuvini olishda xatolik yuz berdi" });
  }
});

// Xizmat yozuvini yangilash
router.put("/:id", async (req, res) => {
  const { serviceName, serviceType, serviceDate, note, amount, discountPercent, paymentStatus, paymentMethod, paymentDate } = req.body;

  if (!serviceName) {
    return res.status(400).json({ error: "Xizmat nomi majburiy" });
  }

  if (serviceType && !isValidServiceType(serviceType)) {
    return res.status(400).json({
      error: "Noto'g'ri xizmat turi",
      validTypes: getAllServiceTypes()
    });
  }

  try {
    const updateData = {
      servicename: serviceName,
      servicetype: serviceType || null,
      servicedate: serviceDate,
      note: note || "",
      amount: amount || 0,
      discountpercent: discountPercent || 0,
      paymentstatus: paymentStatus || 'pending',
      paymentmethod: paymentMethod || null,
      paymentdate: paymentDate || null
    };

    const { error } = await supabase.from('beauty_services').update(updateData).eq('id', req.params.id);
    if (error) throw error;

    res.json({ message: "Xizmat yozuvi muvaffaqiyatli yangilandi ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Yangilashda xatolik" });
  }
});

// Service kaydını sil
router.delete("/:id", async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Avval service kaydini olish
    const { data: service, error: getErr } = await supabase.from('beauty_services').select('memberid').eq('id', serviceId).maybeSingle();
    if (getErr) throw getErr;

    if (!service) {
      return res.status(404).json({ error: "Xizmat topilmadi" });
    }

    // Service kaydini o'chirish
    const { error: delErr } = await supabase.from('beauty_services').delete().eq('id', serviceId);
    if (delErr) throw delErr;

    // Agar a'zoning boshqa service kaydi yo'q bo'lsa beautyHasRecord flag'ini yangilash
    const { count } = await supabase.from('beauty_services').select('*', { count: 'exact', head: true }).eq('memberid', service.memberid);

    if (count === 0) {
      await supabase.from('members').update({ beautyhasrecord: 0, lastupdated: new Date().toISOString() }).eq('id', service.memberid);
    }

    res.json({
      message: "Xizmat yozuvi muvaffaqiyatli o'chirildi ✅"
    });
  } catch (err) {
    console.error('[DELETE /beauty/:id] Xatolik:', err);
    res.status(500).json({ error: "O'chirishda xatolik", details: err.message });
  }
});

export default router;

