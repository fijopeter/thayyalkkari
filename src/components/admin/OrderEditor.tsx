import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Check, Copy, Plus, Trash2, X } from "lucide-react";
import type { OrderStatus, Shop } from "@/types";
import { useLang } from "@/hooks/useLang";
import { formatDate } from "@/lib/format";
import { ORDER_STATUS_SEQUENCE } from "@/data/trackingOrders";
import {
  createOrder,
  deleteOrder,
  updateOrderStatus,
  useOrdersForShop,
} from "@/store/ordersStore";
import { useDbCapacity } from "@/hooks/useDbCapacity";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { BilingualField } from "@/components/admin/BilingualField";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  customerName: "",
  itemType: { en: "", ml: "" },
  orderDate: today(),
  expectedDate: "",
  status: "order_received" as OrderStatus,
};

export function OrderEditor({ shop }: { shop: Shop }) {
  const { t } = useTranslation();
  const { lang } = useLang();
  const { atLimit: dbAtLimit } = useDbCapacity();
  const orders = useOrdersForShop(shop.id);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setAdding(true);
    setNewCode(null);
    setError(null);
    setForm({ ...emptyForm, orderDate: today() });
  }

  function cancel() {
    setAdding(false);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { order, error: err } = await createOrder({
      shopId: shop.id,
      customerName: form.customerName,
      itemType: form.itemType,
      orderDate: form.orderDate,
      expectedDate: form.expectedDate,
      status: form.status,
    });
    setSaving(false);
    if (err || !order) {
      setError(err ?? "Failed to create order");
      return;
    }
    setNewCode(order.code);
    setAdding(false);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="space-y-4">
      {newCode && (
        <Card className="flex items-center justify-between gap-4 border-2 border-gold-400 bg-gold-100/50 p-4">
          <div>
            <p className="text-xs text-ink-700/60">{t("admin.newTrackingCode")}</p>
            <p className="font-display text-xl font-bold text-maroon-700">{newCode}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => copyCode(newCode)}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? t("admin.copied") : t("admin.copyCode")}
          </Button>
        </Card>
      )}

      {orders.length === 0 && !adding && (
        <p className="text-sm text-ink-700/50">{t("admin.noOrders")}</p>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.code} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display font-semibold text-maroon-700">{order.code}</p>
              <p className="text-sm text-ink-900">
                {order.customerName} · {order.itemType[lang]}
              </p>
              <p className="text-xs text-ink-700/50">
                {formatDate(order.orderDate, lang)} → {formatDate(order.expectedDate, lang)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={order.status}
                onChange={async (e) => {
                  const result = await updateOrderStatus(order.code, e.target.value as OrderStatus);
                  if (result.error) setError(result.error);
                }}
                className="h-10 rounded-xl border border-ink-900/10 bg-cream-50 px-3 text-sm"
              >
                {ORDER_STATUS_SEQUENCE.map((status) => (
                  <option key={status} value={status}>
                    {t(`orderStatus.${status}`)}
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={async () => {
                  const result = await deleteOrder(order.code);
                  if (result.error) setError(result.error);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {adding ? (
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label required>{t("form.customerName")}</Label>
              <Input
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                required
              />
            </div>
            <BilingualField
              label={t("admin.itemTypeLabel")}
              value={form.itemType}
              onChange={(v) => setForm((f) => ({ ...f, itemType: v }))}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label required>{t("admin.orderDateLabel")}</Label>
                <Input
                  type="date"
                  value={form.orderDate}
                  onChange={(e) => setForm((f) => ({ ...f, orderDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label required>{t("admin.expectedDateLabel")}</Label>
                <Input
                  type="date"
                  value={form.expectedDate}
                  onChange={(e) => setForm((f) => ({ ...f, expectedDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label>{t("admin.statusLabel")}</Label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as OrderStatus }))}
                className="h-11 w-full rounded-xl border border-ink-900/10 bg-cream-50 px-4 text-sm"
              >
                {ORDER_STATUS_SEQUENCE.map((status) => (
                  <option key={status} value={status}>
                    {t(`orderStatus.${status}`)}
                  </option>
                ))}
              </select>
            </div>
            {dbAtLimit && <p className="text-sm text-red-600">{t("admin.dbLimitReached")}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving || dbAtLimit}>
                {saving ? t("admin.saving") : t("admin.save")}
              </Button>
              <Button type="button" variant="ghost" onClick={cancel} className="gap-1.5">
                <X className="h-4 w-4" />
                {t("admin.cancel")}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div>
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={dbAtLimit}
            onClick={startAdd}
          >
            <Plus className="h-4 w-4" />
            {t("admin.addOrder")}
          </Button>
          {dbAtLimit && <p className="mt-2 text-sm text-red-600">{t("admin.dbLimitReached")}</p>}
        </div>
      )}
    </div>
  );
}
