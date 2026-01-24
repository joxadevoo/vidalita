<template>
  <div class="flex flex-col">
    <!-- Sticky header section -->
    <div class="flex-shrink-0 space-y-6 bg-white p-6 rounded-lg shadow-sm">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('barcode.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('barcode.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button
          class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          @click="fetchMembers"
        >
          {{ $t('common.refresh') }}
        </button>
        <button
          class="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500"
          @click="printAll"
          :disabled="filteredMembers.length === 0"
        >
          {{ $t('barcode.printAll') }}
        </button>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

      <!-- Sticky filter section -->
      <div class="sticky top-0 z-10 grid gap-4 p-4 bg-gray-50 rounded-lg md:grid-cols-2 lg:grid-cols-4">
      <div class="flex items-center gap-2">
        <input
          v-model="searchTerm"
          type="text"
          :placeholder="$t('barcode.searchPlaceholder')"
          class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        />
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500">{{ $t('barcode.statusLabel') }}</label>
        <select
          v-model="statusFilter"
          class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          <option value="all">{{ $t('common.all') }}</option>
          <option value="active">{{ $t('common.active') }}</option>
          <option value="inactive">{{ $t('common.inactive') }}</option>
        </select>
      </div>
      <div class="flex items-center justify-end text-sm text-gray-500">
        {{ $t('barcode.found') }}: <span class="ml-1 font-semibold text-gray-700">{{ filteredMembers.length }}</span>
        </div>
      </div>
    </div>

    <!-- Scrollable barcode cards section -->
    <div class="flex-1 overflow-y-auto pt-6">
    <div v-if="loading" class="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
      {{ $t('common.loading') }}
    </div>

    <div v-else class="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <div
        v-for="member in filteredMembers"
        :key="member.id"
        class="barcode-container rounded-lg border border-gray-200 bg-white p-4 shadow-sm print:break-inside-avoid"
      >
        <!-- Action Buttons -->
        <div class="mb-3 flex justify-end gap-2 print:hidden">
          <button
            @click="printSingle(member)"
            class="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 transition-colors"
            :title="$t('barcode.print')"
          >
            <PrinterIcon class="h-4 w-4" />
          </button>
        </div>
        
        <!-- Barcode Only -->
        <div class="flex flex-col items-center">
          <div class="bg-white p-3 rounded border border-gray-200 w-full">
            <svg :id="`barcode-${member.id}`" class="w-full" style="min-height: 80px; max-width: 100%;"></svg>
          </div>
          <p class="mt-2 text-xs font-mono text-gray-600 text-center">{{ member.qrCodeId }}</p>
        </div>
      </div>
      <div v-if="filteredMembers.length === 0" class="col-span-full rounded-lg border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
        {{ $t('barcode.noResults') }}
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { PrinterIcon } from '@heroicons/vue/24/outline'
import api from '../lib/api'

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
    const { data } = await api.get<Member[]>('/members')
    members.value = data
    // Barcode'larni generatsiya qilish - DOM'ga qo'shilishini kutish
    await nextTick()
    setTimeout(() => {
      generateBarcodes()
    }, 200)
  } catch (err) {
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

