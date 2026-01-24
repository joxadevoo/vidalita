<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-2">
      <RouterLink to="/members" class="text-sm text-sky-600 hover:text-sky-500">&larr; {{ $t('memberDetail.backToMembers') }}</RouterLink>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ member?.fullName || $t('memberDetail.loading') }}</h1>
          <p class="text-sm text-gray-500">{{ $t('memberDetail.title') }}</p>
        </div>
        <div class="flex gap-2">
          <RouterLink
            v-if="member"
            :to="`/members/${member.id}/edit`"
            class="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100"
          >
            {{ $t('common.edit') }}
          </RouterLink>
          <button
            class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            @click="fetchMember"
          >
            {{ $t('common.refresh') }}
          </button>
          <button
            class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            @click="onDeleteMember"
          >
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
    <div v-if="loading" class="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">{{ $t('memberDetail.loading') }}</div>

    <div v-else-if="member" class="space-y-6">
      <!-- Edit Form -->
      <form v-if="isEditing" class="space-y-8" @submit.prevent="handleUpdate">
        <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div class="border-b border-gray-100 px-6 py-4">
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('memberDetail.basicInfo') }}</h2>
          </div>
          <div class="px-6 py-6">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="input-label">{{ $t('memberCreate.fullName') }} *</label>
                <input v-model="editForm.fullName" type="text" required class="input" />
              </div>
              <div>
                <label class="input-label">{{ $t('memberCreate.phone') }} *</label>
                <input v-model="editForm.phone" type="tel" required class="input" />
              </div>
              <div>
                <label class="input-label">{{ $t('memberCreate.id') }}</label>
                <input v-model="editForm.qrCodeId" type="text" readonly class="input bg-gray-50 cursor-not-allowed font-mono" />
              </div>
              <div>
                <label class="input-label">{{ $t('memberCreate.birthDate') }}</label>
                <input v-model="editForm.birthDate" type="date" class="input" />
              </div>
              <div>
                <label class="input-label">{{ $t('memberCreate.registrationDate') }} *</label>
                <input v-model="editForm.joinDate" type="date" required class="input" />
              </div>
              <div>
                <label class="input-label">{{ $t('memberCreate.email') }}</label>
                <input v-model="editForm.email" type="email" class="input" />
              </div>
              <div>
                <label class="input-label">{{ $t('memberCreate.region') }}</label>
                <input v-model="editForm.region" type="text" class="input" />
              </div>
              <div>
                <label class="input-label">{{ $t('memberCreate.district') }}</label>
                <input v-model="editForm.district" type="text" class="input" />
              </div>
              <div>
                <label class="input-label">{{ $t('memberDetail.gymStart') }}</label>
                <input v-model="editForm.gymStart" type="date" class="input" />
              </div>
              <div>
                <label class="input-label">{{ $t('memberDetail.gymEnd') }}</label>
                <input v-model="editForm.gymEnd" type="date" class="input" />
              </div>
              <div>
                <label class="input-label">{{ $t('memberDetail.status') }}</label>
                <select v-model.number="editForm.gymActive" class="input">
                  <option :value="1">{{ $t('common.active') }}</option>
                  <option :value="0">{{ $t('common.inactive') }}</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="input-label">{{ $t('memberCreate.photo') }}</label>
                <div class="mt-2 flex items-center gap-4">
                  <div v-if="photoPreview || member.photo" class="relative">
                    <img :src="photoPreview || member.photo || undefined" alt="Preview" class="h-24 w-24 rounded-lg border-2 border-gray-200 object-cover" />
                    <button
                      type="button"
                      @click="removePhoto"
                      class="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    @change="handlePhotoUpload"
                    class="text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div v-if="updateError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ updateError }}</div>
        <div v-if="updateSuccess" class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{{ updateSuccess }}</div>

        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            @click="cancelEdit"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            class="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="updating"
          >
            {{ updating ? $t('common.loading') : $t('common.save') }}
          </button>
        </div>
      </form>

      <!-- View Mode -->
      <template v-else>
      <!-- Asosiy ma'lumotlar -->
      <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('memberDetail.basicInfo') }}</h2>
        </div>
        <div class="px-6 py-6">
          <div class="flex flex-col md:flex-row gap-6 mb-6">
            <!-- A'zo rasmi -->
            <div v-if="member.photo" class="flex-shrink-0">
              <img 
                :src="member.photo" 
                :alt="member.fullName"
                class="h-32 w-32 rounded-lg object-cover border-2 border-gray-200"
              />
            </div>
            <div v-else class="flex-shrink-0">
              <div class="h-32 w-32 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="grid gap-4 px-6 pb-6 md:grid-cols-2">
            <div>
              <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.fullName') }}</label>
              <p class="mt-1 text-sm font-medium text-gray-900">{{ member.fullName }}</p>
            </div>
          <div>
            <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.phone') }}</label>
            <p class="mt-1 text-sm text-gray-900">{{ member.phone || '—' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.id') }}</label>
            <p class="mt-1 text-sm text-gray-900 font-mono">{{ member.qrCodeId }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.joinDate') }}</label>
            <p class="mt-1 text-sm text-gray-900">{{ formatDate(member.joinDate) }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.status') }}</label>
            <p class="mt-1">
              <span :class="member.gymActive === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                {{ member.gymActive === 1 ? $t('common.active') : $t('common.inactive') }}
              </span>
            </p>
          </div>
          <div v-if="member.gymStart">
            <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.gymStart') }}</label>
            <p class="mt-1 text-sm text-gray-900">{{ formatDate(member.gymStart) }}</p>
          </div>
          <div v-if="member.gymEnd">
            <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.gymEnd') }}</label>
            <p class="mt-1 text-sm text-gray-900">{{ formatDate(member.gymEnd) }}</p>
          </div>
          <div v-if="member.lastUpdated">
            <label class="text-xs font-medium text-gray-500">{{ $t('memberDetail.lastUpdated') }}</label>
            <p class="mt-1 text-sm text-gray-900">{{ formatDateTime(member.lastUpdated) }}</p>
          </div>
        </div>
      </section>

      <!-- Qo'shimcha ma'lumotlar - Vaqtincha yopilgan (backend endpoint kutilmoqda) -->
      <!--
      <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-900">Qo'shimcha ma'lumotlar</h2>
          <p class="text-sm text-gray-500">Boshqa ma'lumotlar va tizim yozuvlari</p>
        </div>
        <div class="px-6 py-6">
          <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="text-xs font-medium text-gray-500">A'zo ID</label>
            <p class="mt-1 text-sm text-gray-900 font-mono">{{ member.id }}</p>
          </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Go'zallik xizmatlari yozuvi</label>
              <p class="mt-1">
                <span :class="member.beautyHasRecord ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {{ member.beautyHasRecord ? "Bor" : "Yo'q" }}
                </span>
              </p>
            </div>
            <div v-if="member.synced !== undefined">
              <label class="text-xs font-medium text-gray-500">Sinxronizatsiya holati</label>
              <p class="mt-1">
                <span :class="member.synced === 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {{ member.synced === 1 ? 'Sinxronlashtirilgan' : 'Sinxronlashtirilmagan' }}
                </span>
              </p>
            </div>
          </div>

          <div v-if="gymInfo && (gymInfo.membershipType || gymInfo.paymentMethod || gymInfo.emergencyName || gymInfo.fitnessGoals)" class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 class="mb-4 text-sm font-semibold text-gray-900">Gym qo'shimcha ma'lumotlari</h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div v-if="gymInfo.emergencyName">
                <label class="text-xs font-medium text-gray-500">Qarindosh ismi</label>
                <p class="mt-1 text-sm text-gray-900">{{ gymInfo.emergencyName }}</p>
              </div>
              <div v-if="gymInfo.emergencyPhone">
                <label class="text-xs font-medium text-gray-500">Qarindosh telefon</label>
                <p class="mt-1 text-sm text-gray-900">{{ gymInfo.emergencyPhone }}</p>
              </div>
              <div v-if="gymInfo.emergencyRelation">
                <label class="text-xs font-medium text-gray-500">Qarindoshlik</label>
                <p class="mt-1 text-sm text-gray-900">{{ gymInfo.emergencyRelation }}</p>
              </div>
              <div v-if="gymInfo.membershipType">
                <label class="text-xs font-medium text-gray-500">A'zolik turi</label>
                <p class="mt-1 text-sm text-gray-900">
                  <span v-if="gymInfo.membershipType === 'monthly'">Oylik</span>
                  <span v-else-if="gymInfo.membershipType === 'quarterly'">Choraklik (3 oy)</span>
                  <span v-else-if="gymInfo.membershipType === 'yearly'">Yillik</span>
                  <span v-else-if="gymInfo.membershipType === 'other'">{{ gymInfo.membershipTypeOther || 'Boshqa' }}</span>
                </p>
              </div>
              <div v-if="gymInfo.paymentMethod">
                <label class="text-xs font-medium text-gray-500">To'lov usuli</label>
                <p class="mt-1 text-sm text-gray-900">
                  <span v-if="gymInfo.paymentMethod === 'card'">Kredit/Debet karta</span>
                  <span v-else-if="gymInfo.paymentMethod === 'cash'">Naqd</span>
                  <span v-else-if="gymInfo.paymentMethod === 'other'">{{ gymInfo.paymentMethodOther || 'Boshqa' }}</span>
                </p>
              </div>
              <div v-if="gymInfo.fitnessGoals">
                <label class="text-xs font-medium text-gray-500">Fitnes maqsadlari</label>
                <p class="mt-1 text-sm text-gray-900 line-clamp-2">{{ gymInfo.fitnessGoals }}</p>
              </div>
              <div v-if="gymInfo.medicalConditions">
                <label class="text-xs font-medium text-gray-500">Tibbiy holat</label>
                <p class="mt-1 text-sm text-gray-900 line-clamp-2">{{ gymInfo.medicalConditions }}</p>
              </div>
              <div v-if="gymInfo.medications">
                <label class="text-xs font-medium text-gray-500">Dorilar</label>
                <p class="mt-1 text-sm text-gray-900 line-clamp-2">{{ gymInfo.medications }}</p>
              </div>
            </div>
          </div>

          <div v-if="beautyHealth && (beautyHealth.bloodPressure || beautyHealth.diabetes || beautyHealth.cancer || beautyHealth.smoking || beautyHealth.alcohol || beautyHealth.prosthesis || beautyHealth.medications)" class="mt-6 rounded-lg border border-gray-200 bg-purple-50 p-4">
            <h3 class="mb-4 text-sm font-semibold text-gray-900">Beauty sog'liq ma'lumotlari</h3>
            <div class="space-y-3">
              <div v-if="beautyHealth.bloodPressure === 'yes' || beautyHealth.diabetes === 'yes' || beautyHealth.cancer === 'yes' || beautyHealth.hormonal === 'yes' || beautyHealth.thyroid === 'yes'" class="flex flex-wrap gap-2">
                <span class="text-xs font-medium text-gray-500">Muhim holatlar:</span>
                <span v-if="beautyHealth.bloodPressure === 'yes'" class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Qon bosimi</span>
                <span v-if="beautyHealth.diabetes === 'yes'" class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Diabet</span>
                <span v-if="beautyHealth.cancer === 'yes'" class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Saraton</span>
                <span v-if="beautyHealth.hormonal === 'yes'" class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Gormonal</span>
                <span v-if="beautyHealth.thyroid === 'yes'" class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Qalqonsimon bez</span>
              </div>
              <div v-if="beautyHealth.prosthesis === 'yes' || beautyHealth.platinum === 'yes' || beautyHealth.implants === 'yes' || beautyHealth.crowns === 'yes'" class="flex flex-wrap gap-2">
                <span class="text-xs font-medium text-gray-500">Protez/Implant:</span>
                <span v-if="beautyHealth.prosthesis === 'yes'" class="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Protez</span>
                <span v-if="beautyHealth.platinum === 'yes'" class="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Platina</span>
                <span v-if="beautyHealth.implants === 'yes'" class="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Implant</span>
                <span v-if="beautyHealth.crowns === 'yes'" class="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Toj</span>
              </div>
              <div v-if="beautyHealth.smoking === 'yes' || beautyHealth.alcohol === 'yes'" class="flex flex-wrap gap-2">
                <span class="text-xs font-medium text-gray-500">Odati:</span>
                <span v-if="beautyHealth.smoking === 'yes'" class="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Chekish</span>
                <span v-if="beautyHealth.alcohol === 'yes'" class="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Spirtli ichimlik</span>
              </div>
              <div v-if="beautyHealth.skin === 'yes'" class="flex flex-wrap gap-2">
                <span class="text-xs font-medium text-gray-500">Teri kasalliklari:</span>
                <span class="inline-flex items-center rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">Bor</span>
                <span v-if="beautyHealth.skinDetails" class="text-xs text-gray-600">({{ beautyHealth.skinDetails }})</span>
              </div>
              <div v-if="beautyHealth.surgery === 'yes'" class="flex flex-wrap gap-2">
                <span class="text-xs font-medium text-gray-500">Operatsiya:</span>
                <span class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Bor</span>
                <span v-if="beautyHealth.surgeryDate" class="text-xs text-gray-600">({{ formatDate(beautyHealth.surgeryDate) }})</span>
              </div>
              <div v-if="beautyHealth.medications" class="text-xs">
                <span class="font-medium text-gray-500">Qabul qilayotgan dorilar:</span>
                <span class="ml-2 text-gray-900">{{ beautyHealth.medications }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      -->

      <!-- Beauty sog'liq ma'lumotlari (to'liq ko'rinish) -->
      <section v-if="beautyHealth && !isEditing" class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('memberDetail.healthInfo') }}</h2>
          <p class="text-sm text-gray-500">{{ $t('memberDetail.healthInfoSubtitle') }}</p>
        </div>
        <div class="px-6 py-6">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">{{ $t('memberCreate.beautyHealth') }}</th>
                  <th class="px-4 py-3 text-center text-sm font-semibold text-gray-900">{{ $t('common.status') }}</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">{{ $t('memberCreate.details') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="question in beautyQuestions" :key="question.key" class="align-top">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ question.label }}</td>
                  <td class="px-4 py-3 text-center text-sm">
                    <span v-if="beautyHealth[question.key] === 'yes'" class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      {{ $t('common.yes') }}
                    </span>
                    <span v-else-if="beautyHealth[question.key] === 'no'" class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                      {{ $t('common.no') }}
                    </span>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-500">
                    <template v-if="question.detailKey && beautyHealth[question.detailKey]">
                      {{ beautyHealth[question.detailKey] }}
                    </template>
                    <template v-else-if="question.extraDateKey && beautyHealth[question.extraDateKey]">
                      <div class="text-xs">
                        {{ $t('common.date') }}: {{ formatDate(beautyHealth[question.extraDateKey]) }}
                      </div>
                      <div v-if="question.detailKey && beautyHealth[question.detailKey]" class="mt-1">
                        {{ beautyHealth[question.detailKey] }}
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
          <div v-if="beautyHealth.medications" class="mt-6">
            <label class="text-xs font-medium text-gray-500">{{ $t('memberCreate.medications') }}</label>
            <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ beautyHealth.medications }}</p>
          </div>
        </div>
      </section>

      <!-- Kirishlar tarixi -->
      <section v-if="!isEditing" class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('memberDetail.checkinHistory') }}</h2>
          <p class="text-sm text-gray-500">{{ $t('memberDetail.checkinTotal') }}: {{ checkins.length }} {{ $t('memberDetail.checkins') }}</p>
        </div>
        <div v-if="checkins.length === 0" class="px-6 py-6 text-center text-sm text-gray-500">{{ $t('memberDetail.noCheckins') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">{{ $t('checkins.columns.dateTime') }}</th>
                <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('checkins.columns.verifiedBy') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="checkin in checkins" :key="checkin.id" class="hover:bg-gray-50">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">{{ formatDateTime(checkin.date) }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ checkin.verifiedBy || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Go'zallik xizmatlari -->
      <section v-if="!isEditing" class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('memberDetail.beautyServices') }}</h2>
          <p class="text-sm text-gray-500">{{ $t('memberDetail.beautyTotal') }}: {{ beautyServices.length }} {{ $t('memberDetail.services') }}</p>
        </div>
        <div v-if="beautyServices.length === 0" class="px-6 py-6 text-center text-sm text-gray-500">{{ $t('memberDetail.noServices') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">{{ $t('memberDetail.serviceName') }}</th>
                <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('memberDetail.serviceDate') }}</th>
                <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ $t('memberDetail.note') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="service in beautyServices" :key="service.id" class="hover:bg-gray-50">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{{ service.serviceName }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDate(service.serviceDate) }}</td>
                <td class="px-3 py-4 text-sm text-gray-500">{{ service.note || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'
import { formatDate, formatDateTime } from '../lib/dateUtils'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

type Member = {
  id: number
  fullName: string
  phone: string
  qrCodeId: string
  birthDate?: string
  joinDate?: string
  gymStart?: string
  gymEnd?: string
  gymActive: number
  beautyHasRecord?: number
  synced?: number
  lastUpdated?: string
  photo?: string | null
}

type Checkin = {
  id: number
  date: string
  verifiedBy?: string
}

type BeautyService = {
  id: number
  serviceName: string
  serviceDate: string
  note?: string
}

type GymInfo = {
  id?: number
  memberId: number
  emergencyName?: string
  emergencyPhone?: string
  emergencyRelation?: string
  medicalConditions?: string
  medications?: string
  fitnessGoals?: string
  membershipType?: string
  membershipTypeOther?: string
  paymentMethod?: string
  paymentMethodOther?: string
}

type BeautyHealth = {
  [key: string]: any
  id?: number
  memberId: number
  bloodPressure?: string | null
  diabetes?: string | null
  cancer?: string | null
  cancerDetails?: string
  cancerTreatment?: string | null
  cancerTreatmentDetails?: string
  hormonal?: string | null
  thyroid?: string | null
  skin?: string | null
  skinDetails?: string
  alcohol?: string | null
  prosthesis?: string | null
  platinum?: string | null
  implants?: string | null
  crowns?: string | null
  surgery?: string | null
  surgeryDetails?: string
  surgeryDate?: string
  smoking?: string | null
  medications?: string
}

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

const member = ref<Member | null>(null)
const checkins = ref<Checkin[]>([])
const beautyServices = ref<BeautyService[]>([])
const gymInfo = ref<GymInfo | null>(null)
const beautyHealth = ref<BeautyHealth | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Edit mode
const isEditing = ref(false)
const updating = ref(false)
const updateError = ref<string | null>(null)
const updateSuccess = ref<string | null>(null)
const photoPreview = ref<string | null>(null)
const editForm = ref({
  fullName: '',
  phone: '',
  qrCodeId: '',
  birthDate: '',
  joinDate: '',
  email: '',
  region: '',
  district: '',
  gymStart: '',
  gymEnd: '',
  gymActive: 1,
  photo: null as File | null
})

const memberId = computed(() => Number(route.params.id))

const fetchMember = async () => {
  loading.value = true
  error.value = null
  try {
    const [memberRes, checkinsRes, beautyRes, gymRes, healthRes] = await Promise.all([
      api.get<Member>(`/members/${memberId.value}`),
      api.get<Checkin[]>(`/checkins/member/${memberId.value}`).catch(() => ({ data: [] })),
      api.get<BeautyService[]>(`/beauty/member/${memberId.value}`).catch(() => ({ data: [] })),
      // Vaqtincha o'chirilgan - backend endpoint kutilmoqda
      // api.get<GymInfo>(`/members/${memberId.value}/gym-info`).catch((err) => {
      //   console.log('Gym info not found:', err?.response?.status)
      //   return { data: null }
      // }),
      // api.get<BeautyHealth>(`/members/${memberId.value}/beauty-health`).catch((err) => {
      //   console.log('Beauty health not found:', err?.response?.status)
      //   return { data: null }
      // })
      Promise.resolve({ data: null }), // gymInfo
      Promise.resolve({ data: null })  // beautyHealth
    ])
    member.value = memberRes.data
    checkins.value = checkinsRes.data || []
    beautyServices.value = beautyRes.data || []
    gymInfo.value = gymRes.data
    beautyHealth.value = healthRes.data
    // console.log('Fetched data:', { gymInfo: gymInfo.value, beautyHealth: beautyHealth.value })
  } catch (err: any) {
    console.error('Error fetching member:', err)
    if (err?.response?.status !== 404) {
      error.value = t('memberDetail.errorLoading')
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchMember)

// formatDate va formatDateTime funksiyalari utility'dan import qilingan

const onDeleteMember = async () => {
  const ok = window.confirm(t('memberDetail.deleteConfirm'))
  if (!ok) return
  try {
    await api.delete(`/members/${memberId.value}`)
    router.push('/members')
  } catch (err: any) {
    console.error(err)
    window.alert(err?.response?.data?.error || t('memberDetail.deleteError'))
  }
}

const startEdit = () => {
  if (!member.value) return
  
  // Form'ni mavjud ma'lumotlar bilan to'ldirish
  editForm.value = {
    fullName: member.value.fullName || '',
    phone: member.value.phone || '',
    qrCodeId: member.value.qrCodeId || '',
    birthDate: member.value.birthDate ? member.value.birthDate.split('T')[0] : '',
    joinDate: member.value.joinDate ? member.value.joinDate.split('T')[0] : '',
    email: (member.value as any).email || '',
    region: (member.value as any).region || '',
    district: (member.value as any).district || '',
    gymStart: member.value.gymStart ? member.value.gymStart.split('T')[0] : '',
    gymEnd: member.value.gymEnd ? member.value.gymEnd.split('T')[0] : '',
    gymActive: member.value.gymActive || 0,
    photo: null
  }
  
  photoPreview.value = member.value.photo || null
  isEditing.value = true
  updateError.value = null
  updateSuccess.value = null
}

const cancelEdit = () => {
  isEditing.value = false
  updateError.value = null
  updateSuccess.value = null
  photoPreview.value = null
  editForm.value.photo = null
}

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) {
    photoPreview.value = member.value?.photo || null
    editForm.value.photo = null
    return
  }

  // Fayl hajmini tekshirish (5MB)
  if (file.size > 5 * 1024 * 1024) {
    updateError.value = t('memberCreate.photoSizeError')
    target.value = ''
    return
  }

  // Fayl formatini tekshirish
  if (!file.type.startsWith('image/')) {
    updateError.value = t('memberCreate.photoFormatError')
    target.value = ''
    return
  }

  // Base64 formatiga o'tkazish
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    photoPreview.value = result
    editForm.value.photo = file
  }
  reader.onerror = () => {
    updateError.value = t('memberCreate.photoReadError')
    target.value = ''
  }
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  photoPreview.value = member.value?.photo || null
  editForm.value.photo = null
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

const handleUpdate = async () => {
  updating.value = true
  updateError.value = null
  updateSuccess.value = null

  try {
    // Photo'ni base64 formatiga o'tkazish
    let photoBase64 = null
    if (editForm.value.photo) {
      const reader = new FileReader()
      photoBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(editForm.value.photo!)
      })
    } else if (photoPreview.value && photoPreview.value.startsWith('data:')) {
      photoBase64 = photoPreview.value
    } else if (member.value?.photo) {
      photoBase64 = member.value.photo
    }

    const updateData = {
      fullName: editForm.value.fullName,
      phone: editForm.value.phone,
      qrCodeId: editForm.value.qrCodeId,
      birthDate: editForm.value.birthDate || null,
      joinDate: editForm.value.joinDate,
      email: editForm.value.email || null,
      region: editForm.value.region || null,
      district: editForm.value.district || null,
      gymStart: editForm.value.gymStart || null,
      gymEnd: editForm.value.gymEnd || null,
      gymActive: editForm.value.gymActive,
      photo: photoBase64
    }

    await api.put(`/members/${memberId.value}`, updateData)
    
    updateSuccess.value = t('common.success')
    
    // Ma'lumotlarni yangilash
    await fetchMember()
    
    // 2 soniyadan keyin edit mode'dan chiqish
    setTimeout(() => {
      isEditing.value = false
      updateSuccess.value = null
    }, 2000)
  } catch (err: any) {
    console.error('Update error:', err)
    updateError.value = err?.response?.data?.error || t('common.error')
  } finally {
    updating.value = false
  }
}
</script>

<style scoped>
.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.input {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #111827;
}

.input::placeholder {
  color: #9ca3af;
}

.input:focus {
  border-color: #0ea5e9;
  outline: none;
  box-shadow: 0 0 0 1px #0ea5e9;
}
:global(.dark) .input-label {
  color: var(--app-text-muted);
}
:global(.dark) .input {
  color: var(--app-input-text);
  border-color: var(--app-input-border);
}
:global(.dark) .input::placeholder {
  color: var(--app-text-muted);
}
</style>
