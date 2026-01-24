import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './index.css'

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') {
    return saved
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

const initialTheme = getInitialTheme()
document.documentElement.classList.toggle('dark', initialTheme === 'dark')

createApp(App).use(router).use(i18n).mount('#app')



