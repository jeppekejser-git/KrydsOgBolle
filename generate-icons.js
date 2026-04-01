/**
 * Generates icon-192.png and icon-512.png from scratch.
 * Run with: node generate-icons.js
 * Requires only built-in Node.js modules (zlib).
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── CRC32 ──────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xFF];
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// ── PNG writer ─────────────────────────────────────────────────
function pngChunk(type, data) {
  const t   = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function writePNG(filePath, pixels, size) {
  // pixels: Uint8Array, RGBA, row-major
  // Convert to RGB scanlines with filter byte
  const rows = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    rows[y * (1 + size * 3)] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const si = (y * size + x) * 4;
      const di = y * (1 + size * 3) + 1 + x * 3;
      // Composite onto white background (for alpha)
      const a = pixels[si + 3] / 255;
      rows[di]     = Math.round(pixels[si]     * a + 255 * (1 - a));
      rows[di + 1] = Math.round(pixels[si + 1] * a + 255 * (1 - a));
      rows[di + 2] = Math.round(pixels[si + 2] * a + 255 * (1 - a));
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const compressed = zlib.deflateSync(rows, { level: 6 });

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);

  fs.writeFileSync(filePath, png);
  console.log(`Written ${filePath} (${png.length} bytes)`);
}

// ── Drawing helpers ────────────────────────────────────────────
function setPixel(px, size, x, y, r, g, b, a = 255) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const i = (y * size + x) * 4;
  // Alpha blend over existing
  const sa = a / 255, da = px[i + 3] / 255;
  const oa = sa + da * (1 - sa);
  if (oa < 0.001) return;
  px[i]     = Math.round((r * sa + px[i]     * da * (1 - sa)) / oa);
  px[i + 1] = Math.round((g * sa + px[i + 1] * da * (1 - sa)) / oa);
  px[i + 2] = Math.round((b * sa + px[i + 2] * da * (1 - sa)) / oa);
  px[i + 3] = Math.round(oa * 255);
}

function fillEllipse(px, size, cx, cy, rx, ry, r, g, b, a = 255) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) setPixel(px, size, x, y, r, g, b, a);
    }
  }
}

function fillRect(px, size, x1, y1, x2, y2, r, g, b, a = 255) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++)
      setPixel(px, size, x, y, r, g, b, a);
}

function strokeLine(px, size, x0, y0, x1, y1, r, g, b, thick, a = 255) {
  // Bresenham + thickness
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, x = x0, y = y0;
  const h = Math.floor(thick / 2);
  while (true) {
    for (let ty = -h; ty <= h; ty++)
      for (let tx = -h; tx <= h; tx++)
        setPixel(px, size, x + tx, y + ty, r, g, b, a);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 <  dx) { err += dx; y += sy; }
  }
}

// Rounded rectangle mask (clears corners)
function applyRoundedCorners(px, size, radius) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Nearest corner
      let cx = x < radius ? radius : (x > size - 1 - radius ? size - 1 - radius : x);
      let cy = y < radius ? radius : (y > size - 1 - radius ? size - 1 - radius : y);
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy > radius * radius) {
        const i = (y * size + x) * 4;
        px[i + 3] = 0;
      }
    }
  }
}

// ── Icon drawing ───────────────────────────────────────────────
function drawIcon(size) {
  const px = new Uint8Array(size * size * 4); // RGBA, all transparent

  const s = size / 512; // scale factor

  // Background gradient (approximate: blend two greens top→bottom)
  for (let y = 0; y < size; y++) {
    const t  = y / size;
    const r  = Math.round(139 + (85  - 139) * t);  // 8BC34A → 558B2F
    const g  = Math.round(195 + (139 - 195) * t);
    const b  = Math.round(74  + (47  - 74)  * t);
    for (let x = 0; x < size; x++) setPixel(px, size, x, y, r, g, b, 255);
  }

  // Twig grid lines  (x≈170/512, x≈342/512, y≈170/512, y≈342/512)
  const g1 = Math.round(170 * s), g2 = Math.round(342 * s);
  const tw = Math.max(3, Math.round(12 * s));
  strokeLine(px, size, g1, 0,    g1, size, 93, 64, 55, tw);
  strokeLine(px, size, g2, 0,    g2, size, 93, 64, 55, tw);
  strokeLine(px, size, 0,  g1,  size, g1,  93, 64, 55, tw);
  strokeLine(px, size, 0,  g2,  size, g2,  93, 64, 55, tw);

  // ── Easter egg (bottom-right cell, center ~427,427 scaled) ──
  const ex = Math.round(427 * s), ey = Math.round(427 * s);
  const erx = Math.round(55 * s), ery = Math.round(68 * s);
  fillEllipse(px, size, ex, ey, erx, ery, 253, 216, 53);  // yellow
  // pink band
  for (let y = ey - Math.round(14 * s); y <= ey + Math.round(14 * s); y++) {
    for (let x = ex - erx; x <= ex + erx; x++) {
      const nx = (x - ex) / erx, ny = (y - ey) / ery;
      if (nx * nx + ny * ny <= 1) setPixel(px, size, x, y, 240, 98, 146);
    }
  }
  fillEllipse(px, size, ex - Math.round(22*s), ey - Math.round(34*s), 7*s, 7*s, 79, 195, 247);
  fillEllipse(px, size, ex + Math.round(22*s), ey - Math.round(34*s), 7*s, 7*s, 174,213, 129);
  fillEllipse(px, size, ex,                    ey - Math.round(46*s), 6*s, 6*s, 174,213, 129);
  fillEllipse(px, size, ex - Math.round(22*s), ey + Math.round(38*s), 7*s, 7*s, 174,213, 129);
  fillEllipse(px, size, ex + Math.round(22*s), ey + Math.round(38*s), 7*s, 7*s, 79, 195, 247);

  // ── Bunny head (top-left cell, center ~85,85 scaled) ──
  const bx = Math.round(85 * s), by = Math.round(85 * s);
  const hr = Math.round(38 * s);
  // Ears
  fillEllipse(px, size, bx - Math.round(18*s), by - Math.round(32*s), Math.round(12*s), Math.round(24*s), 252, 205, 217);
  fillEllipse(px, size, bx + Math.round(18*s), by - Math.round(32*s), Math.round(12*s), Math.round(24*s), 252, 205, 217);
  fillEllipse(px, size, bx - Math.round(18*s), by - Math.round(32*s), Math.round(6*s),  Math.round(17*s), 244, 143, 177);
  fillEllipse(px, size, bx + Math.round(18*s), by - Math.round(32*s), Math.round(6*s),  Math.round(17*s), 244, 143, 177);
  // Head
  fillEllipse(px, size, bx, by + Math.round(6*s), hr, Math.round(34*s), 252, 205, 217);
  // Eyes
  fillEllipse(px, size, bx - Math.round(12*s), by + Math.round(2*s), Math.round(6*s), Math.round(6*s), 62, 39, 35);
  fillEllipse(px, size, bx + Math.round(12*s), by + Math.round(2*s), Math.round(6*s), Math.round(6*s), 62, 39, 35);
  fillEllipse(px, size, bx - Math.round(10*s), by,                   Math.round(2.5*s), Math.round(2.5*s), 255, 255, 255);
  fillEllipse(px, size, bx + Math.round(14*s), by,                   Math.round(2.5*s), Math.round(2.5*s), 255, 255, 255);
  // Nose
  fillEllipse(px, size, bx, by + Math.round(14*s), Math.round(6*s), Math.round(4*s), 233, 30, 99);

  // Rounded corners
  applyRoundedCorners(px, size, Math.round(80 * s));

  return px;
}

// ── Generate icons ─────────────────────────────────────────────
const outDir = path.join(__dirname, 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

[192, 512].forEach(size => {
  const px = drawIcon(size);
  writePNG(path.join(outDir, `icon-${size}.png`), px, size);
});

console.log('Icons generated successfully.');
