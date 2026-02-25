<template>
  <div class="mesh-gradient-light dark:mesh-gradient-dark relative flex min-h-screen items-center justify-center overflow-hidden px-4">
    <!-- Decorative background elements -->
    <div class="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl animate-float"></div>
    <div class="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl animate-float" style="animation-delay: -3s"></div>

    <div class="animate-fade-in-scale w-full max-w-md">
      <div class="glass overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300">
        <div class="px-8 py-10 sm:px-12 sm:py-14">
          <!-- Header -->
          <div class="mb-10 text-center">
            <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/30">
              <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {{ $t('login.title') }}
            </h1>
            <p class="mt-3 text-base text-gray-500 dark:text-gray-400 font-medium">
              {{ $t('login.subtitle') }}
            </p>
          </div>

          <!-- Error Message -->
          <Transition name="fade">
            <div v-if="error" class="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400 backdrop-blur-sm">
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ error }}</span>
              </div>
            </div>
          </Transition>

          <!-- Login form -->
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div class="group">
              <label for="username" class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-sky-600">
                {{ $t('login.username') }}
              </label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                autofocus
                class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                :placeholder="$t('login.usernamePlaceholder')"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                {{ $t('login.password') }}
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                :placeholder="$t('login.passwordPlaceholder')"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LoadingSpinner v-if="loading" class="!py-0 h-4 w-4" />
              <span>{{ loading ? $t('login.loggingIn') : $t('login.loginButton') }}</span>
            </button>
          </form>

          <!-- Default credentials info -->
          <div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
            <p class="font-semibold">{{ $t('login.defaultCredentials') }}:</p>
            <p class="mt-1">Username: <span class="font-mono">admin</span></p>
            <p>Password: <span class="font-mono">admin123</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { authService } from '../services/supabaseService'

const { t } = useI18n()
const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref<string | null>(null)

const handleLogin = async () => {
  loading.value = true
  error.value = null

  try {
    console.log('Login so\'rovi yuborilmoqda...', { username: form.username })
    const data = await authService.login(form.username, form.password)
    console.log('Login muvaffaqiyatli:', data)

    // User ma'lumotlarini localStorage'ga saqlash
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('isAuthenticated', 'true')

    // Dashboard'ga yo'naltirish
    router.push('/')
  } catch (err: any) {
    console.error('Login xatosi:', err)
    error.value = err.message || t('login.error')
  } finally {
    loading.value = false
  }
}
</script>

