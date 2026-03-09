// ---------------------------------------------------------------------------
// Event image — Canvas composition
// ---------------------------------------------------------------------------

import { createCanvas, type Canvas, type SKRSContext2D, type Image } from "@napi-rs/canvas";
import type { ResolvedGame } from "../game-matching";
import { ensureFontsRegistered, getAssets, loadRemoteImage } from "./assets";
import { formatEventDate, formatEventTime } from "./text";
import { getLayout } from "./layouts";
import type { LudoyaEvent } from "../ludoya";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CANVAS_SIZE = 1080;

// Frame dimensions (original asset size)
const POLAROID_W = 300;
const POLAROID_H = 349;
const RPG_W = 300;
const RPG_H = 327;

// Image inset within polaroid frames (where the game cover goes)
// Measured from the frame PNGs: border ~14px, bottom text area ~79px
const POLAROID_INSET = { x: 14, y: 14, w: 272, h: 256 };

// RPG frame inset (film strip borders are wider)
const RPG_INSET = { x: 32, y: 22, w: 236, h: 261 };

// Icon size when rendered on main canvas (not rotated with frame)
const ICON_SIZE = 64;

// Text colors
const DATE_COLOR = "#EEE8DC";

// ---------------------------------------------------------------------------
// Helper: draw image covering an area (cover fit, centered crop)
// ---------------------------------------------------------------------------

function drawCover(
  ctx: SKRSContext2D,
  img: Image,
  dx: number,
  dy: number,
  dw: number,
  dh: number
): void {
  const imgRatio = img.width / img.height;
  const targetRatio = dw / dh;

  let sx: number, sy: number, sw: number, sh: number;
  if (imgRatio > targetRatio) {
    // Image is wider → crop sides
    sh = img.height;
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    // Image is taller → crop top/bottom
    sw = img.width;
    sh = img.width / targetRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

// ---------------------------------------------------------------------------
// Compose a single game frame (frame + cover, no icon)
// ---------------------------------------------------------------------------

interface GameFrameResult {
  canvas: Canvas;
  width: number;
  height: number;
}

async function composeGameFrame(
  game: ResolvedGame,
  gameImage: Image | null
): Promise<GameFrameResult> {
  const assets = await getAssets();

  // Select frame and dimensions
  const isRpg = game.frame === "rpg";
  const frameW = isRpg ? RPG_W : POLAROID_W;
  const frameH = isRpg ? RPG_H : POLAROID_H;
  const inset = isRpg ? RPG_INSET : POLAROID_INSET;

  let frameImg: Image;
  switch (game.frame) {
    case "green":
      frameImg = assets.frameGreen;
      break;
    case "orange":
      frameImg = assets.frameOrange;
      break;
    case "red":
      frameImg = assets.frameRed;
      break;
    case "rpg":
      frameImg = assets.frameRpg;
      break;
  }

  const canvas = createCanvas(frameW, frameH) as Canvas;
  const ctx = canvas.getContext("2d");

  // 1. Draw frame first (center area is opaque black)
  ctx.drawImage(frameImg, 0, 0, frameW, frameH);

  // 2. Draw game cover image on top of the black inset area
  if (gameImage) {
    drawCover(ctx, gameImage, inset.x, inset.y, inset.w, inset.h);
  }

  return { canvas, width: frameW, height: frameH };
}

// ---------------------------------------------------------------------------
// Icon position offsets (relative to frame center, varied per game)
// ---------------------------------------------------------------------------

// Cycle through: bottom-left, bottom-center, bottom-right
const ICON_OFFSETS: Array<{ dx: number; dy: number }> = [
  { dx: -0.30, dy: 0.38 },  // bottom-left
  { dx: 0.00, dy: 0.40 },   // bottom-center
  { dx: 0.30, dy: 0.38 },   // bottom-right
];

// ---------------------------------------------------------------------------
// Main composition: full event image
// ---------------------------------------------------------------------------

export async function composeEventImage(
  event: LudoyaEvent,
  resolvedGames: ResolvedGame[]
): Promise<Buffer> {
  ensureFontsRegistered();
  const assets = await getAssets();

  // Load all game cover images in parallel
  const gameImages = await Promise.all(
    resolvedGames.map((g) => loadRemoteImage(g.imageUrl))
  );

  // Create main canvas
  const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE) as Canvas;
  const ctx = canvas.getContext("2d");

  // 1. Draw placeholder background
  ctx.drawImage(assets.placeholder, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // 2. Draw date text (top-left area)
  const tz = event.timeZone || "Europe/Madrid";
  const dateStr = formatEventDate(event.startsAt, tz);
  const timeStr = formatEventTime(event.startsAt, event.endsAt, tz);

  ctx.fillStyle = DATE_COLOR;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.font = "70px GloriaHallelujah";
  ctx.fillText(dateStr, 44, 26);

  ctx.font = "40px GloriaHallelujah";
  ctx.fillText(timeStr, 130, 125);

  // 3. Draw game frames (rotated) then icons (not rotated) on top
  const layout = getLayout(resolvedGames.length);

  // 3a. Draw all frames with rotation
  for (let i = 0; i < resolvedGames.length; i++) {
    const slot = layout[i];
    const game = resolvedGames[i];
    const gameImg = gameImages[i];

    const frame = await composeGameFrame(game, gameImg);

    const scaledW = frame.width * slot.scale;
    const scaledH = frame.height * slot.scale;

    ctx.save();
    ctx.translate(slot.x, slot.y);
    ctx.rotate(slot.rotation);
    ctx.drawImage(
      frame.canvas,
      -scaledW / 2,
      -scaledH / 2,
      scaledW,
      scaledH
    );
    ctx.restore();
  }

  // 3b. Draw icons on top, without rotation, at varied positions
  for (let i = 0; i < resolvedGames.length; i++) {
    const game = resolvedGames[i];
    if (game.type === "unknown") continue;

    const slot = layout[i];
    const isRpg = game.frame === "rpg";
    const iconImg = isRpg ? assets.iconRpg : assets.iconBoardgame;
    const dynamicIconSize = ICON_SIZE * slot.scale;
    const iconScale = dynamicIconSize / Math.max(iconImg.width, iconImg.height);
    const iconW = iconImg.width * iconScale;
    const iconH = iconImg.height * iconScale;

    // Position icon relative to frame center using varied offsets
    const scaledW = (isRpg ? RPG_W : POLAROID_W) * slot.scale;
    const scaledH = (isRpg ? RPG_H : POLAROID_H) * slot.scale;
    const offset = ICON_OFFSETS[i % ICON_OFFSETS.length];

    const iconX = slot.x + offset.dx * scaledW - iconW / 2;
    const iconY = slot.y + offset.dy * scaledH - iconH / 2;

    ctx.drawImage(iconImg, iconX, iconY, iconW, iconH);
  }

  return canvas.toBuffer("image/png");
}
