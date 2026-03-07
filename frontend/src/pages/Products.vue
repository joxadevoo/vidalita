<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
      <div>
        <h2 class="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ $t('products.title') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-bold italic">{{ $t('products.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button class="glass-pill rounded-full border border-gray-400/30 px-5 py-2 text-sm font-black text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all shadow-sm" @click="fetchProducts">
          <ArrowPathIcon class="h-4 w-4" />
        </button>
        <button class="glass-pill rounded-full border border-gray-400/30 px-5 py-2 text-sm font-black text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 shadow-sm flex items-center gap-2 transition-all" @click="exportToExcel">
            <TableCellsIcon class="h-5 w-5 text-emerald-500" />
            <span class="hidden sm:inline">{{ $t('common.exportExcel') }}</span>
        </button>
        <button class="rounded-full bg-sky-600 px-6 py-2 text-sm font-black text-white shadow-lg shadow-sky-600/25 hover:bg-sky-500 transition-all uppercase tracking-wider" @click="showAddModal = true">{{ $t('products.newProduct') }}</button>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

    <div class="sticky top-0 z-20 glass rounded-full p-2 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl border-white/40 dark:border-white/10 no-print mb-6 backdrop-blur-md">
      <!-- Search -->
      <div class="w-full lg:max-w-md xl:max-w-lg relative flex items-center group">
        <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
        <input
          v-model="searchTerm"
          type="text"
          :placeholder="$t('products.searchPlaceholder')"
          class="w-full rounded-full h-11 pl-12 pr-4 text-sm bg-white/40 dark:bg-black/20 border-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 backdrop-blur-sm transition"
        />
      </div>

      <div class="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
        <!-- Category -->
        <div class="flex items-center gap-2 px-4 h-11 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 w-full lg:w-64 relative group/select">
          <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{{ $t('products.columns.category') }}</label>
          <div class="relative flex items-center flex-1">
            <select
              v-model="categoryFilter"
              class="bg-transparent border-none focus:ring-0 text-xs font-bold h-full appearance-none w-full dark:text-gray-200 pr-8 cursor-pointer uppercase tracking-tight"
            >
              <option value="all" class="dark:bg-gray-900">{{ $t('products.allCategories') }}</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id" class="dark:bg-gray-900">{{ cat.name }}</option>
            </select>
            <ChevronDownIcon class="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform group-hover/select:text-sky-500" />
          </div>
        </div>

        <!-- Total Count -->
        <div class="flex items-center justify-end gap-2 px-1 h-11">
          <span class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{{ $t('common.total') }}:</span>
          <span class="glass-pill rounded-full w-11 h-11 flex items-center justify-center text-sm font-bold text-sky-600 dark:text-sky-400 border border-sky-400/20 shadow-inner">{{ filteredProducts.length }}</span>
        </div>
      </div>
    </div>

    <div class="glass rounded-2xl overflow-hidden shadow-2xl border-white/40 dark:border-white/10 flex flex-col no-print" style="max-height: calc(100vh - 280px);">
      <LoadingSpinner v-if="loading" />
      <template v-else>
        <!-- Thead pill -->
        <div class="mx-2 mt-2 shrink-0">
          <table class="border-separate border-spacing-0 w-full">
            <thead>
              <tr class="glass rounded-full block-table-header">
                <th class="py-2.5 pl-4 pr-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 rounded-l-full bg-transparent">{{ $t('products.columns.name') }}</th>
                <th class="px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent">{{ $t('products.columns.price') }}</th>
                <th class="px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent">{{ $t('products.columns.stock') }}</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 rounded-r-full bg-transparent pr-6">{{ $t('products.columns.actions') }}</th>
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
                <th class="px-3 py-2.5 w-[20%]"></th>
                <th class="px-3 py-2.5 w-[20%]"></th>
                <th class="px-3 py-2.5 w-[20%]"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10 dark:divide-white/5">
              <tr v-for="product in filteredProducts" :key="product.id" class="group hover:bg-white/40 dark:hover:bg-white/5 transition-all backdrop-blur-sm">
                <td class="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900 dark:text-gray-100 pl-4">
                  <div class="flex items-center gap-3">
                    <div v-if="product.imageUrl" class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-white/30 dark:border-white/5 shadow-sm">
                      <img :src="product.imageUrl" class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div v-else class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-900 dark:bg-sky-900/20 text-[10px] font-black text-white/50 tracking-tighter uppercase shadow-inner">
                        VIDA
                    </div>
                    <div>
                      <div class="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ product.name }}</div>
                      <div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 italic mt-0.5">{{ product.brand }}</div>
                    </div>
                  </div>
                </td>

                <td class="whitespace-nowrap px-3 py-4 text-sm font-black text-sky-600 dark:text-sky-400 tracking-tight">{{ formatCurrency(product.salePrice) }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                  <span :class="product.currentStock <= product.reorderLevel ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'" class="inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider border">
                    {{ product.currentStock }} {{ product.unit }}
                  </span>
                  <div v-if="product.currentStock <= product.reorderLevel" class="text-[9px] font-black uppercase text-red-500 mt-1 animate-pulse px-1">{{ $t('products.lowStock') }}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-right pr-6">
                  <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="editProduct(product)" class="p-2 text-sky-500 hover:bg-sky-500/10 rounded-full transition-all" :title="$t('common.edit')">
                      <PencilSquareIcon class="h-4 w-4" />
                    </button>
                    <button @click="deleteProduct(product.id)" class="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all" :title="$t('common.delete')">
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="4" class="p-16 text-center text-gray-400 dark:text-gray-500 italic opacity-60">
                  <div class="flex flex-col items-center gap-2">
                    <div class="h-12 w-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center opacity-20">
                      <MagnifyingGlassIcon class="h-6 w-6" />
                    </div>
                    {{ $t('products.noProducts') }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <!-- Add/Edit Modal (Simplified) -->
    <div v-if="showAddModal" class="fixed inset-0 z-[150] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 overflow-y-auto">
        <div class="glass relative w-full max-w-lg rounded-2xl p-8 shadow-2xl z-[151] border-white/40 dark:border-white/10 my-auto backdrop-blur-xl">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ editingProduct ? $t('products.editProduct') : $t('products.addProduct') }}</h3>
                <button @click="closeModal" class="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 transition-all">
                    <XMarkIcon class="h-6 w-6" />
                </button>
            </div>
            
            <div class="grid gap-5 sm:grid-cols-2">
                <div class="sm:col-span-2 space-y-1.5">
                    <label class="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('products.columns.name') }}</label>
                    <input v-model="form.name" type="text" class="w-full rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-sm font-black" />
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('products.brand') }}</label>
                    <input v-model="form.brand" type="text" class="w-full rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-sm font-bold" />
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('products.columns.category') }}</label>
                    <select v-model="form.categoryId" class="w-full rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-[11px] font-black uppercase tracking-wider">
                        <option :value="null">{{ $t('products.allCategories') }}</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                </div>

                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('products.sku') }}</label>
                    <input v-model="form.sku" type="text" class="w-full rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-xs font-bold" />
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('products.barcode') }}</label>
                    <input v-model="form.barcode" type="text" class="w-full rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-xs font-bold" />
                </div>

                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('products.salePrice') }}</label>
                    <input v-model.number="form.salePrice" type="number" class="w-full rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-sm font-black" />
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('products.costPrice') }}</label>
                    <input v-model.number="form.costPriceDefault" type="number" class="w-full rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-sm font-bold opacity-70" />
                </div>
                
                <!-- Discount Percent Field -->
                <div class="sm:col-span-2 space-y-1.5">
                    <label class="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('products.discountPercent') }}</label>
                    <div class="relative flex items-center">
                        <input
                            v-model.number="form.discountPercent"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            class="w-full rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-sm font-black pr-10"
                            :placeholder="$t('products.discountPlaceholder')"
                        />
                        <span class="absolute right-4 text-sm font-black text-gray-400">%</span>
                    </div>
                </div>

                <!-- Discounted Price Display (if discount > 0) -->
                <div v-if="form.discountPercent > 0" class="sm:col-span-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 backdrop-blur-md">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-emerald-600/70">{{ $t('products.originalPrice') }}:</span>
                        <span class="text-xs font-bold text-gray-400 line-through">{{ formatCurrency(form.salePrice || 0) }}</span>
                    </div>
                    <div class="mt-2 flex items-center justify-between">
                        <span class="text-sm font-black text-emerald-700 uppercase tracking-tight">{{ $t('products.discountedPrice') }}:</span>
                        <span class="text-2xl font-black text-emerald-600 tracking-tighter">{{ formatCurrency(discountedPrice) }}</span>
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('products.reorderLevel') }}</label>
                    <input v-model.number="form.reorderLevel" type="number" class="w-full rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all h-11 text-sm font-bold" />
                </div>

            </div>
            <div class="mt-10 flex justify-end gap-3">
                <button @click="closeModal" class="glass-pill rounded-full border border-gray-400/30 px-6 py-2.5 text-sm font-black text-gray-600 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/10 transition-all">{{ $t('common.cancel') }}</button>
                <button @click="saveProduct" class="rounded-full bg-sky-600 px-10 py-2.5 text-sm font-black text-white shadow-lg shadow-sky-600/25 hover:bg-sky-500 active:scale-95 transition-all uppercase tracking-widest" :disabled="saving">
                    {{ saving ? $t('products.saving') : $t('common.save') }}
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { productsService } from '../services/supabaseService';
import * as XLSX from 'xlsx';
import { useI18n } from 'vue-i18n';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import {
  ArrowPathIcon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const { t } = useI18n();
const toast = useToast();
const { confirm } = useConfirm();

const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const searchTerm = ref('');
const categoryFilter = ref('all');

const showAddModal = ref(false);
const saving = ref(false);
const editingProduct = ref<any | null>(null);
const form = ref({
    name: '',
    brand: '',
    categoryId: null as number | null,
    sku: '',
    barcode: '',
    salePrice: 0,
    discountPercent: 0,
    costPriceDefault: 0,
    reorderLevel: 5,
    unit: 'pcs'
});

const discountedPrice = computed(() => {
  if (!form.value.salePrice || !form.value.discountPercent) {
    return form.value.salePrice || 0
  }
  const discount = (form.value.salePrice * form.value.discountPercent) / 100
  return form.value.salePrice - discount
});

const fetchProducts = async () => {
    loading.value = true;
    try {
        products.value = await productsService.getAll();
        categories.value = await productsService.getCategories();
    } catch (err: any) {
        error.value = t('products.errorLoading') + ": " + err.message;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchProducts);

const filteredProducts = computed(() => {
    const s = searchTerm.value.toLowerCase();
    return products.value.filter(p => {
        const matchesSearch = !s || p.name.toLowerCase().includes(s) || (p.sku && p.sku.toLowerCase().includes(s)) || (p.barcode && p.barcode.toLowerCase().includes(s));
        const matchesCategory = categoryFilter.value === 'all' || p.categoryId == categoryFilter.value;
        return matchesSearch && matchesCategory;
    });
});

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
};

const editProduct = (p: any) => {
    editingProduct.value = p;
    form.value = { ...p };
    showAddModal.value = true;
};

const closeModal = () => {
    showAddModal.value = false;
    editingProduct.value = null;
    form.value = { name: '', brand: '', categoryId: null, sku: '', barcode: '', salePrice: 0, discountPercent: 0, costPriceDefault: 0, reorderLevel: 5, unit: 'pcs' };
};

const saveProduct = async () => {
    saving.value = true;
    try {
        if (editingProduct.value) {
            await productsService.update(editingProduct.value.id, form.value);
        } else {
            await productsService.create(form.value);
        }
        await fetchProducts();
        toast.success(t('common.success'));
        closeModal();
    } catch (err: any) {
        toast.error(t('products.saveError') + ": " + err.message);
    } finally {
        saving.value = false;
    }
};

const deleteProduct = async (id: number) => {
    const confirmed = await confirm(t('products.deleteConfirm'));
    if (!confirmed) return;
    try {
        await productsService.delete(id);
        toast.success(t('common.success'));
        await fetchProducts();
    } catch (err: any) {
        toast.error(t('products.deleteError') + ": " + err.message);
    }
};

const exportToExcel = () => {
    if (products.value.length === 0) return;
    const excelData = products.value.map(p => ({
        [t('products.columns.name')]: p.name,
        [t('products.brand')]: p.brand || '',
        [t('products.columns.category')]: p.category?.name || '',
        [t('products.sku')]: p.sku || '',
        [t('products.barcode')]: p.barcode || '',
        [t('products.salePrice')]: p.salePrice,
        [t('products.costPrice')]: p.costPriceDefault,
        [t('products.columns.stock')]: p.currentStock || 0
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Mahsulotlar");
    XLSX.writeFile(wb, `mahsulotlar_${new Date().toISOString().slice(0,10)}.xlsx`);
};
</script>
