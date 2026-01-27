export const mapMemberToCamelCase = (member: any): any => {
    if (!member) return {};
    return {
        id: member.id,
        fullName: member.fullname || '',
        phone: member.phone || '',
        gender: member.gender || null,
        qrCodeId: member.qrcodeid || '',
        joinDate: member.joindate || null,
        gymStart: member.gymstart || null,
        gymEnd: member.gymend || null,
        gymActive: member.gymactive || 0,
        beautyHasRecord: member.beautyhasrecord || 0,
        lastUpdated: member.lastupdated || null,
        synced: member.synced || 0,
        photo: member.photo || null,
        birthDate: member.birthdate || null,
        email: member.email || null,
        region: member.region || null,
        district: member.district || null
    };
};

export const mapGymInfoToCamelCase = (info: any) => {
    if (!info) return null;
    return {
        id: info.id,
        memberId: info.memberid,
        emergencyName: info.emergencyname,
        emergencyPhone: info.emergencyphone,
        emergencyRelation: info.emergencyrelation,
        medicalConditions: info.medicalconditions,
        medications: info.medications,
        fitnessGoals: info.fitnessgoals,
        membershipType: info.membershiptype,
        membershipTypeOther: info.membershiptypeother,
        paymentMethod: info.paymentmethod,
        paymentMethodOther: info.paymentmethodother
    };
};

export const mapBeautyServiceToCamelCase = (item: any): any => {
    if (!item) return {};
    return {
        id: item.id,
        memberId: item.memberid,
        serviceName: item.servicename || '',
        serviceType: item.servicetype || null,
        serviceDate: item.servicedate || '',
        note: item.note || '',
        amount: item.amount || 0,
        discountPercent: item.discountpercent || 0,
        paymentStatus: item.paymentstatus || 'pending',
        paymentMethod: item.paymentmethod || null,
        paymentDate: item.paymentdate || null,
        fullName: item.members?.fullname || null,
        phone: item.members?.phone || null,
        qrCodeId: item.members?.qrcodeid || null
    };
};

export const mapCheckinToCamelCase = (item: any): any => {
    if (!item) return {};
    return {
        id: item.id,
        memberId: item.memberid,
        qrCodeId: item.qrcodeid || '',
        date: item.date || '',
        verifiedBy: item.verifiedby || 'system',
        synced: item.synced || 0,
        fullName: item.members?.fullname || null,
        phone: item.members?.phone || null
    };
};

export const mapMembershipToCamelCase = (item: any) => {
    if (!item) return null;
    return {
        id: item.id,
        memberId: item.memberid,
        startDate: item.startdate,
        endDate: item.enddate,
        membershipType: item.membershiptype,
        active: item.active,
        createdAt: item.createdat,
        updatedAt: item.updatedat,
        fullName: item.members?.fullname || null,
        phone: item.members?.phone || null,
        qrCodeId: item.members?.qrcodeid || null
    };
};
