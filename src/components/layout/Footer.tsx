import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Scissors, Mail, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t border-ink-900/5 bg-maroon-900 text-cream-100">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-maroon-900">
                <Scissors className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-lg font-semibold">തയ്യൽക്കാരി</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-cream-100/70">{t("footer.tagline")}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-300">
              {t("footer.quickLinks")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-cream-100/80">
              <li><Link to="/shops" className="hover:text-gold-300">{t("nav.shops")}</Link></li>
              <li><Link to="/dresses" className="hover:text-gold-300">{t("nav.dresses")}</Link></li>
              <li><Link to="/track" className="hover:text-gold-300">{t("nav.track")}</Link></li>
              <li><Link to="/about" className="hover:text-gold-300">{t("nav.about")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-300">
              {t("footer.support")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-cream-100/80">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> support@thayyalkkari.app
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +91 90000 00000
              </li>
              <li><Link to="/contact" className="hover:text-gold-300">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-300">
              {t("footer.language")}
            </h3>
            <div className="mt-4">
              <LanguageSwitcher variant="dark" />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-cream-100/50">
          © {new Date().getFullYear()} Thayyalkkari · തയ്യൽക്കാരി — {t("footer.rights")}
        </div>
      </Container>
    </footer>
  );
}
