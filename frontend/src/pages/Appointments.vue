<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Uchrashuvlar</h2>
        <p class="text-sm text-gray-500">Beauty xizmatlari uchun navbatlar va muddatlar</p>
      </div>
      <div class="flex gap-2">
        <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50" @click="fetchAppointments">Yangilash</button>
        <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1" @click="exportToExcel">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Excel
        </button>
        <button class="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500" @click="showModal = true">Yangi band qilish</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bugungi navbatlar</div>
            <div class="text-2xl font-black text-sky-600 mt-1">{{ appointments.filter(a => isToday(a.startTime)).length }}</div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kutilmoqda</div>
            <div class="text-2xl font-black text-amber-500 mt-1">{{ appointments.filter(a => a.status === 'BOOKED' || a.status === 'CONFIRMED').length }}</div>
        </div>
    </div>

    <!-- Appointments Table -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div v-if="loading" class="p-8 text-center text-gray-500 italic">Yuklanmoqda...</div>
        <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mijoz / Mehmon</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Vaqt</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Xodim / Xona</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Xizmat</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Holat</th>
                    <th class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Amallar</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="app in appointments" :key="app.id" class="hover:bg-gray-50">
                    <td class="px-3 py-4 text-sm font-medium text-gray-900">
                        <div v-if="app.member">{{ app.member.fullName }} <span class="text-xs text-sky-500 font-normal">(A'zo)</span></div>
                        <div v-else>{{ app.guestName }} <span class="text-xs text-gray-400 font-normal">(Mehmon)</span></div>
                        <div class="text-xs text-gray-500">{{ app.member?.phone || app.guestPhone }}</div>
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-800 font-semibold">
                        <div>{{ new Date(app.startTime).toLocaleDateString('uz-UZ') }}</div>
                        <div class="text-xs text-indigo-500">{{ formatTime(app.startTime) }} - {{ formatTime(app.endTime) }}</div>
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-600">
                        <div>{{ app.staff?.fullName || '—' }}</div>
                        <div class="text-xs text-gray-400">{{ app.room?.name || 'Xona belgilanmagan' }}</div>
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-500">{{ app.serviceName || '—' }}</td>
                    <td class="px-3 py-4 text-sm">
                        <span :class="getStatusClass(app.status)" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                            {{ translateStatus(app.status) }}
                        </span>
                    </td>
                    <td class="px-3 py-4 text-right text-sm font-medium space-x-2">
                        <select 
                            @change="updateStatus(app.id, ($event.target as HTMLSelectElement).value)"
                            class="text-xs rounded border border-gray-200 p-1 focus:outline-none"
                            :value="app.status"
                        >
                            <option value="BOOKED">Yozildi</option>
                            <option value="CONFIRMED">Tasdiqlandi</option>
                            <option value="IN_PROGRESS">Jarayonda</option>
                            <option value="COMPLETED">Tugadi</option>
                            <option value="CANCELLED">Bekor qilindi</option>
                            <option value="NO_SHOW">Kelmagan</option>
                        </select>
                    </td>
                </tr>
                <tr v-if="appointments.length === 0">
                    <td colspan="6" class="p-8 text-center text-gray-400 italic">Hech qanday bandlik topilmadi</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Booking Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
        <div class="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl my-auto">
            <h3 class="text-lg font-bold mb-4">Yangi band qilish</h3>
            <div class="grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                    <label class="block text-xs font-medium text-gray-500 uppercase">A'zo (ixtiyoriy)</label>
                    <select v-model="form.memberId" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400">
                        <option :value="null">Mehmon (ro'yxatdan o'tmagan)</option>
                        <option v-for="m in members" :key="m.id" :value="m.id">{{ m.fullName }}</option>
                    </select>
                </div>
                <template v-if="!form.memberId">
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase">Mehmon ismi</label>
                        <input v-model="form.guestName" type="text" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase">Mehmon telefoni</label>
                        <input v-model="form.guestPhone" type="text" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                    </div>
                </template>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">Boshlanish vaqti</label>
                    <input v-model="form.startTime" type="datetime-local" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">Tugash vaqti</label>
                    <input v-model="form.endTime" type="datetime-local" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">Xodim</label>
                    <select v-model="form.staffId" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                        <option v-for="s in staff" :key="s.id" :value="s.id">{{ s.full_name }}</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">Xona</label>
                    <select v-model="form.roomId" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                        <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
                    </select>
                </div>
                <div class="sm:col-span-2">
                    <label class="block text-xs font-medium text-gray-500 uppercase">Xizmat nomi</label>
                    <input v-model="form.serviceName" type="text" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                </div>
            </div>
            <div class="mt-8 flex justify-end gap-3">
                <button @click="showModal = false" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Bekor qilish</button>
                <button @click="submitBooking" class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500" :disabled="submitting">
                    {{ submitting ? 'Yozilmoqda...' : 'Band qilish' }}
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { appointmentsService, membersService } from '../services/supabaseService';
import * as XLSX from 'xlsx';

const appointments = ref<any[]>([]);
const staff = ref<any[]>([]);
const rooms = ref<any[]>([]);
const members = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);

