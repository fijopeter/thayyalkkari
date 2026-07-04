import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PackageSearch } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TrackingSearchBox } from "@/components/tracking/TrackingSearchBox";

export function TrackingSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl rounded-3xl bg-maroon-700 px-6 py-12 text-center text-cream-50 shadow-soft-lg sm:px-12">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <PackageSearch className="h-6 w-6 text-gold-300" />
          </span>
          <h2 className="font-display text-2xl font-semibold text-balance sm:text-3xl">
            {t("trackingSection.heading")}
          </h2>
          <p className="mt-2 text-cream-100/70 text-balance">
            {t("trackingSection.subheading")}
          </p>

          <TrackingSearchBox
            className="mt-7 [&_input]:bg-white [&_input]:text-ink-900"
            onSearch={(code) => navigate(`/track/${encodeURIComponent(code)}`)}
          />

          <p className="mt-4 text-xs text-cream-100/50">
            {t("trackingSection.sampleCodesHint")}
          </p>
        </div>
      </Container>
    </section>
  );
}
