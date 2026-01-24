<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('dashboard.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('dashboard.subtitle') }}</p>
      </div>
      <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50" @click="fetchAll">{{ $t('common.refresh') }}</button>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <div class="flex items-center gap-2">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
      <button @click="fetchAll" class="mt-2 text-sm text-red-600 hover:text-red-700 underline">Qayta urinib ko'ring</button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-3">
        <svg class="h-8 w-8 animate-spin text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2a9 9 0 01-12.552-12.552L20.582 9.582" />
        </svg>
        <p class="text-sm text-gray-500">{{ $t('common.loading') || 'Yuklanmoqda...' }}</p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="card in statCards" :key="card.name" class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div class="text-sm text-gray-500">{{ card.name }}</div>
        <div class="mt-2 text-2xl font-semibold text-gray-900">{{ card.value }}</div>
        <div v-if="card.subtext" class="mt-2 text-xs text-gray-400">{{ card.subtext }}</div>
      </div>
    </div>

    <!-- Reports Section -->
    <div v-if="!loading" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Daily Check-ins Report -->
      <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 class="text-base font-semibold text-gray-900">{{ $t('dashboard.dailyCheckinsReport') }}</h3>
          <RouterLink to="/checkins" class="text-sm font-medium text-sky-600 hover:text-sky-500">{{ $t('dashboard.viewAll') }}</RouterLink>
        </div>
        <div class="px-4 py-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ $t('dashboard.today') }}</span>
              <span class="text-lg font-semibold text-gray-900">{{ stats.checkins?.today || 0 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ $t('dashboard.thisWeek') }}</span>
              <span class="text-lg font-semibold text-gray-900">{{ stats.checkins?.thisWeek || 0 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ $t('dashboard.thisMonth') }}</span>
              <span class="text-lg font-semibold text-gray-900">{{ stats.checkins?.thisMonth || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Memberships Report -->
      <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 class="text-base font-semibold text-gray-900">{{ $t('dashboard.activeMembershipsReport') }}</h3>
          <RouterLink to="/members" class="text-sm font-medium text-sky-600 hover:text-sky-500">{{ $t('dashboard.viewAll') }}</RouterLink>
        </div>
        <div class="px-4 py-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ $t('dashboard.totalActive') }}</span>
              <span class="text-lg font-semibold text-green-600">{{ stats.members?.active || 0 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ $t('dashboard.expiringSoon') }}</span>
              <span class="text-lg font-semibold text-yellow-600">{{ stats.members?.expiringSoon || 0 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ $t('dashboard.expired') }}</span>
              <span class="text-lg font-semibold text-red-600">{{ stats.members?.expired || 0 }}</span>
            </div>
          </div>
        </div>
        <div v-if="expiringMemberships.length > 0" class="border-t border-gray-100 px-4 py-3">
          <p class="text-xs font-medium text-gray-500 mb-2">{{ $t('dashboard.expiringSoonMembers') }}</p>
          <ul class="space-y-2">
            <li v-for="member in expiringMemberships.slice(0, 3)" :key="member.id" class="text-xs">
              <div class="flex items-center justify-between">
                <span class="text-gray-700">{{ member.fullName }}</span>
                <span class="text-yellow-600 font-medium">{{ member.daysRemaining }} {{ $t('dashboard.days') }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div v-if="!loading" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
        <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 class="text-base font-semibold text-gray-900">{{ $t('dashboard.recentCheckins') }}</h3>
          <RouterLink to="/checkins" class="text-sm font-medium text-sky-600 hover:text-sky-500">{{ $t('dashboard.viewAll') }}</RouterLink>
        </div>
        <div v-if="recentCheckins.length === 0" class="px-4 py-6 text-sm text-gray-500">{{ $t('dashboard.noData') }}</div>
        <ul v-else class="divide-y divide-gray-100 overflow-y-auto max-h-[400px]">
          <li v-for="item in recentCheckins" :key="item.id" class="px-4 py-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ item.fullName || $t('checkins.noName') }}</p>
                <p class="text-xs text-gray-400">ID: {{ item.qrCodeId }}</p>
              </div>
              <div class="text-xs text-gray-500">{{ formatRelative(item.date) }}</div>
            </div>
          </li>
        </ul>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
        <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 class="text-base font-semibold text-gray-900">{{ $t('dashboard.recentBeauty') }}</h3>
          <RouterLink to="/beauty" class="text-sm font-medium text-sky-600 hover:text-sky-500">{{ $t('dashboard.view') }}</RouterLink>
        </div>
        <div v-if="recentBeauty.length === 0" class="px-4 py-6 text-sm text-gray-500">{{ $t('common.notFound') }}</div>
        <ul v-else class="divide-y divide-gray-100 overflow-y-auto max-h-[400px]">
          <li v-for="item in recentBeauty" :key="item.id" class="px-4 py-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ item.fullName || $t('checkins.noName') }}</p>
                <p class="text-xs text-gray-400">{{ item.serviceName }}</p>
              </div>
              <div class="text-xs text-gray-500">{{ formatRelative(item.serviceDate) }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'
import { formatDate } from '../lib/dateUtils'

const { t } = useI18n()

type Member = {
  id: number
  fullName: string
  phone: string
  qrCodeId: string
  gymActive: number
  joinDate?: string
}

type Checkin = {
  id: number
  memberId: number
  qrCodeId: string
  date: string
  fullName?: string
}

type Beauty = {
  id: number
  memberId: number
  serviceName: string
  serviceDate: string
  fullName?: string
}

const members = ref<Member[]>([])
const checkins = ref<Checkin[]>([])
const beauty = ref<Beauty[]>([])
const error = ref<string | null>(null)
const loading = ref(false)
const stats = ref<any>({})
const expiringMemberships = ref<any[]>([])

const fetchAll = async () => {
  loading.value = true
  error.value = null
  try {
    const [membersRes, checkinsRes, beautyRes, statsRes, membershipsRes] = await Promise.all([
      api.get<Member[]>('/members'),
      api.get<Checkin[]>('/checkins'),
      api.get<Beauty[]>('/beauty'),
      api.get('/stats'),
      api.get('/stats/active-memberships')
    ])
    console.log('API Responses:', {
      members: membersRes.data,
      checkins: checkinsRes.data,
      beauty: beautyRes.data,
      stats: statsRes.data,
      memberships: membershipsRes.data
    })
    
    members.value = Array.isArray(membersRes.data) ? membersRes.data : []
    checkins.value = Array.isArray(checkinsRes.data) ? checkinsRes.data : []
    beauty.value = Array.isArray(beautyRes.data) ? beautyRes.data : []
    stats.value = statsRes.data || {}
    expiringMemberships.value = Array.isArray(membershipsRes.data) 
      ? membershipsRes.data.filter((m: any) => m.status === 'expiring_soon' || m.status === 'expired')
      : []
    
    console.log('Data loaded:', {
      membersCount: members.value.length,
      checkinsCount: checkins.value.length,
      beautyCount: beauty.value.length,
      stats: stats.value
    })
  } catch (err: any) {
    console.error('Dashboard data loading error:', err)
    if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
      error.value = 'Backend serverga ulanib bo\'lmadi. Iltimos, server ishga tushirilganligini tekshiring.'
    } else if (err.response?.status === 404) {
      error.value = 'API endpoint topilmadi. Iltimos, API URL\'ni tekshiring.'
    } else {
      error.value = err.response?.data?.error || err.message || t('dashboard.errorLoading')
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchAll)

const today = () => new Date().toISOString().slice(0, 10)

const checkinsToday = computed(() =>
  checkins.value.filter((item) => item.date && item.date.slice(0, 10) === today())
)


const statCards = computed(() => [
  { name: t('dashboard.totalMembers'), value: loading.value ? '...' : members.value.length },
  { name: t('dashboard.todayCheckins'), value: loading.value ? '...' : checkinsToday.value.length },
  { name: t('dashboard.beautyServices'), value: loading.value ? '...' : beauty.value.length },
  { name: t('dashboard.activeMembers'), value: loading.value ? '...' : (stats.value.members?.active || 0), subtext: t('dashboard.lastUpdated') + ': ' + new Date().toLocaleTimeString('uz-UZ') }
])

const recentCheckins = computed(() =>
  [...checkins.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
)

const recentBeauty = computed(() =>
  [...beauty.value]
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
    .slice(0, 5)
)

// formatRelative funksiyasi - formatDate utility'dan foydalanadi
const formatRelative = (dateStr: string) => {
  return formatDate(dateStr)
}
</script>

