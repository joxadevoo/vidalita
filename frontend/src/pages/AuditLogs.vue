<template>
  <div class="space-y-6 pb-20 sm:pb-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <div class="p-2 bg-sky-500/10 text-sky-600 rounded-xl">
            <ShieldCheckIcon class="h-6 w-6" />
          </div>
          {{ $t('auditLogs.title') }}
        </h1>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
          {{ $t('auditLogs.subtitle') }}
        </p>
      </div>
      <button @click="loadLogs" class="btn-secondary h-11 px-4 text-sm whitespace-nowrap hidden sm:flex">
        <ArrowPathIcon class="h-5 w-5 mr-2" :class="{ 'animate-spin': loading }" />
        {{ $t('common.refresh') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="glass rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
      <LoadingSpinner class="w-10 h-10 text-sky-600 mb-4" />
      <p class="text-sm font-bold text-gray-500 animate-pulse">{{ $t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="glass border-red-500/10 rounded-2xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
      <div class="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
        <ExclamationCircleIcon class="h-8 w-8 text-red-500" />
      </div>
      <p class="text-sm font-bold text-red-600 dark:text-red-400">{{ error }}</p>
      <button @click="loadLogs" class="mt-4 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
        {{ $t('common.tryAgain') }}
      </button>
    </div>

    <!-- List -->
    <div v-else class="glass rounded-2xl overflow-hidden shadow-sm border border-white/20 dark:border-gray-800/50">
      <div v-if="logs.length === 0" class="p-12 text-center text-gray-500 dark:text-gray-400">
        <ShieldCheckIcon class="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p class="font-bold">{{ $t('auditLogs.noLogs') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <th class="py-4 px-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{{ $t('auditLogs.columns.date') }}</th>
              <th class="py-4 px-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{{ $t('auditLogs.columns.user') }}</th>
              <th class="py-4 px-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{{ $t('auditLogs.columns.action') }}</th>
              <th class="py-4 px-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{{ $t('auditLogs.columns.target') }}</th>
              <th class="py-4 px-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{{ $t('auditLogs.columns.details') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr 
              v-for="log in logs" 
              :key="log.id"
              class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              <td class="py-4 px-6 whitespace-nowrap">
                <div class="text-sm font-bold text-gray-900 dark:text-white">
                  {{ formatDate(log.created_at) }}
                </div>
                <div class="text-[11px] font-bold text-gray-400 tracking-wider">
                  {{ formatTime(log.created_at) }}
                </div>
              </td>
              <td class="py-4 px-6 whitespace-nowrap">
                <span class="inline-flex flex-col items-start gap-1">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold"
                    :class="log.performer_name ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'">
                    {{ log.performer_name || $t('auditLogs.system') }}
                  </span>
                </span>
              </td>
              <td class="py-4 px-6 whitespace-nowrap">
                <span class="text-[11px] font-black px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 tracking-widest text-gray-600 dark:text-gray-300">
                  {{ log.action }}
                </span>
              </td>
              <td class="py-4 px-6 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono font-bold">
                {{ log.target_id || '-' }}
              </td>
              <td class="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                <div v-if="log.details" class="max-w-md truncate font-mono text-[10px] bg-gray-50 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 leading-relaxed overflow-x-auto">
                  {{ JSON.stringify(log.details) }}
                </div>
                <span v-else class="text-gray-400 dark:text-gray-600 font-bold">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowPathIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'
import { auditLogsService } from '../services/supabaseService'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const { t } = useI18n()
const logs = ref<any[]>([])
const loading = ref(true)
const error = ref('')

const loadLogs = async () => {
  loading.value = true
  error.value = ''
  try {
    logs.value = await auditLogsService.getAll()
  } catch (err: any) {
    console.error('Logs error:', err)
    error.value = err.message || t('auditLogs.errorLoading')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateValue: string) => {
  if (!dateValue) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Tashkent',
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(dateValue))
}

const formatTime = (dateValue: string) => {
  if (!dateValue) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Tashkent',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(dateValue))
}

onMounted(() => {
  loadLogs()
})
</script>
