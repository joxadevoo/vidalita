<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('appointments.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('appointments.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <div class="flex rounded-lg border border-gray-200 p-1 bg-white">
          <button 
            @click="viewType = 'calendar'"
            :class="viewType === 'calendar' ? 'bg-sky-50 text-sky-600' : 'text-gray-500 hover:text-gray-700'"
            class="px-3 py-1 text-sm font-medium rounded-md transition-colors"
          >
            {{ $t('appointments.view.calendar') }}
          </button>
          <button 
            @click="viewType = 'list'"
            :class="viewType === 'list' ? 'bg-sky-50 text-sky-600' : 'text-gray-500 hover:text-gray-700'"
            class="px-3 py-1 text-sm font-medium rounded-md transition-colors"
          >
            {{ $t('appointments.view.list') }}
          </button>
        </div>
        <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50" @click="fetchAppointments">{{ $t('common.refresh') }}</button>
        <button class="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500" @click="openModal()">{{ $t('appointments.newAppointment') }}</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ $t('appointments.stats.today') }}</div>
            <div class="text-2xl font-black text-sky-600 mt-1">{{ appointments.filter(a => isToday(a.startTime)).length }}</div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ $t('appointments.stats.pending') }}</div>
            <div class="text-2xl font-black text-amber-500 mt-1">{{ appointments.filter(a => a.status === 'BOOKED' || a.status === 'CONFIRMED').length }}</div>
        </div>
    </div>

    <!-- Filter paneli -->
    <div class="sticky top-0 z-20 grid gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4 no-print">
      <div class="flex min-w-0 flex-col">
        <label class="mb-1 text-xs text-gray-500">{{ $t('appointments.dateFrom') }}</label>
        <input v-model="dateFrom" type="date" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400" />
      </div>
      <div class="flex min-w-0 flex-col">
        <label class="mb-1 text-xs text-gray-500">{{ $t('appointments.dateTo') }}</label>
        <input v-model="dateTo" type="date" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400" />
      </div>
      <div class="flex min-w-0 flex-col">
        <label class="mb-1 text-xs text-gray-500">{{ $t('common.search') }}</label>
        <input v-model="searchTerm" type="text" :placeholder="$t('appointments.searchPlaceholder')" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400" />
      </div>
      <div class="flex min-w-0 w-full items-end gap-1 overflow-hidden">
        <div class="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2">
          <input id="todayOnly" v-model="onlyToday" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
          <label for="todayOnly" class="text-xs text-gray-600 whitespace-nowrap">{{ $t('appointments.todayOnly') }}</label>
        </div>
        <button
          @click="resetFilters"
          class="flex-shrink-0 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 hover:bg-gray-50 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          {{ $t('appointments.resetFilters') }}
        </button>
      </div>
    </div>

    <!-- Calendar/List View -->
    <div v-if="viewType === 'calendar'" class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm min-h-[600px] no-print">
        <FullCalendar :options="calendarOptions" />
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm no-print">
        <div v-if="loading" class="p-8 text-center text-gray-500 italic">{{ $t('common.loading') }}</div>
        <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('appointments.columns.customer') }}</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('common.time') }}</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('appointments.columns.staffRoom') }}</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('appointments.columns.service') }}</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('common.status') }}</th>
                    <th class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">{{ $t('common.actions') }}</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="app in filteredAppointments" :key="app.id" class="hover:bg-gray-50">
                    <td class="px-3 py-4 text-sm font-medium text-gray-900">
                        <div v-if="app.member">{{ app.member.fullName }} <span class="text-xs text-sky-500 font-normal">({{ $t('appointments.member') }})</span></div>
                        <div v-else>{{ app.guestName }} <span class="text-xs text-gray-400 font-normal">({{ $t('appointments.guest') }})</span></div>
                        <div class="text-xs text-gray-500">{{ app.member?.phone || app.guestPhone }}</div>
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-800 font-semibold">
                        <div>{{ new Date(app.startTime).toLocaleDateString() }}</div>
                        <div class="text-xs text-indigo-500">{{ formatTime(app.startTime) }} - {{ formatTime(app.endTime) }}</div>
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-600">
                        <div>{{ app.staff?.fullName || '—' }}</div>
                        <div class="text-xs text-gray-400">{{ app.room?.name || $t('appointments.noRoom') }}</div>
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
                            <option value="BOOKED">{{ $t('appointments.status.booked') }}</option>
                            <option value="CONFIRMED">{{ $t('appointments.status.confirmed') }}</option>
                            <option value="IN_PROGRESS">{{ $t('appointments.status.inProgress') }}</option>
                            <option value="COMPLETED" :disabled="app.status === 'COMPLETED'">{{ $t('appointments.status.completed') }}</option>
                            <option value="CANCELLED">{{ $t('appointments.status.cancelled') }}</option>
                            <option value="NO_SHOW">{{ $t('appointments.status.noShow') }}</option>
                        </select>
                        <button 
                            @click="deleteAppointment(app.id)" 
                            class="text-red-500 hover:text-red-700 p-1"
                            :title="$t('common.delete')"
                        >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </td>
                </tr>
                <tr v-if="filteredAppointments.length === 0">
                    <td colspan="6" class="p-8 text-center text-gray-400 italic">{{ $t('appointments.noAppointments') }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- New Booking Modal -->
    <div v-if="showModal" class="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4" @click.self="showModal = false">
        <div class="relative w-full max-w-xl rounded-xl bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden z-[151]" @click.stop>
            <div class="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
                <h3 class="text-lg font-bold text-gray-900">{{ $t('appointments.newAppointment') }}</h3>
                <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
                <div class="grid gap-4 sm:grid-cols-2">
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('appointments.form.memberOptional') }}</label>
                        <select v-model="form.memberId" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400">
                            <option :value="null">{{ $t('appointments.form.guestOption') }}</option>
                            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.fullName }}</option>
                        </select>
                    </div>
                    <template v-if="!form.memberId">
                        <div>
                            <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('appointments.form.guestName') }}</label>
                            <input v-model="form.guestName" type="text" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('appointments.form.guestPhone') }}</label>
                            <input v-model="form.guestPhone" type="text" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                        </div>
                    </template>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('appointments.form.startTime') }}</label>
                        <input v-model="form.startTime" type="datetime-local" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('appointments.form.endTime') }}</label>
                        <input v-model="form.endTime" type="datetime-local" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('appointments.form.staff') }}</label>
                        <select v-model="form.staffId" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                            <option v-for="s in staff" :key="s.id" :value="s.id">{{ s.full_name }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('appointments.form.room') }}</label>
                        <select v-model="form.roomId" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                            <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
                        </select>
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('beautyServices.serviceNameLabel') }}</label>
                        <select v-model="form.serviceName" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400">
                            <option value="">{{ $t('beautyServices.serviceNameSelect') }}</option>
                            <optgroup v-for="(cat, key) in serviceData.categories" :key="key" :label="cat.label">
                                <option v-for="sKey in cat.services" :key="sKey" :value="serviceData.labels[sKey]">
                                    {{ serviceData.labels[sKey] }}
                                </option>
                            </optgroup>
                        </select>
                    </div>
                    <div v-if="form.memberId && activePackages.length > 0" class="sm:col-span-2">
                        <label class="block text-xs font-medium text-orange-600 uppercase">{{ $t('appointments.form.usePackage') }}</label>
                        <select v-model="form.servicePackageId" class="mt-1 w-full rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm">
                            <option v-for="pkg in activePackages" :key="pkg.id" :value="pkg.id">
                                {{ pkg.serviceName }} ({{ pkg.remainingSessions }} {{ $t('beautyServices.sessionsLeft') }})
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex justify-end gap-3 flex-shrink-0">
                <button 
                    @click="showModal = false" 
                    class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white transition-colors"
                >
                    {{ $t('common.cancel') }}
                </button>
                <button 
                    @click="submitBooking" 
                    :disabled="submitting"
                    class="rounded-lg bg-sky-600 px-6 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50 shadow-sm transition-all active:scale-[0.98]"
                >
                    {{ submitting ? $t('common.loading') : $t('common.save') }}
                </button>
            </div>
        </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && selectedEvent" class="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl my-auto z-[151]">
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-bold text-gray-900">{{ $t('appointments.details') }}</h3>
                <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-600">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="flex justify-between border-b pb-2">
                    <span class="text-sm text-gray-500">{{ $t('appointments.columns.customer') }}</span>
                    <span class="text-sm font-semibold">{{ selectedEvent.member?.fullName || selectedEvent.guestName }}</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                    <span class="text-sm text-gray-500">{{ $t('common.time') }}</span>
                    <span class="text-sm font-semibold">{{ formatTime(selectedEvent.startTime) }} - {{ formatTime(selectedEvent.endTime) }}</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                    <span class="text-sm text-gray-500">{{ $t('appointments.columns.service') }}</span>
                    <span class="text-sm font-semibold">{{ selectedEvent.serviceName || '—' }}</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                    <span class="text-sm text-gray-500">{{ $t('appointments.form.staff') }}</span>
                    <span class="text-sm font-semibold">{{ selectedEvent.staff?.fullName || '—' }}</span>
                </div>
                <div v-if="selectedEvent.notes" class="border-b pb-2">
                    <span class="text-sm text-gray-500 block mb-1">{{ $t('common.notes') }}</span>
                    <p class="text-sm bg-gray-50 p-2 rounded">{{ selectedEvent.notes }}</p>
                </div>

                <div class="grid grid-cols-2 gap-2 mt-6">
                    <select 
                        @change="updateStatusAndClose(selectedEvent.id, ($event.target as HTMLSelectElement).value)"
                        class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400"
                        :value="selectedEvent.status"
                    >
                        <option value="BOOKED">{{ $t('appointments.status.booked') }}</option>
                        <option value="CONFIRMED">{{ $t('appointments.status.confirmed') }}</option>
                        <option value="IN_PROGRESS">{{ $t('appointments.status.inProgress') }}</option>
                        <option value="COMPLETED" :disabled="selectedEvent.status === 'COMPLETED'">{{ $t('appointments.status.completed') }}</option>
                        <option value="CANCELLED">{{ $t('appointments.status.cancelled') }}</option>
                    </select>
                    <button 
                        @click="deleteAppointmentAndClose(selectedEvent.id)" 
                        class="w-full rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                        {{ $t('common.delete') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { appointmentsService, membersService, beautyService, cashSessionsService } from '../services/supabaseService';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import * as XLSX from 'xlsx';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const appointments = ref<any[]>([]);
