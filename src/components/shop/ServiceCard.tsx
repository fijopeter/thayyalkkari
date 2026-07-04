import { useTranslation } from "react-i18next";
import { Clock, Tag } from "lucide-react";
import type { ShopService } from "@/types";
import { useLang } from "@/hooks/useLang";
import { t as tl } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";

export function ServiceCard({ service, index = 0 }: { service: ShopService; index?: number }) {
  const { t } = useTranslation();
  const { lang } = useLang();

  return (
    <Reveal index={index} className="h-full">
      <TiltCard className="h-full">
        <Card className="p-5 h-full flex flex-col">
          <h3 className="font-display text-base font-semibold text-ink-900">
            {tl(service.title, lang)}
          </h3>
          <p className="mt-1.5 flex-1 text-sm text-ink-700/70">
            {tl(service.description, lang)}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink-900/5 pt-3 text-xs text-ink-700/60">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-maroon-500" />
              {t("shopPage.estimatedDelivery")}: {service.estimatedDays}
            </span>
            {service.priceRange && (
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-gold-600" />
                {service.priceRange}
              </span>
            )}
          </div>
        </Card>
      </TiltCard>
    </Reveal>
  );
}
