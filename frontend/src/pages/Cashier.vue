<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between no-print">
      <div>
        <h2 class="text-3xl font-black tracking-tighter text-gray-900 dark:text-gray-100 uppercase">{{ $t('cashier.title') }}</h2>
        <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 italic">{{ $t('cashier.subtitle') }}</p>
      </div>
      <div v-if="currentSession" class="flex items-center gap-3">
        <button 
          @click="printCurrentSession" 
          class="glass-pill rounded-full border border-gray-400/30 px-5 py-2.5 text-xs font-black text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all shadow-sm uppercase tracking-widest flex items-center gap-2"
        >
          <PrinterIcon class="h-4 w-4" />
          {{ $t('cashier.xReport') }}
        </button>
        <button 
          @click="showCalendarReport = true" 
          class="glass-pill rounded-full border border-sky-500/30 bg-sky-500/10 px-5 py-2.5 text-xs font-black text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 transition-all shadow-sm uppercase tracking-widest"
        >
          {{ $t('cashier.dailyReport') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="glass rounded-2xl p-20 flex justify-center shadow-2xl border-white/40 dark:border-white/10">
      <LoadingSpinner />
    </div>

    <div v-else class="space-y-6 no-print">

      <!-- SESSION CLOSED STATE -->
      <div v-if="!currentSession" class="glass rounded-3xl p-20 flex flex-col items-center justify-center border-white/40 dark:border-white/10 shadow-3xl text-center backdrop-blur-md">
        <div class="p-6 rounded-full bg-gray-500/10 text-gray-400 mb-6 border border-gray-500/20 shadow-inner">
            <LockClosedIcon class="h-16 w-16" />
        </div>
        <p class="text-xl font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 italic">{{ $t('cashier.noActiveSession') }}</p>
        <button 
          @click="showOpenModal = true" 
          class="rounded-full bg-sky-600 px-10 py-4 text-sm font-black text-white hover:bg-sky-500 shadow-xl shadow-sky-500/20 transition-all active:scale-95 uppercase tracking-widest"
        >
          {{ $t('cashier.openSession') }}
        </button>
      </div>

      <!-- SESSION OPEN STATE -->
      <template v-else>

        <!-- Top Stat Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass rounded-2xl p-6 shadow-2xl border-white/40 dark:border-white/10 flex flex-col justify-between relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 relative z-10">{{ $t('cashier.cashSales') }}</div>
            <div class="text-2xl font-black text-gray-900 dark:text-white tracking-tighter relative z-10">{{ formatPrice(stats.cash) }}</div>
            <div class="mt-4 inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-500/20 w-fit">Naqd</div>
          </div>

          <div class="glass rounded-2xl p-6 shadow-2xl border-white/40 dark:border-white/10 flex flex-col justify-between relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sky-500/10 blur-2xl group-hover:bg-sky-500/20 transition-all"></div>
            <div class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 relative z-10">{{ $t('cashier.cardSales') }}</div>
            <div class="text-2xl font-black text-gray-900 dark:text-white tracking-tighter relative z-10">{{ formatPrice(stats.card) }}</div>
            <div class="mt-4 inline-flex items-center rounded-full bg-sky-500/10 px-3 py-1 text-[9px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest border border-sky-500/20 w-fit">Plastik</div>
          </div>

          <div class="glass rounded-2xl p-6 shadow-2xl border-white/40 dark:border-white/10 flex flex-col justify-between relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
            <div class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 relative z-10">{{ $t('cashier.otherSales') }}</div>
            <div class="text-2xl font-black text-gray-900 dark:text-white tracking-tighter relative z-10">{{ formatPrice(stats.other) }}</div>
            <div class="mt-4 inline-flex items-center rounded-full bg-purple-500/10 px-3 py-1 text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest border border-purple-500/20 w-fit">Boshqa</div>
          </div>

          <div class="glass rounded-2xl p-6 shadow-2xl border-sky-500/50 bg-sky-600/10 flex flex-col justify-between relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sky-500/20 blur-2xl group-hover:bg-sky-500/30 transition-all"></div>
            <div class="text-[10px] font-black text-sky-500 dark:text-sky-400 uppercase tracking-widest mb-4 relative z-10">{{ $t('cashier.totalSales') }}</div>
            <div class="text-2xl font-black text-sky-600 dark:text-sky-400 tracking-tighter relative z-10">{{ formatPrice(sessionTotal) }}</div>
            <div class="mt-4 inline-flex items-center rounded-full bg-sky-500 text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest w-fit shadow-lg shadow-sky-500/20">Jami Savdo</div>
          </div>
        </div>

        <!-- Middle: Session Control + Daily Breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Session Control -->
          <div class="lg:col-span-2 glass rounded-2xl shadow-2xl border-white/40 dark:border-white/10 overflow-hidden">
            <div class="border-b border-white/20 dark:border-white/5 px-6 py-4 flex items-center gap-2">
              <KeyIcon class="h-5 w-5 text-sky-500" />
              <h3 class="text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest">{{ $t('cashier.status') }}</h3>
            </div>
            <div class="p-8">
              <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                    <div class="relative flex h-3 w-3">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span class="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                    </div>
                    <span class="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{{ $t('cashier.sessionOpened') }}</span>
                </div>
                <span class="px-3 py-1 rounded-full bg-gray-500/10 text-[10px] font-black text-gray-500 border border-gray-500/20 uppercase">ID: #{{ currentSession.id }}</span>
              </div>

              <div class="grid grid-cols-2 gap-6 mb-8">
                <div class="glass rounded-2xl p-6 border-white/40 dark:border-white/5 shadow-inner bg-white/40 dark:bg-white/5">
                  <div class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{{ $t('cashier.openingBalance') }}</div>
                  <div class="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{{ formatPrice(currentSession.opening_balance) }}</div>
                </div>
                <div class="glass rounded-2xl border-white/40 dark:border-white/10 shadow-xl p-6">
                  <div class="text-[9px] font-black text-sky-500 uppercase tracking-widest mb-2">{{ $t('cashier.totalSales') }}</div>
                  <div class="text-xl font-black text-sky-600 dark:text-sky-400 tracking-tighter">{{ formatPrice(sessionTotal) }}</div>
                </div>
              </div>

              <button
                @click="showCloseModal = true"
                class="w-full rounded-full bg-rose-600 px-8 py-4 text-xs font-black text-white hover:bg-rose-500 shadow-xl shadow-rose-500/20 transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <LockClosedIcon class="h-4 w-4" />
                {{ $t('cashier.zReport') }}
              </button>
            </div>
          </div>

          <!-- Daily Breakdown -->
          <div class="glass rounded-2xl shadow-2xl border-white/40 dark:border-white/10 overflow-hidden">
            <div class="border-b border-white/20 dark:border-white/5 px-6 py-4 flex items-center gap-2">
              <ChartBarIcon class="h-5 w-5 text-sky-500" />
              <h3 class="text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest">{{ $t('cashier.dailyReport') }}</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20">
                <span class="text-[10px] font-black uppercase text-gray-500">{{ $t('cashier.cashSales') }}</span>
                <span class="text-sm font-black text-gray-900 dark:text-white">{{ formatPrice(stats.cash) }}</span>
              </div>
              <div class="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20">
                <span class="text-[10px] font-black uppercase text-gray-500">{{ $t('cashier.cardSales') }}</span>
                <span class="text-sm font-black text-gray-900 dark:text-white">{{ formatPrice(stats.card) }}</span>
              </div>
              <div class="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20">
                <span class="text-[10px] font-black uppercase text-gray-500">{{ $t('cashier.otherSales') }}</span>
                <span class="text-sm font-black text-gray-900 dark:text-white">{{ formatPrice(stats.other) }}</span>
              </div>
              <div class="pt-4 mt-2 border-t border-white/10 flex items-center justify-between px-2">
                <span class="text-xs font-black text-gray-400 uppercase tracking-widest">{{ $t('common.total') }}</span>
                <span class="text-xl font-black text-sky-600 tracking-tight">{{ formatPrice(sessionTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Debts -->
        <div class="glass rounded-2xl shadow-2xl border-white/40 dark:border-white/10 overflow-hidden">
          <div class="border-b border-white/20 dark:border-white/5 px-6 py-4 flex items-center justify-between bg-white/30 dark:bg-white/5 backdrop-blur-md">
            <div class="flex items-center gap-2">
              <BanknotesIcon class="h-5 w-5 text-rose-500" />
              <h3 class="text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest">
                {{ $t('cashier.pendingDebts', 'Kutilayotgan Qarzlar') }}
              </h3>
            </div>
            <span v-if="pendingDebts.length > 0" class="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase border border-rose-500/20 shadow-inner">
              {{ pendingDebts.length }}
            </span>
          </div>
          <div class="p-6">
            <div v-if="pendingDebts.length === 0" class="text-center py-20 text-gray-400 text-[10px] font-black uppercase italic tracking-widest opacity-40">
              {{ $t('cashier.noPendingDebts', 'Faol qarzlar yo\'q') }}
            </div>
            <div v-else class="overflow-x-auto custom-scrollbar rounded-xl">
              <table class="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr class="bg-white/50 dark:bg-white/5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <th class="py-4 px-6 border-b border-white/10">{{ $t('common.date') }}</th>
                    <th class="py-4 px-6 border-b border-white/10">{{ $t('common.client') }}</th>
                    <th class="py-4 px-6 border-b border-white/10">{{ $t('pos.dueDate', 'Muddat') }}</th>
                    <th class="py-4 px-6 border-b border-white/10">{{ $t('common.amount') }}</th>
                    <th class="py-4 px-6 border-b border-white/10 text-right">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/10 dark:divide-white/5">
                  <tr v-for="debt in pendingDebts" :key="debt.id" class="group hover:bg-white/40 dark:hover:bg-white/5 transition-all">
                    <td class="py-4 px-6 whitespace-nowrap text-xs font-bold text-gray-500 dark:text-gray-400 italic">
                        {{ formatDate(debt.created_at) }}
                    </td>
                    <td class="py-4 px-6 whitespace-nowrap text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                        {{ debt.members?.fullname }}
                    </td>
                    <td class="py-4 px-6 whitespace-nowrap text-[10px] font-black uppercase tracking-wider" :class="isOverdue(debt.due_date) ? 'text-rose-600' : 'text-gray-400'">
                      <div class="flex items-center gap-1.5">
                          <CalendarDaysIcon class="h-3.5 w-3.5" />
                          {{ debt.due_date ? formatDateOnly(debt.due_date) : '—' }}
                      </div>
                    </td>
                    <td class="py-4 px-6 whitespace-nowrap text-xs font-black text-gray-900 dark:text-white tracking-tight">
                        {{ formatPrice(debt.remaining_amount) }}
                    </td>
                    <td class="py-4 px-6 text-right">
                      <button 
                        @click="openDebtPaymentModal(debt)" 
                        class="rounded-full bg-sky-500/10 border border-sky-500/20 px-4 py-1.5 text-[10px] font-black text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm uppercase tracking-widest opacity-0 group-hover:opacity-100"
                      >
                        {{ $t('cashier.pay', 'To\'lash') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modals -->
    <!-- Open Session Modal -->
    <div v-if="showOpenModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4 no-print">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-md no-print" @click="showOpenModal = false"></div>
      <div class="relative w-full max-w-sm glass rounded-3xl border border-white/40 dark:border-white/10 shadow-3xl z-[151] overflow-hidden">
        <div class="border-b border-white/20 dark:border-white/5 px-6 py-5 flex items-center justify-between bg-white/30 dark:bg-white/5 backdrop-blur-md">
          <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{{ $t('cashier.openSession') }}</h3>
          <button @click="showOpenModal = false" class="p-2 rounded-full hover:bg-white/20 transition-all">
            <XMarkIcon class="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div class="p-8 space-y-6">
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{{ $t('cashier.openingBalance') }}</label>
            <input 
              v-model.number="form.openingBalance" 
              type="number"
              class="input h-14 w-full text-lg font-black tracking-tight"
              placeholder="0"
            />
          </div>
          <button 
            @click="handleOpenSession"
            :disabled="submitting"
            class="w-full rounded-full bg-sky-600 px-6 py-4 text-xs font-black text-white hover:bg-sky-500 disabled:opacity-50 shadow-xl shadow-sky-500/20 transition-all active:scale-95 uppercase tracking-widest"
          >
            {{ submitting ? $t('common.loading') : $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pay Debt Modal -->
    <div v-if="showDebtModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4 no-print">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="closeDebtModal"></div>
      <div class="relative w-full max-w-sm glass rounded-3xl border border-white/40 dark:border-white/10 shadow-3xl z-[151] overflow-hidden">
        <div class="border-b border-white/20 dark:border-white/5 px-6 py-5 flex items-center justify-between bg-white/30 dark:bg-white/5 backdrop-blur-md">
          <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{{ $t('cashier.payDebt', 'Qarzni To\'lash') }}</h3>
          <button @click="closeDebtModal" class="p-2 rounded-full hover:bg-white/20 transition-all">
            <XMarkIcon class="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div class="p-8 space-y-6">
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{{ $t('common.amount') }}</label>
            <input v-model.number="debtPaymentAmount" type="number" class="input h-14 w-full text-lg font-black tracking-tight" />
          </div>
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{{ $t('pos.paymentMethod') }}</label>
            <div class="grid grid-cols-2 gap-2">
                <button 
                  v-for="method in ['CASH', 'CARD']" 
                  :key="method"
                  @click="debtPaymentMethod = method"
                  :class="[
                    'rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all',
                    debtPaymentMethod === method 
                      ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400' 
                      : 'border-gray-300 bg-white/60 text-gray-600 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
                  ]"
                >
                  {{ method === 'CASH' ? $t('pos.cash') : $t('pos.card') }}
                </button>
            </div>
          </div>
          <button 
            @click="submitDebtPayment" 
            :disabled="submitting" 
            class="w-full rounded-full bg-sky-600 px-6 py-4 text-xs font-black text-white hover:bg-sky-500 disabled:opacity-50 shadow-xl shadow-sky-500/20 transition-all active:scale-95 uppercase tracking-widest"
          >
            {{ submitting ? $t('common.loading') : $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Close Session Modal -->
    <div v-if="showCloseModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4 no-print">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="showCloseModal = false"></div>
      <div class="relative w-full max-w-sm glass rounded-3xl border border-white/40 dark:border-white/10 shadow-3xl z-[151] overflow-hidden">
        <div class="border-b border-white/20 dark:border-white/5 px-6 py-5 flex items-center justify-between bg-white/30 dark:bg-white/5 backdrop-blur-md">
          <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{{ $t('cashier.closeSession') }}</h3>
          <button @click="showCloseModal = false" class="p-2 rounded-full hover:bg-white/20 transition-all">
            <XMarkIcon class="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div class="p-8 space-y-6">
          <div class="glass rounded-2xl p-6 border-white/40 dark:border-white/5 shadow-inner bg-white/40 dark:bg-white/5 space-y-1">
            <div class="text-[9px] text-gray-400 uppercase tracking-widest font-black italic">Kutilayotgan qoldiq</div>
            <div class="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{{ formatPrice(currentSession.opening_balance + sessionTotal) }}</div>
          </div>
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{{ $t('cashier.closingBalance') }}</label>
            <input 
              v-model.number="form.closingBalance" 
              type="number"
              class="input h-14 w-full text-lg font-black tracking-tight"
              placeholder="0"
            />
          </div>
          <div class="rounded-2xl bg-orange-500/10 p-5 border border-orange-500/20 shadow-inner">
            <div class="flex gap-3">
                <ExclamationTriangleIcon class="h-5 w-5 text-orange-500 shrink-0" />
                <p class="text-[10px] font-bold text-orange-800 dark:text-orange-300 leading-relaxed uppercase">{{ $t('cashier.zReportWarning') }}</p>
            </div>
          </div>
          <button 
            @click="handleCloseSession"
            :disabled="submitting"
            class="w-full rounded-full bg-rose-600 px-6 py-4 text-xs font-black text-white hover:bg-rose-500 disabled:opacity-50 shadow-xl shadow-rose-500/20 transition-all active:scale-95 uppercase tracking-widest"
          >
            {{ submitting ? $t('common.loading') : $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Daily Report Modal -->
    <div v-if="showCalendarReport" class="fixed inset-0 z-[150] flex items-center justify-center p-4 no-print">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="showCalendarReport = false"></div>
      <div class="relative w-full max-w-md glass rounded-3xl border border-white/40 dark:border-white/10 shadow-3xl z-[151] flex flex-col max-h-[92vh] overflow-hidden">
        <div class="border-b border-white/20 dark:border-white/5 px-6 py-5 flex items-center justify-between bg-white/30 dark:bg-white/5 backdrop-blur-md flex-shrink-0">
          <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{{ $t('cashier.dailyReport') }}</h3>
          <button @click="showCalendarReport = false" class="p-2 rounded-full hover:bg-white/20 transition-all">
            <XMarkIcon class="h-4 w-4 text-gray-500" />
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{{ $t('cashier.selectRange') }}</label>
              <div class="relative">
                  <CalendarDaysIcon class="absolute left-4 h-4 w-4 text-gray-400 pointer-events-none top-1/2 -translate-y-1/2" />
                  <input type="date" v-model="reportFilter.from" class="input h-12 w-full pl-12 text-xs font-bold" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">&nbsp;</label>
              <div class="relative">
                  <CalendarDaysIcon class="absolute left-4 h-4 w-4 text-gray-400 pointer-events-none top-1/2 -translate-y-1/2" />
                  <input type="date" v-model="reportFilter.to" class="input h-12 w-full pl-12 text-xs font-bold" />
              </div>
            </div>
          </div>
          
          <button 
            @click="fetchPeriodReport" 
            :disabled="submittingReport" 
            class="w-full rounded-full bg-sky-600 px-6 py-3.5 text-xs font-black text-white hover:bg-sky-500 shadow-xl shadow-sky-500/20 transition-all uppercase tracking-widest"
          >
            {{ submittingReport ? $t('common.loading') : $t('common.search') }}
          </button>

          <div v-if="periodReport" class="mt-8 space-y-6 border-t border-white/10 pt-6">
            <div class="flex justify-between items-center glass p-5 rounded-2xl border-sky-500/20 shadow-inner bg-sky-500/5">
              <span class="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">{{ $t('cashier.totalSales') }}</span>
              <span class="text-xl font-black text-sky-600 dark:text-sky-400 tracking-tighter">{{ formatPrice(periodReport.total) }}</span>
            </div>

            <div v-if="periodReport.breakdown" class="space-y-3 px-1">
              <div class="flex justify-between text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight border-b border-gray-200 dark:border-white/5 py-1">
                <span>{{ $t('cashier.breakdownPOS') }}</span>
                <span>{{ formatPrice(periodReport.breakdown.pos) }}</span>
              </div>
              <div class="flex justify-between text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight border-b border-gray-200 dark:border-white/5 py-1">
                <span>{{ $t('cashier.breakdownBeauty') }}</span>
                <span>{{ formatPrice(periodReport.breakdown.beauty) }}</span>
              </div>
              <div class="flex justify-between text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight border-b border-gray-200 dark:border-white/5 py-1">
                <span>{{ $t('cashier.breakdownPackages') }}</span>
                <span>{{ formatPrice(periodReport.breakdown.packages) }}</span>
              </div>
            </div>

            <div class="space-y-2 pt-4 border-t border-dashed border-gray-300 dark:border-white/10">
              <div v-for="(val, method) in periodReport.byMethod" :key="method" class="flex justify-between text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest italic">
                <span>{{ method }}</span>
                <span>{{ formatPrice(val) }}</span>
              </div>
            </div>

            <button 
              @click="printPeriodReport" 
              class="w-full mt-6 rounded-full border border-gray-400/30 py-4 text-xs font-black text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all shadow-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
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
import { formatDateTime, formatDateOnly } from '../lib/dateUtils'
import { 
  CreditCardIcon,
  PrinterIcon,
  LockClosedIcon,
  ChartBarIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  KeyIcon,
  BanknotesIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '../components/LoadingSpinner.vue'

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
    else if (['card', 'uzcard', 'humo', 'visa', 'click', 'payme'].includes(method)) card += amount
    else other += amount
  })

  // Beauty services
  report.beauty.forEach((b: any) => {
    const amount = b.amount || 0
    const method = (b.payment_method || 'cash').toLowerCase() // Default to cash for old records
    
    if (method === 'cash') cash += amount
    else if (['card', 'uzcard', 'humo', 'visa', 'click', 'payme'].includes(method)) card += amount
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
      await debtsService.payDebt({
          debt_id: activeDebt.value.id,
          amount: debtPaymentAmount.value,
          payment_method: debtPaymentMethod.value as any,
          cash_session_id: currentSession.value.id,
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

const formatDate = formatDateTime

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
