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
        cashSessionId: item.cash_session_id || null,
        fullName: item.members?.fullname || null,
        phone: item.members?.phone || null,
        qrCodeId: item.members?.qrcodeid || null
    };
};

export const mapProductToCamelCase = (p: any) => {
    if (!p) return null;
    return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        categoryId: p.category_id,
        category: p.product_categories ? { id: p.product_categories.id, name: p.product_categories.name } : null,
        sku: p.sku,
        barcode: p.barcode,
        unit: p.unit,
        salePrice: p.sale_price,
        costPriceDefault: p.cost_price_default,
        isActive: p.is_active,
        reorderLevel: p.reorder_level,
        imageUrl: p.image_url,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        currentStock: p.inventory_stock ? p.inventory_stock.quantity_on_hand : 0
    };
};

export const mapSaleToCamelCase = (s: any) => {
    if (!s) return null;
    return {
        id: s.id,
        memberId: s.member_id,
        member: s.members ? { fullName: s.members.fullname, phone: s.members.phone } : null,
        totalAmount: s.total_amount,
        discountAmount: s.discount_amount,
        cashAmount: s.cash_amount || 0,
        cardAmount: s.card_amount || 0,
        paymentStatus: s.payment_status,
        paymentMethod: s.payment_method,
        cashSessionId: s.cash_session_id,
        notes: s.notes,
        createdAt: s.created_at,
        debts: s.debts || [],
        items: s.sale_items ? s.sale_items.map(mapSaleItemToCamelCase) : []
    };
};

export const mapSaleItemToCamelCase = (si: any) => {
    if (!si) return null;
    return {
        id: si.id,
        saleId: si.sale_id,
        productId: si.product_id,
        product: si.products ? { name: si.products.name, brand: si.products.brand, sku: si.products.sku } : null,
        qty: si.qty,
        unitPrice: si.unit_price,
        unitCostSnapshot: si.unit_cost_snapshot,
        lineTotal: si.line_total
    };
};

export const mapAppointmentToCamelCase = (a: any) => {
    if (!a) return null;
    return {
        id: a.id,
        memberId: a.member_id,
        member: a.members ? { fullName: a.members.fullname, phone: a.members.phone } : null,
        guestName: a.guest_name,
        guestPhone: a.guest_phone,
        serviceId: a.service_id,
        serviceName: a.service_name,
        staffId: a.staff_id,
        staff: a.staff ? { fullName: a.staff.full_name } : null,
        roomId: a.room_id,
        room: a.rooms ? { name: a.rooms.name } : null,
        startTime: a.start_time,
        endTime: a.end_time,
        status: a.status,
        price: a.price,
        discount: a.discount,
        depositAmount: a.deposit_amount || 0,
        servicePackageId: a.service_package_id || null,
        notes: a.notes || '',
        createdAt: a.created_at
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
export const mapServicePackageToCamelCase = (pkg: any) => {
    if (!pkg) return null;
    return {
        id: pkg.id,
        memberId: pkg.member_id,
        serviceType: pkg.service_type,
        serviceName: pkg.service_name,
        totalSessions: pkg.total_sessions,
        remainingSessions: pkg.remaining_sessions,
        purchaseDate: pkg.purchase_date,
        isActive: pkg.is_active,
        notes: pkg.notes
    };
};
