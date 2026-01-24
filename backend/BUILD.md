# Backend Executable Build Instructions

Bu qo'llanma backend va ma'lumotlar bazasini executable (exe) faylga aylantirish uchun.

## Talablar

- Node.js 18+ o'rnatilgan bo'lishi kerak
- npm yoki yarn

## Build qilish

### Barcha platformalar uchun

```bash
npm run build
```

### Faqat Windows uchun

```bash
npm run build:win
```

### Faqat Linux uchun

```bash
npm run build:linux
```

### Faqat macOS uchun

```bash
npm run build:mac
```

## Natija

Build qilingandan keyin, `dist/` papkasida executable fayl yaratiladi:

- **Windows**: `backend-win.exe`
- **Linux**: `backend-linux` (yoki `backend`)
- **macOS**: `backend-macos`

## Ishlatish

1. Executable faylni istalgan joyga ko'chiring
2. `config/` papkasini executable bilan bir papkaga ko'chiring (agar Firebase ishlatilsa)
3. Birinchi marta ishga tushirganda, executable bilan bir papkada `db/` papkasi avtomatik yaratiladi
4. Ma'lumotlar bazasi `db/gymbeauty.db` faylida saqlanadi va avtomatik yaratiladi

### Windows uchun

Windows'da executable faylni ikki marta bosib ishga tushirishingiz mumkin yoki Command Prompt'da:

```cmd
backend-win.exe
```

Yoki PowerShell'da:

```powershell
.\backend-win.exe
```

### Linux uchun

```bash
./backend-linux
```

Yoki executable qilish:

```bash
chmod +x backend-linux
./backend-linux
```

### macOS uchun

```bash
./backend-macos
```

## Eslatmalar

- Executable fayl bilan bir papkada `db/` papkasi yaratiladi
- Ma'lumotlar bazasi avtomatik yaratiladi (agar mavjud bo'lmasa)
- Firebase konfiguratsiyasi `config/firebase-service-account.json` faylida bo'lishi kerak (agar Firebase ishlatilsa)
- Port raqami environment variable yoki `.env` fayl orqali belgilanadi (default: 5001)

## Environment Variables

Executable ishga tushirishdan oldin quyidagi environment variable'larni o'rnatishingiz mumkin:

- `PORT` - Server porti (default: 5001)
- `NODE_ENV` - Environment (production/development)

## Ma'lumotlar bazasini backup qilish

Ma'lumotlar bazasini backup qilish uchun `db/gymbeauty.db` faylini nusxalang.

