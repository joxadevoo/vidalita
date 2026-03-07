<template>
  <div class="flex flex-col">
    <div class="flex-shrink-0 space-y-6 no-print">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ $t('barcode.title') }}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-bold italic">{{ $t('barcode.subtitle') }}</p>
        </div>
        <div class="flex gap-2">
          <button
            class="glass-pill rounded-full border border-gray-400/30 px-5 py-2 text-sm font-black text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all shadow-sm"
            @click="fetchMembers"
          >
            <ArrowPathIcon class="h-4 w-4" />
          </button>
          <button
            class="rounded-full bg-sky-600 px-6 py-2 text-sm font-black text-white shadow-lg shadow-sky-600/25 hover:bg-sky-500 transition-all uppercase tracking-wider flex items-center gap-2"
            @click="printAll"
            :disabled="filteredMembers.length === 0"
          >
            <PrinterIcon class="h-4 w-4" />
            {{ $t('barcode.printAll') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

      <!-- Sticky filter section -->
      <div class="sticky top-0 z-20 glass rounded-full p-2 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl border-white/40 dark:border-white/10 no-print mb-6 backdrop-blur-md">
        <!-- Search -->
        <div class="w-full lg:max-w-md xl:max-w-lg relative flex items-center group">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
          <input
            v-model="searchTerm"
            type="text"
            :placeholder="$t('barcode.searchPlaceholder')"
            class="w-full rounded-full h-11 pl-12 pr-4 text-sm bg-white/40 dark:bg-black/20 border-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 backdrop-blur-sm transition"
          />
        </div>

        <div class="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <!-- Status -->
          <div class="flex items-center gap-2 px-4 h-11 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 w-full md:w-auto relative group/select">
            <label class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{{ $t('barcode.statusLabel') }}</label>
            <div class="relative flex items-center">
              <select
                v-model="statusFilter"
                class="bg-transparent border-none focus:ring-0 text-xs font-bold h-full appearance-none dark:text-gray-200 pr-8 cursor-pointer uppercase tracking-tight"
              >
                <option value="all" class="dark:bg-gray-900">{{ $t('common.all') }}</option>
                <option value="active" class="dark:bg-gray-900">{{ $t('common.active') }}</option>
                <option value="inactive" class="dark:bg-gray-900">{{ $t('common.inactive') }}</option>
              </select>
              <ChevronDownIcon class="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform group-hover/select:text-sky-500" />
            </div>
          </div>

          <!-- Count -->
          <div class="flex items-center justify-end gap-2 px-1 h-11">
            <span class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{{ $t('barcode.found') }}:</span>
            <span class="glass-pill rounded-full w-11 h-11 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-200">{{ filteredMembers.length }}</span>
          </div>
        </div>
      </div>

    <!-- Scrollable barcode cards section -->
    <div class="flex-1 overflow-y-auto pt-6 custom-scrollbar no-print">
      <LoadingSpinner v-if="loading" />

      <div v-else class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 px-1 pb-10">
        <div
          v-for="member in filteredMembers"
          :key="member.id"
          class="group glass rounded-2xl p-5 shadow-lg border-white/40 dark:border-white/10 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center gap-4 relative"
        >
          <!-- Action Buttons -->
          <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="printSingle(member)"
              class="p-2.5 rounded-full bg-sky-500/10 text-sky-600 hover:bg-sky-500 hover:text-white transition-all shadow-sm"
              :title="$t('barcode.print')"
            >
              <PrinterIcon class="h-4 w-4" />
            </button>
          </div>
          
          <div class="w-full space-y-3">
            <div class="text-center">
              <div class="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{{ member.fullName }}</div>
              <div v-if="member.phone" class="text-[9px] font-bold text-gray-400 italic mt-0.5">{{ member.phone }}</div>
            </div>

            <!-- Barcode Container -->
            <div class="bg-white p-4 rounded-xl shadow-inner border border-gray-100 dark:border-white/5 flex flex-col items-center gap-3">
              <svg :id="`barcode-${member.id}`" class="w-full mix-blend-multiply" style="min-height: 80px; max-width: 100%;"></svg>
              <div class="text-[10px] font-black font-mono text-gray-400 uppercase tracking-tighter">{{ member.qrCodeId }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="filteredMembers.length === 0" class="col-span-full py-20 text-center opacity-60 italic text-gray-400">
          <div class="flex flex-col items-center gap-2">
            <div class="h-16 w-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center opacity-20">
              <MagnifyingGlassIcon class="h-8 w-8" />
            </div>
            {{ $t('barcode.noResults') }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Hidden element for barcode rendering when printing -->
    <div id="print-mount" class="hidden"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  PrinterIcon, 
  ArrowPathIcon, 
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { membersService } from '../services/supabaseService'

const { t } = useI18n()

// jsbarcode dynamic import
let JsBarcode: any
const loadJsBarcode = async () => {
  if (!JsBarcode) {
    try {
      const module = await import('jsbarcode')
      // CommonJS yoki ES module formatini qo'llab-quvvatlash
      JsBarcode = (module as any).default || (module as any).JsBarcode || module
      // Agar hali ham funksiya bo'lmasa, to'g'ridan-to'g'ri ishlatish
      if (typeof JsBarcode !== 'function') {
        JsBarcode = (module as any).default || module
      }
    } catch (err) {
      console.error('jsbarcode yuklashda xatolik:', err)
      throw err
    }
  }
  return JsBarcode
}


type Member = {
  id: number
  fullName: string
  phone: string
  qrCodeId: string
  gymActive: number
  birthDate?: string
  joinDate?: string
  photo?: string
}

const members = ref<Member[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchTerm = ref('')
const statusFilter = ref('all')

const fetchMembers = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await membersService.getAll()
    members.value = data
    // Barcode'larni generatsiya qilish - DOM'ga qo'shilishini kutish
    await nextTick()
    setTimeout(() => {
      generateBarcodes()
    }, 200)
  } catch (err: any) {
    console.error(err)
    error.value = t('barcode.errorLoading')
  } finally {
    loading.value = false
  }
}

const generateBarcodes = async () => {
  // jsbarcode kutubxonasini yuklash
  const Barcode = await loadJsBarcode()
  
  // Kichik kechikish bilan DOM'ga qo'shilishini kutish
  setTimeout(() => {
    filteredMembers.value.forEach((member) => {
      const svgElement = document.getElementById(`barcode-${member.id}`)
      if (svgElement) {
        // Agar allaqachon barcode bo'lsa, o'chirish
        svgElement.innerHTML = ''
        try {
          Barcode(svgElement, member.qrCodeId, {
            format: 'CODE128',
            width: 2,
            height: 50,
            displayValue: false,
            fontSize: 12,
            margin: 6,
            background: 'transparent',
            lineColor: '#000000'
          })
        } catch (err) {
          console.error(`Barcode generatsiya qilishda xatolik (${member.qrCodeId}):`, err)
        }
      }
    })
  }, 100)
}

const filteredMembers = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()
  return members.value.filter((member) => {
    const matchesSearch =
      !search ||
      member.fullName.toLowerCase().includes(search) ||
      member.phone?.toLowerCase().includes(search) ||
      member.qrCodeId.toLowerCase().includes(search)

    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && member.gymActive === 1) ||
      (statusFilter.value === 'inactive' && member.gymActive !== 1)

    return matchesSearch && matchesStatus
  })
})

