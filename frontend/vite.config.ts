import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {
    host: true,
    port: 2007
  },
  build: {
    // Code splitting va optimizatsiya
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'vue-i18n'],
          'ui-vendor': ['@heroicons/vue'],
          'utils': ['axios']
        }
      }
    },
    // Chunk size limit
    chunkSizeWarningLimit: 1000,
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Production'da console.log'larni olib tashlash
        drop_debugger: true
      }
    }
  },
  // Optimizatsiya
  optimizeDeps: {
    include: ['vue', 'vue-router', 'vue-i18n', 'axios']
  }
})




