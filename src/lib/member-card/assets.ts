// ---------------------------------------------------------------------------
// Member card — Asset loading (fonts as ArrayBuffer, background as data URI)
// ---------------------------------------------------------------------------

import {
  FONT_BELLEZA_BASE64,
  FONT_INTRO_BLACK_ALT_BASE64,
  BACKGROUND_DATA_URI,
} from "./asset-data";

// ---------------------------------------------------------------------------
// Font loading (ArrayBuffer for Satori)
// ---------------------------------------------------------------------------

let cachedBelleza: ArrayBuffer | null = null;
let cachedIntroBlackAlt: ArrayBuffer | null = null;

function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function getFontBelleza(): ArrayBuffer {
  if (cachedBelleza) return cachedBelleza;
  cachedBelleza = decodeBase64ToArrayBuffer(FONT_BELLEZA_BASE64);
  return cachedBelleza;
}

export function getFontIntroBlackAlt(): ArrayBuffer {
  if (cachedIntroBlackAlt) return cachedIntroBlackAlt;
  cachedIntroBlackAlt = decodeBase64ToArrayBuffer(FONT_INTRO_BLACK_ALT_BASE64);
  return cachedIntroBlackAlt;
}

// ---------------------------------------------------------------------------
// Background image
// ---------------------------------------------------------------------------

export function getBackground(): string {
  return BACKGROUND_DATA_URI;
}
