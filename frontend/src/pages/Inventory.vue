<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
      <div>
        <h2 class="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ $t('inventory.title') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-bold italic">{{ $t('inventory.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button class="glass-pill rounded-full border border-gray-400/30 px-5 py-2 text-sm font-black text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all shadow-sm" @click="fetchData">
          <ArrowPathIcon class="h-4 w-4" />
        </button>
        <button class="glass-pill rounded-full border border-gray-400/30 px-5 py-2 text-sm font-black text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 shadow-sm flex items-center gap-2 transition-all" @click="exportToExcel">
            <TableCellsIcon class="h-5 w-5 text-emerald-500" />
            <span class="hidden sm:inline">{{ $t('common.exportExcel') }}</span>
        </button>
        <button class="rounded-full bg-emerald-600 px-6 py-2 text-sm font-black text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition-all uppercase tracking-wider flex items-center gap-2" @click="showStockInModal = true">
          <ArrowDownTrayIcon class="h-4 w-4" />
          {{ $t('inventory.stockIn') }}
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex relative glass rounded-full p-1 border-white/40 dark:border-white/10 w-fit no-print bg-white/40 dark:bg-black/20 backdrop-blur-md shadow-xl">
        <!-- Animated Background Indicator -->
        <div 
          class="absolute top-1 bottom-1 rounded-full bg-white shadow-md dark:bg-white/20"
          style="transition: left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);"
          :class="{
            'liquid-slide-right': isMoving && tabDirection === 'right',
            'liquid-slide-left': isMoving && tabDirection === 'left'
          }"
          :style="{ 
            left: activeTab === 'stock' ? '0.25rem' : 'calc(50% + 0.25rem)',
            width: 'calc(50% - 0.5rem)' 
          }"
        ></div>
        
        <button 
            @click="activeTab = 'stock'" 
            :class="[
              activeTab === 'stock' 
                ? 'text-gray-800 dark:text-white' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
              'relative z-10 w-28 py-2 text-xs font-black uppercase tracking-widest rounded-full transition-colors duration-300'
            ]"
        >
            {{ $t('inventory.stockLevels') }}
        </button>
        <button 
            @click="activeTab = 'movements'" 
            :class="[
              activeTab === 'movements' 
                ? 'text-gray-800 dark:text-white' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
              'relative z-10 w-28 py-2 text-xs font-black uppercase tracking-widest rounded-full transition-colors duration-300'
            ]"
        >
            {{ $t('inventory.movements') }}
        </button>
    </div>

    <!-- Stock Levels Table -->
    <div v-if="activeTab === 'stock'" class="glass rounded-2xl overflow-hidden shadow-xl border-white/40 dark:border-white/10 flex flex-col no-print" style="max-height: calc(100vh - 280px);">
        <LoadingSpinner v-if="loading" />
        <template v-else>
          <!-- Thead pill -->
          <div class="mx-2 mt-2 shrink-0">
            <table class="border-separate border-spacing-0 w-full">
              <thead>
                <tr class="glass rounded-full block-table-header">
                  <th class="py-2.5 pl-4 pr-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 rounded-l-full bg-transparent">{{ $t('inventory.columns.product') }}</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent">{{ $t('inventory.columns.currentStock') }}</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 rounded-r-full bg-transparent">{{ $t('inventory.columns.lastUpdated') }}</th>
                </tr>
              </thead>
            </table>
          </div>

          <!-- Tbody scrollable -->
          <div class="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
            <table class="border-separate border-spacing-0 w-full">
              <thead class="invisible h-0">
                <tr>
                  <th class="py-2.5 pl-4 pr-3 w-[40%]"></th>
                  <th class="px-3 py-2.5 w-[30%]"></th>
                  <th class="px-3 py-2.5 w-[30%]"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10 dark:divide-white/5">
                <tr v-for="item in stockLevels" :key="item.product_id" class="group hover:bg-white/40 dark:hover:bg-white/5 transition-all backdrop-blur-sm">
                    <td class="whitespace-nowrap px-4 py-4 text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ item.products?.name }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <span :class="item.quantity_on_hand <= 5 ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse' : 'bg-green-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10'" class="inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider border">
                            {{ item.quantity_on_hand }} {{ $t('products.unit') }}
                        </span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">{{ new Date(item.updated_at).toLocaleString('uz-UZ') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
    </div>

    <!-- Movements Filters -->
    <div v-if="activeTab === 'movements'" class="sticky top-0 z-20 glass rounded-full p-4 shadow-xl border-white/40 dark:border-white/10 grid gap-4 md:grid-cols-3 no-print items-end backdrop-blur-md">
        <div class="space-y-1.5 px-1">
            <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('inventory.columns.date') }}</label>
            <div class="flex gap-2">
                <input v-model="movementFilters.startDate" type="date" class="input h-10 flex-1 text-xs" />
                <input v-model="movementFilters.endDate" type="date" class="input h-10 flex-1 text-xs" />
            </div>
        </div>
        <div class="space-y-1.5 px-1">
            <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('inventory.columns.type') }}</label>
            <select v-model="movementFilters.type" class="input h-10 w-full text-[10px] font-black uppercase tracking-widest px-4">
                <option value="all">{{ $t('common.all') }}</option>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
            </select>
        </div>
        <div class="flex items-center justify-end text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-4 mb-2">
            {{ $t('common.total') }}: <span class="ml-2 font-black text-sky-600 dark:text-sky-400 text-sm">{{ filteredMovements.length }}</span>
        </div>
    </div>

    <!-- Movements History Table -->
    <div v-if="activeTab === 'movements'" class="glass rounded-2xl overflow-hidden shadow-xl border-white/40 dark:border-white/10 flex flex-col no-print" style="max-height: calc(100vh - 280px);">
        <LoadingSpinner v-if="loading" />
        <template v-else>
          <!-- Thead pill -->
          <div class="mx-2 mt-2 shrink-0">
            <table class="border-separate border-spacing-0 w-full">
              <thead>
                <tr class="glass rounded-full block-table-header">
                  <th class="py-2.5 pl-4 pr-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 rounded-l-full bg-transparent">{{ $t('inventory.columns.date') }}</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent">{{ $t('inventory.columns.product') }}</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent">{{ $t('inventory.columns.customer') }}</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent">{{ $t('inventory.columns.type') }}</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent">{{ $t('inventory.columns.qty') }}</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 rounded-r-full bg-transparent pr-6">{{ $t('inventory.columns.reason') }}</th>
                </tr>
              </thead>
            </table>
          </div>

          <!-- Tbody scrollable -->
          <div class="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
            <table class="border-separate border-spacing-0 w-full">
              <thead class="invisible h-0">
                <tr>
                  <th class="py-2.5 pl-4 pr-3 w-[150px]"></th>
                  <th class="px-3 py-2.5 w-[250px]"></th>
                  <th class="px-3 py-2.5 w-[150px]"></th>
                  <th class="px-3 py-2.5 w-[100px]"></th>
                  <th class="px-3 py-2.5 w-[100px]"></th>
                  <th class="px-3 py-2.5 w-[200px]"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10 dark:divide-white/5">
                <tr v-for="move in filteredMovements" :key="move.id" class="group hover:bg-white/40 dark:hover:bg-white/5 transition-all backdrop-blur-sm">
                    <td class="whitespace-nowrap px-4 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">{{ new Date(move.created_at).toLocaleString('uz-UZ') }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ move.products?.name }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-xs font-bold text-gray-500 dark:text-gray-400">{{ move.customerName || '—' }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <span :class="getTypeClass(move.type)" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border">
                            {{ move.type }}
                        </span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm font-black tracking-tighter" :class="move.qty > 0 ? 'text-emerald-500' : 'text-rose-500'">
                        {{ move.qty > 0 ? '+' : '' }}{{ move.qty }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pr-6 italic">{{ move.reason }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
    </div>

    <!-- Stock In Modal -->
    <div v-if="showStockInModal" class="fixed inset-0 z-[150] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 overflow-y-auto">
        <div class="glass relative w-full max-w-md rounded-2xl p-8 shadow-2xl z-[151] border-white/40 dark:border-white/10 my-auto backdrop-blur-xl">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ $t('inventory.stockInTitle') }}</h3>
                <button @click="showStockInModal = false" class="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 transition-all">
                    <XMarkIcon class="h-6 w-6" />
                </button>
            </div>
            
            <div class="space-y-5">
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('inventory.columns.product') }}</label>
                    <select v-model="stockInForm.productId" class="input h-11 w-full text-[11px] font-black uppercase tracking-wider px-4">
                        <option v-for="p in allProducts" :key="p.id" :value="p.id">{{ p.name }} ({{ p.sku }})</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('inventory.quantityLabel') }}</label>
                        <input v-model.number="stockInForm.qty" type="number" class="input h-11 w-full text-sm font-black" />
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('inventory.costPriceLabel') }}</label>
                        <input v-model.number="stockInForm.unitCost" type="number" class="input h-11 w-full text-sm font-bold" />
                    </div>
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('inventory.reasonLabel') }}</label>
                    <input v-model="stockInForm.reason" type="text" :placeholder="$t('inventory.reasonPlaceholder')" class="input h-11 w-full text-sm font-bold" />
                </div>
            </div>
            <div class="mt-10 flex justify-end gap-3">
                <button @click="showStockInModal = false" class="glass-pill rounded-full border border-gray-400/30 px-6 py-2.5 text-sm font-black text-gray-600 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/10 transition-all">{{ $t('common.cancel') }}</button>
                <button @click="submitStockIn" class="rounded-full bg-emerald-600 px-10 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 active:scale-95 transition-all uppercase tracking-widest" :disabled="submitting">
                    {{ submitting ? $t('common.saving') : $t('common.confirm') }}
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { inventoryService, productsService } from '../services/supabaseService';
import * as XLSX from 'xlsx';
import { useI18n } from 'vue-i18n';
import { useToast } from '../composables/useToast';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import {
  ArrowPathIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const { t } = useI18n();
const toast = useToast();

const activeTab = ref<'stock' | 'movements'>('stock');
const tabDirection = ref('');
const isMoving = ref(false);
let moveTimeout: any = null;

watch(activeTab, (newVal: string, oldVal: string) => {
  const tabs = ['stock', 'movements'];
  const oldIdx = tabs.indexOf(oldVal);
  const newIdx = tabs.indexOf(newVal);
  
  if (newIdx > oldIdx) {
    tabDirection.value = 'right';
  } else {
    tabDirection.value = 'left';
  }
  
  isMoving.value = true;
  if (moveTimeout) clearTimeout(moveTimeout);
  moveTimeout = setTimeout(() => {
    isMoving.value = false;
  }, 450);
});
const loading = ref(false);
const submitting = ref(false);

const stockLevels = ref<any[]>([]);
const movements = ref<any[]>([]);
const allProducts = ref<any[]>([]);
const movementFilters = ref({
    startDate: '',
    endDate: '',
    type: 'all'
});

const showStockInModal = ref(false);
const stockInForm = ref({
    productId: null as number | null,
    qty: 0,
    unitCost: 0,
    reason: ''
});

const fetchData = async () => {
    loading.value = true;
    try {
        if (activeTab.value === 'stock') {
            stockLevels.value = await inventoryService.getStockLevels();
        } else {
            movements.value = await inventoryService.getMovements();
        }
        allProducts.value = await productsService.getAll();
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
watch(activeTab, () => {
    fetchData();
});

const filteredMovements = computed(() => {
    if (!movementFilters.value.startDate && !movementFilters.value.endDate && movementFilters.value.type === 'all') {
        return movements.value;
    }

    const start = movementFilters.value.startDate ? new Date(`${movementFilters.value.startDate}T00:00:00`) : null;
    const end = movementFilters.value.endDate ? new Date(`${movementFilters.value.endDate}T23:59:59`) : null;
    const type = movementFilters.value.type;

    return movements.value.filter(move => {
        const createdAt = new Date(move.created_at);
        if (start && createdAt < start) return false;
        if (end && createdAt > end) return false;
        if (type !== 'all' && String(move.type).toUpperCase() !== type) return false;
        return true;
    });
});

const getTypeClass = (type: string) => {
    switch (type) {
        case 'IN': return 'bg-green-100 text-green-700';
        case 'OUT': return 'bg-red-100 text-red-700';
        case 'ADJUST': return 'bg-yellow-100 text-yellow-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const submitStockIn = async () => {
    if (!stockInForm.value.productId || !stockInForm.value.qty) return;
    submitting.value = true;
    try {
        await inventoryService.stockIn({
            productId: stockInForm.value.productId,
            qty: stockInForm.value.qty,
            unitCost: stockInForm.value.unitCost,
            reason: stockInForm.value.reason
        });
        await fetchData();
        showStockInModal.value = false;
        stockInForm.value = { productId: null, qty: 0, unitCost: 0, reason: '' };
        toast.success(t('common.success'));
    } catch (err: any) {
        toast.error(t('common.error') + ": " + err.message);
    } finally {
        submitting.value = false;
    }
};

const exportToExcel = () => {
    const data = activeTab.value === 'stock' ? stockLevels.value : filteredMovements.value;
    if (data.length === 0) return;

    let excelData;
    if (activeTab.value === 'stock') {
        excelData = data.map(item => ({
            [t('inventory.columns.product')]: item.products?.name,
            [t('inventory.columns.sku')]: item.products?.sku || '',
            [t('inventory.columns.currentStock')]: item.quantity_on_hand,
            [t('inventory.columns.date')]: new Date(item.updated_at).toLocaleString('uz-UZ')
        }));
    } else {
        excelData = data.map(item => ({
            [t('inventory.columns.date')]: new Date(item.created_at).toLocaleString('uz-UZ'),
            [t('inventory.columns.product')]: item.products?.name,
            [t('inventory.columns.customer')]: item.customerName || '',
            [t('inventory.columns.type')]: item.type,
            [t('inventory.columns.qty')]: item.qty,
            [t('inventory.columns.reason')]: item.reason
        }));
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, activeTab.value === 'stock' ? t('inventory.stockLevels') : t('inventory.movements'));
    XLSX.writeFile(wb, `inventory_${activeTab.value}_${new Date().toISOString().slice(0,10)}.xlsx`);
};
</script>
