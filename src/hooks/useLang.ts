import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Language } from "@/types";

/** Returns the current app language and a setter, and keeps <html lang> in sync. */
export function useLang() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split("-")[0] as Language) || "ml";

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Language) => {
    i18n.changeLanguage(next);
  };

  return { lang, setLang };
}
