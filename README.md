# 🏋️‍♀️ Gym & Beauty Management System

A simple local-first application for managing **gym memberships** and **beauty salon services**.  
Designed for small businesses with minimal hardware requirements — works **offline**, and syncs to a **lightweight online server** when the internet is available.

---

## 🧩 Project Overview

This project allows a small gym & beauty salon to:
- Register new members with an existing **QR-coded card**
- Perform **check-ins** by scanning QR codes
- Track **gym subscriptions**
- Record and view **beauty service history**
- Operate **completely offline**, with optional background syncing when online

---

## 📋 Project Checklist

### 🏗️ Phase 1 — Backend Setup (Node.js + Express + SQLite) ✅
- [x] Initialize backend folder (`backend/`)
- [x] Run `npm init -y`
- [x] Install dependencies:
  ```bash
  npm install express cors body-parser better-sqlite3
  ```
- [x] Configure SQLite database with tables:
  - `members`
  - `checkins`
  - `beauty_services`
- [x] Implement API endpoints (see [API Documentation](#-api-documentation) below)
- [x] Test backend using Postman or browser

### 🎨 Phase 2 — Frontend Setup (React + Vite + TypeScript) ✅
- [x] Create frontend folder (`frontend/`)
- [x] Initialize project with Vite and React
- [x] Install dependencies:
  ```bash
  npm install axios react-router-dom bootstrap
  ```
- [x] Setup project structure:
  ```
  frontend/
  ├── src/
  │   ├── components/
  │   │   ├── AddMemberModal.tsx
  │   │   ├── AddServiceModal.tsx
  │   │   └── Nav.tsx
  │   ├── pages/
  │   │   ├── Home.tsx
  │   │   ├── Members.tsx
  │   │   ├── Checkins.tsx
  │   │   └── Beauty.tsx
  │   ├── lib/
  │   │   └── api.ts
  │   ├── App.tsx
  │   └── main.tsx
  ├── .gitignore
  └── vite.config.ts
  ```
- [x] Connect frontend with backend via Axios
- [x] Build clean UI:
  - Simple dashboard (Home page with navigation)
  - Member management page
  - Check-in tracking page
  - Beauty services page
  - Forms for adding/editing members and services
- [x] Test local communication with backend

### 🔄 Phase 3 — Offline & Sync Logic ✅
- [x] Store records locally (IndexedDB or LocalStorage)
- [x] When online, auto-sync unsent data to the backend
- [x] Mark synced records with a flag (e.g., `synced = 1`)
- [x] Show sync status indicators

### 🧾 Phase 4 — Final Polishing ✅
- [x] Add simple authentication (optional, single admin user)
- [x] Add service filters and search options
- [x] Add basic reporting (e.g., active memberships, daily check-ins)
- [x] Optimize for low-resource computers (lazy loading, code splitting, minification)
- [x] Prepare minimal deployment for cloud backup server (PM2 setup)

### 🌐 Phase 5 — GitHub & Version Control
- [x] Create `.gitignore`
- [ ] Initialize Git repository:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  ```
- [ ] Connect to GitHub:
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/gym-beauty-system.git
  git push -u origin main
  ```
- [ ] Add project badges and screenshots to README

---

## 🗂️ Project Structure

```
Vidalita/
├── backend/
│   ├── db/
│   │   ├── database.js          # Database configuration & table creation
│   │   └── gymbeauty.db         # SQLite database file
│   ├── routes/
│   │   ├── members.js           # Member API routes
│   │   ├── checkins.js          # Check-in API routes
│   │   └── beauty.js            # Beauty services API routes
│   ├── postman/
│   │   ├── Gym-Beauty-API.postman_collection.json
│   │   └── Gym-Beauty-API.postman_environment.json
│   ├── server.js                # Express server setup
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── lib/                 # API client & types
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

---

## 🗄️ Database Schema (Entities)

### Members Table
```sql
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullName TEXT NOT NULL,
  phone TEXT,
  gender TEXT,
  qrCodeId TEXT UNIQUE NOT NULL,
  joinDate TEXT,
  gymStart TEXT,
  gymEnd TEXT,
  gymActive INTEGER DEFAULT 1,
  beautyHasRecord INTEGER DEFAULT 0,
  lastUpdated TEXT DEFAULT (datetime('now')),
  synced INTEGER DEFAULT 0
)
```

**Fields:**
- `id` - Primary key (auto-increment)
- `fullName` - Member's full name (required)
- `phone` - Phone number (optional)
- `gender` - Gender (optional)
- `qrCodeId` - Unique QR code identifier (required, unique)
- `joinDate` - Date when member joined
- `gymStart` - Gym membership start date
- `gymEnd` - Gym membership end date
- `gymActive` - Gym membership status (1 = active, 0 = inactive)
- `beautyHasRecord` - Has beauty service records (1 = yes, 0 = no)
- `lastUpdated` - Last update timestamp
- `synced` - Sync status for offline mode (0 = not synced, 1 = synced)

### Checkins Table
```sql
CREATE TABLE checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memberId INTEGER NOT NULL,
  qrCodeId TEXT NOT NULL,
  date TEXT DEFAULT (datetime('now')),
  verifiedBy TEXT,
  synced INTEGER DEFAULT 0,
  FOREIGN KEY(memberId) REFERENCES members(id)
)
```

**Fields:**
- `id` - Primary key (auto-increment)
- `memberId` - Foreign key to members table
- `qrCodeId` - QR code used for check-in
- `date` - Check-in timestamp
- `verifiedBy` - Who verified the check-in (optional)
- `synced` - Sync status for offline mode (0 = not synced, 1 = synced)

### Beauty Services Table
```sql
CREATE TABLE beauty_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memberId INTEGER NOT NULL,
  serviceName TEXT NOT NULL,
  serviceDate TEXT DEFAULT (datetime('now')),
  note TEXT,
  FOREIGN KEY(memberId) REFERENCES members(id)
)
```

**Fields:**
- `id` - Primary key (auto-increment)
- `memberId` - Foreign key to members table
- `serviceName` - Name of the beauty service (required)
- `serviceDate` - Date when service was provided
- `note` - Additional notes (optional)

---

## 🚀 Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. The server will run on `http://localhost:5000`

