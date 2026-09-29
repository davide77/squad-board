import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BoardClient } from "@/components/board/BoardClient";
import { LANDING_META } from "@/constants/content/landing";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { pageMetadata } from "@/lib/seo";

// The board renders in the browser only, so a crawler sees an empty shell. The homepage
// is the page that should rank; the board stays out of the index and the sitemap.
export const metadata: Metadata = {
  ...pageMetadata({ title: LANDING_META.boardTitle, description: SITE.description, path: ROUTES.board }),
  robots: { index: false, follow: true },
};

export default function BoardPage() {
  return (
    <>
      <SiteHeader sticky={false} />
      <main id="main">
        <BoardClient />
      </main>
    </>
  );
}
