<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('inventory.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('inventory.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50" @click="fetchData">{{ $t('common.refresh') }}</button>
        <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1" @click="exportToExcel">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {{ $t('common.exportExcel') }}
        </button>
        <button class="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500" @click="showStockInModal = true">{{ $t('inventory.stockIn') }}</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200">
        <button 
            @click="activeTab = 'stock'" 
            :class="activeTab === 'stock' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm"
        >
            {{ $t('inventory.stockLevels') }}
        </button>
        <button 
            @click="activeTab = 'movements'" 
            :class="activeTab === 'movements' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm"
        >
            {{ $t('inventory.movements') }}
        </button>
    </div>

    <!-- Stock Levels Table -->
    <div v-if="activeTab === 'stock'" class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div v-if="loading" class="p-8 text-center">{{ $t('common.loading') }}</div>
        <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('inventory.columns.product') }}</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('inventory.columns.currentStock') }}</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('inventory.columns.lastUpdated') }}</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="item in stockLevels" :key="item.product_id" class="hover:bg-gray-50">
                    <td class="px-3 py-4 text-sm font-medium text-gray-900">{{ item.products?.name }}</td>
                    <td class="px-3 py-4 text-sm">
                        <span :class="item.quantity_on_hand <= 5 ? 'text-red-600 font-bold' : 'text-gray-900'" class="text-sm">
                            {{ item.quantity_on_hand }} {{ $t('products.unit') }}
                        </span>
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-500">{{ new Date(item.updated_at).toLocaleString('uz-UZ') }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Movements Filters -->
    <div v-if="activeTab === 'movements'" class="sticky top-0 z-10 grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <div>
            <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('inventory.columns.date') }}</label>
            <div class="mt-1 grid grid-cols-2 gap-2">
                <input v-model="movementFilters.startDate" type="date" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                <input v-model="movementFilters.endDate" type="date" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
            </div>
        </div>
        <div>
            <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('inventory.columns.type') }}</label>
            <select v-model="movementFilters.type" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none">
                <option value="all">{{ $t('common.all') }}</option>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
            </select>
        </div>
        <div class="flex items-end justify-end text-sm text-gray-500">
            {{ $t('common.total') }}: <span class="ml-1 font-semibold text-gray-700">{{ filteredMovements.length }}</span>
        </div>
    </div>

    <!-- Movements History Table -->
    <div v-if="activeTab === 'movements'" class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div v-if="loading" class="p-8 text-center">{{ $t('common.loading') }}</div>
        <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('inventory.columns.date') }}</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('inventory.columns.product') }}</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('inventory.columns.customer') }}</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('inventory.columns.type') }}</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('inventory.columns.qty') }}</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('inventory.columns.reason') }}</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="move in filteredMovements" :key="move.id" class="hover:bg-gray-50">
                    <td class="px-3 py-4 text-sm text-gray-500">{{ new Date(move.created_at).toLocaleString('uz-UZ') }}</td>
                    <td class="px-3 py-4 text-sm font-medium text-gray-900">{{ move.products?.name }}</td>
                    <td class="px-3 py-4 text-sm text-gray-500">{{ move.customerName || '—' }}</td>
                    <td class="px-3 py-4 text-sm">
                        <span :class="getTypeClass(move.type)" class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold">
                            {{ move.type }}
                        </span>
                    </td>
                    <td class="px-3 py-4 text-sm font-bold" :class="move.qty > 0 ? 'text-green-600' : 'text-red-600'">
                        {{ move.qty > 0 ? '+' : '' }}{{ move.qty }}
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-500 uppercase">{{ move.reason }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Stock In Modal -->
    <div v-if="showStockInModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 class="text-lg font-bold mb-4">{{ $t('inventory.stockInTitle') }}</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('inventory.columns.product') }}</label>
                    <select v-model="stockInForm.productId" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none">
                        <option v-for="p in allProducts" :key="p.id" :value="p.id">{{ p.name }} ({{ p.sku }})</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('inventory.quantityLabel') }}</label>
                    <input v-model.number="stockInForm.qty" type="number" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('inventory.costPriceLabel') }}</label>
                    <input v-model.number="stockInForm.unitCost" type="number" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('inventory.reasonLabel') }}</label>
                    <input v-model="stockInForm.reason" type="text" :placeholder="$t('inventory.reasonPlaceholder')" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>
            </div>
            <div class="mt-8 flex justify-end gap-3">
                <button @click="showStockInModal = false" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">{{ $t('common.cancel') }}</button>
                <button @click="submitStockIn" class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500" :disabled="submitting">
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

const { t } = useI18n();

const activeTab = ref<'stock' | 'movements'>('stock');
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
    } catch (err: any) {
        alert(t('common.error') + ": " + err.message);
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
