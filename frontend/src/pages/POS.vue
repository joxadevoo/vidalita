<template>
  <div class="flex flex-col h-full gap-6 no-print">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ $t('pos.title') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('pos.subtitle') }}</p>
      </div>
      <!-- Invoice button after successful sale -->
      <button
        v-if="lastSaleId"
        @click="showInvoice = true"
        class="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all animate-pulse"
      >
        <DocumentTextIcon class="h-5 w-5" />
        {{ $t('invoice.viewInvoice') }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
      <!-- Product Selection -->
      <div class="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
        <div class="sticky top-0 z-20 glass rounded-full p-1 border-white/40 dark:border-white/10 shadow-lg">
            <div class="relative flex items-center">
              <MagnifyingGlassIcon class="absolute left-4 h-5 w-5 text-gray-400 pointer-events-none" />
              <input 
                  v-model="searchTerm" 
                  type="text" 
                  :placeholder="$t('pos.searchProduct')" 
                  class="w-full rounded-full h-12 pl-12 pr-4 text-sm bg-white/40 dark:bg-white/5 border-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 backdrop-blur-sm transition"
                  ref="searchInput"
              />
            </div>
        </div>
        
        <div class="flex-1 overflow-y-auto pr-2 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 custom-scrollbar">
            <div 
                v-for="product in filteredProducts" 
                :key="product.id"
                @click="addToCart(product)"
                class="glass group relative flex flex-col rounded-2xl p-4 shadow-lg border-white/40 dark:border-white/10 transition-all duration-300 hover:border-sky-400/50 hover:shadow-xl hover:scale-[1.03] active:scale-98 cursor-pointer transform backdrop-blur-md"
            >
                <div v-if="product.imageUrl" class="aspect-square mb-3 overflow-hidden rounded-xl border border-white/20 dark:border-white/5 bg-white/50 dark:bg-black/20">
                    <img :src="product.imageUrl" class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div v-else class="aspect-square mb-3 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-sky-900/20 dark:to-indigo-900/20 text-white/80 dark:text-sky-400 text-lg font-black tracking-[0.2em] uppercase shadow-inner">
                    Vidalita
                </div>
                
                <h4 class="text-sm font-black text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight uppercase tracking-tight">{{ product.name }}</h4>
                <div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1">{{ product.brand }}</div>
                <div class="mt-auto pt-4 flex items-center justify-between">
                    <span class="text-sm font-black text-sky-600 dark:text-sky-400">{{ formatCurrency(product.salePrice) }}</span>
                    <span v-if="product.currentStock <= 0" class="text-[9px] font-black uppercase bg-red-500/15 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">{{ $t('pos.outOfStock') }}</span>
                    <span v-else class="text-[10px] font-bold text-gray-400 dark:text-gray-500">{{ product.currentStock }} {{ $t('products.unit') }}</span>
                </div>
            </div>
        </div>
      </div>

      <!-- Cart & Checkout -->
      <div class="glass flex flex-col overflow-hidden rounded-2xl shadow-xl border-white/40 dark:border-white/10">
        <div class="p-6">
            <h3 class="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2 uppercase tracking-tight">
                <ShoppingCartIcon class="h-6 w-6 text-sky-600 dark:text-sky-400" />
                {{ $t('pos.cart') }}
            </h3>
        </div>

        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 italic opacity-60">
                <ShoppingCartIcon class="h-12 w-12 mb-2 opacity-10" />
                {{ $t('pos.noItems') }}
            </div>
            <TransitionGroup 
                name="cart-list" 
                tag="div" 
                class="space-y-4"
            >
                <div v-for="item in cart" :key="item.id" class="flex items-center justify-between rounded-2xl p-4 bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5 shadow-sm transition-all duration-300 hover:shadow-md backdrop-blur-md">
                    <div class="flex-1">
                        <div class="font-black text-sm text-gray-900 dark:text-gray-100 leading-tight uppercase tracking-tight">{{ item.name }}</div>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400">{{ formatCurrency(item.finalPrice) }} × {{ item.qty }}</span>
                            <span v-if="item.discountPercent > 0" class="inline-flex items-center rounded-full bg-green-500/15 border border-green-500/20 px-2 py-0.5 text-[9px] font-black text-green-600 dark:text-green-400">
                                -{{ item.discountPercent }}%
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 ml-4">
                        <div class="flex items-center bg-white/40 dark:bg-black/20 rounded-full p-1 border border-white/60 dark:border-white/5 h-9">
                            <button @click="updateQty(item.id, -1)" class="h-7 w-7 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 shadow-sm hover:bg-gray-50 active:scale-90 transition-all flex items-center justify-center text-sm font-black">−</button>
                            <span class="text-sm font-black w-8 text-center text-gray-900 dark:text-gray-100">{{ item.qty }}</span>
                            <button @click="updateQty(item.id, +1)" class="h-7 w-7 rounded-full bg-sky-600 text-white shadow-md hover:bg-sky-500 active:scale-90 transition-all flex items-center justify-center text-sm font-black">+</button>
                        </div>
                        <button @click="removeFromCart(item.id)" class="p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all">
                          <TrashIcon class="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </TransitionGroup>
        </div>

        <div class="p-6 space-y-4">
            <!-- Customer search (optional) -->
            <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('pos.customer') }}</label>
                <select v-model="selectedMemberId" class="input h-11 w-full text-sm rounded-full">
                    <option :value="null">{{ $t('pos.customerSelectPlaceholder') }}</option>
                    <option v-for="m in members" :key="m.id" :value="m.id">{{ m.fullName }}</option>
                </select>
                <input
                    v-model="customerName"
                    type="text"
                    :placeholder="$t('pos.customerNamePlaceholder')"
                    class="input h-11 w-full text-sm rounded-full"
                />
            </div>
            
            <!-- Manual Discount -->
            <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('pos.additionalDiscount') }}</label>
                <div class="relative flex items-center">
                    <input
                        v-model.number="manualDiscountPercent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        class="input h-11 w-full text-sm pr-10 font-bold rounded-full"
                        :placeholder="$t('pos.discountPlaceholder')"
                    />
                    <span class="absolute right-4 text-sm font-black text-gray-400">%</span>
                </div>
            </div>
            
            <!-- Payment Method -->
            <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('pos.paymentMethod') }}</label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button 
                          @click="paymentMethod = 'CASH'" 
                          :class="paymentMethod === 'CASH' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25 ring-2 ring-sky-400/20' : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-white/40 dark:border-white/10 opacity-70 hover:opacity-100'"
                          class="px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                      >{{ $t('pos.cash') }}</button>
                      <button 
                          @click="paymentMethod = 'UZCARD'" 
                          :class="paymentMethod === 'UZCARD' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-2 ring-blue-400/20' : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-white/40 dark:border-white/10 opacity-70 hover:opacity-100'"
                          class="px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                      >{{ $t('pos.uzcard') }}</button>
                      <button 
                          @click="paymentMethod = 'HUMO'" 
                          :class="paymentMethod === 'HUMO' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25 ring-2 ring-orange-400/20' : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-white/40 dark:border-white/10 opacity-70 hover:opacity-100'"
                          class="px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                      >{{ $t('pos.humo') }}</button>
                      <button 
                          @click="paymentMethod = 'VISA'" 
                          :class="paymentMethod === 'VISA' ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-700/25 ring-2 ring-indigo-400/20' : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-white/40 dark:border-white/10 opacity-70 hover:opacity-100'"
                          class="px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                      >{{ $t('pos.visa') }}</button>
                      <button 
                          @click="paymentMethod = 'CLICK'" 
                          :class="paymentMethod === 'CLICK' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 ring-2 ring-sky-400/20' : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-white/40 dark:border-white/10 opacity-70 hover:opacity-100'"
                          class="px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                      >{{ $t('pos.click') }}</button>
                      <button 
                          @click="paymentMethod = 'PAYME'" 
                          :class="paymentMethod === 'PAYME' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25 ring-2 ring-teal-400/20' : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-white/40 dark:border-white/10 opacity-70 hover:opacity-100'"
                          class="px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                      >{{ $t('pos.payme') }}</button>
                      <button 
                          @click="paymentMethod = 'MIXED'" 
                          :class="paymentMethod === 'MIXED' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 ring-2 ring-purple-400/20' : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-white/40 dark:border-white/10 opacity-70 hover:opacity-100'"
                          class="px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                      >{{ $t('pos.mixed') }}</button>
                      <button 
                          @click="paymentMethod = 'DEBT'" 
                          :class="paymentMethod === 'DEBT' ? 'bg-red-500 text-white shadow-lg shadow-red-500/25 ring-2 ring-red-400/20' : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-white/40 dark:border-white/10 opacity-70 hover:opacity-100'"
                          class="px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                      >{{ $t('pos.debt') }}</button>
                  </div>
            </div>

            <!-- Split Payment Details -->
            <div v-if="paymentMethod === 'MIXED'" class="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                  <div class="space-y-1.5">
                      <label class="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase px-1">{{ $t('pos.cashAmount') }}</label>
                      <input v-model.number="cashAmount" type="number" class="input h-10 w-full text-sm font-black rounded-full" @input="updateSplit('CASH')" />
                  </div>
                  <div class="space-y-1.5">
                      <label class="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase px-1">{{ $t('pos.cardAmount') }}</label>
                      <input v-model.number="cardAmount" type="number" class="input h-10 w-full text-sm font-black rounded-full" @input="updateSplit('CARD')" />
                  </div>
              </div>
              <div v-if="paymentMethod === 'DEBT'" class="animate-in fade-in slide-in-from-top-2 space-y-1.5">
                  <label class="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase px-1">{{ $t('pos.dueDate') }}</label>
                  <input v-model="dueDate" type="date" class="input h-10 w-full text-sm rounded-full" />
              </div>

            <!-- Total Section -->
            <div class="space-y-2 pt-4 border-t border-white/20 dark:border-white/5">
                <div v-if="manualDiscountPercent > 0" class="flex justify-between items-center text-xs font-bold text-gray-500">
                    <span>{{ $t('pos.subtotal') }}:</span>
                    <span>{{ formatCurrency(cartSubtotal) }}</span>
                </div>
                <div v-if="manualDiscountPercent > 0" class="flex justify-between items-center text-xs font-black text-green-600">
                    <span>{{ $t('pos.discount') }} (-{{ manualDiscountPercent }}%):</span>
                    <span>-{{ formatCurrency(cartSubtotal - cartTotal) }}</span>
                </div>
                <div class="flex justify-between items-center pt-2">
                    <span class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{{ $t('pos.total') }}:</span>
                    <span class="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">{{ formatCurrency(cartTotal) }} <span class="text-xs font-bold ml-1">SO'M</span></span>
                </div>
            </div>

            <button 
                @click="checkout" 
                :disabled="cart.length === 0 || processing"
                class="w-full rounded-full bg-sky-600 py-3.5 text-center text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-sky-600/30 hover:bg-sky-500 hover:-translate-y-0.5 disabled:bg-gray-400/20 disabled:text-gray-400 disabled:shadow-none transition-all active:scale-[0.98] mt-4"
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
import { 
  DocumentTextIcon, 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  TrashIcon 
} from '@heroicons/vue/24/outline';

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
const paymentMethod = ref<'CASH' | 'CARD' | 'MIXED' | 'DEBT' | 'UZCARD' | 'HUMO' | 'VISA' | 'CLICK' | 'PAYME'>('CASH');
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
            cardAmount: paymentMethod.value === 'MIXED' ? cardAmount.value : (['CARD', 'UZCARD', 'HUMO', 'VISA', 'CLICK', 'PAYME'].includes(paymentMethod.value) ? cartTotal.value : 0),
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

<style scoped>
.input {
  width: 100%;
  border-radius: 9999px;
  border: 1px solid rgba(255,255,255,0.45);
  background: rgba(255,255,255,0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  color: #111827;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 3px rgba(0,0,0,0.08);
  outline: none;
}

.input:focus {
  outline: none;
  border-color: rgba(14, 165, 233, 0.5);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
}

:global(.dark) .input {
  background: #28282829 !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
  color: #e2e8f0;
  box-shadow: none;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

:global(.dark) .input::placeholder { color: #475569; }

:global(.dark) .input:focus {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

/* Fix for Select in Dark Mode */
:global(.dark) select option {
  background-color: #1e293b;
  color: #e2e8f0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(155, 155, 155, 0.4);
  border-radius: 20px;
}
</style>






