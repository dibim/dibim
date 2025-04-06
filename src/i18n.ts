import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import enTranslation from "./locales/en/translation.json";
import zhTranslation from "./locales/zh/translation.json";

i18n.use(initReactI18next).init({
  lng: "zh",
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
