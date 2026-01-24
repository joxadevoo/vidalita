<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-2">
      <RouterLink :to="isEditMode ? `/members/${memberId}` : '/members'" class="text-sm text-sky-600 hover:text-sky-500">&larr; {{ isEditMode ? $t('memberDetail.backToMembers') : $t('memberCreate.backToMembers') }}</RouterLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ isEditMode ? $t('memberCreate.editTitle') : $t('memberCreate.title') }}</h1>
        <p class="text-sm text-gray-500">{{ isEditMode ? $t('memberCreate.editSubtitle') : $t('memberCreate.subtitle') }}</p>
      </div>
    </div>

    <form class="space-y-8" @submit.prevent="handleSubmit">
      <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
          <h2 class="text-base sm:text-lg font-semibold text-gray-900">{{ $t('memberCreate.basicInfo') }}</h2>
          <p class="text-xs sm:text-sm text-gray-500">{{ $t('memberCreate.basicInfoSubtitle') }}</p>
        </div>
        <div class="grid gap-4 px-4 sm:px-6 py-4 sm:py-6 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="input-label" for="fullName">{{ $t('memberCreate.fullName') }} *</label>
            <input id="fullName" v-model="form.fullName" type="text" required class="input" placeholder="Masalan: Gofurov Jamshid Akmal o'g'li" />
          </div>

          <div>
            <label class="input-label" for="birthDate">{{ $t('memberCreate.birthDate') }}</label>
            <input id="birthDate" v-model="form.birthDate" type="date" class="input" />
          </div>


          <div>
            <label class="input-label" for="memberId">{{ $t('memberCreate.id') }}</label>
            <input 
              id="memberId" 
              v-model="form.qrCodeId" 
              type="text" 
              :readonly="!isEditMode"
              :class="isEditMode ? 'input font-mono' : 'input bg-gray-50 cursor-not-allowed font-mono'" 
              :placeholder="$t('common.loading')"
            />
            <p v-if="!isEditMode" class="mt-1 text-xs text-gray-500">{{ $t('memberCreate.idAuto') }}</p>
          </div>

          <div class="md:col-span-2">
            <label class="input-label" for="phone">{{ $t('memberCreate.phone') }} *</label>
            <div class="flex gap-2">
              <select v-model="form.phoneCountry" class="w-36 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400">
                <option value="uz">🇺🇿 O'zbekiston (+998)</option>
                <option value="ru">🇷🇺 Rossiya (+7)</option>
                <option value="tr">🇹🇷 Turkiya (+90)</option>
              </select>
              <input id="phone" v-model="phoneField" type="tel" required class="flex-1 input" placeholder="+998 90 123 45 67" />
            </div>
          </div>

          <div>
            <label class="input-label" for="email">{{ $t('memberCreate.email') }}</label>
            <input id="email" v-model="form.email" type="email" class="input" placeholder="example@domain.com" />
          </div>

          <div>
            <label class="input-label" for="registrationDate">{{ $t('memberCreate.registrationDate') }} *</label>
            <input id="registrationDate" v-model="form.registrationDate" type="date" required class="input" />
          </div>


          <div>
            <label class="input-label" for="region">{{ $t('memberCreate.region') }}</label>
            <input id="region" v-model="form.region" type="text" class="input" placeholder="Masalan: Toshkent viloyati" />
          </div>

          <div>
            <label class="input-label" for="district">{{ $t('memberCreate.district') }}</label>
            <input id="district" v-model="form.district" type="text" class="input" placeholder="Masalan: Yakkasaroy tumani" />
          </div>

          <div class="md:col-span-2">
            <label class="input-label" for="photo">{{ $t('memberCreate.photo') }} <span class="text-red-500">*</span></label>
            <div class="mt-2 flex items-center gap-4">
              <div v-if="photoPreview" class="relative">
                <img :src="photoPreview" alt="Preview" class="h-24 w-24 rounded-lg border-2 border-gray-200 object-cover" />
                <button
                  type="button"
                  @click="removePhoto"
                  class="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  @change="handlePhotoUpload"
                class="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
                />
            </div>
            <p class="mt-1 text-xs text-gray-500">{{ $t('memberCreate.photoFormat') }}</p>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('memberCreate.additionalInfo') }}</h2>
          <p class="text-sm text-gray-500">{{ $t('memberCreate.additionalInfoSubtitle') }}</p>
        </div>
        <div class="space-y-6 px-4 sm:px-6 py-4 sm:py-6">
          <div class="md:flex md:items-center md:gap-4">
            <label class="input-label md:w-48">{{ $t('memberCreate.serviceType') }} *</label>
            <select v-model="form.serviceType" class="input md:flex-1" required>
              <option value="gym">{{ $t('memberCreate.serviceTypeGym') }}</option>
              <option value="beauty">{{ $t('memberCreate.serviceTypeBeauty') }}</option>
              <option value="both">{{ $t('memberCreate.serviceTypeBoth') }}</option>
            </select>
          </div>

          <!-- Gym qo'shimcha ma'lumotlari -->
          <div v-if="form.serviceType === 'gym' || form.serviceType === 'both'" class="space-y-6">
            <div>
              <h3 class="text-base font-semibold text-gray-900">{{ $t('memberCreate.gymInfo') }}</h3>
              <p class="text-sm text-gray-500">{{ $t('memberCreate.gymInfoSubtitle') }}</p>
            </div>

            <!-- Qarindoshining aloqa ma'lumotlari -->
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 class="mb-4 text-sm font-semibold text-gray-900">{{ $t('memberCreate.emergencyContact') }}</h4>
              <div class="space-y-4">
                <div>
                  <label class="input-label" for="emergencyName">{{ $t('memberCreate.emergencyName') }}</label>
                  <input id="emergencyName" v-model="gymInfo.emergencyName" type="text" class="input" placeholder="Qarindoshining to'liq ismi" />
                </div>
                <div>
                  <label class="input-label" for="emergencyPhone">{{ $t('memberCreate.emergencyPhone') }}</label>
                  <input id="emergencyPhone" v-model="gymInfo.emergencyPhone" type="text" class="input" placeholder="+998 XX XXX XX XX" />
                </div>
                <div>
                  <label class="input-label" for="emergencyRelation">{{ $t('memberCreate.emergencyRelation') }}</label>
                  <input id="emergencyRelation" v-model="gymInfo.emergencyRelation" type="text" class="input" placeholder="Qarindoshlik darajasi" />
                </div>
              </div>
            </div>

            <!-- Sog'liq va Fitnes Ma'lumotlari -->
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 class="mb-4 text-sm font-semibold text-gray-900">{{ $t('memberCreate.healthInfo') }}</h4>
              <div class="space-y-4">
                <div>
                  <label class="input-label" for="medicalConditions">{{ $t('memberCreate.medicalConditions') }}</label>
                  <textarea id="medicalConditions" v-model="gymInfo.medicalConditions" rows="3" class="input" placeholder="Agar ha bo'lsa, tushuntiring"></textarea>
                </div>
                <div>
                  <label class="input-label" for="gymMedications">{{ $t('memberCreate.medications') }}</label>
                  <textarea id="gymMedications" v-model="gymInfo.medications" rows="2" class="input" placeholder="Dorilar ro'yxatini kiriting"></textarea>
                </div>
              </div>
            </div>

            <!-- Fitnes maqsadlari -->
            <div>
              <label class="input-label" for="fitnessGoals">{{ $t('memberCreate.fitnessGoals') }}</label>
              <textarea id="fitnessGoals" v-model="gymInfo.fitnessGoals" rows="3" class="input" placeholder="Masalan, vazn kamaytirish, mushak o'stirish, umumiy sog'lomlashtirish"></textarea>
            </div>

            <!-- A'zolik Turlari -->
            <div>
              <label class="input-label">{{ $t('memberCreate.membershipType') }} *</label>
              <div class="mt-2 space-y-2">
                <label class="flex items-center gap-2">
                  <input v-model="gymInfo.membershipType" type="radio" value="monthly" class="h-4 w-4 text-sky-600 focus:ring-sky-500" />
                  <span class="text-sm text-gray-700">{{ $t('memberCreate.membershipMonthly') }}</span>
                </label>
                <label class="flex items-center gap-2">
                  <input v-model="gymInfo.membershipType" type="radio" value="quarterly" class="h-4 w-4 text-sky-600 focus:ring-sky-500" />
                  <span class="text-sm text-gray-700">{{ $t('memberCreate.membershipQuarterly') }}</span>
                </label>
                <label class="flex items-center gap-2">
                  <input v-model="gymInfo.membershipType" type="radio" value="yearly" class="h-4 w-4 text-sky-600 focus:ring-sky-500" />
                  <span class="text-sm text-gray-700">{{ $t('memberCreate.membershipYearly') }}</span>
                </label>
                <label class="flex items-center gap-2">
                  <input v-model="gymInfo.membershipType" type="radio" value="other" class="h-4 w-4 text-sky-600 focus:ring-sky-500" />
                  <span class="text-sm text-gray-700">{{ $t('memberCreate.membershipOther') }}</span>
                </label>
                <div v-if="gymInfo.membershipType === 'other'" class="ml-6 mt-2">
                  <input v-model="gymInfo.membershipTypeOther" type="text" class="input" placeholder="Aniqlang" />
                </div>
              </div>
            </div>

            <!-- To'lov Usuli -->
            <div>
              <label class="input-label">{{ $t('memberCreate.paymentMethod') }} *</label>
              <div class="mt-2 space-y-2">
                <label class="flex items-center gap-2">
                  <input v-model="gymInfo.paymentMethod" type="radio" value="card" class="h-4 w-4 text-sky-600 focus:ring-sky-500" />
                  <span class="text-sm text-gray-700">{{ $t('memberCreate.paymentCard') }}</span>
                </label>
                <label class="flex items-center gap-2">
                  <input v-model="gymInfo.paymentMethod" type="radio" value="cash" class="h-4 w-4 text-sky-600 focus:ring-sky-500" />
                  <span class="text-sm text-gray-700">{{ $t('memberCreate.paymentCash') }}</span>
                </label>
                <label class="flex items-center gap-2">
                  <input v-model="gymInfo.paymentMethod" type="radio" value="other" class="h-4 w-4 text-sky-600 focus:ring-sky-500" />
                  <span class="text-sm text-gray-700">{{ $t('memberCreate.paymentOther') }}</span>
                </label>
                <div v-if="gymInfo.paymentMethod === 'other'" class="ml-6 mt-2">
                  <input v-model="gymInfo.paymentMethodOther" type="text" class="input" :placeholder="$t('memberCreate.paymentOther')" />
                </div>
              </div>
            </div>
          </div>

          <!-- Beauty qo'shimcha ma'lumotlari -->
          <div v-if="showsBeautySection" class="space-y-6">
            <div>
              <h3 class="text-base font-semibold text-gray-900">{{ $t('memberCreate.beautyHealth') }}</h3>
              <p class="text-sm text-gray-500">{{ $t('memberCreate.beautyHealthSubtitle') }}</p>
            </div>
            <div class="overflow-hidden rounded-xl border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">{{ $t('memberCreate.healthCondition') }}</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold text-gray-900">{{ $t('common.yes') }}</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold text-gray-900">{{ $t('common.no') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="question in beautyQuestions" :key="question.key" class="align-top">
                    <td class="px-4 py-3 text-sm text-gray-700">
                      {{ question.label }}
                      <div v-if="question.detailKey && beautyHealth[question.key] === 'yes'" class="mt-2">
                        <label :for="question.key + '-detail'" class="text-xs text-gray-500">{{ $t('memberCreate.details') }}</label>
                        <textarea
                          :id="question.key + '-detail'"
                          v-model="beautyHealth[question.detailKey]"
                          rows="2"
                          class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                          :placeholder="question.detailPlaceholder || 'Ma\'lumot kiriting'"
                        ></textarea>
                      </div>
                      <div v-if="question.extraDateKey && beautyHealth[question.key] === 'yes'" class="mt-2">
                        <label :for="question.key + '-date'" class="text-xs text-gray-500">{{ $t('common.date') }}</label>
                        <input
                          :id="question.key + '-date'"
                          v-model="beautyHealth[question.extraDateKey]"
                          type="date"
                          class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <input
                        class="h-4 w-4 text-sky-600 focus:ring-sky-500"
                        type="radio"
                        :name="question.key"
                        value="yes"
                        v-model="beautyHealth[question.key]"
                      />
                    </td>
                    <td class="px-4 py-3 text-center">
                      <input
                        class="h-4 w-4 text-sky-600 focus:ring-sky-500"
                        type="radio"
                        :name="question.key"
                        value="no"
                        v-model="beautyHealth[question.key]"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <label class="input-label" for="medications">{{ $t('memberCreate.medications') }}</label>
              <textarea
                id="medications"
                v-model="beautyHealth.medications"
                rows="3"
                class="input"
                :placeholder="$t('memberCreate.medicationsPlaceholder')"
              ></textarea>
            </div>
          </div>
        </div>
      </section>

      <!-- Yuklash holati ko'rsatkichi -->
      <div v-if="submitting" class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <div class="flex items-center gap-3">
          <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-blue-900">{{ saveProgress || $t('memberCreate.saving') }}</p>
            <p class="text-xs text-blue-700 mt-1">{{ $t('memberCreate.savingToDatabase') }}</p>
          </div>
        </div>
      </div>

      <div v-if="submitError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <div class="flex items-start gap-2">
          <svg class="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-medium">{{ $t('memberCreate.error') }}</p>
            <p class="mt-1">{{ submitError }}</p>
          </div>
        </div>
          </div>
      <div v-if="submitSuccess && !submitting" class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        <div class="flex items-start gap-2">
          <svg class="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-medium">{{ $t('memberCreate.success') }}</p>
            <p class="mt-1">{{ submitSuccess }}</p>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3">
        <RouterLink :to="isEditMode ? `/members/${memberId}` : '/members'" class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">{{ $t('common.cancel') }}</RouterLink>
        <button type="submit" class="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitting">
          {{ submitting ? $t('memberCreate.submitting') : (isEditMode ? $t('memberCreate.updateMember') : $t('memberCreate.addMember')) }}
        </button>
    </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'
import { getCurrentDateInput } from '../lib/dateUtils'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()

const isEditMode = computed(() => !!route.params.id && route.path.includes('/edit'))
const memberId = computed(() => isEditMode.value ? Number(route.params.id) : null)

const form = reactive({
  fullName: '',
  birthDate: '',
  qrCodeId: '',
  phoneCountry: 'uz',
  phone: '',
  email: '',
  registrationDate: getCurrentDateInput(), // Hozirgi sana
  region: '',
  district: '',
  serviceType: 'gym',
  photo: null as File | null
})

const photoPreview = ref<string | null>(null)

const gymInfo = reactive({
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelation: '',
  medicalConditions: '',
  medications: '',
  fitnessGoals: '',
  membershipType: 'monthly',
  membershipTypeOther: '',
  paymentMethod: 'cash',
  paymentMethodOther: ''
})

const beautyHealth = reactive<Record<string, string | null>>({
  bloodPressure: null,
  diabetes: null,
  cancer: null,
  cancerDetails: '',
  cancerTreatment: null,
  cancerTreatmentDetails: '',
  hormonal: null,
  thyroid: null,
  skin: null,
  skinDetails: '',
  alcohol: null,
  prosthesis: null,
  platinum: null,
  implants: null,
  crowns: null,
  surgery: null,
  surgeryDetails: '',
  surgeryDate: '',
  smoking: null,
  medications: ''
})

const beautyQuestions = [
  { key: 'bloodPressure', label: 'Qon bosimi / Yurak kasalligi' },
  { key: 'diabetes', label: 'Qandli diabet' },
  { key: 'cancer', label: 'Saraton yoki onkologik kasallik', detailKey: 'cancerDetails', detailPlaceholder: "Agar mavjud bo'lsa, batafsil yozing" },
  { key: 'cancerTreatment', label: "Siz saraton kasalligini davolaganmisiz?", detailKey: 'cancerTreatmentDetails', detailPlaceholder: "Qaysi davolash usuli bo'lgani haqida yozing" },
  { key: 'hormonal', label: 'Gormonal buzilish' },
  { key: 'thyroid', label: 'Qalqonsimon bez kasalligi' },
  { key: 'skin', label: 'Teri kasalliklari (ekzema, psoriaz va boshqalar)', detailKey: 'skinDetails', detailPlaceholder: 'Kasallik turi va davolanishi' },
  { key: 'alcohol', label: "Spirtli ichimlik iste'moli" },
  { key: 'prosthesis', label: 'Sizning tanangizda protez bormi ?' },
  { key: 'platinum', label: 'Sizning tanangizda platina bormi ?' },
  { key: 'implants', label: 'Tishlaringizda implantlar bormi ?' },
  { key: 'crowns', label: 'Tishlaringizda toj yoki protez bormi ?' },
  { key: 'surgery', label: "Siz operatsiya amaliyotini o'tkazgansizmi?", detailKey: 'surgeryDetails', detailPlaceholder: 'Operatsiya tafsilotlari', extraDateKey: 'surgeryDate' },
  { key: 'smoking', label: 'Chekish odati' }
]

const submitting = ref(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref<string | null>(null)
const generatedQrCode = ref<string>('')
const saveStatus = ref<string>('') // Yuklash holati: 'saving', 'saved', 'error'
const saveProgress = ref<string>('') // Progress xabari

// Beauty health bo'limi - serviceType "beauty" yoki "both" bo'lsa
const showsBeautySection = computed(() => form.serviceType === 'beauty' || form.serviceType === 'both')

const formatPhoneByCountry = (value: string, country: string) => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''

  const formatUz = (val: string) => {
    const part = val.substring(0, 12)
    const groups = [part.slice(0, 3), part.slice(3, 5), part.slice(5, 8), part.slice(8, 10), part.slice(10, 12)].filter(Boolean)
    return `+${groups[0] || '998'} ${groups[1] || ''}${groups[1] ? ' ' : ''}${groups[2] || ''}${groups[2] ? ' ' : ''}${groups[3] || ''}${groups[3] ? ' ' : ''}${groups[4] || ''}`.trim()
  }

  const formatRu = (val: string) => {
    const part = val.substring(0, 11)
    const groups = [part.slice(0, 1), part.slice(1, 4), part.slice(4, 7), part.slice(7, 9), part.slice(9, 11)].filter(Boolean)
    return `+${groups[0] || '7'} (${groups[1] || ''}) ${groups[2] || ''}${groups[3] ? '-' + groups[3] : ''}${groups[4] ? '-' + groups[4] : ''}`.trim()
  }

  const formatTr = (val: string) => {
    const part = val.substring(0, 11)
    const groups = [part.slice(0, 2), part.slice(2, 5), part.slice(5, 8), part.slice(8, 10), part.slice(10, 12)].filter(Boolean)
    return `+${groups[0] || '90'} (${groups[1] || ''}) ${groups[2] || ''}${groups[3] ? ' ' + groups[3] : ''}${groups[4] ? ' ' + groups[4] : ''}`.trim()
  }

  switch (country) {
    case 'uz':
      return formatUz(digits.startsWith('998') ? digits : `998${digits}`)
    case 'ru':
      return formatRu(digits.startsWith('7') ? digits : `7${digits}`)
    case 'tr':
      return formatTr(digits.startsWith('90') ? digits : `90${digits}`)
    default:
      return `+${digits}`
  }
}

const phoneField = computed({
  get: () => form.phone,
  set: (value: string) => {
    form.phone = formatPhoneByCountry(value, form.phoneCountry)
  }
})

watch(() => form.phoneCountry, () => {
  form.phone = formatPhoneByCountry(form.phone, form.phoneCountry)
})

// To'lov turiga qarab tugash sanasini hisoblash
const calculateEndDate = (startDate: string, membershipType: string): string | null => {
  if (!startDate || !membershipType || membershipType === 'other') {
    return null
  }
  
  const start = new Date(startDate)
  if (Number.isNaN(start.getTime())) {
    return null
  }
  
  const end = new Date(start)
  
  switch (membershipType) {
    case 'monthly':
      end.setMonth(end.getMonth() + 1)
      break
    case 'quarterly':
      end.setMonth(end.getMonth() + 3)
      break
    case 'yearly':
      end.setFullYear(end.getFullYear() + 1)
      break
    default:
      return null
  }
  
  return end.toISOString().slice(0, 10)
}

// To'lov turi yoki boshlanish sanasi o'zgarganda tugash sanasini yangilash
watch([() => gymInfo.membershipType, () => form.registrationDate], ([membershipType, startDate]) => {
  if (membershipType && startDate && (form.serviceType === 'gym' || form.serviceType === 'both')) {
    const calculatedEndDate = calculateEndDate(startDate, membershipType)
    if (calculatedEndDate) {
      // gymEnd maydonini yangilash (agar mavjud bo'lsa)
      // Bu form.registrationDate ga asoslanadi
    }
  }
}, { immediate: false })

// Sahifaga kirganda avtomatik ID generatsiya qilish
const generatePreviewId = async () => {
  if (isEditMode.value) return // Edit rejimida ID generatsiya qilmaymiz
  
  try {
    // Backend'dan preview ID olish
    const { data } = await api.post('/members/preview-id')
    if (data.qrCodeId) {
      form.qrCodeId = data.qrCodeId
    }
  } catch (err) {
    console.error('Preview ID generatsiya qilishda xatolik:', err)
    // Agar xatolik bo'lsa, client-side generatsiya qilish (TGC + 6 ta belgi)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let uniquePart = ''
    for (let i = 0; i < 6; i++) {
      uniquePart += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    form.qrCodeId = `TGC${uniquePart}` // TGC har doim qo'shiladi
  }
}

// Edit rejimida a'zo ma'lumotlarini yuklash
const existingPhoto = ref<string | null>(null) // Edit mode'da mavjud photo'ni saqlash
const loadMemberData = async () => {
  if (!isEditMode.value || !memberId.value) return
  
  try {
    const [memberRes, gymRes, healthRes] = await Promise.all([
      api.get(`/members/${memberId.value}`),
      api.get(`/members/${memberId.value}/gym-info`).catch(() => ({ data: null })),
      api.get(`/members/${memberId.value}/beauty-health`).catch(() => ({ data: null }))
    ])
    
    const member = memberRes.data
    
    // Form ma'lumotlarini to'ldirish
    form.fullName = member.fullName || ''
    form.birthDate = member.birthDate ? new Date(member.birthDate).toISOString().slice(0, 10) : ''
    form.qrCodeId = member.qrCodeId || ''
    form.phone = member.phone || ''
    form.email = member.email || ''
    form.region = member.region || ''
    form.district = member.district || ''
    
    if (member.joinDate) {
      form.registrationDate = new Date(member.joinDate).toISOString().slice(0, 10)
    }
    
    if (member.photo) {
      photoPreview.value = member.photo
      existingPhoto.value = member.photo // Mavjud photo'ni saqlash
    }
    
    // Telefon kodini aniqlash
    if (member.phone) {
      if (member.phone.startsWith('+998')) form.phoneCountry = 'uz'
      else if (member.phone.startsWith('+7')) form.phoneCountry = 'ru'
      else if (member.phone.startsWith('+90')) form.phoneCountry = 'tr'
    }
    
    // Service type ni aniqlash
    if (member.gymActive === 1 && member.beautyHasRecord === 1) {
      form.serviceType = 'both'
    } else if (member.beautyHasRecord === 1) {
      form.serviceType = 'beauty'
    } else {
      form.serviceType = 'gym'
    }
    
    // Gym ma'lumotlarini to'ldirish
    if (gymRes.data) {
      const gym = gymRes.data
      gymInfo.emergencyName = gym.emergencyName || ''
      gymInfo.emergencyPhone = gym.emergencyPhone || ''
      gymInfo.emergencyRelation = gym.emergencyRelation || ''
      gymInfo.medicalConditions = gym.medicalConditions || ''
      gymInfo.medications = gym.medications || ''
      gymInfo.fitnessGoals = gym.fitnessGoals || ''
      gymInfo.membershipType = gym.membershipType || 'monthly'
      gymInfo.membershipTypeOther = gym.membershipTypeOther || ''
      gymInfo.paymentMethod = gym.paymentMethod || 'cash'
      gymInfo.paymentMethodOther = gym.paymentMethodOther || ''
    }
    
    // Beauty health ma'lumotlarini to'ldirish
    if (healthRes.data) {
      const health = healthRes.data
      beautyHealth.bloodPressure = health.bloodPressure || null
      beautyHealth.diabetes = health.diabetes || null
      beautyHealth.cancer = health.cancer || null
      beautyHealth.cancerDetails = health.cancerDetails || ''
      beautyHealth.cancerTreatment = health.cancerTreatment || null
      beautyHealth.cancerTreatmentDetails = health.cancerTreatmentDetails || ''
      beautyHealth.hormonal = health.hormonal || null
      beautyHealth.thyroid = health.thyroid || null
      beautyHealth.skin = health.skin || null
      beautyHealth.skinDetails = health.skinDetails || ''
      beautyHealth.alcohol = health.alcohol || null
      beautyHealth.prosthesis = health.prosthesis || null
      beautyHealth.platinum = health.platinum || null
      beautyHealth.implants = health.implants || null
      beautyHealth.crowns = health.crowns || null
      beautyHealth.surgery = health.surgery || null
      beautyHealth.surgeryDetails = health.surgeryDetails || ''
      beautyHealth.surgeryDate = health.surgeryDate ? new Date(health.surgeryDate).toISOString().slice(0, 10) : ''
      beautyHealth.smoking = health.smoking || null
      beautyHealth.medications = health.medications || ''
    }
  } catch (err: any) {
    console.error('A\'zo ma\'lumotlarini yuklashda xatolik:', err)
    submitError.value = err?.response?.data?.error || t('memberCreate.errorLoading')
  }
}

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) {
    photoPreview.value = null
    form.photo = null
    return
  }

  // Fayl hajmini tekshirish (5MB)
  if (file.size > 5 * 1024 * 1024) {
    submitError.value = t('memberCreate.photoSizeError')
    target.value = ''
    return
  }

  // Fayl formatini tekshirish
  if (!file.type.startsWith('image/')) {
    submitError.value = t('memberCreate.photoFormatError')
    target.value = ''
    return
  }

  // Base64 formatiga o'tkazish
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    photoPreview.value = result
    form.photo = file
  }
  reader.onerror = () => {
    submitError.value = t('memberCreate.photoReadError')
    target.value = ''
  }
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  photoPreview.value = null
  form.photo = null
  existingPhoto.value = null // Edit mode'da ham o'chirilganda existingPhoto'ni ham tozalash
  const fileInput = document.getElementById('photo') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}


