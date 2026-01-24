import 'dotenv/config'; // Environment variables yuklash
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs"; // fs modulini import qilish
import { fileURLToPath } from "url";
import db from "./db/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route imports
import membersRouter from "./routes/members.js";
import checkinsRouter from "./routes/checkins.js";
import beautyRouter from "./routes/beauty.js";
import authRouter from "./routes/auth.js";
// Sync router - Firebase Firestore
import syncRouter from "./routes/sync-firebase.js";
import statsRouter from "./routes/stats.js";
import gymMembershipsRouter from "./routes/gym-memberships.js";

const app = express();

// Middleware
app.use(cors());
// Body parser limitini oshirish (base64 rasm uchun - 10MB gacha)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Favicon route - 204 No Content to avoid 404 errors
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// Root test endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Gym & Beauty Backend is running ✅",
    version: "1.0.0",
    endpoints: {
      auth: {
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout"
      },
      members: "/api/members",
      checkins: "/api/checkins",
      beauty: "/api/beauty",
      sync: "POST /api/sync (SQLite -> Firebase Firestore)",
      stats: "/api/stats (Statistics & Reports)"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  try {
    // Test database connection
    db.prepare("SELECT 1").get();
    res.json({ status: "healthy", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "unhealthy", database: "disconnected", error: err.message });
  }
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/members", membersRouter);
app.use("/api/checkins", checkinsRouter);
app.use("/api/beauty", beautyRouter);
app.use("/api/sync", syncRouter);
app.use("/api/stats", statsRouter);
app.use("/api/gym-memberships", gymMembershipsRouter);

// Serve static files from frontend build (production)
if (process.env.NODE_ENV === 'production') {
  // pkg ichida __dirname ishlatilsa snapshot ichidagi pathni beradi
  // bu yerda biz frontend fayllarini snapshot ichiga qo'shishni rejalashtiryapmiz
  const publicPath = path.join(__dirname, 'public');

  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server error", message: err.message });
});

// Server start function
const startServer = (portOverride) => {
  const PORT = portOverride || process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    // DB Path log is handled in database.js (well, sort of, we print it there)
    // Here we just log server status
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ API endpoints ready!`);


  });
  return server;
};

// Check if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}

export { app, startServer };