5. Test the server:
   - Visit `http://localhost:5000` in your browser
   - Check health: `http://localhost:5000/health`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

5. Open your browser and navigate to the URL shown in the terminal

### Testing with Postman

A complete Postman collection is available for testing all API endpoints:

1. **Import Collection:**
   - Open Postman
   - Click "Import" button
   - Select `backend/postman/Gym-Beauty-API.postman_collection.json`
   - (Optional) Import `backend/postman/Gym-Beauty-API.postman_environment.json` for environment variables

2. **Set Environment:**
   - The collection uses `{{baseUrl}}` variable (default: `http://localhost:5000`)
   - You can change it in Postman's environment settings if needed

3. **Start Testing:**
   - Make sure the backend server is running
   - Select the collection in Postman
   - Try the requests in order:
     1. Server Info → Root - Server Status
     2. Members → Add New Member
     3. Members → Get All Members
     4. Checkins → Record Check-in
     5. Beauty Services → Add Beauty Service

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Members API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/members` | Add new member |
| `GET` | `/members` | Get all members |
| `GET` | `/members/:id` | Get member by ID |
| `GET` | `/members/qr/:code` | Get member by QR code |
| `PUT` | `/members/:id` | Update member |
| `DELETE` | `/members/:id` | Delete member |

### Checkins API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/checkins` | Record gym check-in |
| `GET` | `/checkins` | Get all check-ins |
| `GET` | `/checkins/member/:memberId` | Get check-ins for a member |
| `GET` | `/checkins/date/:startDate/:endDate` | Get check-ins by date range |
| `DELETE` | `/checkins/:id` | Delete check-in |

### Beauty Services API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/beauty` | Add beauty service record |
| `GET` | `/beauty` | Get all beauty service records |
| `GET` | `/beauty/:id` | Get beauty service by ID |
| `GET` | `/beauty/member/:memberId` | Get beauty services for a member |
| `PUT` | `/beauty/:id` | Update beauty service record |
| `DELETE` | `/beauty/:id` | Delete beauty service record |

### Example Requests

**Add a new member:**
```bash
POST http://localhost:5000/api/members
Content-Type: application/json

{
  "fullName": "John Doe",
  "phone": "555-1234",
  "gender": "Male",
  "qrCodeId": "QR123456",
  "joinDate": "2024-01-15",
  "gymStart": "2024-01-15",
  "gymEnd": "2024-04-15"
}
```

**Record a check-in:**
```bash
POST http://localhost:5000/api/checkins
Content-Type: application/json

{
  "qrCodeId": "QR123456",
  "verifiedBy": "admin"
}
```

