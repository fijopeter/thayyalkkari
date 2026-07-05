import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "@/store/authStore";
import { useShops } from "@/store/shopsStore";
import { dashboardPathForProfile } from "@/lib/dashboardPath";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { NewShopForm } from "@/components/admin/NewShopForm";
import { PageLoader } from "@/components/layout/PageLoader";

export function AddShopPage() {
  const { t } = useTranslation();
  usePageTitle(t("auth.addShopTitle"));
  const navigate = useNavigate();
  const { session, profile, initializing } = useSession();
  const shops = useShops();

  useEffect(() => {
    if (!initializing && session && profile?.shopId) {
      navigate(dashboardPathForProfile(profile, shops), { replace: true });
    }
  }, [initializing, session, profile, shops, navigate]);

  if (initializing) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace />;

  return (
    <Container className="py-12 sm:py-16">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" />
          {t("admin.logout")}
        </Button>
      </div>
      <SectionHeading
        align="center"
        title={t("auth.addShopTitle")}
        subtitle={t("auth.addShopSubtitle")}
        className="mx-auto"
      />
      <div className="mx-auto mt-8 max-w-2xl">
        <NewShopForm onCreated={() => navigate("/pending-approval", { replace: true })} />
      </div>
    </Container>
  );
}
