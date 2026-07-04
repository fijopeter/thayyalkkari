import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AboutPage() {
  const { t } = useTranslation();
  usePageTitle(t("aboutPage.title"));

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading align="center" title={t("aboutPage.title")} className="mx-auto" />

      <div className="mx-auto mt-8 max-w-2xl space-y-4 text-center text-ink-700/80">
        <p>{t("aboutPage.body1")}</p>
        <p>{t("aboutPage.body2")}</p>
      </div>
    </Container>
  );
}
