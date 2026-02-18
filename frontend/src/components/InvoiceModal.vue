<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[200] overflow-y-auto bg-black/70 backdrop-blur-sm p-4"
      @click.self="$emit('close')"
    >
      <!-- Modal container -->
      <div class="relative w-full max-w-4xl mx-auto my-4 rounded-2xl bg-black/80 shadow-2xl overflow-hidden border border-white/10">

        <!-- Toolbar -->
        <div class="no-print flex items-center justify-between bg-gray-800 px-5 py-3">
          <span class="text-sm font-semibold text-white">{{ $t('invoice.title') }}</span>
          <div class="flex items-center gap-2">
            <button
              @click="downloadPdf"
              :disabled="pdfLoading"
              class="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 px-3 py-1.5 text-xs font-bold text-white transition-all"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {{ pdfLoading ? '...' : $t('invoice.downloadPdf') }}
            </button>
            <button
              @click="printInvoice"
              class="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-bold text-white transition-all"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {{ $t('invoice.print') }}
            </button>
            <button
              @click="$emit('close')"
              class="flex items-center justify-center h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-24">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500"></div>
        </div>

        <!-- Invoice Content -->
        <!-- Simple Minimalist Style -->
        <div v-else-if="sale" id="invoice-printable" class="bg-white w-[800px] mx-auto text-left py-8 px-10 font-serif flex flex-col shadow-sm border border-gray-100">

          <!-- Header Section: Just Text -->
          <div class="flex justify-between items-start mb-8 pb-4 border-b border-black">
            <div>
              <h1 class="text-xl font-bold text-black uppercase tracking-tight">TURK GLOBAL CENTER</h1>
              <p class="text-[10px] text-gray-600">Termez, Burkhoniddin Marginoniy St, 29G</p>
              <p class="text-[10px] text-gray-600">Tel: +998 78 228 28 28</p>
            </div>
            <div class="text-right">
              <h2 class="text-xl font-bold text-black uppercase">{{ $t('invoice.title') }}</h2>
              <p class="text-sm font-bold text-black">№: {{ shortId }}</p>
              <p class="text-[10px] text-gray-400 font-bold uppercase">{{ formatDate(sale.createdAt) }}</p>
            </div>
          </div>

          <!-- Document Table 1: Meta Info (Minimalist) -->
          <table class="w-full border-collapse border border-black mb-6 text-sm">
            <tbody>
              <tr>
                <td class="border border-black px-3 py-2 bg-gray-50 w-1/4 font-bold uppercase text-[10px] tracking-tight">{{ $t('invoice.customer') }}</td>
                <td class="border border-black px-3 py-2 font-bold">{{ customerName }}</td>
              </tr>
              <tr>
                <td class="border border-black px-3 py-2 bg-gray-50 font-bold uppercase text-[10px] tracking-tight">{{ $t('invoice.paymentMethod') }}</td>
                <td class="border border-black px-3 py-2">{{ sale.paymentMethod === 'CASH' ? $t('pos.cash') : $t('pos.card') }}</td>
              </tr>
              <tr>
                <td class="border border-black px-3 py-2 bg-gray-50 font-bold uppercase text-[10px] tracking-tight">Status</td>
                <td class="border border-black px-3 py-2 font-bold uppercase text-[10px]">Paid / To'langan</td>
              </tr>
            </tbody>
          </table>

          <!-- Document Table 2: Sale Items -->
          <div class="mb-6">
            <p class="text-[10px] font-bold uppercase mb-2">{{ $t('invoice.items') }}:</p>
            <table class="w-full border-collapse border border-black text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-black px-2 py-2 text-left w-10">№</th>
                  <th class="border border-black px-2 py-2 text-left">{{ $t('invoice.product') }}</th>
                  <th class="border border-black px-2 py-2 text-center w-20">{{ $t('invoice.qty') }}</th>
                  <th class="border border-black px-2 py-2 text-right w-32">{{ $t('invoice.price') }}</th>
                  <th class="border border-black px-2 py-2 text-right w-32">{{ $t('invoice.lineTotal') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in saleItems" :key="item.id">
                  <td class="border border-black px-2 py-2 text-center">{{ Number(idx) + 1 }}</td>
                  <td class="border border-black px-2 py-2 font-bold">{{ item.product?.name }}</td>
                  <td class="border border-black px-2 py-2 text-center font-bold">{{ item.qty }}</td>
                  <td class="border border-black px-2 py-2 text-right whitespace-nowrap">{{ formatCurrency(item.unitPrice) }}</td>
                  <td class="border border-black px-2 py-2 text-right font-bold whitespace-nowrap">{{ formatCurrency(item.lineTotal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals Section -->
          <div class="flex justify-end mb-10">
            <table class="w-64 border-collapse border border-black text-sm">
              <tbody>
                <tr>
                  <td class="border border-black px-3 py-2 bg-gray-50 font-bold uppercase text-[10px]">{{ $t('invoice.subtotal') }}</td>
                  <td class="border border-black px-3 py-2 text-right font-medium whitespace-nowrap">{{ formatCurrency(subtotal) }}</td>
                </tr>
                <tr v-if="discountAmount > 0">
                  <td class="border border-black px-3 py-2 bg-gray-50 font-bold uppercase text-red-600 text-[10px]">{{ $t('invoice.discount') }} (-)</td>
                  <td class="border border-black px-3 py-2 text-right font-bold text-red-600 whitespace-nowrap">-{{ formatCurrency(discountAmount) }}</td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="border border-black px-3 py-2 font-bold uppercase">{{ $t('invoice.total') || $t('pos.total') }}:</td>
                  <td class="border border-black px-3 py-2 text-right text-xl font-bold text-black whitespace-nowrap">{{ formatCurrency(sale.totalAmount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer: Minimal -->
          <div class="border-t border-gray-200 pt-6 text-center italic">
            <p class="text-sm font-bold text-black">{{ $t('invoice.thankYou') }}</p>
            <p class="text-[10px] text-gray-500 mt-1">{{ $t('invoice.returnPolicy') }}</p>
          </div>

        </div>

        <!-- Error state -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg class="h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>{{ $t('common.noData') }}</p>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { salesService } from '../services/supabaseService';
import { useI18n } from 'vue-i18n';


const { t } = useI18n();

const props = defineProps<{
  show: boolean;
  saleId: number | string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const sale = ref<any>(null);
const loading = ref(false);
const pdfLoading = ref(false);

// Load sale data when modal opens
watch(() => props.show, async (val) => {
  if (val && props.saleId) {
    loading.value = true;
    try {
      sale.value = await salesService.getById(props.saleId);
    } catch (err) {
      console.error('Invoice load error:', err);
      sale.value = null;
    } finally {
      loading.value = false;
    }
  } else if (!val) {
    sale.value = null;
  }
});

const saleItems = computed(() => {
  if (!sale.value?.items) return [];
  return sale.value.items;
});

const subtotal = computed(() => {
  return saleItems.value.reduce((sum: number, item: any) => sum + (Number(item.lineTotal) || 0), 0);
});

const discountAmount = computed(() => {
  if (!sale.value) return 0;
  // Agar DB dan kelgan chegirma 0 bo'lsa, farqni hisoblaymiz
  const dbDiscount = Number(sale.value.discountAmount) || 0;
  if (dbDiscount > 0) return dbDiscount;
  
  const diff = subtotal.value - (Number(sale.value.totalAmount) || 0);
  return diff > 0 ? diff : 0;
});

const customerName = computed(() => {
  if (!sale.value) return t('pos.customer');
  if (sale.value.member?.fullName) return sale.value.member.fullName;
  if (sale.value.notes) return sale.value.notes;
  return t('pos.customer');
});

const customerInitial = computed(() => {
  const name = customerName.value;
  return name ? name.charAt(0).toUpperCase() : 'M';
});

// UUID ning oxirgi 8 belgisi
const shortId = computed(() => {
  if (!sale.value?.id) return '--------';
  const id = String(sale.value.id);
  return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
});

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat(t('locale') || 'uz-UZ').format(val || 0)
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(t('locale') || 'uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const printInvoice = () => {
  window.print();
};

const downloadPdf = async () => {
  const el = document.getElementById('invoice-printable');
  if (!el) return;
  pdfLoading.value = true;

  try {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    const canvas = await html2canvas(el, {
      scale: 3, // Sifatni oshirish
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 800, // Qat'iy kenglik
      onclone: (clonedDoc) => {
        const elements = clonedDoc.querySelectorAll('*');
        elements.forEach((node) => {
          const htmlNode = node as HTMLElement;
          
          // 1. Oklch va boshqa muammoli o'zgaruvchilarni tozalash
          htmlNode.style.setProperty('--tw-bg-opacity', '1', 'important');
          htmlNode.style.setProperty('--tw-text-opacity', '1', 'important');
          htmlNode.style.setProperty('--tw-border-opacity', '1', 'important');
          
          // 2. Computed ranglarni olish va oklch bo'lsa HEX ga o'tkazish
          // Eslatma: html2canvas uchun ranglar RGB yoki HEX bo'lishi shart
          const style = window.getComputedStyle(htmlNode);
          
          if (style.color.includes('oklch')) htmlNode.style.color = '#000000';
          if (style.backgroundColor.includes('oklch')) {
            // Agar u bg-gray-50 yoki shunga o'xshash bo'lsa
            if (htmlNode.classList.contains('bg-gray-50')) htmlNode.style.backgroundColor = '#f9fafb';
            else if (htmlNode.classList.contains('bg-gray-100')) htmlNode.style.backgroundColor = '#f3f4f6';
            else htmlNode.style.backgroundColor = '#ffffff';
          }
          if (style.borderColor.includes('oklch')) htmlNode.style.borderColor = '#000000';

          // 3. Fontni Word uslubiga o'tkazish
          htmlNode.style.fontFamily = "'Times New Roman', Times, serif";
        });
        
        const printable = clonedDoc.getElementById('invoice-printable');
        if (printable) {
          printable.style.backgroundColor = '#ffffff';
          printable.style.color = '#000000';
          printable.style.padding = '40px';
          printable.style.width = '800px';
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    // Dinamik balandlik: A4 MM (210mm kenglik, balandlikni esa canvas nisbatiga qarab moslaymiz)
    const pdf = new jsPDF({ 
      orientation: 'portrait', 
      unit: 'mm', 
      format: [210, Math.max(297, (canvas.height * 210) / canvas.width)] 
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`tgc-faktura-${sale.value?.id || 'invoice'}.pdf`);
  } catch (err) {
    console.error('PDF error:', err);
    alert('PDF yaratishda xatolik. Iltimos, "Chop etish" tugmasidan foydalaning.');
  } finally {
    pdfLoading.value = false;
  }
};

</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #invoice-printable,
  #invoice-printable * {
    visibility: visible;
  }
  #invoice-printable {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    padding: 20px;
  }
  .no-print {
    display: none !important;
  }
}
</style>
