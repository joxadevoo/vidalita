<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ $t('beautyServices.title') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('beautyServices.subtitle') }}</p>
      </div>
      <div class="flex gap-3">
        <button class="glass-pill rounded-full border border-gray-400/30 px-5 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all shadow-sm flex items-center gap-2" @click="fetchServices">
          <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': loading }" />
          {{ $t('common.refresh') }}
        </button>
        <button class="rounded-full bg-sky-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-sky-600/25 hover:bg-sky-500 hover:-translate-y-0.5 transition-all flex items-center gap-2" @click="openModal">
          <PlusIcon class="h-5 w-5" />
          {{ $t('beautyServices.newService') }}
        </button>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
    <div v-if="successMessage" class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{{ successMessage }}</div>

    <!-- Filter paneli -->
    <div class="sticky top-0 z-20 glass rounded-full p-2 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl border-white/40 dark:border-white/10 no-print mb-6 backdrop-blur-md">
      <!-- Search -->
      <div class="w-full lg:max-w-md xl:max-w-lg relative flex items-center group">
        <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
        <input
          v-model="searchTerm"
          type="text"
          :placeholder="$t('beautyServices.searchPlaceholder')"
          class="w-full rounded-full h-11 pl-12 pr-4 text-sm bg-white/40 dark:bg-black/20 border-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 backdrop-blur-sm transition"
        />
      </div>

      <div class="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto">
        <!-- Date From -->
        <div class="flex items-center gap-2 w-full lg:w-auto">
          <span class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0">{{ $t('beautyServices.dateFrom') }}</span>
          <div class="flex items-center gap-2 px-3 h-11 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 w-full lg:w-36 overflow-hidden">
            <CalendarIcon class="h-4 w-4" />
            <input v-model="dateFrom" type="date" class="bg-transparent border-none focus:ring-0 w-full p-0 text-xs font-bold h-full text-gray-700 dark:text-gray-200 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
          </div>
        </div>

        <!-- Date To -->
        <div class="flex items-center gap-2 w-full lg:w-auto">
          <span class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0">{{ $t('beautyServices.dateTo') }}</span>
          <div class="flex items-center gap-2 px-3 h-11 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 w-full lg:w-36 overflow-hidden">
            <CalendarIcon class="h-4 w-4" />
            <input v-model="dateTo" type="date" class="bg-transparent border-none focus:ring-0 w-full p-0 text-xs font-bold h-full text-gray-700 dark:text-gray-200 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
          </div>
        </div>

        <div class="flex items-center gap-2 w-full lg:w-auto">
          <!-- Today Only -->
          <div class="flex h-11 items-center gap-2 rounded-full border border-gray-400/30 bg-white/20 dark:bg-white/5 px-4 group hover:border-sky-400/50 transition-colors cursor-pointer" @click="onlyToday = !onlyToday">
            <input id="todayOnly" v-model="onlyToday" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500/20" @click.stop />
            <label for="todayOnly" class="text-xs font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap cursor-pointer uppercase tracking-tight">{{ $t('beautyServices.todayOnly') }}</label>
          </div>

          <div class="flex gap-2">
            <button
              @click="exportToExcel"
              class="flex items-center justify-center h-11 w-11 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm"
              :title="$t('beautyServices.exportExcel')"
            >
              <TableCellsIcon class="h-5 w-5" />
            </button>
            <button
              @click="exportToPDF"
              class="flex items-center justify-center h-11 w-11 rounded-full border border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all shadow-sm"
              :title="$t('beautyServices.exportPDF')"
            >
              <DocumentTextIcon class="h-5 w-5" />
            </button>
            <button
              @click="resetFilters"
              class="flex items-center justify-center h-11 px-6 rounded-full border border-gray-400/30 bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20 transition-all font-black text-[10px] shadow-sm uppercase tracking-widest"
            >
              {{ $t('common.reset') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table section (scrollable) -->
    <div class="glass rounded-2xl overflow-hidden shadow-xl border-white/40 dark:border-white/10 flex flex-col no-print" style="max-height: calc(100vh - 280px);">
    <LoadingSpinner v-if="loading" />
      <template v-else>
        <!-- Thead pill -->
        <div class="mx-2 mt-2 mb-1 shrink-0 glass rounded-full shadow-lg border-white/20 dark:border-white/10 overflow-hidden backdrop-blur-xl">
          <table class="table-fixed border-separate border-spacing-0 w-full">
            <thead>
              <tr class="bg-transparent">
                <th class="py-2.5 pl-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[220px]">{{ $t('beautyServices.columns.name') }}</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[240px]">{{ $t('beautyServices.columns.serviceType') }}</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[110px]">{{ $t('beautyServices.columns.price') }}</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[150px]">{{ $t('beautyServices.columns.date') }}</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[150px]">{{ $t('beautyServices.columns.note') }}</th>
                <th class="py-2.5 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[120px]">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
          </table>
        </div>

        <!-- Tbody scrollable -->
        <div class="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table class="table-fixed border-separate border-spacing-0 w-full">
            <thead class="invisible h-0">
              <tr>
                <th class="py-2.5 pl-6 w-[220px]"></th>
                <th class="px-4 py-2.5 w-[240px]"></th>
                <th class="px-4 py-2.5 w-[110px]"></th>
                <th class="px-4 py-2.5 w-[150px]"></th>
                <th class="px-4 py-2.5 w-[150px]"></th>
                <th class="py-2.5 pr-6 w-[120px]"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10 dark:divide-white/5">
              <tr 
                v-for="s in processedServices" 
                :key="(s.isPackage ? 'p-' : 's-') + s.id" 
                class="group transition-colors backdrop-blur-sm"
                :class="[
                  s.isPackage ? 'bg-white/10 dark:bg-white/5 border-t border-white/10 dark:border-white/5' : 'hover:bg-white/40 dark:hover:bg-white/5',
                  s.isSession ? 'bg-purple-500/5 hover:bg-purple-500/10 !important' : ''
                ]"
              >
                <td class="whitespace-nowrap py-4 pl-6 text-sm font-bold text-gray-900 dark:text-gray-100">
                  <div class="flex items-center gap-0">
                    <div v-if="s.isSession" class="w-8 shrink-0 relative self-stretch">
                       <!-- Vertical Connector -->
                       <div 
                         class="absolute left-4 top-0 w-4 border-purple-600 dark:border-purple-400 transition-all"
                         :class="[
                           s.isLastChild ? 'h-5 border-l-2 border-b-2 rounded-bl-lg' : 'h-full border-l-2'
                         ]"
                       ></div>
                       <!-- Horizontal tick for non-last children -->
                       <div v-if="!s.isLastChild" class="absolute left-4 top-5 w-4 border-b-2 border-purple-600 dark:border-purple-400"></div>
                    </div>
                    <div class="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight text-xs">{{ s.fullName || $t('beautyServices.noName') }}</div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight text-right md:text-left overflow-hidden">
                  <div class="flex items-center gap-1.5 w-full">
                    <span v-if="s.isPackage" class="flex-shrink-0 h-2 w-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" title="Package"></span>
                    <span v-else-if="s.isSession" class="flex-shrink-0 text-[10px] font-black uppercase text-purple-500">[{{ $t('beautyServices.session') }}]</span>
                    <span class="truncate" :title="s.serviceName">{{ s.serviceName }}</span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-xs font-black text-sky-600 dark:text-sky-400 tabular-nums">
                  <span v-if="s.isPackage" class="font-black">
                    {{ formatPrice(s.amount) }}
                  </span>
                  <span v-else-if="s.amount !== null && s.amount !== undefined && s.amount > 0" class="font-black">
                    {{ formatPrice(s.amount) }}
                  </span>
                  <span v-else-if="s.isSession" class="text-[10px] font-bold text-gray-400 italic">
                    {{ $t('beautyServices.includedInPackage') }}
                  </span>
                  <span v-else-if="s.serviceType && serviceTypes?.prices?.[s.serviceType] !== undefined" class="font-black">
                    {{ formatPrice(serviceTypes?.prices?.[s.serviceType]) }}
                  </span>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-xs font-black text-gray-500 dark:text-gray-400 tracking-tight">
                  {{ formatDate(s.serviceDate) }}
                </td>
                <td class="px-4 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 italic truncate max-w-[150px]">{{ s.note || '—' }}</td>
                <td class="whitespace-nowrap py-4 pr-6 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      class="rounded-full bg-red-500/10 dark:bg-red-500/5 px-4 py-1 text-xs font-bold text-red-600 dark:text-red-400 border border-red-400/30 hover:bg-red-500/20 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                      @click="onDeleteService(s)"
                    >
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredServices.length === 0">
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <div class="h-12 w-12 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-400">
                      <MagnifyingGlassIcon class="h-6 w-6" />
                    </div>
                    <p class="text-sm font-medium text-gray-500">{{ $t('beautyServices.noResults') }}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" @click="closeModal"></div>
        <div class="relative w-full max-w-xl glass rounded-3xl shadow-2xl z-[151] flex flex-col max-h-[92vh] overflow-hidden border-white/40 dark:border-white/10 animate-in fade-in zoom-in-95 duration-300">
          <div class="border-b border-white/20 dark:border-white/5 px-6 py-5 flex-shrink-0 bg-white/10 dark:bg-black/10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <PlusIcon class="h-6 w-6" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ $t('beautyServices.modalTitle') }}</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('beautyServices.subtitle') }}</p>
                </div>
              </div>
              <button @click="closeModal" class="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <form @submit.prevent="handleSubmit" class="flex flex-col flex-1 overflow-hidden">
            <div class="px-6 py-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div v-if="formError" class="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 shadow-sm animate-in shake duration-300">
                {{ formError }}
              </div>
            
            <!-- Member Selection -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('beautyServices.memberLabel') }} <span class="text-red-500">*</span></label>
              <div class="relative member-dropdown-container">
                <div class="relative">
                  <input
                    v-model="memberSearch"
                    type="text"
                    :placeholder="$t('beautyServices.memberPlaceholder')"
                    class="input h-11 pr-10"
                    @input="filterMembers"
                    @focus="showMemberDropdown = true"
                  />
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 text-sky-500/40">
                    <IdentificationIcon class="h-5 w-5" />
                  </div>
                </div>
                
                <div v-if="showMemberDropdown && filteredMembersList.length > 0" class="absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-2xl glass border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  <button
                    v-for="member in filteredMembersList"
                    :key="member.id"
                    type="button"
                    class="w-full px-4 py-3 text-left hover:bg-white/40 dark:hover:bg-white/10 transition-colors border-b border-white/10 dark:border-white/5 last:border-0"
                    @click="selectMember(member)"
                  >
                    <div class="font-bold text-gray-900 dark:text-gray-100">{{ member.fullName }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <span>{{ member.phone }}</span>
                      <span class="h-1 w-1 rounded-full bg-gray-300"></span>
                      <span class="font-mono">{{ member.qrCodeId }}</span>
                    </div>
                  </button>
                </div>
              </div>
              
              <div v-if="selectedMember" class="flex items-center justify-between rounded-2xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 px-4 py-3 animate-in zoom-in-95">
                <div class="flex items-center gap-3">
                  <div class="h-8 w-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <UserIcon class="h-4 w-4" />
                  </div>
                  <span class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ selectedMember.fullName }}</span>
                </div>
                <button type="button" @click="selectedMember = null; memberSearch = ''" class="text-xs font-bold text-red-500 hover:text-red-600 dark:text-red-400 px-2 py-1 rounded-full hover:bg-red-500/10 transition-colors">
                  {{ $t('common.delete') }}
                </button>
              </div>
            </div>

            <!-- Service Name -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('beautyServices.serviceNameLabel') }} <span class="text-red-500">*</span></label>
              <select
                v-model="form.serviceName"
                class="input h-11 appearance-none bg-no-repeat bg-[right_1rem_center]"
                style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 class=%22feather feather-chevron-down%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M6 9l6 6 6-6%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E'); background-size: 1.25rem;"
              >
                <option value="" disabled>{{ $t('beautyServices.serviceNameSelect') }}</option>
                <optgroup v-for="category in serviceCategories" :key="category.key" :label="category.label" class="dark:bg-slate-800">
                  <option v-for="service in category.services" :key="service.type" :value="service.type">
                    {{ service.label }}
                  </option>
                </optgroup>
              </select>
              <p class="px-2 text-[10px] text-gray-400 dark:text-gray-500">{{ $t('beautyServices.serviceNameHint') }}</p>

              <!-- Action Types -->
              <div class="flex gap-2 p-1 glass rounded-full bg-gray-100/50 dark:bg-white/5 border-white/20 dark:border-white/10 mt-2">
                <button 
                  type="button" 
                  v-for="action in ['service', 'package', 'use'].filter(a => a !== 'use' || activePackages.length > 0)" 
                  :key="action"
                  @click="form.actionType = action"
                  class="flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all"
                  :class="form.actionType === action ? 'bg-white dark:bg-sky-600 dark:text-white shadow-sm text-sky-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
                >
                  {{ action === 'service' ? $t('beautyServices.add') : action === 'package' ? $t('beautyServices.buyPackage') : $t('beautyServices.useSession') }}
                </button>
              </div>

              <!-- Price Box -->
              <div v-if="form.serviceName && serviceTypes?.prices?.[form.serviceName] && form.actionType !== 'use'" class="mt-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-4 animate-in slide-in-from-top-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-500 dark:text-emerald-400/60 uppercase tracking-wider">
                    {{ $t('beautyServices.originalPrice') }}
                  </span>
                  <span class="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {{ formatPrice(serviceTypes?.prices?.[form.serviceName]) }}
                  </span>
                </div>
                <div v-if="form.discountPercent > 0" class="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/10">
                  <span class="text-xs font-bold text-red-500">{{ $t('pos.discount') }} (-{{ form.discountPercent }}%)</span>
                  <span class="text-sm font-bold text-red-500">- {{ formatPrice(((serviceTypes?.prices?.[form.serviceName] ?? 0) * form.discountPercent) / 100) }}</span>
                </div>
                <div v-if="form.discountPercent > 0" class="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/20">
                  <span class="text-sm font-black text-emerald-600 dark:text-emerald-400">{{ $t('beautyServices.finalPrice') }}</span>
                  <span class="text-lg font-black text-emerald-600 dark:text-emerald-400">{{ formatPrice(calculatedPrice) }}</span>
                </div>
              </div>

              <!-- Package Sessions Input -->
              <div v-if="form.actionType === 'package'" class="space-y-2 mt-4 animate-in fade-in slide-in-from-top-2">
                <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('beautyServices.totalSessions') }}</label>
                <input
                  v-model.number="form.totalSessions"
                  type="number"
                  min="1"
                  class="input h-11"
                  required
                />
              </div>

              <!-- Select Active Package -->
              <div v-if="form.actionType === 'use'" class="space-y-2 mt-4 animate-in fade-in slide-in-from-top-2">
                <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('beautyServices.packageDetails') }}</label>
                <select
                  v-model="form.selectedPackageId"
                  class="input h-11"
                  required
                >
                  <option value="" disabled>{{ $t('beautyServices.noActivePackages') }}</option>
                  <option v-for="pkg in filteredPackagesByService" :key="pkg.id" :value="pkg.id">
                    {{ pkg.serviceName }} ({{ pkg.remainingSessions }}/{{ pkg.totalSessions }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Payment Method & Details -->
            <div v-if="form.actionType !== 'use'" class="space-y-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('pos.paymentMethod') }}</label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button 
                    v-for="method in ['CASH', 'UZCARD', 'HUMO', 'VISA', 'CLICK', 'PAYME', 'MIXED']" 
                    :key="method"
                    type="button"
                    @click="form.paymentMethod = method"
                    class="py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border"
                    :class="form.paymentMethod === method ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400' : 'border-gray-200 dark:border-white/5 text-gray-500 dark:hover:bg-white/5'"
                  >
                    {{ method === 'CASH' ? $t('pos.cash') : method === 'MIXED' ? $t('pos.mixed') : $t(`pos.${method.toLowerCase()}`) }}
                  </button>
                </div>
              </div>

              <!-- Split Details -->
              <div v-if="form.paymentMethod === 'MIXED'" class="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
                  <div class="space-y-1.5">
                      <label class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('pos.cashAmount') }}</label>
                      <input
                          v-model.number="form.cashAmount"
                          type="number"
                          class="input h-11 font-bold dark:bg-sky-500/5 text-emerald-600"
                          @input="updateSplit('CASH')"
                      />
                  </div>
                  <div class="space-y-1.5">
                      <label class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('pos.cardAmount') }}</label>
                      <input
                          v-model.number="form.cardAmount"
                          type="number"
                          class="input h-11 font-bold dark:bg-purple-500/5 text-purple-600"
                          @input="updateSplit('CARD')"
                      />
                  </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('beautyServices.serviceDateLabel') }}</label>
                <input v-model="form.serviceDate" type="datetime-local" class="input h-11" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('pos.discount') }} (%)</label>
                <input v-model.number="form.discountPercent" type="number" min="0" max="100" class="input h-11" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">{{ $t('beautyServices.noteLabel') }}</label>
              <textarea
                v-model="form.note"
                rows="2"
                class="input rounded-2xl resize-none py-3"
                :placeholder="$t('beautyServices.notePlaceholder')"
              ></textarea>
            </div>

            <!-- Basket Table (Inside Modal) -->
            <div v-if="basket.length > 0" class="space-y-3 animate-in fade-in zoom-in-95">
              <h4 class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 flex items-center justify-between">
                {{ $t('beautyServices.selectedServices') }}
                <span class="bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-[10px]">{{ basket.length }}</span>
              </h4>
              <div class="glass rounded-2xl overflow-hidden border-white/20 dark:border-white/10 shadow-inner">
                <table class="min-w-full divide-y divide-white/10 dark:divide-white/5">
                  <thead class="bg-black/5 dark:bg-white/5">
                    <tr>
                      <th class="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">{{ $t('beautyServices.serviceNameLabel') }}</th>
                      <th class="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">{{ $t('beautyServices.columns.price') }}</th>
                      <th class="px-4 py-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/10 dark:divide-white/5 bg-white/20 dark:bg-transparent">
                    <tr v-for="(item, index) in basket" :key="index" class="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                      <td class="px-4 py-3">
                        <div class="font-bold text-sm text-gray-900 dark:text-gray-100">{{ item.serviceNameLabel }}</div>
                        <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border border-sky-500/20 text-sky-500">
                          {{ item.actionType === 'package' ? $t('beautyServices.buyPackage') : item.actionType === 'use' ? $t('beautyServices.useSession') : $t('beautyServices.add') }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {{ item.actionType === 'use' ? '—' : formatPrice(item.finalAmount) }}
                      </td>
                      <td class="px-4 py-3 text-right">
                        <button type="button" @click="removeFromBasket(index)" class="h-8 w-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors">
                          <TrashIcon class="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4 px-6 py-5 border-t border-white/20 dark:border-white/5 bg-white/10 dark:bg-black/20 flex-shrink-0">
            <button 
              type="button" 
              @click="addToBasket" 
              :disabled="!form.serviceName || !selectedMember"
              class="flex-1 rounded-full border border-sky-600 dark:border-sky-500 px-4 py-2.5 text-sm font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
            >
              <PlusIcon class="h-4 w-4" />
              {{ $t('beautyServices.addToList') }}
            </button>

            <button 
              type="submit" 
              :disabled="submitting || (basket.length === 0 && (!form.serviceName || !selectedMember))" 
              class="flex-[1.5] rounded-full bg-sky-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-sky-600/30 hover:bg-sky-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none transition-all"
            >
              <div class="flex items-center justify-center gap-3">
                <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
                {{ submitting ? $t('beautyServices.submitting') : $t('common.save') }}
                <div v-if="basket.length > 0" class="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {{ basket.length }}
                </div>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { beautyService, membersService, cashSessionsService } from '../services/supabaseService'
import * as XLSX from 'xlsx'
import { 
  TableCellsIcon, 
  DocumentTextIcon,
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  IdentificationIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'
import { formatDate, getCurrentDateTimeISO } from '../lib/dateUtils'
import { useToast } from '../composables/useToast'
import { useConfirm } from '../composables/useConfirm'

const { t } = useI18n()
const toast = useToast()
const { confirm } = useConfirm()

type Service = {
  id: number
  memberId: number
  serviceName: string
  serviceType?: string
  serviceDate: string
  note?: string
  fullName?: string
  amount?: number
  isPackage?: boolean
  paymentMethod?: string
}

type Member = {
  id: number
  fullName: string
  phone: string
  qrCodeId: string
}

const services = ref<Service[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const currentSession = ref<any>(null)

// Filter state
const dateFrom = ref('')
const dateTo = ref('')
const searchTerm = ref('')
const onlyToday = ref(false)

// Modal state
const showModal = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)

// Hozirgi vaqtni datetime-local formatida olish
// datetime-local input browser'ning local timezone'ida ishlaydi
const getCurrentDateTimeLocal = () => {
  const now = new Date()
  
  // Local timezone'da vaqtni olish (browser'ning timezone'i)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  // datetime-local format: YYYY-MM-DDTHH:mm
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Form data
const form = ref({
  serviceName: '', // Bu endi serviceType'ni ham o'z ichiga oladi
  serviceDate: getCurrentDateTimeLocal(), // Hozirgi vaqt (Toshkent timezone)
  discountPercent: 0, // Chegirma foizi
  note: '',
  actionType: 'service', // 'service', 'package', 'use'
  totalSessions: 10,
  selectedPackageId: '',
  paymentMethod: 'CASH',
  cashAmount: 0,
  cardAmount: 0
})

const activePackages = ref<any[]>([])
const filteredPackagesByService = computed(() => {
  if (!form.value.serviceName) return activePackages.value;
  return activePackages.value.filter(p => p.serviceType === form.value.serviceName);
});

// Service types (enum) - Backend'dan yuklanadi
// Service types (enum) - Default qiymatlar bilan initialize qilamiz
const serviceTypes = ref<{ types: string[], labels: Record<string, string>, categories: any, prices: Record<string, number | null> }>({
  types: [
    'golden_needle', 'bbl_laser', 'nd_yag_laser', 'fractional_laser', 'coolite_pro', 
    'shape_smart', 'laser_epilation', 'hydramaster', 'hifu', 'ems_slim', 
    'g8_massage', 'endo_roller', 'classic_massage', 'classic_facial', 'lymphatic',
    'passive_gym', 'waxing', 'nails', 'fitness_memberships'
  ],
  labels: {
    // Golden Needle
    'golden_needle_acne': 'Золотая Игла Лечение Акне (3 Сеанса)',
    'golden_needle_wrinkles': 'Золотая Игла Лечение Морщин (3 Сеанса)',
    'golden_needle_scars': 'Золотая Игла Лечение Ожоговых Шрамов (3 Сеанса)',
    'golden_needle_pigment': 'Золотая Игла Лечение Пигментных Пятен (3 Сеанса)',
    'golden_needle_stretch': 'Золотая Игла Лечение Растяжек Кожи',
    'golden_needle_pimple_scars': 'Золотая Игла Лечение Шрамов От Прыщей (3 Сеанса)',
    'golden_needle_rejuvenation': 'Золотая Игла Омоложение Кожи',
    'golden_needle_pores': 'Золотая Игла Сужение Пор (3 Сеанса)',
    // BBL Laser
    'bbl_freckles': 'BBL Лазер Лечение Веснушек (1 Сеанс)',
    'bbl_melasma': 'BBL Лазер Лечение Мелазмы (1 Сеанс)',
    'bbl_pigment': 'BBL Лазер Лечение Пигментных Пятен (1 Сеанс)',
    'bbl_redness': 'BBL Лазер Лечение Покраснений Кожи (1 Сеанс)',
    'bbl_pores': 'BBL Лазер Лечение Расширенных Пор (1 Сеанс)',
    'bbl_birthmarks': 'BBL Лазер Лечение Родимых Пятен (1 Сеанс)',
    'bbl_rosacea': 'BBL Лазер Лечение Розацеа (1 Сеанс)',
    // ND YAG
    'nd_yag_carbon': 'ND YAG Лазер Карбоновый Пилинг',
    'nd_yag_eyebrow': 'ND YAG Лазер Удаление Татуажа Бровей (3 Сеанса)',
    'nd_yag_tattoo': 'ND YAG Лазер Удаление Татуировки (8 Сеансов)',
    // Fractional
    'fractional_vaginal': 'Фракционный Лазер Вагинальное Сужение И Лечение Недержания Мочи',
    'fractional_wrinkles': 'Фракционный Лазер Лечение Морщин (1 Сеанс)',
    'fractional_scars': 'Фракционный Лазер Лечение Ожоговых Шрамов (1 Сеанс)',
    'fractional_pigment': 'Фракционный Лазер Лечение Пигментных Пятен (1 Сеанс)',
    'fractional_postop': 'Фракционный Лазер Лечение Послеоперационных Шрамов (1 Сеанс)',
    'fractional_stretch': 'Фракционный Лазер Лечение Растяжек (1 Сеанс)',
    'fractional_rubtsov': 'Фракционный Лазер Лечение Рубцов (1 Сеанс)',
    'fractional_sun': 'Фракционный Лазер Лечение Солнечных Пятен (1 Сеанс)',
    'fractional_general_scars': 'Фракционный Лазер Лечение Шрамов (1 Сеанс)',
    // Coolite Pro
    'coolite_lip': 'Coolite Pro Лазер Верхняя губа (Один сеанс)',
    'coolite_thigh': 'Coolite Pro Лазер Верхняя часть бедра (Один сеанс)',
    'coolite_arm_upper': 'Coolite Pro Лазер Верхняя часть руки (Один сеанс)',
    'coolite_face': 'Coolite Pro Лазер Все лицо (Один сеанс)',
    'coolite_legs': 'Coolite Pro Лазер Все ноги (Один сеанс)',
    'coolite_full_body': 'Coolite Pro Лазер Все тело: подмышки, гениталии, все ноги (6 сеансов)',
    'coolite_arm_full': 'Coolite Pro Лазер Вся рука (Один сеанс)',
    'coolite_chest': 'Coolite Pro Лазер Грудь (Один сеанс)',
    'coolite_occiput': 'Coolite Pro Лазер Затылок (Один сеанс)',
    'coolite_forehead': 'Coolite Pro Лазер Лоб (Один сеанс)',
    'coolite_thigh_lower': 'Coolite Pro Лазер Нижняя часть бедра (Один сеанс)',
    'coolite_arm_lower': 'Coolite Pro Лазер Нижняя часть руки (Один сеанс)',
    'coolite_buttocks_lower': 'Coolite Pro Лазер Нижняя часть ягодиц (Один сеанс)',
    'coolite_perianal': 'Coolite Pro Лазер Перинальная зона (Один сеанс)',
    'coolite_chin': 'Coolite Pro Лазер Подбородок (Один сеанс)',
    'coolite_axilla': 'Coolite Pro Лазер Подмышки (Один сеанс)',
    'coolite_popa': 'Coolite Pro Лазер Попа (Один сеанс)',
    'coolite_waist': 'Coolite Pro Лазер Поясница (Один сеанс)',
    'coolite_arm': 'Coolite Pro Лазер Рука (Один сеанс)',
    'coolite_back': 'Coolite Pro Лазер Спина (Один сеанс)',
    'coolite_feet': 'Coolite Pro Лазер Ступни (Один сеанс)',
    'coolite_stache': 'Coolite Pro Лазер Усики (Один сеанс)',
    'coolite_neck': 'Coolite Pro Лазер Шея (Один сеанс)',
    'coolite_buttocks': 'Coolite Pro Лазер Ягодицы (Один сеанс)',
    // Shape Smart
    'shape_smart_local': 'Shape Smart Локальное Похудение (8 Сеансов)',
    'shape_smart_hips': 'Shape Smart Локальное Похудение Бёдра (8 Сеансов)',
    'shape_smart_thighs_upper': 'Shape Smart Локальное Похудение Верхняя Часть Бёдер (8 Сеансов)',
    'shape_smart_belly': 'Shape Smart Локальное Похудение Живот (8 Сеансов)',
    'shape_smart_face': 'Shape Smart Локальное Похудение Лифтинг Лица (8 Сеансов)',
    'shape_smart_thighs_lower': 'Shape Smart Локальное Похудение Нижняя Часть Бёдер (8 Сеансов)',
    'shape_smart_chin': 'Shape Smart Локальное Похудение Подбородок (8 Сеансов)',
    'shape_smart_waist': 'Shape Smart Локальное Похудение Поясница (8 Сеансов)',
    'shape_smart_arms': 'Shape Smart Локальное Похудение Руки (8 Сеансов)',
    'shape_smart_back': 'Shape Smart Локальное Похудение Спина (8 Сеансов)',
    // Epilation
    'epil_sideburns': 'Лазерная Эпиляция Бакенбарды (1 Сеанс)',
    'epil_hips': 'Лазерная Эпиляция Бёдра (1 Сеанс)',
    'epil_lip': 'Лазерная Эпиляция Верхняя Губа (1 Сеанс)',
    'epil_arms_upper': 'Лазерная Эпиляция Верхняя Часть Рук (1 Сеанс)',
    'epil_buttocks_upper': 'Лазерная Эпиляция Верхняя Часть Ягодиц (1 Сеанс)',
    'epil_face': 'Лазерная Эпиляция Всё Лицо (1 Сеанс)',
    'epil_legs': 'Лазерная Эпиляция Всё Ноги (1 Сеанс)',
    'epil_arms': 'Лазерная Эпиляция Всё Руки (1 Сеанс)',
    'epil_full_body': 'Лазерная Эпиляция Всё Тело (Подмышки, Генитальная Область, Всё Ноги) (1 Сеанс)',
    'epil_genitals': 'Лазерная Эпиляция Генитальная Область (1 Сеанс)',
    'epil_shins': 'Лазерная Эпиляция Голени (1 Сеанс)',
    'epil_chest': 'Лазерная Эпиляция Грудь (1 Сеанс)',
    'epil_belly': 'Лазерная Эпиляция Живот (1 Сеанс)',
    'epil_occiput': 'Лазерная Эпиляция Затылок (1 Сеанс)',
    'epil_hands': 'Лазерная Эпиляция Кисти (1 Сеанс)',
    'epil_forehead': 'Лазерная Эпиляция Лоб (1 Сеанс)',
    'epil_arms_lower': 'Лазерная Эпиляция Нижняя Часть Рук (1 Сеанс)',
    'epil_chin': 'Лазерная Эпиляция Подбородок (1 Сеанс)',
    'epil_axilla': 'Лазерная Эпиляция Подмышки (1 Сеанс)',
    'epil_waist': 'Лазерная Эпиляция Поясница (1 Сеанс)',
    'epil_back': 'Лазерная Эпиляция Спина (1 Сеанс)',
    'epil_feet': 'Лазерная Эпиляция Ступни (1 Сеанс)',
    'epil_neck': 'Лазерная Эпиляция Шея (1 Сеанс)',
    'epil_buttocks': 'Лазерная Эпиляция Ягодицы (1 Сеанс)',
    // Hydramaster
    'hydra_chest': 'Hydramaster Подтяжка Груди (1 Сеанс)',
    'hydra_buttocks': 'Hydramaster Подтяжка Ягодиц (1 Сеанс)',
    'hydra_face': 'Hydramaster Уход За Кожей Лица (1 Сеанс)',
    // HIFU
    'hifu_face': 'HIFU Лифтинг Лица (1 Сеанс)',
    'hifu_chin': 'HIFU Лифтинг Подбородка (1 Сеанс)',
    'hifu_rejuvenation': 'HIFU Омоложение Кожи (1 Сеанс)',
    'hifu_eyebrows': 'HIFU Поднятие Бровей (1 Сеанс)',
    'hifu_wrinkles': 'HIFU Уменьшение Морщин (1 Сеанс)',
    // EMS Slim
    'ems_hips': 'EMS Slim Бёдра (8 Сеансов)',
    'ems_thighs_upper': 'EMS Slim Верхняя Часть Бёдер (8 Сеансов)',
    'ems_belly': 'EMS Slim Живот (8 Сеансов)',
    // G8
    'g8_general': 'G8 Массаж (1 Сеанс)',
    'g8_hips': 'G8 Массаж Бёдра (8 Сеансов)',
    'g8_thighs_upper': 'G8 Массаж Верхняя Часть Бёдер (8 Сеансов)',
    'g8_belly': 'G8 Массаж Живот (8 Сеансов)',
    'g8_thighs_lower': 'G8 Массаж Нижняя Часть Бёдер (8 Сеансов)',
    'g8_waist': 'G8 Массаж Поясница (8 Сеансов)',
    'g8_back': 'G8 Массаж Спина (8 Сеансов)',
    // Endo Roller
    'endo_thighs_upper': 'Endo Roller Массаж Верхняя Часть Бёдер (1 Сеанс)',
    'endo_thighs_lower': 'Endo Roller Массаж Нижняя Часть Бёдер (1 Сеанс)',
    'endo_waist': 'Endo Roller Массаж Поясница (1 Сеанс)',
    'endo_back': 'Endo Roller Массаж Спина (1 Сеанс)',
    // Others
    'needle_epil': 'Игольчатая Эпиляция (Поминутно)',
    'massage_classic': 'Классический Массаж Тела',
    'face_classic': 'Классический Уход За Кожей Лица',
    'lympho_1': 'Лимфодренаж (1 сеанс)',
    'lympho_gift': 'Лимфодренаж (4 сеанса в подарок)',
    'lympho_8': 'Лимфодренаж (8 сеанс)',
    'lympho_full': 'Лимфодренаж Всего Тела',
    'hair_care': 'Массаж И Уход За Волосами',
    'passive_gym_base': 'Пассивная Гимнастика',
    'passive_gym_1': 'Пассивная гимнастика (1 сеанс)',
    'passive_gym_gift': 'Пассивная гимнастика (4 сеанса в подарок)',
    'passive_gym_8': 'Пассивная гимнастика (8 сеанс)',
    // Waxing
    'wax_face': 'Восковая депиляция – Всё лицо',
    'wax_genitals': 'Восковая депиляция – Генитальная зона',
    'wax_package': 'Восковая депиляция – Пакет (Половина руки – Подмышки – Половина ноги – Генитальная зона)',
    'wax_axilla': 'Восковая депиляция – Подмышечные впадины',
    'wax_arm_full': 'Восковая депиляция – Полная рука',
    'wax_legs_full': 'Восковая депиляция – Полные ноги',
    'wax_leg_half': 'Восковая депиляция – Половина ноги',
    'wax_arm_half': 'Восковая депиляция – Половина руки',
    'wax_waist': 'Восковая депиляция – Поясница',
    'wax_back': 'Восковая депиляция – Спина',
    'wax_stache': 'Восковая депиляция – Усики',
    'wax_buttocks': 'Восковая депиляция – Ягодицы',
    // Nails
    'polish': 'Лак Для Ногтей',
    'manicure': 'Маникюр',
    'pedicure_nails': 'Маникюр ногтей на ногах',
    'extension': 'Наращивание Ногтей',
    'pedicure': 'Педикюр',
    'plastic_nails': 'Пластиковые Ногти',
    'heel_care': 'Уход За Пятками',
    'henna': 'Хна Для Ногтей',
    'shellac': 'Шеллак',
    // Fitness
    'zumba_month': 'Зумба (Ежемесячный Абонемент На 12 Занятий)',
    'zumba_session': 'Зумба (Занятие)',
    'yoga_month': 'Йога (Ежемесячный Абонемент, 3 Раза В Неделю)',
    'pilates_group': 'Пилатес (Групповое Занятие)',
    'pilates_individual': 'Пилатес (Индивидуальное Занятие)',
    'nutrition_plan': 'Планирование И Контроль Спортивного Питания',
    'fitness_12m': 'Фитнес (Абонемент На 12 Месяцев)',
    'fitness_3m': 'Фитнес (Абонемент На 3 Месяца)',
    'fitness_6m': 'Фитнес (Абонемент На 6 Месяцев)'
  },
  categories: {
    laser: { label: 'Лазерные процедуры (Золотая Игла, BBL, ND YAG, Фракционный)', services: ['golden_needle_acne', 'golden_needle_wrinkles', 'golden_needle_scars', 'golden_needle_pigment', 'golden_needle_stretch', 'golden_needle_pimple_scars', 'golden_needle_rejuvenation', 'golden_needle_pores', 'bbl_freckles', 'bbl_melasma', 'bbl_pigment', 'bbl_redness', 'bbl_pores', 'bbl_birthmarks', 'bbl_rosacea', 'nd_yag_carbon', 'nd_yag_eyebrow', 'nd_yag_tattoo', 'fractional_vaginal', 'fractional_wrinkles', 'fractional_scars', 'fractional_pigment', 'fractional_postop', 'fractional_stretch', 'fractional_rubtsov', 'fractional_sun', 'fractional_general_scars'] },
    coolite: { label: 'Coolite Pro Лазер (Эпиляция)', services: ['coolite_lip', 'coolite_thigh', 'coolite_arm_upper', 'coolite_face', 'coolite_legs', 'coolite_full_body', 'coolite_arm_full', 'coolite_chest', 'coolite_occiput', 'coolite_forehead', 'coolite_thigh_lower', 'coolite_arm_lower', 'coolite_buttocks_lower', 'coolite_perianal', 'coolite_chin', 'coolite_axilla', 'coolite_popa', 'coolite_waist', 'coolite_arm', 'coolite_back', 'coolite_feet', 'coolite_stache', 'coolite_neck', 'coolite_buttocks'] },
    slimming: { label: 'Похудение и Коррекция фигуры (Shape Smart, EMS, G8, Endo Roller)', services: ['shape_smart_local', 'shape_smart_hips', 'shape_smart_thighs_upper', 'shape_smart_belly', 'shape_smart_face', 'shape_smart_thighs_lower', 'shape_smart_chin', 'shape_smart_waist', 'shape_smart_arms', 'shape_smart_back', 'ems_hips', 'ems_thighs_upper', 'ems_belly', 'g8_general', 'g8_hips', 'g8_thighs_upper', 'g8_belly', 'g8_thighs_lower', 'g8_waist', 'g8_back', 'endo_thighs_upper', 'endo_thighs_lower', 'endo_waist', 'endo_back'] },
    epilation: { label: 'Лазерная Эпиляция (Стандарт)', services: ['epil_sideburns', 'epil_hips', 'epil_lip', 'epil_arms_upper', 'epil_buttocks_upper', 'epil_face', 'epil_legs', 'epil_arms', 'epil_full_body', 'epil_genitals', 'epil_shins', 'epil_chest', 'epil_belly', 'epil_occiput', 'epil_hands', 'epil_forehead', 'epil_arms_lower', 'epil_chin', 'epil_axilla', 'epil_waist', 'epil_back', 'epil_feet', 'epil_neck', 'epil_buttocks'] },
    skincare: { label: 'Уход за кожей и Массаж', services: ['hydra_chest', 'hydra_buttocks', 'hydra_face', 'hifu_face', 'hifu_chin', 'hifu_rejuvenation', 'hifu_eyebrows', 'hifu_wrinkles', 'massage_classic', 'face_classic', 'lympho_1', 'lympho_gift', 'lympho_8', 'lympho_full', 'hair_care', 'passive_gym_base', 'passive_gym_1', 'passive_gym_gift', 'passive_gym_8'] },
    waxing_nails: { label: 'Восковая депиляция и Ногтевой сервис', services: ['wax_face', 'wax_genitals', 'wax_package', 'wax_axilla', 'wax_arm_full', 'wax_legs_full', 'wax_leg_half', 'wax_arm_half', 'wax_waist', 'wax_back', 'wax_stache', 'wax_buttocks', 'polish', 'manicure', 'pedicure_nails', 'extension', 'pedicure', 'plastic_nails', 'heel_care', 'henna', 'shellac'] },
    fitness: { label: 'Фитнес и Абонементы', services: ['zumba_month', 'zumba_session', 'yoga_month', 'pilates_group', 'pilates_individual', 'nutrition_plan', 'fitness_12m', 'fitness_3m', 'fitness_6m'] }
  },
  prices: {
    // Golden Needle
    'golden_needle_acne': 4800000, 'golden_needle_wrinkles': 4800000, 'golden_needle_scars': 4800000, 'golden_needle_pigment': 4800000, 'golden_needle_stretch': 3000000, 'golden_needle_pimple_scars': 4800000, 'golden_needle_rejuvenation': 0, 'golden_needle_pores': 4800000,
    // BBL
    'bbl_freckles': 3600000, 'bbl_melasma': 3600000, 'bbl_pigment': 3600000, 'bbl_redness': 3600000, 'bbl_pores': 3600000, 'bbl_birthmarks': 3600000, 'bbl_rosacea': 3600000,
    // ND YAG
    'nd_yag_carbon': 2600000, 'nd_yag_eyebrow': 2600000, 'nd_yag_tattoo': 6000000,
    // Fractional
    'fractional_vaginal': 6000000, 'fractional_wrinkles': 3000000, 'fractional_scars': 3000000, 'fractional_pigment': 3000000, 'fractional_postop': 3000000, 'fractional_stretch': 3000000, 'fractional_rubtsov': 3000000, 'fractional_sun': 3000000, 'fractional_general_scars': 3000000,
    // Coolite Pro
    'coolite_lip': 190000, 'coolite_thigh': 720000, 'coolite_arm_upper': 360000, 'coolite_face': 720000, 'coolite_legs': 1900000, 'coolite_full_body': 4800000, 'coolite_arm_full': 720000, 'coolite_chest': 550000, 'coolite_occiput': 400000, 'coolite_forehead': 240000, 'coolite_thigh_lower': 720000, 'coolite_arm_lower': 440000, 'coolite_buttocks_lower': 720000, 'coolite_perianal': 440000, 'coolite_chin': 190000, 'coolite_axilla': 720000, 'coolite_popa': 440000, 'coolite_waist': 440000, 'coolite_arm': 440000, 'coolite_back': 720000, 'coolite_feet': 440000, 'coolite_stache': 240000, 'coolite_neck': 192000, 'coolite_buttocks': 550000,
    // Shape Smart
    'shape_smart_local': 4000000, 'shape_smart_hips': 4000000, 'shape_smart_thighs_upper': 4000000, 'shape_smart_belly': 4000000, 'shape_smart_face': 4000000, 'shape_smart_thighs_lower': 4000000, 'shape_smart_chin': 4000000, 'shape_smart_waist': 4000000, 'shape_smart_arms': 4000000, 'shape_smart_back': 4000000,
    // Epilation
    'epil_sideburns': 240000, 'epil_hips': 720000, 'epil_lip': 192000, 'epil_arms_upper': 360000, 'epil_buttocks_upper': 720000, 'epil_face': 720000, 'epil_legs': 1920000, 'epil_arms': 720000, 'epil_full_body': 4800000, 'epil_genitals': 432000, 'epil_shins': 720000, 'epil_chest': 552000, 'epil_belly': 552000, 'epil_occiput': 408000, 'epil_hands': 432000, 'epil_forehead': 240000, 'epil_arms_lower': 432000, 'epil_chin': 192000, 'epil_axilla': 720000, 'epil_waist': 432000, 'epil_back': 720000, 'epil_feet': 432000, 'epil_neck': 192000, 'epil_buttocks': 432000,
    // Hydramaster
    'hydra_chest': 700000, 'hydra_buttocks': 1000000, 'hydra_face': 700000,
    // HIFU
    'hifu_face': 3000000, 'hifu_chin': 3000000, 'hifu_rejuvenation': 3000000, 'hifu_eyebrows': 3000000, 'hifu_wrinkles': 3000000,
    // EMS Slim
    'ems_hips': 3600000, 'ems_thighs_upper': 3600000, 'ems_belly': 3600000,
    // G8
    'g8_general': 450000, 'g8_hips': 3600000, 'g8_thighs_upper': 3600000, 'g8_belly': 3600000, 'g8_thighs_lower': 3600000, 'g8_waist': 3600000, 'g8_back': 3600000,
    // Endo
    'endo_thighs_upper': 500000, 'endo_thighs_lower': 500000, 'endo_waist': 500000, 'endo_back': 500000,
    // Others
    'needle_epil': 76000, 'massage_classic': 400000, 'face_classic': 500000, 'lympho_1': 500000, 'lympho_gift': 0, 'lympho_8': 4000000, 'lympho_full': 500000, 'hair_care': 400000, 'passive_gym_base': 400000, 'passive_gym_1': 400000, 'passive_gym_gift': 0, 'passive_gym_8': 3200000,
    // Waxing
    'wax_face': 60000, 'wax_genitals': 90000, 'wax_package': 200000, 'wax_axilla': 40000, 'wax_arm_full': 60000, 'wax_legs_full': 120000, 'wax_leg_half': 60000, 'wax_arm_half': 40000, 'wax_waist': 75000, 'wax_back': 75000, 'wax_stache': 20000, 'wax_buttocks': 60000,
    // Nails
    'polish': 100000, 'manicure': 80000, 'pedicure_nails': 80000, 'extension': 400000, 'pedicure': 150000, 'plastic_nails': 230000, 'heel_care': 250000, 'henna': 100000, 'shellac': 180000,
    // Fitness
    'zumba_month': 400000, 'zumba_session': 80000, 'yoga_month': 600000, 'pilates_group': 120000, 'pilates_individual': 200000, 'nutrition_plan': 600000, 'fitness_12m': 4200000, 'fitness_3m': 1200000, 'fitness_6m': 2250000
  }
})

const calculatedPrice = computed(() => {
  if (!form.value.serviceName || !serviceTypes.value?.prices) return 0
  const originalPrice = serviceTypes.value.prices[form.value.serviceName] ?? 0
  if (originalPrice === 0) return 0
  const discount = form.value.discountPercent || 0
  if (discount === 0) return originalPrice
  return originalPrice - (originalPrice * discount) / 100
})

const serviceCategories = computed(() => {
  if (!serviceTypes.value) return []
  
  const categories: any[] = []
  const cats = serviceTypes.value.categories
  
  for (const [key, val] of Object.entries(cats)) {
    const category = val as { label: string, services: string[] }
    categories.push({
      key,
      label: category.label,
      services: category.services.map((type: string) => ({
        type,
        label: serviceTypes.value.labels[type] || type
      }))
    })
  }
  
  return categories
})

// Endi availableServiceNames kerak emas, chunki barcha xizmatlar bitta dropdown'da

// To'lov usuli o'zgarganda split miqdorlarni tozalash

const updateSplit = (source: 'CASH' | 'CARD') => {
    const total = calculatedPrice.value || 0;
    if (source === 'CASH') {
        form.value.cardAmount = Math.max(0, total - form.value.cashAmount);
    } else {
        form.value.cashAmount = Math.max(0, total - form.value.cardAmount);
    }
};

watch(() => form.value.paymentMethod, (newMethod) => {
    if (newMethod === 'MIXED') {
        form.value.cashAmount = calculatedPrice.value || 0;
        form.value.cardAmount = 0;
    }
});

watch(calculatedPrice, (newTotal) => {
    if (form.value.paymentMethod === 'MIXED') {
        form.value.cashAmount = newTotal || 0;
        form.value.cardAmount = 0;
    }
});

watch(() => form.value.serviceName, (newServiceKey) => {
  if (!newServiceKey || !serviceTypes.value?.labels) return;
  const label = serviceTypes.value.labels[newServiceKey];
  if (!label) return;

  // Qavs ichida nechta seans borligini aniqlash (Masalan: "(3 Сеанса)" yoki "(8 Сеансов)")
  const match = label.match(/\((\d+)\s*(Сеанс|сеанс|Сеанса|сеанса|Сеансов|сеансов|Занятие|Занятий)/i);
  if (match && match[1]) {
      const num = parseInt(match[1]);
      if (num > 1) {
          form.value.actionType = 'package';
          form.value.totalSessions = num;
      } else {
          form.value.actionType = 'service';
          form.value.totalSessions = 1;
      }
  } else {
      // Agar "Абонемент" so'zi bo'lsa uni ham e'tiborga olish mumkin
      if (label.toLowerCase().includes('абонемент')) {
          form.value.actionType = 'package';
          form.value.totalSessions = 12; // Default 12 deb beramiz (yoki oyiga farqli)
      } else {
          form.value.actionType = 'service';
          form.value.totalSessions = 1;
      }
  }
});

// Member selection
const members = ref<Member[]>([])
const memberSearch = ref('')
const selectedMember = ref<Member | null>(null)
const showMemberDropdown = ref(false)

const filteredMembersList = computed(() => {
  if (!memberSearch.value.trim()) {
    return members.value.slice(0, 10)
  }
  const search = memberSearch.value.toLowerCase()
  return members.value.filter(member =>
    member.fullName.toLowerCase().includes(search) ||
    member.phone.includes(search) ||
    member.qrCodeId.toLowerCase().includes(search)
  ).slice(0, 10)
})

const filterMembers = () => {
  showMemberDropdown.value = true
}

const selectMember = (member: Member) => {
  selectedMember.value = member
  memberSearch.value = member.fullName
  showMemberDropdown.value = false
}

const fetchMembers = async () => {
  try {
    const data = await membersService.getAll()
    members.value = data
    if (data.length === 0) {
      formError.value = t('beautyServices.errorNoMembers')
    }
  } catch (err: any) {
    console.error(err)
    formError.value = t('beautyServices.errorLoadingMembers')
  }
}

const openModal = async () => {
  showModal.value = true
  formError.value = null
  successMessage.value = null
  // Hozirgi vaqtni yangilash (Toshkent timezone)
  form.value.serviceDate = getCurrentDateTimeLocal()
  // Har doim bazadan yangi a'zolarni yuklash
  await fetchMembers()
  
  // Kassa sessiyasini tekshirish
  try {
    currentSession.value = await cashSessionsService.getCurrentSession()
  } catch (err) {
    console.error('Kassa sessiyasini yuklashda xatolik:', err)
  }
}

const basket = ref<any[]>([])

const addToBasket = () => {
  if (!selectedMember.value || !form.value.serviceName) {
    formError.value = t('beautyServices.errorMemberRequired')
    return
  }

  if (form.value.actionType === 'use' && !form.value.selectedPackageId) {
    formError.value = t('beautyServices.noActivePackages')
    return
  }

  const serviceType = form.value.serviceName
  const serviceNameLabel = serviceTypes.value?.labels[serviceType] || form.value.serviceName
  
  const originalPrice = serviceTypes.value?.prices?.[serviceType] || 0
  const discount = form.value.discountPercent || 0
  let finalAmount = originalPrice
  if (originalPrice > 0 && discount > 0) {
    const discountAmount = (originalPrice * discount) / 100
    finalAmount = originalPrice - discountAmount
  }

  basket.value.push({
    ...form.value,
    serviceNameLabel,
    finalAmount,
    cashAmount: form.value.paymentMethod === 'MIXED' ? form.value.cashAmount : (form.value.paymentMethod === 'CASH' ? finalAmount : 0),
    cardAmount: form.value.paymentMethod === 'MIXED' ? form.value.cardAmount : (['UZCARD', 'HUMO', 'VISA', 'CLICK', 'PAYME'].includes(form.value.paymentMethod) ? finalAmount : 0),
    memberId: selectedMember.value.id,
    memberName: selectedMember.value.fullName
  })

  // Formani qisman tozalash
  form.value.serviceName = ''
  form.value.discountPercent = 0
  form.value.note = ''
  form.value.totalSessions = 10
  form.value.selectedPackageId = ''
  form.value.paymentMethod = 'CASH'
  form.value.cashAmount = 0
  form.value.cardAmount = 0
  formError.value = null
}

const removeFromBasket = (index: number) => {
  basket.value.splice(index, 1)
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    serviceName: '',
    serviceDate: getCurrentDateTimeLocal(), // Hozirgi vaqt (Toshkent timezone)
    discountPercent: 0,
    note: '',
    actionType: 'service',
    totalSessions: 10,
    selectedPackageId: '',
    paymentMethod: 'CASH',
    cashAmount: 0,
    cardAmount: 0
  }
  selectedMember.value = null
  memberSearch.value = ''
  formError.value = null
  showMemberDropdown.value = false
  activePackages.value = []
  basket.value = []
}

watch(selectedMember, async (newVal) => {
  if (newVal) {
    try {
      activePackages.value = await beautyService.getMemberPackages(newVal.id)
    } catch (err) {
      console.error('Paketlarni yuklashda xatolik:', err)
    }
  } else {
    activePackages.value = []
  }
})

// Endi watch kerak emas, chunki bitta dropdown bor

const handleSubmit = async () => {
  formError.value = null
  
  if (basket.value.length === 0) {
    if (!form.value.serviceName) {
      formError.value = t('beautyServices.errorServiceNameRequired')
      return
    }
    if (!selectedMember.value) {
      formError.value = t('beautyServices.errorMemberRequired')
      return
    }
    addToBasket()
  } else if (form.value.serviceName) {
    // Agar savatda narsa bo'lsa va yana xizmat tanlangan bo'lsa, uni ham savatga qo'shamiz
    addToBasket()
  }

  // To'lov talab qilinadigan amallarni tekshirish
  const needsPayment = basket.value.some(item => item.finalAmount > 0)
  if (needsPayment && !currentSession.value) {
    formError.value = t('cashier.noActiveSession')
    return
  }

  submitting.value = true
  try {
    // Savatdagi barcha elementlarni birma-bir yuboramiz
    for (const item of basket.value) {
      if (item.actionType === 'service') {
        const payload = {
          memberId: item.memberId,
          serviceType: item.serviceName || undefined,
          serviceName: item.serviceNameLabel,
          serviceDate: item.serviceDate ? new Date(item.serviceDate).toISOString() : undefined,
          amount: (item.finalAmount !== null && item.finalAmount !== undefined) ? item.finalAmount : 0,
          cashAmount: item.cashAmount,
          cardAmount: item.cardAmount,
          discountPercent: item.discountPercent > 0 ? item.discountPercent : undefined,
          cashSessionId: currentSession.value?.id || undefined,
          paymentMethod: item.paymentMethod,
          note: item.note.trim() || undefined
        }
        await beautyService.add(payload)
      } 
      else if (item.actionType === 'package') {
        const payload = {
          memberId: item.memberId,
          serviceType: item.serviceName,
          serviceName: item.serviceNameLabel,
          totalSessions: item.totalSessions,
          price: item.finalAmount,
          cashAmount: item.cashAmount,
          cardAmount: item.cardAmount,
          cashSessionId: currentSession.value?.id || undefined,
          paymentMethod: item.paymentMethod,
          notes: item.note.trim() || undefined
        }
        await beautyService.addPackage(payload)
      }
      else if (item.actionType === 'use') {
        await beautyService.usePackageSession(
          item.selectedPackageId, 
          item.serviceDate ? new Date(item.serviceDate).toISOString() : undefined,
          undefined,
          currentSession.value?.id
        )
      }
    }

    successMessage.value = t('beautyServices.successAdded')
    closeModal()
    await fetchServices()
    
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err: any) {
    console.error(err)
    formError.value = err.message || t('beautyServices.errorAdding')
  } finally {
    submitting.value = false
  }
}

const fetchServiceTypes = async () => {
  try {
    const data = await beautyService.getServiceTypes()
    serviceTypes.value = data
  } catch (err) {
    console.error('Xizmat turlarini yuklashda xatolik:', err)
  }
}

const fetchServices = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await beautyService.getAll()
    services.value = data
  } catch (err: any) {
    console.error(err)
    error.value = err.message || t('beautyServices.errorLoading')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  dateFrom.value = ''
  dateTo.value = ''
  onlyToday.value = false
  fetchServices()
  fetchServiceTypes()  // Enum qiymatlarini yuklash
  fetchMembers()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (showMemberDropdown.value && !target.closest('.member-dropdown-container')) {
    showMemberDropdown.value = false
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showModal.value) {
    closeModal()
  }
}

const filteredServices = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()
  return services.value.filter((s) => {
    const matchesSearch =
      !search ||
      (s.fullName && s.fullName.toLowerCase().includes(search)) ||
      s.serviceName.toLowerCase().includes(search) ||
      (s.note && s.note.toLowerCase().includes(search))

    // Sana filtri (Mahalliy vaqtni hisobga olgan holda)
    let matchesDate = true
    
    // ISO string'dan YYYY-MM-DD local formatini olish
    const getLocalDateString = (isoString: string) => {
      if (!isoString) return ''
      const d = new Date(isoString)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const itemDate = getLocalDateString(s.serviceDate)
    
    if (onlyToday.value) {
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      matchesDate = itemDate === todayStr
    } else if (dateFrom.value || dateTo.value) {
      if (dateFrom.value && dateTo.value) {
        matchesDate = itemDate >= dateFrom.value && itemDate <= dateTo.value
      } else if (dateFrom.value) {
        matchesDate = itemDate >= dateFrom.value
      } else if (dateTo.value) {
        matchesDate = itemDate <= dateTo.value
      }
    }

    return matchesSearch && matchesDate
  })
})

const resetFilters = () => {
  dateFrom.value = ''
  dateTo.value = ''
  searchTerm.value = ''
  onlyToday.value = false
}

const processedServices = computed(() => {
  const list = filteredServices.value;
  if (list.length === 0) return [];

  const result: any[] = [];
  const handledIds = new Set<string>();

  // 1. Birinchi paketlarni aniqlaymiz
  const packages = list.filter(s => s.isPackage);
  
  // 2. Har bir paket uchun unga tegishli seanslarni topamiz
  packages.forEach(pkg => {
    result.push(pkg);
    handledIds.add('p-' + pkg.id);

    // Paket nomini normallashtirish (qavs ichidagi seanslar sonini olib tashlash)
    const basePkgName = pkg.serviceName.split(' (')[0].trim().toLowerCase();

    // Paketga mos keladigan seanslarni qidiramiz
    const sessions = list.filter(s => {
      if (s.isPackage || handledIds.has('s-' + s.id)) return false;
      
      const baseSessionName = s.serviceName.split(' (')[0].trim().toLowerCase();
      
      // Shartlar: 
      // 1. Mijoz bir xil
      // 2. Nom asosi bir xil
      // 3. Summasi 0 yoki to'lov turi PACKAGE orqali
      const isCorrectService = s.memberId === pkg.memberId && 
                               (baseSessionName === basePkgName || basePkgName.includes(baseSessionName));
                               
      const isFreeOrPackage = s.amount === 0 || s.paymentMethod === 'PACKAGE';
      
      // 4. Sana: Paket olingan kunda yoki undan keyin (vaqt farqi biroz bo'lishi mumkin)
      const pkgDate = new Date(pkg.serviceDate);
      const sessionDate = new Date(s.serviceDate);
      
      // Bir xil kun yoki seans keyinroq
      const isSameDay = pkgDate.getFullYear() === sessionDate.getFullYear() &&
                        pkgDate.getMonth() === sessionDate.getMonth() &&
                        pkgDate.getDate() === sessionDate.getDate();
                        
      const isAfter = sessionDate >= pkgDate;

      return isCorrectService && isFreeOrPackage && (isSameDay || isAfter);
    }).sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime());

    sessions.forEach((session, index) => {
      result.push({
        ...session,
        isSession: true,
        parentPackageId: pkg.id,
        isLastChild: index === sessions.length - 1
      });
      handledIds.add('s-' + session.id);
    });
  });

  // 3. Qolgan oddiy xizmatlarni qo'shamiz
  list.forEach(s => {
    const key = (s.isPackage ? 'p-' : 's-') + s.id;
    if (!handledIds.has(key)) {
      result.push(s);
    }
  });

  return result;
});

