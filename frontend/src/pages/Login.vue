<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 px-4">
    <div class="w-full max-w-md">
      <div class="rounded-xl border border-gray-200 bg-white shadow-xl">
        <div class="px-6 py-8 sm:px-10 sm:py-12">
          <!-- Logo yoki sarlavha -->
          <div class="mb-8 text-center">
            <h1 class="text-3xl font-bold text-gray-900">{{ $t('login.title') }}</h1>
            <p class="mt-2 text-sm text-gray-500">{{ $t('login.subtitle') }}</p>
          </div>

          <!-- Xato xabari -->
          <div v-if="error" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ error }}
          </div>

          <!-- Login form -->
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
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
              class="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ loading ? $t('login.loggingIn') : $t('login.loginButton') }}
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
import api from '../lib/api'

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
    const { data } = await api.post('/auth/login', {
      username: form.username,
      password: form.password
    })
    console.log('Login muvaffaqiyatli:', data)

    // User ma'lumotlarini localStorage'ga saqlash
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('isAuthenticated', 'true')

    // Dashboard'ga yo'naltirish
    router.push('/')
  } catch (err: any) {
    console.error('Login xatosi:', err)
    error.value = err?.response?.data?.error || t('login.error')
  } finally {
    loading.value = false
  }
}
</script>

