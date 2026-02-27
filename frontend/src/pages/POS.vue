<template>
  <div class="flex flex-col h-full gap-6 no-print">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('pos.title') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('pos.subtitle') }}</p>
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
                class="w-full rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm focus:ring-2 focus:ring-sky-400 focus:outline-none bg-white dark:bg-gray-900 dark:text-white"
                ref="searchInput"
            />
        </div>
        
        <div class="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            <div 
                v-for="product in filteredProducts" 
                :key="product.id"
                @click="addToCart(product)"
                class="group relative flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-sm transition-all duration-300 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer h-fit"
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
      <div class="rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col h-full overflow-hidden">
        <div class="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg class="h-6 w-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {{ $t('pos.cart') }}
            </h3>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
            <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 italic">
                {{ $t('pos.noItems') }}
            </div>
            <TransitionGroup 
                name="cart-list" 
                tag="div" 
                class="space-y-4"
            >
                <div v-for="item in cart" :key="item.id" class="flex items-center justify-between border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-gray-800/50 shadow-sm transition-all duration-300">
                    <div class="flex-1">
                        <div class="font-semibold text-sm text-gray-900 dark:text-white">{{ item.name }}</div>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs text-gray-500">{{ formatCurrency(item.finalPrice) }} × {{ item.qty }}</span>
                            <span v-if="item.discountPercent > 0" class="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-400">
                                -{{ item.discountPercent }}%
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 ml-4">
                        <div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                            <button @click="updateQty(item.id, -1)" class="h-6 w-6 rounded-full bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center text-sm font-bold">−</button>
                            <span class="text-sm font-bold w-7 text-center dark:text-white">{{ item.qty }}</span>
                            <button @click="updateQty(item.id, +1)" class="h-6 w-6 rounded-full bg-sky-600 text-white shadow-sm hover:bg-sky-500 active:scale-95 transition-all flex items-center justify-center text-sm font-bold">+</button>
                        </div>
                        <button @click="removeFromCart(item.id)" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </TransitionGroup>
        </div>

        <div class="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 space-y-4">
            <!-- Customer search (optional) -->
            <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('pos.customer') }}</label>
                <select v-model="selectedMemberId" class="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none bg-white dark:bg-gray-900 dark:text-white">
                    <option :value="null">{{ $t('pos.customerSelectPlaceholder') }}</option>
                    <option v-for="m in members" :key="m.id" :value="m.id">{{ m.fullName }}</option>
                </select>
                <input
                    v-model="customerName"
                    type="text"
                    :placeholder="$t('pos.customerNamePlaceholder')"
                    class="mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none bg-white dark:bg-gray-900 dark:text-white"
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
                        class="flex-1 rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none bg-white dark:bg-gray-900 dark:text-white"
                        :placeholder="$t('pos.discountPlaceholder')"
                    />
                    <span class="text-sm font-semibold text-gray-500">%</span>
                </div>
                <p class="mt-1 text-[10px] text-gray-400">{{ $t('pos.discountHint') }}</p>
            </div>
            
            <!-- Payment Method -->
            <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('pos.paymentMethod') }}</label>
                <div class="mt-1 grid grid-cols-2 lg:grid-cols-4 gap-2">
                      <button 
                          @click="paymentMethod = 'CASH'" 
                          :class="paymentMethod === 'CASH' ? 'bg-sky-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'"
                          class="px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                      >{{ $t('pos.cash') }}</button>
                      <button 
                          @click="paymentMethod = 'CARD'" 
                          :class="paymentMethod === 'CARD' ? 'bg-sky-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'"
                          class="px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                      >{{ $t('pos.card') }}</button>
                      <button 
                          @click="paymentMethod = 'MIXED'" 
                          :class="paymentMethod === 'MIXED' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'"
                          class="px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                      >{{ $t('pos.mixed') }}</button>
                      <button 
                          @click="paymentMethod = 'DEBT'" 
                          :class="paymentMethod === 'DEBT' ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'"
                          class="px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                      >{{ $t('pos.debt') }}</button>
                  </div>
            </div>

            <!-- Split Payment Details -->
            <div v-if="paymentMethod === 'MIXED'" class="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                      <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('pos.cashAmount') }}</label>
                      <input
                          v-model.number="cashAmount"
                          type="number"
                          class="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none bg-white dark:bg-gray-900 dark:text-white font-bold"
                          @input="updateSplit('CASH')"
                      />
                  </div>
                  <div>
                      <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('pos.cardAmount') }}</label>
                      <input
                          v-model.number="cardAmount"
                          type="number"
                          class="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none bg-white dark:bg-gray-900 dark:text-white font-bold"
                          @input="updateSplit('CARD')"
                      />
                  </div>
              </div>
              <div v-if="paymentMethod === 'DEBT'" class="animate-in fade-in slide-in-from-top-2">
                  <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('pos.dueDate') }}</label>
                  <input
                      v-model="dueDate"
                      type="date"
                      class="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-400 focus:outline-none bg-white dark:bg-gray-900 dark:text-white"
                  />
              </div>

            <!-- Total Section -->
            <div class="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                <div v-if="manualDiscountPercent > 0" class="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                    <span>{{ $t('pos.subtotal') }}:</span>
                    <span>{{ formatCurrency(cartSubtotal) }}</span>
                </div>
                <div v-if="manualDiscountPercent > 0" class="flex justify-between items-center text-sm text-green-600 dark:text-green-400">
                    <span>{{ $t('pos.discount') }} (-{{ manualDiscountPercent }}%):</span>
                    <span>-{{ formatCurrency(cartSubtotal - cartTotal) }}</span>
                </div>
                <div class="flex justify-between items-center pt-2">
                    <span class="text-lg font-medium text-gray-600 dark:text-gray-400">{{ $t('pos.total') }}:</span>
                    <span class="text-2xl font-black text-gray-900 dark:text-white">{{ formatCurrency(cartTotal) }}</span>
                </div>
            </div>

            <button 
                @click="checkout" 
                :disabled="cart.length === 0 || processing"
                class="w-full rounded-xl bg-sky-600 py-4 text-center font-bold text-white shadow-lg hover:bg-sky-500 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:shadow-none transition-all active:scale-[0.98]"
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
import { ref, computed, onMounted, watch } from 'vue';
import { productsService, membersService, salesService, cashSessionsService } from '../services/supabaseService';
import { useI18n } from 'vue-i18n';
import InvoiceModal from '../components/InvoiceModal.vue';
import { useRouter } from 'vue-router';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const { confirm } = useConfirm();

