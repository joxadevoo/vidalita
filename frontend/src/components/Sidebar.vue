<template>
  <!-- Mobile overlay -->
  <transition name="fade">
    <div v-if="isOpen" class="no-print fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300" @click="$emit('close')"></div>
  </transition>

  <!-- Mobile sidebar -->
  <transition name="slide">
    <aside
      v-if="isOpen"
      class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col glass lg:hidden no-print overflow-hidden"
    >
      <div class="flex-1 flex flex-col min-h-0">
        <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div class="flex items-center flex-shrink-0 px-6 mb-8 group cursor-pointer transition-transform hover:scale-[1.02]">
            <div class="h-10 w-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-600/30 font-black italic">
              V
            </div>
            <span class="ml-3 text-2xl font-black tracking-tight text-black dark:text-white uppercase italic">Vidalita</span>
          </div>
          
          <nav class="mt-2 flex-1 px-4 space-y-1.5" aria-label="Sidebar">
            <RouterLink
              v-for="item in navItems"
              :key="item.name"
              :to="item.href"
              :class="[
                $route.path === item.href
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-gray-900 dark:text-gray-200 hover:bg-gray-500/10 hover:text-sky-600 dark:hover:text-sky-400',
                'group flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200'
              ]"
              @click="$emit('close')"
            >
              <component
                :is="item.icon"
                :class="[
                  $route.path === item.href ? 'text-white' : 'text-gray-400 group-hover:text-sky-500',
                  'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                ]"
                aria-hidden="true"
              />
              {{ item.name }}
              <span v-if="$route.path === item.href" class="ml-auto flex h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
            </RouterLink>
          </nav>
        </div>

        <div class="flex-shrink-0 flex flex-col border-t border-gray-100/10 p-4 space-y-3">
          <div class="flex items-center gap-3 px-2">
            <div class="h-10 w-10 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white font-black shadow-md shrink-0">
              {{ user?.username?.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
               <p class="text-sm font-black text-black dark:text-white truncate">{{ user?.username }}</p>
               <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{{ $t('roles.' + (user?.role || 'reception')) }}</p>
            </div>
          </div>
          <button @click="handleLogout" class="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-colors">
            <ArrowRightOnRectangleIcon class="h-4 w-4" />
            {{ $t('sidebar.logout') }}
          </button>
          <div class="mt-2 text-center pb-2 flex flex-col items-center gap-1">
            <span class="block text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-1.5">&copy; {{ currentYear }} Vidalita</span>
            <div class="flex items-center gap-3">
              <a href="https://t.me/jaxongirtoshpolatov" target="_blank" class="inline-flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-sky-500 transition-colors">
                <CodeBracketIcon class="h-3 w-3" />
                <span>{{ $t('sidebar.developer') }}</span>
              </a>
              <a href="https://github.com/joxadevoo" target="_blank" class="inline-flex items-center text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                joxadevoo
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </transition>

  <!-- Desktop sidebar -->
  <aside
    :class="[
      'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col glass transition-all duration-300 no-print',
      collapsed ? 'lg:w-20' : 'lg:w-72'
    ]"
  >
    <div class="hidden lg:flex flex-1 flex-col pt-5 pb-4 overflow-y-auto overflow-x-hidden">
      <div class="flex items-center flex-shrink-0 mb-8" :class="collapsed ? 'px-0 justify-center' : 'px-6 justify-between'">
        <div class="flex items-center transition-transform hover:scale-[1.05] duration-300">
          <div class="h-10 w-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-600/30 font-black italic shrink-0">
            V
          </div>
          <span v-if="!collapsed" class="ml-3 text-2xl font-black tracking-tight text-black dark:text-white uppercase italic">Vidalita</span>
        </div>
        
        <button 
          v-if="!collapsed"
          class="text-gray-400 hover:text-sky-600 transition-colors" 
          @click="$emit('toggle-collapse')"
          :title="$t('sidebar.collapse')"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <button 
        v-if="collapsed"
        class="mx-auto mb-6 text-gray-400 hover:text-sky-600 transition-colors p-2 rounded-lg bg-gray-500/5" 
        @click="$emit('toggle-collapse')"
        :title="$t('sidebar.expand')"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>

      <nav class="flex-1 space-y-1.5" :class="collapsed ? 'px-2' : 'px-4'">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.href"
          :class="[
            $route.path === item.href
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-gray-900 dark:text-gray-200 hover:bg-gray-500/10 hover:text-sky-600 dark:hover:text-sky-400',
            'group relative flex items-center rounded-xl transition-all duration-200',
            collapsed ? 'justify-center p-3' : 'px-4 py-3 text-sm font-bold'
          ]"
        >
          <component
            :is="item.icon"
            :class="[
              $route.path === item.href ? 'text-white' : 'text-gray-400 group-hover:text-sky-500',
              'flex-shrink-0 transition-colors',
              collapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
            ]"
            aria-hidden="true"
          />
          <span v-if="!collapsed">{{ item.name }}</span>
          <span v-if="!collapsed && $route.path === item.href" class="ml-auto flex h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
          
          <!-- Tooltip for collapsed state -->
          <div v-if="collapsed" class="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap shadow-xl">
            {{ item.name }}
          </div>
        </RouterLink>
      </nav>
    </div>

    <div class="hidden lg:flex flex-shrink-0 flex flex-col border-t border-gray-100/10 p-4 space-y-3" :class="collapsed ? 'items-center' : ''">
      <div class="flex items-center gap-3 px-2">
        <div class="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white font-black shadow-md shrink-0">
          {{ user?.username?.charAt(0).toUpperCase() }}
        </div>
        <div v-if="!collapsed" class="flex-1 min-w-0">
           <p class="text-sm font-black text-gray-900 dark:text-white truncate">{{ user?.username }}</p>
           <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{{ $t('roles.' + (user?.role || 'reception')) }}</p>
        </div>
      </div>
      <button @click="handleLogout" :class="[
        'flex items-center justify-center gap-2 rounded-xl transition-all font-bold',
        collapsed ? 'h-10 w-10 p-0 text-red-500 bg-red-500/5 hover:bg-red-500/10' : 'w-full px-3 py-2.5 text-xs text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10'
      ]">
        <ArrowRightOnRectangleIcon class="h-5 w-5" />
        <span v-if="!collapsed">{{ $t('sidebar.logout') }}</span>
      </button>
      <div v-if="!collapsed" class="text-center flex flex-col items-center gap-1.5 mt-2">
        <span class="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">&copy; {{ currentYear }} Vidalita</span>
        <div class="flex items-center gap-3">
          <a href="https://t.me/jaxongirtoshpolatov" target="_blank" class="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-sky-500 transition-colors">
            <CodeBracketIcon class="h-3 w-3" />
            <span>{{ $t('sidebar.developer') }}</span>
          </a>
          <a href="https://github.com/joxadevoo" target="_blank" class="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            joxadevoo
          </a>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  HomeIcon,
  UsersIcon,
  ClockIcon,
  ScissorsIcon,
  QrCodeIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  ArchiveBoxIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  CodeBracketIcon
} from '@heroicons/vue/24/outline'

