<template>
  <!-- Contract Modal -->
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 no-print">
    <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" @click="close"></div>
    <div class="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
          <DocumentTextIcon class="h-6 w-6 text-sky-500" />
          {{ $t('contract.title', 'Xizmat Ko\'rsatish Shartnomasi') }}
        </h3>
        <button @click="close" class="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- Action Bar -->
      <div class="px-6 py-3 bg-white border-b border-gray-100 flex items-center justify-end gap-3 z-10">
        <button @click="downloadPdf" :disabled="generating" class="btn-secondary h-10 px-4 text-sm font-semibold">
          <ArrowDownTrayIcon class="h-5 w-5 mr-2 text-gray-500" />
          {{ generating ? $t('common.loading') : $t('invoice.downloadPdf') }}
        </button>
        <button @click="printContract" class="btn-primary h-10 px-6 text-sm font-semibold shadow-sm shadow-sky-500/20">
          <PrinterIcon class="h-5 w-5 mr-2" />
          {{ $t('invoice.print') }}
        </button>
      </div>

      <!-- Printable Content Area -->
      <div class="flex-1 overflow-y-auto w-full bg-gray-50/50 p-6 scroll-smooth">
        <div id="contract-content" class="mx-auto bg-white p-12 shadow-sm border border-gray-100 w-full max-w-[800px] min-h-[1100px] print-container relative">
            <template v-if="data">
                <!-- Header -->
                <div class="text-center mb-8 border-b-2 border-gray-800 pb-6">
                    <h1 class="text-2xl font-black uppercase tracking-widest text-gray-900">XIZMAT KO'RSATISH SHARTNOMASI</h1>
                    <p class="text-sm text-gray-500 mt-2 font-medium">№ {{ data.id || 'N/A' }} / {{ formatDate(new Date().toISOString()) }}</p>
                </div>

                <!-- Parties Info -->
                <div class="mb-8 text-sm leading-relaxed text-gray-800 text-justify">
                    <p class="mb-4">
                        Ushbu shartnoma bir tomondan <strong>"Vidalita"</strong> go'zallik va fitnes markazi (keyingi o'rinlarda "Ijrochi" deb yuritiladi) va ikkinchi tomondan fuqaro <strong>{{ data.memberName }}</strong> (keyingi o'rinlarda "Mijoz" deb yuritiladi) o'rtasida quyidagilar haqida tuzildi:
                    </p>
                </div>

                <!-- Section 1 -->
                <div class="mb-6 text-sm text-gray-800">
                    <h2 class="font-bold text-gray-900 uppercase mb-2 border-l-4 border-gray-800 pl-3">1. SHARTNOMA PREDMETI</h2>
                    <p class="mb-2 leading-relaxed">
                        1.1. Ijrochi Mijozga quyidagi xizmat(lar)ni ko'rsatish majburiyatini oladi, Mijoz esa ushbu xizmat(lar) uchun to'lovni amalga oshirish va xarajatlarni qoplash majburiyatini oladi:
                    </p>
                    <div class="bg-gray-50 p-4 rounded border border-gray-200 mt-3 font-medium">
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-500">Xizmat nomi:</span>
                            <span class="text-gray-900 font-bold text-right">{{ data.serviceName || data.membershipType }}</span>
                        </div>
                        <div v-if="data.totalSessions" class="flex justify-between mb-2">
                            <span class="text-gray-500">Seanslar soni:</span>
                            <span class="text-gray-900 font-bold text-right">{{ data.totalSessions }} ta</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Umumiy qiymati:</span>
                            <span class="text-gray-900 font-bold text-right uppercase tracking-wider">{{ formatCurrency(data.price || data.totalAmount) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Section 2 -->
                <div class="mb-6 text-sm text-gray-800 leading-relaxed text-justify">
                    <h2 class="font-bold text-gray-900 uppercase mb-2 border-l-4 border-gray-800 pl-3">2. TARAFLARNING HUQUQ VA MAJBURIYATLARI</h2>
                    <p class="mb-1">2.1. <strong>Ijrochi majburiyatlari:</strong></p>
                    <ul class="list-disc pl-5 mb-3">
                        <li>Xizmatlarni o'z vaqtida va sifatli malakali mutaxassislar orqali ko'rsatish.</li>
                        <li>Sanitariya va gigiyena qoidalariga qat'iy rioya qilish.</li>
                        <li>Mijozning sog'lig'i haqidagi ma'lumotlarni sir saqlash.</li>
                    </ul>
                    <p class="mb-1">2.2. <strong>Mijoz majburiyatlari:</strong></p>
                    <ul class="list-disc pl-5 mb-3">
                        <li>Xizmat vaqtida markazning ichki tartib-qoidalariga qat'iy rioya qilish.</li>
                        <li>Belgilangan vaqtdan kechikmasdan kelish (kechikkanda seans vaqti qisqarishi mumkin).</li>
                        <li>Shartnoma bo'yicha belgilangan to'lovni o'z vaqtida to'liq amalga oshirish.</li>
                    </ul>
                </div>

                <!-- Section 3 -->
                <div class="mb-8 text-sm text-gray-800 leading-relaxed text-justify">
                    <h2 class="font-bold text-gray-900 uppercase mb-2 border-l-4 border-gray-800 pl-3">3. TO'LOV TARTIBI</h2>
                    <p class="mb-2">3.1. Tomonlar kelishuvi asosida xizmatlar uchun to'lov oldindan yoki shartnomada kelishilgan jadval (taksit) asosida to'lanadi.</p>
                    <table v-if="data.debtAmount > 0" class="w-full mt-3 border-collapse border border-gray-300 text-sm">
                        <tr class="bg-gray-100 font-bold">
                            <td class="border border-gray-300 p-2">To'langan:</td>
                            <td class="border border-gray-300 p-2 text-right">{{ formatCurrency((data.price || data.totalAmount) - data.debtAmount) }}</td>
                        </tr>
                        <tr class="bg-red-50 font-bold text-red-900">
                            <td class="border border-gray-300 p-2">Qoldiq qarz summasi:</td>
                            <td class="border border-gray-300 p-2 text-right">{{ formatCurrency(data.debtAmount) }}</td>
                        </tr>
                        <tr v-if="data.dueDate">
                            <td class="border border-gray-300 p-2">So'nggi to'lov muddati:</td>
                            <td class="border border-gray-300 p-2 text-right text-red-600 font-bold">{{ formatDate(data.dueDate) }}</td>
                        </tr>
                    </table>
                </div>

                <!-- Signatures -->
                <div class="mt-16 grid grid-cols-2 gap-12 text-sm text-gray-900">
                    <div>
                        <h4 class="font-bold mb-4 uppercase text-gray-500 tracking-wider">IJROCHI (MARKAZ)</h4>
                        <div class="border-b border-gray-400 pb-1 mb-2 font-medium">"Vidalita" MCHJ</div>
                        <div class="text-xs text-gray-500 italic mt-6">M.O'. / Imzo: ___________________</div>
                    </div>
                    <div>
                        <h4 class="font-bold mb-4 uppercase text-gray-500 tracking-wider">MIJOZ</h4>
                        <div class="border-b border-gray-400 pb-1 mb-2 font-medium">{{ data.memberName || '___________________________' }}</div>
                        <div class="text-xs text-gray-500 italic mt-6">Imzo: ___________________</div>
                    </div>
                </div>

                <div class="mt-12 text-[10px] text-center text-gray-400 border-t border-gray-100 pt-6">
                    Hujjat tizim tomonidan avtomatik generatsiya qilindi. VIDALITA ERP System.
                </div>
            </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  XMarkIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  isOpen: boolean
  data?: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()
const generating = ref(false)

const close = () => {
  emit('close')
}

const formatCurrency = (val: number | string) => {
  if (!val) return '0 UZS'
  return new Intl.NumberFormat('uz-UZ').format(Number(val)) + ' UZS'
}

const formatDate = (dateValue: string) => {
  if (!dateValue) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Tashkent',
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(dateValue))
}

const downloadPdf = async () => {
  generating.value = true
  try {
    const element = document.getElementById('contract-content')
    if (!element) throw new Error('Contract content not found')

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/jpeg', 1.0)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`Shartnoma_${props.data?.memberName || 'Mijoz'}.pdf`)
  } catch (err) {
    console.error('PDF generation error:', err)
  } finally {
    generating.value = false
  }
}

const printContract = () => {
  window.print()
}
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  .print-container, .print-container * {
    visibility: visible;
  }
  .print-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px;
    box-shadow: none;
    border: none;
  }
}
</style>
