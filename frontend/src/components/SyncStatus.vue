<template>
  <div class="fixed bottom-4 right-4 z-50">
    <div 
      v-if="status"
      :class="[
        'flex items-center gap-2 rounded-lg px-3 py-2 shadow-lg transition-all',
        status.isOnline ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
      ]"
    >
      <span class="text-sm font-medium">
        <span v-if="status.isOnline">{{ $t('sync.online') }}</span>
        <span v-else>{{ $t('sync.offline') }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import syncService from '../lib/syncService'

const { t } = useI18n()

type SyncStatus = {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  pendingCount: number
}

const status = ref<SyncStatus | null>(null)
let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = syncService.subscribe((newStatus) => {
    status.value = newStatus
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
</style>

