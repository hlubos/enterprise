import i18nInstance from 'miniprogram-i18n-plus'
import zh_CN from './config/zh'
import en_US from './config/en'

const i18n = (language) => {
  const lang = language == 'zh_CN' ? language : 'en_US'
  // const lang = 'en_US'
  const locales = {
    zh_CN,
    en_US,
  }
  i18nInstance.setLocale(lang)
  i18nInstance.loadTranslations(locales)
}

export default i18n
