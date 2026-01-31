<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-900">{{ $t('settings.title') }}</h2>
    
    <!-- Language Selector -->
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-100 px-6 py-4">
        <h3 class="text-lg font-semibold text-gray-900">Tilni tanlang / Select Language / Выберите язык / Dil Seçin</h3>
      </div>
      <div class="px-6 py-6">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <button
            v-for="lang in languages"
            :key="lang.code"
            @click="setLocale(lang.code)"
            :class="[
              'rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors flex flex-col items-center gap-2',
              currentLocale === lang.code
                ? 'border-sky-500 bg-sky-50 text-sky-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            ]"
          >
            <GlobeAltIcon class="h-6 w-6" />
            <div>{{ lang.name }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- Staff & Rooms إدارة -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Staff -->
      <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4">
          <h3 class="text-lg font-semibold text-gray-900">Xodimlar</h3>
        </div>
        <div class="px-6 py-6 space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row">
            <input
              v-model="newStaffName"
              type="text"
              placeholder="Xodim ismi"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              v-model="newStaffRole"
              type="text"
              placeholder="Lavozim (ixtiyoriy)"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <button
              @click="addStaff"
              :disabled="creatingStaff"
              class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              Qo‘shish
            </button>
          </div>

          <div v-if="staffLoading" class="text-sm text-gray-500 italic">Yuklanmoqda...</div>
          <div v-else class="divide-y divide-gray-100">
            <div v-for="s in staff" :key="s.id" class="flex items-center justify-between py-3">
              <div>
                <div class="text-sm font-semibold text-gray-900">{{ s.full_name }}</div>
                <div class="text-xs text-gray-500">{{ s.role || '—' }}</div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="toggleStaffActive(s)"
                  class="rounded-md border px-2 py-1 text-xs font-medium"
                  :class="s.is_active ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-600'"
                >
                  {{ s.is_active ? 'Aktiv' : 'Nofaol' }}
                </button>
                <button
                  @click="deleteStaff(s.id)"
                  class="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
                >
                  O‘chirish
                </button>
              </div>
            </div>
            <div v-if="staff.length === 0" class="py-6 text-center text-sm text-gray-400">Xodimlar yo‘q</div>
          </div>
        </div>
      </div>

      <!-- Rooms -->
      <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4">
          <h3 class="text-lg font-semibold text-gray-900">Xonalar</h3>
        </div>
        <div class="px-6 py-6 space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row">
            <input
              v-model="newRoomName"
              type="text"
              placeholder="Xona nomi"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <button
              @click="addRoom"
              :disabled="creatingRoom"
              class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              Qo‘shish
            </button>
          </div>

          <div v-if="roomsLoading" class="text-sm text-gray-500 italic">Yuklanmoqda...</div>
          <div v-else class="divide-y divide-gray-100">
            <div v-for="r in rooms" :key="r.id" class="flex items-center justify-between py-3">
              <div class="text-sm font-semibold text-gray-900">{{ r.name }}</div>
              <div class="flex items-center gap-2">
                <button
                  @click="toggleRoomActive(r)"
                  class="rounded-md border px-2 py-1 text-xs font-medium"
                  :class="r.is_active ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-600'"
                >
                  {{ r.is_active ? 'Aktiv' : 'Nofaol' }}
                </button>
                <button
                  @click="deleteRoom(r.id)"
                  class="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
                >
                  O‘chirish
                </button>
              </div>
            </div>
            <div v-if="rooms.length === 0" class="py-6 text-center text-sm text-gray-400">Xonalar yo‘q</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { GlobeAltIcon } from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'

const { locale } = useI18n()
const currentLocale = computed(() => locale.value)

const languages = [
  { code: 'uz', name: 'O\'zbek' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' }
]

const setLocale = (code: string) => {
  locale.value = code
  localStorage.setItem('locale', code)
}

const staff = ref<any[]>([])
const rooms = ref<any[]>([])
const staffLoading = ref(false)
const roomsLoading = ref(false)
const creatingStaff = ref(false)
const creatingRoom = ref(false)
const newStaffName = ref('')
const newStaffRole = ref('')
const newRoomName = ref('')

const loadStaff = async () => {
  staffLoading.value = true
  try {
    const { data, error } = await supabase.from('staff').select('*').order('full_name')
    if (error) throw error
    staff.value = data || []
  } finally {
    staffLoading.value = false
  }
}

const loadRooms = async () => {
  roomsLoading.value = true
  try {
    const { data, error } = await supabase.from('rooms').select('*').order('name')
    if (error) throw error
    rooms.value = data || []
  } finally {
    roomsLoading.value = false
  }
}

const addStaff = async () => {
  if (!newStaffName.value.trim()) return
  creatingStaff.value = true
  try {
    const { error } = await supabase.from('staff').insert({
      full_name: newStaffName.value.trim(),
      role: newStaffRole.value.trim() || null
    })
    if (error) throw error
    newStaffName.value = ''
    newStaffRole.value = ''
    await loadStaff()
  } finally {
    creatingStaff.value = false
  }
}

const addRoom = async () => {
  if (!newRoomName.value.trim()) return
  creatingRoom.value = true
  try {
    const { error } = await supabase.from('rooms').insert({
      name: newRoomName.value.trim()
    })
    if (error) throw error
    newRoomName.value = ''
    await loadRooms()
  } finally {
    creatingRoom.value = false
  }
}

const toggleStaffActive = async (s: any) => {
  const { error } = await supabase.from('staff').update({ is_active: !s.is_active }).eq('id', s.id)
  if (!error) await loadStaff()
}

const toggleRoomActive = async (r: any) => {
  const { error } = await supabase.from('rooms').update({ is_active: !r.is_active }).eq('id', r.id)
  if (!error) await loadRooms()
}

const deleteStaff = async (id: number) => {
  const { error } = await supabase.from('staff').delete().eq('id', id)
  if (!error) await loadStaff()
}

const deleteRoom = async (id: number) => {
  const { error } = await supabase.from('rooms').delete().eq('id', id)
  if (!error) await loadRooms()
}

onMounted(() => {
  loadStaff()
  loadRooms()
})
</script>
