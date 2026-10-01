#!/usr/bin/env node
// Gafferboard's Instagram MCP server. Zero dependencies on purpose: it holds a token that can post
// to the account, so every line that touches it is here to read.
//
// Speaks MCP over stdio (newline-delimited JSON-RPC 2.0) and calls the Instagram API with
// Instagram Login on graph.instagram.com. No Facebook Page needed.
//
// The token lives outside the repo, in ~/.config/gafferboard/instagram.json:
//   { "access_token": "IGAA...", "user_id": "optional, looked up if missing" }
// INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID in the environment win over the file.
// Setup steps: docs/social/instagram-setup.md

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";

const API = "https://graph.instagram.com/v25.0";
const CONFIG_PATH = process.env.INSTAGRAM_CONFIG ?? join(homedir(), ".config", "gafferboard", "instagram.json");
const SERVER = { name: "gafferboard-instagram", version: "1.0.0" };
const PROTOCOL = "2025-06-18";

// Containers are processed by Instagram before they can be published. A photo is ready in
// seconds, a Reel can take a minute or two.
const POLL_MS = 3000;
const POLL_TRIES = { image: 20, video: 60 };
const CAPTION_MAX = 2200;
// Instagram cut hashtags to five per post in December 2025.
const HASHTAG_MAX = 5;
const CAROUSEL_MAX = 10;

// ---------------------------------------------------------------- config

async function loadConfig() {
  let file = {};
  try {
    file = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw new Error(`Could not read ${CONFIG_PATH}: ${err.message}`);
  }
  const token = process.env.INSTAGRAM_ACCESS_TOKEN ?? file.access_token;
  if (!token) {
    throw new Error(`No Instagram token. Put {"access_token": "..."} in ${CONFIG_PATH}. See docs/social/instagram-setup.md.`);
  }
  return { ...file, access_token: token, user_id: process.env.INSTAGRAM_USER_ID ?? file.user_id };
}

async function saveConfig(config) {
  await mkdir(dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
}

// ---------------------------------------------------------------- Graph API

async function graph(method, path, params = {}, token) {
  const url = new URL(path.startsWith("http") ? path : `${API}/${path}`);
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...params, access_token: token })) {
    if (v === undefined || v === null) continue;
    (method === "GET" ? url.searchParams : body).set(k, String(v));
  }
  const res = await fetch(url, method === "GET" ? {} : { method, body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error ?? {};
    throw new Error(`Instagram API ${res.status}: ${e.message ?? res.statusText}${e.error_user_msg ? ` (${e.error_user_msg})` : ""}`);
  }
  return json;
}

async function account() {
  const config = await loadConfig();
  if (!config.user_id) {
    const me = await graph("GET", "me", { fields: "user_id,username" }, config.access_token);
    config.user_id = me.user_id;
    if (!process.env.INSTAGRAM_ACCESS_TOKEN) await saveConfig(config);
  }
  return config;
}

// Instagram fetches the media itself, so it must already be live at a public URL. Checking first
// turns a vague container error into a plain one.
async function checkMedia(url, kind) {
  let res;
  try {
    res = await fetch(url, { method: "HEAD" });
  } catch (err) {
    throw new Error(`Could not reach ${url}: ${err.message}`);
  }
  if (!res.ok) throw new Error(`${url} returned ${res.status}. Is it deployed yet?`);
  const type = res.headers.get("content-type") ?? "";
  if (kind === "image" && !/image\/jpe?g/.test(type)) {
    throw new Error(`${url} is ${type || "an unknown type"}. Instagram takes JPEG only.`);
  }
  if (kind === "video" && !/video\/(mp4|quicktime)/.test(type)) {
    throw new Error(`${url} is ${type || "an unknown type"}. Use an MP4 or MOV.`);
  }
}

function checkCaption(caption = "") {
  if (caption.length > CAPTION_MAX) throw new Error(`Caption is ${caption.length} characters. The limit is ${CAPTION_MAX}.`);
  const tags = caption.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  if (tags.length > HASHTAG_MAX) throw new Error(`${tags.length} hashtags. The limit is ${HASHTAG_MAX}.`);
  if (/[\u2013\u2014]/.test(caption)) throw new Error("Caption has a long dash. House style is a plain hyphen (brand.md, hard rule 1).");
}

async function waitUntilReady(id, token, kind) {
  for (let i = 0; i < POLL_TRIES[kind]; i++) {
    const { status_code, status } = await graph("GET", id, { fields: "status_code,status" }, token);
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`Container ${id} ${status_code}: ${status ?? "no detail"}`);
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  throw new Error(`Container ${id} still processing. Try ig_publish_container with this id in a minute.`);
}

