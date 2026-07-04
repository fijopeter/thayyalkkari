import { useTranslation } from "react-i18next";
import { Mail, Phone } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";

export function ContactPage() {
  const { t } = useTranslation();
  usePageTitle(t("contactPage.title"));

  const faqs = [
    { q: t("contactPage.faq1Q"), a: t("contactPage.faq1A") },
    { q: t("contactPage.faq2Q"), a: t("contactPage.faq2A") },
  ];

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        align="center"
        title={t("contactPage.title")}
        subtitle={t("contactPage.subtitle")}
        className="mx-auto"
      />

      <div className="mx-auto mt-8 flex max-w-md flex-col gap-4 sm:flex-row sm:justify-center">
        <Card className="flex flex-1 items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon-100 text-maroon-700">
            <Mail className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-xs text-ink-700/50">{t("contactPage.emailLabel")}</p>
            <p className="text-sm font-medium text-ink-900">support@thayyalkkari.app</p>
          </div>
        </Card>
        <Card className="flex flex-1 items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon-100 text-maroon-700">
            <Phone className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-xs text-ink-700/50">{t("contactPage.phoneLabel")}</p>
            <p className="text-sm font-medium text-ink-900">+91 90000 00000</p>
          </div>
        </Card>
      </div>

      <div className="mx-auto mt-12 max-w-2xl">
        <h3 className="text-center font-display text-xl font-semibold text-ink-900">
          {t("contactPage.helpTitle")}
        </h3>
        <div className="mt-6 space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i} className="p-5">
              <p className="font-medium text-ink-900">{faq.q}</p>
              <p className="mt-1 text-sm text-ink-700/70">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
}
