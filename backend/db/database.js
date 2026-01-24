import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Executable uchun to'g'ri path olish
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path logic
let dbPath;

const resolveEnvDbPath = () => {
  const envDbPath = process.env.APP_DB_PATH;
  if (envDbPath) return envDbPath;

  const envDbDir = process.env.APP_DB_DIR;
  if (envDbDir) return path.join(envDbDir, 'gymbeauty.db');

  const envConfigPath = process.env.APP_CONFIG_PATH;
  if (envConfigPath && fs.existsSync(envConfigPath)) {
    const config = JSON.parse(fs.readFileSync(envConfigPath, 'utf8'));
    if (config?.dbPath) return path.join(config.dbPath, 'gymbeauty.db');
  }

  return null;
};

const ensureDbDir = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const getConfigPath = () => {
  // Platform agnostic config path lookup
  // 1. Next to executable (packaged)
  let p = path.join(path.dirname(process.execPath), 'app-config.json');
  if (fs.existsSync(p)) return p;

  // 2. In current directory (dev/startup)
  p = path.join(process.cwd(), 'app-config.json');
  if (fs.existsSync(p)) return p;

  // 3. In backend root (if CWD is distinct)
  p = path.join(__dirname, '..', 'app-config.json');
  if (fs.existsSync(p)) return p;

  return null;
};

try {
  const envDbPath = resolveEnvDbPath();
  if (envDbPath) {
    dbPath = envDbPath;
    ensureDbDir(dbPath);
  } else {
    const configPath = getConfigPath();
    if (configPath) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      dbPath = path.join(config.dbPath, 'gymbeauty.db');
    } else {
      // Default / Development fallback
      const dbDir = path.join(__dirname, '..', 'db'); // Create db folder in backend root if not exists
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      dbPath = path.join(dbDir, 'gymbeauty.db');
    }
  }
} catch (err) {
  console.error("Error determining DB path:", err.message);
  // Emergency fallback
  dbPath = path.join(__dirname, 'gymbeauty.db');
}

console.log(`Database File: ${dbPath}`);
const db = new Database(dbPath);

// ============================================
// 1. MEMBERS (A'zolar) - Asosiy entity
// ============================================
db.prepare(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT,
    phone TEXT,
    gender TEXT,
    qrCodeId TEXT UNIQUE,
    joinDate TEXT,
    gymStart TEXT,
    gymEnd TEXT,
    gymActive INTEGER DEFAULT 0,
    beautyHasRecord INTEGER DEFAULT 0,
    lastUpdated TEXT,
    synced INTEGER DEFAULT 0,
    photo TEXT,
    birthDate TEXT,
    email TEXT,
    region TEXT,
    district TEXT
  )
`).run();

// ============================================
// 2. CHECKINS (Kirishlar) - A'zolarning kirish tarixi
// ============================================
db.prepare(`
  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER,
    qrCodeId TEXT,
    date TEXT,
    verifiedBy TEXT,
    synced INTEGER DEFAULT 0,
    FOREIGN KEY(memberId) REFERENCES members(id) ON DELETE CASCADE
  )
`).run();

// ============================================
// 3. BEAUTY_SERVICES (Go'zallik xizmatlari) - Xizmatlar tarixi
// ============================================
db.prepare(`
  CREATE TABLE IF NOT EXISTS beauty_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER,
    serviceName TEXT,
    serviceType TEXT,
    serviceDate TEXT,
    note TEXT,
    amount REAL DEFAULT 0,
    paymentStatus TEXT DEFAULT 'pending',
    paymentMethod TEXT,
    paymentDate TEXT,
    FOREIGN KEY(memberId) REFERENCES members(id) ON DELETE CASCADE
  )
