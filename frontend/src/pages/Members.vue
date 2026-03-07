<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('members.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('members.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button 
          class="glass-pill rounded-full h-9 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5" 
          @click="fetchMembers"
        >
          <svg class="h-3.5 w-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ $t('common.refresh') }}
        </button>
        <RouterLink 
          to="/members/new" 
          class="glass-pill rounded-full h-9 px-4 text-sm font-semibold flex items-center gap-1.5 bg-sky-500/20 dark:bg-sky-400/15 border-sky-400/40 dark:border-sky-400/20 text-sky-700 dark:text-sky-300 hover:bg-sky-500/30"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('members.newMember') }}
        </RouterLink>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

    <!-- Filter section (sticky) -->
    <div class="sticky top-0 z-20 glass rounded-full p-2 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl border-white/40 dark:border-white/10 no-print mb-6 backdrop-blur-md">
      <!-- Search -->
      <div class="w-full lg:max-w-md xl:max-w-lg relative flex items-center group">
        <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
        <input
          v-model="searchTerm"
          type="text"
          :placeholder="$t('members.searchPlaceholder')"
          class="w-full rounded-full h-11 pl-12 pr-4 text-sm bg-white/40 dark:bg-black/20 border-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 backdrop-blur-sm transition"
        />
      </div>

      <div class="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
        <!-- Status -->
        <div class="flex items-center gap-2 px-4 h-11 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 w-full md:w-auto relative group/select">
          <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{{ $t('members.statusLabel') }}</label>
          <div class="relative flex items-center">
            <select
              v-model="statusFilter"
              class="bg-transparent border-none focus:ring-0 text-xs font-bold h-full appearance-none dark:text-gray-200 pr-8 cursor-pointer uppercase tracking-tight"
            >
              <option value="all" class="dark:bg-gray-900">{{ $t('common.all') }}</option>
              <option value="active" class="dark:bg-gray-900">{{ $t('common.active') }}</option>
              <option value="inactive" class="dark:bg-gray-900">{{ $t('common.inactive') }}</option>
            </select>
            <ChevronDownIcon class="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform group-hover/select:text-sky-500" />
          </div>
        </div>

        <!-- Beauty -->
        <div class="flex items-center gap-2 px-4 h-11 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 w-full md:w-auto relative group/select2">
          <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{{ $t('members.beautyLabel') }}</label>
          <div class="relative flex items-center">
            <select
              v-model="beautyFilter"
              class="bg-transparent border-none focus:ring-0 text-xs font-bold h-full appearance-none dark:text-gray-200 pr-8 cursor-pointer uppercase tracking-tight"
            >
              <option value="all" class="dark:bg-gray-900">{{ $t('common.all') }}</option>
              <option value="with" class="dark:bg-gray-900">{{ $t('members.beautyWith') }}</option>
              <option value="without" class="dark:bg-gray-900">{{ $t('members.beautyWithout') }}</option>
            </select>
            <ChevronDownIcon class="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform group-hover/select2:text-sky-500" />
          </div>
        </div>

        <!-- Count -->
        <div class="flex items-center justify-end gap-2 px-1 h-11">
          <span class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{{ $t('members.found') }}:</span>
          <span class="glass-pill rounded-full w-11 h-11 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-200">{{ filteredMembers.length }}</span>
        </div>
      </div>
    </div>

    <!-- Table section (scrollable) -->
    <div class="glass rounded-2xl overflow-hidden shadow-xl border-white/40 dark:border-white/10 flex flex-col" style="max-height: calc(100vh - 280px);">
    <LoadingSpinner v-if="loading" />
      <template v-else>
        <!-- Thead pill -->
        <div class="mx-2 mt-2 mb-1 shrink-0 glass rounded-full shadow-lg border-white/20 dark:border-white/10 overflow-hidden backdrop-blur-xl">
          <table class="table-fixed border-separate border-spacing-0 w-full">
            <thead>
              <tr class="bg-transparent">
                <th class="py-2.5 pl-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[200px]">{{ $t('members.columns.name') }}</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[150px]">{{ $t('members.columns.phone') }}</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[130px]">{{ $t('members.columns.id') }}</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[180px]">{{ $t('members.columns.joined') }}</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[140px]">{{ $t('members.columns.status') }}</th>
                <th class="py-2.5 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[100px]">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
          </table>
        </div>

        <!-- Tbody scrollable -->
        <div class="overflow-x-auto overflow-y-auto flex-1">
        <table class="table-fixed border-separate border-spacing-0 w-full">
          <thead class="invisible h-0"><tr>
            <th class="py-2.5 pl-6 w-[200px]"></th>
            <th class="px-4 py-2.5 w-[150px]"></th>
            <th class="px-4 py-2.5 w-[130px]"></th>
            <th class="px-4 py-2.5 w-[180px]"></th>
            <th class="px-4 py-2.5 w-[140px]"></th>
            <th class="py-2.5 pr-6 w-[100px]"></th>
          </tr></thead>
          <tbody>
            <tr
              v-for="member in filteredMembers"
              :key="member.id"
              class="group cursor-pointer border-b border-white/20 dark:border-white/5 hover:bg-white/30 dark:hover:bg-white/5 transition-colors duration-150"
              @click="router.push(`/members/${member.id}`)"
            >
              <td class="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-900 dark:text-gray-100 pl-6">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-900 dark:bg-sky-900/20 text-[10px] font-black text-white/50 tracking-tighter uppercase shadow-inner">
                        {{ member.fullName.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ member.fullName }}</div>
                    </div>
                  </div>
                </td>
              <td class="whitespace-nowrap px-4 py-4 text-xs font-black text-gray-500 dark:text-gray-400 tabular-nums">{{ member.phone || '—' }}</td>
              <td class="whitespace-nowrap px-4 py-4 text-xs font-black text-gray-500 dark:text-gray-400 tabular-nums">#{{ member.qrCodeId }}</td>
              <td class="whitespace-nowrap px-4 py-4 text-xs font-black text-gray-500 dark:text-gray-400 tracking-tight">{{ formatDate(member.joinDate) }}</td>
              <td class="whitespace-nowrap px-4 py-4">
                <div class="flex flex-col gap-1">
                  <span 
                    :class="member.gymActive === 1 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'"
                    class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm inline-flex items-center gap-1"
                  >
                    <span :class="member.gymActive === 1 ? 'bg-emerald-500' : 'bg-rose-500'" class="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    {{ member.gymActive === 1 ? $t('common.active') : $t('common.inactive') }}
                  </span>
                  <span v-if="member.gymEnd && isExpired(member.gymEnd)"
                        class="inline-flex items-center rounded-full bg-red-500/15 border border-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400 w-fit">
                    ⚠️ {{ $t('members.expired') }}
                  </span>
                  <span v-else-if="member.gymEnd && isExpiringSoon(member.gymEnd)"
                        class="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 w-fit">
                    🔔 {{ getDaysRemaining(member.gymEnd) }} {{ $t('members.daysLeft') }}
                  </span>
                </div>
              </td>
              <td class="whitespace-nowrap px-3 py-3.5 text-sm text-right" @click.stop>
                <button
                  class="opacity-0 group-hover:opacity-100 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-all duration-150"
                  @click="onDeleteMember(member.id)"
                >
                  {{ $t('common.delete') }}
                </button>
              </td>
            </tr>
            <tr v-if="filteredMembers.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-500">{{ $t('members.noResults') }}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </template>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { 
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { membersService } from '../services/supabaseService'
import { formatDate } from '../lib/dateUtils'
import { useToast } from '../composables/useToast'
import { useConfirm } from '../composables/useConfirm'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const { confirm } = useConfirm()

type Member = {
  id: number
  fullName: string
  phone: string
  qrCodeId: string
  gymActive: number
  gymEnd?: string  // Added for expiration tracking
  joinDate?: string
  beautyHasRecord?: number
}

const members = ref<Member[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const searchTerm = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const beautyFilter = ref<'all' | 'with' | 'without'>('all')

const fetchMembers = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await membersService.getAll()
    members.value = data
  } catch (err) {
    console.error(err)
    error.value = t('members.errorLoading')
  } finally {
    loading.value = false
  }
}

