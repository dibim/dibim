import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import ar from "./locales/ar/translation.json";
import de from "./locales/de/translation.json";
import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";
import fr from "./locales/fr/translation.json";
import it from "./locales/it/translation.json";
import ja from "./locales/ja/translation.json";
import ko from "./locales/ko/translation.json";
import nl from "./locales/nl/translation.json";
import pl from "./locales/pl/translation.json";
import ru from "./locales/ru/translation.json";
import tr from "./locales/tr/translation.json";
import uk from "./locales/uk/translation.json";
import zh_hans from "./locales/zh-hans/translation.json";
import zh_hant from "./locales/zh-hant/translation.json";

/**
 * 根据浏览器语言代码判断使用简体还是繁体
 * @returns {'zh-hans' | 'zh-hant'}
 */
function detectChineseType() {
  // 定义简体/繁体对应的语言代码
  const SIMPLIFIED_CODES = ["zh-cn", "zh-sg", "zh-my", "zh-hans", "zh-hans-cn", "zh-hans-sg"];

  const TRADITIONAL_CODES = ["zh-tw", "zh-hk", "zh-mo", "zh-hant", "zh-hant-tw", "zh-hant-hk", "zh-hant-mo"];

  // 检查每个语言代码
  for (const lang of navigator.languages) {
    const lowerLang = lang.toLowerCase();

    if (SIMPLIFIED_CODES.includes(lowerLang)) {
      return "zh-hans";
    }

    if (TRADITIONAL_CODES.includes(lowerLang)) {
      return "zh-hant";
    }

    // 如果只有通用zh代码，进一步检查时区
    if (lowerLang === "zh") {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (["Asia/Shanghai", "Asia/Singapore", "Asia/Kuala_Lumpur"].some((tz) => timezone.includes(tz))) {
        return "simplified";
      }

      if (["Asia/Taipei", "Asia/Hong_Kong", "Asia/Macau"].some((tz) => timezone.includes(tz))) {
        return "zh-hant";
      }
    }
  }

  return "zh-hans"; // 无法确定
}

const getBrowserLanguage = () => {
  const userLanguage = navigator.language;
  if (userLanguage.startsWith("zh")) {
    return detectChineseType();
  }

  const lang = userLanguage.split("-")[0]; // 简化为语言代码前两位（如 'zh-CN' → 'zh'）
  if (["ar", "de", "en", "es", "fr", "it", "ja", "ko", "nl", "pl", "ru", "tr", "uk"].includes(lang)) {
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
    ar: { translation: ar },
    de: { translation: de },
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    it: { translation: it },
    ja: { translation: ja },
    ko: { translation: ko },
    nl: { translation: nl },
    pl: { translation: pl },
    ru: { translation: ru },
    tr: { translation: tr },
    uk: { translation: uk },
    zh_hans: { translation: zh_hans },
    zh_hant: { translation: zh_hant },
  },
});

// 监听语言变化
i18n.on("languageChanged", (lng) => {
  // TODO:
});

export default i18n;
