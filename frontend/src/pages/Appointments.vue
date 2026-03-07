<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ $t('appointments.title') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('appointments.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <div class="flex relative p-1.5 glass rounded-full w-fit border-white/40 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md shadow-xl">
          <!-- Animated Background Indicator -->
          <div 
            class="absolute top-1.5 bottom-1.5 rounded-full bg-white/90 dark:bg-white/15 shadow-lg"
            style="transition: left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);"
            :class="{
              'liquid-slide-right': isMoving && tabDirection === 'right',
              'liquid-slide-left': isMoving && tabDirection === 'left'
            }"
            :style="{ 
              left: viewType === 'calendar' ? '0.375rem' : 'calc(50% + 0.375rem)',
              width: 'calc(50% - 0.75rem)' 
            }"
          ></div>
          <button 
            @click="viewType = 'calendar'"
            :class="viewType === 'calendar' ? 'text-sky-600 dark:text-sky-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
            class="relative z-10 w-28 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-colors duration-300"
          >
            {{ $t('appointments.view.calendar') }}
          </button>
          <button 
            @click="viewType = 'list'"
            :class="viewType === 'list' ? 'text-sky-600 dark:text-sky-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
            class="relative z-10 w-28 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-colors duration-300"
          >
            {{ $t('appointments.view.list') }}
          </button>
        </div>
        <button class="glass-pill rounded-full border border-gray-400/30 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all shadow-sm" @click="fetchAppointments">{{ $t('common.refresh') }}</button>
        <button class="rounded-full bg-sky-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-sky-600/25 hover:bg-sky-500 transition-all" @click="openModal()">{{ $t('appointments.newAppointment') }}</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div class="glass p-5 rounded-2xl shadow-lg border-white/40 dark:border-white/10 flex flex-col justify-center">
            <div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('appointments.stats.today') }}</div>
            <div class="text-3xl font-black text-sky-600 dark:text-sky-400 mt-1">{{ appointments.filter(a => isToday(a.startTime)).length }}</div>
        </div>
        <div class="glass p-5 rounded-2xl shadow-lg border-white/40 dark:border-white/10 flex flex-col justify-center">
            <div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{{ $t('appointments.stats.pending') }}</div>
            <div class="text-3xl font-black text-amber-500 dark:text-amber-400 mt-1">{{ appointments.filter(a => a.status === 'BOOKED' || a.status === 'CONFIRMED').length }}</div>
        </div>
    </div>

    <!-- Filter paneli -->
    <div class="sticky top-0 z-20 glass rounded-full p-2 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl border-white/40 dark:border-white/10 no-print mb-6 backdrop-blur-md">
      <!-- Search -->
      <div class="w-full lg:max-w-md xl:max-w-lg relative flex items-center group">
        <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
        <input
          v-model="searchTerm"
          type="text"
          :placeholder="$t('appointments.searchPlaceholder')"
          class="w-full rounded-full h-11 pl-12 pr-4 text-sm bg-white/40 dark:bg-black/20 border-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 backdrop-blur-sm transition"
        />
      </div>

      <div class="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto">
        <!-- Date From -->
        <div class="flex items-center gap-2 px-4 h-11 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 w-full lg:w-48">
          <span class="text-[9px] font-black uppercase tracking-widest">{{ $t('appointments.dateFrom') }}</span>
          <div class="flex items-center gap-2 flex-1">
            <CalendarIcon class="h-4 w-4 pointer-events-none" />
            <input v-model="dateFrom" type="date" class="bg-transparent border-none focus:ring-0 w-full p-0 text-xs font-bold h-full text-gray-700 dark:text-gray-200 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
          </div>
        </div>

        <!-- Date To -->
        <div class="flex items-center gap-2 px-4 h-11 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 w-full lg:w-48">
          <span class="text-[9px] font-black uppercase tracking-widest">{{ $t('appointments.dateTo') }}</span>
          <div class="flex items-center gap-2 flex-1">
            <CalendarIcon class="h-4 w-4 pointer-events-none" />
            <input v-model="dateTo" type="date" class="bg-transparent border-none focus:ring-0 w-full p-0 text-xs font-bold h-full text-gray-700 dark:text-gray-200 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
          </div>
        </div>

        <div class="flex items-center gap-2 w-full lg:w-auto">
          <!-- Today Only -->
          <div class="flex h-11 items-center gap-2 rounded-full border border-gray-400/30 bg-white/20 dark:bg-white/5 px-4 group hover:border-sky-400/50 transition-colors cursor-pointer" @click="onlyToday = !onlyToday">
            <input id="todayOnlyApp" v-model="onlyToday" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500/20" @click.stop />
            <label for="todayOnlyApp" class="text-xs font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap cursor-pointer uppercase tracking-tight">{{ $t('appointments.todayOnly') }}</label>
          </div>

          <button
            @click="resetFilters"
            class="flex items-center justify-center h-11 px-6 rounded-full border border-gray-400/30 bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20 transition-all font-black text-[10px] shadow-sm uppercase tracking-widest"
          >
            {{ $t('common.reset') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar/List View -->
    <div v-if="viewType === 'calendar'" class="glass rounded-2xl p-4 shadow-xl border-white/40 dark:border-white/10 min-h-[700px] overflow-hidden no-print calendar-container backdrop-blur-md">
        <FullCalendar :options="calendarOptions" />
    </div>

    <div v-else class="glass rounded-2xl overflow-hidden shadow-xl border-white/40 dark:border-white/10 flex flex-col no-print" style="max-height: calc(100vh - 280px);">
        <LoadingSpinner v-if="loading" />
        <template v-else>
          <!-- Thead pill -->
          <div class="mx-2 mt-2 mb-1 shrink-0 glass rounded-full shadow-lg border-white/20 dark:border-white/10 overflow-hidden backdrop-blur-xl">
            <table class="table-fixed border-separate border-spacing-0 w-full">
              <thead>
                <tr class="bg-transparent">
                  <th class="py-2.5 pl-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[200px]">{{ $t('appointments.columns.customer') }}</th>
                  <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[150px]">{{ $t('common.time') }}</th>
                  <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[150px]">{{ $t('appointments.columns.staffRoom') }}</th>
                  <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[180px]">{{ $t('appointments.columns.service') }}</th>
                  <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[140px]">{{ $t('common.status') }}</th>
                  <th class="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[150px]">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
            </table>
          </div>

          <!-- Tbody scrollable -->
          <div class="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
            <table class="border-separate border-spacing-0 w-full">
              <thead class="invisible h-0">
                <tr>
                  <th class="py-2.5 pl-4 pr-3 w-[200px]"></th>
                  <th class="px-3 py-2.5 w-[150px]"></th>
                  <th class="px-3 py-2.5 w-[150px]"></th>
                  <th class="px-3 py-2.5 w-[180px]"></th>
                  <th class="px-3 py-2.5 w-[140px]"></th>
                  <th class="px-3 py-2.5 w-[150px]"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10 dark:divide-white/5">
                <tr v-for="app in filteredAppointments" :key="app.id" class="group hover:bg-white/40 dark:hover:bg-white/5 transition-colors backdrop-blur-sm">
                    <td class="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900 dark:text-gray-100 pl-4">
                        <div v-if="app.member" class="flex items-center gap-1.5">
                          {{ app.member.fullName }} 
                          <span class="text-[10px] font-black uppercase text-sky-500">{{ $t('appointments.member') }}</span>
                        </div>
                        <div v-else class="flex items-center gap-1.5 text-gray-500">
                          {{ app.guestName }} 
                          <span class="text-[10px] font-black uppercase text-gray-400">{{ $t('appointments.guest') }}</span>
                        </div>
                        <div class="text-[11px] font-semibold text-gray-400 mt-0.5">{{ app.member?.phone || app.guestPhone }}</div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-800 dark:text-gray-200">
                        <div class="font-bold">{{ new Date(app.startTime).toLocaleDateString() }}</div>
                        <div class="text-[11px] font-black text-indigo-500 uppercase tracking-tight">{{ formatTime(app.startTime) }} - {{ formatTime(app.endTime) }}</div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div class="font-bold text-gray-700 dark:text-gray-300">{{ app.staff?.fullName || '—' }}</div>
                        <div class="text-xs italic text-gray-400">{{ app.room?.name || $t('appointments.noRoom') }}</div>
                    </td>
                    <td class="px-3 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{{ app.serviceName || '—' }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <span :class="getStatusClass(app.status)" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border">
                            {{ translateStatus(app.status) }}
                        </span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-right pr-6">
                        <div class="flex justify-end items-center gap-2">
                          <select 
                              @change="updateStatus(app.id, ($event.target as HTMLSelectElement).value)"
                              class="text-[10px] font-black uppercase rounded-full border border-gray-400/30 bg-white/40 dark:bg-white/5 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all opacity-0 group-hover:opacity-100"
                              :value="app.status"
                          >
                              <option value="BOOKED">{{ $t('appointments.status.booked') }}</option>
                              <option value="CONFIRMED">{{ $t('appointments.status.confirmed') }}</option>
                              <option value="IN_PROGRESS">{{ $t('appointments.status.inProgress') }}</option>
                              <option value="COMPLETED" :disabled="app.status === 'COMPLETED' || new Date(app.startTime) > new Date()">{{ $t('appointments.status.completed') }}</option>
                              <option value="CANCELLED">{{ $t('appointments.status.cancelled') }}</option>
                              <option value="NO_SHOW">{{ $t('appointments.status.noShow') }}</option>
                          </select>
                          <button 
                              @click="deleteAppointment(app.id)" 
                              class="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                              :title="$t('common.delete')"
                          >
                            <TrashIcon class="h-4 w-4" />
                          </button>
                        </div>
                    </td>
                </tr>
                <tr v-if="filteredAppointments.length === 0">
                    <td colspan="6" class="p-12 text-center text-gray-400 dark:text-gray-500 italic">{{ $t('appointments.noAppointments') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
    </div>

    <!-- New Booking Modal -->
    <div v-if="showModal" class="fixed inset-0 z-[150] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4" @click.self="showModal = false">
        <div class="glass relative w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden z-[151] border-white/40 dark:border-white/10" @click.stop>
            <div class="px-6 py-4 flex items-center justify-between flex-shrink-0">
                <h3 class="text-xl font-black text-gray-900 dark:text-gray-100">{{ $t('appointments.newAppointment') }}</h3>
                <button @click="showModal = false" class="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 transition-all">
                    <XMarkIcon class="h-6 w-6" />
                </button>
            </div>
            
            <div class="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
                <div class="grid gap-4 sm:grid-cols-2">
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('appointments.form.memberOptional') }}</label>
                        <select v-model="form.memberId" class="mt-1 w-full rounded-full border border-gray-200 px-4 py-2 text-sm focus:ring-1 focus:ring-sky-400">
                            <option :value="null">{{ $t('appointments.form.guestOption') }}</option>
                            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.fullName }}</option>
                        </select>
                    </div>
                    <template v-if="!form.memberId">
                        <div>
                            <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('appointments.form.guestName') }}</label>
                            <input v-model="form.guestName" type="text" class="mt-1 w-full rounded-full border border-gray-200 px-4 py-2 text-sm" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('appointments.form.guestPhone') }}</label>
                            <input v-model="form.guestPhone" type="text" class="mt-1 w-full rounded-full border border-gray-200 px-4 py-2 text-sm" />
                        </div>
                    </template>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('appointments.form.startTime') }}</label>
                        <input v-model="form.startTime" type="datetime-local" class="mt-1 w-full rounded-full border border-gray-200 px-4 py-2 text-sm" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('appointments.form.endTime') }}</label>
                        <input v-model="form.endTime" type="datetime-local" class="mt-1 w-full rounded-full border border-gray-200 px-4 py-2 text-sm" />
                    </div>
                    <div>
                        <label class="block text-xs font-black text-gray-500 uppercase px-1">{{ $t('appointments.form.staff') }}</label>
                        <select v-model="form.staffId" class="mt-1 w-full rounded-full border border-gray-200 px-4 py-2 text-sm focus:ring-1 focus:ring-sky-400">
                            <option v-for="s in staff" :key="s.id" :value="s.id">{{ s.full_name }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-black text-gray-500 uppercase px-1">{{ $t('appointments.form.room') }}</label>
                        <select v-model="form.roomId" class="mt-1 w-full rounded-full border border-gray-200 px-4 py-2 text-sm focus:ring-1 focus:ring-sky-400">
                            <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
                        </select>
                    </div>
                    <div class="sm:col-span-2">
                        <div class="flex items-center justify-between mb-1">
                            <label class="block text-xs font-medium text-gray-500 uppercase">{{ $t('beautyServices.serviceNameLabel') }}</label>
                            <button v-if="form.memberId" type="button" @click="showAllServices = !showAllServices" class="text-xs text-sky-600 hover:text-sky-700 font-medium bg-sky-50 px-2 py-0.5 rounded">
                                {{ showAllServices ? "Faqat mijozning paketlarini ko'rsatish" : "Barcha xizmatlarni ko'rsatish" }}
                            </button>
                        </div>
                        <select v-model="form.serviceName" class="w-full rounded-full border border-gray-200 px-4 py-2 text-sm focus:ring-1 focus:ring-sky-400">
                            <option value="">{{ $t('beautyServices.serviceNameSelect') }}</option>
                            
                            <template v-if="form.memberId && !showAllServices">
                                <optgroup v-if="activePackages.length > 0" label="Mijozning Aktiv Paketlari" class="text-sky-600 font-bold">
                                    <option v-for="pkg in activePackages" :key="'active-'+pkg.id" :value="pkg.serviceName" class="text-black font-semibold">
                                        {{ pkg.serviceName }} ({{ pkg.remainingSessions }} ta qoldi)
                                    </option>
                                </optgroup>
                                <optgroup v-else label="Ushbu mijozda aktiv paketlar topilmadi">
                                    <option disabled :value="null">Uchrashuv belgilash uchun avval paket sotib oling yoki "Barcha xizmatlar"ni oching</option>
                                </optgroup>
                            </template>

                            <template v-if="!form.memberId || showAllServices">
                                <optgroup v-for="(cat, key) in serviceData.categories" :key="key" :label="cat.label">
                                    <option v-for="sKey in cat.services" :key="sKey" :value="serviceData.labels[sKey]">
                                        {{ serviceData.labels[sKey] }}
                                    </option>
                                </optgroup>
                            </template>
                        </select>
                    </div>
                    <div v-if="form.memberId && activePackages.length > 0" class="sm:col-span-2">
                        <label class="block text-xs font-medium text-orange-600 uppercase">{{ $t('appointments.form.usePackage') }}</label>
                        <select v-model="form.servicePackageId" class="mt-1 w-full rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm">
                            <option v-for="pkg in activePackages" :key="pkg.id" :value="pkg.id">
                                {{ pkg.serviceName }} ({{ pkg.remainingSessions }} {{ $t('beautyServices.sessionsLeft') }})
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="px-6 py-4 flex justify-end gap-3 flex-shrink-0">
                <button 
                    @click="showModal = false" 
                    class="glass-pill rounded-full border border-gray-400/30 px-6 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
                >
                    {{ $t('common.cancel') }}
                </button>
                <button 
                    @click="submitBooking" 
                    :disabled="submitting"
                    class="rounded-full bg-sky-600 px-8 py-2 text-sm font-black text-white hover:bg-sky-500 disabled:opacity-50 shadow-lg shadow-sky-600/25 transition-all"
                >
                    {{ submitting ? $t('common.loading') : $t('common.save') }}
                </button>
            </div>
        </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && selectedEvent" class="fixed inset-0 z-[150] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 overflow-y-auto">
        <div class="glass w-full max-w-md rounded-2xl p-6 shadow-2xl my-auto z-[151] border-white/40 dark:border-white/10">
            <div class="flex justify-between items-start mb-6">
                <h3 class="text-2xl font-black text-gray-900 dark:text-gray-100">{{ $t('appointments.details') }}</h3>
                <button @click="showDetailModal = false" class="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600">
                    <XMarkIcon class="h-6 w-6" />
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="flex justify-between border-b pb-2">
                    <span class="text-sm text-gray-500">{{ $t('appointments.columns.customer') }}</span>
                    <span class="text-sm font-semibold">{{ selectedEvent.member?.fullName || selectedEvent.guestName }}</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                    <span class="text-sm text-gray-500">{{ $t('common.time') }}</span>
                    <span class="text-sm font-semibold">{{ formatTime(selectedEvent.startTime) }} - {{ formatTime(selectedEvent.endTime) }}</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                    <span class="text-sm text-gray-500">{{ $t('appointments.columns.service') }}</span>
                    <span class="text-sm font-semibold">{{ selectedEvent.serviceName || '—' }}</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                    <span class="text-sm text-gray-500">{{ $t('appointments.form.staff') }}</span>
                    <span class="text-sm font-semibold">{{ selectedEvent.staff?.fullName || '—' }}</span>
                </div>
                <div v-if="selectedEvent.notes" class="border-b pb-2">
                    <span class="text-sm text-gray-500 block mb-1">{{ $t('common.notes') }}</span>
                    <p class="text-sm bg-gray-50 p-2 rounded">{{ selectedEvent.notes }}</p>
                </div>

                <div class="flex flex-col gap-3 mt-8">
                    <select 
                        @change="updateStatusAndClose(selectedEvent.id, ($event.target as HTMLSelectElement).value)"
                        class="input rounded-full h-11 text-xs font-black uppercase w-full"
                        :value="selectedEvent.status"
                    >
                        <option value="BOOKED">{{ $t('appointments.status.booked') }}</option>
                        <option value="CONFIRMED">{{ $t('appointments.status.confirmed') }}</option>
                        <option value="IN_PROGRESS">{{ $t('appointments.status.inProgress') }}</option>
                        <option value="COMPLETED" :disabled="selectedEvent.status === 'COMPLETED'">{{ $t('appointments.status.completed') }}</option>
                        <option value="CANCELLED">{{ $t('appointments.status.cancelled') }}</option>
                    </select>
                    <div class="flex items-center gap-3 w-full">
                        <button 
                            @click="showDetailModal = false" 
                            class="flex-1 rounded-full bg-gray-500/10 border border-gray-500/20 py-2.5 text-xs font-black uppercase text-gray-600 dark:text-gray-400 hover:bg-gray-500/20 transition-all shadow-sm"
                        >
                            {{ $t('common.close', 'Yopish') }}
                        </button>
                        <button 
                            @click="deleteAppointmentAndClose(selectedEvent.id)" 
                            class="flex-1 rounded-full bg-red-500/10 border border-red-500/20 py-2.5 text-xs font-black uppercase text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all shadow-sm"
                        >
                            {{ $t('common.delete') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { appointmentsService, membersService, beautyService, cashSessionsService } from '../services/supabaseService';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import * as XLSX from 'xlsx';
import { useI18n } from 'vue-i18n';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { TrashIcon, XMarkIcon, MagnifyingGlassIcon, CalendarIcon } from '@heroicons/vue/24/outline';

const { t } = useI18n();
const toast = useToast();
const { confirm } = useConfirm();

const appointments = ref<any[]>([]);
const staff = ref<any[]>([]);
const rooms = ref<any[]>([]);
const members = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const showDetailModal = ref(false);
const showAllServices = ref(false);
const selectedEvent = ref<any>(null);
const viewType = ref<'calendar' | 'list'>('calendar');
const tabDirection = ref('');
const isMoving = ref(false);
let moveTimeout: any = null;

watch(viewType, (newVal, oldVal) => {
  const tabs = ['calendar', 'list'];
  const oldIdx = tabs.indexOf(oldVal);
  const newIdx = tabs.indexOf(newVal);
  
  if (newIdx > oldIdx) {
    tabDirection.value = 'right';
  } else {
    tabDirection.value = 'left';
  }
  
  isMoving.value = true;
  if (moveTimeout) clearTimeout(moveTimeout);
  moveTimeout = setTimeout(() => {
    isMoving.value = false;
  }, 450);
});

const activePackages = ref<any[]>([]);
const currentSession = ref<any>(null);
const serviceData = ref<any>({ categories: {}, labels: {} });
const serviceTypes = ref<any[]>([]);

// Filter state
const dateFrom = ref('');
const dateTo = ref('');
const searchTerm = ref('');
const onlyToday = ref(false);

const form = ref({
    memberId: null,
    guestName: '',
    guestPhone: '',
    serviceName: '',
    staffId: null,
    roomId: null,
    startTime: '',
    endTime: '',
    price: 0,
    notes: '',
    servicePackageId: null as number | null
});

watch(() => form.value.memberId, async (newId) => {
    if (newId) {
        activePackages.value = await beautyService.getMemberPackages(newId);
        // Try to auto-select package if service is already selected
        if (form.value.serviceName) {
            const matchingPkg = activePackages.value.find(p => p.serviceName === form.value.serviceName);
            if (matchingPkg) form.value.servicePackageId = matchingPkg.id;
        }
    } else {
        activePackages.value = [];
        form.value.servicePackageId = null;
    }
    showAllServices.value = false;
});

watch(() => form.value.serviceName, (newName) => {
    if (newName && form.value.memberId) {
        const matchingPkg = activePackages.value.find(p => p.serviceName === newName);
        if (matchingPkg) {
            form.value.servicePackageId = matchingPkg.id;
        } else {
            form.value.servicePackageId = null;
        }
    }
});

const fetchAppointments = async () => {
    loading.value = true;
    try {
        appointments.value = await appointmentsService.getAll();
        staff.value = await appointmentsService.getStaff();
        rooms.value = await appointmentsService.getRooms();
        members.value = await membersService.getAll();
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    fetchAppointments();
    try {
        currentSession.value = await cashSessionsService.getCurrentSession();
        const data = await beautyService.getServiceTypes();
        serviceData.value = data;
        serviceTypes.value = data.types;
    } catch (err) {
        console.error('Initial data load error:', err);
    }
});

const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isToday = (iso: string) => {
    return new Date(iso).toDateString() === new Date().toDateString();
};

const getStatusClass = (status: string) => {
    switch (status) {
        case 'BOOKED': return 'bg-sky-100 text-sky-700';
        case 'CONFIRMED': return 'bg-indigo-100 text-indigo-700';
        case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
        case 'COMPLETED': return 'bg-green-100 text-green-700';
        case 'CANCELLED': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getStatusIconClass = (status: string) => {
    switch (status) {
        case 'COMPLETED': return 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]';
        case 'CONFIRMED': return 'bg-indigo-300';
        case 'IN_PROGRESS': return 'bg-amber-300 animate-pulse';
        case 'CANCELLED': return 'bg-red-300';
        default: return 'bg-sky-300';
    }
};

const translateStatus = (status: string) => {
    switch (status) {
        case 'BOOKED': return t('appointments.status.booked');
        case 'CONFIRMED': return t('appointments.status.confirmed');
        case 'IN_PROGRESS': return t('appointments.status.inProgress');
        case 'COMPLETED': return t('appointments.status.completed');
        case 'CANCELLED': return t('appointments.status.cancelled');
        case 'NO_SHOW': return t('appointments.status.noShow');
        default: return status;
    }
};

const updateStatus = async (id: string, newStatus: string) => {
    try {
        if (newStatus === 'COMPLETED') {
            const app = appointments.value.find(a => a.id === id);
            if (app && new Date(app.startTime) > new Date()) {
                toast.error(t('common.error') + ": Siz hali kelajakdagi uchrashuvni yakunlayolmaysiz!");
                await fetchAppointments(); // reset select
                return;
            }
            if (app && app.servicePackageId) {
                const confirmed = await confirm(t('appointments.confirmComplete') + "?");
                if (confirmed) {
                    await appointmentsService.completeAppointment(id, app.servicePackageId);
                    toast.success(t('appointments.status.completed'));
                } else {
                    await fetchAppointments(); // reset select
                    return;
                }
            } else {
                await appointmentsService.updateStatus(id, newStatus);
                toast.success(t('common.success'));
            }
        } else {
            await appointmentsService.updateStatus(id, newStatus);
            toast.success(t('common.success'));
        }
        await fetchAppointments();
    } catch (err: any) {
        toast.error(err.message || t('common.error'));
    }
};

const deleteAppointment = async (id: string) => {
    const confirmed = await confirm(t('common.deleteConfirm'));
    if (!confirmed) return;
    try {
        await appointmentsService.deleteAppointment(id);
        toast.success(t('common.success'));
        await fetchAppointments();
    } catch (err: any) {
        toast.error(err.message || t('common.error'));
    }
};

const updateStatusAndClose = async (id: string, newStatus: string) => {
    await updateStatus(id, newStatus);
    showDetailModal.value = false;
};

const deleteAppointmentAndClose = async (id: string) => {
    await deleteAppointment(id);
    showDetailModal.value = false;
};

// Filtered appointments with date range
const filteredAppointments = computed(() => {
    const search = searchTerm.value.trim().toLowerCase();
    return appointments.value.filter((app) => {
        // Search filter
        const matchesSearch =
            !search ||
            (app.member?.fullName && app.member.fullName.toLowerCase().includes(search)) ||
            (app.guestName && app.guestName.toLowerCase().includes(search)) ||
            (app.serviceName && app.serviceName.toLowerCase().includes(search)) ||
            (app.member?.phone && app.member.phone.includes(search)) ||
            (app.guestPhone && app.guestPhone.includes(search));

        // Date filter
        let matchesDate = true;
        const appDate = new Date(app.startTime).toISOString().slice(0, 10);

        if (onlyToday.value) {
            const today = new Date().toISOString().slice(0, 10);
            matchesDate = appDate === today;
        } else if (dateFrom.value || dateTo.value) {
            if (dateFrom.value && dateTo.value) {
                matchesDate = appDate >= dateFrom.value && appDate <= dateTo.value;
            } else if (dateFrom.value) {
                matchesDate = appDate >= dateFrom.value;
            } else if (dateTo.value) {
                matchesDate = appDate <= dateTo.value;
            }
        }

        return matchesSearch && matchesDate;
    });
});

const resetFilters = () => {
    dateFrom.value = '';
    dateTo.value = '';
    searchTerm.value = '';
    onlyToday.value = false;
};

// datetime-local stringni Toshkent vaqt mintaqasi bilan ISO formatiga o'tkazish
// Masalan: "2026-03-04T01:30" -> "2026-03-04T01:30:00+05:00"
const localToISO = (datetimeLocal: string): string => {
    if (!datetimeLocal) return '';
    // Agar allaqachon timezone mavjud bo'lsa (+ yoki Z), o'zgartirmaymiz
    if (datetimeLocal.includes('+') || datetimeLocal.includes('Z')) {
        return datetimeLocal;
    }
    return datetimeLocal + ':00+05:00';
};

const submitBooking = async () => {
    if (form.value.servicePackageId) {
        const pkg = activePackages.value.find(p => p.id === form.value.servicePackageId);
        if (pkg && pkg.remainingSessions <= 0) {
            toast.warning(t('beautyServices.errorNoSessions'));
            return;
        }
    }
    if (!form.value.staffId) {
        toast.warning(t('appointments.form.staff') + ' ni tanlash majburiy');
        return;
    }
    if (!form.value.roomId) {
        toast.warning(t('appointments.form.room') + ' ni tanlash majburiy');
        return;
    }

    const startISO = localToISO(form.value.startTime);
    const endISO = localToISO(form.value.endTime);
    
    // Bandlikni tekshirish (faqat bekor qilinmagan va yakunlanmagan uchrashuvlar uchun)
    const hasOverlap = appointments.value.some(app => {
        if (app.status === 'CANCELLED' || app.status === 'COMPLETED' || app.status === 'NO_SHOW') return false;
        if (app.id === selectedEvent.value?.id) return false; // tahrirlashda o'zini o'tkazib yuborish (agar update qo'shilsa)
        
        // Agar tanlangan xodim yoki xona bir xil bo'lsa, vaqt kesishishini tekshiramiz
        const isSameStaff = Number(app.staffId) === Number(form.value.staffId);
        const isSameRoom = Number(app.roomId) === Number(form.value.roomId);
        
        if (isSameStaff || isSameRoom) {
            const appStart = new Date(app.startTime).getTime();
            const appEnd = new Date(app.endTime).getTime();
            const newStart = new Date(startISO).getTime();
            const newEnd = new Date(endISO).getTime();
            
            // Vaqt kesishish mantig'i:
            // Yangi uchrashuvning boshlanishi eskisi tugashidan oldin VA yangisini tugash vaqti eskisini boshlanishidan keyin bo'lishi
            return (newStart < appEnd && newEnd > appStart);
        }
        return false;
    });

    if (hasOverlap) {
        toast.warning('Tanlangan vaqtda bu xodim ko\'rsatilgan xonada yoki xona boshqa xodim bilan band!');
        return;
    }
    
    submitting.value = true;
    try {
        const payload = { 
            ...form.value,
            startTime: localToISO(form.value.startTime),
            endTime: localToISO(form.value.endTime),
            cashSessionId: currentSession.value?.id || null
        };
        await appointmentsService.create(payload);
        showModal.value = false;
        await fetchAppointments();
        form.value = { memberId: null, guestName: '', guestPhone: '', serviceName: '', staffId: null, roomId: null, startTime: '', endTime: '', price: 0, notes: '', servicePackageId: null };
        toast.success(t('common.success'));
    } catch (err: any) {
        toast.error(err.message || t('common.error'));
    } finally {
        submitting.value = false;
    }
};

const openModal = (start?: string, end?: string) => {
    // start string is like 2026-02-19 from fullcalendar if time isn't selected
    if (start && start.length === 10) start += 'T09:00';
    if (end && end.length === 10) end += 'T10:00';
    
    form.value.startTime = start || '';
    form.value.endTime = end || '';
    showModal.value = true;
};

const calendarOptions = computed(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridDay,timeGridWeek,dayGridMonth'
    },
    buttonText: {
        today: t('appointments.today') || 'Bugun',
        month: t('appointments.view.month') || 'Oy',
        week: t('appointments.view.week') || 'Hafta',
        day: t('appointments.view.day') || 'Kun'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    timeZone: 'local',
    dayMaxEvents: true,
    weekends: true,
    nowIndicator: true,
    displayEventTime: true,
    nextDayThreshold: '09:00:00',
    eventTimeFormat: {
        hour: '2-digit' as '2-digit',
        minute: '2-digit' as '2-digit',
        meridiem: false,
        hour12: false
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '22:00:00',
    slotEventOverlap: true,
    eventOverlap: true,
    height: 'auto',
    contentHeight: 'auto',
    handleWindowResize: true,
    eventClassNames: 'rounded shadow-sm cursor-pointer',
    events: appointments.value.map(app => ({
        id: app.id,
        title: (app.member?.fullName || app.guestName) + ' - ' + (app.serviceName || ''),
        start: app.startTime,
        end: app.endTime,
        allDay: false,
        backgroundColor: getEventColor(app.status),
        borderColor: getEventColor(app.status),
        extendedProps: app
    })),
    select: (info: any) => {
        openModal(info.startStr.slice(0, 16), info.endStr.slice(0, 16));
    },
    eventClick: (info: any) => {
        selectedEvent.value = info.event.extendedProps;
        showDetailModal.value = true;
    },
    eventDrop: async (info: any) => {
        try {
            const startISO = localToISO(info.event.startStr.slice(0, 16));
            const endISO = localToISO(info.event.endStr?.slice(0, 16) || info.event.startStr.slice(0, 16));
            
            // Vaqt kesishishini tekshirish (drag-and-drop uchun)
            const draggedApp = info.event.extendedProps;
            const hasOverlap = appointments.value.some(app => {
                if (app.status === 'CANCELLED' || app.status === 'COMPLETED' || app.status === 'NO_SHOW') return false;
                if (app.id === draggedApp.id) return false; // O'zini tekshirmaymiz
                
                // Agar xodim yoki xona bir xil bo'lsa, vaqtni tekshiramiz
                const isSameStaff = app.staffId && draggedApp.staffId && Number(app.staffId) === Number(draggedApp.staffId);
                const isSameRoom = app.roomId && draggedApp.roomId && Number(app.roomId) === Number(draggedApp.roomId);
                
                if (isSameStaff || isSameRoom) {
                    const appStart = new Date(app.startTime).getTime();
                    const appEnd = new Date(app.endTime).getTime();
                    const newStart = new Date(startISO).getTime();
                    const newEnd = new Date(endISO).getTime();
                    
                    return (newStart < appEnd && newEnd > appStart);
                }
                return false;
            });

            if (hasOverlap) {
                toast.warning('Tanlangan vaqtda bu xodim ko\'rsatilgan xonada yoki xona boshqa xodim bilan band!');
                info.revert();
                return;
            }

            // check passed
            await appointmentsService.updateTime(
                info.event.id, 
                startISO,
                endISO
            );
            toast.success(t('common.success'));
            await fetchAppointments();
        } catch (err: any) {
            toast.error(err.message || t('common.error'));
            info.revert();
        }
    }
}));

const getEventColor = (status: string) => {
    switch (status) {
        case 'COMPLETED': return '#10b981';
        case 'CANCELLED': return '#ef4444';
        case 'CONFIRMED': return '#6366f1';
        case 'IN_PROGRESS': return '#f59e0b';
        default: return '#0ea5e9';
    }
};

const exportToExcel = () => {
    if (appointments.value.length === 0) return;
    const excelData = appointments.value.map(app => ({
        [t('appointments.columns.customer')]: app.member?.fullName || app.guestName,
        [t('common.phone')]: app.member?.phone || app.guestPhone,
        [t('appointments.form.startTime')]: new Date(app.startTime).toLocaleString(),
        [t('appointments.form.endTime')]: new Date(app.endTime).toLocaleString(),
        [t('appointments.form.staff')]: app.staff?.fullName || '',
        [t('appointments.form.room')]: app.room?.name || '',
        [t('appointments.columns.service')]: app.serviceName || '',
        [t('common.status')]: translateStatus(app.status)
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, t('appointments.title'));
    XLSX.writeFile(wb, `appointments_${new Date().toISOString().slice(0,10)}.xlsx`);
};
</script>

<style>
/* FullCalendar Sharp Overrides - Liquid Glass */
.fc {
    --fc-border-color: rgba(0, 0, 0, 0.15); /* Darker borders for clarity */
    --fc-today-bg-color: rgba(14, 165, 233, 0.05); /* very soft sky bg */
    font-family: inherit;
    border: none !important;
}
.dark .fc {
    --fc-border-color: rgba(255, 255, 255, 0.2); 
}

/* Header Title (e.g. "February 16-22, 2026") */
.fc .fc-toolbar-title {
    font-size: 1.15rem !important;
    font-weight: 900 !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--app-text) !important;
}

/* Toolbar Buttons */
.fc .fc-button {
    background: rgba(255, 255, 255, 0.3) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: var(--app-text) !important;
    font-size: 0.65rem !important;
    font-weight: 900 !important;
    border-radius: 9999px !important; /* Full pill */
    padding: 8px 18px !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05) !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.2s ease !important;
}
.dark .fc .fc-button {
    background: rgba(0, 0, 0, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.05) !important;
}

/* Toolbar Button Active State */
.fc .fc-button-active, .fc .fc-button:active {
    background: #0ea5e9 !important; /* sky-500 */
    color: #ffffff !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3) !important;
}

/* Remove weird margins in button groups */
.fc .fc-button-group > .fc-button {
    margin-right: -1px; /* collapse border */
}
.fc .fc-button-group > .fc-button:not(:first-child):not(:last-child) {
    border-radius: 0 !important;
}
.fc .fc-button-group > .fc-button:first-child {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}
.fc .fc-button-group > .fc-button:last-child {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
}

/* Table Headers (Days of the week) */
.fc th {
    font-size: 0.65rem !important;
    font-weight: 900 !important;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--app-text-muted) !important;
    padding: 16px 0 !important;
    background: transparent !important;
    border: 1px solid var(--fc-border-color) !important;
}

/* Main Grid Lines */
.fc td, .fc th {
    border-color: var(--fc-border-color) !important;
}

/* Remove outer borders */
.fc-theme-standard .fc-scrollgrid {
    border: none !important;
}

/* Month View Day Number */
.fc .fc-daygrid-day-number {
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--app-text);
    padding: 8px 12px;
}

/* Event Styles - Beautiful bubbles */
.fc-event {
    border-radius: 6px !important;
    border: none !important;
    transition: transform 0.15s ease, box-shadow 0.15s ease !important;
}
.fc-event:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2) inset !important;
    z-index: 10 !important;
}

/* Month view events */
.fc-daygrid-event {
    margin: 2px 4px !important;
}

/* Time/Week view events */
.fc-v-event {
    margin: 1px 2px !important;
}

/* Event Content Text */
.fc-event-main {
    padding: 4px 6px !important;
    font-size: 0.7rem !important;
    font-weight: 800 !important;
    line-height: 1.2 !important;
    backdrop-filter: blur(4px);
}

/* Time Slots */
.fc .fc-timegrid-slot {
    height: 32px !important; /* Much more compact */
}
.fc .fc-timegrid-slot-minor {
    border-top-style: dotted !important;
    border-color: var(--fc-border-color) !important;
}

/* Current Time Indicator */
.fc .fc-timegrid-now-indicator-line {
    border-color: #ef4444 !important; /* red-500 */
    border-width: 2px !important;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.5) !important;
}
.fc .fc-timegrid-now-indicator-arrow {
    border-color: #ef4444 !important;
    border-width: 6px !important;
}

/* Axis Labels (e.g. "8am") */
.fc .fc-timegrid-axis-cushion {
    font-size: 0.65rem !important;
    font-weight: 800 !important;
    text-transform: uppercase;
    color: var(--app-text-muted) !important;
    padding-right: 12px !important;
}
</style>