async function publish(container, kind) {
  const { access_token, user_id } = await account();
  await waitUntilReady(container, access_token, kind);
  const { id } = await graph("POST", `${user_id}/media_publish`, { creation_id: container }, access_token);
  const media = await graph("GET", id, { fields: "id,permalink,media_type,timestamp" }, access_token).catch(() => ({ id }));
  return media;
}

async function createContainer(params) {
  const { access_token, user_id } = await account();
  const { id } = await graph("POST", `${user_id}/media`, params, access_token);
  return id;
}

// ---------------------------------------------------------------- tools

const str = (description) => ({ type: "string", description });

const TOOLS = [
  {
    name: "ig_account",
    description: "The connected Instagram account: username, followers, posts, and how many of today's 100 API posts are used.",
    inputSchema: { type: "object", properties: {} },
    readOnly: true,
    run: async () => {
      const { access_token, user_id } = await account();
      const profile = await graph(
        "GET",
        "me",
        { fields: "user_id,username,name,account_type,followers_count,follows_count,media_count,biography,website" },
        access_token,
      );
      const limit = await graph("GET", `${user_id}/content_publishing_limit`, { fields: "quota_usage,config" }, access_token).catch(() => null);
      return { ...profile, publishing_limit: limit?.data?.[0] ?? null };
    },
  },
  {
    name: "ig_recent_media",
    description: "The latest posts with likes, comments and permalinks. Stories are not included (use ig_stories).",
    inputSchema: { type: "object", properties: { limit: { type: "number", description: "How many, default 12, max 50" } } },
    readOnly: true,
    run: async ({ limit = 12 }) => {
      const { access_token, user_id } = await account();
      const fields = "id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count";
      return graph("GET", `${user_id}/media`, { fields, limit: Math.min(limit, 50) }, access_token);
    },
  },
  {
    name: "ig_stories",
    description: "Stories live right now (the last 24 hours).",
    inputSchema: { type: "object", properties: {} },
    readOnly: true,
    run: async () => {
      const { access_token, user_id } = await account();
      return graph("GET", `${user_id}/stories`, { fields: "id,media_type,permalink,timestamp" }, access_token);
    },
  },
  {
    name: "ig_insights",
    description:
      "Insights for one post, Reel or story: reach, views, saves, shares, likes, comments. Metrics that do not apply to that media type are skipped.",
    inputSchema: { type: "object", properties: { media_id: str("The media id") }, required: ["media_id"] },
    readOnly: true,
    run: async ({ media_id }) => {
      const { access_token } = await account();
      const wanted = ["reach", "views", "saved", "shares", "likes", "comments", "total_interactions", "replies", "navigation"];
      const out = {};
      // One metric per call, so a metric a media type does not support cannot sink the rest.
      for (const metric of wanted) {
        const res = await graph("GET", `${media_id}/insights`, { metric }, access_token).catch(() => null);
        const value = res?.data?.[0]?.values?.[0]?.value ?? res?.data?.[0]?.total_value?.value;
        if (value !== undefined) out[metric] = value;
      }
      return out;
    },
  },
  {
    name: "ig_comments",
    description: "Comments on a post, newest first.",
    inputSchema: { type: "object", properties: { media_id: str("The media id") }, required: ["media_id"] },
    readOnly: true,
    run: async ({ media_id }) => {
      const { access_token } = await account();
      return graph("GET", `${media_id}/comments`, { fields: "id,text,username,timestamp,like_count" }, access_token);
    },
  },
  {
    name: "ig_publish_photo",
    description:
      "PUBLISHES a single photo to the feed, live and public. Only call after Davide has approved this exact image and caption. The image must be a JPEG already live at a public URL (usually https://gafferboard.com/social/...).",
    inputSchema: {
      type: "object",
      properties: { image_url: str("Public JPEG URL"), caption: str("Caption, up to 2200 characters"), alt_text: str("Alt text for screen readers") },
      required: ["image_url", "caption", "alt_text"],
    },
    run: async ({ image_url, caption, alt_text }) => {
      checkCaption(caption);
      await checkMedia(image_url, "image");
      const container = await createContainer({ image_url, caption, alt_text });
      return publish(container, "image");
    },
  },
  {
    name: "ig_publish_carousel",
    description:
      "PUBLISHES a carousel (2-10 images) to the feed, live and public. Only call after Davide has approved these exact images and caption. Every image must be a JPEG at a public URL, ideally all 1080x1350.",
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          description: "The slides in order",
          items: { type: "object", properties: { image_url: str("Public JPEG URL"), alt_text: str("Alt text") }, required: ["image_url", "alt_text"] },
        },
        caption: str("Caption, up to 2200 characters"),
      },
      required: ["items", "caption"],
    },
    run: async ({ items, caption }) => {
      if (items.length < 2 || items.length > CAROUSEL_MAX) throw new Error(`A carousel takes 2 to ${CAROUSEL_MAX} images, not ${items.length}.`);
      checkCaption(caption);
      for (const item of items) await checkMedia(item.image_url, "image");
      const children = [];
      for (const item of items) {
        children.push(await createContainer({ image_url: item.image_url, alt_text: item.alt_text, is_carousel_item: true }));
      }
      const { access_token } = await account();
      for (const child of children) await waitUntilReady(child, access_token, "image");
      const container = await createContainer({ media_type: "CAROUSEL", children: children.join(","), caption });
      return publish(container, "image");
    },
  },
  {
    name: "ig_publish_reel",
    description:
      "PUBLISHES a Reel, live and public. Only call after Davide has approved this exact video and caption. Video must be a vertical MP4 at a public URL.",
    inputSchema: {
      type: "object",
      properties: {
        video_url: str("Public MP4 URL"),
        caption: str("Caption"),
        cover_url: str("Optional public JPEG for the cover"),
        share_to_feed: { type: "boolean", description: "Also show in the grid. Default true." },
      },
      required: ["video_url", "caption"],
    },
    run: async ({ video_url, caption, cover_url, share_to_feed = true }) => {
      checkCaption(caption);
      await checkMedia(video_url, "video");
      if (cover_url) await checkMedia(cover_url, "image");
      const container = await createContainer({ media_type: "REELS", video_url, caption, cover_url, share_to_feed });
      return publish(container, "video");
    },
  },
  {
    name: "ig_publish_story",
    description:
      "PUBLISHES one story frame, live for 24 hours. Only call after Davide has approved it. Give image_url (JPEG, 1080x1920) or video_url (MP4, up to 60s). The API cannot add stickers, links, polls or text, so any words must be in the image itself.",
    inputSchema: { type: "object", properties: { image_url: str("Public JPEG URL"), video_url: str("Public MP4 URL") } },
    run: async ({ image_url, video_url }) => {
      if (!image_url === !video_url) throw new Error("Give image_url or video_url, one of them.");
      const kind = image_url ? "image" : "video";
      await checkMedia(image_url ?? video_url, kind);
      const container = await createContainer({ media_type: "STORIES", image_url, video_url });
      return publish(container, kind);
    },
  },
  {
    name: "ig_publish_container",
    description: "Publishes a container that was still processing when a publish tool gave up waiting. Only for a post Davide already approved.",
    inputSchema: { type: "object", properties: { container_id: str("Container id from the earlier error") }, required: ["container_id"] },
    run: async ({ container_id }) => publish(container_id, "video"),
  },
  {
    name: "ig_refresh_token",
    description: "Swaps the token for a fresh 60-day one and saves it. Run weekly. The token must be at least 24 hours old.",
    inputSchema: { type: "object", properties: {} },
    run: async () => {
      const config = await loadConfig();
      const res = await graph("GET", "https://graph.instagram.com/refresh_access_token", { grant_type: "ig_refresh_token" }, config.access_token);
      const expires_at = new Date(Date.now() + res.expires_in * 1000).toISOString();
      if (process.env.INSTAGRAM_ACCESS_TOKEN) {
        return { refreshed: true, saved: false, note: "Token came from the environment, so the new one was not saved.", expires_at };
      }
      await saveConfig({ ...config, access_token: res.access_token, expires_at });
      return { refreshed: true, saved: true, expires_at };
    },
  },
];

