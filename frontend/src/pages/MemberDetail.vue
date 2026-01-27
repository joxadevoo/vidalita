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
          <div class="border-b border-gray-100 px-6 py-4"><h2 class="text-lg font-semibold text-gray-900">Gym Info</h2></div>
          <div class="px-6 py-6 space-y-4">
             <div v-if="gymInfo.membershipType">
               <label class="text-xs font-medium text-gray-500">Membership Type</label>
               <p class="text-sm">{{ gymInfo.membershipType }}</p>
             </div>
             <div v-if="gymInfo.paymentMethod">
               <label class="text-xs font-medium text-gray-500">Payment Method</label>
               <p class="text-sm">{{ gymInfo.paymentMethod }}</p>
             </div>
             <div v-if="gymInfo.emergencyName">
               <label class="text-xs font-medium text-gray-500">Emergency Contact</label>
               <p class="text-sm">{{ gymInfo.emergencyName }} ({{ gymInfo.emergencyPhone }})</p>
             </div>
          </div>
        </section>

        <section v-if="beautyHealth" class="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div class="border-b border-gray-100 px-6 py-4"><h2 class="text-lg font-semibold text-gray-900">Health Profile</h2></div>
          <div class="px-6 py-6 space-y-2">
             <div v-for="q in beautyQuestions" :key="q.key" class="text-sm flex justify-between">
                <span class="text-gray-500">{{ q.label }}</span>
                <span :class="beautyHealth[q.key] === 'yes' ? 'text-red-600 font-bold' : 'text-gray-400'">{{ beautyHealth[q.key] || '—' }}</span>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { membersService, checkinsService, beautyService, storageService } from '../services/supabaseService'
import { formatDate, formatDateTime } from '../lib/dateUtils'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const memberId = computed(() => Number(route.params.id))

const member = ref<any>(null)
const checkins = ref<any[]>([])
const beautyServices = ref<any[]>([])
const gymInfo = ref<any>(null)
const beautyHealth = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const beautyQuestions = [
  { key: 'bloodPressure', label: 'Qon bosimi / Yurak kasalligi' },
  { key: 'diabetes', label: 'Qandli diabet' },
  { key: 'cancer', label: 'Saraton', detailKey: 'cancerDetails' },
  { key: 'hormonal', label: 'Gormonal buzilish' },
  { key: 'thyroid', label: 'Qalqonsimon bez' },
  { key: 'skin', label: 'Teri kasalliklari' },
  { key: 'surgery', label: 'Operatsiya', detailKey: 'surgeryDetails' }
]

const fetchMember = async () => {
  loading.value = true
  error.value = null
  try {
    const [m, c, b, g, h] = await Promise.all([
      membersService.getById(memberId.value),
      checkinsService.getByMemberId(memberId.value).catch(() => []),
      beautyService.getByMemberId(memberId.value).catch(() => []),
      membersService.getGymInfo(memberId.value).catch(() => null),
      membersService.getBeautyHealth(memberId.value).catch(() => null)
    ])
    member.value = m
    checkins.value = c
    beautyServices.value = b
    gymInfo.value = g
    beautyHealth.value = h
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
