import db from "./db/database.js";

console.log('\n📊 DASHBOARD STATISTIKA TEKSHIRUVI\n');
console.log('='.repeat(60));

// 1. Jami a'zolar
const totalMembers = db.prepare("SELECT COUNT(*) as count FROM members").get();
console.log(`\n1. Jami a'zolar: ${totalMembers.count}`);

// 2. Faol gym obunalari (yangi tuzilish)
const activeGymNew = db.prepare(`
  SELECT COUNT(*) as count
  FROM gym_memberships
  WHERE active = 1 AND (endDate IS NULL OR date(endDate) >= date('now'))
`).get();
console.log(`\n2. Faol gym obunalari (yangi): ${activeGymNew.count}`);

// 3. Faol gym obunalari (eski tuzilish)
const activeGymOld = db.prepare(`
  SELECT COUNT(*) as count
  FROM members
  WHERE gymActive = 1 AND (gymEnd IS NULL OR date(gymEnd) >= date('now'))
`).get();
console.log(`   Faol gym obunalari (eski): ${activeGymOld.count}`);

// 4. Tugagan gym obunalari (yangi)
const expiredGymNew = db.prepare(`
  SELECT COUNT(*) as count
  FROM gym_memberships
  WHERE active = 1 AND endDate IS NOT NULL AND date(endDate) < date('now')
`).get();
console.log(`\n3. Tugagan gym obunalari (yangi): ${expiredGymNew.count}`);

// 5. Tugagan gym obunalari (eski)
const expiredGymOld = db.prepare(`
  SELECT COUNT(*) as count
  FROM members
  WHERE gymActive = 1 AND gymEnd IS NOT NULL AND date(gymEnd) < date('now')
`).get();
console.log(`   Tugagan gym obunalari (eski): ${expiredGymOld.count}`);

// 6. Yaqinlashayotgan (7 kun ichida)
const expiringSoonNew = db.prepare(`
  SELECT COUNT(*) as count
  FROM gym_memberships
  WHERE active = 1 
    AND endDate IS NOT NULL
    AND date(endDate) >= date('now')
    AND date(endDate) <= date('now', '+7 days')
`).get();
console.log(`\n4. Yaqinlashayotgan (7 kun): ${expiringSoonNew.count}`);

// 7. Beauty xizmatlari
const totalBeauty = db.prepare("SELECT COUNT(*) as count FROM beauty_services").get();
console.log(`\n5. Jami beauty xizmatlar: ${totalBeauty.count}`);

// 8. beautyHasRecord = 1 bo'lgan a'zolar
const beautyMembers = db.prepare("SELECT COUNT(*) as count FROM members WHERE beautyHasRecord = 1").get();
console.log(`\n6. Beauty xizmati bor a'zolar: ${beautyMembers.count}`);

// 9. Batafsil ro'yxat
console.log('\n\n📋 BATAFSIL RO\'YXAT:\n');
console.log('='.repeat(60));

const detailedList = db.prepare(`
  SELECT 
    m.id,
    m.fullName,
    m.qrCodeId,
    m.gymActive as oldGymActive,
    m.gymEnd as oldGymEnd,
    gm.id as gymMembershipId,
    gm.endDate as newGymEnd,
    gm.active as newGymActive,
    (SELECT COUNT(*) FROM beauty_services WHERE memberId = m.id) as beautyCount,
    m.beautyHasRecord
  FROM members m
  LEFT JOIN gym_memberships gm ON m.id = gm.memberId
  ORDER BY m.id DESC
`).all();

detailedList.forEach(m => {
    console.log(`\n${m.fullName} (${m.qrCodeId}):`);

    // Gym status
    if (m.gymMembershipId) {
        const endDate = new Date(m.newGymEnd);
        const now = new Date();
        const isExpired = endDate < now;
        const status = isExpired ? '❌ TUGAGAN' : '✅ FAOL';
        console.log(`  Gym: ${status} (tugash: ${m.newGymEnd?.slice(0, 10)})`);
    } else {
        console.log(`  Gym: ⚪ YO'Q`);
    }

    // Beauty status
    if (m.beautyCount > 0) {
        console.log(`  Beauty: ✅ BOR (${m.beautyCount} ta xizmat)`);
    } else {
        console.log(`  Beauty: ⚪ YO'Q`);
    }

    console.log(`  beautyHasRecord: ${m.beautyHasRecord}`);
});

console.log('\n' + '='.repeat(60) + '\n');
