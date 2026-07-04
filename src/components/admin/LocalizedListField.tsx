import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import type { LocalizedText } from "@/types";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function LocalizedListField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: LocalizedText[];
  onChange: (next: LocalizedText[]) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<LocalizedText>({ en: "", ml: "" });

  function add() {
    if (!draft.en.trim() && !draft.ml.trim()) return;
    onChange([...items, draft]);
    setDraft({ en: "", ml: "" });
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <Badge key={i} variant="maroon" className="gap-1.5">
            {item.en}
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Input
          value={draft.en}
          onChange={(e) => setDraft((d) => ({ ...d, en: e.target.value }))}
          placeholder={t("admin.fieldEn")}
          className="flex-1"
        />
        <Input
          value={draft.ml}
          onChange={(e) => setDraft((d) => ({ ...d, ml: e.target.value }))}
          placeholder={t("admin.fieldMl")}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
