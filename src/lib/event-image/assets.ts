// ---------------------------------------------------------------------------
// Event image — Asset loading (fonts as ArrayBuffer, images as base64 data URI)
// ---------------------------------------------------------------------------
// Uses fetch(new URL(..., import.meta.url)) so that webpack/turbopack traces
// the files and includes them in the serverless function bundle on Vercel.
// Each path MUST be a static string literal for the bundler to trace it.
// ---------------------------------------------------------------------------

function bufferToDataUri(buf: ArrayBuffer, mime: string): string {
  return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
}

// ---------------------------------------------------------------------------
// Font loading (ArrayBuffer for Satori) — cached at module level
// ---------------------------------------------------------------------------

const fontPromise = fetch(
  new URL("../../../public/generation/event/font_gloria-hallelujah.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

export async function getFont(): Promise<ArrayBuffer> {
  return fontPromise;
}

// ---------------------------------------------------------------------------
// Local image loading as base64 data URIs — cached at module level
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

async function loadLocalAsBase64(url: URL): Promise<string> {
  const res = await fetch(url);
  return bufferToDataUri(await res.arrayBuffer(), "image/png");
}

// Static URL references — each must be a literal for bundler tracing
const placeholderUrl = new URL("../../../public/generation/event/placeholder.png", import.meta.url);
const frameGreenUrl = new URL("../../../public/generation/event/frame_green.png", import.meta.url);
const frameOrangeUrl = new URL("../../../public/generation/event/frame_orange.png", import.meta.url);
const frameRedUrl = new URL("../../../public/generation/event/frame_red.png", import.meta.url);
const frameRpgUrl = new URL("../../../public/generation/event/frame_rpg.png", import.meta.url);
const iconBoardgameUrl = new URL("../../../public/generation/event/icon_boardgame.png", import.meta.url);
const iconRpgUrl = new URL("../../../public/generation/event/icon_rpg.png", import.meta.url);

let cachedAssets: ImageAssets | null = null;

export async function getImageAssets(): Promise<ImageAssets> {
  if (cachedAssets) return cachedAssets;
  const [placeholder, frameGreen, frameOrange, frameRed, frameRpg, iconBoardgame, iconRpg] =
    await Promise.all([
      loadLocalAsBase64(placeholderUrl),
      loadLocalAsBase64(frameGreenUrl),
      loadLocalAsBase64(frameOrangeUrl),
      loadLocalAsBase64(frameRedUrl),
      loadLocalAsBase64(frameRpgUrl),
      loadLocalAsBase64(iconBoardgameUrl),
      loadLocalAsBase64(iconRpgUrl),
    ]);
  cachedAssets = { placeholder, frameGreen, frameOrange, frameRed, frameRpg, iconBoardgame, iconRpg };
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
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return bufferToDataUri(await res.arrayBuffer(), contentType);
  } catch {
    console.warn("[EventImage] Failed to load remote image:", url);
    return null;
  }
}
