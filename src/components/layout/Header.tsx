import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X, Scissors, PackageSearch, LayoutDashboard, LogIn } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { useSession } from "@/store/authStore";
import { useShops } from "@/store/shopsStore";
import { dashboardPathForProfile } from "@/lib/dashboardPath";

export function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { session, profile } = useSession();
  const shops = useShops();
  const dashboardPath = session ? dashboardPathForProfile(profile, shops) : "/login";

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 12);
  });

  const navItems = [
    { to: "/", label: t("nav.home") },
    { to: "/shops", label: t("nav.shops") },
    { to: "/dresses", label: t("nav.dresses") },
    { to: "/track", label: t("nav.track") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300",
        scrolled
          ? "border-ink-900/5 bg-cream-50/95 shadow-soft"
          : "border-transparent bg-cream-50/70",
      )}
    >
      <Container
        className={cn(
          "flex items-center justify-between gap-4 transition-[height] duration-300",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <motion.span
            animate={{ rotate: scrolled ? -8 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-maroon-600 text-cream-50"
          >
            <Scissors className="h-4.5 w-4.5" />
          </motion.span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold text-maroon-700">
              തയ്യൽക്കാരി
            </span>
            <span className="text-[11px] tracking-wide text-ink-700/50">Thayyalkkari</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-maroon-100 text-maroon-700"
                    : "text-ink-700 hover:bg-maroon-50 hover:text-maroon-700",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/track">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <PackageSearch className="h-4 w-4" />
              {t("nav.track")}
            </Button>
          </Link>
          <Link to={dashboardPath}>
            <Button variant="outline" size="sm" className="gap-1.5">
              {session ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {session ? t("nav.dashboard") : t("nav.login")}
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden rounded-full p-2 text-ink-900 hover:bg-maroon-50"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {open && (
        <div className="lg:hidden border-t border-ink-900/5 bg-cream-50">
          <Container className="flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                    isActive
                      ? "bg-maroon-100 text-maroon-700"
                      : "text-ink-700 hover:bg-maroon-50",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to={dashboardPath}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                  isActive
                    ? "bg-maroon-100 text-maroon-700"
                    : "text-ink-700 hover:bg-maroon-50",
                )
              }
            >
              {session ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {session ? t("nav.dashboard") : t("nav.login")}
            </NavLink>
            <div className="mt-2 px-2">
              <LanguageSwitcher className="w-full justify-center" />
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
