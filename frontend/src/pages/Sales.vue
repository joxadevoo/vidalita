<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('sales.title') }}</h1>
        <p class="text-sm text-gray-500">{{ $t('sales.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="exportToPDF"
          class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ $t('sales.exportPdf') }}
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wider text-gray-500">{{ $t('sales.totalVolume') }}</p>
        <p class="mt-2 text-2xl font-bold text-sky-600">{{ formatCurrency(stats.total) }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wider text-gray-500">{{ $t('sales.cashTotal') }}</p>
        <p class="mt-2 text-2xl font-bold text-amber-600">{{ formatCurrency(stats.cash) }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wider text-gray-500">{{ $t('sales.cardTotal') }}</p>
        <p class="mt-2 text-2xl font-bold text-emerald-600">{{ formatCurrency(stats.card) }}</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-gray-500">{{ $t('sales.summary') }}</p>
            <div class="mt-2 flex gap-4">
              <span class="text-sm font-semibold text-purple-600">POS: {{ stats.posCount }}</span>
              <span class="text-sm font-semibold text-pink-600">BEAUTY: {{ stats.serviceCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Tabs -->
    <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <label class="text-xs font-medium text-gray-500 uppercase mb-1 block">{{ $t('common.search') }}</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              v-model="searchTerm"
              type="text"
              :placeholder="$t('sales.searchPlaceholder')"
              class="block w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 md:w-80">
          <div>
            <label class="text-xs font-medium text-gray-500 uppercase mb-1 block">{{ $t('checkins.from') }}</label>
            <input
              v-model="dateFrom"
              type="date"
              class="block w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 uppercase mb-1 block">{{ $t('checkins.to') }}</label>
            <input
              v-model="dateTo"
              type="date"
              class="block w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
        <div class="flex items-end gap-2">
          <button
            @click="setMonthFilter('this')"
            class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
          >
            {{ $t('sales.month.thisMonth') }}
          </button>
          <button
            @click="resetFilters"
            class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {{ $t('checkins.resetFilters') }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200">
        <button
          v-for="tab in ['all', 'POS', 'SERVICE']"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            activeTab === tab 
              ? 'border-sky-600 text-sky-600 bg-sky-50/50' 
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            'px-6 py-2 border-b-2 font-medium text-sm transition-all rounded-t-lg'
          ]"
        >
          {{ tab === 'all' ? $t('sales.tabs.all') : (tab === 'POS' ? $t('sales.tabs.pos') : $t('sales.tabs.beauty')) }}
        </button>
      </div>
    </div>

    <!-- Sales Table -->
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
      </div>
      <div v-else-if="error" class="p-6 text-center text-red-600">
        {{ error }}
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('sales.columns.date') }}</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('sales.columns.type') }}</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('sales.columns.customer') }}</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('sales.columns.items') }}</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('sales.columns.total') }}</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('sales.columns.method') }}</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('sales.columns.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="sale in filteredSales" :key="sale.uniqueId" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatDateTime(sale.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span 
                  :class="sale.type === 'POS' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'"
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                >
                  {{ sale.type === 'POS' ? $t('sales.typePos') : $t('sales.typeService') }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div class="flex flex-col">
                  <span>{{ sale.customerName || $t('pos.guest') }}</span>
                  <span v-if="sale.customerPhone" class="text-xs text-gray-500">{{ sale.customerPhone }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                <div v-if="sale.type === 'POS'">
                  <span v-if="sale.items.length > 0">
                    {{ sale.items[0].product?.name }}
                    <span v-if="sale.items.length > 1" class="text-xs font-semibold text-sky-600">
                      {{ $t('memberDetail.moreItems', { count: sale.items.length - 1 }) }}
                    </span>
                  </span>
                  <span v-else>—</span>
                </div>
                <div v-else>
                  {{ sale.serviceName }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-sky-600">
                {{ formatCurrency(sale.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <span v-if="sale.paymentMethod" :class="sale.paymentMethod === 'CASH' ? 'bg-amber-100 text-amber-700' : (sale.paymentMethod === 'CARD' ? 'bg-sky-100 text-sky-700' : 'bg-orange-100 text-orange-700')" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {{ sale.paymentMethod === 'CASH' ? $t('pos.cash') : (sale.paymentMethod === 'CARD' ? $t('pos.card') : $t('pos.mixed')) }}
                </span>
                <span v-else>—</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                <button
                  v-if="sale.type === 'POS'"
                  @click="openInvoice(sale.id)"
                  class="ml-auto flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-all"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {{ $t('invoice.viewInvoice') }}
                </button>
                <span v-else class="text-xs text-gray-400 italic">{{ $t('sales.noInvoice') }}</span>
              </td>
            </tr>
            <tr v-if="filteredSales.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500 italic">
                {{ searchTerm || dateFrom || dateTo ? $t('members.noResults') : $t('sales.noSales') }}
              </td>
            </tr>
          </tbody>
        </table>
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
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { salesService, beautyService } from '../services/supabaseService'
import { formatDateTime } from '../lib/dateUtils'
import InvoiceModal from '../components/InvoiceModal.vue'

const { t } = useI18n()
const loading = ref(true)
const error = ref<string | null>(null)
const combinedData = ref<any[]>([])

// Filter states
const searchTerm = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const activeTab = ref('all') // 'all', 'POS', 'SERVICE'

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
    alert(t('common.noData'))
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

  const rows = data.map(s => `
    <tr>
      <td>${formatDateTime(s.date)}</td>
      <td>${s.type === 'POS' ? t('sales.typePos') : t('sales.typeService')}</td>
      <td>${s.customerName}</td>
      <td>${s.type === 'POS' ? (s.items[0]?.product?.name || '—') : s.serviceName}</td>
      <td style="text-align: right;">${formatCurrency(s.amount)}</td>
      <td>${s.paymentMethod === 'CASH' ? t('pos.cash') : (s.paymentMethod === 'CARD' ? t('pos.card') : t('pos.mixed'))} ${s.paymentMethod === 'MIXED' ? `(${formatCurrency(s.cashAmount)} + ${formatCurrency(s.cardAmount)})` : ''}</td>
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
