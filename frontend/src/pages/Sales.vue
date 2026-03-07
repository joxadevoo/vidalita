<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
      <div>
        <h1 class="text-3xl font-black tracking-tighter text-gray-900 dark:text-gray-100 uppercase">{{ $t('sales.title') }}</h1>
        <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 italic">{{ $t('sales.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="exportToPDF"
          class="glass-pill rounded-full border border-gray-400/30 px-6 py-2.5 text-xs font-black text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all shadow-sm uppercase tracking-widest flex items-center gap-2"
        >
          <DocumentTextIcon class="h-4 w-4 text-rose-500" />
          {{ $t('sales.exportPdf') }}
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 no-print">
      <div class="glass rounded-2xl p-6 shadow-2xl border-white/40 dark:border-white/10 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sky-500/10 blur-2xl group-hover:bg-sky-500/20 transition-all"></div>
        <div class="flex items-center justify-between mb-4 relative z-10">
            <div class="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                <CurrencyDollarIcon class="h-5 w-5" />
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{{ $t('sales.totalVolume') }}</p>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tighter relative z-10">{{ formatCurrency(stats.total) }}</p>
      </div>

      <div class="glass rounded-2xl p-6 shadow-2xl border-white/40 dark:border-white/10 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
        <div class="flex items-center justify-between mb-4 relative z-10">
            <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <WalletIcon class="h-5 w-5" />
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{{ $t('sales.cashTotal') }}</p>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tighter relative z-10">{{ formatCurrency(stats.cash) }}</p>
      </div>

      <div class="glass rounded-2xl p-6 shadow-2xl border-white/40 dark:border-white/10 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
        <div class="flex items-center justify-between mb-4 relative z-10">
            <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CreditCardIcon class="h-5 w-5" />
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{{ $t('sales.cardTotal') }}</p>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tighter relative z-10">{{ formatCurrency(stats.card) }}</p>
      </div>

      <div class="glass rounded-2xl p-6 shadow-2xl border-white/40 dark:border-white/10 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
        <div class="flex items-center justify-between mb-4 relative z-10">
            <div class="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <ChartBarIcon class="h-5 w-5" />
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{{ $t('sales.summary') }}</p>
        </div>
        <div class="flex items-center gap-4 relative z-10">
            <div class="flex flex-col">
                <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">POS</span>
                <span class="text-lg font-black text-purple-600">{{ stats.posCount }}</span>
            </div>
            <div class="h-8 w-px bg-white/20"></div>
            <div class="flex flex-col">
                <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">BEAUTY</span>
                <span class="text-lg font-black text-pink-600">{{ stats.serviceCount }}</span>
            </div>
        </div>
      </div>
    </div>

    <!-- Filters and Tabs -->
    <div class="glass rounded-full p-2 shadow-xl border-white/40 dark:border-white/10 flex items-center no-print mb-6 w-full">
      <div class="flex flex-col lg:flex-row items-center justify-between w-full gap-4">
        <!-- Search - Flexible and Longer -->
        <div class="w-full lg:max-w-md xl:max-w-lg relative group">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
          <input
            v-model="searchTerm"
            type="text"
            :placeholder="$t('sales.searchPlaceholder')"
            class="input h-11 pl-12 text-sm rounded-full bg-white/50 dark:bg-black/20 w-full"
          />
        </div>
        
        <div class="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto">
        <!-- Date From -->
        <div class="flex items-center gap-2 w-full lg:w-auto">
          <span class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0">{{ $t('checkins.from') }}</span>
          <div class="flex items-center gap-2 px-3 h-11 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 w-full lg:w-36 overflow-hidden">
            <CalendarIcon class="h-4 w-4" />
            <input v-model="dateFrom" type="date" class="bg-transparent border-none focus:ring-0 w-full p-0 text-xs font-bold h-full text-gray-700 dark:text-gray-200 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
          </div>
        </div>

        <!-- Date To -->
        <div class="flex items-center gap-2 w-full lg:w-auto">
          <span class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0">{{ $t('checkins.to') }}</span>
          <div class="flex items-center gap-2 px-3 h-11 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 w-full lg:w-36 overflow-hidden">
            <CalendarIcon class="h-4 w-4" />
            <input v-model="dateTo" type="date" class="bg-transparent border-none focus:ring-0 w-full p-0 text-xs font-bold h-full text-gray-700 dark:text-gray-200 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
          </div>
        </div>
          
          <!-- Action Buttons -->
          <div class="flex items-center gap-1.5 w-full lg:w-auto">
            <button
              @click="setMonthFilter('this')"
              class="flex-1 lg:flex-none glass rounded-full border border-gray-400/20 h-11 px-6 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-white/20 transition-all shadow-sm whitespace-nowrap"
            >
              {{ $t('sales.month.thisMonth') }}
            </button>
            <button
              @click="resetFilters"
              class="rounded-full bg-gray-200 dark:bg-white/5 h-11 w-11 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/10 transition-all border border-gray-400/10"
              :title="$t('common.reset')"
            >
              <FunnelIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales Table -->
    <div class="flex flex-col gap-6 no-print">
      <!-- Tabs - Centered above Table -->
      <div class="flex justify-center -mb-2">
        <div class="flex relative p-1.5 glass rounded-full w-fit border-white/40 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-md shadow-xl">
          <!-- Animated Background Indicator -->
          <div 
            class="absolute top-1.5 bottom-1.5 rounded-full bg-white/90 dark:bg-white/15 shadow-lg"
            style="transition: left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);"
            :class="{
              'liquid-slide-right': isMoving && tabDirection === 'right',
              'liquid-slide-left': isMoving && tabDirection === 'left'
            }"
            :style="{ 
              left: activeTab === 'all' ? '0.375rem' : activeTab === 'POS' ? 'calc(33.33% + 0.125rem)' : 'calc(66.66% - 0.125rem)',
              width: 'calc(33.33% - 0.5rem)' 
            }"
          ></div>
          
          <button
            v-for="tab in ['all', 'POS', 'SERVICE']"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              activeTab === tab 
                ? 'text-sky-600 dark:text-sky-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
              'relative z-10 w-32 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-colors duration-300'
            ]"
          >
            {{ tab === 'all' ? $t('sales.tabs.all') : (tab === 'POS' ? $t('sales.tabs.pos') : $t('sales.tabs.beauty')) }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="glass rounded-2xl p-20 flex justify-center shadow-2xl border-white/40 dark:border-white/10">
        <LoadingSpinner />
      </div>
      <div v-else-if="error" class="glass rounded-2xl p-12 text-center text-rose-600 font-black shadow-2xl border-rose-500/20">
        {{ error }}
      </div>
      <div v-else class="space-y-4">
        <!-- Sticky Table Header -->
        <div class="sticky top-0 z-20 mx-2 mb-1 shrink-0 glass rounded-full shadow-lg border-white/20 dark:border-white/10 overflow-hidden backdrop-blur-xl">
          <table class="table-fixed border-separate border-spacing-0 w-full">
            <thead>
              <tr class="bg-transparent">
                <th class="py-3 pl-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[12%]">{{ $t('sales.columns.date') }}</th>
                <th class="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[10%]">{{ $t('sales.columns.type') }}</th>
                <th class="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[18%]">{{ $t('sales.columns.customer') }}</th>
                <th class="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[20%]">{{ $t('sales.columns.items') }}</th>
                <th class="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[15%]">{{ $t('sales.columns.total') }}</th>
                <th class="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[12%]">{{ $t('sales.columns.method') }}</th>
                <th class="py-3 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[13%]">{{ $t('sales.columns.actions') }}</th>
              </tr>
            </thead>
          </table>
        </div>

        <div class="glass rounded-2xl overflow-hidden shadow-xl border-white/40 dark:border-white/10 flex flex-col" style="max-height: calc(100vh - 280px);">
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-separate border-spacing-0 table-fixed">
              <thead class="invisible h-0">
                <tr>
                  <th class="w-[12%] pl-6"></th>
                  <th class="w-[10%] px-4"></th>
                  <th class="w-[18%] px-4"></th>
                  <th class="w-[20%] px-4"></th>
                  <th class="w-[15%] px-4"></th>
                  <th class="w-[12%] px-4"></th>
                  <th class="w-[13%] pr-6"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10 dark:divide-white/5">
                <tr v-for="sale in filteredSales" :key="sale.uniqueId" class="group hover:bg-white/40 dark:hover:bg-white/5 transition-all backdrop-blur-sm border-b border-white/10 dark:border-white/5">
                  <td class="py-4 pl-6 whitespace-nowrap text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                    {{ formatDateTime(sale.date) }}
                  </td>
                  <td class="py-4 px-4 whitespace-nowrap">
                    <span 
                      :class="sale.type === 'POS' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' : 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20'"
                      class="inline-flex items-center rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border shadow-inner"
                    >
                      {{ sale.type === 'POS' ? $t('sales.typePos') : $t('sales.typeService') }}
                    </span>
                  </td>
                  <td class="py-4 px-4 whitespace-nowrap font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight text-[11px]">
                    <div class="flex items-center gap-2">
                        <div class="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-900 dark:bg-sky-900/20 text-[9px] font-black text-white/50 tracking-tighter uppercase shadow-inner">
                            {{ (sale.customerName || '?').charAt(0) }}
                        </div>
                        <div class="flex flex-col">
                            <span>{{ sale.customerName || $t('pos.guest') }}</span>
                            <span v-if="sale.customerPhone" class="text-[9px] font-bold text-gray-400 dark:text-gray-500 italic lowercase tracking-tight">{{ sale.customerPhone }}</span>
                        </div>
                    </div>
                  </td>
                  <td class="py-4 px-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 italic max-w-xs truncate uppercase tracking-tight">
                    <template v-if="sale.type === 'POS'">
                      <span v-if="sale.items.length > 0">
                        {{ sale.items[0].product?.name }}
                        <span v-if="sale.items.length > 1" class="text-[9px] font-black text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded-full ml-1">
                          +{{ sale.items.length - 1 }}
                        </span>
                      </span>
                      <span v-else>—</span>
                    </template>
                    <template v-else>
                      {{ sale.serviceName }}
                    </template>
                  </td>
                  <td class="py-4 px-4 whitespace-nowrap text-[11px] font-black text-sky-600 dark:text-sky-400 tabular-nums text-right md:text-left">
                    {{ formatCurrency(sale.amount) }}
                  </td>
                  <td class="py-4 px-4 whitespace-nowrap">
                    <span v-if="sale.paymentMethod" 
                      :class="[
                        'inline-flex items-center rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border shadow-inner',
                        sale.paymentMethod === 'CASH' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 
                        (['CARD', 'UZCARD', 'HUMO', 'VISA'].includes(sale.paymentMethod) ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' : 
                        (['CLICK', 'PAYME'].includes(sale.paymentMethod) ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                        'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'))
                      ]"
                    >
                      <template v-if="sale.paymentMethod === 'CASH'">{{ $t('pos.cash') }}</template>
                      <template v-else-if="sale.paymentMethod === 'CARD'">{{ $t('pos.card') }}</template>
                      <template v-else-if="sale.paymentMethod === 'MIXED'">{{ $t('pos.mixed') }}</template>
                      <template v-else-if="sale.paymentMethod === 'DEBT'">{{ $t('pos.debt') }}</template>
                      <template v-else>{{ $t('pos.' + sale.paymentMethod.toLowerCase()) }}</template>
                    </span>
                    <span v-else class="text-gray-300 dark:text-gray-600 font-black">—</span>
                  </td>
                  <td class="py-4 pr-6 text-right">
                    <button
                      v-if="sale.type === 'POS'"
                      @click="openInvoice(sale.id)"
                      class="ml-auto flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm uppercase tracking-widest opacity-0 group-hover:opacity-100"
                    >
                      <DocumentTextIcon class="h-3.5 w-3.5" />
                      {{ $t('invoice.viewInvoice') }}
                    </button>
                    <span v-else class="text-[9px] font-bold text-gray-400 dark:text-gray-600 italic uppercase tracking-tighter">{{ $t('sales.noInvoice') }}</span>
                  </td>
                </tr>
                <tr v-if="filteredSales.length === 0">
                  <td colspan="7" class="py-20 text-center opacity-60 italic text-gray-400">
                    <div class="flex flex-col items-center gap-2">
                        <div class="h-16 w-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center opacity-20">
                            <MagnifyingGlassIcon class="h-8 w-8" />
                        </div>
                        {{ searchTerm || dateFrom || dateTo ? $t('members.noResults') : $t('sales.noSales') }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Invoice Modal -->
  <InvoiceModal
    :show="showInvoice"
    :sale-id="selectedSaleId"
    @close="showInvoice = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  CurrencyDollarIcon, 
  WalletIcon, 
  CreditCardIcon, 
  ChartBarIcon, 
  MagnifyingGlassIcon, 
  CalendarIcon, 
  FunnelIcon, 
  DocumentTextIcon 
} from '@heroicons/vue/24/outline'
import { salesService, beautyService } from '../services/supabaseService'
import { formatDateTime } from '../lib/dateUtils'
import InvoiceModal from '../components/InvoiceModal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { useToast } from '../composables/useToast'

