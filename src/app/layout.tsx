import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Barlow, Saira_Condensed } from "next/font/google";
import { THEME_COLOUR } from "@/constants/brand";
import { SITE_URL } from "@/constants/seo";
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
  title: SITE.name,
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: { title: SITE.name, description: SITE.description, url: "/", siteName: SITE.name, type: "website" },
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
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
