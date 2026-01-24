<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('checkins.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('checkins.subtitle') }}</p>
        <p class="text-xs text-gray-400 mt-1">🕐 {{ $t('checkins.currentTime') }}: {{ currentTimeFormatted }}</p>
      </div>
      <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50" @click="fetchCheckins">{{ $t('common.refresh') }}</button>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
    <div v-if="successMessage" class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{{ successMessage }}</div>

    <!-- Member Info Modal -->
    <Teleport to="body">
      <div v-if="showMemberModal" class="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4" @click.self="closeMemberModal">
        <!-- Backdrop with blur -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        <!-- Modal content -->
        <div class="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl" @click.stop>
        <div class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <h3 class="text-lg sm:text-xl font-bold text-gray-900">{{ $t('checkins.memberInfo') }}</h3>
          <button @click="closeMemberModal" class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg class="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="memberModalLoading" class="px-4 sm:px-6 py-12 text-center text-gray-500">{{ $t('common.loading') }}</div>
        <div v-else-if="memberModalError" class="px-4 sm:px-6 py-12 text-center text-red-600">{{ memberModalError }}</div>
        <div v-else-if="scannedMember" class="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <!-- Asosiy ma'lumotlar -->
          <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
              <h4 class="text-base sm:text-lg font-semibold text-gray-900">{{ $t('memberDetail.basicInfo') }}</h4>
            </div>
            <div class="px-4 sm:px-6 py-4 sm:py-6">
              <div class="grid gap-4 sm:gap-6 md:grid-cols-2">
                <!-- Surat -->
                <div class="flex justify-center">
                  <div v-if="scannedMember.photo" class="relative">
                    <img :src="scannedMember.photo" :alt="scannedMember.fullName" class="h-48 w-48 sm:h-64 sm:w-64 rounded-lg object-cover border-2 border-gray-200" />
                  </div>
                  <div v-else class="flex h-48 w-48 sm:h-64 sm:w-64 items-center justify-center rounded-lg bg-gray-100 border-2 border-gray-200">
                    <svg class="h-24 w-24 sm:h-32 sm:w-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <!-- Ma'lumotlar -->
                <div class="space-y-4">
                  <div>
                    <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.fullName') }}</label>
                    <p class="mt-1 text-lg font-semibold text-gray-900">{{ scannedMember.fullName }}</p>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.phone') }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ scannedMember.phone || '—' }}</p>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.id') }}</label>
                    <p class="mt-1 text-sm font-mono text-gray-900">{{ scannedMember.qrCodeId }}</p>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.joinDate') }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ formatDate(scannedMember.joinDate) }}</p>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.status') }}</label>
                    <p class="mt-1">
                      <span :class="scannedMember.gymActive === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                        {{ scannedMember.gymActive === 1 ? $t('common.active') : $t('common.inactive') }}
                      </span>
                    </p>
                  </div>
                  <div v-if="scannedMember.gymStart">
                    <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.gymStart') }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ formatDate(scannedMember.gymStart) }}</p>
                  </div>
                  <div v-if="scannedMember.gymEnd">
                    <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.gymEnd') }}</label>
                    <p class="mt-1 text-sm text-gray-900">
                      {{ formatDate(scannedMember.gymEnd) }}
                      <span v-if="scannedGymInfo?.membershipType" class="ml-2 text-xs text-gray-500">
                        ({{ getMembershipTypeLabel(scannedGymInfo.membershipType) }})
                      </span>
                    </p>
                    <p v-if="isExpired(scannedMember.gymEnd)" class="mt-1 text-xs font-semibold text-red-600">
                      ⚠️ {{ $t('checkins.membershipExpired') }}
                    </p>
                    <p v-else-if="isExpiringSoon(scannedMember.gymEnd)" class="mt-1 text-xs font-semibold text-yellow-600">
                      ⚠️ {{ $t('checkins.membershipExpiringSoon') }}
                    </p>
                    <p v-if="!isExpired(scannedMember.gymEnd)" class="mt-1 text-sm font-semibold" :class="getDaysRemainingClass(scannedMember.gymEnd)">
                      {{ getDaysRemainingText(scannedMember.gymEnd) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Gym ma'lumotlari (To'lov va a'zolik) -->
          <section v-if="scannedGymInfo" class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
              <h4 class="text-base sm:text-lg font-semibold text-gray-900">{{ $t('memberCreate.gymInfo') }}</h4>
            </div>
            <div class="px-4 sm:px-6 py-4 sm:py-6">
              <div class="grid gap-4 md:grid-cols-2">
                <div v-if="scannedGymInfo.emergencyName">
                  <label class="text-xs font-medium text-gray-500">{{ $t('memberCreate.emergencyName') }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ scannedGymInfo.emergencyName }}</p>
                </div>
                <div v-if="scannedGymInfo.emergencyPhone">
                  <label class="text-xs font-medium text-gray-500">{{ $t('memberCreate.emergencyPhone') }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ scannedGymInfo.emergencyPhone }}</p>
                </div>
                <div v-if="scannedGymInfo.emergencyRelation">
                  <label class="text-xs font-medium text-gray-500">{{ $t('memberCreate.emergencyRelation') }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ scannedGymInfo.emergencyRelation }}</p>
                </div>
                <div v-if="scannedGymInfo.membershipType">
                  <label class="text-xs font-medium text-gray-500">{{ $t('memberCreate.membershipType') }}</label>
                  <p class="mt-1 text-sm text-gray-900">
                    <span v-if="scannedGymInfo.membershipType === 'monthly'">{{ $t('memberCreate.membershipMonthly') }}</span>
                    <span v-else-if="scannedGymInfo.membershipType === 'quarterly'">{{ $t('memberCreate.membershipQuarterly') }}</span>
                    <span v-else-if="scannedGymInfo.membershipType === 'yearly'">{{ $t('memberCreate.membershipYearly') }}</span>
                    <span v-else-if="scannedGymInfo.membershipType === 'other'">{{ scannedGymInfo.membershipTypeOther || $t('memberDetail.other') }}</span>
                    <span v-else>{{ scannedGymInfo.membershipType }}</span>
                  </p>
                </div>
                <div v-if="scannedGymInfo.paymentMethod">
                  <label class="text-xs font-medium text-gray-500">{{ $t('memberCreate.paymentMethod') }}</label>
                  <p class="mt-1 text-sm text-gray-900">
                    <span v-if="scannedGymInfo.paymentMethod === 'cash'">{{ $t('memberCreate.paymentCash') }}</span>
                    <span v-else-if="scannedGymInfo.paymentMethod === 'card'">{{ $t('memberCreate.paymentCard') }}</span>
                    <span v-else-if="scannedGymInfo.paymentMethod === 'other'">{{ scannedGymInfo.paymentMethodOther || $t('memberDetail.other') }}</span>
                    <span v-else>{{ scannedGymInfo.paymentMethod }}</span>
                  </p>
                </div>
                <div v-if="scannedGymInfo.medicalConditions" class="md:col-span-2">
                  <label class="text-xs font-medium text-gray-500">{{ $t('memberCreate.medicalConditions') }}</label>
                  <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ scannedGymInfo.medicalConditions }}</p>
                </div>
                <div v-if="scannedGymInfo.medications" class="md:col-span-2">
                  <label class="text-xs font-medium text-gray-500">{{ $t('memberCreate.medications') }}</label>
                  <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ scannedGymInfo.medications }}</p>
                </div>
                <div v-if="scannedGymInfo.fitnessGoals" class="md:col-span-2">
                  <label class="text-xs font-medium text-gray-500">{{ $t('memberCreate.fitnessGoals') }}</label>
                  <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ scannedGymInfo.fitnessGoals }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Sog'liq ma'lumotlari -->
          <section v-if="scannedBeautyHealth" class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
              <h4 class="text-base sm:text-lg font-semibold text-gray-900">{{ $t('memberDetail.healthInfo') }}</h4>
            </div>
            <div class="px-4 sm:px-6 py-4 sm:py-6">
              <div class="overflow-x-auto rounded-xl border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">{{ $t('memberCreate.healthCondition') }}</th>
                      <th class="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold text-gray-900">{{ $t('common.status') }}</th>
                      <th class="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">{{ $t('memberCreate.details') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="question in beautyQuestions" :key="question.key" class="align-top">
                      <td class="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-700">{{ question.label }}</td>
                      <td class="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">
                        <span v-if="scannedBeautyHealth[question.key] === 'yes'" class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          {{ $t('common.yes') }}
                        </span>
                        <span v-else-if="scannedBeautyHealth[question.key] === 'no'" class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                          {{ $t('common.no') }}
                        </span>
                        <span v-else class="text-gray-400">—</span>
                      </td>
                      <td class="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-500">
                        <template v-if="question.detailKey && scannedBeautyHealth[question.detailKey]">
                          {{ scannedBeautyHealth[question.detailKey] }}
                        </template>
                        <template v-else-if="question.extraDateKey && scannedBeautyHealth[question.extraDateKey]">
                          <div class="text-xs">
                            {{ $t('common.date') }}: {{ formatDate(scannedBeautyHealth[question.extraDateKey]) }}
                          </div>
                          <div v-if="question.detailKey && scannedBeautyHealth[question.detailKey]" class="mt-1">
                            {{ scannedBeautyHealth[question.detailKey] }}
                          </div>
                        </template>
                        <template v-else>
                          <span>—</span>
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="scannedBeautyHealth.medications" class="mt-6">
                <label class="text-xs font-medium text-gray-500">{{ $t('memberCreate.medications') }}</label>
                <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ scannedBeautyHealth.medications }}</p>
              </div>
            </div>
          </section>

          <!-- Kirishlar tarixi -->
          <section v-if="scannedCheckins && scannedCheckins.length > 0" class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
              <h4 class="text-base sm:text-lg font-semibold text-gray-900">{{ $t('memberDetail.checkinHistory') }}</h4>
              <p class="text-xs sm:text-sm text-gray-500">{{ $t('memberDetail.checkinTotal') }}: {{ scannedCheckins.length }} {{ $t('memberDetail.checkins') }}</p>
            </div>
            <div class="px-4 sm:px-6 py-4 sm:py-6">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">{{ $t('checkins.columns.dateTime') }}</th>
                      <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('checkins.columns.verifiedBy') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="checkin in scannedCheckins.slice(0, 10)" :key="checkin.id" class="hover:bg-gray-50">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">{{ formatDateTime(checkin.date) }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ checkin.verifiedBy || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- Go'zallik xizmatlari -->
          <section v-if="scannedBeautyServices && scannedBeautyServices.length > 0" class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
              <h4 class="text-base sm:text-lg font-semibold text-gray-900">{{ $t('memberDetail.beautyServices') }}</h4>
              <p class="text-xs sm:text-sm text-gray-500">{{ $t('memberDetail.beautyTotal') }}: {{ scannedBeautyServices.length }} {{ $t('memberDetail.services') }}</p>
            </div>
            <div class="px-4 sm:px-6 py-4 sm:py-6">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">{{ $t('memberDetail.serviceName') }}</th>
                      <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('memberDetail.serviceDate') }}</th>
                      <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('memberDetail.note') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="service in scannedBeautyServices.slice(0, 10)" :key="service.id" class="hover:bg-gray-50">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{{ service.serviceName }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDate(service.serviceDate) }}</td>
                      <td class="px-3 py-4 text-sm text-gray-500">{{ service.note || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
        </div>
      </div>
    </Teleport>

    <!-- Barcode Scanner Input -->
    <div class="rounded-lg border border-sky-200 bg-sky-50 p-4">
      <div class="mb-3">
        <h3 class="text-sm font-semibold text-gray-900">{{ $t('checkins.barcodeTitle') }}</h3>
        <p class="text-xs text-gray-500">{{ $t('checkins.barcodeSubtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <input
          ref="barcodeInputRef"
          v-model="barcodeInput"
          type="text"
          :placeholder="$t('checkins.barcodePlaceholder')"
          class="flex-1 rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-mono uppercase focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          @keyup.enter="handleBarcodeScan"
          @input="handleInputChange"
          @paste="handlePaste"
          @keydown="handleKeyDown"
          autofocus
        />
        <button
          @click="handleBarcodeScan"
          :disabled="!barcodeInput.trim() || barcodeInput.length < 3 || scanning"
          class="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ scanning ? $t('checkins.checking') : $t('checkins.enter') }}
        </button>
      </div>
    </div>

    <!-- Filter paneli -->
    <div class="sticky top-0 z-20 grid gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4">
      <div class="flex min-w-0 flex-col">
        <label class="mb-1 text-xs text-gray-500">{{ $t('checkins.dateFrom') }}</label>
        <input v-model="dateFrom" type="date" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400" />
      </div>
      <div class="flex min-w-0 flex-col">
        <label class="mb-1 text-xs text-gray-500">{{ $t('checkins.dateTo') }}</label>
        <input v-model="dateTo" type="date" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400" />
      </div>
      <div class="flex min-w-0 flex-col">
        <label class="mb-1 text-xs text-gray-500">{{ $t('common.search') }}</label>
        <input v-model="searchTerm" type="text" :placeholder="$t('checkins.searchPlaceholder')" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400" />
      </div>
      <div class="flex min-w-0 w-full items-end gap-1 overflow-hidden">
        <div class="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2">
        <input id="todayOnly" v-model="onlyToday" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
          <label for="todayOnly" class="text-xs text-gray-600 whitespace-nowrap">{{ $t('checkins.todayOnly') }}</label>
        </div>
        <button
          @click="exportToExcel"
          class="flex flex-shrink-0 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 hover:bg-gray-50 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          :title="$t('checkins.exportExcel')"
        >
          <TableCellsIcon class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">{{ $t('checkins.exportExcel') }}</span>
        </button>
        <button
          @click="exportToPDF"
          class="flex flex-shrink-0 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 hover:bg-gray-50 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          :title="$t('checkins.exportPDF')"
        >
          <DocumentTextIcon class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">{{ $t('checkins.exportPDF') }}</span>
        </button>
        <button
          @click="resetFilters"
          class="flex-shrink-0 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 hover:bg-gray-50 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          {{ $t('checkins.resetFilters') }}
        </button>
      </div>
    </div>

    <!-- Table section (scrollable) -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" style="max-height: calc(100vh - 420px);">
      <div v-if="loading" class="px-4 py-6 text-center text-sm text-gray-500">{{ $t('common.loading') }}</div>
      <div v-else class="overflow-x-auto" style="max-height: calc(100vh - 420px);">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="sticky top-0 z-10 bg-gray-50">
            <tr>
              <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('checkins.columns.name') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('checkins.columns.id') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('checkins.columns.dateTime') }}</th>
              <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('checkins.columns.verifiedBy') }}</th>
              <th class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 bg-gray-50">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="item in filteredCheckins" :key="item.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{{ item.fullName || $t('checkins.noName') }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ item.qrCodeId }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDateTime(item.date) }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ item.verifiedBy || '—' }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-right">
                <div class="flex justify-end gap-2">
                  <button
                    class="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    @click="onDeleteCheckin(item.id)"
                    :title="$t('checkins.deleteHistory')"
                  >
                    {{ $t('common.delete') }}
                  </button>
                  <button
                    class="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                    @click="onDeleteMember(item.memberId)"
                    :title="$t('checkins.deleteMember')"
                  >
                    {{ $t('checkins.deleteMember') }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredCheckins.length === 0">
              <td colspan="5" class="px-6 py-6 text-center text-sm text-gray-500">{{ $t('checkins.noResults') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'
import * as XLSX from 'xlsx'
import { TableCellsIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import { formatDate, formatDateTime, getCurrentDateTime } from '../lib/dateUtils'

const { t } = useI18n()

type Checkin = {
  id: number
  memberId: number
  qrCodeId: string
  date: string
  fullName?: string
  verifiedBy?: string
}

const checkins = ref<Checkin[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const selectedDate = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const searchTerm = ref('')
const onlyToday = ref(false)
const barcodeInput = ref('')
const barcodeInputRef = ref<HTMLInputElement | null>(null)
const scanning = ref(false)
let autoCheckTimeout: ReturnType<typeof setTimeout> | null = null

// Modal state
const showMemberModal = ref(false)
const scannedMember = ref<any>(null)
const scannedGymInfo = ref<any>(null)
const scannedBeautyHealth = ref<any>(null)
const scannedCheckins = ref<any[]>([])
const scannedBeautyServices = ref<any[]>([])
const memberModalLoading = ref(false)
const memberModalError = ref<string | null>(null)
const currentTime = ref(new Date()) // Vaqtni yangilash uchun

// Hozirgi vaqtni formatlash (real vaqt)
const currentTimeFormatted = computed(() => {
  return getCurrentDateTime()
})

// Beauty questions for health info
const beautyQuestions = [
  { key: 'bloodPressure', label: 'Qon bosimi / Yurak kasalligi' },
  { key: 'diabetes', label: 'Qandli diabet' },
  { key: 'cancer', label: 'Saraton yoki onkologik kasallik', detailKey: 'cancerDetails' },
  { key: 'cancerTreatment', label: "Siz saraton kasalligini davolaganmisiz?", detailKey: 'cancerTreatmentDetails' },
  { key: 'hormonal', label: 'Gormonal buzilish' },
  { key: 'thyroid', label: 'Qalqonsimon bez kasalligi' },
  { key: 'skin', label: 'Teri kasalliklari (ekzema, psoriaz va boshqalar)', detailKey: 'skinDetails' },
  { key: 'alcohol', label: "Spirtli ichimlik iste'moli" },
  { key: 'prosthesis', label: 'Sizning tanangizda protez bormi ?' },
  { key: 'platinum', label: 'Sizning tanangizda platina bormi ?' },
  { key: 'implants', label: 'Tishlaringizda implantlar bormi ?' },
  { key: 'crowns', label: 'Tishlaringizda toj yoki protez bormi ?' },
  { key: 'surgery', label: "Siz operatsiya amaliyotini o'tkazgansizmi?", detailKey: 'surgeryDetails', extraDateKey: 'surgeryDate' },
  { key: 'smoking', label: 'Chekish odati' }
]

const fetchCheckins = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get<Checkin[]>('/checkins')
    checkins.value = data
  } catch (err) {
    console.error(err)
    error.value = t('checkins.errorLoading')
  } finally {
    loading.value = false
  }
}

// Vaqtni yangilash (har minutda)
let timeUpdateInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  selectedDate.value = today
  dateFrom.value = today
  dateTo.value = today
  onlyToday.value = true
  fetchCheckins()
  
  // Vaqtni har soniyada yangilash (real vaqtni ko'rsatish uchun)
  timeUpdateInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000) // Har soniyada
})

