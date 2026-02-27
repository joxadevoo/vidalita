<template>
  <div v-if="show" class="fixed inset-0 z-[160] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="close"></div>
    <div class="relative w-full max-w-lg rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
          <p class="text-xs text-gray-500 mt-0.5">{{ serviceName }}</p>
        </div>
        <button @click="close" class="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <LoadingSpinner v-if="loading" />
        <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {{ error }}
        </div>
        <div v-else-if="usages.length === 0" class="text-center py-10">
          <div class="mx-auto h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-900">{{ $t('beautyServices.noUsageHistory') }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ $t('beautyServices.noUsageHistoryDesc') }}</p>
        </div>
        
        <!-- Timeline -->
        <div v-else class="relative border-l border-gray-200 ml-3 space-y-6">
          <div v-for="(usage, index) in usages" :key="usage.id" class="relative pl-6">
            <!-- Timeline dot -->
            <div class="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-sky-500 ring-4 ring-white"></div>
            
            <div class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm hover:border-sky-100 transition-colors">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-gray-900">{{ $t('beautyServices.sessionNumber') }}{{ usages.length - index }}</span>
                    <span class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                      {{ formatDateTime(usage.serviceDate) }}
                    </span>
                  </div>
                  
                  <div class="mt-2 space-y-1">
                    <div v-if="usage.appointmentId" class="flex items-center gap-1.5 text-xs text-gray-600">
                      <svg class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ $t('beautyServices.appointmentTime') }}: <span class="font-medium">{{ formatDateTime(usage.appointmentStartTime) }}</span>
                    </div>
                    <div v-else-if="usage.cashSessionId" class="flex items-center gap-1.5 text-xs text-gray-600">
                      <svg class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {{ $t('beautyServices.soldViaCashier') }}
                    </div>
                    <div v-if="usage.staffName" class="flex items-center gap-1.5 text-xs text-gray-600">
                      <svg class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {{ $t('beautyServices.staff') }}: <span class="font-medium">{{ usage.staffName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-end rounded-b-xl">
         <button @click="close" class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
           {{ $t('common.close') }}
         </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { beautyService } from '../services/supabaseService'
import { formatDateTime } from '../lib/dateUtils'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps<{
  show: boolean
  packageId?: number
  title?: string
  serviceName?: string
}>()

const emit = defineEmits(['close'])
const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)
const usages = ref<any[]>([])

const fetchUsages = async () => {
  if (!props.packageId) return
  
  loading.value = true
  error.value = null
  try {
    const data = await beautyService.getPackageUsages(props.packageId)
    usages.value = data
  } catch (err: any) {
    console.error(err)
    error.value = t('beautyServices.errorLoadingHistory')
  } finally {
    loading.value = false
  }
}

watch(() => props.show, (newVal) => {
  if (newVal && props.packageId) {
    fetchUsages()
  } else {
    usages.value = []
  }
})

const close = () => {
  emit('close')
}
</script>
