import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { PageLoader } from "@/components/layout/PageLoader";
import { SkipToContent } from "@/components/layout/SkipToContent";
import { HomePage } from "@/pages/HomePage";

// HomePage loads eagerly (it's the landing page most visitors hit first);
// everything else is split into its own chunk and fetched on navigation.
const ShopsPage = lazy(() => import("@/pages/ShopsPage").then((m) => ({ default: m.ShopsPage })));
const ShopPage = lazy(() => import("@/pages/ShopPage").then((m) => ({ default: m.ShopPage })));
const DressesPage = lazy(() =>
  import("@/pages/DressesPage").then((m) => ({ default: m.DressesPage })),
);
const TrackPage = lazy(() => import("@/pages/TrackPage").then((m) => ({ default: m.TrackPage })));
const AboutPage = lazy(() => import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() =>
  import("@/pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
const ShopAdminPage = lazy(() =>
  import("@/pages/admin/ShopAdminPage").then((m) => ({ default: m.ShopAdminPage })),
);
const SuperAdminPage = lazy(() =>
  import("@/pages/admin/SuperAdminPage").then((m) => ({ default: m.SuperAdminPage })),
);
const RegisterPage = lazy(() =>
  import("@/pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const LoginPage = lazy(() => import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const AddShopPage = lazy(() =>
  import("@/pages/auth/AddShopPage").then((m) => ({ default: m.AddShopPage })),
);
const PendingApprovalPage = lazy(() =>
  import("@/pages/auth/PendingApprovalPage").then((m) => ({ default: m.PendingApprovalPage })),
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shops" element={<ShopsPage />} />
            <Route path="/shop/:slug" element={<ShopPage />} />
            <Route path="/dresses" element={<DressesPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/track/:code" element={<TrackPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/shop/:slug/admin" element={<ShopAdminPage />} />
            <Route path="/superadmin" element={<SuperAdminPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/add-shop" element={<AddShopPage />} />
            <Route path="/pending-approval" element={<PendingApprovalPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <ScrollProgress />
      <ScrollToTop />
      <Header />

      <main id="main-content" className="flex-1 pb-16 lg:pb-0">
        <AnimatedRoutes />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

export default App;
