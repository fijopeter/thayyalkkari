import { useTranslation } from "react-i18next";
import { Star, BadgeCheck } from "lucide-react";
import type { ShopReview } from "@/types";
import { useLang } from "@/hooks/useLang";
import { t as tl } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

export function ReviewCard({ review, index = 0 }: { review: ShopReview; index?: number }) {
  const { t } = useTranslation();
  const { lang } = useLang();

  return (
    <Reveal index={index} className="h-full">
      <Card className="p-5 h-full flex flex-col">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < review.rating ? "fill-gold-500 text-gold-500" : "text-ink-900/10",
              )}
            />
          ))}
        </div>
        <p className="mt-3 flex-1 text-sm text-ink-700/80">“{tl(review.comment, lang)}”</p>
        <div className="mt-4 flex items-center gap-1.5 border-t border-ink-900/5 pt-3 text-sm font-medium text-ink-900">
          {review.customerName}
          <span className="flex items-center gap-1 text-xs font-normal text-emerald-600">
            <BadgeCheck className="h-3.5 w-3.5" /> {t("reviews.verified")}
          </span>
        </div>
      </Card>
    </Reveal>
  );
}