onUnmounted(() => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
    timeUpdateInterval = null
  }
})


const filteredCheckins = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()
  return checkins.value.filter((item) => {
    const matchesSearch =
      !search ||
      (item.fullName && item.fullName.toLowerCase().includes(search)) ||
      item.qrCodeId.toLowerCase().includes(search)

    // Sana filtri
    let matchesDate = true
    
    if (onlyToday.value) {
      const today = new Date().toISOString().slice(0, 10)
      matchesDate = item.date.slice(0, 10) === today
    } else if (dateFrom.value || dateTo.value) {
      const itemDate = item.date.slice(0, 10)
      if (dateFrom.value && dateTo.value) {
        matchesDate = itemDate >= dateFrom.value && itemDate <= dateTo.value
      } else if (dateFrom.value) {
        matchesDate = itemDate >= dateFrom.value
      } else if (dateTo.value) {
        matchesDate = itemDate <= dateTo.value
      }
    } else if (selectedDate.value) {
      matchesDate = item.date.slice(0, 10) === selectedDate.value
    }

    return matchesSearch && matchesDate
  })
})

const resetFilters = () => {
  const today = new Date().toISOString().slice(0, 10)
  dateFrom.value = today
  dateTo.value = today
  selectedDate.value = today
  searchTerm.value = ''
  onlyToday.value = true
}

