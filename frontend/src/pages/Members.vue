<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('members.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('members.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50" @click="fetchMembers">{{ $t('common.refresh') }}</button>
        <RouterLink to="/members/new" class="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500">{{ $t('members.newMember') }}</RouterLink>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

    <!-- Filter section (sticky) -->
    <div class="sticky top-0 z-20 grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4">
      <div class="flex items-center gap-2">
        <input v-model="searchTerm" type="text" :placeholder="$t('members.searchPlaceholder')" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400" />
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500">{{ $t('members.statusLabel') }}</label>
        <select v-model="statusFilter" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400">
          <option value="all">{{ $t('common.all') }}</option>
          <option value="active">{{ $t('common.active') }}</option>
          <option value="inactive">{{ $t('common.inactive') }}</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500">{{ $t('members.beautyLabel') }}</label>
        <select v-model="beautyFilter" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400">
          <option value="all">{{ $t('common.all') }}</option>
          <option value="with">{{ $t('members.beautyWith') }}</option>
          <option value="without">{{ $t('members.beautyWithout') }}</option>
        </select>
      </div>
      <div class="flex items-center justify-end text-sm text-gray-500">
        {{ $t('members.found') }}: <span class="ml-1 font-semibold text-gray-700">{{ filteredMembers.length }}</span>
      </div>
    </div>

    <!-- Table section (scrollable) -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" style="max-height: calc(100vh - 280px);">
    <LoadingSpinner v-if="loading" />
      <div v-else class="overflow-x-auto" style="max-height: calc(100vh - 280px);">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="sticky top-0 z-10 bg-gray-50">
            <tr>
              <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('members.columns.name') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('members.columns.phone') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('members.columns.id') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('members.columns.joined') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('members.columns.status') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('members.columns.beauty') }}</th>
              <th class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-gray-50 cursor-pointer" @click="router.push(`/members/${member.id}`)">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{{ member.fullName }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ member.phone || '—' }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ member.qrCodeId }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDate(member.joinDate) }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                <span :class="member.gymActive === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {{ member.gymActive === 1 ? $t('common.active') : $t('common.inactive') }}
                </span>
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                <span :class="member.beautyHasRecord ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {{ member.beautyHasRecord ? $t('common.has') : $t('common.notHas') }}
                </span>
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-right" @click.stop>
                <button
                  class="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                  @click="onDeleteMember(member.id)"
                >
                  {{ $t('common.delete') }}
                </button>
              </td>
            </tr>
            <tr v-if="filteredMembers.length === 0">
              <td colspan="7" class="px-6 py-6 text-center text-sm text-gray-500">{{ $t('members.noResults') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { membersService } from '../services/supabaseService'
import { formatDate } from '../lib/dateUtils'

const { t } = useI18n()

const router = useRouter()

type Member = {
  id: number
  fullName: string
  phone: string
  qrCodeId: string
  gymActive: number
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

const onDeleteMember = async (id: number) => {
  const ok = window.confirm(t('members.deleteConfirm'))
  if (!ok) return
  try {
    await membersService.delete(id)
    members.value = members.value.filter((m) => m.id !== id)
  } catch (err: any) {
    console.error(err)
    window.alert(err.message || t('members.deleteError'))
  }
}
</script>