const staff = ref<any[]>([]);
const rooms = ref<any[]>([]);
const members = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const showDetailModal = ref(false);
const selectedEvent = ref<any>(null);
const viewType = ref<'calendar' | 'list'>('calendar');
const activePackages = ref<any[]>([]);
const currentSession = ref<any>(null);
const serviceData = ref<any>({ categories: {}, labels: {} });
const serviceTypes = ref<any[]>([]);

// Filter state
const dateFrom = ref('');
const dateTo = ref('');
const searchTerm = ref('');
const onlyToday = ref(false);

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
    notes: '',
    servicePackageId: null as number | null
});

watch(() => form.value.memberId, async (newId) => {
    if (newId) {
        activePackages.value = await beautyService.getMemberPackages(newId);
        // Try to auto-select package if service is already selected
        if (form.value.serviceName) {
            const matchingPkg = activePackages.value.find(p => p.serviceName === form.value.serviceName);
            if (matchingPkg) form.value.servicePackageId = matchingPkg.id;
        }
    } else {
        activePackages.value = [];
        form.value.servicePackageId = null;
    }
});

watch(() => form.value.serviceName, (newName) => {
    if (newName && form.value.memberId) {
        const matchingPkg = activePackages.value.find(p => p.serviceName === newName);
        if (matchingPkg) {
            form.value.servicePackageId = matchingPkg.id;
        } else {
            form.value.servicePackageId = null;
        }
    }
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

onMounted(async () => {
    fetchAppointments();
    try {
        currentSession.value = await cashSessionsService.getCurrentSession();
        const data = await beautyService.getServiceTypes();
        serviceData.value = data;
        serviceTypes.value = data.types;
    } catch (err) {
        console.error('Initial data load error:', err);
    }
});

const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        case 'BOOKED': return t('appointments.status.booked');
        case 'CONFIRMED': return t('appointments.status.confirmed');
        case 'IN_PROGRESS': return t('appointments.status.inProgress');
        case 'COMPLETED': return t('appointments.status.completed');
        case 'CANCELLED': return t('appointments.status.cancelled');
        case 'NO_SHOW': return t('appointments.status.noShow');
        default: return status;
    }
};

