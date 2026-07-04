import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { lookupTrackingCode } from "@/lib/tracking";
import type { TrackingLookupResult } from "@/lib/tracking";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrackingSearchBox } from "@/components/tracking/TrackingSearchBox";
import { TrackingResult } from "@/components/tracking/TrackingResult";
import { TrackingNotFound } from "@/components/tracking/TrackingNotFound";

export function TrackPage() {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle(t("trackingSection.heading"));
  const [result, setResult] = useState<TrackingLookupResult | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!code) {
      setResult(null);
      return;
    }
    let cancelled = false;
    setSearching(true);
    lookupTrackingCode(code).then((next) => {
      if (!cancelled) {
        setResult(next);
        setSearching(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        align="center"
        title={t("trackingSection.heading")}
        subtitle={t("trackingSection.subheading")}
        className="mx-auto"
      />

      <TrackingSearchBox
        className="mx-auto mt-8 max-w-xl"
        initialValue={code ?? ""}
        onSearch={(value) => navigate(`/track/${encodeURIComponent(value)}`)}
      />
      <p className="mt-3 text-center text-xs text-ink-700/50">
        {t("trackingSection.sampleCodesHint")}
      </p>

      <div className="mx-auto mt-10 max-w-3xl">
        {searching && <p className="text-center text-sm text-ink-700/50">{t("common.loading")}</p>}
        {!searching && result?.found && <TrackingResult order={result.order} />}
        {!searching && result && !result.found && <TrackingNotFound />}
      </div>
    </Container>
  );
}
