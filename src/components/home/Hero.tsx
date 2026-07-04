import { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import { Store, PackageSearch, Sparkles, Scissors, Shirt } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const blobTopY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const blobBottomY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const contentOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.15]);
  const scissorsY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const shirtY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-maroon-50 via-cream-50 to-cream-50"
    >
      <motion.div
        style={{ y: blobTopY }}
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-200/40 blur-3xl"
      />
      <motion.div
        style={{ y: blobBottomY }}
        className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-maroon-100/50 blur-3xl"
      />

      <motion.div
        style={{ y: scissorsY }}
        className="pointer-events-none absolute left-[8%] top-[18%] hidden text-maroon-300/50 sm:block"
      >
        <motion.div
          animate={{ rotate: [0, 14, 0], y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Scissors className="h-14 w-14" strokeWidth={1.25} />
        </motion.div>
      </motion.div>
      <motion.div
        style={{ y: shirtY }}
        className="pointer-events-none absolute right-[10%] top-[24%] hidden text-gold-500/40 sm:block"
      >
        <motion.div
          animate={{ rotate: [0, -10, 0], y: [0, 12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Shirt className="h-16 w-16" strokeWidth={1.25} />
        </motion.div>
      </motion.div>

      <Container className="relative py-16 sm:py-24 lg:py-28">
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold text-maroon-700 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            {t("hero.eyebrow")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl font-bold leading-tight text-ink-900 text-balance sm:text-5xl"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-5 max-w-2xl text-base text-ink-700/70 text-balance sm:text-lg"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link to="/shops" className="w-full sm:w-auto">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                <Store className="h-4.5 w-4.5" />
                {t("hero.ctaFindShops")}
              </Button>
            </Link>
            <Link to="/track" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full gap-2 sm:w-auto">
                <PackageSearch className="h-4.5 w-4.5" />
                {t("hero.ctaTrackStatus")}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
