import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideArticle } from "@/components/landing/GuideArticle";
import { GUIDES, GUIDE_SLUGS } from "@/constants/content/guides";
import { guidePath } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo";

const guide = GUIDES.find((g) => g.slug === GUIDE_SLUGS.formatsByAge);

export const metadata: Metadata = guide
  ? pageMetadata({ title: guide.title, description: guide.description, path: guidePath(guide.slug) })
  : {};

export default function Page() {
  if (!guide) notFound();
  return <GuideArticle guide={guide} />;
}
