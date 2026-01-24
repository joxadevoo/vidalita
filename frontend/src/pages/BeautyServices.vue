<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('beautyServices.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('beautyServices.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
      <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50" @click="fetchServices">{{ $t('common.refresh') }}</button>
        <button class="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500" @click="openModal">{{ $t('beautyServices.newService') }}</button>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
    <div v-if="successMessage" class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{{ successMessage }}</div>

    <!-- Filter paneli -->
    <div class="sticky top-0 z-20 grid gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4">
      <div class="flex min-w-0 flex-col">
        <label class="mb-1 text-xs text-gray-500">{{ $t('beautyServices.dateFrom') }}</label>
        <input v-model="dateFrom" type="date" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400" />
      </div>
      <div class="flex min-w-0 flex-col">
        <label class="mb-1 text-xs text-gray-500">{{ $t('beautyServices.dateTo') }}</label>
        <input v-model="dateTo" type="date" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400" />
      </div>
      <div class="flex min-w-0 flex-col">
        <label class="mb-1 text-xs text-gray-500">{{ $t('common.search') }}</label>
        <input v-model="searchTerm" type="text" :placeholder="$t('beautyServices.searchPlaceholder')" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400" />
      </div>
      <div class="flex min-w-0 w-full items-end gap-1 overflow-hidden">
        <div class="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2">
          <input id="todayOnly" v-model="onlyToday" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
          <label for="todayOnly" class="text-xs text-gray-600 whitespace-nowrap">{{ $t('beautyServices.todayOnly') }}</label>
        </div>
        <button
          @click="exportToExcel"
          class="flex flex-shrink-0 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 hover:bg-gray-50 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          :title="$t('beautyServices.exportExcel')"
        >
          <TableCellsIcon class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">{{ $t('beautyServices.exportExcel') }}</span>
        </button>
        <button
          @click="exportToPDF"
          class="flex flex-shrink-0 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 hover:bg-gray-50 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          :title="$t('beautyServices.exportPDF')"
        >
          <DocumentTextIcon class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">{{ $t('beautyServices.exportPDF') }}</span>
        </button>
        <button
          @click="resetFilters"
          class="flex-shrink-0 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 hover:bg-gray-50 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          {{ $t('beautyServices.resetFilters') }}
        </button>
      </div>
    </div>

    <!-- Table section (scrollable) -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" style="max-height: calc(100vh - 280px);">
      <div v-if="loading" class="px-4 py-6 text-center text-sm text-gray-500">{{ $t('common.loading') }}</div>
      <div v-else class="overflow-x-auto" style="max-height: calc(100vh - 280px);">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="sticky top-0 z-10 bg-gray-50">
            <tr>
              <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('beautyServices.columns.name') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('beautyServices.columns.service') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('beautyServices.columns.price') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('beautyServices.columns.date') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('beautyServices.columns.note') }}</th>
              <th class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="s in filteredServices" :key="s.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{{ s.fullName || $t('beautyServices.noName') }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ s.serviceName }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <span v-if="s.amount && s.amount > 0" class="font-medium text-green-700">
                  {{ formatPrice(s.amount) }}
                </span>
                <span v-else-if="s.serviceType && serviceTypes?.prices?.[s.serviceType]" class="font-medium text-green-700">
                  {{ formatPrice(serviceTypes.prices[s.serviceType]) }}
                </span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDate(s.serviceDate) }}</td>
              <td class="px-3 py-4 text-sm text-gray-500">{{ s.note || '—' }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-right">
                <button
                  class="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                  @click="onDeleteService(s.id)"
                >
                  {{ $t('common.delete') }}
                </button>
              </td>
            </tr>
            <tr v-if="filteredServices.length === 0">
              <td colspan="6" class="px-6 py-6 text-center text-sm text-gray-500">{{ $t('beautyServices.noResults') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-[120] flex items-center justify-center p-4" @click.self="closeModal">
      <!-- Backdrop with blur -->
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm z-[120]"></div>
      <!-- Modal content -->
      <div class="relative w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-lg z-[121]" @click.stop>
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('beautyServices.modalTitle') }}</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <form @submit.prevent="handleSubmit" class="px-6 py-4 space-y-4">
          <div v-if="formError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ formError }}</div>
          
          <!-- Member Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('beautyServices.memberLabel') }} <span class="text-red-500">*</span></label>
            <div class="relative member-dropdown-container">
              <input
                v-model="memberSearch"
                type="text"
                :placeholder="$t('beautyServices.memberPlaceholder')"
                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                @input="filterMembers"
                @focus="showMemberDropdown = true"
              />
              <div v-if="showMemberDropdown && filteredMembersList.length > 0" class="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                <button
                  v-for="member in filteredMembersList"
                  :key="member.id"
                  type="button"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  @click="selectMember(member)"
                >
                  <div class="font-medium text-gray-900">{{ member.fullName }}</div>
                  <div class="text-xs text-gray-500">{{ member.phone }} • {{ member.qrCodeId }}</div>
                </button>
              </div>
            </div>
            <div v-if="selectedMember" class="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span class="font-medium text-gray-900">{{ $t('beautyServices.memberSelected') }}: {{ selectedMember.fullName }}</span>
              <button type="button" @click="selectedMember = null; memberSearch = ''" class="ml-2 text-sky-600 hover:text-sky-700">{{ $t('common.delete') }}</button>
            </div>
          </div>

          <!-- Service Name (Bitta dropdown - barcha xizmatlar) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('beautyServices.serviceNameLabel') }} <span class="text-red-500">*</span></label>
            <select
              v-model="form.serviceName"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              required
            >
              <option value="">{{ $t('beautyServices.serviceNameSelect') }}</option>
              <optgroup v-for="category in serviceCategories" :key="category.key" :label="category.label">
                <option v-for="service in category.services" :key="service.type" :value="service.type">
                  {{ service.label }}
                </option>
              </optgroup>
            </select>
            <p class="mt-1 text-xs text-gray-500">{{ $t('beautyServices.serviceNameHint') }}</p>
            <!-- Narx ko'rsatish -->
            <div v-if="form.serviceName && serviceTypes?.prices?.[form.serviceName]" class="mt-2 rounded-lg bg-green-50 px-3 py-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-green-800">
                  {{ $t('beautyServices.originalPrice') }}: {{ formatPrice(serviceTypes.prices[form.serviceName]) }}
                </span>
                <span v-if="form.discountPercent > 0" class="text-sm font-medium text-red-600">
                  -{{ form.discountPercent }}%
                </span>
              </div>
              <div v-if="form.discountPercent > 0" class="mt-1 text-sm font-bold text-green-800">
                {{ $t('beautyServices.finalPrice') }}: {{ formatPrice(calculatedPrice) }}
              </div>
            </div>
          </div>

          <!-- Chegirma -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('beautyServices.discountLabel') }} (%)</label>
            <input
              v-model.number="form.discountPercent"
              type="number"
              min="0"
              max="100"
              step="0.1"
              :placeholder="$t('beautyServices.discountPlaceholder')"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
            <p class="mt-1 text-xs text-gray-500">{{ $t('beautyServices.discountHint') }}</p>
          </div>

          <!-- Service Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('beautyServices.serviceDateLabel') }}</label>
            <input
              v-model="form.serviceDate"
              type="datetime-local"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          <!-- Note -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('beautyServices.noteLabel') }}</label>
            <textarea
              v-model="form.note"
              rows="3"
              :placeholder="$t('beautyServices.notePlaceholder')"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4">
            <button type="button" @click="closeModal" class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">{{ $t('common.cancel') }}</button>
            <button type="submit" :disabled="submitting" class="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60">
              {{ submitting ? $t('beautyServices.submitting') : $t('beautyServices.add') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'
import * as XLSX from 'xlsx'
import { TableCellsIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import { formatDate, getCurrentDateTimeISO } from '../lib/dateUtils'

const { t } = useI18n()

type Service = {
  id: number
  memberId: number
  serviceName: string
  serviceType?: string
  serviceDate: string
  note?: string
  fullName?: string
  amount?: number
}

type Member = {
  id: number
  fullName: string
  phone: string
  qrCodeId: string
}

const services = ref<Service[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Filter state
const dateFrom = ref('')
const dateTo = ref('')
const searchTerm = ref('')
const onlyToday = ref(false)

// Modal state
const showModal = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)

// Hozirgi vaqtni datetime-local formatida olish
// datetime-local input browser'ning local timezone'ida ishlaydi
const getCurrentDateTimeLocal = () => {
  const now = new Date()
  
  // Local timezone'da vaqtni olish (browser'ning timezone'i)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  // datetime-local format: YYYY-MM-DDTHH:mm
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Form data
const form = ref({
  serviceName: '', // Bu endi serviceType'ni ham o'z ichiga oladi
  serviceDate: getCurrentDateTimeLocal(), // Hozirgi vaqt (Toshkent timezone)
  discountPercent: 0, // Chegirma foizi
  note: ''
})

// Service types (enum) - Backend'dan yuklanadi
const serviceTypes = ref<{ types: string[], labels: Record<string, string>, categories: any, prices: Record<string, number | null> } | null>(null)
const serviceCategories = computed(() => {
  if (!serviceTypes.value) return []
  
  const categories: any[] = []
  const cats = serviceTypes.value.categories
  
  for (const [key, val] of Object.entries(cats)) {
    const category = val as { label: string, services: string[] }
    categories.push({
      key,
      label: category.label,
      services: category.services.map((type: string) => ({
        type,
        label: serviceTypes.value!.labels[type] || type
      }))
    })
  }
  
  return categories
})

// Endi availableServiceNames kerak emas, chunki barcha xizmatlar bitta dropdown'da

// Chegirma bilan hisoblangan narx
const calculatedPrice = computed(() => {
  if (!form.value.serviceName || !serviceTypes.value?.prices?.[form.value.serviceName]) {
    return null
  }
  const originalPrice = serviceTypes.value.prices[form.value.serviceName]
  if (!originalPrice || originalPrice === 0) return null
  
  const discount = form.value.discountPercent || 0
  if (discount <= 0) return originalPrice
  
  const discountAmount = (originalPrice * discount) / 100
  return originalPrice - discountAmount
})

// Member selection
const members = ref<Member[]>([])
const memberSearch = ref('')
const selectedMember = ref<Member | null>(null)
const showMemberDropdown = ref(false)

const filteredMembersList = computed(() => {
  if (!memberSearch.value.trim()) {
    return members.value.slice(0, 10)
  }
  const search = memberSearch.value.toLowerCase()
  return members.value.filter(member =>
    member.fullName.toLowerCase().includes(search) ||
    member.phone.includes(search) ||
    member.qrCodeId.toLowerCase().includes(search)
  ).slice(0, 10)
})

const filterMembers = () => {
  showMemberDropdown.value = true
}

const selectMember = (member: Member) => {
  selectedMember.value = member
  memberSearch.value = member.fullName
  showMemberDropdown.value = false
}

const fetchMembers = async () => {
  try {
    const { data } = await api.get<Member[]>('/members')
    members.value = data
    if (data.length === 0) {
      formError.value = t('beautyServices.errorNoMembers')
    }
  } catch (err) {
    console.error(err)
    formError.value = t('beautyServices.errorLoadingMembers')
  }
}

const openModal = async () => {
  showModal.value = true
  formError.value = null
  successMessage.value = null
  // Hozirgi vaqtni yangilash (Toshkent timezone)
  form.value.serviceDate = getCurrentDateTimeLocal()
  // Har doim bazadan yangi a'zolarni yuklash
  await fetchMembers()
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    serviceName: '',
    serviceDate: getCurrentDateTimeLocal(), // Hozirgi vaqt (Toshkent timezone)
    discountPercent: 0,
    note: ''
  }
  selectedMember.value = null
  memberSearch.value = ''
  formError.value = null
  showMemberDropdown.value = false
}

// Endi watch kerak emas, chunki bitta dropdown bor

const handleSubmit = async () => {
  formError.value = null
  
  if (!selectedMember.value) {
    formError.value = t('beautyServices.errorMemberRequired')
    return
  }
  
  if (!form.value.serviceName.trim()) {
    formError.value = t('beautyServices.errorServiceNameRequired')
    return
  }

  submitting.value = true
  try {
    // serviceName endi serviceType'ni ham o'z ichiga oladi (enum qiymati)
    // serviceName sifatida rus tilidagi label'ni yuboramiz
    const serviceType = form.value.serviceName // Enum qiymati (masalan: 'depilation')
    const serviceNameLabel = serviceTypes.value?.labels[serviceType] || form.value.serviceName // Rus tilidagi label (masalan: 'Депиляция')
    
    // Narxni hisoblash (chegirma bilan)
    const originalPrice = serviceTypes.value?.prices?.[serviceType] || 0
    const discount = form.value.discountPercent || 0
    let finalAmount = originalPrice
    if (originalPrice > 0 && discount > 0) {
      const discountAmount = (originalPrice * discount) / 100
      finalAmount = originalPrice - discountAmount
    }
    
    const payload = {
      memberId: selectedMember.value.id,
      serviceType: serviceType || undefined,  // Enum qiymati
      serviceName: serviceNameLabel,  // Rus tilidagi label
      serviceDate: form.value.serviceDate ? new Date(form.value.serviceDate).toISOString() : undefined,
      amount: finalAmount > 0 ? finalAmount : undefined,
      discountPercent: discount > 0 ? discount : undefined,
      note: form.value.note.trim() || undefined
    }
    
    await api.post('/beauty', payload)
    successMessage.value = t('beautyServices.successAdded')
    closeModal()
    await fetchServices()
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err: any) {
    console.error(err)
    formError.value = err.response?.data?.error || t('beautyServices.errorAdding')
  } finally {
    submitting.value = false
  }
}

const fetchServiceTypes = async () => {
  try {
    const { data } = await api.get('/beauty/service-types')
    serviceTypes.value = data
  } catch (err) {
    console.error('Xizmat turlarini yuklashda xatolik:', err)
  }
}

const fetchServices = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get<Service[]>('/beauty')
    services.value = data
  } catch (err) {
    console.error(err)
    error.value = t('beautyServices.errorLoading')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  dateFrom.value = today
  dateTo.value = today
  onlyToday.value = false
  fetchServices()
  fetchServiceTypes()  // Enum qiymatlarini yuklash
  fetchMembers()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (showMemberDropdown.value && !target.closest('.member-dropdown-container')) {
    showMemberDropdown.value = false
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showModal.value) {
    closeModal()
  }
}

const filteredServices = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()
  return services.value.filter((s) => {
    const matchesSearch =
      !search ||
      (s.fullName && s.fullName.toLowerCase().includes(search)) ||
      s.serviceName.toLowerCase().includes(search) ||
      (s.note && s.note.toLowerCase().includes(search))

    // Sana filtri
    let matchesDate = true
    
    if (onlyToday.value) {
      const today = new Date().toISOString().slice(0, 10)
      matchesDate = s.serviceDate.slice(0, 10) === today
    } else if (dateFrom.value || dateTo.value) {
      const itemDate = s.serviceDate.slice(0, 10)
      if (dateFrom.value && dateTo.value) {
        matchesDate = itemDate >= dateFrom.value && itemDate <= dateTo.value
      } else if (dateFrom.value) {
        matchesDate = itemDate >= dateFrom.value
      } else if (dateTo.value) {
        matchesDate = itemDate <= dateTo.value
      }
    }

    return matchesSearch && matchesDate
  })
})

