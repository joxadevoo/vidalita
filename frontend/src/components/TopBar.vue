<template>
  <header 
    class="fixed top-0 right-0 z-[110] flex h-16 items-center gap-x-4 glass px-4 transition-all duration-500 no-print"
    :style="headerStyle"
  >
    <!-- Mobile menu button (faqat mobile'da) -->
    <button 
      @click="$emit('menu')"
      class="lg:hidden rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      :title="$t('topbar.menu')"
    >
      <Bars3Icon class="h-6 w-6" />
    </button>
    
    <div class="flex flex-1 justify-end items-center gap-4">
      <!-- Theme toggle -->
      <button
        @click="toggleTheme"
        class="glass rounded-lg p-2 text-black dark:text-white hover:bg-sky-600/10 transition-colors"
        :title="isDark ? 'Light mode' : 'Dark mode'"
      >
        <SunIcon v-if="isDark" class="h-5 w-5" />
        <MoonIcon v-else class="h-5 w-5" />
      </button>

      <!-- Language Selector -->
      <div class="relative language-selector">
        <button 
          @click="showLangDropdown = !showLangDropdown"
          class="flex items-center gap-2 rounded-lg glass px-3 py-2 text-sm font-bold text-black dark:text-white hover:bg-sky-600/10 transition-colors"
          :title="$t('topbar.selectLanguage')"
        >
          <GlobeAltIcon class="h-5 w-5 text-gray-800 dark:text-gray-300" />
          <span class="hidden sm:inline">{{ currentLanguage.code.toUpperCase() }}</span>
          <svg class="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div 
          v-if="showLangDropdown"
          class="absolute right-0 mt-2 w-48 rounded-lg glass z-[120] overflow-hidden"
        >
          <div class="py-1">
            <button
              v-for="lang in languages"
              :key="lang.code"
              @click="setLocale(lang.code)"
              :class="[
                'w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-bold',
                currentLocale === lang.code ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-400' : 'text-gray-800 dark:text-gray-300'
              ]"
            >
              <GlobeAltIcon class="h-4 w-4 text-gray-500" />
              <span class="flex-1">{{ lang.name }}</span>
              <svg v-if="currentLocale === lang.code" class="h-4 w-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="relative">
        <button 
          @click="showUserMenu = !showUserMenu"
          class="flex items-center gap-2 rounded-full glass px-3 py-1 hover:bg-sky-600/10 transition-colors"
        >
          <span class="h-8 w-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-sm font-black shadow-sm">A</span>
          <div class="hidden sm:block text-left">
            <div class="text-sm font-black text-black dark:text-white">{{ currentUser?.username || $t('topbar.admin') }}</div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-gray-600">{{ currentUser?.role || 'admin' }}</div>
          </div>
          <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div 
          v-if="showUserMenu"
          class="absolute right-0 mt-2 w-48 rounded-lg glass z-[120] overflow-hidden"
        >
          <div class="py-1">
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{{ $t('sidebar.logout') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { GlobeAltIcon, Bars3Icon, MoonIcon, SunIcon } from '@heroicons/vue/24/outline'

defineEmits(['menu'])

const router = useRouter()
const showUserMenu = ref(false)
const currentUser = ref<any>(null)

const props = defineProps<{
  sidebarOpen?: boolean
  sidebarCollapsed?: boolean
}>()

const { locale } = useI18n()
const showLangDropdown = ref(false)
const isMobile = ref(false)
const isDark = ref(false)

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 1024
}

const handleLogout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('isAuthenticated')
  showUserMenu.value = false
  router.push('/login')
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  isDark.value = document.documentElement.classList.contains('dark')
  
  // User ma'lumotlarini yuklash
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr)
    } catch (e) {
      console.error('User ma\'lumotlarini parse qilishda xatolik:', e)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

const languages = [
  { code: 'uz', name: 'O\'zbek' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' }
]

const currentLocale = computed(() => locale.value)
const currentLanguage = computed(() => 
  languages.find(lang => lang.code === currentLocale.value) || languages[0]
)

const setLocale = (code: string) => {
  locale.value = code
  localStorage.setItem('locale', code)
  showLangDropdown.value = false
}

const toggleTheme = () => {
  const next = !document.documentElement.classList.contains('dark')
  document.documentElement.classList.toggle('dark', next)
  localStorage.setItem('theme', next ? 'dark' : 'light')
  isDark.value = next
}

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.language-selector')) {
    showLangDropdown.value = false
  }
}

// Add click listener when dropdown is open
watch(showLangDropdown, (isOpen) => {
  if (isOpen) {
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const headerStyle = computed(() => {
  // Desktop'da sidebar kengligiga moslashadi
  if (props.sidebarOpen && !isMobile.value) {
    const left = props.sidebarCollapsed ? '80px' : '288px'
    return { 
      left: `clamp(0px, ${left}, 100%)`,
      right: '0'
    }
  }
  // Mobile'da to'liq kenglik
  return { left: '0', right: '0' }
})
</script>
