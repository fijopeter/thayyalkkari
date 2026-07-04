import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CheckCircle2, Store, User, Shirt, CalendarDays } from "lucide-react";
import type { TrackingOrder } from "@/types";
import { useLang } from "@/hooks/useLang";
import { t as tl } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { useShopById } from "@/store/shopsStore";
import { isOrderComplete } from "@/lib/tracking";
import { Card, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { StatusStepper } from "@/components/tracking/StatusStepper";

export function TrackingResult({ order }: { order: TrackingOrder }) {
  const { t } = useTranslation();
  const { lang } = useLang();
  const shop = useShopById(order.shopId);
  const complete = isOrderComplete(order.status);

  const infoRows = [
    { icon: User, label: t("trackResult.customerName"), value: order.customerName },
    { icon: Store, label: t("trackResult.shop"), value: shop?.name ?? "—" },
    { icon: Shirt, label: t("trackResult.itemType"), value: tl(order.itemType, lang) },
    { icon: CalendarDays, label: t("trackResult.orderDate"), value: formatDate(order.orderDate, lang) },
    {
      icon: CalendarDays,
      label: t("trackResult.expectedDate"),
      value: formatDate(order.expectedDate, lang),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="overflow-hidden">
        <div className="bg-maroon-700 px-6 py-5 text-cream-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-cream-100/60">{order.code}</p>
              <p className="mt-0.5 text-lg font-semibold">
                {t(`orderStatus.${order.status}`)}
              </p>
            </div>
            {complete && (
              <Badge variant="success" className="gap-1 bg-white/15 text-cream-50">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {order.status === "delivered"
                  ? t("trackResult.deliveredBadge")
                  : t("trackResult.completedBadge")}
              </Badge>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-cream-100/70">
              <span>{t("trackResult.progress")}</span>
              <span>{order.progressPercent}%</span>
            </div>
            <Progress value={order.progressPercent} className="mt-1.5 bg-white/15" />
          </div>
        </div>

        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-maroon-500" />
                <div>
                  <p className="text-xs text-ink-700/50">{row.label}</p>
                  <p className="text-sm font-medium text-ink-900">{row.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-700/50">
              {t("trackResult.timeline")}
            </p>
            <StatusStepper steps={order.timelineSteps} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