const { t } = useI18n()
const toast = useToast()
const loading = ref(true)
const error = ref<string | null>(null)
const combinedData = ref<any[]>([])

// Filter states
const searchTerm = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const activeTab = ref('all') // 'all', 'POS', 'SERVICE'
const tabDirection = ref('')
const isMoving = ref(false)
let moveTimeout: any = null

watch(activeTab, (newVal: string, oldVal: string) => {
  const tabs = ['all', 'POS', 'SERVICE']
  const oldIdx = tabs.indexOf(oldVal)
  const newIdx = tabs.indexOf(newVal)
  
  if (newIdx > oldIdx) {
    tabDirection.value = 'right'
  } else {
    tabDirection.value = 'left'
  }
  
  isMoving.value = true
  if (moveTimeout) clearTimeout(moveTimeout)
  moveTimeout = setTimeout(() => {
    isMoving.value = false
  }, 450)
})

// Invoice modal state
const showInvoice = ref(false)
const selectedSaleId = ref<number | null>(null)

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const [posData, beautyData] = await Promise.all([
      salesService.getAllSales(),
      beautyService.getAll()
    ])

    const merged = [
      ...posData.map((s: any) => ({
        uniqueId: `pos-${s.id}`,
        id: s.id,
        type: 'POS',
        date: s.createdAt,
        customerName: s.member?.fullName || s.notes || t('pos.guest'),
        customerPhone: s.member?.phone,
        amount: s.totalAmount,
        cashAmount: s.cashAmount || 0,
        cardAmount: s.cardAmount || 0,
        paymentMethod: s.paymentMethod,
        items: s.items || []
      })),
      ...beautyData.map((b: any) => ({
        uniqueId: `service-${b.id}`,
        id: b.id,
        type: 'SERVICE',
        date: b.serviceDate,
        customerName: b.fullName || b.note || t('pos.guest'),
        customerPhone: b.phone,
        amount: b.amount,
        cashAmount: b.cashAmount || 0,
        cardAmount: b.cardAmount || 0,
        paymentMethod: b.paymentMethod,
        serviceName: b.serviceName
      }))
    ]

    // Sort by date desc
    merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    combinedData.value = merged
  } catch (err: any) {
    console.error('Failed to fetch sales data:', err)
    error.value = t('common.error')
  } finally {
    loading.value = false
  }
}

