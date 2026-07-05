import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { Shop, ShopService } from "@/types";
import { useLang } from "@/hooks/useLang";
import { t as tl } from "@/lib/utils";
import { addService, deleteService, updateService } from "@/store/shopsStore";
import { useDbCapacity } from "@/hooks/useDbCapacity";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { BilingualField } from "@/components/admin/BilingualField";

const emptyForm = {
  title: { en: "", ml: "" },
  description: { en: "", ml: "" },
  estimatedDays: "",
  priceRange: "",
};

export function ServiceEditor({ shop }: { shop: Shop }) {
  const { t } = useTranslation();
  const { lang } = useLang();
  const { atLimit: dbAtLimit } = useDbCapacity();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = editingId === "new";

  function startAdd() {
    setEditingId("new");
    setForm(emptyForm);
  }

  function startEdit(service: ShopService) {
    setEditingId(service.id);
    setForm({
      title: service.title,
      description: service.description,
      estimatedDays: service.estimatedDays,
      priceRange: service.priceRange ?? "",
    });
  }

  function cancel() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      estimatedDays: form.estimatedDays,
      priceRange: form.priceRange || undefined,
    };
    setSaving(true);
    setError(null);
    const result =
      editingId === "new"
        ? await addService(shop.id, payload)
        : await updateService(shop.id, editingId as string, payload);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    cancel();
  }

  return (
    <div className="space-y-4">
      {shop.services.length === 0 && editingId === null && (
        <p className="text-sm text-ink-700/50">{t("admin.noServices")}</p>
      )}

      <div className="space-y-3">
        {shop.services.map((service) => (
          <Card key={service.id} className="flex items-start justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-ink-900">{tl(service.title, lang)}</p>
              <p className="text-sm text-ink-700/60">{tl(service.description, lang)}</p>
              <p className="mt-1 text-xs text-ink-700/50">
                {service.estimatedDays}
                {service.priceRange ? ` · ${service.priceRange}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button variant="ghost" size="icon" type="button" onClick={() => startEdit(service)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={async () => {
                  const result = await deleteService(shop.id, service.id);
                  if (result.error) setError(result.error);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editingId ? (
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <BilingualField
              label={t("admin.serviceTitleLabel")}
              value={form.title}
              onChange={(v) => setForm((f) => ({ ...f, title: v }))}
              required
            />
            <BilingualField
              label={t("admin.serviceDescLabel")}
              value={form.description}
              onChange={(v) => setForm((f) => ({ ...f, description: v }))}
              multiline
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label required>{t("admin.estimatedDaysLabel")}</Label>
                <Input
                  value={form.estimatedDays}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedDays: e.target.value }))}
                  placeholder="e.g. 4-6 days"
                  required
                />
              </div>
              <div>
                <Label>{t("admin.priceRangeLabel")}</Label>
                <Input
                  value={form.priceRange}
                  onChange={(e) => setForm((f) => ({ ...f, priceRange: e.target.value }))}
                  placeholder="e.g. ₹500 - ₹1500"
                />
              </div>
            </div>
            {isNew && dbAtLimit && <p className="text-sm text-red-600">{t("admin.dbLimitReached")}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving || (isNew && dbAtLimit)}>
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
            {t("admin.addService")}
          </Button>
          {dbAtLimit && <p className="mt-2 text-sm text-red-600">{t("admin.dbLimitReached")}</p>}
        </div>
      )}
    </div>
  );
}