const form = ref({
    memberId: null,
    guestName: '',
    guestPhone: '',
    serviceName: '',
    staffId: null,
    roomId: null,
    startTime: '',
    endTime: '',
    price: 0,
    notes: ''
});

const fetchAppointments = async () => {
    loading.value = true;
    try {
        appointments.value = await appointmentsService.getAll();
        staff.value = await appointmentsService.getStaff();
        rooms.value = await appointmentsService.getRooms();
        members.value = await membersService.getAll();
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchAppointments);

const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
};

const isToday = (iso: string) => {
    return new Date(iso).toDateString() === new Date().toDateString();
};

const getStatusClass = (status: string) => {
    switch (status) {
        case 'BOOKED': return 'bg-sky-100 text-sky-700';
        case 'CONFIRMED': return 'bg-indigo-100 text-indigo-700';
        case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
        case 'COMPLETED': return 'bg-green-100 text-green-700';
        case 'CANCELLED': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const translateStatus = (status: string) => {
    switch (status) {
        case 'BOOKED': return 'Yozildi';
        case 'CONFIRMED': return 'Tasdiqlandi';
        case 'IN_PROGRESS': return 'Jarayonda';
        case 'COMPLETED': return 'Tugadi';
        case 'CANCELLED': return 'Bekor qilindi';
        case 'NO_SHOW': return 'Kelmagan';
        default: return status;
    }
};

const updateStatus = async (id: string, newStatus: string) => {
    try {
        await appointmentsService.updateStatus(id, newStatus);
        await fetchAppointments();
    } catch (err: any) {
        alert("Xatolik: " + err.message);
    }
};

const submitBooking = async () => {
    submitting.value = true;
    try {
        await appointmentsService.create(form.value);
        showModal.value = false;
        await fetchAppointments();
        form.value = { memberId: null, guestName: '', guestPhone: '', serviceName: '', staffId: null, roomId: null, startTime: '', endTime: '', price: 0, notes: '' };
    } catch (err: any) {
        alert("Xatolik: " + err.message);
    } finally {
        submitting.value = false;
    }
};

const exportToExcel = () => {
    if (appointments.value.length === 0) return;
    const excelData = appointments.value.map(app => ({
        "Mijoz/Mehmon": app.member?.fullName || app.guestName,
        "Telefon": app.member?.phone || app.guestPhone,
        "Boshlanish": new Date(app.startTime).toLocaleString('uz-UZ'),
        "Tugash": new Date(app.endTime).toLocaleString('uz-UZ'),
        "Xodim": app.staff?.fullName || '',
        "Xona": app.room?.name || '',
        "Xizmat": app.serviceName || '',
        "Holat": translateStatus(app.status)
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Uchrashuvlar");
    XLSX.writeFile(wb, `uchrashuvlar_${new Date().toISOString().slice(0,10)}.xlsx`);
};
</script>
