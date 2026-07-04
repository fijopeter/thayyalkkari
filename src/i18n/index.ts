import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ml from "@/i18n/locales/ml.json";
import en from "@/i18n/locales/en.json";

export const SUPPORTED_LANGUAGES = ["ml", "en"] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ml: { translation: ml },
      en: { translation: en },
    },
    fallbackLng: "ml",
    supportedLngs: SUPPORTED_LANGUAGES,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "thayyalkkari-lang",
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Malayalam is the default language on first visit — only fall back to a
// detected/stored language if one was already explicitly saved.
if (!localStorage.getItem("thayyalkkari-lang")) {
  i18n.changeLanguage("ml");
}

export default i18n;
