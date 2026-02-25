<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-2">
      <RouterLink :to="isEditMode ? `/members/${memberId}` : '/members'" class="text-sm text-sky-600 hover:text-sky-500">&larr; {{ isEditMode ? $t('memberDetail.backToMembers') : $t('memberCreate.backToMembers') }}</RouterLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ isEditMode ? $t('memberCreate.editTitle') : $t('memberCreate.title') }}</h1>
        <p class="text-sm text-gray-500">{{ isEditMode ? $t('memberCreate.editSubtitle') : $t('memberCreate.subtitle') }}</p>
      </div>
    </div>

    <LoadingSpinner v-if="pageLoading" />

    <form v-else class="space-y-8" @submit.prevent="handleSubmit">
      <section class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50">
          <h2 class="text-base sm:text-lg font-semibold text-gray-900">{{ $t('memberCreate.basicInfo') }}</h2>
          <p class="text-xs sm:text-sm text-gray-500">{{ $t('memberCreate.basicInfoSubtitle') }}</p>
        </div>
        <div class="grid gap-4 px-4 sm:px-6 py-4 sm:py-6 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="input-label" for="fullName">
              {{ $t('memberCreate.fullName') }} <span class="text-red-500">*</span>
            </label>
            <input 
              id="fullName" 
              v-model="form.fullName" 
              type="text" 
              required 
              class="input focus:ring-2" 
              :class="!form.fullName && submitAttempted ? 'border-red-300 bg-red-50' : ''"
              :placeholder="$t('memberCreate.fullNamePlaceholder')" 
            />
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
              :class="isEditMode ? 'input font-mono' : 'input bg-gray-50 cursor-not-allowed font-mono text-gray-500'" 
              :placeholder="$t('common.loading')"
            />
            <p v-if="!isEditMode" class="mt-1 text-xs text-gray-400 italic">{{ $t('memberCreate.idAuto') }}</p>
          </div>

          <div class="md:col-span-2">
            <label class="input-label" for="phone">
              {{ $t('memberCreate.phone') }} <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <select v-model="form.phoneCountry" class="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20">
                <option value="uz">🇺🇿 UZ</option>
                <option value="ru">🇷🇺 RU</option>
                <option value="tr">🇹🇷 TR</option>
              </select>
              <div class="relative flex-1">
                <input 
                  id="phone" 
                  v-model="phoneField" 
                  type="tel" 
                  required 
                  class="w-full input focus:ring-2" 
                  :class="[
                    (phoneError || phoneConflict) ? 'border-red-300 bg-red-50' : '',
                    isPhoneValid && !phoneConflict ? 'border-green-300 bg-green-50' : ''
                  ]"
                  :placeholder="$t('memberCreate.phonePlaceholder')" 
                  :maxlength="phoneMaxLength" 
                />
                <div v-if="checkingPhone" class="absolute right-3 top-2.5">
                  <div class="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent"></div>
                </div>
              </div>
            </div>
            <p v-if="phoneConflict" class="mt-1 text-xs font-medium text-red-600">{{ phoneConflict }}</p>
            <p v-else-if="phoneError" class="mt-1 text-xs font-medium text-red-600">{{ phoneError }}</p>
          </div>

          <div>
            <label class="input-label" for="email">{{ $t('memberCreate.email') }}</label>
            <input id="email" v-model="form.email" type="email" class="input" :placeholder="$t('memberCreate.emailPlaceholder')" />
          </div>

          <div>
            <label class="input-label" for="registrationDate">{{ $t('memberCreate.registrationDate') }} <span class="text-red-500">*</span></label>
            <input id="registrationDate" v-model="form.registrationDate" type="date" required class="input" />
          </div>

          <div>
            <label class="input-label" for="region">{{ $t('memberCreate.region') }}</label>
            <input id="region" v-model="form.region" type="text" class="input" :placeholder="$t('memberCreate.regionPlaceholder')" />
          </div>

          <div>
            <label class="input-label" for="district">{{ $t('memberCreate.district') }}</label>
            <input id="district" v-model="form.district" type="text" class="input" :placeholder="$t('memberCreate.districtPlaceholder')" />
          </div>

          <div class="md:col-span-2">
            <label class="input-label" for="photo">{{ $t('memberCreate.photo') }}</label>
            <div class="mt-2 flex items-center gap-4">
              <div v-if="photoPreview" class="relative group">
                <img :src="photoPreview" alt="Preview" class="h-24 w-24 rounded-lg border-2 border-gray-100 object-cover shadow-sm" />
                <button
                  type="button"
                  @click="removePhoto"
                  class="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="flex-1">
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  @change="handlePhotoUpload"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                />
                <p class="mt-1 text-xs text-gray-400">{{ $t('memberCreate.photoFormat') }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('memberCreate.additionalInfo') }}</h2>
          <p class="text-sm text-gray-500">{{ $t('memberCreate.additionalInfoSubtitle') }}</p>
        </div>
        <div class="space-y-6 px-4 sm:px-6 py-4 sm:py-6">
          <div class="md:flex md:items-center md:gap-4">
            <label class="input-label md:w-48">{{ $t('memberCreate.serviceType') }} <span class="text-red-500">*</span></label>
            <select v-model="form.serviceType" class="input md:flex-1 bg-white" required>
              <option value="gym">{{ $t('memberCreate.serviceTypeGym') }}</option>
              <option value="beauty">{{ $t('memberCreate.serviceTypeBeauty') }}</option>
              <option value="both">{{ $t('memberCreate.serviceTypeBoth') }}</option>
            </select>
          </div>

          <!-- Gym Additional Information -->
          <div v-if="form.serviceType === 'gym' || form.serviceType === 'both'" class="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
            <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
              <h3 class="text-base font-semibold text-sky-900">{{ $t('memberCreate.gymInfo') }}</h3>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <!-- Emergency Contact -->
              <div class="rounded-xl border border-gray-100 bg-blue-50/30 p-4 space-y-4">
                <h4 class="text-sm font-bold text-blue-900 uppercase tracking-tight flex items-center gap-2">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {{ $t('memberCreate.emergencyContact') }}
                </h4>
                <div class="space-y-3">
                  <div>
                    <label class="input-label text-blue-800" for="emergencyName">{{ $t('memberCreate.emergencyName') }}</label>
                    <input id="emergencyName" v-model="gymInfo.emergencyName" type="text" class="input bg-white" :placeholder="$t('memberCreate.emergencyNamePlaceholder')" />
                  </div>
                  <div>
                    <label class="input-label text-blue-800" for="emergencyPhone">{{ $t('memberCreate.emergencyPhone') }}</label>
                    <input id="emergencyPhone" v-model="gymInfo.emergencyPhone" type="text" class="input bg-white" :placeholder="$t('memberCreate.emergencyPhonePlaceholder')" />
                  </div>
                  <div>
                    <label class="input-label text-blue-800" for="emergencyRelation">{{ $t('memberCreate.emergencyRelation') }}</label>
                    <input id="emergencyRelation" v-model="gymInfo.emergencyRelation" type="text" class="input bg-white" :placeholder="$t('memberCreate.emergencyRelationPlaceholder')" />
                  </div>
                </div>
              </div>

              <!-- Health and Fitness -->
              <div class="rounded-xl border border-gray-100 bg-emerald-50/30 p-4 space-y-4">
                <h4 class="text-sm font-bold text-emerald-900 uppercase tracking-tight flex items-center gap-2">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {{ $t('memberCreate.healthInfo') }}
                </h4>
                <div class="space-y-3">
                  <div>
                    <label class="input-label text-emerald-800" for="medicalConditions">{{ $t('memberCreate.medicalConditions') }}</label>
                    <textarea id="medicalConditions" v-model="gymInfo.medicalConditions" rows="2" class="input bg-white" :placeholder="$t('memberCreate.medicalConditionsPlaceholder')"></textarea>
                  </div>
                  <div>
                    <label class="input-label text-emerald-800" for="gymMedications">{{ $t('memberCreate.medications') }}</label>
                    <textarea id="gymMedications" v-model="gymInfo.medications" rows="2" class="input bg-white" :placeholder="$t('memberCreate.medicationsPlaceholder')"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Membership Details -->
            <div class="grid gap-6 md:grid-cols-2">
               <div>
                <label class="input-label text-gray-700">{{ $t('memberCreate.membershipType') }} <span class="text-red-500">*</span></label>
                <div class="mt-2 grid grid-cols-2 gap-2">
                  <button 
                    v-for="type in ['monthly', 'quarterly', 'yearly', 'other']" 
                    :key="type"
                    type="button"
                    @click="gymInfo.membershipType = type"
                    :class="gymInfo.membershipType === type ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                    class="rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                  >
                    {{ $t(`memberCreate.membership${type.charAt(0).toUpperCase() + type.slice(1)}`) }}
                  </button>
                </div>
                <div v-if="gymInfo.membershipType === 'other'" class="mt-2 animate-in fade-in duration-200">
                  <input v-model="gymInfo.membershipTypeOther" type="text" class="input" :placeholder="$t('memberCreate.specifyPlaceholder')" />
                </div>
              </div>

              <div>
                <label class="input-label text-gray-700">{{ $t('memberCreate.paymentMethod') }} <span class="text-red-500">*</span></label>
                <div class="mt-2 flex gap-3">
                  <button 
                    v-for="method in ['cash', 'card', 'other']" 
                    :key="method"
                    type="button"
                    @click="gymInfo.paymentMethod = method"
                    :class="gymInfo.paymentMethod === method ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                    class="flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                  >
                    {{ $t(`memberCreate.payment${method.charAt(0).toUpperCase() + method.slice(1)}`) }}
                  </button>
                </div>
                <div v-if="gymInfo.paymentMethod === 'other'" class="mt-2 animate-in fade-in duration-200">
                  <input v-model="gymInfo.paymentMethodOther" type="text" class="input" :placeholder="$t('memberCreate.paymentOther')" />
                </div>
              </div>
            </div>
          </div>

          <!-- Beauty Health Section -->
          <div v-if="showsBeautySection" class="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
            <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
              <h3 class="text-base font-semibold text-purple-900">{{ $t('memberCreate.beautyHealth') }}</h3>
            </div>
            
            <div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-purple-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-bold text-purple-900">{{ $t('memberCreate.healthCondition') }}</th>
                    <th class="px-4 py-3 text-center text-sm font-bold text-purple-900 w-16">{{ $t('common.yes') }}</th>
                    <th class="px-4 py-3 text-center text-sm font-bold text-purple-900 w-16">{{ $t('common.no') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="question in beautyQuestions" :key="question.key" class="align-top hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-700">
                      <span class="font-medium">{{ $t(question.labelKey) }}</span>
                      <div v-if="question.detailKey && beautyHealth[question.key] === 'yes'" class="mt-2 animate-in fade-in slide-in-from-left-2 duration-200">
                        <textarea
                          :id="question.key + '-detail'"
                          v-model="beautyHealth[question.detailKey]"
                          rows="2"
                          class="w-full rounded-lg border border-purple-100 bg-purple-50/30 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                          :placeholder="question.detailPlaceholderKey ? $t(question.detailPlaceholderKey) : $t('memberCreate.detailsPlaceholder')"
                        ></textarea>
                      </div>
                      <div v-if="question.extraDateKey && beautyHealth[question.key] === 'yes'" class="mt-2">
                        <input
                          :id="question.key + '-date'"
                          v-model="beautyHealth[question.extraDateKey]"
                          type="date"
                          class="w-full rounded-lg border border-purple-100 bg-purple-50/30 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                        />
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                      <input
                        class="h-5 w-5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        type="radio"
                        :name="question.key"
                        value="yes"
                        v-model="beautyHealth[question.key]"
                      />
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                      <input
                        class="h-5 w-5 text-gray-400 focus:ring-gray-400 cursor-pointer"
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
              <label class="input-label text-purple-900" for="medications">{{ $t('memberCreate.medications') }}</label>
              <textarea
                id="medications"
                v-model="beautyHealth.medications"
                rows="3"
                class="input border-purple-100 focus:border-purple-400 focus:ring-purple-400/20"
                :placeholder="$t('memberCreate.medicationsPlaceholder')"
              ></textarea>
            </div>
          </div>
        </div>
      </section>

      <!-- Feedback States -->
      <div v-if="submitting" class="rounded-xl border border-blue-200 bg-blue-50 p-4 animate-pulse">
        <div class="flex items-center gap-3">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <div>
            <p class="text-sm font-bold text-blue-900">{{ saveProgress || $t('memberCreate.saving') }}</p>
            <p class="text-xs text-blue-700">{{ $t('memberCreate.savingToDatabase') }}</p>
          </div>
        </div>
      </div>

      <div v-if="submitError" class="rounded-xl border border-red-200 bg-red-50 p-4">
        <div class="flex items-start gap-3">
          <svg class="h-6 w-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-bold text-red-900">{{ $t('memberCreate.error') }}</p>
            <p class="mt-1 text-sm text-red-700">{{ submitError }}</p>
          </div>
        </div>
      </div>

      <div v-if="submitSuccess && !submitting" class="rounded-xl border border-green-200 bg-green-50 p-4">
        <div class="flex items-start gap-3">
          <svg class="h-6 w-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-bold text-green-900">{{ $t('memberCreate.success') }}</p>
            <p class="mt-1 text-sm text-green-700">{{ submitSuccess }}</p>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t border-gray-100 rounded-b-xl z-10 shadow-lg sm:p-6">
        <RouterLink :to="isEditMode ? `/members/${memberId}` : '/members'" class="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">{{ $t('common.cancel') }}</RouterLink>
        <button 
          type="submit" 
          class="rounded-lg bg-sky-600 px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-sky-500 hover:shadow-lg focus:ring-4 focus:ring-sky-100 active:scale-95 transition-all disabled:cursor-not-allowed disabled:opacity-60" 
          :disabled="submitting || !!phoneConflict || !!phoneError || (submitAttempted && !isFormValid)"
        >
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
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { membersService, gymMembershipsService, generateQrCodeId, storageService, supabase } from '../services/supabaseService'
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
  registrationDate: getCurrentDateInput(),
  region: '',
  district: '',
  serviceType: 'gym',
  photo: null as File | null
})

