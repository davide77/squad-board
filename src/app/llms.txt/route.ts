import { LLMS_TXT, SITE_URL } from "@/constants/seo";

// A plain summary of the site for AI assistants, per llmstxt.org. Built once at build time.
export const dynamic = "force-static";

export function GET() {
  const pages = LLMS_TXT.pages.map((p) => `- [${p.name}](${SITE_URL}${p.path}): ${p.note}`).join("\n");
  const text = [LLMS_TXT.title, LLMS_TXT.summary, ...LLMS_TXT.body, LLMS_TXT.pagesHeading, pages].join("\n\n");

  return new Response(`${text}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
