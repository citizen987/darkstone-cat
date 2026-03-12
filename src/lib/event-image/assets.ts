// ---------------------------------------------------------------------------
// Event image — Asset loading (fonts as ArrayBuffer, images as base64 data URI)
// ---------------------------------------------------------------------------

import { readFileSync } from "fs";
import { join } from "path";

const ASSETS_DIR = join(process.cwd(), "public", "generation", "event");

// ---------------------------------------------------------------------------
// Font loading (ArrayBuffer for Satori)
// ---------------------------------------------------------------------------

let cachedFont: ArrayBuffer | null = null;

export function getFont(): ArrayBuffer {
  if (cachedFont) return cachedFont;
  const buffer = readFileSync(join(ASSETS_DIR, "font_gloria-hallelujah.ttf"));
  cachedFont = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
  return cachedFont;
}

// ---------------------------------------------------------------------------
// Local image loading as base64 data URIs
// ---------------------------------------------------------------------------

export interface ImageAssets {
  placeholder: string;
  frameGreen: string;
  frameOrange: string;
  frameRed: string;
  frameRpg: string;
  iconBoardgame: string;
  iconRpg: string;
}

let cachedAssets: ImageAssets | null = null;

function loadAsBase64(filename: string): string {
  const buffer = readFileSync(join(ASSETS_DIR, filename));
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export function getImageAssets(): ImageAssets {
  if (cachedAssets) return cachedAssets;
  cachedAssets = {
    placeholder: loadAsBase64("placeholder.png"),
    frameGreen: loadAsBase64("frame_green.png"),
    frameOrange: loadAsBase64("frame_orange.png"),
    frameRed: loadAsBase64("frame_red.png"),
    frameRpg: loadAsBase64("frame_rpg.png"),
    iconBoardgame: loadAsBase64("icon_boardgame.png"),
    iconRpg: loadAsBase64("icon_rpg.png"),
  };
  return cachedAssets;
}

// ---------------------------------------------------------------------------
// Remote image loading as base64 data URI (BGG game covers)
// ---------------------------------------------------------------------------

export async function loadRemoteImageAsDataUri(
  url: string
): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    console.warn("[EventImage] Failed to load remote image:", url);
    return null;
  }
}