`).run();

// Beauty services jadvaliga qo'shimcha maydonlarni qo'shish (agar mavjud bo'lmasa)
try {
  db.prepare(`ALTER TABLE beauty_services ADD COLUMN serviceType TEXT`).run();
} catch (err) { }
try {
  db.prepare(`ALTER TABLE beauty_services ADD COLUMN amount REAL DEFAULT 0`).run();
} catch (err) { }
try {
  db.prepare(`ALTER TABLE beauty_services ADD COLUMN paymentStatus TEXT DEFAULT 'pending'`).run();
} catch (err) { }
try {
  db.prepare(`ALTER TABLE beauty_services ADD COLUMN paymentMethod TEXT`).run();
} catch (err) { }
try {
  db.prepare(`ALTER TABLE beauty_services ADD COLUMN paymentDate TEXT`).run();
} catch (err) { }
try {
  db.prepare(`ALTER TABLE beauty_services ADD COLUMN discountPercent REAL DEFAULT 0`).run();
} catch (err) { }

// ============================================
// 4. BEAUTY_HEALTH_INFO (Go'zallik sog'liq ma'lumotlari)
// ============================================
db.prepare(`
  CREATE TABLE IF NOT EXISTS beauty_health_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER UNIQUE,
    bloodPressure TEXT,
    diabetes TEXT,
    cancer TEXT,
    cancerDetails TEXT,
    cancerTreatment TEXT,
    cancerTreatmentDetails TEXT,
    hormonal TEXT,
    thyroid TEXT,
    skin TEXT,
    skinDetails TEXT,
    alcohol TEXT,
    prosthesis TEXT,
    platinum TEXT,
    implants TEXT,
    crowns TEXT,
    surgery TEXT,
    surgeryDetails TEXT,
    surgeryDate TEXT,
    smoking TEXT,
    medications TEXT,
    FOREIGN KEY(memberId) REFERENCES members(id) ON DELETE CASCADE
  )
`).run();

// ============================================
// 5. GYM_INFO (Gym ma'lumotlari) - Gym a'zolik ma'lumotlari
// ============================================
db.prepare(`
  CREATE TABLE IF NOT EXISTS gym_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER UNIQUE,
    emergencyName TEXT,
    emergencyPhone TEXT,
    emergencyRelation TEXT,
    medicalConditions TEXT,
    medications TEXT,
    fitnessGoals TEXT,
    membershipType TEXT,
    membershipTypeOther TEXT,
    paymentMethod TEXT,
    paymentMethodOther TEXT,
    FOREIGN KEY(memberId) REFERENCES members(id) ON DELETE CASCADE
  )
`).run();

// ============================================
// 6. GYM_PAYMENTS (Gym oylik to'lovlari) - Oylik to'lov tarixi
// ============================================
db.prepare(`
  CREATE TABLE IF NOT EXISTS gym_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER,
    amount REAL NOT NULL,
    paymentDate TEXT NOT NULL,
    periodStart TEXT NOT NULL,
    periodEnd TEXT NOT NULL,
    paymentMethod TEXT,
    paymentStatus TEXT DEFAULT 'paid',
    note TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(memberId) REFERENCES members(id) ON DELETE CASCADE
  )
`).run();

// ============================================
// 7. GYM_MEMBERSHIPS (Gym obunalari) - Gym a'zolik tarixi
// ============================================
db.prepare(`
  CREATE TABLE IF NOT EXISTS gym_memberships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT,
    membershipType TEXT,
    active INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(memberId) REFERENCES members(id) ON DELETE CASCADE
  )
`).run();


// ============================================
// 8. USERS (Foydalanuvchilar) - Login tizimi uchun
// ============================================
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    createdAt TEXT DEFAULT (datetime('now')),
    lastLogin TEXT
  )
`).run();

// Admin userlar yaratish (agar mavjud bo'lmasa)
// Jami 2 ta admin: admin va hodim1
try {
  // Birinchi admin
  const admin1Exists = db.prepare("SELECT id FROM users WHERE username = ?").get('admin');
  if (!admin1Exists) {
    db.prepare(`
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?)
    `).run('admin', 'admin123', 'admin');
    console.log("✅ Admin user yaratildi (username: admin, password: admin123)");
  }

  // Ikkinchi admin (hodim 1 - ro'yxatdan o'tkazuvchi hodim)
  const admin2Exists = db.prepare("SELECT id FROM users WHERE username = ?").get('hodim1');
  if (!admin2Exists) {
    db.prepare(`
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?)
    `).run('hodim1', 'hodim123', 'admin');
    console.log("✅ Hodim 1 user yaratildi (username: hodim1, password: hodim123)");
  }
} catch (err) {
  console.log("Admin userlar yaratishda xatolik:", err.message);
}

// ============================================
// Indexlar yaratish (tez qidirish uchun)
// ============================================
try {
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_members_qrCodeId ON members(qrCodeId)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_checkins_memberId ON checkins(memberId)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_beauty_services_memberId ON beauty_services(memberId)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_beauty_services_date ON beauty_services(serviceDate)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_gym_payments_memberId ON gym_payments(memberId)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_gym_payments_date ON gym_payments(paymentDate)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_gym_payments_period ON gym_payments(periodStart, periodEnd)`).run();
} catch (err) {
  console.log("Indexlar yaratishda xatolik (ehtimol allaqachon mavjud):", err.message);
}

console.log("✅ Ma'lumotlar bazasi jadvallari muvaffaqiyatli yaratildi/yangilandi!");

export default db;
