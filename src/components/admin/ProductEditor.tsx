import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { Shop, ShopProduct } from "@/types";
import { useLang } from "@/hooks/useLang";
import { t as tl } from "@/lib/utils";
import { addProduct, deleteProduct, updateProduct } from "@/store/shopsStore";
import { useDbCapacity } from "@/hooks/useDbCapacity";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { BilingualField } from "@/components/admin/BilingualField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

const emptyForm = {
  name: { en: "", ml: "" },
  category: { en: "", ml: "" },
  description: { en: "", ml: "" },
  image: "",
  size: "",
  price: "",
  enquiryOnly: false,
};

export function ProductEditor({ shop }: { shop: Shop }) {
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

  function startEdit(product: ShopProduct) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      size: product.size ?? "",
      price: product.price != null ? String(product.price) : "",
      enquiryOnly: !!product.enquiryOnly,
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
      name: form.name,
      category: form.category,
      description: form.description,
      image: form.image,
      size: form.size || undefined,
      price: form.price ? Number(form.price) : undefined,
      enquiryOnly: form.enquiryOnly,
    };
    setSaving(true);
    setError(null);
    const result =
      editingId === "new"
        ? await addProduct(shop.id, payload)
        : await updateProduct(shop.id, editingId as string, payload);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    cancel();
  }

  return (
    <div className="space-y-4">
      {shop.products.length === 0 && editingId === null && (
        <p className="text-sm text-ink-700/50">{t("admin.noProducts")}</p>
      )}

      <div className="space-y-3">
        {shop.products.map((product) => (
          <Card key={product.id} className="flex items-start gap-4 p-4">
            <img
              src={product.image}
              alt=""
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-ink-900">{tl(product.name, lang)}</p>
              <p className="text-sm text-ink-700/60">{tl(product.category, lang)}</p>
              <p className="mt-1 text-xs text-ink-700/50">
                {product.enquiryOnly || !product.price
                  ? t("dressesSection.enquireForPrice")
                  : `₹${product.price}`}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button variant="ghost" size="icon" type="button" onClick={() => startEdit(product)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={async () => {
                  const result = await deleteProduct(shop.id, product.id, product.image);
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
              label={t("admin.productNameLabel")}
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              required
            />
            <BilingualField
              label={t("admin.productCategoryLabel")}
              value={form.category}
              onChange={(v) => setForm((f) => ({ ...f, category: v }))}
              required
            />
            <BilingualField
              label={t("admin.productDescLabel")}
              value={form.description}
              onChange={(v) => setForm((f) => ({ ...f, description: v }))}
              multiline
            />
            <ImageUploadField
              label={t("admin.productImageLabel")}
              value={form.image}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("admin.productSizeLabel")}</Label>
                <Input
                  value={form.size}
                  onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                  placeholder="e.g. M / L"
                />
              </div>
              <div>
                <Label>{t("admin.productPriceLabel")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="e.g. 1500"
                  disabled={form.enquiryOnly}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-700/70">
              <Checkbox
                checked={form.enquiryOnly}
                onChange={(e) => setForm((f) => ({ ...f, enquiryOnly: e.target.checked }))}
              />
              {t("admin.enquiryOnlyLabel")}
            </label>
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
            {t("admin.addProduct")}
          </Button>
          {dbAtLimit && <p className="mt-2 text-sm text-red-600">{t("admin.dbLimitReached")}</p>}
        </div>
      )}
    </div>
  );
}