const resetFilters = () => {
  const today = new Date().toISOString().slice(0, 10)
  dateFrom.value = today
  dateTo.value = today
  searchTerm.value = ''
  onlyToday.value = false
}

// formatDate funksiyasi utility'dan import qilingan

// Narxni formatlash funksiyasi
const formatPrice = (price: number | null | undefined): string => {
  if (!price || price === 0) return '—'
  // So'm formatida ko'rsatish (1000 -> 1 000 so'm)
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

// Excel export (XLSX formatida)
const exportToExcel = () => {
  const data = filteredServices.value
  if (data.length === 0) {
    alert(t('common.noData'))
    return
  }

  // Excel uchun ma'lumotlarni tayyorlash
  const excelData = data.map(s => ({
    [t('beautyServices.columns.name')]: s.fullName || t('beautyServices.noName'),
    [t('beautyServices.columns.service')]: s.serviceName,
    [t('beautyServices.columns.date')]: formatDate(s.serviceDate),
    [t('beautyServices.columns.note')]: s.note || '—'
  }))

  // Workbook yaratish
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(excelData)

  // Column width'ni sozlash
  ws['!cols'] = [
    { wch: 25 }, // Ism
    { wch: 20 }, // Xizmat nomi
    { wch: 20 }, // Sana va vaqt
    { wch: 30 }  // Izoh
  ]

  // Sheet'ni workbook'ga qo'shish
  XLSX.utils.book_append_sheet(wb, ws, t('beautyServices.title'))

  // Fayl nomi
  const dateRange = dateFrom.value && dateTo.value 
    ? `${dateFrom.value}_${dateTo.value}`
    : new Date().toISOString().slice(0, 10)
  
  // Excel faylini yuklab olish
  XLSX.writeFile(wb, `gozallik_xizmatlari_${dateRange}.xlsx`)
}

// PDF export
const exportToPDF = () => {
  const data = filteredServices.value
  if (data.length === 0) {
    alert(t('common.noData'))
    return
  }

  // PDF uchun HTML yaratish
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const dateRange = dateFrom.value && dateTo.value 
    ? `${formatDate(dateFrom.value + 'T00:00:00').split(' ')[0]} ${t('beautyServices.from')} ${formatDate(dateTo.value + 'T23:59:59').split(' ')[0]} ${t('beautyServices.to')}`
    : t('beautyServices.allServices')

  const tableRows = data.map(s => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${s.fullName || t('beautyServices.noName')}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${s.serviceName}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(s.serviceDate)}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${s.note || '—'}</td>
    </tr>
  `).join('')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${t('beautyServices.title')}</title>
        <meta charset="utf-8">
        <style>
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #1e40af;
            margin-bottom: 10px;
          }
          .info {
            margin-bottom: 20px;
            color: #666;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #f3f4f6;
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-weight: bold;
          }
          td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .footer {
            margin-top: 20px;
            text-align: right;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>${t('beautyServices.title')}</h1>
        <div class="info">
          <p><strong>${t('beautyServices.dateRange')}:</strong> ${dateRange}</p>
          <p><strong>${t('beautyServices.totalServices')}:</strong> ${data.length} ${t('beautyServices.items')}</p>
          <p><strong>${t('beautyServices.reportDate')}:</strong> ${formatDate(new Date().toISOString())}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>${t('beautyServices.columns.name')}</th>
              <th>${t('beautyServices.columns.service')}</th>
              <th>${t('beautyServices.columns.date')}</th>
              <th>${t('beautyServices.columns.note')}</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">
          <p>Vidalita Gym & Beauty - ${new Date().toLocaleDateString('uz-UZ')}</p>
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

const onDeleteService = async (id: number) => {
  const ok = window.confirm(t('beautyServices.deleteConfirm'))
  if (!ok) return
  try {
    await api.delete(`/beauty/${id}`)
    services.value = services.value.filter((s) => s.id !== id)
  } catch (err) {
    console.error(err)
    window.alert(t('beautyServices.deleteError'))
  }
}
</script>

