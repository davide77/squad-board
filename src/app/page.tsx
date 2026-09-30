import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingProvider } from "@/components/landing/LandingProvider";
import { EndSection, FaqSection, LandingFooter, PrivateSection } from "@/components/landing/Sections";
import { SheetSection } from "@/components/landing/SheetSection";
import { TrySection } from "@/components/landing/TrySection";
import { LANDING_META } from "@/constants/content/landing";
import { ROUTES } from "@/constants/routes";
import { FAQ_JSON_LD, JSON_LD } from "@/constants/seo";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: LANDING_META.title,
  description: LANDING_META.description,
  path: ROUTES.home,
  absolute: true,
});

export default function Home() {
  return (
    <LandingProvider>
      <JsonLd data={JSON_LD} />
      <JsonLd data={FAQ_JSON_LD} />
      <LandingHeader />
      <main id="main">
        <HeroCarousel />
        <TrySection />
        <SheetSection />
        <PrivateSection />
        <EndSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </LandingProvider>
  );
}
