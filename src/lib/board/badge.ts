import { BADGE_CONFIG } from "@/constants/config";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Fits an image inside a square, centred, keeping its proportions. */
export function containIn(img: HTMLImageElement, size: number) {
  const w = img.naturalWidth || size;
  const h = img.naturalHeight || size;
  const scale = size / Math.max(w, h);
  return { w: w * scale, h: h * scale, x: (size - w * scale) / 2, y: (size - h * scale) / 2 };
}

/**
 * The badge redrawn small enough to travel to another device, or "" when even the smallest will not fit
 * in `maxChars`. Tries each size and quality from BADGE_CONFIG.travel, biggest first.
 */
export async function travelBadge(badge: string, maxChars: number): Promise<string> {
  if (!badge) return "";
  const img = await loadImage(badge).catch(() => null);
  if (!img) return "";
  const { sizes, qualities, type } = BADGE_CONFIG.travel;
  for (const size of sizes) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    const box = containIn(img, size);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, box.x, box.y, box.w, box.h);
    for (const quality of qualities) {
      // A browser that cannot write WebP hands back a PNG, which the quality does not change.
      const url = canvas.toDataURL(type, quality);
      if (url.length <= maxChars) return url;
    }
  }
  return "";
}

/** Shrinks a picked image to a small square PNG with a clear background. Throws when it will not load. */
export async function readBadge(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const { size, type } = BADGE_CONFIG;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas");
    const box = containIn(img, size);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, box.x, box.y, box.w, box.h);
    return canvas.toDataURL(type);
  } finally {
    URL.revokeObjectURL(url);
  }
}
