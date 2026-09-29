import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { Hero } from "@/components/landing/Hero";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingProvider } from "@/components/landing/LandingProvider";
import { EndSection, LandingFooter, PrivateSection } from "@/components/landing/Sections";
import { SheetSection } from "@/components/landing/SheetSection";
import { WeekSection } from "@/components/landing/WeekSection";
import { LANDING_META } from "@/constants/content/landing";
import { ROUTES } from "@/constants/routes";
import { JSON_LD } from "@/constants/seo";
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
      <LandingHeader />
      <main id="main">
        <Hero />
        <WeekSection />
        <SheetSection />
        <PrivateSection />
        <EndSection />
      </main>
      <LandingFooter />
    </LandingProvider>
  );
}
