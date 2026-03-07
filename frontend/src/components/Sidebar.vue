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
                  ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-400/40 shadow-sm backdrop-blur-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 border border-transparent',
                'group flex items-center px-4 py-2.5 text-sm font-semibold rounded-full transition-all duration-200'
              ]"
              @click="$emit('close')"
            >
              <component
                :is="item.icon"
                :class="[
                  $route.path === item.href ? 'text-sky-600 dark:text-sky-400' : 'text-black dark:text-gray-100 group-hover:text-sky-500',
                  'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                ]"
                aria-hidden="true"
              />
              {{ item.name }}
              <span v-if="$route.path === item.href" class="ml-auto flex h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            </RouterLink>
          </nav>
        </div>

        <div class="flex-shrink-0 flex flex-col p-3 space-y-2">
          <div class="glass rounded-2xl p-3 flex items-center gap-3">
            <div class="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-500 to-blue-400 flex items-center justify-center text-white font-black shadow-md shrink-0 text-sm">
              {{ user?.username?.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
               <p class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{{ user?.username }}</p>
               <p class="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500 tracking-wider">{{ $t('roles.' + (user?.role || 'reception')) }}</p>
            </div>
          </div>
          <button @click="handleLogout" class="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-500 dark:text-red-400 rounded-full border border-red-400/30 bg-red-500/8 hover:bg-red-500/15 transition-all shadow-sm">
            <ArrowRightOnRectangleIcon class="h-4 w-4" />
            {{ $t('sidebar.logout') }}
          </button>
          <div class="text-center pb-1 flex flex-col items-center gap-0.5">
            <span class="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">© {{ currentYear }} Vidalita</span>
            <div class="flex items-center gap-2">
              <a href="https://t.me/jaxongirtoshpolatov" target="_blank" class="inline-flex items-center gap-1 text-[10px] font-bold text-black dark:text-gray-400 hover:text-sky-500 transition-colors">
                <CodeBracketIcon class="h-3 w-3 text-black dark:text-gray-400" />
                <span>{{ $t('sidebar.developer') }}</span>
              </a>
              <a href="https://github.com/joxadevoo" target="_blank" class="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
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
      'hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 no-print my-2 ml-2 gap-2',
      collapsed ? 'lg:w-[3.5rem]' : 'lg:w-[13rem]'
    ]"
  >
    <!-- 1. Logo section — 2 ta alohida glass card (Slim height: 52px) -->
    <div class="flex-shrink-0 flex items-center h-[52px]" :class="collapsed ? 'justify-center' : 'gap-2'">
      <!-- Logo card with Transition -->
      <Transition name="logo-fade">
        <div v-if="!collapsed" class="glass rounded-full flex items-center gap-3 px-4 h-full flex-1 min-w-0 transition-transform hover:scale-[1.02] duration-300 overflow-hidden">
          <div class="h-8 w-8 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-600/30 font-black italic shrink-0 text-xs">
            V
          </div>
          <span class="text-base font-black tracking-tight text-gray-900 dark:text-white uppercase italic truncate">Vidalita</span>
        </div>
      </Transition>
      <!-- Collapse/Expand toggle card -->
      <button
        class="glass rounded-full w-[52px] h-[52px] text-black dark:text-gray-100 hover:text-sky-600 transition-all flex items-center justify-center shrink-0"
        @click="$emit('toggle-collapse')"
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

    <!-- 2. Nav section -->
    <div :class="[
      'glass flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300',
      collapsed ? 'rounded-[28px]' : 'rounded-[24px]'
    ]">
      <nav class="p-1.5 space-y-0.5">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.href"
          :class="[
            $route.path === item.href
              ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-400/20 shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 border border-transparent',
            'group relative flex items-center rounded-full transition-all duration-200 h-10 w-full',
            collapsed ? 'justify-center p-0' : 'px-3 text-sm font-semibold'
          ]"
        >
          <component
            :is="item.icon"
            :class="[
              $route.path === item.href ? 'text-sky-600 dark:text-sky-400' : 'text-black dark:text-gray-100 group-hover:text-sky-500',
              'flex-shrink-0 transition-colors',
              collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'
            ]"
            aria-hidden="true"
          />
          <Transition name="logo-fade">
            <span v-if="!collapsed" class="truncate inline-block">{{ item.name }}</span>
          </Transition>
          <span v-if="!collapsed && $route.path === item.href" class="ml-auto flex h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse"></span>

          <!-- Tooltip for collapsed state -->
          <div v-if="collapsed" class="absolute left-full ml-4 px-3 py-1.5 glass text-gray-800 dark:text-gray-100 text-[10px] font-black uppercase tracking-widest rounded-full opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-[100] whitespace-nowrap shadow-xl border border-sky-400/20">
            {{ item.name }}
          </div>
        </RouterLink>
      </nav>
    </div>

    <!-- 3. User section -->
    <div :class="[
      'glass flex-shrink-0 p-1.5 space-y-1.5 transition-all duration-300 flex flex-col',
      collapsed ? 'rounded-[28px] items-center' : 'rounded-[24px]'
    ]">
      <div class="flex items-center gap-2 p-1 rounded-full bg-white/10 overflow-hidden w-full"
           :class="collapsed ? 'justify-center h-10' : 'h-10'">
        <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-400 flex items-center justify-center text-white font-bold shadow-md shrink-0 text-xs text-nowrap">
          {{ user?.username?.charAt(0).toUpperCase() }}
        </div>
        <Transition name="logo-fade">
          <div v-if="!collapsed" class="flex-1 min-w-0 overflow-hidden">
             <p class="text-[11px] font-bold text-gray-900 dark:text-gray-100 truncate leading-tight">{{ user?.username }}</p>
             <p class="text-[8px] uppercase font-semibold text-gray-400 dark:text-gray-500 tracking-wider leading-tight">{{ $t('roles.' + (user?.role || 'reception')) }}</p>
          </div>
        </Transition>
      </div>
      <button @click="handleLogout" :class="[
        'flex items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-500/8 hover:bg-red-500/15 transition-all duration-300 font-bold shadow-sm h-9 shrink-0',
        collapsed ? 'w-9 p-0 text-red-500' : 'w-full px-3 text-xs text-red-500 dark:text-red-400'
      ]">
        <ArrowRightOnRectangleIcon class="h-4 w-4 shrink-0" />
        <Transition name="logo-fade">
          <span v-if="!collapsed" class="truncate inline-block text-nowrap">{{ $t('sidebar.logout') }}</span>
        </Transition>
      </button>
      <Transition name="logo-fade">
        <div v-if="!collapsed" class="text-center flex flex-col items-center gap-0.5 overflow-hidden w-full">
          <span class="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">&copy; {{ currentYear }} Vidalita</span>
          <div class="flex items-center gap-2">
            <a href="https://t.me/jaxongirtoshpolatov" target="_blank" class="flex items-center gap-1 text-[10px] font-bold text-black dark:text-gray-400 hover:text-sky-500 transition-colors">
              <CodeBracketIcon class="h-3 w-3 text-black dark:text-gray-400" />
              <span>{{ $t('sidebar.developer') }}</span>
            </a>
            <a href="https://github.com/joxadevoo" target="_blank" class="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              joxadevoo
            </a>
          </div>
        </div>
      </Transition>
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
/* Sidebar transition override for smoother feel */
aside {
  transition: width 0.35s cubic-bezier(0.33, 1, 0.68, 1);
  will-change: width;
  backface-visibility: hidden;
  transform: translateZ(0); /* Force GPU */
}

.glass {
  transition: border-radius 0.35s cubic-bezier(0.33, 1, 0.68, 1), 
              background-color 0.2s ease, 
              box-shadow 0.2s ease;
  will-change: border-radius;
  overflow: hidden;
}

/* Logo Fade/Scale Transition */
.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);
}

.logo-fade-enter-from,
.logo-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px) scale(0.95);
  max-width: 0;
  white-space: nowrap;
  padding: 0;
  margin: 0;
}

/* Hide scrollbar for clean look during transition */
div::-webkit-scrollbar {
  display: none;
}
div {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

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
