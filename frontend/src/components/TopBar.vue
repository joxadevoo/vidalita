<template>
  <header 
    class="fixed z-[110] flex items-center justify-end px-5 transition-all duration-500 no-print"
    :style="headerStyle"
  >
    <div class="flex items-center gap-3">

      <!-- Theme toggle -->
      <button
        @click="toggleTheme"
        class="glass-pill rounded-full h-9 w-9 flex items-center justify-center text-gray-700 dark:text-gray-200"
        :title="isDark ? 'Light mode' : 'Dark mode'"
      >
        <SunIcon v-if="isDark" class="h-5 w-5" />
        <MoonIcon v-else class="h-5 w-5" />
      </button>

      <!-- Language Selector -->
      <div class="relative language-selector">
        <button 
          @click="showLangDropdown = !showLangDropdown"
          class="flex items-center gap-2 glass-pill rounded-full h-9 px-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200"
          :title="$t('topbar.selectLanguage')"
        >
          <GlobeAltIcon class="h-4 w-4" />
          <span class="hidden sm:inline">{{ currentLanguage.code.toUpperCase() }}</span>
          <svg class="h-3.5 w-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div 
            v-if="showLangDropdown"
            class="absolute right-0 mt-2 w-48 rounded-2xl glass-dropdown z-[120] overflow-hidden"
          >
            <div class="py-1.5 px-1">
              <button
                v-for="lang in languages"
                :key="lang.code"
                @click="setLocale(lang.code)"
                :class="[
                  'w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-full transition-all duration-200 font-medium',
                  currentLocale === lang.code
                    ? 'bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-white/80 dark:border-white/15 text-gray-900 dark:text-white font-semibold shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/6'
                ]"
              >
                <GlobeAltIcon class="h-4 w-4 opacity-60" />
                <span class="flex-1">{{ lang.name }}</span>
                <svg v-if="currentLocale === lang.code" class="h-3.5 w-3.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </Transition>
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
  const MARGIN = '12px'
  const TOP = '10px'
  // Desktop: sidebar kengligiga moslashadi + pill margin
  if (props.sidebarOpen && !isMobile.value) {
    // Sidebar: width 13rem (208px) or 3.5rem (56px) + ml-2 (8px)
    const sidebarWidth = props.sidebarCollapsed ? 56 : 208
    const totalSidebarOffset = sidebarWidth + 8 // width + margin-left
    return {
      top: TOP,
      left: `calc(${totalSidebarOffset}px + ${MARGIN})`,
      right: MARGIN,
    }
  }
  // Mobile: faqat yon chekkalar
  return {
    top: TOP,
    left: MARGIN,
    right: MARGIN,
  }
})
</script>
