import { useTranslation } from "react-i18next";
import type { LocalizedText } from "@/types";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function BilingualField({
  label,
  value,
  onChange,
  multiline = false,
  required = false,
}: {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
  required?: boolean;
}) {
  const { t } = useTranslation();
  const Field = multiline ? Textarea : Input;

  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-xs text-ink-700/50">{t("admin.fieldEn")}</span>
          <Field
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
          />
        </div>
        <div>
          <span className="mb-1 block text-xs text-ink-700/50">{t("admin.fieldMl")}</span>
          <Field
            value={value.ml}
            onChange={(e) => onChange({ ...value, ml: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
