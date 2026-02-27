<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('products.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('products.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50" @click="fetchProducts">{{ $t('common.refresh') }}</button>
        <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1" @click="exportToExcel">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            {{ $t('common.exportExcel') }}
        </button>
        <button class="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500" @click="showAddModal = true">{{ $t('products.newProduct') }}</button>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

    <div class="sticky top-0 z-20 grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3">
      <input v-model="searchTerm" type="text" :placeholder="$t('products.searchPlaceholder')" class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
      <select v-model="categoryFilter" class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none">
        <option value="all">{{ $t('products.allCategories') }}</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      <div class="flex items-center justify-end text-sm text-gray-500">
        {{ $t('common.total') }}: <span class="ml-1 font-semibold text-gray-700">{{ filteredProducts.length }}</span>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div v-if="loading" class="p-8 text-center">{{ $t('common.loading') }}</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('products.columns.name') }}</th>

              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('products.columns.price') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('products.columns.stock') }}</th>
              <th class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">{{ $t('products.columns.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-gray-50">
              <td class="px-3 py-4 text-sm font-medium text-gray-900">
                <div class="flex items-center gap-3">
                  <div v-if="product.imageUrl" class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-100">
                    <img :src="product.imageUrl" class="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div class="font-bold">{{ product.name }}</div>
                    <div class="text-xs text-gray-500">{{ product.brand }}</div>
                  </div>
                </div>
              </td>

              <td class="px-3 py-4 text-sm text-gray-900 font-semibold">{{ formatCurrency(product.salePrice) }}</td>
              <td class="px-3 py-4 text-sm">
                <span :class="product.currentStock <= product.reorderLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {{ product.currentStock }} {{ product.unit }}
                </span>
                <div v-if="product.currentStock <= product.reorderLevel" class="text-[10px] text-red-500 mt-0.5">{{ $t('products.lowStock') }}</div>
              </td>
              <td class="px-3 py-4 text-right text-sm font-medium space-x-2">
                <button @click="editProduct(product)" class="text-sky-600 hover:text-sky-900">{{ $t('common.edit') }}</button>
                <button @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-900">{{ $t('common.delete') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal (Simplified) -->
    <div v-if="showAddModal" class="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl z-[151]">
            <h3 class="text-lg font-bold mb-4">{{ editingProduct ? $t('products.editProduct') : $t('products.addProduct') }}</h3>
            <div class="grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('products.columns.name') }}</label>
                    <input v-model="form.name" type="text" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('products.brand') }}</label>
                    <input v-model="form.brand" type="text" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('products.columns.category') }}</label>
                    <select v-model="form.categoryId" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none">
                        <option :value="null">{{ $t('products.allCategories') }}</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('products.sku') }}</label>
                    <input v-model="form.sku" type="text" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('products.barcode') }}</label>
                    <input v-model="form.barcode" type="text" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>

                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('products.salePrice') }}</label>
                    <input v-model.number="form.salePrice" type="number" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('products.costPrice') }}</label>
                    <input v-model.number="form.costPriceDefault" type="number" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>
                
                <!-- Discount Percent Field -->
                <div class="sm:col-span-2">
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('products.discountPercent') }}</label>
                    <div class="flex items-center gap-2">
                        <input
                            v-model.number="form.discountPercent"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            class="mt-1 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none"
                            :placeholder="$t('products.discountPlaceholder')"
                        />
                        <span class="text-sm text-gray-500 mt-1">%</span>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">{{ $t('products.discountHint') }}</p>
                </div>

                <!-- Discounted Price Display (if discount > 0) -->
                <div v-if="form.discountPercent > 0" class="sm:col-span-2 rounded-lg bg-green-50 p-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-green-700">{{ $t('products.originalPrice') }}:</span>
                        <span class="text-sm text-green-600 line-through">{{ formatCurrency(form.salePrice || 0) }}</span>
                    </div>
                    <div class="mt-2 flex items-center justify-between">
                        <span class="text-sm font-semibold text-green-900">{{ $t('products.discountedPrice') }}:</span>
                        <span class="text-lg font-bold text-green-600">{{ formatCurrency(discountedPrice) }}</span>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('products.reorderLevel') }}</label>
                    <input v-model.number="form.reorderLevel" type="number" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none" />
                </div>

            </div>
            <div class="mt-8 flex justify-end gap-3">
                <button @click="closeModal" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">{{ $t('common.cancel') }}</button>
                <button @click="saveProduct" class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500" :disabled="saving">
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
