<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-2">
      <RouterLink to="/members" class="text-sm text-sky-600 hover:text-sky-500">&larr; {{ $t('memberDetail.backToMembers') }}</RouterLink>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ member?.fullName || $t('memberDetail.loading') }}</h1>
          <p class="text-sm text-gray-500">{{ $t('memberDetail.title') }}</p>
        </div>
        <div class="flex gap-2">
          <RouterLink
            v-if="member"
            :to="`/members/${member.id}/edit`"
            class="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100"
          >
            {{ $t('common.edit') }}
          </RouterLink>
          <button
            class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            @click="fetchMember"
          >
            {{ $t('common.refresh') }}
          </button>
          <button
            class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            @click="onDeleteMember"
          >
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
    <LoadingSpinner v-if="loading" />

    <div v-else-if="member" class="space-y-6">
      <!-- Section info -->
      <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('memberDetail.basicInfo') }}</h2>
        </div>
        <div class="px-6 py-6">
          <div class="flex flex-col md:flex-row gap-6 mb-6">
            <div v-if="member.photo" class="flex-shrink-0">
              <img :src="storageService.getMemberPhotoUrl(member.photo) || ''" :alt="member.fullName" class="h-32 w-32 rounded-lg object-cover border-2 border-gray-200" />
            </div>
            <div v-else class="flex-shrink-0 h-32 w-32 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
              <svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div><label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.fullName') }}</label><p class="mt-1 text-sm font-medium text-gray-900">{{ member.fullName }}</p></div>
            <div><label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.phone') }}</label><p class="mt-1 text-sm text-gray-900">{{ member.phone || '—' }}</p></div>
            <div><label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.id') }}</label><p class="mt-1 text-sm text-gray-900 font-mono">{{ member.qrCodeId }}</p></div>
            <div><label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.joinDate') }}</label><p class="mt-1 text-sm text-gray-900">{{ formatDate(member.joinDate) }}</p></div>
            <div><label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.status') }}</label><p class="mt-1"><span :class="member.gymActive === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">{{ member.gymActive === 1 ? $t('common.active') : $t('common.inactive') }}</span></p></div>
            <div v-if="member.gymStart"><label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.gymStart') }}</label><p class="mt-1 text-sm text-gray-900">{{ formatDate(member.gymStart) }}</p></div>
            <div v-if="member.gymEnd"><label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.gymEnd') }}</label><p class="mt-1 text-sm text-gray-900">{{ formatDate(member.gymEnd) }}</p></div>
            <div v-if="member.lastUpdated"><label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.lastUpdated') }}</label><p class="mt-1 text-sm text-gray-900">{{ formatDateTime(member.lastUpdated) }}</p></div>
          </div>
        </div>
      </section>

      <!-- Gym & Health -->
      <div class="grid gap-6 md:grid-cols-2">
        <section v-if="gymInfo" class="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div class="border-b border-gray-100 px-6 py-4"><h2 class="text-lg font-semibold text-gray-900">{{ $t('memberDetail.gymInfo') }}</h2></div>
          <div class="px-6 py-6 space-y-4">
             <div v-if="gymInfo.membershipType">
               <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.membershipType') }}</label>
               <p class="text-sm">{{ getMembershipTypeLabel(gymInfo.membershipType, gymInfo.membershipTypeOther) }}</p>
             </div>
             <div v-if="gymInfo.paymentMethod">
               <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.paymentMethod') }}</label>
               <p class="text-sm">{{ getPaymentMethodLabel(gymInfo.paymentMethod, gymInfo.paymentMethodOther) }}</p>
             </div>
             <div v-if="gymInfo.emergencyName">
               <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.emergencyContact') }}</label>
               <p class="text-sm">{{ gymInfo.emergencyName }} ({{ gymInfo.emergencyPhone }})</p>
             </div>
          </div>
        </section>

        <section v-if="beautyHealth" class="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div class="border-b border-gray-100 px-6 py-4"><h2 class="text-lg font-semibold text-gray-900">{{ $t('memberDetail.healthProfile') }}</h2></div>
          <div class="px-6 py-6 space-y-2">
             <div v-for="q in beautyQuestions" :key="q.key" class="text-sm flex justify-between">
                <span class="text-gray-500">{{ $t(q.labelKey) }}</span>
                <span :class="beautyHealth[q.key] === 'yes' ? 'text-red-600 font-bold' : 'text-gray-400'">{{ renderHealthAnswer(beautyHealth[q.key]) }}</span>
             </div>
          </div>
        </section>
      </div>

      <!-- History -->
      <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4"><h2 class="text-lg font-semibold text-gray-900">{{ $t('memberDetail.checkinHistory') }}</h2></div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50"><tr><th class="py-3 px-6 text-left text-sm font-semibold">{{ $t('checkins.columns.dateTime') }}</th><th class="px-6 py-3 text-left text-sm font-semibold">{{ $t('checkins.columns.verifiedBy') }}</th></tr></thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="c in checkins" :key="c.id" class="hover:bg-gray-50"><td class="py-4 px-6 text-sm">{{ formatDateTime(c.date) }}</td><td class="px-6 py-4 text-sm">{{ c.verifiedBy || '—' }}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Beauty Services -->
      <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('memberDetail.beautyServices') }}</h2>
          <span class="text-xs text-gray-500">{{ $t('memberDetail.beautyTotal') }}: {{ beautyServices.length }} {{ $t('memberDetail.services') }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="py-3 px-6 text-left text-sm font-semibold">{{ $t('memberDetail.serviceName') }}</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">{{ $t('memberDetail.serviceDate') }}</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">{{ $t('memberDetail.note') }}</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">{{ $t('memberDetail.amount') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="s in beautyServices" :key="s.id" class="hover:bg-gray-50">
                <td class="py-4 px-6 text-sm font-medium text-gray-900">{{ s.serviceName }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(s.serviceDate) }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ s.note || '—' }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ formatCurrency(s.amount || 0) }}</td>
              </tr>
              <tr v-if="beautyServices.length === 0">
                <td colspan="4" class="px-6 py-6 text-center text-sm text-gray-500">{{ $t('memberDetail.noServices') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Sales History -->
      <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('memberDetail.salesHistory') }}</h2>
          <span class="text-xs text-gray-500">{{ $t('memberDetail.salesTotal') }}: {{ sales.length }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="py-3 px-6 text-left text-sm font-semibold">{{ $t('memberDetail.saleDate') }}</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">{{ $t('memberDetail.saleItems') }}</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">{{ $t('memberDetail.saleTotal') }}</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">{{ $t('memberDetail.paymentMethod') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="sale in sales" :key="sale.id" class="hover:bg-gray-50">
                <td class="py-4 px-6 text-sm text-gray-600">{{ formatDateTime(sale.createdAt) }}</td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  <div v-for="item in sale.items" :key="item.id" class="flex justify-between gap-4">
                    <span>{{ item.product?.name || $t('memberDetail.unknownProduct') }}</span>
                    <span class="text-gray-500">{{ item.qty }} × {{ formatCurrency(item.unitPrice) }}</span>
                  </div>
                  <div v-if="sale.items.length === 0" class="text-gray-400">—</div>
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-gray-900">{{ formatCurrency(sale.totalAmount) }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ sale.paymentMethod || '—' }}</td>
              </tr>
              <tr v-if="sales.length === 0">
                <td colspan="4" class="px-6 py-6 text-center text-sm text-gray-500">{{ $t('memberDetail.noSales') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Appointments -->
      <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('memberDetail.appointments') }}</h2>
          <span class="text-xs text-gray-500">{{ $t('memberDetail.appointmentsTotal') }}: {{ appointments.length }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="py-3 px-6 text-left text-sm font-semibold">{{ $t('memberDetail.appointmentDate') }}</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">{{ $t('memberDetail.appointmentService') }}</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">{{ $t('memberDetail.appointmentStaff') }}</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">{{ $t('memberDetail.appointmentRoom') }}</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">{{ $t('memberDetail.appointmentStatus') }}</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">{{ $t('memberDetail.appointmentPrice') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="app in appointments" :key="app.id" class="hover:bg-gray-50">
                <td class="py-4 px-6 text-sm text-gray-600">{{ formatDateTime(app.startTime) }}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ app.serviceName || '—' }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ app.staff?.fullName || '—' }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ app.room?.name || '—' }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ getAppointmentStatusLabel(app.status) }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ formatCurrency(app.price || 0) }}</td>
              </tr>
              <tr v-if="appointments.length === 0">
                <td colspan="6" class="px-6 py-6 text-center text-sm text-gray-500">{{ $t('memberDetail.noAppointments') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { membersService, checkinsService, beautyService, storageService, salesService, appointmentsService } from '../services/supabaseService'
import { formatDate, formatDateTime } from '../lib/dateUtils'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const memberId = computed(() => Number(route.params.id))

const member = ref<any>(null)
const checkins = ref<any[]>([])
const beautyServices = ref<any[]>([])
const sales = ref<any[]>([])
const appointments = ref<any[]>([])
const gymInfo = ref<any>(null)
const beautyHealth = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const beautyQuestions = [
  { key: 'bloodPressure', labelKey: 'memberCreate.beautyQuestionBloodPressure' },
  { key: 'diabetes', labelKey: 'memberCreate.beautyQuestionDiabetes' },
  { key: 'cancer', labelKey: 'memberCreate.beautyQuestionCancer' },
  { key: 'cancerTreatment', labelKey: 'memberCreate.beautyQuestionCancerTreatment' },
  { key: 'hormonal', labelKey: 'memberCreate.beautyQuestionHormonal' },
  { key: 'thyroid', labelKey: 'memberCreate.beautyQuestionThyroid' },
  { key: 'skin', labelKey: 'memberCreate.beautyQuestionSkin' },
  { key: 'alcohol', labelKey: 'memberCreate.beautyQuestionAlcohol' },
  { key: 'prosthesis', labelKey: 'memberCreate.beautyQuestionProsthesis' },
  { key: 'platinum', labelKey: 'memberCreate.beautyQuestionPlatinum' },
  { key: 'implants', labelKey: 'memberCreate.beautyQuestionImplants' },
  { key: 'crowns', labelKey: 'memberCreate.beautyQuestionCrowns' },
  { key: 'surgery', labelKey: 'memberCreate.beautyQuestionSurgery' },
  { key: 'smoking', labelKey: 'memberCreate.beautyQuestionSmoking' }
]

const renderHealthAnswer = (value: string | null) => {
  if (value === 'yes') return t('common.yes')
  if (value === 'no') return t('common.no')
  return '—'
}

const getMembershipTypeLabel = (value: string, other?: string) => {
  switch (value) {
    case 'monthly': return t('memberCreate.membershipMonthly')
    case 'quarterly': return t('memberCreate.membershipQuarterly')
    case 'yearly': return t('memberCreate.membershipYearly')
    case 'other': return other || t('memberCreate.membershipOther')
    default: return value || '—'
  }
}

const getPaymentMethodLabel = (value: string, other?: string) => {
  switch (value) {
    case 'card': return t('memberCreate.paymentCard')
    case 'cash': return t('memberCreate.paymentCash')
    case 'other': return other || t('memberCreate.paymentOther')
    default: return value || '—'
  }
}

const getAppointmentStatusLabel = (status: string) => {
  const key = `appointments.status.${status}`
  const translated = t(key)
  return translated !== key ? translated : status
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val) + " so'm"
}

const fetchMember = async () => {
  loading.value = true
  error.value = null
  try {
    const [m, c, b, g, h, s, a] = await Promise.all([
      membersService.getById(memberId.value),
      checkinsService.getByMemberId(memberId.value).catch(() => []),
      beautyService.getByMemberId(memberId.value).catch(() => []),
      membersService.getGymInfo(memberId.value).catch(() => null),
      membersService.getBeautyHealth(memberId.value).catch(() => null),
      salesService.getByMemberId(memberId.value).catch(() => []),
      appointmentsService.getByMemberId(memberId.value).catch(() => [])
    ])
    member.value = m
    checkins.value = c
    beautyServices.value = b
    gymInfo.value = g
    beautyHealth.value = h
    sales.value = s
    appointments.value = a
  } catch (err: any) {
    console.error(err)
    error.value = t('memberDetail.errorLoading')
  } finally {
    loading.value = false
  }
}

const onDeleteMember = async () => {
  if (!window.confirm(t('memberDetail.deleteConfirm'))) return
  try {
    await membersService.delete(memberId.value)
    router.push('/members')
  } catch (err: any) {
    window.alert(err.message || t('memberDetail.deleteError'))
  }
}

onMounted(fetchMember)
</script>
