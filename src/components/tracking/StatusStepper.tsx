import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import type { TimelineStep } from "@/types";
import { useLang } from "@/hooks/useLang";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StatusStepper({ steps }: { steps: TimelineStep[] }) {
  const { t } = useTranslation();
  const { lang } = useLang();

  const doneCount = steps.filter((step) => step.done).length;
  const fillFraction =
    steps.length > 1 ? Math.max(0, (doneCount - 1) / (steps.length - 1)) : doneCount > 0 ? 1 : 0;

  return (
    <ol className="relative ml-3 border-l-2 border-dashed border-ink-900/10">
      <motion.div
        aria-hidden
        className="absolute -left-0.5 top-0 w-0.5 origin-top bg-gradient-to-b from-gold-500 to-maroon-600"
        style={{ height: "100%" }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: fillFraction }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      {steps.map((step, index) => (
        <motion.li
          key={step.status}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.06 }}
          className="relative pb-7 pl-6 last:pb-0"
        >
          <motion.span
            initial={{ scale: 0.6 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 + 0.15, type: "spring", stiffness: 400, damping: 18 }}
            className={cn(
              "absolute -left-[11px] top-0 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-cream-50",
              step.done ? "bg-maroon-600 text-white" : "bg-ink-900/10 text-ink-900/30",
            )}
          >
            {step.done && <Check className="h-3 w-3" />}
          </motion.span>
          <p
            className={cn(
              "text-sm font-medium",
              step.done ? "text-ink-900" : "text-ink-700/40",
            )}
          >
            {t(`orderStatus.${step.status}`)}
          </p>
          {step.date && (
            <p className="text-xs text-ink-700/50">{formatDate(step.date, lang)}</p>
          )}
        </motion.li>
      ))}
    </ol>
  );
}