const photoPreview = ref<string | null>(null)
const selectedPhotoFile = ref<File | null>(null)
const existingPhoto = ref<string | null>(null)

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
  { key: 'bloodPressure', labelKey: 'memberCreate.beautyQuestionBloodPressure' },
  { key: 'diabetes', labelKey: 'memberCreate.beautyQuestionDiabetes' },
  { key: 'cancer', labelKey: 'memberCreate.beautyQuestionCancer', detailKey: 'cancerDetails', detailPlaceholderKey: 'memberCreate.beautyQuestionCancerDetails' },
  { key: 'cancerTreatment', labelKey: 'memberCreate.beautyQuestionCancerTreatment', detailKey: 'cancerTreatmentDetails', detailPlaceholderKey: 'memberCreate.beautyQuestionCancerTreatmentDetails' },
  { key: 'hormonal', labelKey: 'memberCreate.beautyQuestionHormonal' },
  { key: 'thyroid', labelKey: 'memberCreate.beautyQuestionThyroid' },
  { key: 'skin', labelKey: 'memberCreate.beautyQuestionSkin', detailKey: 'skinDetails', detailPlaceholderKey: 'memberCreate.beautyQuestionSkinDetails' },
  { key: 'alcohol', labelKey: 'memberCreate.beautyQuestionAlcohol' },
  { key: 'prosthesis', labelKey: 'memberCreate.beautyQuestionProsthesis' },
  { key: 'platinum', labelKey: 'memberCreate.beautyQuestionPlatinum' },
  { key: 'implants', labelKey: 'memberCreate.beautyQuestionImplants' },
  { key: 'crowns', labelKey: 'memberCreate.beautyQuestionCrowns' },
  { key: 'surgery', labelKey: 'memberCreate.beautyQuestionSurgery', detailKey: 'surgeryDetails', detailPlaceholderKey: 'memberCreate.beautyQuestionSurgeryDetails', extraDateKey: 'surgeryDate' },
  { key: 'smoking', labelKey: 'memberCreate.beautyQuestionSmoking' }
]

