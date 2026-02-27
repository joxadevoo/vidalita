<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[200] overflow-y-auto bg-black/70 backdrop-blur-sm p-4 print:p-0 print:bg-transparent print:backdrop-blur-none"
      @click.self="$emit('close')"
    >
      <!-- Modal container -->
      <div class="relative w-full max-w-4xl mx-auto my-4 rounded-2xl bg-black/80 shadow-2xl overflow-hidden border border-white/10 print:my-0 print:bg-transparent print:border-none print:shadow-none">

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
        <div v-else-if="sale" id="invoice-printable" style="background-color: #ffffff; color: #000000; border-color: #000000;" class="w-[800px] mx-auto text-left py-8 px-10 font-serif flex flex-col shadow-sm border">

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
                <td class="border border-black px-3 py-2">
                  {{ sale.paymentMethod === 'CASH' ? $t('pos.cash') : (sale.paymentMethod === 'CARD' ? $t('pos.card') : (sale.paymentMethod === 'MIXED' ? $t('pos.mixed') : $t('pos.debt'))) }}
                  <span v-if="sale.paymentMethod === 'MIXED'" class="ml-2 font-normal text-xs text-gray-600">
                    ({{ formatCurrency(sale.cashAmount) }} + {{ formatCurrency(sale.cardAmount) }})
                  </span>
                </td>
              </tr>
              <tr v-if="sale.paymentStatus === 'PENDING' && debtData?.due_date">
                <td class="border border-black px-3 py-2 bg-gray-50 font-bold uppercase text-[10px] tracking-tight">{{ $t('pos.dueDate') }}</td>
                <td class="border border-black px-3 py-2 font-bold text-red-600">
                  {{ formatDate(debtData.due_date).split(' ')[0] }}
                </td>
              </tr>
              <tr>
                <td class="border border-black px-3 py-2 bg-gray-50 font-bold uppercase text-[10px] tracking-tight">{{ $t('invoice.status') }}</td>
                <td class="border border-black px-3 py-2 font-bold uppercase text-[10px]">
                   <span :class="sale.paymentStatus === 'PAID' ? 'text-green-600' : 'text-red-600'">
                    {{ sale.paymentStatus === 'PAID' ? 'Paid / To\'langan' : 'Pending / To\'lanmagan' }}
                   </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Document Table 2: Sale Items -->
          <div class="mb-6">
            <p class="text-[10px] font-bold uppercase mb-2">{{ $t('invoice.items') }}:</p>
            <table class="w-full border-collapse border border-black text-sm">
              <thead>
                <tr style="background-color: #f3f4f6;">
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
                <tr style="background-color: #f9fafb;">
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
import { salesService, debtsService } from '../services/supabaseService';
import { useI18n } from 'vue-i18n';
import { useToast } from '../composables/useToast';


const { t } = useI18n();
const toast = useToast();

