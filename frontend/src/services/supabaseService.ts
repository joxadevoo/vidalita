import { supabase } from '../lib/supabase';
import * as mappings from '../lib/mappings';

export const membersService = {
    async getAll() {
        const { data, error } = await supabase
            .from('members')
            .select('id, fullname, phone, qrcodeid, joindate, gymstart, gymend, gymactive, beautyhasrecord, lastupdated')
            .order('lastupdated', { ascending: false });
        if (error) throw error;
        return (data || []).map(mappings.mapMemberToCamelCase);
    },

    async getById(id: number | string) {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) throw error;
        return mappings.mapMemberToCamelCase(data);
    },

    async getByQrCode(code: string) {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('qrcodeid', code)
            .maybeSingle();
        if (error) throw error;
        return mappings.mapMemberToCamelCase(data);
    },

    async create(memberData: any) {
        const { data, error } = await supabase
            .from('members')
            .insert({
                fullname: memberData.fullName,
                phone: memberData.phone,
                qrcodeid: memberData.qrCodeId,
                joindate: memberData.joinDate,
                gymstart: memberData.gymStart,
                gymend: memberData.gymEnd,
                gymactive: memberData.gymActive ? 1 : 0,
                photo: memberData.photo,
                birthdate: memberData.birthDate,
                email: memberData.email,
                region: memberData.region,
                district: memberData.district,
                beautyhasrecord: memberData.beautyHasRecord ? 1 : 0,
                lastupdated: new Date().toISOString()
            })
            .select()
            .single();
        if (error) throw error;
        return mappings.mapMemberToCamelCase(data);
    },

    async update(id: number | string, memberData: any) {
        const { data, error } = await supabase
            .from('members')
            .update({
                fullname: memberData.fullName,
                phone: memberData.phone,
                qrcodeid: memberData.qrCodeId,
                joindate: memberData.joinDate,
                gymstart: memberData.gymStart,
                gymend: memberData.gymEnd,
                gymactive: memberData.gymActive ? 1 : 0,
                photo: memberData.photo,
                birthdate: memberData.birthDate,
                email: memberData.email,
                region: memberData.region,
                district: memberData.district,
                beautyhasrecord: memberData.beautyHasRecord ? 1 : 0,
                lastupdated: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return mappings.mapMemberToCamelCase(data);
    },

    async delete(id: number | string) {
        const { error } = await supabase.from('members').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    async getGymInfo(memberId: number | string) {
        const { data, error } = await supabase
            .from('gym_info')
            .select('*')
            .eq('memberid', memberId)
            .maybeSingle();
        if (error) throw error;
        return mappings.mapGymInfoToCamelCase(data);
    },

    async upsertGymInfo(memberId: number | string, gymData: any) {
        const payload = {
            memberid: memberId,
            emergencyname: gymData.emergencyName,
            emergencyphone: gymData.emergencyPhone,
            emergencyrelation: gymData.emergencyRelation,
            medicalconditions: gymData.medicalConditions,
            medications: gymData.medications,
            fitnessgoals: gymData.fitnessGoals,
            membershiptype: gymData.membershipType,
            membershiptypeother: gymData.membershipTypeOther,
            paymentmethod: gymData.paymentMethod,
            paymentmethodother: gymData.paymentMethodOther
        };

        const { data, error } = await supabase
            .from('gym_info')
            .upsert(payload, { onConflict: 'memberid' })
            .select()
            .single();
        if (error) throw error;
        return mappings.mapGymInfoToCamelCase(data);
    },

    async getBeautyHealth(memberId: number | string) {
        const { data, error } = await supabase
            .from('beauty_health_info')
            .select('*')
            .eq('memberid', memberId)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    async upsertBeautyHealth(memberId: number | string, healthData: any) {
        const payload: any = { memberid: memberId };
        const keys = [
            'bloodPressure', 'diabetes', 'cancer', 'cancerDetails',
            'cancerTreatment', 'cancerTreatmentDetails', 'hormonal',
            'thyroid', 'skin', 'skinDetails', 'alcohol', 'prosthesis',
            'platinum', 'implants', 'crowns', 'surgery', 'surgeryDetails',
            'surgeryDate', 'smoking', 'medications'
        ];

        keys.forEach(key => {
            if (healthData[key] !== undefined) {
                payload[key.toLowerCase()] = healthData[key];
            }
        });

        const { data, error } = await supabase
            .from('beauty_health_info')
            .upsert(payload, { onConflict: 'memberid' })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

export const checkinsService = {
    async getAll() {
        const { data, error } = await supabase
            .from('checkins')
            .select('*, members(fullname, phone)')
            .order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mappings.mapCheckinToCamelCase);
    },

    async getByMemberId(memberId: number | string) {
        const { data, error } = await supabase
            .from('checkins')
            .select('*')
            .eq('memberid', memberId)
            .order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mappings.mapCheckinToCamelCase);
    },

    async delete(id: number | string) {
        const { error } = await supabase.from('checkins').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    async add(qrCodeId: string, verifiedBy: string = 'system') {
        const { data: member, error: mErr } = await supabase
            .from('members')
            .select('*')
            .eq('qrcodeid', qrCodeId)
            .maybeSingle();

        if (mErr) throw mErr;
        if (!member) throw new Error('A\'zo topilmadi. ID noto\'g\'ri.');
        if (member.gymactive !== 1) throw new Error('A\'zolik faol emas');

        if (member.gymend) {
            const today = new Date().toISOString().slice(0, 10);
            if (member.gymend.slice(0, 10) < today) {
                throw new Error('Obuna muddati tugagan.');
            }
        }

        const today = new Date().toISOString().slice(0, 10);
        const { data: existing } = await supabase
            .from('checkins')
            .select('id')
            .eq('memberid', member.id)
            .gte('date', today)
            .lt('date', new Date(new Date(today).getTime() + 86400000).toISOString())
            .maybeSingle();

        if (existing) throw new Error('Bugun allaqachon kirish qayd etilgan');

        const { data, error } = await supabase
            .from('checkins')
            .insert({
                memberid: member.id,
                qrcodeid: qrCodeId,
                date: new Date().toISOString(),
                verifiedby: verifiedBy
            })
            .select('*, members(fullname, phone)')
            .single();

        if (error) throw error;
        return mappings.mapCheckinToCamelCase(data);
    }
};

export const beautyService = {
    async getAll() {
        const { data, error } = await supabase
            .from('beauty_services')
            .select('*, members(fullname, phone)')
            .order('servicedate', { ascending: false });
        if (error) throw error;
        return (data || []).map(mappings.mapBeautyServiceToCamelCase);
    },

    async getByMemberId(memberId: number | string) {
        const { data, error } = await supabase
            .from('beauty_services')
            .select('*')
            .eq('memberid', memberId)
            .order('servicedate', { ascending: false });
        if (error) throw error;
        return (data || []).map(mappings.mapBeautyServiceToCamelCase);
    },

    async add(payload: any) {
        const { data, error } = await supabase
            .from('beauty_services')
            .insert({
                memberid: payload.memberId,
                servicetype: payload.serviceType,
                servicename: payload.serviceName,
                servicedate: payload.serviceDate,
                amount: payload.amount,
                discountpercent: payload.discountPercent,
                note: payload.note
            })
            .select('*, members(fullname, phone)')
            .single();
        if (error) throw error;
        return mappings.mapBeautyServiceToCamelCase(data);
    },

    async delete(id: number | string) {
        const { error } = await supabase.from('beauty_services').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    async getMemberPackages(memberId: number | string) {
        const { data, error } = await supabase
            .from('service_packages')
            .select('*')
            .eq('member_id', memberId)
            .eq('is_active', true)
            .gt('remaining_sessions', 0)
            .order('purchase_date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mappings.mapServicePackageToCamelCase);
    },

    async addPackage(payload: any) {
        const { data, error } = await supabase
            .from('service_packages')
            .insert({
                member_id: payload.memberId,
                service_type: payload.serviceType,
                service_name: payload.serviceName,
                total_sessions: payload.totalSessions,
                remaining_sessions: payload.totalSessions,
                notes: payload.notes
            })
            .select()
            .single();
        if (error) throw error;
        return mappings.mapServicePackageToCamelCase(data);
    },

    async usePackageSession(packageId: number | string, serviceDate?: string) {
        // 1. Get package current balance
        const { data: pkg, error: getError } = await supabase
            .from('service_packages')
            .select('*')
            .eq('id', packageId)
            .single();

        if (getError) throw getError;
        if (pkg.remaining_sessions <= 0) throw new Error('No sessions remaining');

        // 2. Decrement balance
        const { error: updateError } = await supabase
            .from('service_packages')
            .update({ remaining_sessions: pkg.remaining_sessions - 1 })
            .eq('id', packageId);

        if (updateError) throw updateError;

        // 3. Add to beauty_services (log the actual service)
        const { data: service, error: serviceError } = await supabase
            .from('beauty_services')
            .insert({
                memberid: pkg.member_id,
                servicetype: pkg.service_type,
                servicename: pkg.service_name,
                servicedate: serviceDate || new Date().toISOString(),
                amount: 0, // Already paid via package
                note: `Used from package ID: ${packageId}`
            })
            .select()
            .single();

        if (serviceError) throw serviceError;
        return mappings.mapBeautyServiceToCamelCase(service);
    },

    async getServiceTypes() {
        return {
            types: [
                'golden_needle', 'bbl_laser', 'nd_yag_laser', 'fractional_laser', 'coolite_pro',
                'shape_smart', 'laser_epilation', 'hydramaster', 'hifu', 'ems_slim',
                'g8_massage', 'endo_roller', 'classic_massage', 'classic_facial', 'lymphatic',
                'passive_gym', 'waxing', 'nails', 'fitness_memberships'
            ],
            labels: {
                // Golden Needle
                'golden_needle_acne': 'Золотая Игла Лечение Акне (3 Сеанса)',
                'golden_needle_wrinkles': 'Золотая Игла Лечение Морщин (3 Сеанса)',
                'golden_needle_scars': 'Золотая Игла Лечение Ожоговых Шрамов (3 Сеанса)',
                'golden_needle_pigment': 'Золотая Игла Лечение Пигментных Пятен (3 Сеанса)',
                'golden_needle_stretch': 'Золотая Игла Лечение Растяжек Кожи',
                'golden_needle_pimple_scars': 'Золотая Игла Лечение Шрамов От Прыщей (3 Сеанса)',
                'golden_needle_rejuvenation': 'Золотая Игла Омоложение Кожи',
                'golden_needle_pores': 'Золотая Игла Сужение Пор (3 Сеанса)',
                // BBL Laser
                'bbl_freckles': 'BBL Лазер Лечение Веснушек (1 Сеанс)',
                'bbl_melasma': 'BBL Лазер Лечение Мелазмы (1 Сеанс)',
                'bbl_pigment': 'BBL Лазер Лечение Пигментных Пятен (1 Сеанс)',
                'bbl_redness': 'BBL Лазер Лечение Покраснений Кожи (1 Сеанс)',
                'bbl_pores': 'BBL Лазер Лечение Расширенных Пор (1 Сеанс)',
                'bbl_birthmarks': 'BBL Лазер Лечение Родимых Пятен (1 Сеанс)',
                'bbl_rosacea': 'BBL Лазер Лечение Розацеа (1 Сеанс)',
                // ND YAG
                'nd_yag_carbon': 'ND YAG Лазер Карбоновый Пилинг',
                'nd_yag_eyebrow': 'ND YAG Лазер Удаление Татуажа Бровей (3 Сеанса)',
                'nd_yag_tattoo': 'ND YAG Лазер Удаление Татуировки (8 Сеансов)',
                // Fractional
                'fractional_vaginal': 'Фракционный Лазер Вагинальное Сужение И Лечение Недержания Мочи',
                'fractional_wrinkles': 'Фракционный Лазер Лечение Морщин (1 Сеанс)',
                'fractional_scars': 'Фракционный Лазер Лечение Ожоговых Шрамов (1 Сеанс)',
                'fractional_pigment': 'Фракционный Лазер Лечение Пигментных Пятен (1 Сеанс)',
                'fractional_postop': 'Фракционный Лазер Лечение Послеоперационных Шрамов (1 Сеанс)',
                'fractional_stretch': 'Фракционный Лазер Лечение Растяжек (1 Сеанс)',
                'fractional_rubtsov': 'Фракционный Лазер Лечение Рубцов (1 Сеанс)',
                'fractional_sun': 'Фракционный Лазер Лечение Солнечных Пятен (1 Сеанс)',
                'fractional_general_scars': 'Фракционный Лазер Лечение Шрамов (1 Сеанс)',
                // Coolite Pro
                'coolite_lip': 'Coolite Pro Лазер Верхняя губа (Один сеанс)',
                'coolite_thigh': 'Coolite Pro Лазер Верхняя часть бедра (Один сеанс)',
                'coolite_arm_upper': 'Coolite Pro Лазер Верхняя часть руки (Один сеанс)',
                'coolite_face': 'Coolite Pro Лазер Все лицо (Один сеанс)',
                'coolite_legs': 'Coolite Pro Лазер Все ноги (Один сеанс)',
                'coolite_full_body': 'Coolite Pro Лазер Все тело: подмышки, гениталии, все ноги (6 сеансов)',
                'coolite_arm_full': 'Coolite Pro Лазер Вся рука (Один сеанс)',
                'coolite_chest': 'Coolite Pro Лазер Грудь (Один сеанс)',
                'coolite_occiput': 'Coolite Pro Лазер Затылок (Один сеанс)',
                'coolite_forehead': 'Coolite Pro Лазер Лоб (Один сеанс)',
                'coolite_thigh_lower': 'Coolite Pro Лазер Нижняя часть бедра (Один сеанс)',
                'coolite_arm_lower': 'Coolite Pro Лазер Нижняя часть руки (Один сеанс)',
                'coolite_buttocks_lower': 'Coolite Pro Лазер Нижняя часть ягодиц (Один сеанс)',
                'coolite_perianal': 'Coolite Pro Лазер Перинальная зона (Один сеанс)',
                'coolite_chin': 'Coolite Pro Лазер Подбородок (Один сеанс)',
                'coolite_axilla': 'Coolite Pro Лазер Подмышки (Один сеанс)',
                'coolite_popa': 'Coolite Pro Лазер Попа (Один сеанс)',
                'coolite_waist': 'Coolite Pro Лазер Поясница (Один сеанс)',
                'coolite_arm': 'Coolite Pro Лазер Рука (Один сеанс)',
                'coolite_back': 'Coolite Pro Лазер Спина (Один сеанс)',
                'coolite_feet': 'Coolite Pro Лазер Ступни (Один сеанс)',
                'coolite_stache': 'Coolite Pro Лазер Усики (Один сеанс)',
                'coolite_neck': 'Coolite Pro Лазер Шея (Один сеанс)',
                'coolite_buttocks': 'Coolite Pro Лазер Ягодицы (Один сеанс)',
                // Shape Smart
                'shape_smart_local': 'Shape Smart Локальное Похудение (8 Сеансов)',
                'shape_smart_hips': 'Shape Smart Локальное Похудение Бёдра (8 Сеансов)',
                'shape_smart_thighs_upper': 'Shape Smart Локальное Похудение Верхняя Часть Бёдер (8 Сеансов)',
                'shape_smart_belly': 'Shape Smart Локальное Похудение Живот (8 Сеансов)',
                'shape_smart_face': 'Shape Smart Локальное Похудение Лифтинг Лица (8 Сеансов)',
                'shape_smart_thighs_lower': 'Shape Smart Локальное Похудение Нижняя Часть Бёдер (8 Сеансов)',
                'shape_smart_chin': 'Shape Smart Локальное Похудение Подбородок (8 Сеансов)',
                'shape_smart_waist': 'Shape Smart Локальное Похудение Поясница (8 Сеансов)',
                'shape_smart_arms': 'Shape Smart Локальное Похудение Руки (8 Сеансов)',
                'shape_smart_back': 'Shape Smart Локальное Похудение Спина (8 Сеансов)',
                // Epilation
                'epil_sideburns': 'Лазерная Эпиляция Бакенбарды (1 Сеанс)',
                'epil_hips': 'Лазерная Эпиляция Бёдра (1 Сеанс)',
                'epil_lip': 'Лазерная Эпиляция Верхняя Губа (1 Сеанс)',
                'epil_arms_upper': 'Лазерная Эпиляция Верхняя Часть Рук (1 Сеанс)',
                'epil_buttocks_upper': 'Лазерная Эпиляция Верхняя Часть Ягодиц (1 Сеанс)',
                'epil_face': 'Лазерная Эпиляция Всё Лицо (1 Сеанс)',
                'epil_legs': 'Лазерная Эпиляция Всё Ноги (1 Сеанс)',
                'epil_arms': 'Лазерная Эпиляция Всё Руки (1 Сеанс)',
                'epil_full_body': 'Лазерная Эпиляция Всё Тело (Подмышки, Генитальная Область, Всё Ноги) (1 Сеанс)',
                'epil_genitals': 'Лазерная Эпиляция Генитальная Область (1 Сеанс)',
                'epil_shins': 'Лазерная Эпиляция Голени (1 Сеанс)',
                'epil_chest': 'Лазерная Эпиляция Грудь (1 Сеанс)',
                'epil_belly': 'Лазерная Эпиляция Живот (1 Сеанс)',
                'epil_occiput': 'Лазерная Эпиляция Затылок (1 Сеанс)',
                'epil_hands': 'Лазерная Эпиляция Кисти (1 Сеанс)',
                'epil_forehead': 'Лазерная Эпиляция Лоб (1 Сеанс)',
                'epil_arms_lower': 'Лазерная Эпиляция Нижняя Часть Рук (1 Сеанс)',
                'epil_chin': 'Лазерная Эпиляция Подбородок (1 Сеанс)',
                'epil_axilla': 'Лазерная Эпиляция Подмышки (1 Сеанс)',
                'epil_waist': 'Лазерная Эпиляция Поясница (1 Сеанс)',
                'epil_back': 'Лазерная Эпиляция Спина (1 Сеанс)',
                'epil_feet': 'Лазерная Эпиляция Ступни (1 Сеанс)',
                'epil_neck': 'Лазерная Эпиляция Шея (1 Сеанс)',
                'epil_buttocks': 'Лазерная Эпиляция Ягодицы (1 Сеанс)',
                // Hydramaster
                'hydra_chest': 'Hydramaster Подтяжка Груди (1 Сеанс)',
                'hydra_buttocks': 'Hydramaster Подтяжка Ягодиц (1 Сеанс)',
                'hydra_face': 'Hydramaster Уход За Кожей Лица (1 Сеанс)',
                // HIFU
                'hifu_face': 'HIFU Лифтинг Лица (1 Сеанс)',
                'hifu_chin': 'HIFU Лифтинг Подбородка (1 Сеанс)',
                'hifu_rejuvenation': 'HIFU Омоложение Кожи (1 Сеанс)',
                'hifu_eyebrows': 'HIFU Поднятие Бровей (1 Сеанс)',
                'hifu_wrinkles': 'HIFU Уменьшение Морщин (1 Сеанс)',
                // EMS Slim
                'ems_hips': 'EMS Slim Бёдра (8 Сеансов)',
                'ems_thighs_upper': 'EMS Slim Верхняя Часть Бёдер (8 Сеансов)',
                'ems_belly': 'EMS Slim Живот (8 Сеансов)',
                // G8
                'g8_general': 'G8 Массаж (1 Сеанс)',
                'g8_hips': 'G8 Массаж Бёдра (8 Сеансов)',
                'g8_thighs_upper': 'G8 Массаж Верхняя Часть Бёдер (8 Сеансов)',
                'g8_belly': 'G8 Массаж Живот (8 Сеансов)',
                'g8_thighs_lower': 'G8 Массаж Нижняя Часть Бёдер (8 Сеансов)',
                'g8_waist': 'G8 Массаж Поясница (8 Сеансов)',
                'g8_back': 'G8 Массаж Спина (8 Сеансов)',
                // Endo Roller
                'endo_thighs_upper': 'Endo Roller Массаж Верхняя Часть Бёдер (1 Сеанс)',
                'endo_thighs_lower': 'Endo Roller Массаж Нижняя Часть Бёдер (1 Сеанс)',
                'endo_waist': 'Endo Roller Массаж Поясница (1 Сеанс)',
                'endo_back': 'Endo Roller Массаж Спина (1 Сеанс)',
                // Others
                'needle_epil': 'Игольчатая Эпиляция (Поминутно)',
                'massage_classic': 'Классический Массаж Тела',
                'face_classic': 'Классический Уход За Кожей Лица',
                'lympho_1': 'Лимфодренаж (1 сеанс)',
                'lympho_gift': 'Лимфодренаж (4 сеанса в подарок)',
                'lympho_8': 'Лимфодренаж (8 сеанс)',
                'lympho_full': 'Лимфодренаж Всего Тела',
                'hair_care': 'Массаж И Уход За Волосами',
                'passive_gym_base': 'Пассивная Гимнастика',
                'passive_gym_1': 'Пассивная гимнастика (1 сеанс)',
                'passive_gym_gift': 'Пассивная гимнастика (4 сеанса в подарок)',
                'passive_gym_8': 'Пассивная гимнастика (8 сеанс)',
                // Waxing
                'wax_face': 'Восковая депиляция – Всё лицо',
                'wax_genitals': 'Восковая депиляция – Генитальная зона',
                'wax_package': 'Восковая депиляция – Пакет (Половина руки – Подмышки – Половина ноги – Генитальная зона)',
                'wax_axilla': 'Восковая депиляция – Подмышечные впадины',
                'wax_arm_full': 'Восковая депиляция – Полная рука',
                'wax_legs_full': 'Восковая депиляция – Полные ноги',
                'wax_leg_half': 'Восковая депиляция – Половина ноги',
                'wax_arm_half': 'Восковая депиляция – Половина руки',
                'wax_waist': 'Восковая депиляция – Поясница',
                'wax_back': 'Восковая депиляция – Спина',
                'wax_stache': 'Восковая депиляция – Усики',
                'wax_buttocks': 'Восковая депиляция – Ягодицы',
                // Nails
                'polish': 'Лак Для Ногтей',
                'manicure': 'Маникюр',
                'pedicure_nails': 'Маникюр ногтей на ногах',
                'extension': 'Наращивание Ногтей',
                'pedicure': 'Педикюр',
                'plastic_nails': 'Пластиковые Ногти',
                'heel_care': 'Уход За Пятками',
                'henna': 'Хна Для Ногтей',
                'shellac': 'Шеллак',
                // Fitness
                'zumba_month': 'Зумба (Ежемесячный Абонемент На 12 Занятий)',
                'zumba_session': 'Зумба (Занятие)',
                'yoga_month': 'Йога (Ежемесячный Абонемент, 3 Раза В Неделю)',
                'pilates_group': 'Пилатес (Групповое Занятие)',
                'pilates_individual': 'Пилатес (Индивидуальное Занятие)',
                'nutrition_plan': 'Планирование И Контроль Спортивного Питания',
                'fitness_12m': 'Фитнес (Абонемент На 12 Месяцев)',
                'fitness_3m': 'Фитнес (Абонемент На 3 Месяца)',
                'fitness_6m': 'Фитнес (Абонемент На 6 Месяцев)'
            },
            categories: {
                laser: { label: 'Лазерные процедуры (Золотая Игла, BBL, ND YAG, Фракционный)', services: ['golden_needle_acne', 'golden_needle_wrinkles', 'golden_needle_scars', 'golden_needle_pigment', 'golden_needle_stretch', 'golden_needle_pimple_scars', 'golden_needle_rejuvenation', 'golden_needle_pores', 'bbl_freckles', 'bbl_melasma', 'bbl_pigment', 'bbl_redness', 'bbl_pores', 'bbl_birthmarks', 'bbl_rosacea', 'nd_yag_carbon', 'nd_yag_eyebrow', 'nd_yag_tattoo', 'fractional_vaginal', 'fractional_wrinkles', 'fractional_scars', 'fractional_pigment', 'fractional_postop', 'fractional_stretch', 'fractional_rubtsov', 'fractional_sun', 'fractional_general_scars'] },
                coolite: { label: 'Coolite Pro Лазер (Эпиляция)', services: ['coolite_lip', 'coolite_thigh', 'coolite_arm_upper', 'coolite_face', 'coolite_legs', 'coolite_full_body', 'coolite_arm_full', 'coolite_chest', 'coolite_occiput', 'coolite_forehead', 'coolite_thigh_lower', 'coolite_arm_lower', 'coolite_buttocks_lower', 'coolite_perianal', 'coolite_chin', 'coolite_axilla', 'coolite_popa', 'coolite_waist', 'coolite_arm', 'coolite_back', 'coolite_feet', 'coolite_stache', 'coolite_neck', 'coolite_buttocks'] },
                slimming: { label: 'Похудение и Коррекция фигуры (Shape Smart, EMS, G8, Endo Roller)', services: ['shape_smart_local', 'shape_smart_hips', 'shape_smart_thighs_upper', 'shape_smart_belly', 'shape_smart_face', 'shape_smart_thighs_lower', 'shape_smart_chin', 'shape_smart_waist', 'shape_smart_arms', 'shape_smart_back', 'ems_hips', 'ems_thighs_upper', 'ems_belly', 'g8_general', 'g8_hips', 'g8_thighs_upper', 'g8_belly', 'g8_thighs_lower', 'g8_waist', 'g8_back', 'endo_thighs_upper', 'endo_thighs_lower', 'endo_waist', 'endo_back'] },
                epilation: { label: 'Лазерная Эпиляция (Стандарт)', services: ['epil_sideburns', 'epil_hips', 'epil_lip', 'epil_arms_upper', 'epil_buttocks_upper', 'epil_face', 'epil_legs', 'epil_arms', 'epil_full_body', 'epil_genitals', 'epil_shins', 'epil_chest', 'epil_belly', 'epil_occiput', 'epil_hands', 'epil_forehead', 'epil_arms_lower', 'epil_chin', 'epil_axilla', 'epil_waist', 'epil_back', 'epil_feet', 'epil_neck', 'epil_buttocks'] },
                skincare: { label: 'Уход за кожей и Массаж', services: ['hydra_chest', 'hydra_buttocks', 'hydra_face', 'hifu_face', 'hifu_chin', 'hifu_rejuvenation', 'hifu_eyebrows', 'hifu_wrinkles', 'massage_classic', 'face_classic', 'lympho_1', 'lympho_gift', 'lympho_8', 'lympho_full', 'hair_care', 'passive_gym_base', 'passive_gym_1', 'passive_gym_gift', 'passive_gym_8'] },
                waxing_nails: { label: 'Восковая депиляция и Ногтевой сервис', services: ['wax_face', 'wax_genitals', 'wax_package', 'wax_axilla', 'wax_arm_full', 'wax_legs_full', 'wax_leg_half', 'wax_arm_half', 'wax_waist', 'wax_back', 'wax_stache', 'wax_buttocks', 'polish', 'manicure', 'pedicure_nails', 'extension', 'pedicure', 'plastic_nails', 'heel_care', 'henna', 'shellac'] },
                fitness: { label: 'Фитнес и Абонементы', services: ['zumba_month', 'zumba_session', 'yoga_month', 'pilates_group', 'pilates_individual', 'nutrition_plan', 'fitness_12m', 'fitness_3m', 'fitness_6m'] }
            },
            prices: {
                // Golden Needle
                'golden_needle_acne': 4800000, 'golden_needle_wrinkles': 4800000, 'golden_needle_scars': 4800000, 'golden_needle_pigment': 4800000, 'golden_needle_stretch': 3000000, 'golden_needle_pimple_scars': 4800000, 'golden_needle_rejuvenation': 0, 'golden_needle_pores': 4800000,
                // BBL
                'bbl_freckles': 3600000, 'bbl_melasma': 3600000, 'bbl_pigment': 3600000, 'bbl_redness': 3600000, 'bbl_pores': 3600000, 'bbl_birthmarks': 3600000, 'bbl_rosacea': 3600000,
                // ND YAG
                'nd_yag_carbon': 2600000, 'nd_yag_eyebrow': 2600000, 'nd_yag_tattoo': 6000000,
                // Fractional
                'fractional_vaginal': 6000000, 'fractional_wrinkles': 3000000, 'fractional_scars': 3000000, 'fractional_pigment': 3000000, 'fractional_postop': 3000000, 'fractional_stretch': 3000000, 'fractional_rubtsov': 3000000, 'fractional_sun': 3000000, 'fractional_general_scars': 3000000,
                // Coolite Pro
                'coolite_lip': 190000, 'coolite_thigh': 720000, 'coolite_arm_upper': 360000, 'coolite_face': 720000, 'coolite_legs': 1900000, 'coolite_full_body': 4800000, 'coolite_arm_full': 720000, 'coolite_chest': 550000, 'coolite_occiput': 400000, 'coolite_forehead': 240000, 'coolite_thigh_lower': 720000, 'coolite_arm_lower': 440000, 'coolite_buttocks_lower': 720000, 'coolite_perianal': 440000, 'coolite_chin': 190000, 'coolite_axilla': 720000, 'coolite_popa': 440000, 'coolite_waist': 440000, 'coolite_arm': 440000, 'coolite_back': 720000, 'coolite_feet': 440000, 'coolite_stache': 240000, 'coolite_neck': 192000, 'coolite_buttocks': 550000,
                // Shape Smart
                'shape_smart_local': 4000000, 'shape_smart_hips': 4000000, 'shape_smart_thighs_upper': 4000000, 'shape_smart_belly': 4000000, 'shape_smart_face': 4000000, 'shape_smart_thighs_lower': 4000000, 'shape_smart_chin': 4000000, 'shape_smart_waist': 4000000, 'shape_smart_arms': 4000000, 'shape_smart_back': 4000000,
                // Epilation
                'epil_sideburns': 240000, 'epil_hips': 720000, 'epil_lip': 192000, 'epil_arms_upper': 360000, 'epil_buttocks_upper': 720000, 'epil_face': 720000, 'epil_legs': 1920000, 'epil_arms': 720000, 'epil_full_body': 4800000, 'epil_genitals': 432000, 'epil_shins': 720000, 'epil_chest': 552000, 'epil_belly': 552000, 'epil_occiput': 408000, 'epil_hands': 432000, 'epil_forehead': 240000, 'epil_arms_lower': 432000, 'epil_chin': 192000, 'epil_axilla': 720000, 'epil_waist': 432000, 'epil_back': 720000, 'epil_feet': 432000, 'epil_neck': 192000, 'epil_buttocks': 432000,
                // Hydramaster
                'hydra_chest': 700000, 'hydra_buttocks': 1000000, 'hydra_face': 700000,
                // HIFU
                'hifu_face': 3000000, 'hifu_chin': 3000000, 'hifu_rejuvenation': 3000000, 'hifu_eyebrows': 3000000, 'hifu_wrinkles': 3000000,
                // EMS Slim
                'ems_hips': 3600000, 'ems_thighs_upper': 3600000, 'ems_belly': 3600000,
                // G8
                'g8_general': 450000, 'g8_hips': 3600000, 'g8_thighs_upper': 3600000, 'g8_belly': 3600000, 'g8_thighs_lower': 3600000, 'g8_waist': 3600000, 'g8_back': 3600000,
                // Endo
                'endo_thighs_upper': 500000, 'endo_thighs_lower': 500000, 'endo_waist': 500000, 'endo_back': 500000,
                // Others
                'needle_epil': 76000, 'massage_classic': 400000, 'face_classic': 500000, 'lympho_1': 500000, 'lympho_gift': 0, 'lympho_8': 4000000, 'lympho_full': 500000, 'hair_care': 400000, 'passive_gym_base': 400000, 'passive_gym_1': 400000, 'passive_gym_gift': 0, 'passive_gym_8': 3200000,
                // Waxing
                'wax_face': 60000, 'wax_genitals': 90000, 'wax_package': 200000, 'wax_axilla': 40000, 'wax_arm_full': 60000, 'wax_legs_full': 120000, 'wax_leg_half': 60000, 'wax_arm_half': 40000, 'wax_waist': 75000, 'wax_back': 75000, 'wax_stache': 20000, 'wax_buttocks': 60000,
                // Nails
                'polish': 100000, 'manicure': 80000, 'pedicure_nails': 80000, 'extension': 400000, 'pedicure': 150000, 'plastic_nails': 230000, 'heel_care': 250000, 'henna': 100000, 'shellac': 180000,
                // Fitness
                'zumba_month': 400000, 'zumba_session': 80000, 'yoga_month': 600000, 'pilates_group': 120000, 'pilates_individual': 200000, 'nutrition_plan': 600000, 'fitness_12m': 4200000, 'fitness_3m': 1200000, 'fitness_6m': 2250000
            }
        };
    }
};

export const statsService = {
    async getDashboardStats() {
        const today = new Date().toISOString().slice(0, 10);
        const tomorrow = new Date(new Date().getTime() + 86400000).toISOString().slice(0, 10);

        const [
            { count: todayCheckins },
            { count: activeMembers },
            { count: totalMembers },
            { count: totalBeauty },
            { data: todaySales },
            { data: totalSales },
            { count: lowStockCount },
            { count: todayAppointments }
        ] = await Promise.all([
            supabase.from('checkins').select('*', { count: 'exact', head: true }).gte('date', today).lt('date', tomorrow),
            supabase.from('gym_memberships').select('*', { count: 'exact', head: true }).eq('active', 1).or(`enddate.is.null,enddate.gte.${today}`),
            supabase.from('members').select('*', { count: 'exact', head: true }),
            supabase.from('beauty_services').select('*', { count: 'exact', head: true }),
            supabase.from('sales').select('total_amount').gte('created_at', today).lt('created_at', tomorrow),
            supabase.from('sales').select('total_amount'),
            supabase.from('inventory_stock').select('*', { count: 'exact', head: true }).lte('quantity_on_hand', 5),
            supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('start_time', today).lt('start_time', tomorrow).not('status', 'eq', 'CANCELLED')
        ]);

        const todaySalesTotal = todaySales?.reduce((sum, s) => sum + parseFloat(s.total_amount), 0) || 0;
        const totalSalesSum = totalSales?.reduce((sum, s) => sum + parseFloat(s.total_amount), 0) || 0;

        return {
            checkins: { today: todayCheckins || 0 },
            members: { active: activeMembers || 0, total: totalMembers || 0 },
            beautyServices: { total: totalBeauty || 0 },
            pos: {
                todayRevenue: todaySalesTotal,
                totalRevenue: totalSalesSum,
                lowStockCount: lowStockCount || 0
            },
            appointments: {
                today: todayAppointments || 0
            }
        };
    }
};

export const gymMembershipsService = {
    async create(membershipData: any) {
        const { data, error } = await supabase
            .from('gym_memberships')
            .insert({
                memberid: membershipData.memberId,
                startdate: membershipData.startDate,
                enddate: membershipData.endDate,
                membershiptype: membershipData.membershipType,
                active: 1
            })
            .select()
            .single();
        if (error) throw error;
        return mappings.mapMembershipToCamelCase(data);
    }
};

export const generateQrCodeId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let uniquePart = '';
    for (let i = 0; i < 6; i++) {
        uniquePart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TGC${uniquePart}`;
};

export const authService = {
    async login(username: string, password: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('Username yoki parol noto\'g\'ri');

        return {
            user: {
                id: data.id,
                username: data.username,
                role: data.role || 'admin'
            }
        };
    }
};

export const storageService = {
    async uploadMemberPhoto(file: File, fileName: string) {
        const fileExt = file.name.split('.').pop();
        const filePath = `members/${fileName}_${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('member-photos')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error('Photo upload error:', error);
            throw error;
        }

        return data.path;
    },

    getMemberPhotoUrl(path: string) {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:image')) return path;

        const { data } = supabase.storage
            .from('member-photos')
            .getPublicUrl(path);

        return data.publicUrl;
    }
};

export const productsService = {
    normalizeSku(value: any) {
        const sku = value === null || value === undefined ? '' : String(value).trim();
        return sku && sku !== '0' ? sku : null;
    },

    normalizeBarcode(value: any) {
        const barcode = value === null || value === undefined ? '' : String(value).trim();
        return barcode && barcode !== '0' ? barcode : null;
    },

    async getAll() {
        const { data, error } = await supabase
            .from('products')
            .select('*, product_categories(id, name), inventory_stock(quantity_on_hand)')
            .neq('is_active', false)
            .order('name');
        if (error) throw error;
        return (data || []).map(mappings.mapProductToCamelCase);
    },

    async getCategories() {
        const { data, error } = await supabase.from('product_categories').select('*').order('name');
        if (error) throw error;
        return data;
    },

    async createCategory(name: string) {
        const { data, error } = await supabase.from('product_categories').insert({ name }).select().single();
        if (error) throw error;
        return data;
    },

    async create(productData: any) {
        const sku = this.normalizeSku(productData.sku);
        const barcode = this.normalizeBarcode(productData.barcode);
        const { data, error } = await supabase
            .from('products')
            .insert({
                name: productData.name,
                brand: productData.brand,
                category_id: productData.categoryId ?? null,
                sku,
                barcode,
                unit: productData.unit || 'pcs',
                sale_price: productData.salePrice ?? 0,
                discount_percent: productData.discountPercent ?? 0,
                cost_price_default: productData.costPriceDefault ?? 0,
                reorder_level: productData.reorderLevel ?? 0,

                image_url: productData.imageUrl,
                is_active: true
            })
            .select()
            .single();
        if (error) throw error;

        await supabase.from('inventory_stock').insert({ product_id: data.id, quantity_on_hand: 0 });
        return mappings.mapProductToCamelCase(data);
    },

    async update(id: number | string, productData: any) {
        const sku = this.normalizeSku(productData.sku);
        const barcode = this.normalizeBarcode(productData.barcode);
        const { data, error } = await supabase
            .from('products')
            .update({
                name: productData.name,
                brand: productData.brand,
                category_id: productData.categoryId ?? null,
                sku,
                barcode,
                unit: productData.unit || 'pcs',
                sale_price: productData.salePrice ?? 0,
                discount_percent: productData.discountPercent ?? 0,
                cost_price_default: productData.costPriceDefault ?? 0,
                reorder_level: productData.reorderLevel ?? 0,
                image_url: productData.imageUrl,
                is_active: productData.isActive,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return mappings.mapProductToCamelCase(data);
    },

    async delete(id: number | string) {
        const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id);
        if (error) throw error;
        return true;
    }
};

export const inventoryService = {
    async getStockLevels() {
        const { data, error } = await supabase
            .from('inventory_stock')
            .select('*, products(name, brand, sku, barcode)');
        if (error) throw error;
        return data;
    },

    async stockIn(payload: { productId: number | string, qty: number, unitCost: number, reason?: string }) {
        // We'll call our backend API for this to ensure stock updates are handled
        // For simplicity here, we'll just do a direct update if possible, 
        // but better to use the backend route we created.
        // However, this service usually talks to Supabase directly.
        // Let's implement it directly in Supabase for consistency with other services.

        const { error: moveError } = await supabase
            .from('inventory_movements')
            .insert({
                product_id: payload.productId,
                type: 'IN',
                qty: payload.qty,
                unit_cost: payload.unitCost,
                reason: payload.reason || 'purchase',
                reference_type: 'purchase'
            });
        if (moveError) throw moveError;

        const { data: current } = await supabase.from('inventory_stock').select('quantity_on_hand').eq('product_id', payload.productId).single();
        const newTotal = (current?.quantity_on_hand || 0) + payload.qty;

        const { error: stockError } = await supabase
            .from('inventory_stock')
            .upsert({ product_id: payload.productId, quantity_on_hand: newTotal, updated_at: new Date().toISOString() });
        if (stockError) throw stockError;
        return newTotal;
    },

    async getMovements(productId?: number | string) {
        let query = supabase
            .from('inventory_movements')
            .select('*, products(name, sku)')
            .order('created_at', { ascending: false });
        if (productId) query = query.eq('product_id', productId);
        const { data, error } = await query;
        if (error) throw error;
        const movements = data || [];

        const saleIds = movements
            .filter(m => String(m.reference_type || '').toLowerCase() === 'sale' && m.reference_id)
            .map(m => m.reference_id);

        if (saleIds.length === 0) return movements;

        const { data: sales, error: salesError } = await supabase
            .from('sales')
            .select('id, notes, members(fullname)')
            .in('id', saleIds);
        if (salesError) throw salesError;

        const saleNameById = new Map(
            (sales || []).map(s => [String(s.id), s.members?.[0]?.fullname || s.notes || null])
        );

        return movements.map(m => ({
            ...m,
            customerName: saleNameById.get(String(m.reference_id)) || null
        }));
    }
};

export const salesService = {
    async createSale(saleData: any) {
        const customerName = saleData.customerName ? String(saleData.customerName).trim() : '';
        const { data: sale, error: saleError } = await supabase
            .from('sales')
            .insert({
                member_id: saleData.memberId || null,
                total_amount: saleData.totalAmount,
                discount_amount: saleData.discountAmount || 0,
                payment_method: saleData.paymentMethod,
                payment_status: saleData.paymentStatus || 'PAID',
                notes: customerName || null
            })
            .select()
            .single();
        if (saleError) throw saleError;

        for (const item of saleData.items) {
            await supabase.from('sale_items').insert({
                sale_id: sale.id,
                product_id: item.productId,
                qty: item.qty,
                unit_price: item.price,
                unit_cost_snapshot: item.costPrice,
                line_total: item.price * item.qty
            });

            const { data: current } = await supabase.from('inventory_stock').select('quantity_on_hand').eq('product_id', item.productId).single();
            const newTotal = (current?.quantity_on_hand || 0) - item.qty;
            await supabase.from('inventory_stock').upsert({ product_id: item.productId, quantity_on_hand: newTotal });

            await supabase.from('inventory_movements').insert({
                product_id: item.productId,
                type: 'OUT',
                qty: -item.qty,
                reason: 'sale',
                reference_type: 'sale',
                reference_id: sale.id
            });
        }
        return sale;
    },

    async getAllSales() {
        const { data, error } = await supabase
            .from('sales')
            .select('*, members(fullname, phone)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mappings.mapSaleToCamelCase);
    },

    async getByMemberId(memberId: number | string) {
        const { data, error } = await supabase
            .from('sales')
            .select('*, members(fullname, phone), sale_items(*, products(name, sku))')
            .eq('member_id', memberId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(mappings.mapSaleToCamelCase);
    },

    async getById(id: number | string) {
        const { data, error } = await supabase
            .from('sales')
            .select('*, members(fullname, phone), sale_items(*, products(name, brand, sku))')
            .eq('id', id)
            .single();
        if (error) throw error;
        return mappings.mapSaleToCamelCase(data);
    }
};

export const appointmentsService = {
    async getAll(filters: any = {}) {
        let query = supabase
            .from('appointments')
            .select('*, members(fullname, phone), staff(full_name), rooms(name)')
            .order('start_time', { ascending: true });

        if (filters.staffId) query = query.eq('staff_id', filters.staffId);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.from) query = query.gte('start_time', filters.from);
        if (filters.to) query = query.lte('start_time', filters.to);

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(mappings.mapAppointmentToCamelCase);
    },

    async create(data: any) {
        const { data: created, error } = await supabase
            .from('appointments')
            .insert({
                member_id: data.memberId || null,
                guest_name: data.guestName,
                guest_phone: data.guestPhone,
                service_id: data.serviceId || null,
                service_name: data.serviceName || null,
                staff_id: data.staffId,
                room_id: data.roomId || null,
                start_time: data.startTime,
                end_time: data.endTime,
                price: data.price,
                discount: data.discount || 0,
                deposit_amount: data.depositAmount || 0,
                notes: data.notes
            })
            .select()
            .single();
        if (error) throw error;
        return mappings.mapAppointmentToCamelCase(created);
    },

    async updateStatus(id: string, status: string) {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return mappings.mapAppointmentToCamelCase(data);
    },

    async getStaff() {
        const { data, error } = await supabase.from('staff').select('*').order('full_name');
        if (error) throw error;
        return data;
    },

    async getRooms() {
        const { data, error } = await supabase.from('rooms').select('*').order('name');
        if (error) throw error;
        return data;
    }
    ,
    async getByMemberId(memberId: number | string) {
        const { data, error } = await supabase
            .from('appointments')
            .select('*, members(fullname, phone), staff(full_name), rooms(name)')
            .eq('member_id', memberId)
            .order('start_time', { ascending: false });
        if (error) throw error;
        return (data || []).map(mappings.mapAppointmentToCamelCase);
    }
};
