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
      <button @click="fetchAll" class="mt-2 text-sm text-red-600 hover:text-red-700 underline">{{ $t('common.tryAgain') }}</button>
    </div>

    <LoadingSpinner v-if="loading" />

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

      <!-- Low Session Packages Report -->
      <div class="rounded-xl border border-purple-200 bg-purple-50 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between border-b border-purple-100 px-4 py-3">
          <h3 class="text-base font-semibold text-purple-900">{{ $t('dashboard.lowSessionPackages') || 'Seanslari kam paketlar' }}</h3>
          <span class="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
            {{ lowSessionPackages.length }}
          </span>
        </div>
        <div class="px-4 py-4 min-h-[120px]">
          <div v-if="lowSessionPackages.length === 0" class="flex h-full items-center justify-center text-sm text-gray-500 italic">
            {{ $t('dashboard.noLowSessions') || 'Hammasi joyida' }}
          </div>
          <ul v-else class="space-y-3">
            <li v-for="pkg in lowSessionPackages.slice(0, 5)" :key="pkg.id" class="bg-white p-2.5 rounded-lg border border-purple-100 shadow-sm transition-transform hover:scale-[1.02]">
              <div class="flex items-center justify-between">
                <div class="min-w-0">
                  <p class="text-sm font-bold text-gray-900 truncate">{{ pkg.members?.fullname || $t('beautyServices.noName') }}</p>
                  <p class="text-[11px] text-gray-500 truncate">{{ pkg.service_name }}</p>
                </div>
                <div class="ml-2 flex flex-col items-end shrink-0">
                  <span class="text-sm font-black text-purple-700">{{ pkg.remaining_sessions }}</span>
                  <span class="text-[9px] uppercase tracking-wider text-purple-400 font-bold">{{ $t('beautyServices.remainingSessions') }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-if="lowSessionPackages.length > 5" class="border-t border-purple-100 px-4 py-2 text-center">
           <RouterLink to="/beauty" class="text-xs font-bold text-purple-600 hover:text-purple-800">{{ $t('dashboard.viewAll') }}</RouterLink>
        </div>
      </div>

      <!-- Low Stock Report -->
      <div v-if="lowStockProducts.length > 0" class="col-span-1 lg:col-span-2 rounded-xl border border-orange-200 bg-orange-50 shadow-sm">
        <div class="flex items-center justify-between border-b border-orange-100 px-4 py-3">
          <h3 class="text-base font-semibold text-orange-900">{{ $t('dashboard.lowStockProducts') }}</h3>
          <span class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
            {{ $t('dashboard.total') }}: {{ lowStockCount }}
          </span>
        </div>
        <div class="px-4 py-4">
           <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <li v-for="product in lowStockProducts.slice(0, 6)" :key="product.id" class="text-sm bg-white p-3 rounded-lg border border-orange-100">
              <div class="flex items-center justify-between">
                <span class="text-gray-900 font-medium">{{ product.name }}</span>
                <div class="flex items-center gap-2">
                   <span class="text-xs text-gray-500">{{ $t('products.currentStock') }}:</span>
                   <span class="text-orange-700 font-bold">
                    {{ product.inventoryStock?.[0]?.quantityOnHand || 0 }} / {{ product.reorderLevel || 5 }}
                  </span>
                </div>
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
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { statsService, membersService, checkinsService, productsService } from '../services/supabaseService'
import { supabase } from '../lib/supabase'
import * as mappings from '../lib/mappings'
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
const products = ref<any[]>([])  // Added for low stock tracking
const error = ref<string | null>(null)
const loading = ref(false)
const stats = ref<any>({})
const expiringMemberships = ref<any[]>([])
const lowSessionPackages = ref<any[]>([])

const fetchAll = async () => {
  loading.value = true
  error.value = null
  try {
    const todayNum = new Date()
    const nextWeek = new Date(todayNum.getTime() + 7 * 86400000)

    const [statsData, membersData, checkinsData, beautyRes, membershipRes, productsData, beautyPackagesRes] = await Promise.all([
      statsService.getDashboardStats(),
      membersService.getAll(),
      checkinsService.getAll(),
      supabase
        .from('beauty_services')
        .select('*, members(fullname, phone, qrcodeid)')
        .order('servicedate', { ascending: false })
        .limit(50),
      supabase
        .from('gym_memberships')
        .select('*, members(fullname, phone, qrcodeid)')
        .eq('active', 1),
      productsService.getAll(),  // Fetch products for low stock alerts
      supabase
        .from('service_packages')
        .select('*, members(fullname, phone, qrcodeid)')
        .eq('is_active', true)
        .lte('remaining_sessions', 2)
        .gt('remaining_sessions', 0)
        .order('remaining_sessions', { ascending: true })
    ])

    // Update stats
    stats.value = statsData
    
    // Update members
    members.value = membersData.slice(0, 100)
    
    // Update checkins
    checkins.value = checkinsData
    
    // Update beauty
    if (beautyRes.error) throw beautyRes.error
    beauty.value = (beautyRes.data || []).map(mappings.mapBeautyServiceToCamelCase)
    
    // Update expiring memberships
    if (membershipRes.error) throw membershipRes.error
    const now = new Date()
    expiringMemberships.value = (membershipRes.data || [])
      .map(mappings.mapMembershipToCamelCase)
      .filter((m: any) => {
        if (!m.endDate) return false
        const end = new Date(m.endDate)
        return end < nextWeek
      })
      .map((m: any) => {
        const end = new Date(m.endDate)
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return {
          ...m,
          status: end < now ? 'expired' : 'expiring_soon',
          daysRemaining: diff
        }
      })

    // Update products
    products.value = productsData

    // Update low session packages
    lowSessionPackages.value = (beautyPackagesRes.data || [])
  } catch (err: any) {
    console.error('Dashboard data loading error:', err)
    error.value = err.message || t('dashboard.errorLoading')
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
  { name: t('dashboard.activeMembers'), value: loading.value ? '...' : (stats.value.members?.active || 0) },
  { name: t('dashboard.todaySales'), value: loading.value ? '...' : formatCurrency(stats.value.pos?.todayRevenue || 0) },
  { name: t('dashboard.todayAppointments'), value: loading.value ? '...' : (stats.value.appointments?.today || 0) },
  { name: t('dashboard.lowStock'), value: loading.value ? '...' : (stats.value.pos?.lowStockCount || 0), subtext: t('dashboard.lowStockSubtext') }
])

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat().format(val);
};

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

// Low Stock Products - products with stock <= reorderLevel
const lowStockProducts = computed(() => {
  return products.value.filter(p => {
    const stock = p.inventoryStock?.[0]?.quantityOnHand || 0
    const reorderLevel = p.reorderLevel || 5
    return stock <= reorderLevel && stock > 0
  }).sort((a, b) => {
    const aStock = a.inventoryStock?.[0]?.quantityOnHand || 0
    const bStock = b.inventoryStock?.[0]?.quantityOnHand || 0
    return aStock - bStock
  })
})

const lowStockCount = computed(() => lowStockProducts.value.length)

// Out of Stock Products
const outOfStockProducts = computed(() => {
  return products.value.filter(p => {
    const stock = p.inventoryStock?.[0]?.quantityOnHand || 0
    return stock === 0
  })
})

// formatRelative funksiyasi - formatDate utility'dan foydalanadi
const formatRelative = (dateStr: string) => {
  return formatDate(dateStr)
}
</script>