const updateStatus = async (id: string, newStatus: string) => {
    try {
        if (newStatus === 'COMPLETED') {
            const app = appointments.value.find(a => a.id === id);
            if (app && app.servicePackageId) {
                if (confirm(t('appointments.confirmComplete') + "?")) {
                    await appointmentsService.completeAppointment(id, app.servicePackageId);
                } else {
                    return;
                }
            } else {
                await appointmentsService.updateStatus(id, newStatus);
            }
        } else {
            await appointmentsService.updateStatus(id, newStatus);
        }
        await fetchAppointments();
    } catch (err: any) {
        alert(t('common.error') + ": " + err.message);
    }
};

const deleteAppointment = async (id: string) => {
    if (!confirm(t('common.deleteConfirm'))) return;
    try {
        await appointmentsService.deleteAppointment(id);
        await fetchAppointments();
    } catch (err: any) {
        alert(t('common.error') + ": " + err.message);
    }
};

const updateStatusAndClose = async (id: string, newStatus: string) => {
    await updateStatus(id, newStatus);
    showDetailModal.value = false;
};

const deleteAppointmentAndClose = async (id: string) => {
    await deleteAppointment(id);
    showDetailModal.value = false;
};

// Filtered appointments with date range
const filteredAppointments = computed(() => {
    const search = searchTerm.value.trim().toLowerCase();
    return appointments.value.filter((app) => {
        // Search filter
        const matchesSearch =
            !search ||
            (app.member?.fullName && app.member.fullName.toLowerCase().includes(search)) ||
            (app.guestName && app.guestName.toLowerCase().includes(search)) ||
            (app.serviceName && app.serviceName.toLowerCase().includes(search)) ||
            (app.member?.phone && app.member.phone.includes(search)) ||
            (app.guestPhone && app.guestPhone.includes(search));

        // Date filter
        let matchesDate = true;
        const appDate = new Date(app.startTime).toISOString().slice(0, 10);

        if (onlyToday.value) {
            const today = new Date().toISOString().slice(0, 10);
            matchesDate = appDate === today;
        } else if (dateFrom.value || dateTo.value) {
            if (dateFrom.value && dateTo.value) {
                matchesDate = appDate >= dateFrom.value && appDate <= dateTo.value;
            } else if (dateFrom.value) {
                matchesDate = appDate >= dateFrom.value;
            } else if (dateTo.value) {
                matchesDate = appDate <= dateTo.value;
            }
        }

        return matchesSearch && matchesDate;
    });
});

