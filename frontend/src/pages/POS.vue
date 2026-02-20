<template>
  <div class="flex flex-col h-full gap-6 no-print">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('pos.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('pos.subtitle') }}</p>
      </div>
      <!-- Invoice button after successful sale -->
      <button
        v-if="lastSaleId"
        @click="showInvoice = true"
        class="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition-all animate-pulse"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {{ $t('invoice.viewInvoice') }}
      </button>
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
                <div v-else class="aspect-square mb-2 flex items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 text-lg font-semibold tracking-[0.2em] uppercase">
                    Vidalita
                </div>
                
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
            <div v-for="item in cart" :key="item.id" class="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                <div class="flex-1">
                    <div class="font-semibold text-sm text-gray-900">{{ item.name }}</div>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs text-gray-500">{{ formatCurrency(item.finalPrice) }} × {{ item.qty }}</span>
                        <span v-if="item.discountPercent > 0" class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            -{{ item.discountPercent }}%
                        </span>
                    </div>
                    <div v-if="item.discountPercent > 0" class="text-[10px] text-gray-400 line-through">
                        {{ formatCurrency(item.salePrice) }}
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button @click="updateQty(item.id, -1)" class="h-7 w-7 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-lg font-bold">−</button>
                    <span class="text-sm font-bold w-8 text-center">{{ item.qty }}</span>
                    <button @click="updateQty(item.id, +1)" class="h-7 w-7 rounded-full bg-sky-600 text-white hover:bg-sky-500 flex items-center justify-center text-lg font-bold">+</button>
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
            
            <!-- Manual Discount -->
            <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('pos.additionalDiscount') }}</label>
                <div class="mt-1 flex items-center gap-2">
                    <input
                        v-model.number="manualDiscountPercent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none bg-white"
                        :placeholder="$t('pos.discountPlaceholder')"
                    />
                    <span class="text-sm font-semibold text-gray-500">%</span>
                </div>
                <p class="mt-1 text-[10px] text-gray-400">{{ $t('pos.discountHint') }}</p>
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

            <!-- Total Section -->
            <div class="space-y-2 pt-2 border-t border-gray-200">
                <div v-if="manualDiscountPercent > 0" class="flex justify-between items-center text-sm text-gray-600">
                    <span>{{ $t('pos.subtotal') }}:</span>
                    <span>{{ formatCurrency(cartSubtotal) }}</span>
                </div>
                <div v-if="manualDiscountPercent > 0" class="flex justify-between items-center text-sm text-green-600">
                    <span>{{ $t('pos.discount') }} (-{{ manualDiscountPercent }}%):</span>
                    <span>-{{ formatCurrency(cartSubtotal - cartTotal) }}</span>
                </div>
                <div class="flex justify-between items-center pt-2">
                    <span class="text-lg font-medium text-gray-600">{{ $t('pos.total') }}:</span>
                    <span class="text-2xl font-black text-gray-900">{{ formatCurrency(cartTotal) }}</span>
                </div>
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

  <!-- Invoice Modal -->
  <InvoiceModal
    :show="showInvoice"
    :sale-id="lastSaleId"
    @close="showInvoice = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { productsService, membersService, salesService, cashSessionsService } from '../services/supabaseService';
import { useI18n } from 'vue-i18n';
import InvoiceModal from '../components/InvoiceModal.vue';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const searchTerm = ref('');
const products = ref<any[]>([]);
const members = ref<any[]>([]);
const cart = ref<any[]>([]);
const selectedMemberId = ref<number | null>(null);
const customerName = ref('');
const paymentMethod = ref<'CASH' | 'CARD'>('CASH');
const manualDiscountPercent = ref(0);  // Manual discount input
const processing = ref(false);

// Invoice state
const showInvoice = ref(false);
const lastSaleId = ref<number | null>(null);
const currentSession = ref<any>(null);

const fetchData = async () => {
    try {
        products.value = await productsService.getAll();
        members.value = await membersService.getAll();
        currentSession.value = await cashSessionsService.getCurrentSession();
    } catch (err) {
        console.error(err);
    }
};

onMounted(fetchData);

const filteredProducts = computed(() => {
    const s = searchTerm.value.toLowerCase();
    return products.value.filter(p => !s || p.name.toLowerCase().includes(s) || (p.barcode && p.barcode.includes(s)));
});

// Calculate discounted price
const getDiscountedPrice = (salePrice: number, discountPercent: number) => {
    if (!discountPercent || discountPercent === 0) return salePrice;
    const discount = (salePrice * discountPercent) / 100;
    return salePrice - discount;
};

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
        const discountedPrice = getDiscountedPrice(product.salePrice, product.discountPercent || 0);
        cart.value.push({
            id: product.id,
            name: product.name,
            salePrice: product.salePrice,
            discountPercent: product.discountPercent || 0,
            finalPrice: discountedPrice,
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


const cartSubtotal = computed(() => cart.value.reduce((sum, i) => sum + (i.finalPrice * i.qty), 0));
const cartTotal = computed(() => {
    const subtotal = cartSubtotal.value;
    if (manualDiscountPercent.value > 0) {
        const discount = (subtotal * manualDiscountPercent.value) / 100;
        return subtotal - discount;
    }
    return subtotal;
});

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(t('locale') || 'uz-UZ').format(val);
};

const isSessionOpen = computed(() => !!currentSession.value);

const checkout = async () => {
    if (cart.value.length === 0) return;

    if (!isSessionOpen.value) {
        if (confirm(t('cashier.noActiveSession') + ". " + t('cashier.openSession') + "?")) {
            router.push('/cashier');
        }
        return;
    }

    if (!selectedMemberId.value && !customerName.value.trim()) {
        alert(t('pos.customerRequired'));
        return;
    }
    processing.value = true;
    try {
        const sale = await salesService.createSale({
            memberId: selectedMemberId.value,
            customerName: customerName.value.trim(),
            totalAmount: cartTotal.value,
            paymentMethod: paymentMethod.value,
            cashSessionId: currentSession.value.id,
            items: cart.value.map(i => ({
                productId: i.id,
                qty: i.qty,
                price: i.salePrice,
                costPrice: i.costPrice
            }))
        });

        // Save last sale ID for invoice
        lastSaleId.value = sale.id;

        // Reset cart
        cart.value = [];
        selectedMemberId.value = null;
        customerName.value = '';
        manualDiscountPercent.value = 0;
        await fetchData();

        // Auto-show invoice
        showInvoice.value = true;
    } catch (err: any) {
        alert(t('common.error') + ": " + err.message);
    } finally {
        processing.value = false;
    }
};
</script>
