<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between no-print">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('cashier.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('cashier.subtitle') }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 no-print">
      <!-- Session Status Card -->
      <div class="col-span-1 md:col-span-2 lg:col-span-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <h3 class="font-semibold text-gray-900">{{ $t('cashier.status') }}</h3>
        </div>
        <div class="p-6">
          <div v-if="currentSession" class="space-y-4">
            <div class="flex items-center gap-3">
              <span class="flex h-3 w-3 rounded-full bg-green-500"></span>
              <span class="text-lg font-medium text-green-700">{{ $t('cashier.sessionOpened') }}</span>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-lg bg-gray-50 p-4">
                <div class="text-xs text-gray-500 uppercase tracking-wider mb-1">{{ $t('cashier.openingBalance') }}</div>
                <div class="text-xl font-bold text-gray-900">{{ formatPrice(currentSession.opening_balance) }}</div>
              </div>
              <div class="rounded-lg bg-sky-50 p-4">
                <div class="text-xs text-sky-600 uppercase tracking-wider mb-1">{{ $t('cashier.totalSales') }}</div>
                <div class="text-xl font-bold text-sky-900">{{ formatPrice(sessionTotal) }}</div>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-100 flex gap-3">
              <button 
                @click="showCloseModal = true"
                class="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 shadow-sm"
              >
                {{ $t('cashier.zReport') }}
              </button>
              <div class="flex items-center gap-3">
            <button @click="printCurrentSession" v-if="currentSession" class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <PrinterIcon class="h-4 w-4" />
              {{ $t('cashier.xReport') }}
            </button>
            <button @click="showCalendarReport = true" class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">{{ $t('cashier.dailyReport') }}</button>
          </div>
            </div>
          </div>
          <div v-else class="text-center py-6">
            <div class="mb-4 text-gray-400">
              <CreditCardIcon class="mx-auto h-12 w-12 opacity-50" />
            </div>
            <p class="text-gray-500 mb-6">{{ $t('cashier.noActiveSession') }}</p>
            <button 
              @click="showOpenModal = true"
              class="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 shadow-sm"
            >
              {{ $t('cashier.openSession') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pending Debts Card -->
      <div v-if="currentSession" class="col-span-1 md:col-span-2 lg:col-span-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2">
            <CreditCardIcon class="h-5 w-5 text-red-500" />
            {{ $t('cashier.pendingDebts', 'Kutilayotgan Qarzlar') }}
          </h3>
        </div>
        <div class="p-6">
          <div v-if="pendingDebts.length === 0" class="text-center py-6 text-gray-500">
            {{ $t('cashier.noPendingDebts', 'Faol qarzlar yuq') }}
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th class="px-4 py-3">{{ $t('common.date') }}</th>
                  <th class="px-4 py-3">{{ $t('common.client') }}</th>
                  <th class="px-4 py-3">{{ $t('pos.dueDate', 'Muddat') }}</th>
                  <th class="px-4 py-3">{{ $t('common.amount') }}</th>
                  <th class="px-4 py-3 text-right">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="debt in pendingDebts" :key="debt.id" class="hover:bg-gray-50/50">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ formatDate(debt.created_at) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ debt.members?.fullname }}</td>
                  <td class="px-4 py-3 text-sm" :class="isOverdue(debt.due_date) ? 'text-red-600 font-bold' : 'text-gray-500'">{{ debt.due_date ? formatDate(debt.due_date) : '-' }}</td>
                  <td class="px-4 py-3 text-sm font-semibold text-gray-900">{{ formatPrice(debt.remaining_amount) }}</td>
                  <td class="px-4 py-3 text-right">
                    <button @click="openDebtPaymentModal(debt)" class="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg">
                      {{ $t('cashier.pay', 'To\'lash') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Quick Stats Card -->
      <div v-if="currentSession" class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <h3 class="font-semibold text-gray-900">{{ $t('cashier.dailyReport') }}</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex justify-between items-center py-2">
            <span class="text-sm text-gray-500">{{ $t('cashier.cashSales') }}</span>
            <span class="font-medium text-gray-900">{{ formatPrice(stats.cash) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-t border-gray-50">
            <span class="text-sm text-gray-500">{{ $t('cashier.cardSales') }}</span>
            <span class="font-medium text-gray-900">{{ formatPrice(stats.card) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-t border-gray-50">
            <span class="text-sm text-gray-500">{{ $t('cashier.otherSales') }}</span>
            <span class="font-medium text-gray-900">{{ formatPrice(stats.other) }}</span>
          </div>
          <div class="flex justify-between items-center pt-4 border-t-2 border-gray-100">
            <span class="text-base font-bold text-gray-900">{{ $t('common.total') }}</span>
            <span class="text-base font-bold text-sky-600">{{ formatPrice(sessionTotal) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Open Session Modal -->
    <div v-if="showOpenModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4 no-print">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm no-print" @click="showOpenModal = false"></div>
      <div class="relative w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-xl z-[151] overflow-hidden">
        <div class="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-900">{{ $t('cashier.openSession') }}</h3>
          <button @click="showOpenModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-5">
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">{{ $t('cashier.openingBalance') }}</label>
            <input 
              v-model.number="form.openingBalance" 
              type="number"
              class="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              placeholder="0"
            />
          </div>
          <button 
            @click="handleOpenSession"
            :disabled="submitting"
            class="w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50 shadow-sm transition-all active:scale-[0.98]"
          >
            {{ submitting ? $t('common.loading') : $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pay Debt Modal -->
    <div v-if="showDebtModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4 no-print">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeDebtModal"></div>
      <div class="relative w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-xl z-[151] overflow-hidden">
        <div class="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-900">{{ $t('cashier.payDebt', 'Qarzni To\'lash') }}</h3>
          <button @click="closeDebtModal" class="text-gray-400 hover:text-gray-500">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.amount') }}</label>
            <input v-model.number="debtPaymentAmount" type="number" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('pos.paymentMethod') }}</label>
            <select v-model="debtPaymentMethod" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500">
              <option value="CASH">{{ $t('pos.cash') }}</option>
              <option value="CARD">{{ $t('pos.card') }}</option>
              <option value="TRANSFER">{{ $t('pos.transfer', 'O\'tkazma') }}</option>
            </select>
          </div>
        </div>
        <div class="border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
          <button @click="closeDebtModal" class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {{ $t('common.cancel') }}
          </button>
          <button @click="submitDebtPayment" :disabled="submitting" class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50">
            {{ submitting ? $t('common.loading') : $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Close Session Modal -->
    <div v-if="showCloseModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4 no-print">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showCloseModal = false"></div>
      <div class="relative w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-xl z-[151] overflow-hidden">
        <div class="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-900">{{ $t('cashier.closeSession') }}</h3>
          <button @click="showCloseModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-5">
          <div class="rounded-lg bg-gray-50 p-4 space-y-1 border border-gray-100">
            <div class="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Kutilayotgan qoldiq</div>
            <div class="text-lg font-bold text-gray-900">{{ formatPrice(currentSession.opening_balance + sessionTotal) }}</div>
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">{{ $t('cashier.closingBalance') }}</label>
            <input 
              v-model.number="form.closingBalance" 
              type="number"
              class="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              placeholder="0"
            />
          </div>
          <div class="rounded-lg bg-orange-50 p-4 border border-orange-100">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-xs font-medium text-orange-800 leading-snug">{{ $t('cashier.zReportWarning') }}</p>
              </div>
            </div>
          </div>
          <button 
            @click="handleCloseSession"
            :disabled="submitting"
            class="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 shadow-sm transition-all active:scale-[0.98]"
          >
            {{ submitting ? $t('common.loading') : $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Daily Report Modal -->
    <div v-if="showCalendarReport" class="fixed inset-0 z-[150] flex items-center justify-center p-4 no-print">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showCalendarReport = false"></div>
      <div class="relative w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl z-[151] flex flex-col max-h-[92vh] overflow-hidden uppercase">
        <div class="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <h3 class="text-lg font-bold text-gray-900">{{ $t('cashier.dailyReport') }}</h3>
          <button @click="showCalendarReport = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase mb-1">{{ $t('cashier.selectRange') }}</label>
              <input type="date" v-model="reportFilter.from" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-sky-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase mb-1">&nbsp;</label>
              <input type="date" v-model="reportFilter.to" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-sky-400" />
            </div>
          </div>
          
          <button @click="fetchPeriodReport" :disabled="submittingReport" class="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50">
            {{ submittingReport ? $t('common.loading') : $t('common.search') }}
          </button>

          <div v-if="periodReport" class="mt-6 space-y-4 border-t pt-4">
            <!-- Jami savdo -->
            <div class="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
              <span class="text-sm font-semibold text-gray-700">{{ $t('cashier.totalSales') }}</span>
              <span class="text-base font-bold text-sky-600">{{ formatPrice(periodReport.total) }}</span>
            </div>

            <!-- Manba bo'yicha breakdown -->
            <div v-if="periodReport.breakdown" class="space-y-1.5 px-1">
              <div class="flex justify-between text-xs py-1 text-gray-600 border-b border-gray-50">
                <span>{{ $t('cashier.breakdownPOS') }}</span>
                <span class="font-medium">{{ formatPrice(periodReport.breakdown.pos) }}</span>
              </div>
              <div class="flex justify-between text-xs py-1 text-gray-600 border-b border-gray-50">
                <span>{{ $t('cashier.breakdownBeauty') }}</span>
                <span class="font-medium">{{ formatPrice(periodReport.breakdown.beauty) }}</span>
              </div>
              <div class="flex justify-between text-xs py-1 text-gray-600 border-b border-gray-50">
                <span>{{ $t('cashier.breakdownPackages') }}</span>
                <span class="font-medium">{{ formatPrice(periodReport.breakdown.packages) }}</span>
              </div>
            </div>

            <!-- To'lov usuli bo'yicha -->
            <div class="space-y-1.5 pt-2 border-t border-dashed border-gray-200">
              <div v-for="(val, method) in periodReport.byMethod" :key="method" class="flex justify-between text-[11px] py-1 text-gray-500 italic">
                <span>{{ method }}</span>
                <span>{{ formatPrice(val) }}</span>
              </div>
            </div>

            <button @click="printPeriodReport" class="w-full mt-4 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
              <PrinterIcon class="h-4 w-4" /> {{ $t('cashier.printReport') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dedicated Print Section (X-Report or Period Report) -->
    <div class="print-only p-8 text-black" style="font-family: monospace;">
      <div class="text-center mb-6 border-b pb-4">
        <h1 class="text-2xl font-bold uppercase">Vidalita</h1>
        <p class="text-sm">Go'zallik va Salomatlik Markazi</p>
        <div class="mt-4 text-xs font-mono">
          <p>SANA: {{ formatDate(new Date().toISOString()) }}</p>
          <p v-if="currentSession || lastClosedSession">SESSIA ID: #{{ currentSession?.id || lastClosedSession?.id }}</p>
        </div>
      </div>

      <!-- X-Report (Active Session) or Z-Report (Closed Session) -->
      <div v-if="(currentSession || lastClosedSession) && !isPrintingPeriodReport" class="space-y-4">
        <h2 class="text-center text-lg font-bold border-y py-1 uppercase">{{ lastClosedSession ? 'YAKUNIY Z-HISOBOT' : 'ORALIQ X-HISOBOT' }}</h2>
        
        <div class="space-y-1">
          <div class="flex justify-between">
            <span>OCHILISH BALANSI:</span>
            <span>{{ formatPrice((currentSession || lastClosedSession).opening_balance) }}</span>
          </div>
          <div v-if="lastClosedSession" class="flex justify-between">
            <span>YOPILISH BALANSI:</span>
            <span>{{ formatPrice(lastClosedSession.closing_balance) }}</span>
          </div>
          <div class="flex justify-between font-bold border-t pt-1">
            <span>JAMI SAVDO:</span>
            <span>{{ formatPrice(sessionTotal) }}</span>
          </div>
        </div>

        <div class="pt-2">
          <p class="text-xs font-bold border-b mb-1 uppercase">TO'LOV USULLARI BO'YICHA:</p>
          <div class="flex justify-between">
            <span>NAQD:</span>
            <span>{{ formatPrice(stats.cash) }}</span>
          </div>
          <div class="flex justify-between">
            <span>KARTA:</span>
            <span>{{ formatPrice(stats.card) }}</span>
          </div>
          <div class="flex justify-between">
            <span>BOSHQA:</span>
            <span>{{ formatPrice(stats.other) }}</span>
          </div>
        </div>
      </div>

      <!-- Period Report -->
      <div v-if="periodReport && isPrintingPeriodReport" class="space-y-4">
        <h2 class="text-center text-lg font-bold border-y py-1 uppercase">KUNLIK / DAVRIY HISOBOT</h2>
        <p class="text-center text-xs pb-2 uppercase">ORALIQ: {{ reportFilter.from }} — {{ reportFilter.to }}</p>
        
        <div class="space-y-1">
          <div class="flex justify-between font-bold border-b pb-1">
            <span>JAMI SAVDO:</span>
            <span>{{ formatPrice(periodReport.total) }}</span>
          </div>
          <div v-if="periodReport.breakdown" class="pt-2 space-y-1">
            <p class="text-xs font-bold uppercase">MANBALAR BO'YICHA:</p>
            <div class="flex justify-between">
              <span>MAGAZIN:</span>
              <span>{{ formatPrice(periodReport.breakdown.pos) }}</span>
            </div>
            <div class="flex justify-between">
              <span>XIZMATLAR:</span>
              <span>{{ formatPrice(periodReport.breakdown.beauty) }}</span>
            </div>
            <div class="flex justify-between">
              <span>KURS / PAKETLAR:</span>
              <span>{{ formatPrice(periodReport.breakdown.packages) }}</span>
            </div>
          </div>
        </div>

        <div class="pt-2">
          <p class="text-xs font-bold border-b mb-1 uppercase">TO'LOV USULLARI BO'YICHA:</p>
          <div v-for="(val, method) in periodReport.byMethod" :key="method" class="flex justify-between uppercase">
            <span>{{ method }}:</span>
            <span>{{ formatPrice(val) }}</span>
          </div>
        </div>
      </div>

      <div class="mt-12 text-center border-t pt-4 text-xs">
        <p class="uppercase">{{ lastClosedSession ? 'Z-HISOBOT - YAKUNIY' : (periodReport ? 'HISOBOT - YAKUNIY' : 'X-HISOBOT - MA\'LUMOT UCHUN') }}</p>
        <p class="mt-2 italic">Dastur: Vidalita Management System</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'
import { cashSessionsService } from '../services/supabaseService'
import { 
  CreditCardIcon,
  PrinterIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const currentSession = ref<any>(null)
const loading = ref(true)
const submitting = ref(false)
const showOpenModal = ref(false)
const showCloseModal = ref(false)
const showCalendarReport = ref(false)

const stats = ref({
  cash: 0,
  card: 0,
  other: 0
})

const pendingDebts = ref<any[]>([])
const showDebtModal = ref(false)
const activeDebt = ref<any>(null)
const debtPaymentAmount = ref(0)
const debtPaymentMethod = ref('CASH')

const isPrintingPeriodReport = ref(false)
const lastClosedSession = ref<any>(null)

const form = ref({
  openingBalance: 0,
  closingBalance: 0
})

const reportFilter = ref({
  from: new Date().toISOString().split('T')[0],
  to: new Date().toISOString().split('T')[0]
})

const periodReport = ref<any>(null)
const submittingReport = ref(false)

const sessionTotal = computed(() => stats.value.cash + stats.value.card + stats.value.other)

const fetchCurrentSession = async () => {
  loading.value = true
  try {
    const session = await cashSessionsService.getCurrentSession()
    currentSession.value = session
    if (session) {
      const report = await cashSessionsService.getReport(session.id)
      processReport(report)
    }
    const { debtsService } = await import('../services/supabaseService');
    try {
      pendingDebts.value = await debtsService.getAllPendingDebts();
    } catch (debtErr: any) {
      if (debtErr.code === 'PGRST205') {
        console.warn('debts table not found yet');
        pendingDebts.value = [];
      } else {
        throw debtErr;
      }
    }
  } catch (err) {
    console.error('Failed to fetch session:', err)
  } finally {
    loading.value = false
  }
}

const processReport = (report: any) => {
  let cash = 0, card = 0, other = 0
  
  // POS Sales
  report.sales.forEach((s: any) => {
    const amount = s.total_amount || 0
    const method = (s.payment_method || 'other').toLowerCase()
    
    if (method === 'cash') cash += amount
    else if (method === 'card') card += amount
    else other += amount
  })

  // Beauty services
  report.beauty.forEach((b: any) => {
    const amount = b.amount || 0
    const method = (b.payment_method || 'cash').toLowerCase() // Default to cash for old records
    
    if (method === 'cash') cash += amount
    else if (method === 'card') card += amount
    else other += amount
  })

  stats.value = { cash, card, other }
}

const handleOpenSession = async () => {
  submitting.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    await cashSessionsService.openSession(form.value.openingBalance, userId || '')
    showOpenModal.value = false
    await fetchCurrentSession()
  } catch (err) {
    console.error('Failed to open session:', err)
  } finally {
    submitting.value = false
  }
}

const handleCloseSession = async () => {
  submitting.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    const closingBalance = form.value.closingBalance
    
    // Save data for printing before it's cleared
    const sessionToClose = { ...currentSession.value, closing_balance: closingBalance }
    
    await cashSessionsService.closeSession(sessionToClose.id, closingBalance, userId || '')
    
    // Trigger Z-Report Print
    lastClosedSession.value = sessionToClose
    showCloseModal.value = false
    
    setTimeout(() => {
      window.print()
      // Cleanup after print
      setTimeout(() => {
        lastClosedSession.value = null
        currentSession.value = null
        stats.value = { cash: 0, card: 0, other: 0 }
      }, 500)
    }, 100)
    
  } catch (err) {
    console.error('Failed to close session:', err)
  } finally {
    submitting.value = false
  }
}

const fetchPeriodReport = async () => {
    submittingReport.value = true
    try {
        // We'll use a new method in cashSessionsService for period reports
        const data = await cashSessionsService.getPeriodReport(reportFilter.value.from, reportFilter.value.to)
        periodReport.value = data
    } catch (err) {
        console.error(err)
    } finally {
        submittingReport.value = false
    }
}

const printPeriodReport = () => {
    isPrintingPeriodReport.value = true
    setTimeout(() => {
        window.print()
        setTimeout(() => { isPrintingPeriodReport.value = false }, 500)
    }, 100)
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(price)
}

const isOverdue = (dateStr: string) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
};

const openDebtPaymentModal = (debt: any) => {
  activeDebt.value = debt;
  debtPaymentAmount.value = debt.remaining_amount;
  debtPaymentMethod.value = 'CASH';
  showDebtModal.value = true;
};

const closeDebtModal = () => {
  showDebtModal.value = false;
  activeDebt.value = null;
};

const submitDebtPayment = async () => {
  if (!activeDebt.value || debtPaymentAmount.value <= 0 || debtPaymentAmount.value > activeDebt.value.remaining_amount) {
      alert('Miqdor notugri');
      return;
  }
  submitting.value = true;
  try {
      const { debtsService } = await import('../services/supabaseService');
      const userJson = localStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      await debtsService.payDebt({
          debt_id: activeDebt.value.id,
          amount: debtPaymentAmount.value,
          payment_method: debtPaymentMethod.value as any,
          cash_session_id: currentSession.value.id,
          processed_by: user?.id
      });
      closeDebtModal();
      await fetchCurrentSession();
  } catch (err: any) {
      console.error(err);
      alert('Xatolik: ' + err.message);
  } finally {
      submitting.value = false;
  }
};

const printCurrentSession = () => {
    isPrintingPeriodReport.value = false
    setTimeout(() => {
        window.print()
    }, 100)
};

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const printSummary = () => {
    window.print()
}

onMounted(fetchCurrentSession)
</script>

<style scoped>
@media print {
  .no-print, 
  nav, 
  aside, 
  header.no-print,
  button,
  .sticky {
    display: none !important;
  }
  .print-only {
    display: block !important;
    overflow: visible !important;
    position: static !important;
  }
  .card {
    border: none !important;
    box-shadow: none !important;
  }
}
.print-only {
  display: none;
}
</style>