// Excel export (XLSX formatida)
const exportToExcel = () => {
  const data = filteredCheckins.value
  if (data.length === 0) {
    alert(t('common.noData'))
    return
  }

  // Excel uchun ma'lumotlarni tayyorlash
  const excelData = data.map(item => ({
    [t('checkins.columns.name')]: item.fullName || t('checkins.noName'),
    [t('checkins.columns.id')]: item.qrCodeId,
    [t('checkins.columns.dateTime')]: formatDateTime(item.date),
    [t('checkins.columns.verifiedBy')]: item.verifiedBy || '—'
  }))

  // Workbook yaratish
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(excelData)

  // Column width'ni sozlash
  ws['!cols'] = [
    { wch: 25 }, // Ism
    { wch: 12 }, // ID
    { wch: 20 }, // Sana va vaqt
    { wch: 15 }  // Tasdiqlagan
  ]

  // Sheet'ni workbook'ga qo'shish
  XLSX.utils.book_append_sheet(wb, ws, t('checkins.title'))

  // Fayl nomi
  const dateRange = dateFrom.value && dateTo.value 
    ? `${dateFrom.value}_${dateTo.value}`
    : new Date().toISOString().slice(0, 10)
  
  // Excel faylini yuklab olish
  XLSX.writeFile(wb, `kirishlar_${dateRange}.xlsx`)
}

