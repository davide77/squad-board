import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Barlow, Saira_Condensed } from "next/font/google";
import { THEME_COLOUR } from "@/constants/brand";
import { OPEN_GRAPH_BASE, SITE_URL, TITLE_TEMPLATE, TWITTER_CARD } from "@/constants/seo";
import { SITE } from "@/constants/site";
import "../styles/main.scss";

const body = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const headline = Saira_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-headline",
});

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
      </body>
    </html>
  );
}
