// Tells Bing, Yandex and the other IndexNow engines that pages changed, so they recrawl them
// within hours instead of weeks. ChatGPT search and Copilot read Bing's index.
//
//   node tools/seo/indexnow.mjs            every URL in the live sitemap
//   node tools/seo/indexnow.mjs /7-a-side  only the paths given
//
// Run it after a deploy that changes words on a page. The key is public on purpose: it is the
// file at https://gafferboard.com/<key>.txt that proves the site sent the ping.

const SITE = "https://gafferboard.com";
const KEY = "08094171a8fc42d75089a399c11ac059";
const ENDPOINT = "https://api.indexnow.org/indexnow";

async function sitemapUrls() {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const paths = process.argv.slice(2);
const urlList = paths.length ? paths.map((p) => SITE + (p.startsWith("/") ? p : `/${p}`)) : await sitemapUrls();

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});

// 200 and 202 both mean accepted. 403 means the key file is not live yet.
console.log(`IndexNow ${res.status} ${res.statusText} for ${urlList.length} URLs`);
urlList.forEach((u) => console.log(`  ${u}`));
if (!res.ok) process.exit(1);
