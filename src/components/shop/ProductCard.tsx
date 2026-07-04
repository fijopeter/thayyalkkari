import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageCircle, Store } from "lucide-react";
import type { Shop, ShopProduct } from "@/types";
import { useLang } from "@/hooks/useLang";
import { t as tl } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { buildProductEnquiryWhatsAppUrl } from "@/lib/whatsapp";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { handleImageError } from "@/lib/image";

export function ProductCard({
  product,
  shop,
  showShopName = true,
  index = 0,
}: {
  product: ShopProduct;
  shop: Shop;
  showShopName?: boolean;
  index?: number;
}) {
  const { t } = useTranslation();
  const { lang } = useLang();
  const whatsappUrl = buildProductEnquiryWhatsAppUrl(shop, product, lang);

  return (
    <Reveal index={index} className="h-full">
    <TiltCard className="h-full">
      <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={tl(product.name, lang)}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {product.size && (
          <Badge variant="outline" className="absolute top-2.5 right-2.5 bg-white/90">
            {product.size}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Badge variant="gold" className="w-fit">
          {tl(product.category, lang)}
        </Badge>
        <h3 className="mt-2 font-display text-base font-semibold text-ink-900">
          {tl(product.name, lang)}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-700/70">
          {tl(product.description, lang)}
        </p>

        {showShopName && (
          <Link
            to={`/shop/${shop.slug}`}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-maroon-700 hover:underline"
          >
            <Store className="h-3.5 w-3.5" /> {shop.name}
          </Link>
        )}

        <div className="mt-3 flex-1 flex items-end justify-between gap-2 pt-2">
          <span className="font-semibold text-ink-900">
            {product.enquiryOnly || !product.price
              ? t("dressesSection.enquireForPrice")
              : formatCurrency(product.price, lang)}
          </span>
        </div>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block">
          <Button variant="whatsapp" size="sm" className="w-full gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {t("dressesSection.enquire")}
          </Button>
        </a>
      </div>
      </Card>
    </TiltCard>
    </Reveal>
  );
}