// formatDate funksiyasi utility'dan import qilingan

// Narxni formatlash funksiyasi
const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '—'
  if (price === 0) return `0 ${t('common.currency') || 'so\'m'}`
  // So'm formatida ko'rsatish (1000 -> 1 000 so'm)
  return new Intl.NumberFormat(t('locale') || 'uz-UZ', {
    style: 'decimal',
    currency: 'UZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

// Excel export (XLSX formatida)
const exportToExcel = () => {
  const data = filteredServices.value
  if (data.length === 0) {
    toast.warning(t('common.noData'))
    return
  }

  // Excel uchun ma'lumotlarni tayyorlash
  const excelData = data.map(s => ({
    [t('beautyServices.columns.name')]: s.fullName || t('beautyServices.noName'),
    [t('beautyServices.columns.service')]: s.serviceName,
    [t('beautyServices.columns.date')]: formatDate(s.serviceDate),
    [t('beautyServices.columns.note')]: s.note || '—'
  }))

  // Workbook yaratish
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(excelData)

  // Column width'ni sozlash
  ws['!cols'] = [
    { wch: 25 }, // Ism
    { wch: 20 }, // Xizmat nomi
    { wch: 20 }, // Sana va vaqt
    { wch: 30 }  // Izoh
  ]

  // Sheet'ni workbook'ga qo'shish
  XLSX.utils.book_append_sheet(wb, ws, t('beautyServices.title'))

  // Fayl nomi
  const dateRange = dateFrom.value && dateTo.value 
    ? `${dateFrom.value}_${dateTo.value}`
    : new Date().toISOString().slice(0, 10)
  
  // Excel faylini yuklab olish
  XLSX.writeFile(wb, `gozallik_xizmatlari_${dateRange}.xlsx`)
}

// PDF export
const exportToPDF = () => {
  const data = filteredServices.value
  if (data.length === 0) {
    toast.warning(t('common.noData'))
    return
  }

  // PDF uchun HTML yaratish
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const dateRange = dateFrom.value && dateTo.value 
    ? `${formatDate(dateFrom.value + 'T00:00:00').split(' ')[0]} ${t('beautyServices.from')} ${formatDate(dateTo.value + 'T23:59:59').split(' ')[0]} ${t('beautyServices.to')}`
    : t('beautyServices.allServices')

  const tableRows = data.map(s => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${s.fullName || t('beautyServices.noName')}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${s.serviceName}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(s.serviceDate)}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${s.note || '—'}</td>
    </tr>
  `).join('')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${t('beautyServices.title')}</title>
        <meta charset="utf-8">
        <style>
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #1e40af;
            margin-bottom: 10px;
          }
          .info {
            margin-bottom: 20px;
            color: #666;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #f3f4f6;
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-weight: bold;
          }
          td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .footer {
            margin-top: 20px;
            text-align: right;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>${t('beautyServices.title')}</h1>
        <div class="info">
          <p><strong>${t('beautyServices.dateRange')}:</strong> ${dateRange}</p>
          <p><strong>${t('beautyServices.totalServices')}:</strong> ${data.length} ${t('beautyServices.items')}</p>
          <p><strong>${t('beautyServices.reportDate')}:</strong> ${formatDate(new Date().toISOString())}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>${t('beautyServices.columns.name')}</th>
              <th>${t('beautyServices.columns.service')}</th>
              <th>${t('beautyServices.columns.date')}</th>
              <th>${t('beautyServices.columns.note')}</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">
          <p>Vidalita Gym & Beauty - ${new Date().toLocaleDateString(t('locale') || 'uz-UZ')}</p>
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()
  
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

const onDeleteService = async (service: any) => {
  const ok = await confirm(t('beautyServices.deleteConfirm'))
  if (!ok) return
  try {
    if (service.isPackage) {
      await beautyService.deletePackage(service.id)
    } else {
      await beautyService.delete(service.id)
    }
    toast.success(t('common.success'))
    services.value = services.value.filter(
      (s) => !(s.id === service.id && s.isPackage === service.isPackage)
    )
  } catch (err: any) {
    console.error(err)
    toast.error(err.message || t('beautyServices.deleteError'))
  }
}
</script>

<style scoped>
/* Glass & UI Base */
.glass {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

:global(.dark) .glass {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(255, 255, 255, 0.08);
}

.glass-bg {
  background: rgba(255, 255, 255, 0.3);
}

:global(.dark) .glass-bg {
  background: rgba(255, 255, 255, 0.03);
}

/* Inputs */
.input {
  width: 100%;
  border-radius: 9999px;
  border: 1px solid rgba(255,255,255,0.45);
  background: rgba(255,255,255,0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  color: #111827;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 3px rgba(0,0,0,0.08);
  outline: none;
}
.input:focus {
  outline: none;
  border-color: rgba(14, 165, 233, 0.5);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
}

/* Dark mode inputs */
:global(.dark) .input {
  background: #28282829 !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
  color: #e2e8f0;
  box-shadow: none;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
:global(.dark) .input::placeholder { color: #475569; }
:global(.dark) .input:focus {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(155, 155, 155, 0.4);
  border-radius: 20px;
}

/* Fix for Select in Dark Mode */
:global(.dark) select option {
  background-color: #1e293b;
  color: #e2e8f0;
}

/* Shake Animation for Errors */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.shake {
  animation: shake 0.3s ease-in-out;
}
</style>

