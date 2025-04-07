import "i18next";
import enTranslation from "../locales/en/translation.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: typeof enTranslation;
    };
  }
}
