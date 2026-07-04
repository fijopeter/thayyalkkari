import { useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, XCircle } from "lucide-react";
import { useSession, signOut } from "@/store/authStore";
import { useShopById } from "@/store/shopsStore";
import { dashboardPathForProfile } from "@/lib/dashboardPath";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/layout/PageLoader";

export function PendingApprovalPage() {
  const { t } = useTranslation();
  usePageTitle(t("auth.pendingTitle"));
  const navigate = useNavigate();
  const { session, profile, initializing } = useSession();
  const shop = useShopById(profile?.shopId ?? undefined);

  useEffect(() => {
    if (!initializing && session && profile?.status === "approved" && shop) {
      navigate(dashboardPathForProfile(profile, [shop]), { replace: true });
    }
  }, [initializing, session, profile, shop, navigate]);

  if (initializing) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace />;
  if (profile && !profile.shopId) return <Navigate to="/add-shop" replace />;

  const rejected = profile?.status === "rejected";

  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <Card className="w-full max-w-md p-6 text-center sm:p-8">
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            rejected ? "bg-red-100 text-red-600" : "bg-gold-100 text-gold-600"
          }`}
        >
          {rejected ? <XCircle className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink-900">
          {rejected ? t("auth.rejectedTitle") : t("auth.pendingTitle")}
        </h1>
        <p className="mt-2 text-sm text-ink-700/60">
          {rejected ? t("auth.rejectedMessage") : t("auth.pendingMessage")}
        </p>

        {shop && !rejected && (
          <Link to={`/shop/${shop.slug}/admin`} className="mt-5 inline-block">
            <Button variant="outline">{t("auth.editShopWhilePending")}</Button>
          </Link>
        )}

        <Button variant="ghost" className="mt-3 w-full" onClick={() => signOut()}>
          {t("admin.logout")}
        </Button>
      </Card>
    </Container>
  );
}
