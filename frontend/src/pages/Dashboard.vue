<template>
  <div class="space-y-6">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-black dark:text-white">{{ $t('dashboard.title') }}</h1>
        <p class="mt-1 text-sm font-black text-gray-900 dark:text-gray-400">{{ $t('dashboard.subtitle') }}</p>
      </div>
      <button @click="fetchAll" class="glass group relative flex items-center gap-2 rounded-xl bg-sky-600/10 px-5 py-2.5 text-sm font-black text-sky-900 dark:text-sky-400 transition-all hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 active:scale-95 border border-sky-600/20">
        <svg class="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ $t('common.refresh') }}
      </button>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <div class="flex items-center gap-2">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
      <button @click="fetchAll" class="glass group relative flex items-center gap-2 rounded-xl bg-sky-600/10 px-5 py-2.5 text-sm font-black text-sky-900 dark:text-sky-400 transition-all hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 active:scale-95 border border-sky-600/20">
        <svg class="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ $t('common.refresh') }}
      </button>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="(card, index) in statCards" :key="card.name" 
           class="glass animate-fade-in-scale group flex flex-col justify-between p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-sky-500/10"
           :style="{ animationDelay: `${index * 50}ms` }">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase tracking-wider text-black dark:text-gray-300 group-hover:text-sky-700 transition-colors">{{ card.name }}</span>
            <div class="h-8 w-8 rounded-lg bg-sky-600/10 flex items-center justify-center text-sky-900 dark:text-sky-400">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div class="mt-4 text-3xl font-black text-black dark:text-white">{{ card.value }}</div>
        </div>
        <div v-if="card.subtext" class="mt-4 flex items-center gap-1 text-[11px] font-black text-gray-900 dark:text-gray-400">
          <span class="inline-block h-1 w-1 rounded-full bg-sky-800"></span>
          {{ card.subtext }}
        </div>
      </div>
    </div>

    <!-- Analytics Charts -->
    <DashboardCharts v-if="!loading" ref="chartsRef" />

    <!-- Reports Section -->
    <div v-if="!loading" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Daily Check-ins Report -->
      <div class="glass animate-fade-in-scale overflow-hidden transition-all duration-300 hover:shadow-lg" style="animation-delay: 200ms">
        <div class="flex items-center justify-between border-b border-gray-300/50 px-6 py-4">
          <h3 class="text-lg font-black text-black dark:text-white">{{ $t('dashboard.dailyCheckinsReport') }}</h3>
          <RouterLink to="/checkins" class="text-sm font-black text-sky-900 dark:text-sky-400 hover:text-sky-700 transition-colors uppercase tracking-wider underline">{{ $t('dashboard.viewAll') }}</RouterLink>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-3 gap-4">
            <div class="rounded-xl bg-gray-500/10 p-4 text-center">
              <span class="block text-[10px] font-black uppercase tracking-wider text-gray-800 dark:text-gray-400 mb-1">{{ $t('dashboard.today') }}</span>
              <span class="text-xl font-black text-black dark:text-white">{{ stats.checkins?.today || 0 }}</span>
            </div>
            <div class="rounded-xl bg-gray-500/10 p-4 text-center">
              <span class="block text-[10px] font-black uppercase tracking-wider text-gray-800 dark:text-gray-400 mb-1">{{ $t('dashboard.thisWeek') }}</span>
              <span class="text-xl font-black text-black dark:text-white">{{ stats.checkins?.thisWeek || 0 }}</span>
            </div>
            <div class="rounded-xl bg-gray-500/10 p-4 text-center">
              <span class="block text-[10px] font-black uppercase tracking-wider text-gray-800 dark:text-gray-400 mb-1">{{ $t('dashboard.thisMonth') }}</span>
              <span class="text-xl font-black text-black dark:text-white">{{ stats.checkins?.thisMonth || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Memberships Report -->
      <div class="glass animate-fade-in-scale overflow-hidden transition-all duration-300 hover:shadow-lg" style="animation-delay: 300ms">
        <div class="flex items-center justify-between border-b border-gray-300/50 px-6 py-4">
          <h3 class="text-lg font-black text-black dark:text-white">{{ $t('dashboard.activeMembershipsReport') }}</h3>
          <RouterLink to="/members" class="text-sm font-black text-sky-900 dark:text-sky-600 transition-colors uppercase tracking-wider underline">{{ $t('dashboard.viewAll') }}</RouterLink>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between rounded-xl bg-green-500/10 px-4 py-2">
              <span class="text-sm font-black text-gray-800 dark:text-gray-400">{{ $t('dashboard.totalActive') }}</span>
              <span class="text-lg font-black text-green-700">{{ stats.members?.active || 0 }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-yellow-500/10 px-4 py-2">
              <span class="text-sm font-black text-gray-800 dark:text-gray-400">{{ $t('dashboard.expiringSoon') }}</span>
              <span class="text-lg font-black text-yellow-700">{{ stats.members?.expiringSoon || 0 }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-red-500/10 px-4 py-2">
              <span class="text-sm font-black text-gray-800 dark:text-gray-400">{{ $t('dashboard.expired') }}</span>
              <span class="text-lg font-black text-red-700">{{ stats.members?.expired || 0 }}</span>
            </div>
          </div>
        </div>
        <div v-if="expiringMemberships.length > 0" class="border-t border-gray-100/10 px-6 py-4 bg-gray-500/5">
          <p class="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-3">{{ $t('dashboard.expiringSoonMembers') }}</p>
          <ul class="space-y-3">
            <li v-for="member in expiringMemberships.slice(0, 3)" :key="member.id">
              <div class="flex items-center justify-between text-xs font-bold">
                <span class="text-gray-700 dark:text-gray-300">{{ member.fullName }}</span>
                <span class="text-yellow-600 px-2 py-0.5 rounded-full bg-yellow-500/10">{{ member.daysRemaining }} {{ $t('dashboard.days') }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Low Session Packages Report -->
      <div class="glass animate-fade-in-scale overflow-hidden transition-all duration-300 hover:shadow-lg border-purple-500/20" style="animation-delay: 400ms">
        <div class="flex items-center justify-between border-b border-purple-500/10 px-6 py-4">
          <h3 class="text-lg font-bold text-purple-900 dark:text-purple-400">{{ $t('dashboard.lowSessionPackages') }}</h3>
          <span class="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-black text-purple-600">
            {{ lowSessionPackages.length }}
          </span>
        </div>
        <div class="p-6 h-[220px] overflow-y-auto">
          <div v-if="lowSessionPackages.length === 0" class="flex h-full items-center justify-center text-sm text-gray-500 italic">
            {{ $t('dashboard.noLowSessions') }}
          </div>
          <ul v-else class="space-y-3">
            <li v-for="pkg in lowSessionPackages.slice(0, 5)" :key="pkg.id" 
                class="bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-purple-500/10 transition-transform hover:scale-[1.02]">
              <div class="flex items-center justify-between">
                <div class="min-w-0">
                  <p class="text-sm font-black text-gray-950 dark:text-white truncate">{{ pkg.members?.fullname || $t('beautyServices.noName') }}</p>
                  <p class="text-[10px] uppercase font-bold text-gray-700 dark:text-gray-400 truncate">{{ pkg.service_name }}</p>
                </div>
                <div class="ml-4 flex flex-col items-end shrink-0">
                  <span class="text-lg font-black text-purple-800 dark:text-purple-400">{{ pkg.remaining_sessions }}</span>
                  <span class="text-[9px] uppercase tracking-wider text-purple-600 font-black">{{ $t('beautyServices.remainingSessions') }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-if="lowSessionPackages.length > 5" class="border-t border-purple-500/10 px-6 py-3 text-center bg-purple-500/5">
           <RouterLink to="/beauty" class="text-xs font-black text-purple-600 hover:text-purple-800 uppercase tracking-widest">{{ $t('dashboard.viewAll') }}</RouterLink>
        </div>
      </div>

      <!-- Low Stock Report -->
      <div v-if="lowStockProducts.length > 0" class="glass animate-fade-in-scale overflow-hidden transition-all duration-300 hover:shadow-lg border-orange-500/20" style="animation-delay: 500ms">
        <div class="flex items-center justify-between border-b border-orange-500/10 px-6 py-4">
          <h3 class="text-lg font-bold text-orange-900 dark:text-orange-400">{{ $t('dashboard.lowStockProducts') }}</h3>
          <span class="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-black text-orange-600">
            {{ $t('dashboard.total') }}: {{ lowStockCount }}
          </span>
        </div>
        <div class="p-6">
           <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li v-for="product in lowStockProducts.slice(0, 6)" :key="product.id" 
                class="bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-orange-500/10 transition-all hover:border-orange-500/30">
              <div class="flex flex-col gap-1">
                <span class="text-sm font-black text-gray-900 dark:text-white truncate">{{ product.name }}</span>
                <div class="flex items-center justify-between">
                   <span class="text-[10px] uppercase font-bold text-gray-400">{{ $t('products.currentStock') }}:</span>
                   <span class="text-sm font-black text-orange-600">
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
      <div class="glass animate-fade-in-scale overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg" style="animation-delay: 600ms">
        <div class="flex items-center justify-between border-b border-gray-100/10 px-6 py-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ $t('dashboard.recentCheckins') }}</h3>
          <RouterLink to="/checkins" class="text-sm font-bold text-sky-600 hover:text-sky-500 transition-colors">{{ $t('dashboard.viewAll') }}</RouterLink>
        </div>
        <div v-if="recentCheckins.length === 0" class="px-6 py-8 text-sm text-gray-500 italic">{{ $t('dashboard.noData') }}</div>
        <ul v-else class="divide-y divide-gray-100/10 overflow-y-auto max-h-[400px]">
          <li v-for="item in recentCheckins" :key="item.id" class="px-6 py-4 transition-colors hover:bg-gray-500/5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-black text-gray-950 dark:text-white">{{ item.fullName || $t('checkins.noName') }}</p>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400">ID: {{ item.qrCodeId }}</p>
              </div>
              <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-500/5 px-2 py-1 rounded-md">{{ formatRelative(item.date) }}</div>
            </div>
          </li>
        </ul>
      </div>

      <div class="glass animate-fade-in-scale overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg" style="animation-delay: 700ms">
        <div class="flex items-center justify-between border-b border-gray-100/10 px-6 py-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ $t('dashboard.recentBeauty') }}</h3>
          <RouterLink to="/beauty" class="text-sm font-bold text-sky-600 hover:text-sky-500 transition-colors">{{ $t('dashboard.view') }}</RouterLink>
        </div>
        <div v-if="recentBeauty.length === 0" class="px-6 py-8 text-sm text-gray-500 italic">{{ $t('common.notFound') }}</div>
        <ul v-else class="divide-y divide-gray-100/10 overflow-y-auto max-h-[400px]">
          <li v-for="item in recentBeauty" :key="item.id" class="px-6 py-4 transition-colors hover:bg-gray-500/5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-black text-gray-950 dark:text-white">{{ item.fullName || $t('checkins.noName') }}</p>
                <p class="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-400">{{ item.serviceName }}</p>
              </div>
              <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-500/5 px-2 py-1 rounded-md">{{ formatRelative(item.serviceDate) }}</div>
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
import DashboardCharts from '../components/DashboardCharts.vue'
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
