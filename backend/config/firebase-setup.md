# Firebase Setup Guide

## 1. Firebase Project yaratish

1. [Firebase Console](https://console.firebase.google.com/) ga kiring
2. "Add project" tugmasini bosing
3. Project nomini kiriting (masalan: `vidalita-gym-beauty`)
4. Google Analytics'ni o'chirib qo'yishingiz mumkin (optional)
5. "Create project" tugmasini bosing

## 2. Service Account Key olish

1. Firebase Console'da project'ni tanlang
2. Settings (⚙️) → Project settings
3. "Service accounts" tab'ini oching
4. "Generate new private key" tugmasini bosing
5. JSON fayl yuklab olinadi - uni `backend/config/firebase-service-account.json` ga saqlang

## 3. Environment Variables (Alternative)

Agar service account fayl ishlatmoqchi bo'lmasangiz, environment variables ishlatishingiz mumkin:

```bash
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 4. Firestore Database yaratish

1. Firebase Console'da "Firestore Database" ni oching
2. "Create database" tugmasini bosing
3. "Start in test mode" ni tanlang (yoki production mode'da security rules sozlang)
4. Location tanlang (masalan: `us-central1`)
5. "Enable" tugmasini bosing

## 5. Security Rules (Production uchun)

Firestore'da quyidagi security rules'ni sozlang:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Members collection
    match /members/{memberId} {
      allow read, write: if request.auth != null;
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Checkins collection
    match /checkins/{checkinId} {
      allow read, write: if request.auth != null;
    }
    
    // Beauty services collection
    match /beauty_services/{serviceId} {
      allow read, write: if request.auth != null;
    }
    
    // Gym info collection
    match /gym_info/{infoId} {
      allow read, write: if request.auth != null;
    }
    
    // Health info collection
    match /beauty_health_info/{infoId} {
      allow read, write: if request.auth != null;
    }
    
    // Payments collection
    match /gym_payments/{paymentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. Test qilish

Backend'ni ishga tushiring va test qiling:

```bash
cd backend
node server.js
```

Keyin browser'da yoki Postman'da:
```
GET http://localhost:5000/api/sync/test
```

Agar muvaffaqiyatli bo'lsa, quyidagi javobni olasiz:
```json
{
  "success": true,
  "message": "Firebase connection successful",
  "timestamp": "...",
  "projectId": "your-project-id"
}
```