defineProps<{ isOpen: boolean; collapsed?: boolean }>()
const emit = defineEmits(['close', 'toggle', 'toggle-collapse'])

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const currentYear = new Date().getFullYear()

const user = computed(() => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
})

const navItems = computed(() => {
  const userRole = user.value?.role || 'reception'

  const allItems = [
    { name: t('sidebar.home'), href: '/', icon: HomeIcon, roles: ['admin', 'manager'] },
    { name: t('sidebar.members'), href: '/members', icon: UsersIcon, roles: ['admin', 'manager', 'reception'] },
    { name: t('sidebar.checkins'), href: '/checkins', icon: ClockIcon, roles: ['admin', 'manager', 'reception'] },
    { name: t('sidebar.beautyServices'), href: '/beauty', icon: ScissorsIcon, roles: ['admin', 'manager', 'reception'] },
    { name: t('sidebar.appointments'), href: '/appointments', icon: CalendarDaysIcon, roles: ['admin', 'manager', 'reception'] },
    { name: t('sidebar.sales'), href: '/sales', icon: ClipboardDocumentListIcon, roles: ['admin', 'manager', 'reception'] },
    { name: t('sidebar.pos'), href: '/pos', icon: CreditCardIcon, roles: ['admin', 'reception'] },
    { name: t('sidebar.cashier'), href: '/cashier', icon: BanknotesIcon, roles: ['admin', 'reception'] },
    { name: t('sidebar.products'), href: '/products', icon: ShoppingBagIcon, roles: ['admin', 'manager'] },
    { name: t('sidebar.inventory'), href: '/inventory', icon: ArchiveBoxIcon, roles: ['admin', 'manager'] },
    { name: t('sidebar.barcode'), href: '/barcode', icon: QrCodeIcon, roles: ['admin', 'manager', 'reception'] },
    { name: t('sidebar.settings'), href: '/settings', icon: Cog6ToothIcon, roles: ['admin'] },
    { name: t('sidebar.auditLogs'), href: '/auditlogs', icon: ShieldCheckIcon, roles: ['admin'] }
  ]

  return allItems.filter(item => item.roles.includes(userRole))
})

const handleLogout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('isAuthenticated')
  router.push('/login')
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
