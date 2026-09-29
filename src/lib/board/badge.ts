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
