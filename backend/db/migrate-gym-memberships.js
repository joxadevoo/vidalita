import db from "./database.js";

console.log('🔄 Starting gym memberships migration...');

try {
    // 1. Mavjud gym ma'lumotlarini tekshirish
    const membersWithGym = db.prepare(`
    SELECT id, gymStart, gymEnd, gymActive
    FROM members
    WHERE gymStart IS NOT NULL
  `).all();

    console.log(`📊 Found ${membersWithGym.length} members with gym data`);

    if (membersWithGym.length === 0) {
        console.log('✅ No gym data to migrate');
        process.exit(0);
    }

    // 2. Migratsiya qilish
    let migratedCount = 0;
    let skippedCount = 0;

    const insertStmt = db.prepare(`
    INSERT INTO gym_memberships (memberId, startDate, endDate, membershipType, active, createdAt)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);

    for (const member of membersWithGym) {
        // Agar bu a'zo uchun allaqachon gym membership mavjud bo'lsa, o'tkazib yuborish
        const existing = db.prepare(`
      SELECT id FROM gym_memberships WHERE memberId = ?
    `).get(member.id);

        if (existing) {
            skippedCount++;
            continue;
        }

        // Membership type ni aniqlash (gymEnd asosida)
        let membershipType = 'monthly';
        if (member.gymEnd && member.gymStart) {
            const start = new Date(member.gymStart);
            const end = new Date(member.gymEnd);
            const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

            if (diffMonths >= 12) {
                membershipType = 'yearly';
            } else if (diffMonths >= 3) {
                membershipType = 'quarterly';
            } else {
                membershipType = 'monthly';
            }
        }

        insertStmt.run(
            member.id,
            member.gymStart,
            member.gymEnd || null,
            membershipType,
            member.gymActive || 0
        );

        migratedCount++;
    }

    console.log(`✅ Migration completed successfully!`);
    console.log(`   - Migrated: ${migratedCount} records`);
    console.log(`   - Skipped (already exists): ${skippedCount} records`);

    // 3. Verification
    const totalGymMemberships = db.prepare(`
    SELECT COUNT(*) as count FROM gym_memberships
  `).get();

    console.log(`📊 Total gym memberships in database: ${totalGymMemberships.count}`);

} catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
}
