<template>
  <Transition name="zoom-fade">
    <div v-if="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        class="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl transition-all border border-gray-100 dark:border-gray-700"
        @click.stop
      >
        <h3 v-if="options.title" class="mb-2 text-xl font-bold text-gray-900 dark:text-white">{{ options.title }}</h3>
        <h3 v-else class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Tasdiqlash</h3>
        
        <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">{{ options.message }}</p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancel" 
            class="rounded-xl px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {{ options.cancelText || $t('common.cancel') }}
          </button>
          <button 
            @click="proceed" 
            class="rounded-xl bg-sky-600 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500 shadow-lg shadow-sky-600/20 active:scale-95 transition-all"
          >
            {{ options.confirmText || $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useConfirm } from '../composables/useConfirm';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { isOpen, options, proceed, cancel } = useConfirm();
</script>

<style scoped>
.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.zoom-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.zoom-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
