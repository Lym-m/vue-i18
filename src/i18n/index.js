import { createI18n } from "vue-i18n";
import store from "@/store";
import zh from "./languages/zh/index";
import en from "./languages/en/index";

function getLanguage(){
  return store && store.state.language.language
}

const i18n = createI18n({
  locale: getLanguage() || (navigator.language || navigator.browserLanguage).toLowerCase() === 'zh-cn' ? 'zh' : 'en',
  messages: {
    'zh': zh,
    'en': en,
  },
  globalInjection: true,
  legacy: false,
  // silentTranslationWarn: true,
})

export default i18n;