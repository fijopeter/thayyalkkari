import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { useShops } from "@/store/shopsStore";
import { useLang } from "@/hooks/useLang";
import { t as tl, cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Input } from "@/components/ui/Input";
import { ShopCard } from "@/components/shop/ShopCard";

export function ShopsPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  usePageTitle(t("shopsSection.heading"));
  const shops = useShops();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const seen = new Map<string, { en: string; ml: string }>();
    for (const shop of shops) {
      for (const c of shop.categories) {
        if (!seen.has(c.en)) seen.set(c.en, c);
      }
    }
    return [...seen.values()];
  }, [shops]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shops.filter((shop) => {
      const matchesCategory = !category || shop.categories.some((c) => c.en === category);
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = [
        shop.name,
        shop.malayalamName ?? "",
        shop.location,
        ...shop.categories.map((c) => tl(c, lang)),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, lang, category, shops]);

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        align="center"
        title={t("shopsSection.heading")}
        subtitle={t("shopsSection.subheading")}
        className="mx-auto"
      />

      <div className="relative mx-auto mt-8 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-700/40" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("dressesPage.searchPlaceholder")}
          className="h-12 pl-11"
        />
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            category === null
              ? "bg-maroon-600 text-cream-50"
              : "bg-white text-ink-700/70 hover:bg-maroon-50",
          )}
        >
          {t("common.all")}
        </button>
        {categories.map((c) => (
          <button
            key={c.en}
            type="button"
            onClick={() => setCategory((prev) => (prev === c.en ? null : c.en))}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === c.en
                ? "bg-maroon-600 text-cream-50"
                : "bg-white text-ink-700/70 hover:bg-maroon-50",
            )}
          >
            {tl(c, lang)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-ink-700/60">{t("dressesPage.noResults")}</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((shop, i) => (
            <ShopCard key={shop.id} shop={shop} index={i} />
          ))}
        </div>
      )}
    </Container>
  );
}
