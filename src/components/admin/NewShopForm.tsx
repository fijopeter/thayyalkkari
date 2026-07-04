import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { LocalizedText } from "@/types";
import { createShop } from "@/store/shopsStore";
import { refreshProfile } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { BilingualField } from "@/components/admin/BilingualField";
import { LocalizedListField } from "@/components/admin/LocalizedListField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

const emptyText: LocalizedText = { en: "", ml: "" };

function emptyForm() {
  return {
    name: "",
    malayalamName: "",
    tagline: { ...emptyText },
    description: { ...emptyText },
    location: "",
    address: { ...emptyText },
    phone: "",
    whatsapp: "",
    email: "",
    bannerImage: "",
    logoImage: "",
    yearsOfExperience: "",
    workingDays: { ...emptyText },
    workingHours: "",
    categories: [] as LocalizedText[],
  };
}

export function NewShopForm({ onCreated }: { onCreated: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error: err } = await createShop({
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
      showCall: true,
      showWhatsapp: true,
      showEmail: true,
    });
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    await refreshProfile();
    onCreated();
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={saving}>
          {saving ? t("admin.saving") : t("admin.addShop")}
        </Button>
      </form>
    </Card>
  );
}