onMounted(async () => {
  if (isEditMode.value) {
    await loadMemberData()
  } else {
  generatePreviewId()
  }
})

const handleSubmit = async () => {
  submitError.value = null
  submitSuccess.value = null

  if (!form.fullName || !form.phone) {
    submitError.value = t('common.error')
    return
  }

  // Photo majburiy tekshiruvi
  // Edit mode'da agar mavjud photo bo'lsa, yangi photo majburiy emas
  // Lekin agar mavjud photo bo'lmasa yoki yangi photo yuklanmagan bo'lsa, xato
  if (!isEditMode.value) {
    // Create mode: photo majburiy
    if (!photoPreview.value && !form.photo) {
      submitError.value = t('memberCreate.photoRequired')
      return
    }
  } else {
    // Edit mode: agar mavjud photo bo'lmasa va yangi photo yuklanmagan bo'lsa, xato
    if (!existingPhoto.value && !photoPreview.value && !form.photo) {
      submitError.value = t('memberCreate.photoRequired')
      return
    }
  }

  submitting.value = true
  saveStatus.value = 'saving'
  saveProgress.value = t('memberCreate.preparingData')
  
  try {
    // Agar form.qrCodeId bo'sh bo'lsa, yangi generatsiya qilish
    saveProgress.value = t('memberCreate.generatingId')
    let finalQrCodeId = form.qrCodeId.trim()
    if (!finalQrCodeId) {
      // Preview ID'ni ishlatish yoki yangi generatsiya qilish
      const previewRes = await api.post('/members/preview-id')
      finalQrCodeId = previewRes.data.qrCodeId
      form.qrCodeId = finalQrCodeId
    }

    // Sana va hozirgi vaqtni birga yuborish (O'zbekiston vaqt mintaqasida)
    // Hozirgi vaqtni O'zbekiston vaqt mintaqasida olish (UTC+5)
    const now = new Date()
    // O'zbekiston vaqt mintaqasida hozirgi vaqtni olish
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tashkent',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    const timeParts = formatter.formatToParts(now)
    const hours = timeParts.find(p => p.type === 'hour')?.value || '00'
    const minutes = timeParts.find(p => p.type === 'minute')?.value || '00'
    const seconds = timeParts.find(p => p.type === 'second')?.value || '00'
    
    // Tanlangan sanani O'zbekiston vaqt mintaqasidagi hozirgi vaqt bilan birlashtirish
    const dateWithTime = form.registrationDate 
      ? new Date(`${form.registrationDate}T${hours}:${minutes}:${seconds}+05:00`).toISOString()
      : null

    // To'lov turiga qarab tugash sanasini hisoblash
    let gymEndDate = dateWithTime
    if (dateWithTime && (form.serviceType === 'gym' || form.serviceType === 'both') && gymInfo.membershipType && gymInfo.membershipType !== 'other') {
      const calculatedEndDate = calculateEndDate(form.registrationDate, gymInfo.membershipType)
      if (calculatedEndDate) {
        // Tugash sanasini ham hozirgi vaqt bilan birlashtirish
        const endDateWithTime = new Date(`${calculatedEndDate}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}+05:00`).toISOString()
        gymEndDate = endDateWithTime
      }
    }

    // Photo'ni to'g'ri yuborish: yangi photo bo'lsa uni, aks holda existingPhoto'ni yuborish
    const photoToSend = photoPreview.value || (isEditMode.value && existingPhoto.value) || null

    const payload = {
      fullName: form.fullName,
      phone: form.phone,
      qrCodeId: finalQrCodeId,
      joinDate: dateWithTime,
      // Backwards compatibility - gym sanalarini members jadvaliga ham yozish
      gymStart: (form.serviceType === 'gym' || form.serviceType === 'both') ? dateWithTime : null,
      gymEnd: (form.serviceType === 'gym' || form.serviceType === 'both') ? gymEndDate : null,
      gymActive: form.serviceType === 'beauty' ? 0 : 1,
      photo: photoToSend,
      birthDate: form.birthDate || null,
      email: form.email || null,
      region: form.region || null,
      district: form.district || null
    }

    if (isEditMode.value && memberId.value) {
      // Edit rejimi - PUT so'rovi
      await api.put(`/members/${memberId.value}`, payload)
      
      // Agar gym yoki both tanlangan bo'lsa, gym ma'lumotlarini yangilash
      if (form.serviceType === 'gym' || form.serviceType === 'both') {
        const gymPayload = {
          memberId: memberId.value,
          ...gymInfo
        }
        await api.post('/members/gym-info', gymPayload)
      }

      // Agar beauty yoki both tanlangan bo'lsa, sog'liq ma'lumotlarini yangilash
      if (showsBeautySection.value) {
        const healthPayload = {
          memberId: memberId.value,
          ...beautyHealth
        }
        await api.post('/members/beauty-health', healthPayload)
      }
      
      saveProgress.value = t('memberCreate.completed')
      saveStatus.value = 'saved'
      submitSuccess.value = t('memberCreate.updateSuccess')
      
      setTimeout(() => {
        router.push(`/members/${memberId.value}`)
      }, 1500)
    } else {
      // Yangi a'zo qo'shish - POST so'rovi
      saveProgress.value = t('memberCreate.savingMember')
    const memberRes = await api.post('/members', payload)
      const newMemberId = memberRes.data.id
    const qrCode = memberRes.data.qrCodeId
    
    // Generatsiya qilingan ID'ni ko'rsatish
    if (qrCode) {
      generatedQrCode.value = qrCode
      form.qrCodeId = qrCode
    }

    // Agar gym yoki both tanlangan bo'lsa, gym membership yaratish
      if ((form.serviceType === 'gym' || form.serviceType === 'both') && newMemberId) {
        saveProgress.value = t('memberCreate.savingGymInfo')
        
        // Gym membership yaratish
        const gymMembershipPayload = {
          memberId: newMemberId,
          startDate: dateWithTime,
          endDate: gymEndDate,
          membershipType: gymInfo.membershipType
        }
        await api.post('/gym-memberships', gymMembershipPayload)
        
        // Gym info saqlash
      const gymPayload = {
          memberId: newMemberId,
        ...gymInfo
      }
      await api.post('/members/gym-info', gymPayload)
    }

    // Agar beauty yoki both tanlangan bo'lsa, sog'liq ma'lumotlarini saqlash
      if (showsBeautySection.value && newMemberId) {
        saveProgress.value = t('memberCreate.savingHealthInfo')
      const healthPayload = {
          memberId: newMemberId,
        ...beautyHealth
      }
      await api.post('/members/beauty-health', healthPayload)
    }

      saveProgress.value = t('memberCreate.completed')
      saveStatus.value = 'saved'
      submitSuccess.value = t('memberCreate.success') + (qrCode ? '. ID: ' + qrCode : '')
    
    setTimeout(() => {
      router.push('/members')
    }, 2000)
    }
  } catch (err: any) {
    console.error(err)
    saveStatus.value = 'error'
    saveProgress.value = ''
    submitError.value = err?.response?.data?.error || t('memberCreate.error')
  } finally {
    submitting.value = false
    if (saveStatus.value !== 'error') {
      // Muvaffaqiyatli bo'lsa, progress'ni tozalash
      setTimeout(() => {
        saveProgress.value = ''
      }, 1000)
    }
  }
}
</script>

<style scoped>
.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}
.input {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}
.input:focus {
  border-color: #0ea5e9;
  outline: none;
  box-shadow: 0 0 0 1px #0ea5e9;
}
:global(.dark) .input-label {
  color: var(--app-text-muted);
}
:global(.dark) .input {
  border-color: var(--app-input-border);
}
</style>
