import i18nInstance from 'miniprogram-i18n-plus'
import zh from './config/zh'
import en from './config/en'

const i18n = (language) => {
  const lang = language ? language.substring(0, 2).toLowerCase() : 'zh'
  wx.setStorageSync('language', lang)
  const locales = {
    zh,
    en,
  }
  i18nInstance.setLocale(lang)
  i18nInstance.loadTranslations(locales)
}

export default i18n
