# 🔐 Firebase Configuration

## ⚠️ XAVFSIZLIK OGOHLANTIRISHI

**`firebase-service-account.json` fayli Git'ga commit qilinmaydi!**

Bu fayl xavfsiz ma'lumotlarni (private key) o'z ichiga oladi. Agar bu fayl Git'ga commit qilinsa, barcha repository'ga kirish huquqi bo'lganlar Firebase'ga kirish huquqiga ega bo'lishadi.

## 📋 Setup Qadamlar

### USUL 1: Service Account JSON File (Development uchun)

1. Firebase Console'dan service account key'ni yuklab oling
2. Faylni quyidagi joyga ko'chiring:
   ```
   backend/config/firebase-service-account.json
   ```
3. Backend avtomatik ravishda bu faylni topadi va ishlatadi

### USUL 2: Environment Variables (Production uchun - TAVSIYA ETILADI)

Production server'da environment variables ishlatish tavsiya etiladi:

```bash
export FIREBASE_PROJECT_ID="vidalita-tgc"
export FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@vidalita-tgc.iam.gserviceaccount.com"
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDOvUlmcTvUHhFd\n...\n-----END PRIVATE KEY-----\n"
```

**Eslatma:** `FIREBASE_PRIVATE_KEY` da `\n` belgilarini saqlang!

### Docker/PM2 uchun

`.env` fayl yarating:

```bash
# backend/.env
FIREBASE_PROJECT_ID=vidalita-tgc
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@vidalita-tgc.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## ✅ Tekshirish

Backend'ni ishga tushirib, test qiling:

```bash
curl http://localhost:5000/api/sync/test
```

Muvaffaqiyatli javob:
```json
{
  "success": true,
  "message": "Firebase connection successful",
  "projectId": "vidalita-tgc"
}
```

## 📚 Qo'shimcha ma'lumot

Batafsil qo'llanma: `backend/FIREBASE_SETUP.md`

