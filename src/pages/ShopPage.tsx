import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Mail,
  Award,
  Star,
} from "lucide-react";
import { useShopBySlug } from "@/store/shopsStore";
import { useLang } from "@/hooks/useLang";
import { t as tl } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";
import { buildShopEnquiryWhatsAppUrl } from "@/lib/whatsapp";
import { handleImageError } from "@/lib/image";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/shop/ServiceCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { ReviewCard } from "@/components/shop/ReviewCard";
import { ShowcaseMarquee } from "@/components/shop/ShowcaseMarquee";
import { StitchingRequestForm } from "@/components/shop/StitchingRequestForm";

export function ShopPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { lang } = useLang();
  const shop = useShopBySlug(slug);

  const bannerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ["start start", "end start"],
  });
  const bannerY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  usePageTitle(shop?.name);

  if (!shop) {
    return (
      <Container className="py-24 text-center">
        <p className="text-lg font-medium text-ink-900">{t("shopPage.notFound")}</p>
        <Link to="/shops" className="mt-4 inline-block">
          <Button variant="outline">{t("shopsSection.viewAll")}</Button>
        </Link>
      </Container>
    );
  }

  const whatsappUrl = buildShopEnquiryWhatsAppUrl(shop);

  return (
    <div>
      {/* Hero / Banner */}
      <section className="relative">
        <div ref={bannerRef} className="h-56 w-full overflow-hidden sm:h-72 lg:h-80">
          <motion.img
            src={shop.bannerImage}
            alt={shop.name}
            style={{ y: bannerY }}
            onError={handleImageError}
            className="h-[calc(100%+90px)] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
        </div>

        <Container>
          <div className="relative -mt-16 pb-6 sm:-mt-20">
            <Card className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start gap-5">
                {shop.logoImage && (
                  <img
                    src={shop.logoImage}
                    alt={`${shop.name} logo`}
                    onError={handleImageError}
                    className="-mt-14 h-16 w-16 shrink-0 rounded-full object-cover ring-4 ring-white shadow-soft sm:-mt-16 sm:h-20 sm:w-20"
                  />
                )}
                <div className="flex flex-1 flex-wrap items-start justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {shop.badges?.map((badge, i) => (
                      <Badge key={i} variant="gold" className="gap-1">
                        <Award className="h-3 w-3" />
                        {tl(badge, lang)}
                      </Badge>
                    ))}
                  </div>
                  <h1 className="mt-3 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                    {shop.name}
                  </h1>
                  {shop.malayalamName && (
                    <p className="text-ink-700/60">{shop.malayalamName}</p>
                  )}
                  <p className="mt-2 max-w-xl text-ink-700/80">{tl(shop.tagline, lang)}</p>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-700/70">
                    <span className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
                      {shop.rating} ({shop.reviewCount})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {tl(shop.address, lang)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {tl(shop.workingHours.days, lang)} ·{" "}
                      {shop.workingHours.hours}
                    </span>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto">
                  {shop.showWhatsapp && (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="whatsapp" className="w-full gap-2 sm:w-auto">
                        <MessageCircle className="h-4 w-4" />
                        {t("shopPage.chatEnquire")}
                      </Button>
                    </a>
                  )}
                  {shop.showCall && (
                    <a href={`tel:${shop.phone}`}>
                      <Button variant="outline" className="w-full gap-2 sm:w-auto">
                        <Phone className="h-4 w-4" />
                        {t("shopPage.callNow")}
                      </Button>
                    </a>
                  )}
                  {shop.showEmail && shop.email && (
                    <a href={`mailto:${shop.email}`}>
                      <Button variant="outline" className="w-full gap-2 sm:w-auto">
                        <Mail className="h-4 w-4" />
                        {t("shopPage.emailShop")}
                      </Button>
                    </a>
                  )}
                  <Link
                    to={`/shop/${shop.slug}/admin`}
                    className="text-center text-xs text-ink-700/40 hover:text-maroon-700 hover:underline"
                  >
                    {t("shopPage.manageThisShop")}
                  </Link>
                </div>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* About */}
      <Container className="py-10">
        <SectionHeading title={t("shopPage.aboutHeading")} />
        <p className="mt-4 max-w-3xl text-ink-700/80">{tl(shop.description, lang)}</p>
        <p className="mt-3 text-sm text-ink-700/60">
          {shop.yearsOfExperience}+ {t("shopPage.yearsExperience")}
        </p>

        <p className="mt-6 mb-2 text-sm font-semibold uppercase tracking-wide text-ink-700/50">
          {t("shopPage.specialtiesHeading")}
        </p>
        <div className="flex flex-wrap gap-2">
          {shop.categories.map((c, i) => (
            <Badge key={i} variant="maroon">
              {tl(c, lang)}
            </Badge>
          ))}
        </div>
      </Container>

      {/* Showcase / Gallery */}
      {shop.showcaseImages.length > 0 && (
        <section className="py-10">
          <Container>
            <SectionHeading title={t("shopPage.showcaseHeading")} />
          </Container>
          <div className="mt-6">
            <ShowcaseMarquee images={shop.showcaseImages} />
          </div>
        </section>
      )}

      {/* Services */}
      <section className="bg-maroon-50/40 py-12">
        <Container>
          <SectionHeading title={t("shopPage.servicesHeading")} />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shop.services.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        </Container>
      </section>

      {/* Stitching Request Form */}
      <Container className="py-12">
        <SectionHeading
          title={t("shopPage.requestFormHeading")}
          subtitle={t("shopPage.requestFormSubheading")}
        />
        <Card className="mt-8 max-w-2xl p-6 sm:p-8">
          <StitchingRequestForm shop={shop} />
        </Card>
      </Container>

      {/* Products for sale */}
      {shop.products.length > 0 && (
        <section className="bg-maroon-50/40 py-12">
          <Container>
            <SectionHeading title={t("shopPage.productsHeading")} />
            <div className="mt-8 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
              {shop.products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  shop={shop}
                  showShopName={false}
                  index={i}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Reviews */}
      {shop.reviews.length > 0 && (
        <Container className="py-12">
          <SectionHeading title={t("shopPage.reviewsHeading")} />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shop.reviews.map((review, i) => (
              <ReviewCard key={review.id} review={review} index={i} />
            ))}
          </div>
        </Container>
      )}
    </div>
  );
}
