// ---------------------------------------------------------------------------
// Event image — Asset loading (fonts as ArrayBuffer, images as base64 data URI)
// ---------------------------------------------------------------------------
// Assets are embedded as base64 in asset-data.ts to avoid filesystem access,
// which is unreliable in Vercel serverless functions.
// ---------------------------------------------------------------------------

import {
  FONT_GLORIA_HALLELUJAH_BASE64,
  PLACEHOLDER_DATA_URI,
  FRAME_GREEN_DATA_URI,
  FRAME_ORANGE_DATA_URI,
  FRAME_RED_DATA_URI,
  FRAME_RPG_DATA_URI,
  ICON_BOARDGAME_DATA_URI,
  ICON_RPG_DATA_URI,
} from "./asset-data";

// ---------------------------------------------------------------------------
// Font loading (ArrayBuffer for Satori)
// ---------------------------------------------------------------------------

let cachedFont: ArrayBuffer | null = null;

export function getFont(): ArrayBuffer {
  if (cachedFont) return cachedFont;
  const binary = atob(FONT_GLORIA_HALLELUJAH_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  cachedFont = bytes.buffer;
  return cachedFont;
}

// ---------------------------------------------------------------------------
// Local image assets (already base64 data URIs from embedded data)
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

const imageAssets: ImageAssets = {
  placeholder: PLACEHOLDER_DATA_URI,
  frameGreen: FRAME_GREEN_DATA_URI,
  frameOrange: FRAME_ORANGE_DATA_URI,
  frameRed: FRAME_RED_DATA_URI,
  frameRpg: FRAME_RPG_DATA_URI,
  iconBoardgame: ICON_BOARDGAME_DATA_URI,
  iconRpg: ICON_RPG_DATA_URI,
};

export function getImageAssets(): ImageAssets {
  return imageAssets;
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
