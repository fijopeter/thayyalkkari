import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Scissors } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  const { t } = useTranslation();
  usePageTitle("404");

  return (
    <Container className="flex flex-col items-center justify-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-maroon-100 text-maroon-600">
        <Scissors className="h-7 w-7" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold text-ink-900">404</h1>
      <p className="mt-1 text-lg font-medium text-ink-900">{t("notFoundPage.title")}</p>
      <p className="mt-2 text-ink-700/60">{t("notFoundPage.subtitle")}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button>{t("notFoundPage.backHome")}</Button>
        </Link>
        <Link to="/shops">
          <Button variant="outline">{t("shopsSection.viewAll")}</Button>
        </Link>
      </div>
    </Container>
  );
}
