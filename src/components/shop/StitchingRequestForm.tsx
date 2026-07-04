import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, Send } from "lucide-react";
import type { Shop, StitchingRequestFormData } from "@/types";
import { buildStitchingRequestWhatsAppUrl } from "@/lib/whatsapp";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";

type FormErrors = Partial<Record<keyof StitchingRequestFormData, string>>;

const initialForm: StitchingRequestFormData = {
  shopId: "",
  customerName: "",
  phone: "",
  whatsapp: "",
  sameAsPhone: true,
  dressType: "",
  fabricDetails: "",
  measurementsNotes: "",
  preferredDeliveryDate: "",
  additionalInstructions: "",
  referenceImage: null,
};

export function StitchingRequestForm({ shop }: { shop: Shop }) {
  const { t } = useTranslation();
  const [form, setForm] = useState<StitchingRequestFormData>({
    ...initialForm,
    shopId: shop.id,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageName, setImageName] = useState<string | null>(null);

  function update<K extends keyof StitchingRequestFormData>(
    key: K,
    value: StitchingRequestFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    const phonePattern = /^[+]?[\d\s-]{7,15}$/;

    if (!form.customerName.trim()) next.customerName = t("form.requiredField");
    if (!form.phone.trim()) next.phone = t("form.requiredField");
    else if (!phonePattern.test(form.phone.trim())) next.phone = t("form.invalidPhone");
    if (!form.sameAsPhone && !form.whatsapp.trim()) next.whatsapp = t("form.requiredField");
    if (!form.dressType.trim()) next.dressType = t("form.requiredField");

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const url = buildStitchingRequestWhatsAppUrl(shop, form);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="shopId" value={form.shopId} />

      <div>
        <Label htmlFor="customerName" required>
          {t("form.customerName")}
        </Label>
        <Input
          id="customerName"
          value={form.customerName}
          onChange={(e) => update("customerName", e.target.value)}
          placeholder={t("form.customerNamePlaceholder")}
          error={!!errors.customerName}
        />
        {errors.customerName && (
          <p className="mt-1 text-xs text-red-600">{errors.customerName}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone" required>
            {t("form.phone")}
          </Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder={t("form.phonePlaceholder")}
            error={!!errors.phone}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="whatsapp">{t("form.whatsapp")}</Label>
          <Input
            id="whatsapp"
            type="tel"
            value={form.sameAsPhone ? form.phone : form.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            placeholder={t("form.whatsappPlaceholder")}
            disabled={form.sameAsPhone}
            error={!!errors.whatsapp}
          />
          {errors.whatsapp && <p className="mt-1 text-xs text-red-600">{errors.whatsapp}</p>}
          <label className="mt-2 flex items-center gap-2 text-sm text-ink-700/70">
            <Checkbox
              checked={form.sameAsPhone}
              onChange={(e) => update("sameAsPhone", e.target.checked)}
            />
            {t("form.sameAsPhone")}
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="dressType" required>
          {t("form.dressType")}
        </Label>
        <Input
          id="dressType"
          value={form.dressType}
          onChange={(e) => update("dressType", e.target.value)}
          placeholder={t("form.dressTypePlaceholder")}
          error={!!errors.dressType}
        />
        {errors.dressType && <p className="mt-1 text-xs text-red-600">{errors.dressType}</p>}
      </div>

      <div>
        <Label htmlFor="fabricDetails">{t("form.fabricDetails")}</Label>
        <Input
          id="fabricDetails"
          value={form.fabricDetails}
          onChange={(e) => update("fabricDetails", e.target.value)}
          placeholder={t("form.fabricDetailsPlaceholder")}
        />
      </div>

      <div>
        <Label htmlFor="measurementsNotes">{t("form.measurementsNotes")}</Label>
        <Textarea
          id="measurementsNotes"
          value={form.measurementsNotes}
          onChange={(e) => update("measurementsNotes", e.target.value)}
          placeholder={t("form.measurementsNotesPlaceholder")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="preferredDeliveryDate">{t("form.preferredDeliveryDate")}</Label>
          <Input
            id="preferredDeliveryDate"
            type="date"
            value={form.preferredDeliveryDate}
            onChange={(e) => update("preferredDeliveryDate", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="referenceImage">{t("form.uploadImage")}</Label>
          <label
            htmlFor="referenceImage"
            className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-ink-900/20 bg-cream-50 px-4 text-sm text-ink-700/60 hover:border-maroon-400"
          >
            <ImagePlus className="h-4 w-4 shrink-0" />
            <span className="truncate">{imageName ?? t("form.uploadImageHint")}</span>
          </label>
          <input
            id="referenceImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              update("referenceImage", file);
              setImageName(file?.name ?? null);
            }}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="additionalInstructions">{t("form.additionalInstructions")}</Label>
        <Textarea
          id="additionalInstructions"
          value={form.additionalInstructions}
          onChange={(e) => update("additionalInstructions", e.target.value)}
          placeholder={t("form.additionalInstructionsPlaceholder")}
        />
      </div>

      <Button type="submit" variant="whatsapp" size="lg" className="w-full gap-2 sm:w-auto">
        <Send className="h-4 w-4" />
        {t("form.submit")}
      </Button>
    </form>
  );
}
