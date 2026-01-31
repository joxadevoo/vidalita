<template>
  <div class="flex flex-col h-full gap-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('pos.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('pos.subtitle') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
      <!-- Product Selection -->
      <div class="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
        <div class="sticky top-0 z-20">
            <input 
                v-model="searchTerm" 
                type="text" 
                :placeholder="$t('pos.searchProduct')" 
                class="w-full rounded-xl border border-gray-200 px-4 py-3 shadow-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
                ref="searchInput"
            />
        </div>
        
        <div class="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            <div 
                v-for="product in filteredProducts" 
                :key="product.id"
                @click="addToCart(product)"
                class="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-sky-400 hover:shadow-md cursor-pointer h-fit"
            >
                <div v-if="product.imageUrl" class="aspect-square mb-2 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    <img :src="product.imageUrl" class="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div v-else class="aspect-square mb-2 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 text-xs">{{ $t('pos.noImage') }}</div>
                
                <h4 class="text-sm font-semibold text-gray-900 line-clamp-2">{{ product.name }}</h4>
                <div class="text-[10px] text-gray-500">{{ product.brand }}</div>
                <div class="mt-2 flex items-center justify-between">
                    <span class="text-sm font-bold text-sky-600">{{ formatCurrency(product.salePrice) }}</span>
                    <span v-if="product.currentStock <= 0" class="text-[10px] bg-red-100 text-red-700 px-1 rounded">{{ $t('pos.outOfStock') }}</span>
                    <span v-else class="text-[10px] text-gray-400">{{ product.currentStock }} {{ $t('products.unit') }}</span>
                </div>
            </div>
        </div>
      </div>

      <!-- Cart & Checkout -->
      <div class="rounded-2xl bg-white shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden">
        <div class="p-6 border-b border-gray-100">
            <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg class="h-6 w-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {{ $t('pos.cart') }}
            </h3>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 italic">
                {{ $t('pos.noItems') }}
            </div>
            <div v-for="item in cart" :key="item.id" class="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div class="flex-1">
                    <div class="text-sm font-semibold text-gray-900 line-clamp-1">{{ item.name }}</div>
                    <div class="text-xs text-gray-500">{{ formatCurrency(item.salePrice) }}</div>
                </div>
                <div class="flex items-center gap-2">
                    <button @click="updateQty(item.id, -1)" class="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-600">-</button>
                    <span class="text-sm font-bold w-4 text-center">{{ item.qty }}</span>
                    <button @click="updateQty(item.id, 1)" class="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-600">+</button>
                </div>
                <div class="text-right">
                    <div class="text-sm font-bold text-gray-900">{{ formatCurrency(item.salePrice * item.qty) }}</div>
                    <button @click="removeFromCart(item.id)" class="text-[10px] text-red-500 hover:underline">{{ $t('common.delete') }}</button>
                </div>
            </div>
        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
            <!-- Customer search (optional) -->
            <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('pos.customer') }}</label>
                <select v-model="selectedMemberId" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none bg-white">
                    <option :value="null">{{ $t('pos.customerSelectPlaceholder') }}</option>
                    <option v-for="m in members" :key="m.id" :value="m.id">{{ m.fullName }}</option>
                </select>
                <input
                    v-model="customerName"
                    type="text"
                    :placeholder="$t('pos.customerNamePlaceholder')"
                    class="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none bg-white"
                />
            </div>
            
            <!-- Payment Method -->
            <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('pos.paymentMethod') }}</label>
                <div class="mt-1 grid grid-cols-2 gap-2">
                    <button 
                        @click="paymentMethod = 'CASH'" 
                        :class="paymentMethod === 'CASH' ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 border border-gray-200'"
                        class="px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                    >{{ $t('pos.cash') }}</button>
                    <button 
                        @click="paymentMethod = 'CARD'" 
                        :class="paymentMethod === 'CARD' ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 border border-gray-200'"
                        class="px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                    >{{ $t('pos.card') }}</button>
                </div>
            </div>

            <div class="flex justify-between items-center pt-2">
                <span class="text-lg font-medium text-gray-600">{{ $t('pos.total') }}:</span>
                <span class="text-2xl font-black text-gray-900">{{ formatCurrency(cartTotal) }}</span>
            </div>

            <button 
                @click="checkout" 
                :disabled="cart.length === 0 || processing"
                class="w-full rounded-xl bg-sky-600 py-4 text-center font-bold text-white shadow-lg hover:bg-sky-500 disabled:bg-gray-300 disabled:shadow-none transition-all"
            >
                {{ processing ? $t('pos.processing') : $t('pos.checkout') }}
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { productsService, membersService, salesService } from '../services/supabaseService';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const searchTerm = ref('');
const products = ref<any[]>([]);
const members = ref<any[]>([]);
const cart = ref<any[]>([]);
const selectedMemberId = ref<number | null>(null);
const customerName = ref('');
const paymentMethod = ref<'CASH' | 'CARD'>('CASH');
const processing = ref(false);

const fetchData = async () => {
    try {
        products.value = await productsService.getAll();
        members.value = await membersService.getAll();
    } catch (err) {
        console.error(err);
    }
};

onMounted(fetchData);

const filteredProducts = computed(() => {
    const s = searchTerm.value.toLowerCase();
    return products.value.filter(p => !s || p.name.toLowerCase().includes(s) || (p.barcode && p.barcode.includes(s)));
});

const addToCart = (product: any) => {
    if (product.currentStock <= 0) {
        alert(t('pos.errorOutOfStock'));
        return;
    }
    const existing = cart.value.find(i => i.id === product.id);
    if (existing) {
        if (existing.qty < product.currentStock) {
            existing.qty++;
        } else {
            alert(t('pos.errorNoMoreStock'));
        }
    } else {
        cart.value.push({
            id: product.id,
            name: product.name,
            salePrice: product.salePrice,
            costPrice: product.costPriceDefault,
            qty: 1
        });
    }
};

const updateQty = (id: number, delta: number) => {
    const item = cart.value.find(i => i.id === id);
    if (!item) return;
    const product = products.value.find(p => p.id === id);
    
    const newQty = item.qty + delta;
    if (newQty <= 0) {
        removeFromCart(id);
    } else if (newQty > product.currentStock) {
        alert(t('pos.errorNotEnoughStock'));
    } else {
        item.qty = newQty;
    }
};

const removeFromCart = (id: number) => {
    cart.value = cart.value.filter(i => i.id !== id);
};

const cartTotal = computed(() => cart.value.reduce((sum, i) => sum + (i.salePrice * i.qty), 0));

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
};

const checkout = async () => {
    if (cart.value.length === 0) return;
    if (!selectedMemberId.value && !customerName.value.trim()) {
        alert(t('pos.customerRequired'));
        return;
    }
    processing.value = true;
    try {
        await salesService.createSale({
            memberId: selectedMemberId.value,
            customerName: customerName.value.trim(),
            totalAmount: cartTotal.value,
            paymentMethod: paymentMethod.value,
            items: cart.value.map(i => ({
                productId: i.id,
                qty: i.qty,
                price: i.salePrice,
                costPrice: i.costPrice
            }))
        });
        alert(t('pos.success'));
        cart.value = [];
        selectedMemberId.value = null;
        customerName.value = '';
        await fetchData();
    } catch (err: any) {
        alert(t('common.error') + ": " + err.message);
    } finally {
        processing.value = false;
    }
};
</script>
