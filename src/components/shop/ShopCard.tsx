import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Star, ArrowUpRight } from "lucide-react";
import type { Shop } from "@/types";
import { useLang } from "@/hooks/useLang";
import { t as tl } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { handleImageError } from "@/lib/image";

export function ShopCard({ shop, index = 0 }: { shop: Shop; index?: number }) {
  const { t } = useTranslation();
  const { lang } = useLang();

  return (
    <Reveal index={index} className="h-full">
    <TiltCard className="h-full">
      <Card className="group overflow-hidden h-full flex flex-col">
        <Link to={`/shop/${shop.slug}`} className="relative block aspect-[4/3] overflow-hidden">
          <img
            src={shop.bannerImage}
            alt={shop.name}
            loading="lazy"
            onError={handleImageError}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-900">
            <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
            {shop.rating} <span className="text-ink-700/60">({shop.reviewCount})</span>
          </div>
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <Link to={`/shop/${shop.slug}`} className="flex items-center gap-3">
            {shop.logoImage && (
              <img
                src={shop.logoImage}
                alt=""
                aria-hidden
                onError={handleImageError}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow-soft"
              />
            )}
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-semibold text-ink-900 group-hover:text-maroon-700">
                {shop.name}
              </h3>
              {shop.malayalamName && (
                <p className="truncate text-sm text-ink-700/60">{shop.malayalamName}</p>
              )}
            </div>
          </Link>

          <p className="mt-2 flex items-center gap-1 text-sm text-ink-700/60">
            <MapPin className="h-3.5 w-3.5" /> {shop.location}
          </p>

          <p className="mt-3 line-clamp-2 text-sm text-ink-700/80">
            {tl(shop.description, lang)}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {shop.categories.slice(0, 3).map((c, i) => (
              <Badge key={i} variant="maroon">
                {tl(c, lang)}
              </Badge>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-ink-900/5">
            <Link to={`/shop/${shop.slug}`}>
              <Button className="w-full gap-1.5" size="sm">
                {t("shopCard.visitShop")}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </TiltCard>
    </Reveal>
  );
}
