<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-900">{{ $t('settings.title') }}</h2>
    
    <!-- Language Selector -->
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-100 px-6 py-4">
        <h3 class="text-lg font-semibold text-gray-900">{{ $t('settings.languageSelect') }}</h3>
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
          <h3 class="text-lg font-semibold text-gray-900">{{ $t('settings.staff') }}</h3>
        </div>
        <div class="px-6 py-6 space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row">
            <input
              v-model="newStaffName"
              type="text"
              :placeholder="$t('settings.staffName')"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              v-model="newStaffRole"
              type="text"
              :placeholder="$t('settings.roleOptional')"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <button
              @click="addStaff"
              :disabled="creatingStaff"
              class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {{ $t('settings.add') }}
            </button>
          </div>

          <div v-if="staffLoading" class="text-sm text-gray-500 italic">{{ $t('common.loading') }}</div>
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
                  {{ s.is_active ? $t('common.active') : $t('common.inactive') }}
                </button>
                <button
                  @click="deleteStaff(s.id)"
                  class="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
                >
                  {{ $t('common.delete') }}
                </button>
              </div>
            </div>
            <div v-if="staff.length === 0" class="py-6 text-center text-sm text-gray-400">{{ $t('settings.noStaff') }}</div>
          </div>
        </div>
      </div>

      <!-- Rooms -->
      <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ $t('settings.rooms') }}</h3>
        </div>
        <div class="px-6 py-6 space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row">
            <input
              v-model="newRoomName"
              type="text"
              :placeholder="$t('settings.roomName')"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <button
              @click="addRoom"
              :disabled="creatingRoom"
              class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {{ $t('settings.add') }}
            </button>
          </div>

          <div v-if="roomsLoading" class="text-sm text-gray-500 italic">{{ $t('common.loading') }}</div>
          <div v-else class="divide-y divide-gray-100">
            <div v-for="r in rooms" :key="r.id" class="flex items-center justify-between py-3">
              <div class="text-sm font-semibold text-gray-900">{{ r.name }}</div>
              <div class="flex items-center gap-2">
                <button
                  @click="toggleRoomActive(r)"
                  class="rounded-md border px-2 py-1 text-xs font-medium"
                  :class="r.is_active ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-600'"
                >
                  {{ r.is_active ? $t('common.active') : $t('common.inactive') }}
                </button>
                <button
                  @click="deleteRoom(r.id)"
                  class="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
                >
                  {{ $t('common.delete') }}
                </button>
              </div>
            </div>
            <div v-if="rooms.length === 0" class="py-6 text-center text-sm text-gray-400">{{ $t('settings.noRooms') }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Users & Roles Management (Admin Only) -->
    <div v-if="userRole === 'admin'" class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div class="border-b border-gray-100 px-6 py-4 flex items-center gap-2">
        <UserGroupIcon class="h-5 w-5 text-sky-600" />
        <h3 class="text-lg font-semibold text-gray-900">{{ $t('settings.usersAndRoles') }}</h3>
      </div>
      <div class="px-6 py-6 overflow-x-auto">
        <!-- New User Form -->
        <div class="mb-8 rounded-lg bg-gray-50 dark:bg-slate-800/50 p-4 border border-gray-100 dark:border-slate-700">
           <h4 class="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest">{{ $t('settings.addNewUser') }}</h4>
           <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input 
                v-model="newUser.username" 
                type="text" 
                :placeholder="$t('settings.username')" 
                class="rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
              <input 
                v-model="newUser.password" 
                type="text" 
                :placeholder="$t('settings.password')" 
                class="rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
              <select 
                v-model="newUser.role" 
                class="rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="reception">Reception</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button 
                @click="createUser" 
                :disabled="creatingUser || !newUser.username || !newUser.password"
                class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-lg shadow-sky-600/20"
              >
                <span v-if="!creatingUser">{{ $t('settings.add') }}</span>
                <span v-else>{{ $t('settings.adding') }}</span>
              </button>
           </div>
        </div>

        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              <th class="py-3 px-2">{{ $t('settings.user') }}</th>
              <th class="py-3 px-2">{{ $t('settings.role') }}</th>
              <th class="py-3 px-2 text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-gray-900 dark:text-gray-100">
            <tr v-for="u in systemUsers" :key="u.id" class="hover:bg-gray-50 transition-colors">
              <td class="py-3 px-2 font-bold">{{ u.username }}</td>
              <td class="py-3 px-2">
                <select 
                  v-model="u.role" 
                  class="rounded border border-gray-200 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-semibold focus:border-sky-500 focus:outline-none"
                  @change="updateUserRole(u.id, u.role)"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Menejer</option>
                  <option value="reception">Reception</option>
                </select>
              </td>
              <td class="py-3 px-2 text-right">
                <div class="flex items-center justify-end gap-2">
                  <span v-if="u.id === currentUser?.id" class="text-[10px] font-black text-sky-600 bg-sky-50 px-2 py-1 rounded-full uppercase">{{ $t('settings.you') }}</span>
                  <button 
                    v-else
                    @click="deleteUser(u)"
                    class="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    :title="$t('settings.deleteUserTitle')"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="usersLoading" class="mt-4 text-center text-sm text-gray-400 italic">{{ $t('common.loading') }}</div>
      </div>
    </div>


  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { GlobeAltIcon, UserGroupIcon, ClipboardDocumentListIcon, UserPlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
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