const filteredSales = computed(() => {
  return combinedData.value.filter(sale => {
    // Tab filter
    if (activeTab.value !== 'all' && sale.type !== activeTab.value) return false

    // Search filter
    const search = searchTerm.value.toLowerCase().trim()
    const customerMatch = !search || 
      (sale.customerName?.toLowerCase().includes(search)) ||
      (sale.customerPhone?.includes(search)) ||
      (sale.serviceName?.toLowerCase().includes(search)) ||
      (sale.type === 'POS' && sale.items.some((i: any) => i.product?.name?.toLowerCase().includes(search)))

    // Date range filter
    const saleDateStr = new Date(sale.date).toISOString().split('T')[0]
    const fromMatch = !dateFrom.value || saleDateStr >= dateFrom.value
    const pathMatch = !dateTo.value || saleDateStr <= dateTo.value

    return customerMatch && fromMatch && pathMatch
  })
})

const stats = computed(() => {
  const data = filteredSales.value
  return {
    total: data.reduce((acc, sale) => acc + (sale.amount || 0), 0),
    cash: data.reduce((acc, sale) => acc + (sale.cashAmount || (sale.paymentMethod === 'CASH' ? (sale.amount || 0) : 0)), 0),
    card: data.reduce((acc, sale) => acc + (sale.cardAmount || (sale.paymentMethod === 'CARD' ? (sale.amount || 0) : 0)), 0),
    posCount: data.filter(s => s.type === 'POS').length,
    serviceCount: data.filter(s => s.type === 'SERVICE').length
  }
})

