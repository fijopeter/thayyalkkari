import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useShops } from "@/store/shopsStore";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShopCard } from "@/components/shop/ShopCard";

export function ShopsSection() {
  const { t } = useTranslation();
  const shops = useShops();
  const featured = shops.slice(0, 3);

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            title={t("shopsSection.heading")}
            subtitle={t("shopsSection.subheading")}
          />
          <Link
            to="/shops"
            className="flex items-center gap-1 text-sm font-semibold text-maroon-700 hover:underline"
          >
            {t("shopsSection.viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((shop, i) => (
            <ShopCard key={shop.id} shop={shop} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
