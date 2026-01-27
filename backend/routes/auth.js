import express from "express";
import supabase from "../db/supabase.js";

const router = express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username va password majburiy" });
  }

  try {
    const { data: user, error: fetchError } = await supabase.from('users').select('*').eq('username', username).maybeSingle();

    if (fetchError) throw fetchError;

    if (!user) {
      return res.status(401).json({ error: "Username yoki password noto'g'ri" });
    }

    // Parolni tekshirish
    if (user.password !== password) {
      return res.status(401).json({ error: "Username yoki password noto'g'ri" });
    }

    // Last login yangilash
    await supabase.from('users').update({ lastlogin: new Date().toISOString() }).eq('id', user.id);

    // Muvaffaqiyatli javob
    res.json({
      message: "Login muvaffaqiyatli",
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login xatosi:", err);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// Logout endpoint (frontend'da localStorage'ni tozalash uchun)
router.post("/logout", (req, res) => {
  res.json({ message: "Logout muvaffaqiyatli" });
});

export default router;

