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
    <LoadingSpinner v-if="loading" />
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
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { beautyService, membersService } from '../services/supabaseService'
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
// Service types (enum) - Default qiymatlar bilan initialize qilamiz
const serviceTypes = ref<{ types: string[], labels: Record<string, string>, categories: any, prices: Record<string, number | null> }>({
  types: [
    'golden_needle', 'bbl_laser', 'nd_yag_laser', 'fractional_laser', 'coolite_pro', 
    'shape_smart', 'laser_epilation', 'hydramaster', 'hifu', 'ems_slim', 
    'g8_massage', 'endo_roller', 'classic_massage', 'classic_facial', 'lymphatic',
    'passive_gym', 'waxing', 'nails', 'fitness_memberships'
  ],
  labels: {
    // Golden Needle
    'golden_needle_acne': 'Золотая Игла Лечение Акне (3 Сеанса)',
    'golden_needle_wrinkles': 'Золотая Игла Лечение Морщин (3 Сеанса)',
    'golden_needle_scars': 'Золотая Игла Лечение Ожоговых Шрамов (3 Сеанса)',
    'golden_needle_pigment': 'Золотая Игла Лечение Пигментных Пятен (3 Сеанса)',
    'golden_needle_stretch': 'Золотая Игла Лечение Растяжек Кожи',
    'golden_needle_pimple_scars': 'Золотая Игла Лечение Шрамов От Прыщей (3 Сеанса)',
    'golden_needle_rejuvenation': 'Золотая Игла Омоложение Кожи',
    'golden_needle_pores': 'Золотая Игла Сужение Пор (3 Сеанса)',
    // BBL Laser
    'bbl_freckles': 'BBL Лазер Лечение Веснушек (1 Сеанс)',
    'bbl_melasma': 'BBL Лазер Лечение Мелазмы (1 Сеанс)',
    'bbl_pigment': 'BBL Лазер Лечение Пигментных Пятен (1 Сеанс)',
    'bbl_redness': 'BBL Лазер Лечение Покраснений Кожи (1 Сеанс)',
    'bbl_pores': 'BBL Лазер Лечение Расширенных Пор (1 Сеанс)',
    'bbl_birthmarks': 'BBL Лазер Лечение Родимых Пятен (1 Сеанс)',
    'bbl_rosacea': 'BBL Лазер Лечение Розацеа (1 Сеанс)',
    // ND YAG
    'nd_yag_carbon': 'ND YAG Лазер Карбоновый Пилинг',
    'nd_yag_eyebrow': 'ND YAG Лазер Удаление Татуажа Бровей (3 Сеанса)',
    'nd_yag_tattoo': 'ND YAG Лазер Удаление Татуировки (8 Сеансов)',
    // Fractional
    'fractional_vaginal': 'Фракционный Лазер Вагинальное Сужение И Лечение Недержания Мочи',
    'fractional_wrinkles': 'Фракционный Лазер Лечение Морщин (1 Сеанс)',
    'fractional_scars': 'Фракционный Лазер Лечение Ожоговых Шрамов (1 Сеанс)',
    'fractional_pigment': 'Фракционный Лазер Лечение Пигментных Пятен (1 Сеанс)',
    'fractional_postop': 'Фракционный Лазер Лечение Послеоперационных Шрамов (1 Сеанс)',
    'fractional_stretch': 'Фракционный Лазер Лечение Растяжек (1 Сеанс)',
    'fractional_rubtsov': 'Фракционный Лазер Лечение Рубцов (1 Сеанс)',
    'fractional_sun': 'Фракционный Лазер Лечение Солнечных Пятен (1 Сеанс)',
    'fractional_general_scars': 'Фракционный Лазер Лечение Шрамов (1 Сеанс)',
    // Coolite Pro
    'coolite_lip': 'Coolite Pro Лазер Верхняя губа (Один сеанс)',
    'coolite_thigh': 'Coolite Pro Лазер Верхняя часть бедра (Один сеанс)',
    'coolite_arm_upper': 'Coolite Pro Лазер Верхняя часть руки (Один сеанс)',
    'coolite_face': 'Coolite Pro Лазер Все лицо (Один сеанс)',
    'coolite_legs': 'Coolite Pro Лазер Все ноги (Один сеанс)',
    'coolite_full_body': 'Coolite Pro Лазер Все тело: подмышки, гениталии, все ноги (6 сеансов)',
    'coolite_arm_full': 'Coolite Pro Лазер Вся рука (Один сеанс)',
    'coolite_chest': 'Coolite Pro Лазер Грудь (Один сеанс)',
    'coolite_occiput': 'Coolite Pro Лазер Затылок (Один сеанс)',
    'coolite_forehead': 'Coolite Pro Лазер Лоб (Один сеанс)',
    'coolite_thigh_lower': 'Coolite Pro Лазер Нижняя часть бедра (Один сеанс)',
    'coolite_arm_lower': 'Coolite Pro Лазер Нижняя часть руки (Один сеанс)',
    'coolite_buttocks_lower': 'Coolite Pro Лазер Нижняя часть ягодиц (Один сеанс)',
    'coolite_perianal': 'Coolite Pro Лазер Перинальная зона (Один сеанс)',
    'coolite_chin': 'Coolite Pro Лазер Подбородок (Один сеанс)',
    'coolite_axilla': 'Coolite Pro Лазер Подмышки (Один сеанс)',
    'coolite_popa': 'Coolite Pro Лазер Попа (Один сеанс)',
    'coolite_waist': 'Coolite Pro Лазер Поясница (Один сеанс)',
    'coolite_arm': 'Coolite Pro Лазер Рука (Один сеанс)',
    'coolite_back': 'Coolite Pro Лазер Спина (Один сеанс)',
    'coolite_feet': 'Coolite Pro Лазер Ступни (Один сеанс)',
    'coolite_stache': 'Coolite Pro Лазер Усики (Один сеанс)',
    'coolite_neck': 'Coolite Pro Лазер Шея (Один сеанс)',
    'coolite_buttocks': 'Coolite Pro Лазер Ягодицы (Один сеанс)',
    // Shape Smart
    'shape_smart_local': 'Shape Smart Локальное Похудение (8 Сеансов)',
    'shape_smart_hips': 'Shape Smart Локальное Похудение Бёдра (8 Сеансов)',
    'shape_smart_thighs_upper': 'Shape Smart Локальное Похудение Верхняя Часть Бёдер (8 Сеансов)',
    'shape_smart_belly': 'Shape Smart Локальное Похудение Живот (8 Сеансов)',
    'shape_smart_face': 'Shape Smart Локальное Похудение Лифтинг Лица (8 Сеансов)',
    'shape_smart_thighs_lower': 'Shape Smart Локальное Похудение Нижняя Часть Бёдер (8 Сеансов)',
    'shape_smart_chin': 'Shape Smart Локальное Похудение Подбородок (8 Сеансов)',
    'shape_smart_waist': 'Shape Smart Локальное Похудение Поясница (8 Сеансов)',
    'shape_smart_arms': 'Shape Smart Локальное Похудение Руки (8 Сеансов)',
    'shape_smart_back': 'Shape Smart Локальное Похудение Спина (8 Сеансов)',
    // Epilation
    'epil_sideburns': 'Лазерная Эпиляция Бакенбарды (1 Сеанс)',
    'epil_hips': 'Лазерная Эпиляция Бёдра (1 Сеанс)',
    'epil_lip': 'Лазерная Эпиляция Верхняя Губа (1 Сеанс)',
    'epil_arms_upper': 'Лазерная Эпиляция Верхняя Часть Рук (1 Сеанс)',
    'epil_buttocks_upper': 'Лазерная Эпиляция Верхняя Часть Ягодиц (1 Сеанс)',
    'epil_face': 'Лазерная Эпиляция Всё Лицо (1 Сеанс)',
    'epil_legs': 'Лазерная Эпиляция Всё Ноги (1 Сеанс)',
    'epil_arms': 'Лазерная Эпиляция Всё Руки (1 Сеанс)',
    'epil_full_body': 'Лазерная Эпиляция Всё Тело (Подмышки, Генитальная Область, Всё Ноги) (1 Сеанс)',
    'epil_genitals': 'Лазерная Эпиляция Генитальная Область (1 Сеанс)',
    'epil_shins': 'Лазерная Эпиляция Голени (1 Сеанс)',
    'epil_chest': 'Лазерная Эпиляция Грудь (1 Сеанс)',
    'epil_belly': 'Лазерная Эпиляция Живот (1 Сеанс)',
    'epil_occiput': 'Лазерная Эпиляция Затылок (1 Сеанс)',
    'epil_hands': 'Лазерная Эпиляция Кисти (1 Сеанс)',
    'epil_forehead': 'Лазерная Эпиляция Лоб (1 Сеанс)',
    'epil_arms_lower': 'Лазерная Эпиляция Нижняя Часть Рук (1 Сеанс)',
    'epil_chin': 'Лазерная Эпиляция Подбородок (1 Сеанс)',
    'epil_axilla': 'Лазерная Эпиляция Подмышки (1 Сеанс)',
    'epil_waist': 'Лазерная Эпиляция Поясница (1 Сеанс)',
    'epil_back': 'Лазерная Эпиляция Спина (1 Сеанс)',
    'epil_feet': 'Лазерная Эпиляция Ступни (1 Сеанс)',
    'epil_neck': 'Лазерная Эпиляция Шея (1 Сеанс)',
    'epil_buttocks': 'Лазерная Эпиляция Ягодицы (1 Сеанс)',
    // Hydramaster
    'hydra_chest': 'Hydramaster Подтяжка Груди (1 Сеанс)',
    'hydra_buttocks': 'Hydramaster Подтяжка Ягодиц (1 Сеанс)',
    'hydra_face': 'Hydramaster Уход За Кожей Лица (1 Сеанс)',
    // HIFU
    'hifu_face': 'HIFU Лифтинг Лица (1 Сеанс)',
    'hifu_chin': 'HIFU Лифтинг Подбородка (1 Сеанс)',
    'hifu_rejuvenation': 'HIFU Омоложение Кожи (1 Сеанс)',
    'hifu_eyebrows': 'HIFU Поднятие Бровей (1 Сеанс)',
    'hifu_wrinkles': 'HIFU Уменьшение Морщин (1 Сеанс)',
    // EMS Slim
    'ems_hips': 'EMS Slim Бёдра (8 Сеансов)',
    'ems_thighs_upper': 'EMS Slim Верхняя Часть Бёдер (8 Сеансов)',
    'ems_belly': 'EMS Slim Живот (8 Сеансов)',
    // G8
    'g8_general': 'G8 Массаж (1 Сеанс)',
    'g8_hips': 'G8 Массаж Бёдра (8 Сеансов)',
    'g8_thighs_upper': 'G8 Массаж Верхняя Часть Бёдер (8 Сеансов)',
    'g8_belly': 'G8 Массаж Живот (8 Сеансов)',
    'g8_thighs_lower': 'G8 Массаж Нижняя Часть Бёдер (8 Сеансов)',
    'g8_waist': 'G8 Массаж Поясница (8 Сеансов)',
    'g8_back': 'G8 Массаж Спина (8 Сеансов)',
    // Endo Roller
    'endo_thighs_upper': 'Endo Roller Массаж Верхняя Часть Бёдер (1 Сеанс)',
    'endo_thighs_lower': 'Endo Roller Массаж Нижняя Часть Бёдер (1 Сеанс)',
    'endo_waist': 'Endo Roller Массаж Поясница (1 Сеанс)',
    'endo_back': 'Endo Roller Массаж Спина (1 Сеанс)',
    // Others
    'needle_epil': 'Игольчатая Эпиляция (Поминутно)',
    'massage_classic': 'Классический Массаж Тела',
    'face_classic': 'Классический Уход За Кожей Лица',
    'lympho_1': 'Лимфодренаж (1 сеанс)',
    'lympho_gift': 'Лимфодренаж (4 сеанса в подарок)',
    'lympho_8': 'Лимфодренаж (8 сеанс)',
    'lympho_full': 'Лимфодренаж Всего Тела',
    'hair_care': 'Массаж И Уход За Волосами',
    'passive_gym_base': 'Пассивная Гимнастика',
    'passive_gym_1': 'Пассивная гимнастика (1 сеанс)',
    'passive_gym_gift': 'Пассивная гимнастика (4 сеанса в подарок)',
    'passive_gym_8': 'Пассивная гимнастика (8 сеанс)',
    // Waxing
    'wax_face': 'Восковая депиляция – Всё лицо',
    'wax_genitals': 'Восковая депиляция – Генитальная зона',
    'wax_package': 'Восковая депиляция – Пакет (Половина руки – Подмышки – Половина ноги – Генитальная зона)',
    'wax_axilla': 'Восковая депиляция – Подмышечные впадины',
    'wax_arm_full': 'Восковая депиляция – Полная рука',
    'wax_legs_full': 'Восковая депиляция – Полные ноги',
    'wax_leg_half': 'Восковая депиляция – Половина ноги',
    'wax_arm_half': 'Восковая депиляция – Половина руки',
    'wax_waist': 'Восковая депиляция – Поясница',
    'wax_back': 'Восковая депиляция – Спина',
    'wax_stache': 'Восковая депиляция – Усики',
    'wax_buttocks': 'Восковая депиляция – Ягодицы',
    // Nails
    'polish': 'Лак Для Ногтей',
    'manicure': 'Маникюр',
    'pedicure_nails': 'Маникюр ногтей на ногах',
    'extension': 'Наращивание Ногтей',
    'pedicure': 'Педикюр',
    'plastic_nails': 'Пластиковые Ногти',
    'heel_care': 'Уход За Пятками',
    'henna': 'Хна Для Ногтей',
    'shellac': 'Шеллак',
    // Fitness
    'zumba_month': 'Зумба (Ежемесячный Абонемент На 12 Занятий)',
    'zumba_session': 'Зумба (Занятие)',
    'yoga_month': 'Йога (Ежемесячный Абонемент, 3 Раза В Неделю)',
    'pilates_group': 'Пилатес (Групповое Занятие)',
    'pilates_individual': 'Пилатес (Индивидуальное Занятие)',
    'nutrition_plan': 'Планирование И Контроль Спортивного Питания',
    'fitness_12m': 'Фитнес (Абонемент На 12 Месяцев)',
    'fitness_3m': 'Фитнес (Абонемент На 3 Месяца)',
    'fitness_6m': 'Фитнес (Абонемент На 6 Месяцев)'
  },
  categories: {
    laser: { label: 'Лазерные процедуры (Золотая Игла, BBL, ND YAG, Фракционный)', services: ['golden_needle_acne', 'golden_needle_wrinkles', 'golden_needle_scars', 'golden_needle_pigment', 'golden_needle_stretch', 'golden_needle_pimple_scars', 'golden_needle_rejuvenation', 'golden_needle_pores', 'bbl_freckles', 'bbl_melasma', 'bbl_pigment', 'bbl_redness', 'bbl_pores', 'bbl_birthmarks', 'bbl_rosacea', 'nd_yag_carbon', 'nd_yag_eyebrow', 'nd_yag_tattoo', 'fractional_vaginal', 'fractional_wrinkles', 'fractional_scars', 'fractional_pigment', 'fractional_postop', 'fractional_stretch', 'fractional_rubtsov', 'fractional_sun', 'fractional_general_scars'] },
    coolite: { label: 'Coolite Pro Лазер (Эпиляция)', services: ['coolite_lip', 'coolite_thigh', 'coolite_arm_upper', 'coolite_face', 'coolite_legs', 'coolite_full_body', 'coolite_arm_full', 'coolite_chest', 'coolite_occiput', 'coolite_forehead', 'coolite_thigh_lower', 'coolite_arm_lower', 'coolite_buttocks_lower', 'coolite_perianal', 'coolite_chin', 'coolite_axilla', 'coolite_popa', 'coolite_waist', 'coolite_arm', 'coolite_back', 'coolite_feet', 'coolite_stache', 'coolite_neck', 'coolite_buttocks'] },
    slimming: { label: 'Похудение и Коррекция фигуры (Shape Smart, EMS, G8, Endo Roller)', services: ['shape_smart_local', 'shape_smart_hips', 'shape_smart_thighs_upper', 'shape_smart_belly', 'shape_smart_face', 'shape_smart_thighs_lower', 'shape_smart_chin', 'shape_smart_waist', 'shape_smart_arms', 'shape_smart_back', 'ems_hips', 'ems_thighs_upper', 'ems_belly', 'g8_general', 'g8_hips', 'g8_thighs_upper', 'g8_belly', 'g8_thighs_lower', 'g8_waist', 'g8_back', 'endo_thighs_upper', 'endo_thighs_lower', 'endo_waist', 'endo_back'] },
    epilation: { label: 'Лазерная Эпиляция (Стандарт)', services: ['epil_sideburns', 'epil_hips', 'epil_lip', 'epil_arms_upper', 'epil_buttocks_upper', 'epil_face', 'epil_legs', 'epil_arms', 'epil_full_body', 'epil_genitals', 'epil_shins', 'epil_chest', 'epil_belly', 'epil_occiput', 'epil_hands', 'epil_forehead', 'epil_arms_lower', 'epil_chin', 'epil_axilla', 'epil_waist', 'epil_back', 'epil_feet', 'epil_neck', 'epil_buttocks'] },
    skincare: { label: 'Уход за кожей и Массаж', services: ['hydra_chest', 'hydra_buttocks', 'hydra_face', 'hifu_face', 'hifu_chin', 'hifu_rejuvenation', 'hifu_eyebrows', 'hifu_wrinkles', 'massage_classic', 'face_classic', 'lympho_1', 'lympho_gift', 'lympho_8', 'lympho_full', 'hair_care', 'passive_gym_base', 'passive_gym_1', 'passive_gym_gift', 'passive_gym_8'] },
    waxing_nails: { label: 'Восковая депиляция и Ногтевой сервис', services: ['wax_face', 'wax_genitals', 'wax_package', 'wax_axilla', 'wax_arm_full', 'wax_legs_full', 'wax_leg_half', 'wax_arm_half', 'wax_waist', 'wax_back', 'wax_stache', 'wax_buttocks', 'polish', 'manicure', 'pedicure_nails', 'extension', 'pedicure', 'plastic_nails', 'heel_care', 'henna', 'shellac'] },
    fitness: { label: 'Фитнес и Абонементы', services: ['zumba_month', 'zumba_session', 'yoga_month', 'pilates_group', 'pilates_individual', 'nutrition_plan', 'fitness_12m', 'fitness_3m', 'fitness_6m'] }
  },
  prices: {
    // Golden Needle
    'golden_needle_acne': 4800000, 'golden_needle_wrinkles': 4800000, 'golden_needle_scars': 4800000, 'golden_needle_pigment': 4800000, 'golden_needle_stretch': 3000000, 'golden_needle_pimple_scars': 4800000, 'golden_needle_rejuvenation': 0, 'golden_needle_pores': 4800000,
    // BBL
    'bbl_freckles': 3600000, 'bbl_melasma': 3600000, 'bbl_pigment': 3600000, 'bbl_redness': 3600000, 'bbl_pores': 3600000, 'bbl_birthmarks': 3600000, 'bbl_rosacea': 3600000,
    // ND YAG
    'nd_yag_carbon': 2600000, 'nd_yag_eyebrow': 2600000, 'nd_yag_tattoo': 6000000,
    // Fractional
    'fractional_vaginal': 6000000, 'fractional_wrinkles': 3000000, 'fractional_scars': 3000000, 'fractional_pigment': 3000000, 'fractional_postop': 3000000, 'fractional_stretch': 3000000, 'fractional_rubtsov': 3000000, 'fractional_sun': 3000000, 'fractional_general_scars': 3000000,
    // Coolite Pro
    'coolite_lip': 190000, 'coolite_thigh': 720000, 'coolite_arm_upper': 360000, 'coolite_face': 720000, 'coolite_legs': 1900000, 'coolite_full_body': 4800000, 'coolite_arm_full': 720000, 'coolite_chest': 550000, 'coolite_occiput': 400000, 'coolite_forehead': 240000, 'coolite_thigh_lower': 720000, 'coolite_arm_lower': 440000, 'coolite_buttocks_lower': 720000, 'coolite_perianal': 440000, 'coolite_chin': 190000, 'coolite_axilla': 720000, 'coolite_popa': 440000, 'coolite_waist': 440000, 'coolite_arm': 440000, 'coolite_back': 720000, 'coolite_feet': 440000, 'coolite_stache': 240000, 'coolite_neck': 192000, 'coolite_buttocks': 550000,
    // Shape Smart
    'shape_smart_local': 4000000, 'shape_smart_hips': 4000000, 'shape_smart_thighs_upper': 4000000, 'shape_smart_belly': 4000000, 'shape_smart_face': 4000000, 'shape_smart_thighs_lower': 4000000, 'shape_smart_chin': 4000000, 'shape_smart_waist': 4000000, 'shape_smart_arms': 4000000, 'shape_smart_back': 4000000,
    // Epilation
    'epil_sideburns': 240000, 'epil_hips': 720000, 'epil_lip': 192000, 'epil_arms_upper': 360000, 'epil_buttocks_upper': 720000, 'epil_face': 720000, 'epil_legs': 1920000, 'epil_arms': 720000, 'epil_full_body': 4800000, 'epil_genitals': 432000, 'epil_shins': 720000, 'epil_chest': 552000, 'epil_belly': 552000, 'epil_occiput': 408000, 'epil_hands': 432000, 'epil_forehead': 240000, 'epil_arms_lower': 432000, 'epil_chin': 192000, 'epil_axilla': 720000, 'epil_waist': 432000, 'epil_back': 720000, 'epil_feet': 432000, 'epil_neck': 192000, 'epil_buttocks': 432000,
    // Hydramaster
    'hydra_chest': 700000, 'hydra_buttocks': 1000000, 'hydra_face': 700000,
    // HIFU
    'hifu_face': 3000000, 'hifu_chin': 3000000, 'hifu_rejuvenation': 3000000, 'hifu_eyebrows': 3000000, 'hifu_wrinkles': 3000000,
    // EMS Slim
    'ems_hips': 3600000, 'ems_thighs_upper': 3600000, 'ems_belly': 3600000,
    // G8
    'g8_general': 450000, 'g8_hips': 3600000, 'g8_thighs_upper': 3600000, 'g8_belly': 3600000, 'g8_thighs_lower': 3600000, 'g8_waist': 3600000, 'g8_back': 3600000,
    // Endo
    'endo_thighs_upper': 500000, 'endo_thighs_lower': 500000, 'endo_waist': 500000, 'endo_back': 500000,
    // Others
    'needle_epil': 76000, 'massage_classic': 400000, 'face_classic': 500000, 'lympho_1': 500000, 'lympho_gift': 0, 'lympho_8': 4000000, 'lympho_full': 500000, 'hair_care': 400000, 'passive_gym_base': 400000, 'passive_gym_1': 400000, 'passive_gym_gift': 0, 'passive_gym_8': 3200000,
    // Waxing
    'wax_face': 60000, 'wax_genitals': 90000, 'wax_package': 200000, 'wax_axilla': 40000, 'wax_arm_full': 60000, 'wax_legs_full': 120000, 'wax_leg_half': 60000, 'wax_arm_half': 40000, 'wax_waist': 75000, 'wax_back': 75000, 'wax_stache': 20000, 'wax_buttocks': 60000,
    // Nails
    'polish': 100000, 'manicure': 80000, 'pedicure_nails': 80000, 'extension': 400000, 'pedicure': 150000, 'plastic_nails': 230000, 'heel_care': 250000, 'henna': 100000, 'shellac': 180000,
    // Fitness
    'zumba_month': 400000, 'zumba_session': 80000, 'yoga_month': 600000, 'pilates_group': 120000, 'pilates_individual': 200000, 'nutrition_plan': 600000, 'fitness_12m': 4200000, 'fitness_3m': 1200000, 'fitness_6m': 2250000
  }
})
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
        label: serviceTypes.value.labels[type] || type
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
    const data = await membersService.getAll()
    members.value = data
    if (data.length === 0) {
      formError.value = t('beautyServices.errorNoMembers')
    }
  } catch (err: any) {
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
    
    await beautyService.add(payload)
    successMessage.value = t('beautyServices.successAdded')
    closeModal()
    await fetchServices()
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err: any) {
    console.error(err)
    formError.value = err.message || t('beautyServices.errorAdding')
  } finally {
    submitting.value = false
  }
}

const fetchServiceTypes = async () => {
  try {
    const data = await beautyService.getServiceTypes()
    serviceTypes.value = data
  } catch (err) {
    console.error('Xizmat turlarini yuklashda xatolik:', err)
  }
}

const fetchServices = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await beautyService.getAll()
    services.value = data
  } catch (err: any) {
    console.error(err)
    error.value = err.message || t('beautyServices.errorLoading')
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
    await beautyService.delete(id)
    services.value = services.value.filter((s) => s.id !== id)
  } catch (err: any) {
    console.error(err)
    window.alert(err.message || t('beautyServices.deleteError'))
  }
}
</script>