// ---------------------------------------------------------------- MCP over stdio

function send(message) {
  process.stdout.write(JSON.stringify(message) + "\n");
}

async function handle({ id, method, params }) {
  switch (method) {
    case "initialize":
      return { protocolVersion: params?.protocolVersion ?? PROTOCOL, capabilities: { tools: {} }, serverInfo: SERVER };
    case "ping":
      return {};
    case "tools/list":
      return {
        tools: TOOLS.map(({ name, description, inputSchema, readOnly }) => ({
          name,
          description,
          inputSchema,
          annotations: { readOnlyHint: Boolean(readOnly), destructiveHint: false, openWorldHint: true },
        })),
      };
    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === params?.name);
      if (!tool) return { content: [{ type: "text", text: `Unknown tool ${params?.name}` }], isError: true };
      try {
        const result = await tool.run(params.arguments ?? {});
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: err.message }], isError: true };
      }
    }
    default:
      if (id === undefined) return undefined; // a notification, nothing to answer
      throw Object.assign(new Error(`Method not found: ${method}`), { code: -32601 });
  }
}

createInterface({ input: process.stdin }).on("line", async (line) => {
  if (!line.trim()) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
  }
  try {
    const result = await handle(msg);
    if (msg.id !== undefined && result !== undefined) send({ jsonrpc: "2.0", id: msg.id, result });
  } catch (err) {
    if (msg.id !== undefined) send({ jsonrpc: "2.0", id: msg.id, error: { code: err.code ?? -32603, message: err.message } });
  }
});