const searchTerm = ref('');
const products = ref<any[]>([]);
const members = ref<any[]>([]);
const cart = ref<any[]>([]);
const selectedMemberId = ref<number | null>(null);
const customerName = ref('');
const paymentMethod = ref<'CASH' | 'CARD' | 'MIXED' | 'DEBT'>('CASH');
const dueDate = ref('');
const cashAmount = ref(0);
const cardAmount = ref(0);
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
        toast.warning(t('pos.errorOutOfStock'));
        return;
    }
    const existing = cart.value.find(i => i.id === product.id);
    if (existing) {
        if (existing.qty < product.currentStock) {
            existing.qty++;
        } else {
            toast.warning(t('pos.errorNoMoreStock'));
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
        toast.warning(t('pos.errorNotEnoughStock'));
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

const updateSplit = (source: 'CASH' | 'CARD') => {
    const total = cartTotal.value;
    if (source === 'CASH') {
        cardAmount.value = Math.max(0, total - cashAmount.value);
    } else {
        cashAmount.value = Math.max(0, total - cardAmount.value);
    }
};

watch(paymentMethod, (newMethod) => {
    if (newMethod === 'MIXED') {
        cashAmount.value = cartTotal.value;
        cardAmount.value = 0;
    }
});

watch(cartTotal, (newTotal) => {
    if (paymentMethod.value === 'MIXED') {
        cashAmount.value = newTotal;
        cardAmount.value = 0;
    }
});

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(t('locale') || 'uz-UZ').format(val);
};

const isSessionOpen = computed(() => !!currentSession.value);

const checkout = async () => {
    if (cart.value.length === 0) return;

    if (!isSessionOpen.value) {
        const confirmed = await confirm(t('cashier.noActiveSession') + ". " + t('cashier.openSession') + "?");
        if (confirmed) {
            router.push('/cashier');
        }
        return;
    }

    if (!selectedMemberId.value && !customerName.value.trim()) {
        toast.warning(t('pos.customerRequired'));
        return;
    }

    if (paymentMethod.value === 'DEBT' && !selectedMemberId.value) {
        toast.warning(t('pos.memberRequiredForDebt', 'Qarz uchun a\'zo tanlanishi shart'));
        return;
    }
    processing.value = true;
    try {
        const sale = await salesService.createSale({
            memberId: selectedMemberId.value,
            customerName: customerName.value.trim(),
            totalAmount: cartTotal.value,
            cashAmount: paymentMethod.value === 'MIXED' ? cashAmount.value : (paymentMethod.value === 'CASH' ? cartTotal.value : 0),
            cardAmount: paymentMethod.value === 'MIXED' ? cardAmount.value : (paymentMethod.value === 'CARD' ? cartTotal.value : 0),
            paymentMethod: paymentMethod.value,
            dueDate: paymentMethod.value === 'DEBT' ? dueDate.value : null,
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

        toast.success(t('common.success'));
        // Auto-show invoice
        showInvoice.value = true;
    } catch (err: any) {
        toast.error(t('common.error') + ": " + err.message);
    } finally {
        processing.value = false;
    }
};
</script>






