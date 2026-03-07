<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ $t('checkins.title') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('checkins.subtitle') }}</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1.5">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {{ $t('checkins.currentTime') }}: <span class="font-mono text-gray-600 dark:text-gray-300">{{ currentTimeFormatted }}</span>
        </p>
      </div>
      <button class="glass-pill rounded-full border border-gray-400/30 px-5 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all shadow-sm flex items-center gap-2" @click="fetchCheckins">
        <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': loading }" />
        {{ $t('common.refresh') }}
      </button>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
    <div v-if="successMessage" class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{{ successMessage }}</div>

    <!-- Member Info Modal -->
    <Teleport to="body">
      <div v-if="showMemberModal" class="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4" @click.self="closeMemberModal">
        <!-- Backdrop with blur -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-md z-[150]"></div>
        <!-- Modal content -->
        <div class="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl z-[151] flex flex-col animate-in fade-in zoom-in-95 duration-300" @click.stop>
        <div class="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-white/20 px-6 py-4 backdrop-blur-xl">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-sky-500/20 flex items-center justify-center">
              <UserIcon class="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ $t('checkins.memberInfo') }}</h3>
          </div>
          <button @click="closeMemberModal" class="rounded-full p-2 text-gray-500 hover:bg-white/20 transition-all">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="overflow-y-auto custom-scrollbar flex-1">
        <LoadingSpinner v-if="memberModalLoading" />
        <div v-else-if="memberModalError" class="px-4 sm:px-6 py-12 text-center text-red-600">{{ memberModalError }}</div>
        <div v-else-if="scannedMember" class="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <!-- Asosiy ma'lumotlar -->
          <section class="glass rounded-2xl border-white/40 dark:border-white/10 shadow-xl">
            <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
              <h4 class="text-base sm:text-lg font-semibold text-gray-900">{{ $t('memberDetail.basicInfo') }}</h4>
            </div>
            <div class="px-4 sm:px-6 py-4 sm:py-6">
              <div class="grid gap-4 sm:gap-6 md:grid-cols-2">
                <!-- Surat -->
                <div class="flex justify-center">
                  <div v-if="scannedMember.photo" class="relative">
                    <img :src="storageService.getMemberPhotoUrl(scannedMember.photo) || ''" :alt="scannedMember.fullName" class="h-48 w-48 sm:h-64 sm:w-64 rounded-lg object-cover border-2 border-gray-200" />
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
          <section v-if="scannedGymInfo" class="glass rounded-2xl border-white/40 dark:border-white/10 shadow-xl overflow-hidden">
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
          <section v-if="scannedBeautyHealth" class="glass rounded-2xl border-white/40 dark:border-white/10 shadow-xl overflow-hidden">
            <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
              <h4 class="text-base sm:text-lg font-semibold text-gray-900">{{ $t('memberDetail.healthInfo') }}</h4>
            </div>
            <div class="px-4 sm:px-6 py-4 sm:py-6">
              <div class="overflow-x-auto rounded-xl border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100/50 dark:bg-white/5">
                    <tr>
                      <th class="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('memberCreate.healthCondition') }}</th>
                      <th class="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('common.status') }}</th>
                      <th class="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('memberCreate.details') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/10 dark:divide-white/5">
                    <tr v-for="question in beautyQuestions" :key="question.key" class="align-top">
                      <td class="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-700">{{ $t(question.labelKey) }}</td>
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
          <section v-if="scannedCheckins && scannedCheckins.length > 0" class="glass rounded-2xl border-white/40 dark:border-white/10 shadow-xl overflow-hidden">
            <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
              <h4 class="text-base sm:text-lg font-semibold text-gray-900">{{ $t('memberDetail.checkinHistory') }}</h4>
              <p class="text-xs sm:text-sm text-gray-500">{{ $t('memberDetail.checkinTotal') }}: {{ scannedCheckins.length }} {{ $t('memberDetail.checkins') }}</p>
            </div>
            <div class="px-4 sm:px-6 py-4 sm:py-6">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100/50 dark:bg-white/5">
                    <tr>
                      <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('checkins.columns.dateTime') }}</th>
                      <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('checkins.columns.verifiedBy') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/10 dark:divide-white/5">
                    <tr v-for="checkin in scannedCheckins.slice(0, 10)" :key="checkin.id" class="hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">{{ formatDateTime(checkin.date) }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ checkin.verifiedBy || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- Faol Paketlar (Seanslar) -->
          <section v-if="scannedPackages && scannedPackages.length > 0" class="glass rounded-2xl border-white/40 dark:border-white/10 shadow-xl overflow-hidden">
            <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
              <h4 class="text-base sm:text-lg font-semibold text-gray-900">{{ $t('memberDetail.activePackages') }}</h4>
              <p class="text-xs sm:text-sm text-gray-500">{{ scannedPackages.length }} {{ $t('beautyServices.items') }}</p>
            </div>
            <div class="px-4 sm:px-6 py-4 sm:py-6">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100/50 dark:bg-white/5">
                    <tr>
                      <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('beautyServices.packageType') }}</th>
                      <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('beautyServices.totalSessions') }}</th>
                      <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('beautyServices.remainingSessions') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/10 dark:divide-white/5">
                    <tr v-for="pkg in scannedPackages" :key="pkg.id" class="hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{{ pkg.serviceName }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ pkg.totalSessions }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm font-bold" :class="pkg.remainingSessions <= 1 ? 'text-red-600' : 'text-green-600'">
                        {{ pkg.remainingSessions }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- Go'zallik xizmatlari -->
          <section v-if="scannedBeautyServices && scannedBeautyServices.length > 0" class="glass rounded-2xl border-white/40 dark:border-white/10 shadow-xl overflow-hidden">
            <div class="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
              <h4 class="text-base sm:text-lg font-semibold text-gray-900">{{ $t('memberDetail.beautyServices') }}</h4>
              <p class="text-xs sm:text-sm text-gray-500">{{ $t('memberDetail.beautyTotal') }}: {{ scannedBeautyServices.length }} {{ $t('memberDetail.services') }}</p>
            </div>
            <div class="px-4 sm:px-6 py-4 sm:py-6">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100/50 dark:bg-white/5">
                    <tr>
                      <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('memberDetail.serviceName') }}</th>
                      <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('memberDetail.serviceDate') }}</th>
                      <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('memberDetail.note') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/10 dark:divide-white/5">
                    <tr v-for="service in scannedBeautyServices.slice(0, 10)" :key="service.id" class="hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
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
      </div>
    </Teleport>

    <!-- Barcode Scanner Input -->
    <div class="glass rounded-2xl p-4 sm:p-6 shadow-lg border-white/40 dark:border-white/10 relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-purple-500/5 opacity-50"></div>
      <div class="relative z-10">
        <div class="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <QrCodeIcon class="h-5 w-5 text-sky-500" />
              {{ $t('checkins.barcodeTitle') }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('checkins.barcodeSubtitle') }}</p>
          </div>
          <button
            @click="toggleCameraScanner"
            class="rounded-full border border-sky-400/40 bg-sky-500/10 dark:bg-sky-500/5 px-4 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-400 hover:bg-sky-500/20 transition-all flex items-center justify-center gap-2"
          >
            <component :is="showCameraScanner ? KeyboardIcon : CameraIcon" class="h-4 w-4" />
            {{ showCameraScanner ? $t('scanner.manual') : $t('scanner.camera') }}
          </button>
        </div>
        
        <!-- Camera Scanner -->
        <div v-if="showCameraScanner" class="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div class="relative max-w-md mx-auto">
            <div id="qr-reader-checkin" class="rounded-2xl overflow-hidden border-2 shadow-inner" :class="cameraScanning ? 'border-sky-500/50 shadow-sky-500/20' : 'border-gray-300/50'"></div>
            <div v-if="!cameraScanning" class="absolute inset-0 flex items-center justify-center bg-gray-500/10 backdrop-blur-sm rounded-2xl border border-dashed border-gray-400/30 text-center p-6">
              <div class="space-y-3">
                <CameraIcon class="mx-auto h-12 w-12 text-gray-400" />
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('scanner.cameraNotStarted') }}</p>
              </div>
            </div>
          </div>
          <div class="flex justify-center pt-2">
            <button
              v-if="!cameraScanning"
              @click="startCameraScanning"
              class="rounded-full bg-sky-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-600/25 hover:bg-sky-500 hover:-translate-y-0.5 transition-all"
            >
              {{ $t('scanner.startScanning') }}
            </button>
            <button
              v-else
              @click="stopCameraScanning"
              class="rounded-full bg-red-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/25 hover:bg-red-500 hover:-translate-y-0.5 transition-all"
            >
              {{ $t('scanner.stopScanning') }}
            </button>
          </div>
          <div v-if="cameraScannerError" class="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-600 dark:text-red-400 text-center">
            {{ cameraScannerError }}
          </div>
        </div>

        <!-- Manual Input -->
        <div v-else class="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div class="relative flex-1">
            <input
              ref="barcodeInputRef"
              v-model="barcodeInput"
              type="text"
              :placeholder="$t('checkins.barcodePlaceholder')"
              class="w-full input border-sky-400/30 focus:border-sky-500 focus:ring-sky-500/20 pr-10"
              @keyup.enter="handleBarcodeScan"
              @input="handleInputChange"
              @paste="handlePaste"
              @keydown="handleKeyDown"
              autofocus
            />
            <div class="absolute right-3 top-1/2 -translate-y-1/2 text-sky-500/40">
              <IdentificationIcon class="h-5 w-5" />
            </div>
          </div>
          <button
            @click="handleBarcodeScan"
            :disabled="!barcodeInput.trim() || barcodeInput.length < 3 || scanning"
            class="rounded-full bg-sky-600 px-8 py-2 text-sm font-bold text-white shadow-lg shadow-sky-600/25 hover:bg-sky-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none transition-all flex items-center gap-2 h-10"
          >
            <span v-if="scanning" class="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            {{ scanning ? $t('checkins.checking') : $t('checkins.enter') }}
          </button>
        </div>
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
          :placeholder="$t('checkins.searchPlaceholder')"
          class="w-full rounded-full h-11 pl-12 pr-4 text-sm bg-white/40 dark:bg-black/20 border-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 backdrop-blur-sm transition"
        />
      </div>

      <div class="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto">
        <!-- Date From -->
        <div class="flex items-center gap-2 w-full lg:w-auto">
          <span class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0">{{ $t('checkins.dateFrom') }}</span>
          <div class="flex items-center gap-2 px-3 h-11 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 w-full lg:w-36 overflow-hidden">
            <CalendarIcon class="h-4 w-4 text-gray-500" />
            <input v-model="dateFrom" type="date" class="bg-transparent border-none focus:ring-0 w-full p-0 text-xs font-bold h-full text-gray-700 dark:text-gray-200 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
          </div>
        </div>

        <!-- Date To -->
        <div class="flex items-center gap-2 w-full lg:w-auto">
          <span class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0">{{ $t('checkins.dateTo') }}</span>
          <div class="flex items-center gap-2 px-3 h-11 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 w-full lg:w-36 overflow-hidden">
            <CalendarIcon class="h-4 w-4 text-gray-500" />
            <input v-model="dateTo" type="date" class="bg-transparent border-none focus:ring-0 w-full p-0 text-xs font-bold h-full text-gray-700 dark:text-gray-200 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
          </div>
        </div>

        <div class="flex items-center gap-2 w-full lg:w-auto">
          <!-- Today Only -->
          <div class="flex h-11 items-center gap-2 rounded-full border border-gray-400/30 bg-white/20 dark:bg-white/5 px-4 group hover:border-sky-400/50 transition-colors cursor-pointer" @click="onlyToday = !onlyToday">
            <input id="todayOnly" v-model="onlyToday" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500/20" @click.stop />
            <label for="todayOnly" class="text-xs font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap cursor-pointer uppercase tracking-tight">{{ $t('checkins.todayOnly') }}</label>
          </div>

          <div class="flex gap-2">
            <button
              @click="exportToExcel"
              class="flex items-center justify-center h-11 w-11 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm shrink-0"
              :title="$t('checkins.exportExcel')"
            >
              <TableCellsIcon class="h-5 w-5" />
            </button>
            <button
              @click="exportToPDF"
              class="flex items-center justify-center h-11 w-11 rounded-full border border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all shadow-sm shrink-0"
              :title="$t('checkins.exportPDF')"
            >
              <DocumentTextIcon class="h-5 w-5" />
            </button>
            <button
              @click="resetFilters"
              class="flex items-center justify-center h-11 px-6 rounded-full border border-gray-400/30 bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20 transition-all font-black text-[10px] shadow-sm uppercase tracking-widest whitespace-nowrap"
            >
              {{ $t('common.reset') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table section (scrollable) -->
    <div class="glass flex-1 overflow-hidden rounded-2xl shadow-xl flex flex-col" style="max-height: calc(100vh - 280px);">
    <LoadingSpinner v-if="loading" />
      <template v-else>
        <!-- Thead pill -->
        <div class="mx-2 mt-2 mb-1 shrink-0 glass rounded-full shadow-lg border-white/20 dark:border-white/10 overflow-hidden backdrop-blur-xl">
          <table class="table-fixed border-separate border-spacing-0 w-full">
            <thead>
              <tr class="bg-transparent">
                <th class="py-2.5 pl-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[220px]">{{ $t('checkins.columns.name') }}</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[140px]">{{ $t('checkins.columns.id') }}</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[180px]">{{ $t('checkins.columns.dateTime') }}</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[180px]">{{ $t('checkins.columns.verifiedBy') }}</th>
                <th class="py-2.5 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-transparent w-[130px]">{{ $t('common.actions') }}</th>
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
            <th class="px-4 py-2.5 w-[140px]"></th>
            <th class="px-4 py-2.5 w-[180px]"></th>
            <th class="px-4 py-2.5 w-[180px]"></th>
            <th class="py-2.5 pr-6 w-[130px]"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10 dark:divide-white/5">
              <tr v-for="item in filteredCheckins" :key="item.id" class="group transition-colors hover:bg-white/40 dark:hover:bg-white/5 backdrop-blur-sm">
                <td class="whitespace-nowrap py-4 pl-6 text-sm font-bold text-gray-900 dark:text-gray-100">{{ item.fullName || $t('checkins.noName') }}</td>
                <td class="whitespace-nowrap px-4 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">#{{ item.qrCodeId }}</td>
                <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <div class="flex flex-col">
                    <span class="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight text-xs">{{ formatDateTime(item.date).split(' ')[0] }}</span>
                    <span class="text-[10px] font-bold text-gray-400 italic mt-0.5">{{ formatDateTime(item.date).split(' ')[1] }}</span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-sm">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 dark:text-sky-300 text-[10px] font-black uppercase tracking-widest border border-sky-200 dark:border-sky-800 shadow-sm">
                    <UserIcon class="h-3 w-3" />
                    {{ item.verifiedBy || '—' }}
                  </span>
                </td>
                <td class="whitespace-nowrap py-4 pr-6 text-sm text-right">
                  <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      class="rounded-full bg-white/50 dark:bg-black/20 px-3 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-400/20 hover:border-red-400/50 hover:text-red-500 transition-all shadow-sm"
                      @click="onDeleteCheckin(item.id)"
                    >
                      {{ $t('common.delete') }}
                    </button>
                    <button
                      class="rounded-full bg-red-500/10 dark:bg-red-500/5 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400 border border-red-400/30 hover:bg-red-500/20 transition-all shadow-sm"
                      @click="onDeleteMember(item.memberId)"
                    >
                      {{ $t('checkins.deleteMember') }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredCheckins.length === 0">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <div class="h-12 w-12 rounded-full bg-gray-500/10 flex items-center justify-center">
                      <MagnifyingGlassIcon class="h-6 w-6 text-gray-400" />
                    </div>
                    <p class="text-sm font-medium text-gray-500">{{ $t('checkins.noResults') }}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { membersService, checkinsService, beautyService, storageService } from '../services/supabaseService'
import { supabase } from '../lib/supabase'
import * as mappings from '../lib/mappings'
import * as XLSX from 'xlsx'
import { 
  TableCellsIcon, 
  DocumentTextIcon, 
  ArrowPathIcon,
  QrCodeIcon,
  IdentificationIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  CalendarIcon,
  CameraIcon,
  UserIcon,
  ViewfinderCircleIcon as KeyboardIcon
} from '@heroicons/vue/24/outline'
import { formatDate, formatDateTime, getCurrentDateTime } from '../lib/dateUtils'
import { Html5Qrcode } from 'html5-qrcode'
import { useToast } from '../composables/useToast'
import { useConfirm } from '../composables/useConfirm'

const { t } = useI18n()
const toast = useToast()
const { confirm } = useConfirm()

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

// Camera scanner state
const showCameraScanner = ref(false)
const cameraScanning = ref(false)
const cameraScannerError = ref<string | null>(null)
let html5QrCodeInstance: Html5Qrcode | null = null

// Modal state
const showMemberModal = ref(false)
const scannedMember = ref<any>(null)
const scannedGymInfo = ref<any>(null)
const scannedBeautyHealth = ref<any>(null)
const scannedCheckins = ref<any[]>([])
const scannedBeautyServices = ref<any[]>([])
const scannedPackages = ref<any[]>([])
const memberModalLoading = ref(false)
const memberModalError = ref<string | null>(null)
const currentTime = ref(new Date()) // Vaqtni yangilash uchun

// Hozirgi vaqtni formatlash (real vaqt)
const currentTimeFormatted = computed(() => {
  return getCurrentDateTime()
})

// Beauty questions for health info
const beautyQuestions = [
  { key: 'bloodPressure', labelKey: 'memberCreate.beautyQuestionBloodPressure' },
  { key: 'diabetes', labelKey: 'memberCreate.beautyQuestionDiabetes' },
  { key: 'cancer', labelKey: 'memberCreate.beautyQuestionCancer', detailKey: 'cancerDetails' },
  { key: 'cancerTreatment', labelKey: 'memberCreate.beautyQuestionCancerTreatment', detailKey: 'cancerTreatmentDetails' },
  { key: 'hormonal', labelKey: 'memberCreate.beautyQuestionHormonal' },
  { key: 'thyroid', labelKey: 'memberCreate.beautyQuestionThyroid' },
  { key: 'skin', labelKey: 'memberCreate.beautyQuestionSkin', detailKey: 'skinDetails' },
  { key: 'alcohol', labelKey: 'memberCreate.beautyQuestionAlcohol' },
  { key: 'prosthesis', labelKey: 'memberCreate.beautyQuestionProsthesis' },
  { key: 'platinum', labelKey: 'memberCreate.beautyQuestionPlatinum' },
  { key: 'implants', labelKey: 'memberCreate.beautyQuestionImplants' },
  { key: 'crowns', labelKey: 'memberCreate.beautyQuestionCrowns' },
  { key: 'surgery', labelKey: 'memberCreate.beautyQuestionSurgery', detailKey: 'surgeryDetails', extraDateKey: 'surgeryDate' },
  { key: 'smoking', labelKey: 'memberCreate.beautyQuestionSmoking' }
]

const fetchCheckins = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await checkinsService.getAll()
    checkins.value = data
  } catch (err: any) {
    console.error(err)
    error.value = err.message || t('checkins.errorLoading')
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
    toast.warning(t('common.noData'))
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
  XLSX.writeFile(wb, `checkins_${dateRange}.xlsx`)
}

// PDF export
const exportToPDF = () => {
  const data = filteredCheckins.value
  if (data.length === 0) {
    toast.warning(t('common.noData'))
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
          <p>Vidalita Gym & Beauty - ${new Date().toLocaleDateString()}</p>
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
  const ok = await confirm(t('checkins.deleteCheckinConfirm'))
  if (!ok) return
  try {
    await checkinsService.delete(id)
    toast.success(t('common.success'))
    checkins.value = checkins.value.filter(c => c.id !== id)
  } catch (err: any) {
    console.error(err)
    toast.error(err.message || t('checkins.deleteCheckinError'))
  }
}

const onDeleteMember = async (memberId: number) => {
  const ok = await confirm(t('checkins.deleteMemberConfirm'))
  if (!ok) return
  try {
    await membersService.delete(memberId)
    toast.success(t('common.success'))
    // A'zosi o'chirilgan yozuvlarni ham ro'yxatdan olib tashlaymiz
    checkins.value = checkins.value.filter(c => c.memberId !== memberId)
  } catch (err: any) {
    console.error(err)
    toast.error(err.message || t('checkins.deleteMemberError'))
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
    const member = await membersService.getByQrCode(qrCode)
    if (!member || !member.id) {
        throw new Error(t('checkins.memberNotFound'))
    }
    scannedMember.value = member
    
    const memberId = member.id
    
    // Qolgan ma'lumotlarni member ID orqali parallel olish
    const [gymInfo, healthInfo, checkinsInfo, beautyInfo, packagesInfo] = await Promise.all([
      membersService.getGymInfo(memberId).catch(() => null),
      membersService.getBeautyHealth(memberId).catch(() => null),
      checkinsService.getByMemberId(memberId).catch(() => []),
      beautyService.getByMemberId(memberId).catch(() => []),
      beautyService.getMemberPackages(memberId).catch(() => [])
    ])
    
    scannedGymInfo.value = gymInfo
    scannedBeautyHealth.value = healthInfo
    scannedCheckins.value = checkinsInfo || []
    scannedBeautyServices.value = beautyInfo || []
    scannedPackages.value = packagesInfo || []
    
    showMemberModal.value = true
  } catch (err: any) {
    console.error('Error fetching member:', err)
    memberModalError.value = err.message || t('checkins.memberNotFound')
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
  scannedPackages.value = []
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
    const data = await checkinsService.add(qrCode, 'System')

    successMessage.value = t('checkins.successCheckin', { name: data.fullName || scannedMember.value?.fullName || t('checkins.noName') })
    barcodeInput.value = ''
    
    // Ro'yxatni yangilash
    await fetchCheckins()
    
    // 2 soniyadan keyin xabarni yashirish
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err: any) {
    console.error(err)
    const errorMsg = err.message || err?.response?.data?.error || t('checkins.errorCheckin')
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
  if (days === 0) return t('checkins.daysRemainingToday')
  if (days === 1) return t('checkins.daysRemainingOne')
  return t('checkins.daysRemaining', { days }) || `${days} kun qoldi`
}

// Qancha kun qolganiga qarab rangni aniqlash
const getDaysRemainingClass = (endDate: string): string => {
  const days = getDaysRemaining(endDate)
  if (days <= 3) return 'text-red-600'
  if (days <= 7) return 'text-yellow-600'
  return 'text-green-600'
}

// Camera scanner funksiyalari
const toggleCameraScanner = () => {
  showCameraScanner.value = !showCameraScanner.value
  if (!showCameraScanner.value && cameraScanning.value) {
    stopCameraScanning()
  }
}

const startCameraScanning = async () => {
  try {
    cameraScannerError.value = null
    
    if (!html5QrCodeInstance) {
      html5QrCodeInstance = new Html5Qrcode('qr-reader-checkin')
    }

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    }

    await html5QrCodeInstance.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        // Scan muvaffaqiyatli - qrCode'ni ishlatish
        stopCameraScanning()
        barcodeInput.value = normalizeBarcode(decodedText)
        handleBarcodeScan()
      },
      (errorMessage) => {
        // Scan xatosi - ignore
      }
    )

    cameraScanning.value = true
  } catch (err: any) {
    console.error('Camera scanner error:', err)
    cameraScannerError.value = err.message || t('scanner.errorStarting')
  }
}

const stopCameraScanning = async () => {
  try {
    if (html5QrCodeInstance && cameraScanning.value) {
      await html5QrCodeInstance.stop()
      cameraScanning.value = false
    }
  } catch (err: any) {
    console.error('Error stopping camera:', err)
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

#qr-reader-checkin {
  min-height: 250px;
}

#qr-reader-checkin video {
  border-radius: 1rem;
}
</style>