**Add a beauty service:**
```bash
POST http://localhost:5000/api/beauty
Content-Type: application/json

{
  "memberId": 1,
  "serviceName": "Haircut",
  "serviceDate": "2024-01-20",
  "note": "Regular trim"
}
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js, SQLite (better-sqlite3) |
| Frontend | React 19, TypeScript, Vite, Axios, React Router, Bootstrap 5 |
| Storage | Local (SQLite + IndexedDB - planned) |
| Language | JavaScript (ES Modules) - Backend, TypeScript - Frontend |

---

## 💡 Key Features

- ✅ Offline-first architecture (planned)
- ✅ QR-code based member check-ins
- ✅ Lightweight database (SQLite)
- ✅ Dual-section system: Gym + Beauty
- ✅ Optional cloud backup sync (planned)
- ✅ Simple & minimal interface
- ✅ TypeScript support for type safety
- ✅ Modern React with Hooks
- ✅ Responsive Bootstrap UI

---

## 🔧 Development

### Backend Development
- Uses ES Modules (`type: "module"` in package.json)
- SQLite database with better-sqlite3
- Express.js for REST API
- CORS enabled for frontend communication

### Frontend Development
- TypeScript for type safety
- Vite for fast development and building
- React Router for navigation
- Axios for API calls
- Bootstrap 5 for styling

### Environment Variables

**Backend:**
- `PORT` - Server port (default: 5000)

**Frontend:**
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000)

---

## 🚀 Deployment

### ⚙️ Server Setup (GitHub'dan pull qilgandan keyin)

Agar server'ga yangi pull qilgan bo'lsangiz:

1. **Dependencies o'rnatish:**
   ```bash
   cd backend
   npm install --production
   ```

2. **Firebase Configuration:**
   ```bash
   # .env fayl yarating
   cp .env.example .env
   
   # .env faylni tahrirlang va Firebase ma'lumotlarini qo'shing
   nano .env
   ```
   
   Yoki `backend/config/firebase-service-account.json` faylini yuklab oling.

3. **Batafsil qo'llanma:** `backend/SETUP.md`

### PM2 Deployment (Recommended for VPS/Cloud)

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Run deployment script:**
   ```bash
   ./deploy.sh
   ```
   
   **Eslatma:** Script `.env` faylini avtomatik yaratadi. Agar `.env` fayl mavjud bo'lmasa, `.env.example` dan ko'chiriladi. Keyin Firebase ma'lumotlarini qo'ying:
   ```bash
   nano backend/.env
   # Yoki
   vi backend/.env
   ```

3. **Manual deployment:**
   ```bash
   # Install dependencies
   cd backend && npm install --production
   cd ../frontend && npm install && npm run build
   
   # Copy frontend build
   mkdir -p ../backend/public
   cp -r dist/* ../backend/public/
   
   # Firebase Configuration (ikkita usuldan biri):
   # USUL 1: Service Account JSON file (Development)
   # - backend/config/firebase-service-account.json faylini server'ga ko'chiring
   
   # USUL 2: Environment Variables (Production - TAVSIYA ETILADI)
   # - .env fayl yarating yoki environment variables o'rnating
   # - Qo'llanma: backend/config/README.md
   
   # Start with PM2
   cd ../backend
   pm2 start ecosystem.config.js
   pm2 save
   ```

4. **PM2 Commands:**
   ```bash
   pm2 logs vidalita-backend    # View logs
   pm2 restart vidalita-backend # Restart
   pm2 stop vidalita-backend    # Stop
   pm2 delete vidalita-backend  # Remove
   ```

### Environment Variables

Create `.env` file in backend directory:
```env
NODE_ENV=production
PORT=5000

# Firebase Configuration (Production uchun tavsiya etiladi)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**⚠️ XAVFSIZLIK:** 
- `firebase-service-account.json` fayli `.gitignore`'da - Git'ga commit qilinmaydi
- Production'da environment variables ishlatish tavsiya etiladi
- Private key'ni hech qachon Git'ga commit qilmang!

**Development uchun:** `backend/config/firebase-service-account.json` faylini yarating (qo'llanma: `backend/FIREBASE_SETUP.md`)

---

## 📝 Notes

- The database file (`gymbeauty.db`) is stored in `backend/db/` directory
- Database tables are automatically created on server start
- All timestamps are stored in SQLite datetime format
- QR codes are unique identifiers for members
- Members cannot be deleted if they have check-ins or beauty service records

---

## 🐛 Troubleshooting

### Backend issues:
- Make sure port 5000 is not in use
- Check if database file has write permissions
- Verify all dependencies are installed

### Frontend issues:
- Make sure backend server is running
- Check if `VITE_API_URL` environment variable is set correctly
- Verify CORS is enabled on backend
- Check browser console for errors

---

## 📄 License

ISC

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
# tgc-vidalita
