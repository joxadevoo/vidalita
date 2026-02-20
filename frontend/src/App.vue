<template>
  <!-- Login page - sidebar va topbar yo'q -->
  <div v-if="isLoginPage" class="min-h-screen">
    <RouterView />
  </div>
  
  <!-- Boshqa sahifalar - sidebar va topbar bilan -->
  <div v-else class="min-h-screen bg-gray-50 print:min-h-0">
    <Sidebar 
      :is-open="sidebarOpen" 
      :collapsed="sidebarCollapsed"
      @close="handleSidebarClose" 
      @toggle="handleSidebarToggle"
      @toggle-collapse="handleSidebarCollapse"
    />
    <div 
      :class="[
        'transition-all duration-300 print:pl-0 print:overflow-visible print:static',
        !isMobile
          ? (sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72') 
          : 'lg:pl-0'
      ]"
    >
      <TopBar 
        :sidebar-open="sidebarOpen" 
        :sidebar-collapsed="sidebarCollapsed"
        @menu="handleSidebarToggle" 
      />
      <div class="flex flex-col pt-16 h-screen print:h-auto print:pt-0 print:overflow-visible print:static">
        <main class="flex-1 overflow-y-auto p-4 md:p-6 print:p-0 print:overflow-visible print:static">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')

// localStorage'dan sidebar holatini yuklash
const loadSidebarState = () => {
  const savedOpen = localStorage.getItem('sidebarOpen')
  const savedCollapsed = localStorage.getItem('sidebarCollapsed')
  
  if (savedOpen !== null) {
    sidebarOpen.value = savedOpen === 'true'
  }
  if (savedCollapsed !== null) {
    sidebarCollapsed.value = savedCollapsed === 'true'
  }
}

// Sidebar holatini localStorage'ga saqlash
const saveSidebarState = () => {
  localStorage.setItem('sidebarOpen', String(sidebarOpen.value))
  localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
}

const sidebarOpen = ref(true)
const sidebarCollapsed = ref(true) // Desktop'da default kichik (collapsed)
const isMobile = ref(false)

// Desktop'da default ochiq, mobile'da yopiq
const checkScreenSize = (isInitialLoad = false) => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 1024
  
  // Agar mobile bo'lsa
  if (isMobile.value) {
    // Birinchi yuklanganda localStorage'dan o'qish, keyin esa saqlangan holatni ishlatish
    if (isInitialLoad) {
      const savedOpen = localStorage.getItem('sidebarOpen')
      if (savedOpen !== null) {
        sidebarOpen.value = savedOpen === 'true'
      } else {
        // Agar saqlangan holat bo'lmasa, default yopiq
        sidebarOpen.value = false
      }
    }
    // Mobile'da resize qilganda, sidebar'ni yopish (lekin localStorage'dan o'qilgan holatni saqlash)
  } else {
    // Desktop'ga o'tganda
    if (wasMobile) {
      // Mobile'dan desktop'ga o'tganda, default ochiq
      sidebarOpen.value = true
    } else if (isInitialLoad) {
      // Desktop'da sidebar har doim ko'rinadi, faqat collapsed holatini yuklash
      sidebarOpen.value = true // Desktop'da har doim ochiq
      const savedCollapsed = localStorage.getItem('sidebarCollapsed')
      if (savedCollapsed !== null) {
        sidebarCollapsed.value = savedCollapsed === 'true'
      } else {
        // Desktop'da default kichik (collapsed)
        sidebarCollapsed.value = true
      }
    }
  }
  
  // Holatni saqlash
  saveSidebarState()
}

// Sidebar ochilish/yopilish holatini kuzatish
const handleSidebarToggle = () => {
  // Desktop'da sidebar har doim ko'rinadi, faqat mobile'da toggle qiladi
  if (isMobile.value) {
    sidebarOpen.value = !sidebarOpen.value
    saveSidebarState()
  }
}

// Sidebar yopilish holatini kuzatish
const handleSidebarClose = () => {
  sidebarOpen.value = false
  saveSidebarState()
}

// Sidebar collapse holatini kuzatish
const handleSidebarCollapse = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  saveSidebarState()
}

const handleResize = () => checkScreenSize(false)

onMounted(() => {
  // Birinchi yuklanganda ekran o'lchamini tekshirish (localStorage bilan)
  checkScreenSize(true)
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

