import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink, LogOut } from "lucide-react";
import { useShopBySlug, useShopsLoading } from "@/store/shopsStore";
import { signOut, useSession } from "@/store/authStore";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/layout/PageLoader";
import { ShopProfileForm } from "@/components/admin/ShopProfileForm";
import { ServiceEditor } from "@/components/admin/ServiceEditor";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { OrderEditor } from "@/components/admin/OrderEditor";

type Tab = "profile" | "services" | "products" | "orders";

export function ShopAdminPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const shop = useShopBySlug(slug);
  const shopsLoading = useShopsLoading();
  const { session, profile, initializing } = useSession();
  usePageTitle(shop ? `${shop.name} — Admin` : "Admin");
  const [tab, setTab] = useState<Tab>("profile");

  if (initializing || shopsLoading) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace />;

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

  const isSuperadmin = profile?.role === "superadmin";
  const isOwner = profile?.role === "admin" && shop.ownerId === profile.id;
  if (!isSuperadmin && !isOwner) {
    return <Navigate to="/" replace />;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: t("admin.shopProfile") },
    { id: "services", label: t("admin.services") },
    { id: "products", label: t("admin.products") },
    { id: "orders", label: t("admin.orders") },
  ];

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-900/5 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-ink-900">{shop.name}</h1>
            {shop.status === "pending" && (
              <Badge variant="gold">{t("admin.statusPending")}</Badge>
            )}
            {shop.status === "rejected" && (
              <Badge variant="outline" className="border-red-300 text-red-600">
                {t("admin.statusRejected")}
              </Badge>
            )}
          </div>
          <p className="text-sm text-ink-700/60">{t("admin.shopAdminSubtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/shop/${shop.slug}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-4 w-4" />
              {t("admin.viewLivePage")}
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
            {t("admin.logout")}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setTab(tabItem.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === tabItem.id
                ? "bg-maroon-600 text-cream-50"
                : "bg-white text-ink-700/70 hover:bg-maroon-50",
            )}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "profile" && <ShopProfileForm shop={shop} />}
        {tab === "services" && <ServiceEditor shop={shop} />}
        {tab === "products" && <ProductEditor shop={shop} />}
        {tab === "orders" && <OrderEditor shop={shop} />}
      </div>
    </Container>
  );
}
