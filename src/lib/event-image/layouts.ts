// ---------------------------------------------------------------------------
// Event image — Fixed layout presets for 0–8 game slots
// ---------------------------------------------------------------------------
// Canvas: 1080×1080. Game zone: ~(30,200) to ~(1050,880)
// Positions are center-point of each frame on the canvas.
// Frames are 300×349 (polaroid) or 300×327 (rpg) at scale 1.0.
// ---------------------------------------------------------------------------

export interface GameSlot {
  x: number; // Center X on 1080×1080 canvas
  y: number; // Center Y on 1080×1080 canvas
  rotation: number; // Radians (positive = clockwise)
  scale: number; // Frame scale factor (1.0 = 300px wide)
}

const DEG = Math.PI / 180;

// ---------------------------------------------------------------------------
// Layout presets — manually tuned for aesthetic scattered-polaroid look
// ---------------------------------------------------------------------------

const LAYOUTS: Record<number, GameSlot[]> = {
  0: [],

  1: [
    { x: 540, y: 600, rotation: -3 * DEG, scale: 1.80 },
  ],

  2: [
    { x: 360, y: 600, rotation: -7 * DEG, scale: 1.30 },
    { x: 750, y: 620, rotation: 5 * DEG, scale: 1.30 },
  ],

  3: [
    { x: 240, y: 600, rotation: -9 * DEG, scale: 1.05 },
    { x: 550, y: 620, rotation: 4 * DEG, scale: 1.05 },
    { x: 860, y: 590, rotation: 7 * DEG, scale: 1.05 },
  ],

  4: [
    { x: 330, y: 480, rotation: -7 * DEG, scale: 0.92 },
    { x: 760, y: 460, rotation: 8 * DEG, scale: 0.92 },
    { x: 290, y: 810, rotation: 5 * DEG, scale: 0.92 },
    { x: 730, y: 830, rotation: -6 * DEG, scale: 0.92 },
  ],

  5: [
    { x: 250, y: 480, rotation: -8 * DEG, scale: 0.80 },
    { x: 540, y: 460, rotation: 5 * DEG, scale: 0.80 },
    { x: 840, y: 490, rotation: -4 * DEG, scale: 0.80 },
    { x: 360, y: 810, rotation: 7 * DEG, scale: 0.80 },
    { x: 730, y: 790, rotation: -8 * DEG, scale: 0.80 },
  ],

  6: [
    { x: 220, y: 470, rotation: -9 * DEG, scale: 0.80 },
    { x: 540, y: 450, rotation: 5 * DEG, scale: 0.80 },
    { x: 860, y: 480, rotation: -5 * DEG, scale: 0.80 },
    { x: 260, y: 800, rotation: 7 * DEG, scale: 0.80 },
    { x: 560, y: 820, rotation: -6 * DEG, scale: 0.80 },
    { x: 850, y: 790, rotation: 4 * DEG, scale: 0.80 },
  ],

  7: [
    { x: 170, y: 470, rotation: -11 * DEG, scale: 0.80 },
    { x: 420, y: 450, rotation: 5 * DEG, scale: 0.80 },
    { x: 680, y: 480, rotation: -6 * DEG, scale: 0.80 },
    { x: 930, y: 460, rotation: 9 * DEG, scale: 0.80 },
    { x: 230, y: 800, rotation: 7 * DEG, scale: 0.80 },
    { x: 520, y: 820, rotation: -4 * DEG, scale: 0.80 },
    { x: 810, y: 790, rotation: 6 * DEG, scale: 0.80 },
  ],

  8: [
    { x: 160, y: 470, rotation: -10 * DEG, scale: 0.80 },
    { x: 400, y: 450, rotation: 6 * DEG, scale: 0.80 },
    { x: 650, y: 480, rotation: -5 * DEG, scale: 0.80 },
    { x: 910, y: 460, rotation: 8 * DEG, scale: 0.80 },
    { x: 190, y: 800, rotation: 7 * DEG, scale: 0.80 },
    { x: 450, y: 820, rotation: -7 * DEG, scale: 0.80 },
    { x: 710, y: 790, rotation: 4 * DEG, scale: 0.80 },
    { x: 940, y: 810, rotation: -6 * DEG, scale: 0.80 },
  ],
};

export function getLayout(gameCount: number): GameSlot[] {
  const clamped = Math.min(Math.max(gameCount, 0), 8);
  return LAYOUTS[clamped];
}
