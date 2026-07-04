import { useTranslation } from "react-i18next";

/** Visually hidden until focused — lets keyboard users jump past the header/nav. */
export function SkipToContent() {
  const { t } = useTranslation();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-maroon-600 focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-cream-50 focus:shadow-soft-lg"
    >
      {t("common.skipToContent")}
    </a>
  );
}
