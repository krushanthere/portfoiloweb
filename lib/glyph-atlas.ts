import * as THREE from "three";

// Supported character set for the quotes
export const GLYPH_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,'-—✦:;!?\"/()[]{}@#$%&*+=<>_~…";

export interface GlyphAtlasData {
  texture: THREE.CanvasTexture;
  charMap: Map<string, { u: number; v: number; w: number; h: number }>;
  cols: number;
  rows: number;
  charSize: number;
}

let cachedAtlas: GlyphAtlasData | null = null;

export function createGlyphAtlas(): GlyphAtlasData {
  if (cachedAtlas) return cachedAtlas;

  if (typeof document === "undefined") {
    // Server-side placeholder
    const texture = new THREE.CanvasTexture(null as unknown as HTMLCanvasElement);
    return {
      texture,
      charMap: new Map(),
      cols: 16,
      rows: 16,
      charSize: 64,
    };
  }

  const canvas = document.createElement("canvas");
  const size = 1024;
  const cols = 16;
  const rows = 16;
  const cellWidth = size / cols; // 64px
  const cellHeight = size / rows; // 64px

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    throw new Error("Failed to get 2D context for glyph atlas");
  }

  // Clear with transparent black
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, size, size);

  // Typography settings - crisp monospace font with high contrast
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 38px 'Geist Mono', 'JetBrains Mono', 'Courier New', monospace";

  const charMap = new Map<string, { u: number; v: number; w: number; h: number }>();

  const uStep = 1 / cols;
  const vStep = 1 / rows;

  for (let i = 0; i < GLYPH_CHARS.length; i++) {
    const char = GLYPH_CHARS[i];
    const col = i % cols;
    const row = Math.floor(i / cols);

    const x = col * cellWidth + cellWidth / 2;
    const y = row * cellHeight + cellHeight / 2;

    ctx.fillText(char, x, y);

    // Three.js UV coordinates: (0,0) is bottom-left, (1,1) is top-right
    // In canvas: row 0 is top. In UV: top row has v close to 1.0.
    const u = col * uStep;
    const v = 1.0 - (row + 1) * vStep;
    const w = uStep;
    const h = vStep;

    charMap.set(char, { u, v, w, h });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  cachedAtlas = {
    texture,
    charMap,
    cols,
    rows,
    charSize: cellWidth,
  };

  return cachedAtlas;
}
