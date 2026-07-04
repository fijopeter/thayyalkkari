import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function TrackingSearchBox({
  onSearch,
  initialValue = "",
  className,
}: {
  onSearch: (code: string) => void;
  initialValue?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const [code, setCode] = useState(initialValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (code.trim()) onSearch(code.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-3 sm:flex-row", className)}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-700/40" />
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("trackingSection.placeholder")}
          className="h-13 pl-11 text-base"
          aria-label={t("trackingSection.placeholder")}
        />
      </div>
      <Button type="submit" size="lg" className="sm:w-auto">
        {t("trackingSection.button")}
      </Button>
    </form>
  );
}
