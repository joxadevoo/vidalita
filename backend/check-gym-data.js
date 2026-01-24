import db from "./db/database.js";

console.log('\n📊 Oxirgi 5 ta a\'zo va ularning gym memberships:\n');

const members = db.prepare(`
  SELECT 
    m.id,
    m.fullName, 
    m.qrCodeId, 
    m.gymStart as oldGymStart,
    m.gymEnd as oldGymEnd,
    gm.id as gymMembershipId,
    gm.startDate, 
    gm.endDate,
    gm.membershipType
  FROM members m 
  LEFT JOIN gym_memberships gm ON m.id = gm.memberId 
  ORDER BY m.id DESC 
  LIMIT 5
`).all();

members.forEach(m => {
    console.log(`\n${m.fullName} (${m.qrCodeId}):`);
    console.log(`  Member ID: ${m.id}`);
    console.log(`  Old gymStart: ${m.oldGymStart || 'NULL'}`);
    console.log(`  Old gymEnd: ${m.oldGymEnd || 'NULL'}`);
    console.log(`  Gym Membership ID: ${m.gymMembershipId || 'NULL'}`);
    console.log(`  New startDate: ${m.startDate || 'NULL'}`);
    console.log(`  New endDate: ${m.endDate || 'NULL'}`);
    console.log(`  Membership Type: ${m.membershipType || 'NULL'}`);
});

console.log('\n');
