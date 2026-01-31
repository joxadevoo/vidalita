<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Ombor Nazorati</h2>
        <p class="text-sm text-gray-500">Mahsulotlar kirimi va harakatlari tarixi</p>
      </div>
      <div class="flex gap-2">
        <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50" @click="fetchData">Yangilash</button>
        <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1" @click="exportToExcel">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Excel
        </button>
        <button class="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500" @click="showStockInModal = true">Kirim qilish</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200">
        <button 
            @click="activeTab = 'stock'" 
            :class="activeTab === 'stock' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm"
        >
            Qoldiqlar
        </button>
        <button 
            @click="activeTab = 'movements'" 
            :class="activeTab === 'movements' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm"
        >
            Harakatlar tarixi
        </button>
    </div>

    <!-- Stock Levels Table -->
    <div v-if="activeTab === 'stock'" class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div v-if="loading" class="p-8 text-center">Yuklanmoqda...</div>
        <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mahsulot</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SKU</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Joriy qoldiq</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Oxirgi yangilanish</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="item in stockLevels" :key="item.product_id" class="hover:bg-gray-50">
                    <td class="px-3 py-4 text-sm font-medium text-gray-900">{{ item.products?.name }}</td>
                    <td class="px-3 py-4 text-sm text-gray-500">{{ item.products?.sku || '—' }}</td>
                    <td class="px-3 py-4 text-sm">
                        <span :class="item.quantity_on_hand <= 5 ? 'text-red-600 font-bold' : 'text-gray-900'" class="text-sm">
                            {{ item.quantity_on_hand }} dona
                        </span>
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-500">{{ new Date(item.updated_at).toLocaleString('uz-UZ') }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Movements History Table -->
    <div v-if="activeTab === 'movements'" class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div v-if="loading" class="p-8 text-center">Yuklanmoqda...</div>
        <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sana</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mahsulot</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Turi</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Miqdor</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sabab</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="move in movements" :key="move.id" class="hover:bg-gray-50">
                    <td class="px-3 py-4 text-sm text-gray-500">{{ new Date(move.created_at).toLocaleString('uz-UZ') }}</td>
                    <td class="px-3 py-4 text-sm font-medium text-gray-900">{{ move.products?.name }}</td>
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
            <h3 class="text-lg font-bold mb-4">Omborga kirim qilish</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">Mahsulot</label>
                    <select v-model="stockInForm.productId" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none">
                        <option v-for="p in allProducts" :key="p.id" :value="p.id">{{ p.name }} ({{ p.sku }})</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">Miqdor (dona)</label>
                    <input v-model.number="stockInForm.qty" type="number" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">Kirim narxi (tannarx)</label>
                    <input v-model.number="stockInForm.unitCost" type="number" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">Eslatma / Sabab</label>
                    <input v-model="stockInForm.reason" type="text" placeholder="Masalan: Yangi partiya" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>
            </div>
            <div class="mt-8 flex justify-end gap-3">
                <button @click="showStockInModal = false" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Bekor qilish</button>
                <button @click="submitStockIn" class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500" :disabled="submitting">
                    {{ submitting ? 'Saqlanmoqda...' : 'Tasdiqlash' }}
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { inventoryService, productsService } from '../services/supabaseService';
import * as XLSX from 'xlsx';

const activeTab = ref<'stock' | 'movements'>('stock');
const loading = ref(false);
const submitting = ref(false);

const stockLevels = ref<any[]>([]);
const movements = ref<any[]>([]);
const allProducts = ref<any[]>([]);

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
        alert("Xatolik: " + err.message);
    } finally {
        submitting.value = false;
    }
};

const exportToExcel = () => {
    const data = activeTab.value === 'stock' ? stockLevels.value : movements.value;
    if (data.length === 0) return;

    let excelData;
    if (activeTab.value === 'stock') {
        excelData = data.map(item => ({
            "Mahsulot": item.products?.name,
            "SKU": item.products?.sku || '',
            "Qoldiq": item.quantity_on_hand,
            "Sana": new Date(item.updated_at).toLocaleString('uz-UZ')
        }));
    } else {
        excelData = data.map(item => ({
            "Sana": new Date(item.created_at).toLocaleString('uz-UZ'),
            "Mahsulot": item.products?.name,
            "Turi": item.type,
            "Miqdor": item.qty,
            "Sabab": item.reason
        }));
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, activeTab.value === 'stock' ? "Qoldiqlar" : "Harakatlar");
    XLSX.writeFile(wb, `inventory_${activeTab.value}_${new Date().toISOString().slice(0,10)}.xlsx`);
};
</script>
