import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import enTranslation from "./locales/en/translation.json";
import zhTranslation from "./locales/zh/translation.json";

const getBrowserLanguage = () => {
  const userLanguage = navigator.language;
  const lang = userLanguage.split("-")[0]; // 简化为语言代码前两位（如 'zh-CN' → 'zh'）
  if (["en", "zh"].includes(lang)) {
    return lang;
  }

  return "en";
};

i18n.use(initReactI18next).init({
  lng: getBrowserLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },

  resources: {
    en: { translation: enTranslation },
    zh: { translation: zhTranslation },
  },
});

export default i18n;
