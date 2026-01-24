<template>
  <nav class="flex flex-1 flex-col">
    <ul class="flex flex-1 flex-col gap-y-7">
      <li>
        <ul class="-mx-2 space-y-1">
          <li v-for="item in navigation" :key="item.href">
            <RouterLink
              :to="item.href"
              class="group flex items-center gap-x-3 rounded-md p-2 text-sm font-medium"
              :class="isActive(item.href) ? 'bg-sky-50 text-sky-600' : 'text-gray-700 hover:bg-gray-50 hover:text-sky-600'"
              @click="$emit('navigate')"
            >
              <component :is="item.icon" class="h-5 w-5 text-gray-400 group-hover:text-sky-600" :class="isActive(item.href) ? 'text-sky-500' : ''" />
              <span>{{ item.name }}</span>
            </RouterLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { HomeIcon, UsersIcon, ClockIcon, ScissorsIcon, QrCodeIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const isActive = (href: string) => route.path === href

const navigation = [
  { name: 'Bosh sahifa', href: '/', icon: HomeIcon },
  { name: "A'zolar", href: '/members', icon: UsersIcon },
  { name: 'Kirishlar', href: '/checkins', icon: ClockIcon },
  { name: "Go'zallik xizmatlari", href: '/beauty', icon: ScissorsIcon },
  { name: 'Barcode', href: '/barcode', icon: QrCodeIcon },
  { name: 'Sozlamalar', href: '/settings', icon: Cog6ToothIcon }
]
</script>