onMounted(fetchMembers)

const filteredMembers = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()
  return members.value.filter((member) => {
    const matchesSearch =
      !search ||
      member.fullName.toLowerCase().includes(search) ||
      (member.phone && member.phone.includes(search)) ||
      member.qrCodeId.toLowerCase().includes(search)

    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && member.gymActive === 1) ||
      (statusFilter.value === 'inactive' && member.gymActive !== 1)

    const matchesBeauty =
      beautyFilter.value === 'all' ||
      (beautyFilter.value === 'with' && member.beautyHasRecord === 1) ||
      (beautyFilter.value === 'without' && (!member.beautyHasRecord || member.beautyHasRecord === 0))

    return matchesSearch && matchesStatus && matchesBeauty
  })
})

// formatDate funksiyasi utility'dan import qilingan

// Helper functions for expiration status
const isExpired = (dateStr: string | undefined) => {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

const getDaysRemaining = (dateStr: string | undefined) => {
  if (!dateStr) return null
  const end = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

const isExpiringSoon = (dateStr: string | undefined) => {
  const days = getDaysRemaining(dateStr)
  return days !== null && days >= 0 && days <= 7
}

const onDeleteMember = async (id: number) => {
  const ok = await confirm(t('members.deleteConfirm'))
  if (!ok) return
  try {
    await membersService.delete(id)
    toast.success(t('common.success'))
    members.value = members.value.filter((m) => m.id !== id)
  } catch (err: any) {
    console.error(err)
    toast.error(err.message || t('members.deleteError'))
  }
}
</script>

