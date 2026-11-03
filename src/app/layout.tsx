import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { THEME_COLOUR } from "@/constants/brand";
import { OPEN_GRAPH_BASE, SITE_URL, TITLE_TEMPLATE, TWITTER_CARD } from "@/constants/seo";
import { SITE } from "@/constants/site";
import { body, headline } from "./fonts";
import "../styles/main.scss";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.name, template: TITLE_TEMPLATE },
  description: SITE.description,
  openGraph: { ...OPEN_GRAPH_BASE, title: SITE.name, description: SITE.description },
  twitter: { card: TWITTER_CARD },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOUR,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en-GB" className={`${body.variable} ${headline.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          {SITE.skipLink}
        </a>
        {children}
        <Analytics />
        {/* Core Web Vitals from real visits, so LCP and CLS are measured on coaches' phones, not only in a lab. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
