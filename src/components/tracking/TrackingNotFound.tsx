import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function TrackingNotFound() {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-maroon-100 text-maroon-600">
          <SearchX className="h-7 w-7" />
        </span>
        <h3 className="font-display text-lg font-semibold text-ink-900">
          {t("trackingSection.notFoundTitle")}
        </h3>
        <p className="max-w-sm text-sm text-ink-700/60">
          {t("trackingSection.notFoundMessage")}
        </p>
      </Card>
    </motion.div>
  );
}
