import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import type { Shop } from "@/types";
import { updateShop } from "@/store/shopsStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { BilingualField } from "@/components/admin/BilingualField";
import { LocalizedListField } from "@/components/admin/LocalizedListField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export function ShopProfileForm({ shop }: { shop: Shop }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: shop.name,
    malayalamName: shop.malayalamName ?? "",
    tagline: shop.tagline,
    description: shop.description,
    location: shop.location,
    address: shop.address,
    phone: shop.phone,
    whatsapp: shop.whatsapp,
    email: shop.email ?? "",
    bannerImage: shop.bannerImage,
    logoImage: shop.logoImage ?? "",
    yearsOfExperience: String(shop.yearsOfExperience),
    workingDays: shop.workingHours.days,
    workingHours: shop.workingHours.hours,
    categories: shop.categories,
    badges: shop.badges ?? [],
    showCall: shop.showCall,
    showWhatsapp: shop.showWhatsapp,
    showEmail: shop.showEmail,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error: err } = await updateShop(shop.id, {
      name: form.name,
      malayalamName: form.malayalamName || undefined,
      tagline: form.tagline,
      description: form.description,
      location: form.location,
      address: form.address,
      phone: form.phone,
      whatsapp: form.whatsapp,
      email: form.email || undefined,
      bannerImage: form.bannerImage,
      logoImage: form.logoImage || undefined,
      yearsOfExperience: Number(form.yearsOfExperience) || 0,
      workingHours: { days: form.workingDays, hours: form.workingHours },
      categories: form.categories,
      badges: form.badges.length ? form.badges : undefined,
      showCall: form.showCall,
      showWhatsapp: form.showWhatsapp,
      showEmail: form.showEmail,
    });
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>{t("admin.shopNameLabel")}</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label>{t("admin.shopMalayalamNameLabel")}</Label>
            <Input
              value={form.malayalamName}
              onChange={(e) => setForm((f) => ({ ...f, malayalamName: e.target.value }))}
            />
          </div>
        </div>

        <BilingualField
          label={t("admin.taglineLabel")}
          value={form.tagline}
          onChange={(v) => setForm((f) => ({ ...f, tagline: v }))}
          required
        />
        <BilingualField
          label={t("admin.descriptionLabel")}
          value={form.description}
          onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          multiline
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>{t("admin.locationLabel")}</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Thrissur, Kerala"
              required
            />
          </div>
          <div>
            <Label required>{t("admin.yearsExperienceLabel")}</Label>
            <Input
              type="number"
              min="0"
              value={form.yearsOfExperience}
              onChange={(e) => setForm((f) => ({ ...f, yearsOfExperience: e.target.value }))}
              required
            />
          </div>
        </div>

        <BilingualField
          label={t("admin.addressLabel")}
          value={form.address}
          onChange={(v) => setForm((f) => ({ ...f, address: v }))}
          required
        />

        <div className="space-y-3 rounded-xl border border-ink-900/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/50">
            {t("admin.contactMethodsLabel")}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label required>{t("admin.phoneLabel")}</Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+919847012345"
                required
              />
              <label className="mt-1.5 flex items-center gap-2 text-sm text-ink-700/70">
                <Checkbox
                  checked={form.showCall}
                  onChange={(e) => setForm((f) => ({ ...f, showCall: e.target.checked }))}
                />
                {t("admin.showCallLabel")}
              </label>
            </div>
            <div>
              <Label required>{t("admin.whatsappLabel")}</Label>
              <Input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                placeholder="919847012345"
                required
              />
              <label className="mt-1.5 flex items-center gap-2 text-sm text-ink-700/70">
                <Checkbox
                  checked={form.showWhatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, showWhatsapp: e.target.checked }))}
                />
                {t("admin.showWhatsappLabel")}
              </label>
            </div>
          </div>

          <div>
            <Label>{t("admin.emailLabel")}</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="shop@example.com"
            />
            <label className="mt-1.5 flex items-center gap-2 text-sm text-ink-700/70">
              <Checkbox
                checked={form.showEmail}
                onChange={(e) => setForm((f) => ({ ...f, showEmail: e.target.checked }))}
              />
              {t("admin.showEmailLabel")}
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploadField
            label={t("admin.bannerImageLabel")}
            value={form.bannerImage}
            onChange={(url) => setForm((f) => ({ ...f, bannerImage: url }))}
            required
          />
          <ImageUploadField
            label={t("admin.logoImageLabel")}
            value={form.logoImage}
            onChange={(url) => setForm((f) => ({ ...f, logoImage: url }))}
          />
        </div>

        <BilingualField
          label={t("admin.workingDaysLabel")}
          value={form.workingDays}
          onChange={(v) => setForm((f) => ({ ...f, workingDays: v }))}
        />
        <div>
          <Label required>{t("admin.workingHoursLabel")}</Label>
          <Input
            value={form.workingHours}
            onChange={(e) => setForm((f) => ({ ...f, workingHours: e.target.value }))}
            placeholder="10:00 AM - 8:00 PM"
            required
          />
        </div>

        <LocalizedListField
          label={t("admin.categoriesLabel")}
          items={form.categories}
          onChange={(v) => setForm((f) => ({ ...f, categories: v }))}
        />
        <LocalizedListField
          label={t("admin.badgesLabel")}
          items={form.badges}
          onChange={(v) => setForm((f) => ({ ...f, badges: v }))}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="gap-1.5" disabled={saving}>
          {saved && <Check className="h-4 w-4" />}
          {saving ? t("admin.saving") : saved ? t("admin.saved") : t("admin.save")}
        </Button>
      </form>
    </Card>
  );
}
