/**
 * Backend vaqt formatlash utility funksiyalari
 * Barcha joylarda bir xil vaqt ko'rsatish uchun
 */

/**
 * Hozirgi vaqtni O'zbekiston vaqt mintaqasida (Asia/Tashkent, UTC+5) ISO formatida olish
 * Format: YYYY-MM-DDTHH:mm:ss+05:00
 */
export function getCurrentDateTimeTashkent() {
  const now = new Date();
  // Tashkent timezone'da vaqtni olish
  const tashkentTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
  
  const year = tashkentTime.getFullYear();
  const month = String(tashkentTime.getMonth() + 1).padStart(2, '0');
  const day = String(tashkentTime.getDate()).padStart(2, '0');
  const hours = String(tashkentTime.getHours()).padStart(2, '0');
  const minutes = String(tashkentTime.getMinutes()).padStart(2, '0');
  const seconds = String(tashkentTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:00`;
}

/**
 * Hozirgi vaqtni SQLite datetime formatida olish (YYYY-MM-DD HH:MM:SS)
 * Tashkent timezone'da
 */
export function getCurrentDateTimeSQLite() {
  const now = new Date();
  // Tashkent timezone'da vaqtni olish
  const tashkentTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
  
  const year = tashkentTime.getFullYear();
  const month = String(tashkentTime.getMonth() + 1).padStart(2, '0');
  const day = String(tashkentTime.getDate()).padStart(2, '0');
  const hours = String(tashkentTime.getHours()).padStart(2, '0');
  const minutes = String(tashkentTime.getMinutes()).padStart(2, '0');
  const seconds = String(tashkentTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Vaqtni Tashkent timezone'da formatlash
 * Agar vaqt timezone'siz bo'lsa, uni Tashkent timezone'da deb hisoblaydi
 */
export function formatDateTimeTashkent(dateString) {
  if (!dateString) return null;
  
  let date;
  
  // Agar ISO formatida bo'lsa
  if (dateString.includes('T')) {
    // Agar timezone'siz bo'lsa, Tashkent timezone qo'shamiz
    if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
      date = new Date(dateString + '+05:00');
    } else {
      date = new Date(dateString);
    }
  } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
    // SQLite datetime formatida (YYYY-MM-DD HH:MM:SS)
    date = new Date(dateString.replace(' ', 'T') + '+05:00');
  } else {
    date = new Date(dateString);
  }
  
  // Tashkent timezone'da formatlash
  const tashkentTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
  
  const year = tashkentTime.getFullYear();
  const month = String(tashkentTime.getMonth() + 1).padStart(2, '0');
  const day = String(tashkentTime.getDate()).padStart(2, '0');
  const hours = String(tashkentTime.getHours()).padStart(2, '0');
  const minutes = String(tashkentTime.getMinutes()).padStart(2, '0');
  const seconds = String(tashkentTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:00`;
}