// PDF export
const exportToPDF = () => {
  const data = filteredCheckins.value
  if (data.length === 0) {
    alert(t('common.noData'))
    return
  }

  // PDF uchun HTML yaratish
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const dateRange = dateFrom.value && dateTo.value 
    ? `${formatDateTime(dateFrom.value + 'T00:00:00').split(' ')[0]} ${t('checkins.from')} ${formatDateTime(dateTo.value + 'T23:59:59').split(' ')[0]} ${t('checkins.to')}`
    : t('checkins.allCheckins')

  const tableRows = data.map(item => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.fullName || t('checkins.noName')}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.qrCodeId}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${formatDateTime(item.date)}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.verifiedBy || '—'}</td>
    </tr>
  `).join('')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${t('checkins.title')}</title>
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
        <h1>${t('checkins.title')}</h1>
        <div class="info">
          <p><strong>${t('checkins.dateRange')}:</strong> ${dateRange}</p>
          <p><strong>${t('checkins.totalCheckins')}:</strong> ${data.length} ${t('checkins.items')}</p>
          <p><strong>${t('checkins.reportDate')}:</strong> ${formatDateTime(new Date().toISOString())}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>${t('checkins.columns.name')}</th>
              <th>${t('checkins.columns.id')}</th>
              <th>${t('checkins.columns.dateTime')}</th>
              <th>${t('checkins.columns.verifiedBy')}</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">
          <p>Vidalita Gym & Beauty - ${new Date().toLocaleDateString('uz-UZ')}</p>
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

// formatDateTime va formatDate funksiyalari utility'dan import qilingan

const onDeleteCheckin = async (id: number) => {
  const ok = window.confirm(t('checkins.deleteCheckinConfirm'))
  if (!ok) return
  try {
    await api.delete(`/checkins/${id}`)
    checkins.value = checkins.value.filter(c => c.id !== id)
  } catch (err) {
    console.error(err)
    window.alert(t('checkins.deleteCheckinError'))
  }
}

const onDeleteMember = async (memberId: number) => {
  const ok = window.confirm(t('checkins.deleteMemberConfirm'))
  if (!ok) return
  try {
    await api.delete(`/members/${memberId}`)
    // A'zosi o'chirilgan yozuvlarni ham ro'yxatdan olib tashlaymiz
    checkins.value = checkins.value.filter(c => c.memberId !== memberId)
  } catch (err: any) {
    console.error(err)
    window.alert((err?.response?.data?.error) || t('checkins.deleteMemberError'))
  }
}

const clearMessages = () => {
  error.value = null
  successMessage.value = null
}

// Barcode tozalash funksiyasi (TGC qo'shmasdan)
const normalizeBarcode = (inputValue: string): string => {
  if (!inputValue) return ''
  
  // Faqat harflar va raqamlarni qoldirish, katta harflarga o'tkazish
  let value = inputValue.toUpperCase().trim().replace(/[^A-Z0-9]/g, '')
  
  return value
}

const handleInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const normalizedValue = normalizeBarcode(target.value)
  
  barcodeInput.value = normalizedValue
  clearMessages()
  
  // Oldingi timeout'ni bekor qilish
  if (autoCheckTimeout) {
    clearTimeout(autoCheckTimeout)
    autoCheckTimeout = null
  }
  
  // Agar kod to'liq bo'lsa (minimal 3 ta belgi), avtomatik tekshirish
  if (normalizedValue.length >= 3 && !scanning.value) {
    // Kichik kechikish bilan tekshirish (debounce)
    autoCheckTimeout = setTimeout(() => {
      if (barcodeInput.value.length >= 3 && !scanning.value) {
        handleBarcodeScan()
      }
      autoCheckTimeout = null
    }, 300)
  }
}

// Paste event uchun
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedText = event.clipboardData?.getData('text') || ''
  const normalizedValue = normalizeBarcode(pastedText)
  barcodeInput.value = normalizedValue
  
  // Paste'dan keyin ham tekshirish
  if (normalizedValue.length >= 3 && !scanning.value) {
    setTimeout(() => {
      handleBarcodeScan()
    }, 100)
  }
}

// Keydown event - scanner tez kirgizganda
const handleKeyDown = (event: KeyboardEvent) => {
  // Enter tugmasi bosilganda
  if (event.key === 'Enter') {
    event.preventDefault()
    const normalizedValue = normalizeBarcode(barcodeInput.value)
    barcodeInput.value = normalizedValue
    
    if (normalizedValue.length >= 3 && !scanning.value) {
      handleBarcodeScan()
    }
  }
}

// Member ma'lumotlarini olish
const fetchMemberByQrCode = async (qrCode: string) => {
  memberModalLoading.value = true
  memberModalError.value = null
  scannedMember.value = null
  scannedGymInfo.value = null
  scannedBeautyHealth.value = null
  scannedCheckins.value = []
  scannedBeautyServices.value = []
  
  try {
    // Avval member ma'lumotlarini olish
    const memberRes = await api.get(`/members/qr/${qrCode}`)
    scannedMember.value = memberRes.data
    
    // Agar member topilsa, qolgan ma'lumotlarni parallel olish
    if (scannedMember.value && scannedMember.value.id) {
      const memberId = scannedMember.value.id
      
      // Qolgan ma'lumotlarni member ID orqali parallel olish
      const [gymInfoRes, healthInfoRes, checkinsInfoRes, beautyInfoRes] = await Promise.all([
        api.get(`/members/${memberId}/gym-info`).catch(() => ({ data: null })),
        api.get(`/members/${memberId}/beauty-health`).catch(() => ({ data: null })),
        api.get(`/checkins/member/${memberId}`).catch(() => ({ data: [] })),
        api.get(`/beauty/member/${memberId}`).catch(() => ({ data: [] }))
      ])
      
      scannedGymInfo.value = gymInfoRes.data
      scannedBeautyHealth.value = healthInfoRes.data
      scannedCheckins.value = checkinsInfoRes.data || []
      scannedBeautyServices.value = beautyInfoRes.data || []
    }
    
    showMemberModal.value = true
  } catch (err: any) {
    console.error('Error fetching member:', err)
    // Agar member topilmasa, xatolik ko'rsatish
    if (err?.response?.status === 404) {
      memberModalError.value = t('checkins.memberNotFound')
    } else {
      memberModalError.value = err?.response?.data?.error || t('checkins.memberNotFound')
    }
  } finally {
    memberModalLoading.value = false
  }
}

// Modal yopish
const closeMemberModal = () => {
  showMemberModal.value = false
  scannedMember.value = null
  scannedGymInfo.value = null
  scannedBeautyHealth.value = null
  scannedCheckins.value = []
  scannedBeautyServices.value = []
  memberModalError.value = null
  // Input'ga fokus qaytarish
  setTimeout(() => {
    barcodeInputRef.value?.focus()
  }, 100)
}

const handleBarcodeScan = async () => {
  // Avval normalize qilish
  const normalizedValue = normalizeBarcode(barcodeInput.value)
  barcodeInput.value = normalizedValue
  
  const qrCode = normalizedValue.trim()
  if (!qrCode || qrCode.length < 3) {
    error.value = t('checkins.errorCheckin')
    return
  }

  scanning.value = true
  error.value = null
  successMessage.value = null

  try {
    // Avval member ma'lumotlarini olish va modalni ko'rsatish
    await fetchMemberByQrCode(qrCode)
    
    // Keyin checkin yaratish
    const { data } = await api.post('/checkins', {
      qrCodeId: qrCode,
      verifiedBy: 'System'
    })

    successMessage.value = t('checkins.successCheckin', { name: data.member?.fullName || scannedMember.value?.fullName || t('checkins.noName') })
    barcodeInput.value = ''
    
    // Ro'yxatni yangilash
    await fetchCheckins()
    
    // 2 soniyadan keyin xabarni yashirish
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err: any) {
    console.error(err)
    const errorMsg = err?.response?.data?.error || t('checkins.errorCheckin')
    error.value = errorMsg
    
    // 5 soniyadan keyin xatolik xabarni yashirish
    setTimeout(() => {
      error.value = null
    }, 5000)
  } finally {
    scanning.value = false
    // Input'ga fokus qaytarish
    setTimeout(() => {
      barcodeInputRef.value?.focus()
    }, 100)
  }
}

// formatDate funksiyasi - utility'dan import qilingan

// A'zolik turini label qilish
const getMembershipTypeLabel = (membershipType: string) => {
  switch (membershipType) {
    case 'monthly':
      return t('memberCreate.membershipMonthly')
    case 'quarterly':
      return t('memberCreate.membershipQuarterly')
    case 'yearly':
      return t('memberCreate.membershipYearly')
    case 'other':
      return t('memberCreate.membershipOther')
    default:
      return membershipType
  }
}

// A'zolik muddati tugaganini tekshirish
const isExpired = (endDate: string): boolean => {
  if (!endDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  return end < today
}

// A'zolik muddati tez orada tugayotganini tekshirish (7 kundan kam qolgan)
const isExpiringSoon = (endDate: string): boolean => {
  if (!endDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  const diffTime = end.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 7
}

// Qancha kun qolganini hisoblash
const getDaysRemaining = (endDate: string): number => {
  if (!endDate) return 0
  // currentTime ref'ni ishlatish - avtomatik yangilanish uchun
  const today = new Date(currentTime.value)
  today.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  const diffTime = end.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Qancha kun qolganini matn ko'rinishida qaytarish
const getDaysRemainingText = (endDate: string): string => {
  const days = getDaysRemaining(endDate)
  if (days < 0) return ''
  if (days === 0) return t('checkins.daysRemainingToday') || 'Bugun tugaydi'
  if (days === 1) return t('checkins.daysRemainingOne') || '1 kun qoldi'
  return t('checkins.daysRemaining', { days }) || `${days} kun qoldi`
}

// Qancha kun qolganiga qarab rangni aniqlash
const getDaysRemainingClass = (endDate: string): string => {
  const days = getDaysRemaining(endDate)
  if (days <= 3) return 'text-red-600'
  if (days <= 7) return 'text-yellow-600'
  return 'text-green-600'
}
</script>

