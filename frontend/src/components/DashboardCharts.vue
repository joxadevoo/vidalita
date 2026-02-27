<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Sales Trend Chart -->
    <div class="glass animate-fade-in-scale p-6 transition-all duration-300 hover:shadow-lg">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-black text-black dark:text-white">{{ $t('dashboard.salesTrend') }}</h3>
        <div class="h-8 w-8 rounded-lg bg-green-600/10 flex items-center justify-center text-green-700">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div class="h-[300px] w-full">
        <apexchart
          v-if="!loading"
          type="area"
          height="100%"
          :options="salesOptions"
          :series="salesSeries"
        />
        <div v-else class="flex h-full items-center justify-center">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
        </div>
      </div>
    </div>

    <!-- Visits Trend Chart -->
    <div class="glass animate-fade-in-scale p-6 transition-all duration-300 hover:shadow-lg">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-black text-black dark:text-white">{{ $t('dashboard.visitsTrend') }}</h3>
        <div class="h-8 w-8 rounded-lg bg-sky-600/10 flex items-center justify-center text-sky-700">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      <div class="h-[300px] w-full">
        <apexchart
          v-if="!loading"
          type="bar"
          height="100%"
          :options="visitsOptions"
          :series="visitsSeries"
        />
        <div v-else class="flex h-full items-center justify-center">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { statsService } from '../services/supabaseService'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const loading = ref(true)
const weeklyData = ref<any>({ dates: [], sales: [], checkins: [] })

const isDark = ref(document.documentElement.classList.contains('dark'))

// Watch for theme changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class') {
      isDark.value = document.documentElement.classList.contains('dark')
    }
  })
})

onMounted(() => {
  fetchData()
  observer.observe(document.documentElement, { attributes: true })
})

const fetchData = async () => {
  try {
    loading.value = true
    weeklyData.value = await statsService.getWeeklyStats()
  } catch (err) {
    console.error('Error fetching weekly stats:', err)
  } finally {
    loading.value = false
  }
}

const salesSeries = computed(() => [{
  name: t('dashboard.revenue'),
  data: weeklyData.value.sales
}])

const visitsSeries = computed(() => [{
  name: t('dashboard.visits'),
  data: weeklyData.value.checkins
}])

const commonOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: isDark.value ? '#94a3b8' : '#64748b',
    background: 'transparent'
  },
  grid: {
    borderColor: isDark.value ? '#1e293b' : '#f1f5f9',
    strokeDashArray: 4
  },
  xaxis: {
    categories: weeklyData.value.dates.map((d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString(locale.value, { weekday: 'short' });
    }),
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
  }
}))

const salesOptions = computed(() => ({
  ...commonOptions.value,
  colors: ['#0ea5e9'],
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100]
    }
  },
  dataLabels: { enabled: false },
  yaxis: {
    labels: {
      formatter: (val: number) => new Intl.NumberFormat(locale.value, { notation: 'compact' }).format(val)
    }
  }
}))

const visitsOptions = computed(() => ({
  ...commonOptions.value,
  colors: ['#8b5cf6'],
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '45%',
      distributed: false
    }
  },
  dataLabels: { enabled: false },
  yaxis: {
    tickAmount: 5,
    labels: {
      formatter: (val: number) => Math.floor(val)
    }
  }
}))

defineExpose({ refresh: fetchData })
</script>
