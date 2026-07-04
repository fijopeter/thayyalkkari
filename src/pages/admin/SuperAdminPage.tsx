import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Database, ExternalLink, LogOut, Settings, Trash2, X } from "lucide-react";
import type { Shop } from "@/types";
import { deleteShop, setShopApproval, useShops, useShopsLoading } from "@/store/shopsStore";
import { useOrders } from "@/store/ordersStore";
import { signOut, useSession } from "@/store/authStore";
import { supabase } from "@/lib/supabaseClient";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { PageLoader } from "@/components/layout/PageLoader";

// Supabase's free-tier Postgres storage limit, in bytes. Update if your plan differs.
const FREE_TIER_LIMIT_BYTES = 500 * 1024 * 1024;

function DbStorageWidget() {
  const { t } = useTranslation();
  const [bytes, setBytes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc("get_database_size").then(({ data, error: err }) => {
      if (err) setError(err.message);
      else setBytes(Number(data));
    });
  }, []);

  const usedMb = bytes !== null ? (bytes / (1024 * 1024)).toFixed(1) : null;
  const limitMb = Math.round(FREE_TIER_LIMIT_BYTES / (1024 * 1024));
  const percent = bytes !== null ? Math.min(100, (bytes / FREE_TIER_LIMIT_BYTES) * 100) : 0;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Database className="h-4 w-4 text-maroon-600" />
        {t("admin.dbStorageLabel")}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {!error && (
        <>
          <p className="mt-2 text-xs text-ink-700/60">
            {usedMb ?? "…"} MB / {limitMb} MB
          </p>
          <Progress value={percent} className="mt-2" />
        </>
      )}
    </Card>
  );
}

export function SuperAdminPage() {
  const { t } = useTranslation();
  usePageTitle(t("admin.superadminTitle"));
  const { session, profile, initializing } = useSession();
  const shops = useShops();
  const shopsLoading = useShopsLoading();
  const orders = useOrders();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (initializing || shopsLoading) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace />;
  if (profile?.role !== "superadmin") return <Navigate to="/" replace />;

  const pendingShops = shops.filter((shop) => shop.status === "pending");
  const liveShops = shops.filter((shop) => shop.status !== "pending");

  async function handleApprove(shop: Shop) {
    setBusyId(shop.id);
    await setShopApproval(shop.id, "approved");
    await supabase.from("profiles").update({ status: "approved" }).eq("shop_id", shop.id);
    setBusyId(null);
  }

  async function handleReject(shop: Shop) {
    setBusyId(shop.id);
    await setShopApproval(shop.id, "rejected");
    await supabase.from("profiles").update({ status: "rejected" }).eq("shop_id", shop.id);
    setBusyId(null);
  }

  async function handleDeleteShop(shop: Shop) {
    if (!window.confirm(t("admin.deleteShopConfirm", { name: shop.name }))) return;
    setBusyId(shop.id);
    await deleteShop(shop.id);
    setBusyId(null);
  }

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-900/5 pb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            {t("admin.superadminTitle")}
          </h1>
          <p className="text-sm text-ink-700/60">{t("admin.superadminSubtitle")}</p>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" />
          {t("admin.logout")}
        </Button>
      </div>

      <div className="mt-6">
        <DbStorageWidget />
      </div>

      {pendingShops.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            {t("admin.pendingApprovalsHeading")}
          </h2>
          <div className="mt-3 space-y-3">
            {pendingShops.map((shop) => (
              <Card key={shop.id} className="flex flex-wrap items-center gap-4 border-2 border-gold-400 p-4">
                <img
                  src={shop.bannerImage}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-ink-900">{shop.name}</p>
                  <p className="text-xs text-ink-700/50">{shop.location}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={busyId === shop.id}
                    onClick={() => handleApprove(shop)}
                  >
                    <Check className="h-4 w-4" />
                    {t("admin.approve")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={busyId === shop.id}
                    onClick={() => handleReject(shop)}
                  >
                    <X className="h-4 w-4" />
                    {t("admin.reject")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink-900">
          {t("admin.allShopsHeading")}
        </h2>
        <div className="mt-3 space-y-3">
          {liveShops.map((shop) => (
            <Card key={shop.id} className="flex flex-wrap items-center gap-4 p-4">
              <img
                src={shop.bannerImage}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink-900">{shop.name}</p>
                  {shop.status === "rejected" && (
                    <Badge variant="outline" className="border-red-300 text-red-600">
                      {t("admin.statusRejected")}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-ink-700/50">{shop.location}</p>
                <p className="mt-0.5 text-xs text-ink-700/50">
                  {shop.services.length} {t("admin.services").toLowerCase()} ·{" "}
                  {shop.products.length} {t("admin.products").toLowerCase()} ·{" "}
                  {orders.filter((o) => o.shopId === shop.id).length}{" "}
                  {t("admin.orders").toLowerCase()}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Link to={`/shop/${shop.slug}`}>
                  <Button variant="ghost" size="icon" title={t("admin.viewLivePage")}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={`/shop/${shop.slug}/admin`}>
                  <Button variant="ghost" size="icon" title={t("admin.manageShop")}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={busyId === shop.id}
                  onClick={() => handleDeleteShop(shop)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
}
