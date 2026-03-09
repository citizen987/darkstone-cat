// ---------------------------------------------------------------------------
// Event image — Asset loading and font registration (singleton cache)
// ---------------------------------------------------------------------------

import * as path from "path";
import { GlobalFonts, loadImage, type Image } from "@napi-rs/canvas";

const ASSETS_DIR = path.join(process.cwd(), "public", "generation", "event");

// ---------------------------------------------------------------------------
// Font registration (once per process)
// ---------------------------------------------------------------------------

let fontsRegistered = false;

export function ensureFontsRegistered(): void {
  if (fontsRegistered) return;
  GlobalFonts.registerFromPath(
    path.join(ASSETS_DIR, "font_gloria-hallelujah.ttf"),
    "GloriaHallelujah"
  );
  GlobalFonts.registerFromPath(
    path.join(ASSETS_DIR, "font_luckybones-bold.ttf"),
    "LuckyBones"
  );
  fontsRegistered = true;
}

// ---------------------------------------------------------------------------
// Image cache (loaded once, reused across requests)
// ---------------------------------------------------------------------------

interface AssetCache {
  placeholder: Image;
  frameGreen: Image;
  frameOrange: Image;
  frameRed: Image;
  frameRpg: Image;
  iconBoardgame: Image;
  iconRpg: Image;
}

let cachedAssets: AssetCache | null = null;

export async function getAssets(): Promise<AssetCache> {
  if (cachedAssets) return cachedAssets;

  const [
    placeholder,
    frameGreen,
    frameOrange,
    frameRed,
    frameRpg,
    iconBoardgame,
    iconRpg,
  ] = await Promise.all([
    loadImage(path.join(ASSETS_DIR, "placeholder.png")),
    loadImage(path.join(ASSETS_DIR, "frame_green.png")),
    loadImage(path.join(ASSETS_DIR, "frame_orange.png")),
    loadImage(path.join(ASSETS_DIR, "frame_red.png")),
    loadImage(path.join(ASSETS_DIR, "frame_rpg.png")),
    loadImage(path.join(ASSETS_DIR, "icon_boardgame.png")),
    loadImage(path.join(ASSETS_DIR, "icon_rpg.png")),
  ]);

  cachedAssets = {
    placeholder,
    frameGreen,
    frameOrange,
    frameRed,
    frameRpg,
    iconBoardgame,
    iconRpg,
  };

  return cachedAssets;
}

// ---------------------------------------------------------------------------
// Remote image loading (BGG game covers)
// ---------------------------------------------------------------------------

export async function loadRemoteImage(url: string): Promise<Image | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return await loadImage(buffer);
  } catch {
    console.warn("[EventImage] Failed to load remote image:", url);
    return null;
  }
}
