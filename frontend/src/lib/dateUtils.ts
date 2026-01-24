/**
 * Vaqt formatlash utility funksiyalari
 * Barcha joylarda bir xil vaqt ko'rsatish uchun
 */

/**
 * Sana va vaqtni O'zbekiston vaqt mintaqasida (Asia/Tashkent, UTC+5) formatlash
 * Format: dd-mm-yyyy HH:mm:ss
 */
export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  
  let date: Date
  
  // Agar value allaqachon ISO formatida bo'lsa yoki UTC bo'lsa
  if (typeof value === 'string') {
    // SQLite'dan kelgan vaqt UTC formatida bo'lishi mumkin
    // Agar 'Z' bilan tugasa, UTC deb hisoblaymiz
    if (value.endsWith('Z')) {
      date = new Date(value)
    } else if (value.includes('T') && value.includes('+')) {
      // ISO formatida timezone bilan (masalan: 2024-01-15T10:30:00+05:00)
      date = new Date(value)
    } else if (value.includes('T') && !value.includes('Z') && !value.includes('+') && !value.includes('-', 10)) {
      // ISO formatida timezone'siz (masalan: 2024-01-15T10:30:00)
      // SQLite'dan kelgan vaqtlar ko'pincha shu formatda bo'ladi
      // Uni Tashkent timezone'da deb hisoblaymiz (UTC+5)
      date = new Date(value + '+05:00')
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
      // SQLite datetime formatida (YYYY-MM-DD HH:MM:SS) - timezone'siz
      // Uni Tashkent timezone'da deb hisoblaymiz
      date = new Date(value.replace(' ', 'T') + '+05:00')
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Faqat sana (YYYY-MM-DD)
      date = new Date(value + 'T00:00:00+05:00')
    } else {
      // Boshqa formatlar
      date = new Date(value)
    }
  } else {
    date = new Date(value)
  }
  
  if (Number.isNaN(date.getTime())) return value

  // O'zbekiston vaqt mintaqasida (Asia/Tashkent, UTC+5) formatlash
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  
  const parts = formatter.formatToParts(date)
  const day = parts.find(p => p.type === 'day')?.value || '00'
  const month = parts.find(p => p.type === 'month')?.value || '00'
  const year = parts.find(p => p.type === 'year')?.value || '0000'
  const hours = parts.find(p => p.type === 'hour')?.value || '00'
  const minutes = parts.find(p => p.type === 'minute')?.value || '00'
  const seconds = parts.find(p => p.type === 'second')?.value || '00'

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
}

/**
 * Faqat sanani formatlash (vaqtsiz)
 * Format: dd-mm-yyyy
 */
export function formatDateOnly(value?: string | null): string {
  if (!value) return '—'
  
  let date: Date
  
  // Agar value allaqachon ISO formatida bo'lsa yoki UTC bo'lsa
  if (typeof value === 'string') {
    // SQLite'dan kelgan vaqt UTC formatida bo'lishi mumkin
    if (value.endsWith('Z')) {
      date = new Date(value)
    } else if (value.includes('T') && value.includes('+')) {
      // ISO formatida timezone bilan
      date = new Date(value)
    } else if (value.includes('T') && !value.includes('Z') && !value.includes('+') && !value.includes('-', 10)) {
      // ISO formatida timezone'siz - Tashkent timezone'da deb hisoblaymiz
      date = new Date(value + '+05:00')
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
      // SQLite datetime formatida (YYYY-MM-DD HH:MM:SS) - timezone'siz
      date = new Date(value.replace(' ', 'T') + '+05:00')
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Faqat sana (YYYY-MM-DD)
      date = new Date(value + 'T00:00:00+05:00')
    } else {
      // Boshqa formatlar
      date = new Date(value)
    }
  } else {
    date = new Date(value)
  }
  
  if (Number.isNaN(date.getTime())) return value

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  
  const parts = formatter.formatToParts(date)
  const day = parts.find(p => p.type === 'day')?.value || '00'
  const month = parts.find(p => p.type === 'month')?.value || '00'
  const year = parts.find(p => p.type === 'year')?.value || '0000'

  return `${day}-${month}-${year}`
}

/**
 * formatDateTime uchun qisqa nom (backward compatibility)
 */
export const formatDate = formatDateTime

/**
 * Hozirgi vaqtni O'zbekiston vaqt mintaqasida (Asia/Tashkent, UTC+5) olish
 * Format: dd-mm-yyyy HH:mm:ss
 */
export function getCurrentDateTime(): string {
  return formatDateTime(new Date().toISOString())
}

/**
 * Hozirgi sanani olish (vaqtsiz)
 * Format: dd-mm-yyyy
 */
export function getCurrentDate(): string {
  return formatDateOnly(new Date().toISOString())
}

/**
 * Hozirgi sanani date input formatida olish (YYYY-MM-DD)
 */
export function getCurrentDateInput(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Hozirgi vaqtni datetime-local input formatida olish (YYYY-MM-DDTHH:mm)
 */
export function getCurrentDateTimeInput(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Hozirgi vaqtni ISO formatida olish (backend'ga yuborish uchun)
 * Format: YYYY-MM-DDTHH:mm:ss+05:00
 */
export function getCurrentDateTimeISO(): string {
  const now = new Date()
  const tashkentTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }))
  
  const year = tashkentTime.getFullYear()
  const month = String(tashkentTime.getMonth() + 1).padStart(2, '0')
  const day = String(tashkentTime.getDate()).padStart(2, '0')
  const hours = String(tashkentTime.getHours()).padStart(2, '0')
  const minutes = String(tashkentTime.getMinutes()).padStart(2, '0')
  const seconds = String(tashkentTime.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:00`
}

/**
 * Real vaqtni olish va formatlash (test qilish uchun)
 * Format: dd-mm-yyyy HH:mm:ss
 */
export function getRealTimeNow(): string {
  return getCurrentDateTime()
}

/**
 * Real vaqtni UTC formatida olish
 */
export function getRealTimeUTC(): string {
  return new Date().toISOString()
}

