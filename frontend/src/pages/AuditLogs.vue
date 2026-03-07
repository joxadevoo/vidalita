<template>
  <div class="space-y-6 pb-20 sm:pb-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
      <div>
        <h1 class="text-3xl font-black tracking-tighter text-gray-900 dark:text-gray-100 uppercase flex items-center gap-3">
          <ShieldCheckIcon class="h-8 w-8 text-sky-500" />
          {{ $t('auditLogs.title') }}
        </h1>
        <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 italic">
          {{ $t('auditLogs.subtitle') }}
        </p>
      </div>
      <button 
        @click="loadLogs" 
        class="glass-pill rounded-full border border-gray-400/30 px-6 py-2.5 text-xs font-black text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all shadow-sm uppercase tracking-widest flex items-center gap-2"
      >
        <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': loading }" />
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
    <div v-else class="flex flex-col gap-6 no-print">
      <div v-if="logs.length === 0" class="glass rounded-2xl p-20 text-center opacity-60 italic text-gray-400 border-white/40 dark:border-white/10 shadow-2xl">
        <ShieldCheckIcon class="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p class="font-black uppercase tracking-widest text-xs">{{ $t('auditLogs.noLogs') }}</p>
      </div>

      <div v-else class="space-y-4">
        <!-- Sticky Table Header -->
        <div class="sticky top-0 z-20 mx-2 shrink-0">
          <table class="border-separate border-spacing-0 w-full">
            <thead>
              <tr class="glass rounded-full block-table-header backdrop-blur-md shadow-xl border-white/40 dark:border-white/10">
                <th class="py-3 pl-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 rounded-l-full bg-transparent">{{ $t('auditLogs.columns.date') }}</th>
                <th class="py-3 px-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-transparent">{{ $t('auditLogs.columns.user') }}</th>
                <th class="py-3 px-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-transparent">{{ $t('auditLogs.columns.action') }}</th>
                <th class="py-3 px-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-transparent">{{ $t('auditLogs.columns.target') }}</th>
                <th class="py-3 pr-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 rounded-r-full bg-transparent">{{ $t('auditLogs.columns.details') }}</th>
              </tr>
            </thead>
          </table>
        </div>

        <div class="glass rounded-2xl overflow-hidden shadow-2xl border-white/40 dark:border-white/10">
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-separate border-spacing-0">
              <thead class="invisible h-0">
                <tr>
                  <th class="w-[15%]"></th>
                  <th class="w-[15%]"></th>
                  <th class="w-[15%]"></th>
                  <th class="w-[15%]"></th>
                  <th class="w-[40%]"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10 dark:divide-white/5">
                <tr 
                  v-for="log in logs" 
                  :key="log.id"
                  class="hover:bg-white/40 dark:hover:bg-white/5 transition-all group backdrop-blur-sm"
                >
                  <td class="py-4 pl-6 whitespace-nowrap">
                    <div class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">
                      {{ formatDate(log.created_at) }}
                    </div>
                    <div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 italic">
                      {{ formatTime(log.created_at) }}
                    </div>
                  </td>
                  <td class="py-4 px-6 whitespace-nowrap">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-500/20 shadow-inner"
                      :class="log.performer_name ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' : 'bg-gray-500/10 text-gray-500 dark:text-gray-400'">
                      {{ log.performer_name || $t('auditLogs.system') }}
                    </span>
                  </td>
                  <td class="py-4 px-6 whitespace-nowrap">
                    <span class="text-[10px] font-black px-3 py-1 rounded-full bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 tracking-widest text-gray-600 dark:text-gray-300 uppercase shadow-sm">
                      {{ log.action }}
                    </span>
                  </td>
                  <td class="py-4 px-6 whitespace-nowrap text-[10px] text-gray-500 dark:text-gray-400 font-mono font-black italic">
                    {{ log.target_id || '-' }}
                  </td>
                  <td class="py-4 pr-6">
                    <div v-if="log.details" class="max-w-md font-mono text-[9px] bg-white/40 dark:bg-black/20 p-3 rounded-xl border border-white/40 dark:border-white/5 text-gray-500 dark:text-gray-400 leading-relaxed overflow-x-auto shadow-inner">
                      {{ JSON.stringify(log.details) }}
                    </div>
                    <span v-else class="text-gray-300 dark:text-gray-600 font-black">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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
