import { Hero } from "@/components/home/Hero";
import { ShopsSection } from "@/components/home/ShopsSection";
import { DressesSection } from "@/components/home/DressesSection";
import { TrackingSection } from "@/components/home/TrackingSection";
import { usePageTitle } from "@/hooks/usePageTitle";

export function HomePage() {
  usePageTitle();

  return (
    <>
      <Hero />
      <ShopsSection />
      <DressesSection />
      <TrackingSection />
    </>
  );
}
