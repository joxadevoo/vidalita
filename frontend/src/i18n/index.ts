import { createI18n } from 'vue-i18n'
import uz from './locales/uz.json'
import tr from './locales/tr.json'
import ru from './locales/ru.json'
import en from './locales/en.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'uz',
  fallbackLocale: 'uz',
  messages: {
    uz,
    tr,
    ru,
    en
  }
})

export default i18n

