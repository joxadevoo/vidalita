<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-900">{{ $t('settings.title') }}</h2>
    
    <!-- Language Selector -->
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-100 px-6 py-4">
        <h3 class="text-lg font-semibold text-gray-900">Tilni tanlang / Select Language / Выберите язык / Dil Seçin</h3>
      </div>
      <div class="px-6 py-6">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <button
            v-for="lang in languages"
            :key="lang.code"
            @click="setLocale(lang.code)"
            :class="[
              'rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors flex flex-col items-center gap-2',
              currentLocale === lang.code
                ? 'border-sky-500 bg-sky-50 text-sky-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            ]"
          >
            <GlobeAltIcon class="h-6 w-6" />
            <div>{{ lang.name }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Sync -->
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-100 px-6 py-4">
        <h3 class="text-lg font-semibold text-gray-900">{{ $t('settings.sync.title') }}</h3>
      </div>
      <div class="px-6 py-6 space-y-4">
        <p class="text-sm text-gray-600">{{ $t('settings.sync.description') }}</p>
        
        <!-- Sync Status -->
        <div v-if="syncStatus && syncStatus !== 'idle'" :class="[
          'rounded-lg px-4 py-3 text-sm',
          syncStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          syncStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        ]">
          <div v-if="syncStatus === 'syncing'" class="space-y-2">
            <div class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="font-medium">{{ $t('settings.sync.syncing') }}</span>
            </div>
            <div v-if="syncProgress" class="text-xs mt-2 space-y-1">
              <div v-for="(item, index) in syncProgress" :key="index" class="flex items-center gap-2">
                <div class="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                <span>{{ item }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="syncStatus === 'success'" class="space-y-2">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="font-medium">{{ $t('settings.sync.success') }}</span>
            </div>
            <div v-if="syncStats" class="text-xs mt-2 space-y-1 pl-7">
              <div>👥 {{ $t('settings.sync.members') }}: {{ syncStats.members }}</div>
              <div>👤 {{ $t('settings.sync.users') }}: {{ syncStats.users }}</div>
              <div>📝 {{ $t('settings.sync.checkins') }}: {{ syncStats.checkins }}</div>
              <div>💅 {{ $t('settings.sync.beautyServices') }}: {{ syncStats.beautyServices }}</div>
              <div>🏋️ {{ $t('settings.sync.gymInfo') }}: {{ syncStats.gymInfo }}</div>
              <div>🏥 {{ $t('settings.sync.healthInfo') }}: {{ syncStats.healthInfo }}</div>
              <div>💰 {{ $t('settings.sync.payments') }}: {{ syncStats.payments }}</div>
            </div>
          </div>
          <div v-else-if="syncStatus === 'error'" class="space-y-2">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span class="font-medium">{{ $t('settings.sync.error') }}</span>
            </div>
            <div class="text-xs pl-7 space-y-1">
              <p class="text-red-600">{{ syncError || $t('settings.sync.error') }}</p>
              <p class="text-gray-500 mt-2">{{ $t('settings.sync.errorSuggestion') }}</p>
            </div>
          </div>
        </div>

        <!-- Auto Sync Toggle -->
        <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ $t('settings.sync.autoSync') }}</p>
            <p class="text-xs text-gray-500">{{ $t('settings.sync.autoSyncDesc') }}</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="autoSyncEnabled" @change="toggleAutoSync" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        <!-- Connection Test & Sync Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="testConnection"
            :disabled="testingConnection"
            :class="[
              'w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2',
              testingConnection
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            ]"
          >
            <svg class="h-4 w-4" :class="{ 'animate-spin': testingConnection }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{{ $t('settings.sync.testConnection') }}</span>
          </button>
          <button
            @click="handleSync"
            :disabled="syncStatus === 'syncing'"
            :class="[
              'w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2',
              syncStatus === 'syncing'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-sky-600 text-white hover:bg-sky-700'
            ]"
          >
            <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': syncStatus === 'syncing' }" />
            <span>{{ $t('settings.sync.button') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Developer Information -->
    <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-100 px-6 py-4">
        <h3 class="text-lg font-semibold text-gray-900">{{ $t('settings.developer.title') }}</h3>
      </div>
      <div class="px-6 py-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Developer Info -->
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-gray-900">{{ $t('settings.developer.info') }}</h4>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span><strong>{{ $t('settings.developer.phone') }}:</strong> 
                  <a href="tel:+998333303074" class="text-sky-600 hover:text-sky-700 hover:underline">+998 33 330 30 74</a>
                </span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span><strong>{{ $t('settings.developer.telegram') }}:</strong> 
                  <a href="https://t.me/jaxongirtoshpolatov" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:text-sky-700 hover:underline">@jaxongirtoshpolatov</a>
                </span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span><strong>{{ $t('settings.developer.github') }}:</strong> 
                  <a href="https://github.com/joxadevoo" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:text-sky-700 hover:underline">github.com/joxadevoo</a>
                </span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span><strong>{{ $t('settings.developer.instagram') }}:</strong> 
                  <a href="https://instagram.com/thisisjoxa" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:text-sky-700 hover:underline">@thisisjoxa</a>
                </span>
              </div>
            </div>
          </div>

          <!-- App Info -->
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-gray-900">{{ $t('settings.developer.appInfo') }}</h4>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span><strong>{{ $t('settings.developer.version') }}:</strong> 1.0.0</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>{{ $t('settings.developer.releaseDate') }}:</strong> 2025</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span><strong>{{ $t('settings.developer.license') }}:</strong> MIT</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span><strong>{{ $t('settings.developer.tech') }}:</strong> Vue.js, Node.js, SQLite, Firebase</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Support -->
        <div class="pt-4 border-t border-gray-200">
          <h4 class="text-sm font-semibold text-gray-900 mb-3">{{ $t('settings.developer.support') }}</h4>
          <p class="text-sm text-gray-600 mb-3">{{ $t('settings.developer.supportDesc') }}</p>
          <div class="flex flex-wrap gap-3">
            <a 
              href="https://t.me/jaxongirtoshpolatov" 
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {{ $t('settings.developer.contactTelegram') }}
            </a>
            <a 
              href="tel:+998333303074" 
              class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {{ $t('settings.developer.call') }}
            </a>
            <a 
              href="https://github.com/joxadevoo" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {{ $t('settings.developer.viewGitHub') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { GlobeAltIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import api from '../lib/api'

const { locale, t } = useI18n()
const currentLocale = computed(() => locale.value)

const languages = [
  { code: 'uz', name: 'O\'zbek' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' }
]

const setLocale = (code: string) => {
  locale.value = code
  localStorage.setItem('locale', code)
}

// Sync state
const syncStatus = ref<'idle' | 'syncing' | 'success' | 'error'>('idle')
const syncError = ref<string | null>(null)
const syncStats = ref<any>(null)
const syncProgress = ref<string[]>([])
const autoSyncEnabled = ref<boolean>(localStorage.getItem('autoSyncEnabled') === 'true')
const testingConnection = ref(false)
let autoSyncInterval: number | null = null

const testConnection = async () => {
  testingConnection.value = true
  syncError.value = null
  
  try {
    const response = await api.get('/sync/test')
    syncStatus.value = 'success'
    syncError.value = null
    syncStats.value = {
      message: response.data.message,
      time: response.data.time,
      version: response.data.version
    }
    
    setTimeout(() => {
      syncStatus.value = 'idle'
      syncStats.value = null
    }, 5000)
  } catch (error: any) {
    console.error('Connection test error:', error)
    syncStatus.value = 'error'
    syncError.value = error?.response?.data?.error || error?.response?.data?.suggestion || error.message || t('settings.sync.error')
    
    setTimeout(() => {
      syncStatus.value = 'idle'
      syncError.value = null
    }, 10000)
  } finally {
    testingConnection.value = false
  }
}

const handleSync = async () => {
  syncStatus.value = 'syncing'
  syncError.value = null
  syncStats.value = null
  syncProgress.value = []

  try {
    syncProgress.value.push(t('settings.sync.progress.connecting'))
    
    // Sync uchun alohida timeout - 60 soniya (ko'p ma'lumotlar uchun)
    const response = await api.post('/sync', {}, {
      timeout: 60000 // 60 soniya
    })
    
    syncProgress.value.push(t('settings.sync.progress.syncing'))
    syncStatus.value = 'success'
    syncStats.value = response.data.stats
    
    // 5 soniyadan keyin statusni tozalash
    setTimeout(() => {
      syncStatus.value = 'idle'
      syncStats.value = null
      syncProgress.value = []
    }, 5000)
  } catch (error: any) {
    console.error('Sync error:', error)
    syncStatus.value = 'error'
    
    // Batafsil xatolik xabari
    let errorMessage = t('settings.sync.error')
    let suggestion = ''
    
    if (error?.response?.data) {
      const data = error.response.data
      
      if (data.error) {
        errorMessage = data.error
      } else if (data.message) {
        errorMessage = data.message
      }
      
      if (data.suggestion) {
        suggestion = data.suggestion
      }
      
      if (data.errorCode === 'ETIMEDOUT' || data.errorCode === 'ENETUNREACH') {
        errorMessage = 'Internet ulanishi muammosi yoki Firebase serverga ulanish imkonsiz'
        suggestion = suggestion || 'Internet ulanishingizni tekshiring, firewall sozlamalarini ko\'rib chiqing va keyinroq qayta urinib ko\'ring. Ma\'lumotlar mahalliy saqlanadi va ulanish mavjud bo\'lganda sinxronizatsiya qilinadi.'
      }
    } else if (error?.message) {
      errorMessage = error.message
      
      // Timeout xatoliklarini aniqlash
      if (error.message.includes('timeout') || error.code === 'ECONNABORTED') {
        errorMessage = 'Sinxronizatsiya juda uzoq davom etdi va timeout bo\'ldi'
        suggestion = 'Ma\'lumotlar juda ko\'p bo\'lishi mumkin. Iltimos, keyinroq qayta urinib ko\'ring yoki backend loglarini tekshiring.'
      }
    }
    
    syncError.value = suggestion ? `${errorMessage}\n\n💡 ${suggestion}` : errorMessage
    
    // 10 soniyadan keyin statusni tozalash (xatolik uchun ko'proq vaqt)
    setTimeout(() => {
      syncStatus.value = 'idle'
      syncError.value = null
      syncProgress.value = []
    }, 10000)
  }
}

const toggleAutoSync = () => {
  localStorage.setItem('autoSyncEnabled', autoSyncEnabled.value.toString())
  
  if (autoSyncEnabled.value) {
    // Avtomatik sync yoqilganda - har 30 minutda bir sync qilish
    autoSyncInterval = window.setInterval(() => {
      if (syncStatus.value === 'idle') {
        handleSync()
      }
    }, 30 * 60 * 1000) // 30 minut
    
    // Dastlabki sync
    if (syncStatus.value === 'idle') {
      handleSync()
    }
  } else {
    // Avtomatik sync o'chirilganda
    if (autoSyncInterval) {
      clearInterval(autoSyncInterval)
      autoSyncInterval = null
    }
  }
}

// Component mount bo'lganda avtomatik sync'ni tekshirish
onMounted(() => {
  if (autoSyncEnabled.value) {
    toggleAutoSync()
  }
})

onUnmounted(() => {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval)
  }
})
</script>