watch(
  () => filteredMembers.value,
  () => {
    nextTick(() => {
      generateBarcodes()
    })
  },
  { deep: true }
)


const printSingle = (member: Member) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const svgElement = document.getElementById(`barcode-${member.id}`)
  if (!svgElement) return

  const svgContent = svgElement.outerHTML

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Barcode - ${member.qrCodeId}</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .barcode-print {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }
          body {
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            background: white;
          }
          .barcode-print {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
          .barcode-box {
            background: white;
            padding: 15px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            max-width: 300px;
          }
          .barcode-box svg {
            width: 100%;
            min-height: 100px;
          }
          .barcode-id {
            font-family: monospace;
            font-size: 14px;
            color: #475569;
            text-align: center;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="barcode-print">
          <div class="barcode-box">
            ${svgContent}
          </div>
          <p class="barcode-id">${member.qrCodeId}</p>
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

const printAll = () => {
  if (filteredMembers.value.length === 0) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const cardsHtml = filteredMembers.value
    .map((member) => {
      const svgElement = document.getElementById(`barcode-${member.id}`)
      if (!svgElement) return ''
      const svgContent = svgElement.outerHTML
      return `
        <div class="barcode-print">
          <div class="barcode-box">
            ${svgContent}
          </div>
          <p class="barcode-id">${member.qrCodeId}</p>
        </div>
      `
    })
    .join('')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${t('barcode.title')}</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .barcode-print {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 10px;
            background: white;
          }
          .cards-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            width: 100%;
          }
          .barcode-print {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 10px;
          }
          .barcode-box {
            background: white;
            padding: 10px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
          }
          .barcode-box svg {
            width: 100%;
            min-height: 80px;
          }
          .barcode-id {
            font-family: monospace;
            font-size: 12px;
            color: #475569;
            text-align: center;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="cards-container">
          ${cardsHtml}
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}


onMounted(() => {
  fetchMembers()
})
</script>

<style scoped>
.barcode-container {
  transition: transform 0.2s;
}

.barcode-container:hover {
  transform: translateY(-2px);
}

@media print {
  .print\:hidden {
    display: none !important;
  }
  .print\:break-inside-avoid {
    page-break-inside: avoid;
  }
  .barcode-container {
    break-inside: avoid;
  }
}
</style>

