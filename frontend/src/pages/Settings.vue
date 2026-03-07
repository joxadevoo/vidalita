<template>
  <div class="space-y-8">
    <div class="no-print">
      <h2 class="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">{{ $t('settings.title') }}</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 font-bold italic mt-1">{{ $t('settings.subtitle') }}</p>
    </div>
    


    <!-- Staff & Rooms -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 no-print">
      <!-- Staff -->
      <div class="glass rounded-2xl overflow-hidden shadow-2xl border-white/40 dark:border-white/10 flex flex-col">
        <div class="border-b border-white/20 dark:border-white/5 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UserGroupIcon class="h-5 w-5 text-emerald-500" />
            <h3 class="text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest">{{ $t('settings.staff') }}</h3>
          </div>
          <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/20">{{ staff.length }}</span>
        </div>
        <div class="px-6 py-6 space-y-6">
          <div class="flex flex-col gap-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  v-model="newStaffName"
                  type="text"
                  :placeholder="$t('settings.staffName')"
                  class="w-full rounded-full border border-gray-300 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-sm font-black text-gray-900 dark:text-gray-100"
                />
                <input
                  v-model="newStaffRole"
                  type="text"
                  :placeholder="$t('settings.roleOptional')"
                  class="w-full rounded-full border border-gray-300 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-sm font-bold text-gray-900 dark:text-gray-100"
                />
            </div>
            <button
              @click="addStaff"
              :disabled="creatingStaff"
              class="rounded-full bg-emerald-600 px-6 py-3 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-60 transition-all uppercase tracking-widest shadow-lg shadow-emerald-500/20"
            >
              {{ $t('settings.add') }}
            </button>
          </div>

          <div v-if="staffLoading" class="p-4"><LoadingSpinner /></div>
          <div v-else class="divide-y divide-white/10 dark:divide-white/5">
            <div v-for="s in staff" :key="s.id" class="group flex items-center justify-between py-4 hover:bg-white/20 dark:hover:bg-white/5 px-2 rounded-xl transition-all">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <span class="text-xs font-black text-emerald-600">{{ s.full_name.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <div class="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ s.full_name }}</div>
                  <div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 italic uppercase">{{ s.role || 'NA' }}</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="toggleStaffActive(s)"
                  class="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all"
                  :class="s.is_active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-gray-200 bg-gray-50 text-gray-400 dark:border-white/5 dark:bg-white/5 dark:text-gray-500'"
                >
                  {{ s.is_active ? $t('common.active') : $t('common.inactive') }}
                </button>
                <button
                  @click="deleteStaff(s.id)"
                  class="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
            <div v-if="staff.length === 0" class="py-10 text-center text-[10px] font-black uppercase text-gray-400 italic letter-spacing-widest opacity-40">{{ $t('settings.noStaff') }}</div>
          </div>
        </div>
      </div>

      <!-- Rooms -->
      <div class="glass rounded-2xl overflow-hidden shadow-2xl border-white/40 dark:border-white/10 flex flex-col">
        <div class="border-b border-white/20 dark:border-white/5 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ClipboardDocumentListIcon class="h-5 w-5 text-sky-500" />
            <h3 class="text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest">{{ $t('settings.rooms') }}</h3>
          </div>
          <span class="px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase border border-sky-500/20">{{ rooms.length }}</span>
        </div>
        <div class="px-6 py-6 space-y-6">
          <div class="flex gap-3">
            <input
              v-model="newRoomName"
              type="text"
              :placeholder="$t('settings.roomName')"
              class="w-full rounded-full border border-gray-300 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 flex-1 text-sm font-black text-gray-900 dark:text-gray-100"
            />
            <button
              @click="addRoom"
              :disabled="creatingRoom"
              class="rounded-full bg-sky-600 px-6 py-2 text-xs font-black text-white hover:bg-sky-500 disabled:opacity-60 transition-all uppercase tracking-widest shadow-lg shadow-sky-600/20"
            >
              {{ $t('settings.add') }}
            </button>
          </div>

          <div v-if="roomsLoading" class="p-4"><LoadingSpinner /></div>
          <div v-else class="divide-y divide-white/10 dark:divide-white/5">
            <div v-for="r in rooms" :key="r.id" class="group flex items-center justify-between py-4 hover:bg-white/20 dark:hover:bg-white/5 px-2 rounded-xl transition-all">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                    <span class="text-xs font-black text-sky-600">{{ r.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ r.name }}</div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="toggleRoomActive(r)"
                  class="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all"
                  :class="r.is_active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-gray-200 bg-gray-50 text-gray-400 dark:border-white/5 dark:bg-white/5 dark:text-gray-500'"
                >
                  {{ r.is_active ? $t('common.active') : $t('common.inactive') }}
                </button>
                <button
                  @click="deleteRoom(r.id)"
                  class="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
            <div v-if="rooms.length === 0" class="py-10 text-center text-[10px] font-black uppercase text-gray-400 italic letter-spacing-widest opacity-40">{{ $t('settings.noRooms') }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Users & Roles Management (Admin Only) -->
    <div v-if="userRole === 'admin'" class="glass rounded-2xl overflow-hidden shadow-2xl border-white/40 dark:border-white/10 no-print flex flex-col">
      <div class="border-b border-white/20 dark:border-white/5 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ShieldCheckIcon class="h-5 w-5 text-indigo-500" />
          <h3 class="text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest">{{ $t('settings.usersAndRoles') }}</h3>
        </div>
      </div>
      <div class="px-6 py-8 space-y-8">
        <!-- New User Form -->
        <div class="relative glass rounded-3xl p-6 border-white/40 dark:border-white/5 shadow-inner">
           <div class="flex items-center gap-2 mb-6">
               <FingerPrintIcon class="h-4 w-4 text-gray-400" />
               <h4 class="text-[10px] font-black uppercase text-gray-400 tracking-widest">{{ $t('settings.addNewUser') }}</h4>
           </div>
           
           <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div class="space-y-1.5">
                  <label class="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('settings.username') }}</label>
                  <input v-model="newUser.username" type="text" class="w-full rounded-full border border-gray-300 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-sm font-black text-gray-900 dark:text-gray-100" />
              </div>
              <div class="space-y-1.5">
                  <label class="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('settings.password') }}</label>
                  <input v-model="newUser.password" type="text" class="w-full rounded-full border border-gray-300 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-sm font-bold text-gray-900 dark:text-gray-100" />
              </div>
              <div class="space-y-1.5">
                  <label class="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('settings.role') }}</label>
                  <select v-model="newUser.role" class="w-full rounded-full border border-gray-300 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 cursor-pointer">
                    <option value="reception" class="dark:bg-gray-900">Reception</option>
                    <option value="manager" class="dark:bg-gray-900">Manager</option>
                    <option value="admin" class="dark:bg-gray-900">Admin</option>
                  </select>
              </div>
              <button 
                @click="createUser" 
                :disabled="creatingUser || !newUser.username || !newUser.password"
                class="rounded-full bg-sky-600 h-11 px-6 text-xs font-black text-white hover:bg-sky-500 disabled:opacity-50 transition-all shadow-lg shadow-sky-600/20 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <UserPlusIcon class="h-4 w-4" />
                <span>{{ creatingUser ? $t('settings.adding') : $t('settings.add') }}</span>
              </button>
           </div>
        </div>

        <div class="space-y-4">
          <!-- User Table with Pill Header -->
          <div class="mx-2 shrink-0">
            <table class="border-separate border-spacing-0 w-full">
              <thead>
                <tr class="glass rounded-full block-table-header">
                  <th class="py-2.5 pl-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 rounded-l-full bg-transparent">{{ $t('settings.user') }}</th>
                  <th class="py-2.5 px-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-transparent">{{ $t('settings.role') }}</th>
                  <th class="py-2.5 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 rounded-r-full bg-transparent">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
            </table>
          </div>

          <div class="overflow-hidden rounded-2xl border border-white/20 dark:border-white/5">
            <table class="w-full text-left text-sm border-separate border-spacing-0">
              <thead class="invisible h-0">
                <tr>
                  <th class="w-[40%]"></th>
                  <th class="w-[40%]"></th>
                  <th class="w-[20%]"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10 dark:divide-white/5">
                <tr v-for="u in systemUsers" :key="u.id" class="group hover:bg-white/40 dark:hover:bg-white/5 transition-all backdrop-blur-sm">
                  <td class="py-4 pl-6 font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                      <span class="text-[10px]">{{ u.username.charAt(0).toUpperCase() }}</span>
                    </div>
                    {{ u.username }}
                  </td>
                  <td class="py-4 px-4">
                    <select 
                      v-model="u.role" 
                      class="rounded-full border border-gray-300 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-9 text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 w-32 cursor-pointer"
                      @change="updateUserRole(u.id, u.role)"
                    >
                      <option value="admin" class="dark:bg-gray-900">Admin</option>
                      <option value="manager" class="dark:bg-gray-900">Menejer</option>
                      <option value="reception" class="dark:bg-gray-900">Reception</option>
                    </select>
                  </td>
                  <td class="py-4 pr-6 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <span v-if="u.id === currentUser?.id" class="text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest shadow-sm">{{ $t('settings.you') }}</span>
                      <button 
                        v-else
                        @click="deleteUser(u)"
                        class="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        :title="$t('settings.deleteUserTitle')"
                      >
                        <TrashIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="usersLoading" class="p-8"><LoadingSpinner /></div>
      </div>
    </div>


  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  GlobeAltIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon, 
  UserPlusIcon, 
  TrashIcon,
  ShieldCheckIcon,
  FingerPrintIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { supabase } from '../lib/supabase'
import { auditLogsService, authService } from '../services/supabaseService'
import { useToast } from '../composables/useToast'
import { useConfirm } from '../composables/useConfirm'

const { locale, t } = useI18n()
const toast = useToast()
const { confirm } = useConfirm()
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

// RBAC
const currentUser = computed(() => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
})
const userRole = computed(() => currentUser.value?.role || 'reception')

const systemUsers = ref<any[]>([])
const usersLoading = ref(false)
const creatingUser = ref(false)
const newUser = reactive({
  username: '',
  password: '',
  role: 'reception'
})

const loadSystemUsers = async () => {
  if (userRole.value !== 'admin') return
  usersLoading.value = true
  try {
    const { data, error } = await supabase.from('users').select('id, username, role').order('username')
    if (error) throw error
    systemUsers.value = data || []
  } finally {
    usersLoading.value = false
  }
}

const updateUserRole = async (userId: string, newRole: string) => {
  const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId)
  if (!error) {
    await auditLogsService.log('USER_ROLE_UPDATE', userId, { newRole })
  }
}

const createUser = async () => {
  if (!newUser.username || !newUser.password) return
  creatingUser.value = true
  try {
    await authService.createUser({
      username: newUser.username,
      password: newUser.password,
      role: newUser.role
    })
    newUser.username = ''
    newUser.password = ''
    newUser.role = 'reception'
    await loadSystemUsers()
    toast.success(t('common.success'))
  } catch (err: any) {
    toast.error(t('settings.addError') + ': ' + err.message)
  } finally {
    creatingUser.value = false
  }
}

const deleteUser = async (u: any) => {
  if (u.id === currentUser.value?.id) return
  const confirmed = await confirm(t('settings.deleteConfirm', { name: u.username }) || `Haqiqatan ham "${u.username}" foydalanuvchisini o'chirmoqchimisiz?`)
  if (!confirmed) return
  
  try {
    await authService.deleteUser(u.id)
    toast.success(t('common.success'))
    await loadSystemUsers()
  } catch (err: any) {
    toast.error(t('common.error') + ': ' + err.message)
  }
}

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
  loadSystemUsers()
})
</script>
