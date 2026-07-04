import { Languages } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const { lang, setLang } = useLang();
  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border p-1 text-sm shadow-sm",
        isDark ? "border-white/15 bg-white/10" : "border-ink-900/10 bg-white",
        className,
      )}
      role="group"
      aria-label="Language switcher"
    >
      <Languages
        className={cn("ml-2 h-4 w-4", isDark ? "text-cream-100/50" : "text-ink-700/50")}
        aria-hidden
      />
      <button
        type="button"
        onClick={() => setLang("ml")}
        className={cn(
          "rounded-full px-3 py-1.5 font-medium transition-colors",
          lang === "ml"
            ? "bg-gold-400 text-maroon-900"
            : isDark
              ? "text-cream-100/80 hover:bg-white/10"
              : "text-ink-700 hover:bg-maroon-50",
        )}
        aria-pressed={lang === "ml"}
      >
        മലയാളം
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "rounded-full px-3 py-1.5 font-medium transition-colors",
          lang === "en"
            ? "bg-gold-400 text-maroon-900"
            : isDark
              ? "text-cream-100/80 hover:bg-white/10"
              : "text-ink-700 hover:bg-maroon-50",
        )}
        aria-pressed={lang === "en"}
      >
        English
      </button>
    </div>
  );
}