const setMonthFilter = (type: 'this') => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  if (type === 'this') {
    dateFrom.value = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const lastDay = new Date(year, month + 1, 0).getDate()
    dateTo.value = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  }
}

const resetFilters = () => {
  searchTerm.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  activeTab.value = 'all'
}

const openInvoice = (saleId: number) => {
  selectedSaleId.value = saleId
  showInvoice.value = true
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat(t('locale') || 'uz-UZ').format(val || 0) + ' so\'m'
}

const exportToPDF = () => {
  const data = filteredSales.value
  if (data.length === 0) {
    toast.warning(t('common.noData'))
    return
  }

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const reportTitle = activeTab.value === 'all' 
    ? t('sales.title') 
    : (activeTab.value === 'POS' ? t('sales.tabs.pos') : t('sales.tabs.beauty'))

  const dateRangeStr = dateFrom.value && dateTo.value 
    ? `${dateFrom.value} - ${dateTo.value}` 
    : t('sales.month.thisMonth')

  const getMethodLabel = (method: string) => {
    if (method === 'CASH') return t('pos.cash')
    if (method === 'CARD') return t('pos.card')
    if (method === 'MIXED') return t('pos.mixed')
    if (method === 'DEBT') return t('pos.debt')
    return t('pos.' + method.toLowerCase())
  }

  const rows = data.map(s => `
    <tr>
      <td>${formatDateTime(s.date)}</td>
      <td>${s.type === 'POS' ? t('sales.typePos') : t('sales.typeService')}</td>
      <td>${s.customerName}</td>
      <td>${s.type === 'POS' ? (s.items[0]?.product?.name || '—') : s.serviceName}</td>
      <td style="text-align: right;">${formatCurrency(s.amount)}</td>
      <td>${getMethodLabel(s.paymentMethod)} ${s.paymentMethod === 'MIXED' ? `(${formatCurrency(s.cashAmount)} + ${formatCurrency(s.cardAmount)})` : ''}</td>
    </tr>
  `).join('')

  printWindow.document.write(`
    <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #333; }
          h1 { color: #1e40af; }
          .summary { display: grid; grid-template-cols: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
          .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .card p { margin: 0; font-size: 12px; color: #666; text-transform: uppercase; }
          .card h3 { margin: 5px 0 0; font-size: 18px; color: #1e40af; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
          th { background-color: #f3f4f6; }
          .footer { margin-top: 30px; text-align: right; font-size: 10px; color: #999; }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <p><strong>${t('sales.month.thisMonth')}:</strong> ${dateRangeStr}</p>
        
        <div class="summary">
          <div class="card"><p>${t('sales.totalVolume')}</p><h3>${formatCurrency(stats.value.total)}</h3></div>
          <div class="card"><p>${t('sales.cashTotal')}</p><h3>${formatCurrency(stats.value.cash)}</h3></div>
          <div class="card"><p>${t('sales.cardTotal')}</p><h3>${formatCurrency(stats.value.card)}</h3></div>
          <div class="card"><p>${t('sales.summary')}</p><h3>${stats.value.posCount + stats.value.serviceCount} ${t('beautyServices.items')}</h3></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>${t('sales.columns.date')}</th>
              <th>${t('sales.columns.type')}</th>
              <th>${t('sales.columns.customer')}</th>
              <th>${t('sales.columns.items')}</th>
              <th>${t('sales.columns.total')}</th>
              <th>${t('sales.columns.method')}</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        
        <div class="footer">
          Vidalita Gym & Beauty - ${new Date().toLocaleString()}
        </div>
      </body>
    </html>
  `)
  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

onMounted(() => {
  fetchData()
})
</script>
