import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useAllProducts } from "@/store/shopsStore";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/shop/ProductCard";

export function DressesSection() {
  const { t } = useTranslation();
  const featured = useAllProducts().slice(0, 4);

  return (
    <section className="bg-maroon-50/40 py-16 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            title={t("dressesSection.heading")}
            subtitle={t("dressesSection.subheading")}
          />
          <Link
            to="/dresses"
            className="flex items-center gap-1 text-sm font-semibold text-maroon-700 hover:underline"
          >
            {t("dressesSection.viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
          {featured.map(({ product, shop }, i) => (
            <ProductCard key={product.id} product={product} shop={shop} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