const submitting = ref(false)
const pageLoading = ref(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref<string | null>(null)
const submitAttempted = ref(false)
const saveProgress = ref<string>('')

// Phone Validation & Duplicate Check
const checkingPhone = ref(false)
const phoneConflict = ref<string | null>(null)
const phoneError = ref<string | null>(null)

const isPhoneValid = computed(() => {
  const digits = form.phone.replace(/\D/g, '')
  switch (form.phoneCountry) {
    case 'uz': return digits.length === 12 // +998 (XX) XXX-XX-XX
    case 'ru': return digits.length === 11 // +7 (XXX) XXX-XX-XX
    case 'tr': return digits.length === 12 // +90 (XXX) XXX-XX-XX
    default: return digits.length >= 9
  }
})

const isFormValid = computed(() => {
  return form.fullName && isPhoneValid.value && !phoneConflict.value
})

let checkTimeout: any = null
const checkPhoneExists = async (phone: string) => {
  if (!phone || phone.length < 5) return
  if (isEditMode.value) return 

  checkingPhone.value = true
  phoneConflict.value = null
  
  try {
    const { data } = await supabase
      .from('members')
      .select('fullname')
      .eq('phone', phone)
      .maybeSingle()
    
    if (data) {
      phoneConflict.value = t('errorPhoneExists', { name: data.fullname }) || `Bu raqam band: ${data.fullname}`
    }
  } catch (err) {
    console.error('Phone check failed:', err)
  } finally {
    checkingPhone.value = false
  }
}

const phoneField = computed({
  get: () => form.phone,
  set: (value: string) => {
    form.phone = formatPhoneByCountry(value, form.phoneCountry)
    
    const digits = form.phone.replace(/\D/g, '')
    if (form.phoneCountry === 'uz' && digits.length > 3 && digits.length < 12) {
      phoneError.value = "Raqam noto'g'ri yoki to'liq emas"
    } else {
      phoneError.value = null
    }

    clearTimeout(checkTimeout)
    if (isPhoneValid.value) {
      checkTimeout = setTimeout(() => checkPhoneExists(form.phone), 600)
    }
  }
})

const phoneMaxLength = computed(() => {
  switch (form.phoneCountry) {
    case 'uz': return 17
    case 'ru': return 18
    case 'tr': return 19
    default: return 20
  }
})

const formatPhoneByCountry = (value: string, country: string) => {
  let digits = value.replace(/\D/g, '')
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
    const part = val.substring(0, 12)
    const groups = [part.slice(0, 2), part.slice(2, 5), part.slice(5, 8), part.slice(8, 10), part.slice(10, 12)].filter(Boolean)
    return `+${groups[0] || '90'} (${groups[1] || ''}) ${groups[2] || ''}${groups[3] ? ' ' + groups[3] : ''}${groups[4] ? ' ' + groups[4] : ''}`.trim()
  }

  switch (country) {
    case 'uz': {
      let d = digits.startsWith('998') ? digits : `998${digits}`
      return formatUz(d.substring(0, 12))
    }
    case 'ru': {
      let d = digits.startsWith('7') ? digits : `7${digits}`
      return formatRu(d.substring(0, 11))
    }
    case 'tr': {
      let d = digits.startsWith('90') ? digits : `90${digits}`
      return formatTr(d.substring(0, 12))
    }
    default:
      return `+${digits}`
  }
}

