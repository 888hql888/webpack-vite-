import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

function loadLocaleMessages() {
  const locales = import.meta.globEager('./lang/*.json')
  const messages = {}
  Object.entries(locales).forEach(([fileName, fileCtx]) => {
    fileName = fileName.replace('./lang/', './')
    const matched = fileName.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const key = fileName.replace('./', '').replace('.json', '')
      messages[key] = fileCtx.default
    }
  })
  return messages
}

export default new VueI18n({
  locale: import.meta.env.VUE_APP_I18N_LOCALE || 'zh',
  fallbackLocale: import.meta.env.VUE_APP_I18N_FALLBACK_LOCALE || 'zh',
  messages: loadLocaleMessages()
})