const resetFilters = () => {
    dateFrom.value = '';
    dateTo.value = '';
    searchTerm.value = '';
    onlyToday.value = false;
};

const submitBooking = async () => {
    if (form.value.servicePackageId) {
        const pkg = activePackages.value.find(p => p.id === form.value.servicePackageId);
        if (pkg && pkg.remainingSessions <= 0) {
            alert(t('beautyServices.errorNoSessions'));
            return;
        }
    }
    
    submitting.value = true;
    try {
        const payload = { 
            ...form.value,
            cashSessionId: currentSession.value?.id || null
        };
        await appointmentsService.create(payload);
        showModal.value = false;
        await fetchAppointments();
        form.value = { memberId: null, guestName: '', guestPhone: '', serviceName: '', staffId: null, roomId: null, startTime: '', endTime: '', price: 0, notes: '', servicePackageId: null };
    } catch (err: any) {
        alert(t('common.error') + ": " + err.message);
    } finally {
        submitting.value = false;
    }
};

const openModal = (start?: string, end?: string) => {
    form.value.startTime = start || '';
    form.value.endTime = end || '';
    showModal.value = true;
};

const calendarOptions = computed(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridDay,timeGridWeek,dayGridMonth'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    slotMinTime: '07:00:00',
    slotMaxTime: '22:00:00',
    events: appointments.value.map(app => ({
        id: app.id,
        title: (app.member?.fullName || app.guestName) + ' - ' + (app.serviceName || ''),
        start: app.startTime,
        end: app.endTime,
        backgroundColor: getEventColor(app.status),
        borderColor: getEventColor(app.status),
        extendedProps: app
    })),
    select: (info: any) => {
        openModal(info.startStr.slice(0, 16), info.endStr.slice(0, 16));
    },
    eventClick: (info: any) => {
        selectedEvent.value = info.event.extendedProps;
        showDetailModal.value = true;
    },
    eventDrop: async (info: any) => {
        try {
            await appointmentsService.updateTime(
                info.event.id, 
                info.event.startStr.slice(0, 16), 
                info.event.endStr?.slice(0, 16) || info.event.startStr.slice(0, 16)
            );
            await fetchAppointments();
        } catch (err: any) {
            alert(t('common.error') + ": " + err.message);
            info.revert();
        }
    }
}));

const getEventColor = (status: string) => {
    switch (status) {
        case 'COMPLETED': return '#10b981';
        case 'CANCELLED': return '#ef4444';
        case 'CONFIRMED': return '#6366f1';
        case 'IN_PROGRESS': return '#f59e0b';
        default: return '#0ea5e9';
    }
};

const exportToExcel = () => {
    if (appointments.value.length === 0) return;
    const excelData = appointments.value.map(app => ({
        [t('appointments.columns.customer')]: app.member?.fullName || app.guestName,
        [t('common.phone')]: app.member?.phone || app.guestPhone,
        [t('appointments.form.startTime')]: new Date(app.startTime).toLocaleString(),
        [t('appointments.form.endTime')]: new Date(app.endTime).toLocaleString(),
        [t('appointments.form.staff')]: app.staff?.fullName || '',
        [t('appointments.form.room')]: app.room?.name || '',
        [t('appointments.columns.service')]: app.serviceName || '',
        [t('common.status')]: translateStatus(app.status)
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, t('appointments.title'));
    XLSX.writeFile(wb, `appointments_${new Date().toISOString().slice(0,10)}.xlsx`);
};
</script>