watch(() => form.phoneCountry, () => {
  form.phone = formatPhoneByCountry(form.phone, form.phoneCountry)
  if (isPhoneValid.value) checkPhoneExists(form.phone)
})

const showsBeautySection = computed(() => form.serviceType === 'beauty' || form.serviceType === 'both')

const calculateEndDate = (startDate: string, membershipType: string): string | null => {
  if (!startDate || !membershipType || membershipType === 'other') return null
  const start = new Date(startDate)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start)
  switch (membershipType) {
    case 'monthly': end.setMonth(end.getMonth() + 1); break
    case 'quarterly': end.setMonth(end.getMonth() + 3); break
    case 'yearly': end.setFullYear(end.getFullYear() + 1); break
    default: return null
  }
  return end.toISOString().slice(0, 10)
}

const generatePreviewId = async () => {
  if (isEditMode.value) return
  form.qrCodeId = generateQrCodeId()
}

const loadMemberData = async () => {
  if (!isEditMode.value || !memberId.value) return
  pageLoading.value = true
  try {
    const [member, gym, health] = await Promise.all([
      membersService.getById(memberId.value),
      membersService.getGymInfo(memberId.value).catch(() => null),
      membersService.getBeautyHealth(memberId.value).catch(() => null)
    ])
    if (!member) throw new Error(t('memberCreate.errorLoading'))
    
    form.fullName = member.fullName || ''
    form.birthDate = member.birthDate ? new Date(member.birthDate).toISOString().slice(0, 10) : ''
    form.qrCodeId = member.qrCodeId || ''
    form.phone = member.phone || ''
    form.email = member.email || ''
    form.region = member.region || ''
    form.district = member.district || ''
    if (member.joinDate) form.registrationDate = new Date(member.joinDate).toISOString().slice(0, 10)
    if (member.photo) {
      existingPhoto.value = member.photo
      photoPreview.value = storageService.getMemberPhotoUrl(member.photo)
    }
    if (member.phone) {
      if (member.phone.startsWith('+998')) form.phoneCountry = 'uz'
      else if (member.phone.startsWith('+7')) form.phoneCountry = 'ru'
      else if (member.phone.startsWith('+90')) form.phoneCountry = 'tr'
    }
    if (member.gymActive === 1 && member.beautyHasRecord === 1) form.serviceType = 'both'
    else if (member.beautyHasRecord === 1) form.serviceType = 'beauty'
    else form.serviceType = 'gym'
    
    if (gym) {
      Object.assign(gymInfo, {
        emergencyName: gym.emergencyName || '',
        emergencyPhone: gym.emergencyPhone || '',
        emergencyRelation: gym.emergencyRelation || '',
        medicalConditions: gym.medicalConditions || '',
        medications: gym.medications || '',
        fitnessGoals: gym.fitnessGoals || '',
        membershipType: gym.membershipType || 'monthly',
        membershipTypeOther: gym.membershipTypeOther || '',
        paymentMethod: gym.paymentMethod || 'cash',
        paymentMethodOther: gym.paymentMethodOther || ''
      })
    }
    if (health) {
      Object.keys(beautyHealth).forEach(key => {
        beautyHealth[key] = health[key.toLowerCase()] || null
      })
      if (health.surgerydate) beautyHealth.surgeryDate = new Date(health.surgerydate).toISOString().slice(0, 10)
    }
  } catch (err: any) {
    console.error('Error loading member:', err)
    submitError.value = err.message || t('memberCreate.errorLoading')
  } finally {
    pageLoading.value = false
  }
}

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { submitError.value = t('memberCreate.photoSizeError'); return }
  if (!file.type.startsWith('image/')) { submitError.value = t('memberCreate.photoFormatError'); return }
  
  selectedPhotoFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  photoPreview.value = null
  selectedPhotoFile.value = null
  existingPhoto.value = null
}

