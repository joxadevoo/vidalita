import express from "express";
import db from "../db/database.js";

const router = express.Router();

// Login endpoint
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username va password majburiy" });
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

    if (!user) {
      return res.status(401).json({ error: "Username yoki password noto'g'ri" });
    }

    // Parolni tekshirish (oddiy tekshiruv - production'da bcrypt ishlatish kerak!)
    if (user.password !== password) {
      return res.status(401).json({ error: "Username yoki password noto'g'ri" });
    }

    // Last login yangilash
    db.prepare("UPDATE users SET lastLogin = datetime('now') WHERE id = ?").run(user.id);

    // Muvaffaqiyatli javob (production'da JWT token qaytarish kerak)
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