const props = defineProps<{
  show: boolean;
  saleId: number | string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const sale = ref<any>(null);
const debtData = ref<any>(null);
const loading = ref(false);
const pdfLoading = ref(false);

// Load sale data when modal opens
watch(() => props.show, async (val) => {
  if (val && props.saleId) {
    loading.value = true;
    try {
      sale.value = await salesService.getById(props.saleId);
      
      // Fetch debt data separately if it's a debt sale
      if (sale.value?.paymentMethod === 'DEBT') {
        const debts = await debtsService.getMemberDebts(sale.value.memberId);
        // Find the specific debt for this sale
        debtData.value = debts.find((d: any) => String(d.source_id) === String(props.saleId));
      } else {
        debtData.value = null;
      }
    } catch (err) {
      console.error('Invoice load error:', err);
      sale.value = null;
      debtData.value = null;
    } finally {
      loading.value = false;
    }
  } else if (!val) {
    sale.value = null;
    debtData.value = null;
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
  document.body.classList.add('printing-pos-invoice');
  window.print();
  // We use onafterprint to clean up, or a timeout for safer handling
  const cleanup = () => {
    document.body.classList.remove('printing-pos-invoice');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  // Fallback for browsers that don't support afterprint well
  setTimeout(cleanup, 1000);
};

const downloadPdf = async () => {
  const el = document.getElementById('invoice-printable');
  if (!el) return;
  pdfLoading.value = true;

  try {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    const canvas = await html2canvas(el, {
      scale: 2, // 2 is enough for good quality and speed
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 800,
      windowWidth: 800, // Important: force window width for layout stability
      onclone: (clonedDoc) => {
        const printable = clonedDoc.getElementById('invoice-printable');
        if (printable) {
          printable.style.fontFamily = "'Times New Roman', Times, serif";
          printable.style.backgroundColor = '#ffffff';
          printable.style.color = '#000000';
          printable.style.width = '800px';
          printable.style.display = 'block';
          printable.style.margin = '0';
          printable.style.padding = '40px';
          
          // Explicitly fix table styles for html2canvas
          const tables = printable.querySelectorAll('table');
          tables.forEach(table => {
            (table as HTMLElement).style.borderCollapse = 'collapse';
            (table as HTMLElement).style.width = '100%';
            (table as HTMLElement).style.tableLayout = 'auto';
          });

          const cells = printable.querySelectorAll('td, th');
          cells.forEach(cell => {
            (cell as HTMLElement).style.borderColor = '#000000';
            (cell as HTMLElement).style.color = '#000000';
            (cell as HTMLElement).style.padding = '10px';
            (cell as HTMLElement).style.backgroundColor = (cell as HTMLElement).classList.contains('bg-gray-50') ? '#f9fafb' : 
                                                         (cell as HTMLElement).classList.contains('bg-gray-100') ? '#f3f4f6' : 'transparent';
          });

          // Comprising all elements in printable to strip oklch/modern colors
          const allElements = printable.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const node = allElements[i] as HTMLElement;
            const style = window.getComputedStyle(node);
            
            // html2canvas fails on oklch. We force standard colors for any modern function.
            if (style.color && (style.color.includes('oklch') || style.color.includes('var'))) {
              node.style.color = '#000000';
            }
            if (style.backgroundColor && (style.backgroundColor.includes('oklch') || style.backgroundColor.includes('var'))) {
              // Preserve subtle backgrounds if possible by checking classes
              if (node.classList.contains('bg-gray-50')) node.style.backgroundColor = '#f9fafb';
              else if (node.classList.contains('bg-gray-100')) node.style.backgroundColor = '#f3f4f6';
              else node.style.backgroundColor = 'transparent';
            }
            if (style.borderColor && (style.borderColor.includes('oklch') || style.borderColor.includes('var'))) {
              node.style.borderColor = '#000000';
            }
          }
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({ 
      orientation: 'portrait', 
      unit: 'mm', 
      format: 'a4' 
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`tgc-faktura-${sale.value?.id || 'invoice'}.pdf`);
  } catch (err) {
    console.error('PDF error:', err);
    toast.error('PDF yaratishda xatolik. Iltimos, "Chop etish" tugmasidan foydalaning.');
  } finally {
    pdfLoading.value = false;
  }
};

</script>

<style>
@media print {
  /* Hide the app ONLY if the invoice is being printed */
  body.printing-pos-invoice #app {
    display: none !important;
  }

  /* Hide the main app and everything else with no-print */
  .no-print {
    display: none !important;
  }

  /* Reset body and html for print */
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    overflow: visible !important;
    background: white !important;
  }

  /* Ensure the printable area takes full width and is visible */
  #invoice-printable {
    position: relative !important;
    width: 210mm !important; /* Standard A4 width */
    max-width: 100% !important;
    margin: 0 auto !important;
    padding: 10mm !important;
    border: none !important;
    box-shadow: none !important;
    visibility: visible !important;
    display: block !important;
  }

  /* Reset the modal wrapper to be a simple block in print */
  .fixed.inset-0 {
    position: static !important;
    display: block !important;
    background: transparent !important;
    width: auto !important;
    height: auto !important;
    overflow: visible !important;
  }
}
</style>