onMounted(async () => {
  if (isEditMode.value) await loadMemberData()
  else generatePreviewId()
})

const handleSubmit = async () => {
  submitAttempted.value = true
  submitError.value = null
  submitSuccess.value = null
  
  if (!isFormValid.value) {
    submitError.value = "Iltimos, barcha majburiy maydonlarni to'g'ri to'ldiring."
    return
  }
  
  submitting.value = true
  saveProgress.value = t('memberCreate.preparingData')
  
  try {
    let finalQrCodeId = form.qrCodeId.trim() || generateQrCodeId()
    const now = new Date()
    const offset = '+05:00' 
    const timeStr = now.toISOString().split('T')[1].split('.')[0]
    const dateWithTime = form.registrationDate ? new Date(`${form.registrationDate}T${timeStr}${offset}`).toISOString() : null
    
    let gymEndDate = dateWithTime
    if (dateWithTime && (form.serviceType === 'gym' || form.serviceType === 'both') && gymInfo.membershipType !== 'other') {
      const calculatedEndDate = calculateEndDate(form.registrationDate, gymInfo.membershipType)
      if (calculatedEndDate) gymEndDate = new Date(`${calculatedEndDate}T${timeStr}${offset}`).toISOString()
    }

    let photoPath = existingPhoto.value
    if (selectedPhotoFile.value) {
      saveProgress.value = "Surat yuklanmoqda..."
      photoPath = await storageService.uploadMemberPhoto(selectedPhotoFile.value, finalQrCodeId)
    }

    const payload = {
      fullName: form.fullName,
      phone: form.phone,
      qrCodeId: finalQrCodeId,
      joinDate: dateWithTime,
      gymStart: (form.serviceType === 'gym' || form.serviceType === 'both') ? dateWithTime : null,
      gymEnd: (form.serviceType === 'gym' || form.serviceType === 'both') ? gymEndDate : null,
      gymActive: form.serviceType === 'beauty' ? 0 : 1,
      photo: photoPath,
      birthDate: form.birthDate || null,
      email: form.email || null,
      region: form.region || null,
      district: form.district || null,
      beautyHasRecord: showsBeautySection.value ? 1 : 0
    }

    if (isEditMode.value && memberId.value) {
      await membersService.update(memberId.value, payload)
      if (form.serviceType !== 'beauty') await membersService.upsertGymInfo(memberId.value, gymInfo)
      if (showsBeautySection.value) await membersService.upsertBeautyHealth(memberId.value, beautyHealth)
      
      submitSuccess.value = t('memberCreate.updateSuccess')
      setTimeout(() => router.push(`/members/${memberId.value}`), 1500)
    } else {
      const member = await membersService.create(payload)
      const newId = member.id
      if (form.serviceType !== 'beauty') {
        await gymMembershipsService.create({ memberId: newId, startDate: dateWithTime, endDate: gymEndDate, membershipType: gymInfo.membershipType })
        await membersService.upsertGymInfo(newId, gymInfo)
      }
      if (showsBeautySection.value) await membersService.upsertBeautyHealth(newId, beautyHealth)
      
      submitSuccess.value = t('memberCreate.success') + '. ID: ' + member.qrCodeId
      setTimeout(() => router.push('/members'), 2000)
    }
  } catch (err: any) {
    console.error('Submit error:', err)
    submitError.value = err.message || t('memberCreate.error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.input-label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.375rem; transition: color 0.2s; }
.input { width: 100%; border-radius: 10px; border: 1px solid #e5e7eb; padding: 0.625rem 0.875rem; font-size: 0.875rem; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.input:focus { border-color: #0ea5e9; outline: none; box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1); }
.input:hover:not(:focus) { border-color: #d1d5db; }
</style>
