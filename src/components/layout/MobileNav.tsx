import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Home, Store, Shirt, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { t } = useTranslation();
  const location = useLocation();

  const items = [
    { to: "/", label: t("nav.home"), icon: Home, end: true },
    { to: "/shops", label: t("nav.shops"), icon: Store, end: false },
    { to: "/dresses", label: t("nav.dressesShort"), icon: Shirt, end: false },
    { to: "/track", label: t("nav.trackShort"), icon: PackageSearch, end: false },
  ];

  const activeIndex = items.findIndex((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
  );

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-ink-900/5 bg-white/95 backdrop-blur-md lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="relative grid grid-cols-4">
        {activeIndex >= 0 && (
          <motion.div
            layout
            className="absolute inset-y-1.5 rounded-2xl bg-maroon-50"
            style={{ width: `${100 / items.length}%` }}
            animate={{ left: `${(activeIndex / items.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
        )}
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "relative z-10 flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium leading-none transition-colors",
                isActive ? "text-maroon-700" : "text-ink-700/50",
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
