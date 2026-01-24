<template>
  <!-- Mobile overlay -->
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-40 bg-black/40 lg:hidden" @click="$emit('close')"></div>
  </transition>

  <!-- Mobile sidebar -->
  <transition name="slide">
    <aside
      v-if="isOpen"
      class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-lg lg:hidden"
    >
      <div class="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
        <div class="flex h-16 shrink-0 items-center justify-between">
          <h1 class="text-2xl font-bold text-primary-600">{{ $t('common.appName') }}</h1>
          <button class="text-gray-400 hover:text-gray-600" @click="$emit('close')">✕</button>
        </div>
        <nav class="flex flex-1 flex-col">
          <ul class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul class="-mx-2 space-y-1">
                <li v-for="item in navItems" :key="item.href">
                  <RouterLink
                    :to="item.href"
                    class="group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                    @click="$emit('close')"
                    :class="isActive(item.href) ? 'bg-gray-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'"
                  >
                    <component
                      :is="item.icon"
                      class="h-6 w-6 shrink-0"
                      :class="isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'"
                    />
                    <span class="transition-colors">{{ item.name }}</span>
                  </RouterLink>
                </li>
              </ul>
            </li>
            <li class="mt-auto">
              <div class="text-xs text-gray-500">{{ $t('sidebar.copyright', { year: currentYear }) }}</div>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  </transition>

  <!-- Desktop sidebar (har doim ko'rinadi) -->
    <aside
      :class="[
        'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col border-r border-gray-200 bg-white shadow-lg transition-all duration-300',
        collapsed ? 'lg:w-20' : 'lg:w-72'
      ]"
    style="overflow-y: auto; overflow-x: hidden; max-height: 100vh;"
    >
      <div class="flex grow flex-col gap-y-5 pb-4" :class="collapsed ? 'px-2' : 'px-6'">
        <div class="flex h-16 shrink-0 items-center justify-between" :class="collapsed ? 'justify-center' : ''">
          <h1 v-if="!collapsed" class="text-2xl font-bold text-primary-600">{{ $t('common.appName') }}</h1>
          <button 
            class="text-gray-400 hover:text-gray-600 lg:block hidden" 
            @click="collapsed ? $emit('toggle-collapse') : $emit('toggle-collapse')"
            :title="collapsed ? $t('sidebar.expand') : $t('sidebar.collapse')"
          >
            <svg v-if="!collapsed" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
      </div>
        <nav class="flex flex-1 flex-col min-h-0">
          <ul class="flex flex-1 flex-col gap-y-7 min-h-0">
          <li>
            <ul class="-mx-2 space-y-1">
                <li v-for="item in navItems" :key="item.href" class="relative group">
                <RouterLink
                  :to="item.href"
                    :class="[
                      'flex items-center rounded-md text-sm font-semibold leading-6 transition-colors',
                      collapsed ? 'justify-center p-2' : 'gap-x-3 p-2',
                      isActive(item.href) ? 'bg-gray-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    ]"
                >
                  <component
                    :is="item.icon"
                      :class="[
                        'shrink-0',
                        collapsed ? 'h-6 w-6' : 'h-6 w-6',
                        isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                      ]"
                  />
                    <span v-if="!collapsed" class="transition-colors">{{ item.name }}</span>
                </RouterLink>
                  <!-- Tooltip for collapsed state -->
                  <div
                    v-if="collapsed"
                    class="absolute left-full ml-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50"
                    style="top: 50%; transform: translateY(-50%);"
                  >
                    {{ item.name }}
                    <div class="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white"></div>
                    <div class="absolute right-full top-1/2 -translate-y-1/2 -mr-px border-4 border-transparent border-r-gray-200"></div>
                  </div>
              </li>
            </ul>
          </li>
            <li v-if="!collapsed" class="mt-auto">
            <div class="text-xs text-gray-500">{{ $t('sidebar.copyright', { year: currentYear }) }}</div>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  HomeIcon,
  UsersIcon,
  ClockIcon,
  ScissorsIcon,
  QrCodeIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

defineProps<{ isOpen: boolean; collapsed?: boolean }>()

defineEmits(['close', 'toggle', 'toggle-collapse'])

const route = useRoute()
const { t } = useI18n()
const currentYear = new Date().getFullYear()

const navItems = computed(() => [
  { name: t('sidebar.home'), href: '/', icon: HomeIcon },
  { name: t('sidebar.members'), href: '/members', icon: UsersIcon },
  { name: t('sidebar.checkins'), href: '/checkins', icon: ClockIcon },
  { name: t('sidebar.beautyServices'), href: '/beauty', icon: ScissorsIcon },
  { name: t('sidebar.barcode'), href: '/barcode', icon: QrCodeIcon },
  { name: t('sidebar.settings'), href: '/settings', icon: Cog6ToothIcon }
])

const isActive = (path: string) => route.path === path
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>

