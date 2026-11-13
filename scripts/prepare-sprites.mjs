// Turns the source art in art/source/ into clean, game-ready sprites in public/sprites/.
//   npm run sprites
//
// Loid: the source is an upscaled pixel-art JPEG on white with a caption. We find the figure's
// bounding box, sample each "art pixel" back down to native resolution, flood-fill the outer
// white to transparent (the black outline protects interior whites like the shirt collar),
// then export a native-size sprite plus a head crop for the game piece.
//
// Anya: the source is a 4x4 sheet of 64x64 walking frames that is already transparent. We copy
// the sheet, and export the front-facing idle frame and a head crop for the game piece.

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const OUT = 'src/assets/sprites';
await mkdir(OUT, { recursive: true });

// ---------- Loid ----------
{
  const src = 'art/source/loid_forger_dr_style_pixel_sprite_by_hokky1_dfa4j71.jpg';
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const at = (x, y) => (y * W + x) * 3;
  const isInk = (x, y) => {
    const i = at(x, y);
    return data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235;
  };

  // The figure is the first vertical band of ink; the caption is the second.
  let y0 = -1, y1 = -1;
  for (let y = 0; y < H; y++) {
    let ink = false;
    for (let x = 0; x < W && !ink; x++) ink = isInk(x, y);
    if (ink && y0 < 0) y0 = y;
    if (!ink && y0 >= 0) { y1 = y - 1; break; }
  }
  let x0 = W, x1 = 0;
  for (let y = y0; y <= y1; y++) for (let x = 0; x < W; x++) if (isInk(x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }

  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  // Estimate art-pixel size from the shortest consistent run; the art is ~25px per pixel.
  const cell = 25.4;
  const cols = Math.round(bw / cell), rows = Math.round(bh / cell);
  const cw = bw / cols, ch = bh / rows;

  // Sample the median colour of the central region of each cell (robust to JPEG noise).
  const PAD = 1; // transparent border so the flood fill can wrap around the figure
  const OW = cols + PAD * 2, OH = rows + PAD * 2;
  const px = new Uint8ClampedArray(OW * OH * 4);
  const median = (arr) => arr.sort((a, b) => a - b)[arr.length >> 1];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cx = x0 + (c + 0.5) * cw, cy = y0 + (r + 0.5) * ch;
    const R = [], G = [], B = [];
    for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
      const i = at(Math.round(cx + dx), Math.round(cy + dy));
      R.push(data[i]); G.push(data[i + 1]); B.push(data[i + 2]);
    }
    const o = ((r + PAD) * OW + (c + PAD)) * 4;
    px[o] = median(R); px[o + 1] = median(G); px[o + 2] = median(B); px[o + 3] = 255;
  }
  // Padding cells start as white.
  for (let i = 0; i < OW * OH; i++) if (px[i * 4 + 3] === 0) { px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = 255; px[i * 4 + 3] = 255; }

  // Flood-fill near-white from the corner to transparent.
  const white = (i) => px[i * 4] > 225 && px[i * 4 + 1] > 225 && px[i * 4 + 2] > 225 && px[i * 4 + 3] === 255;
  const stack = [0];
  while (stack.length) {
    const i = stack.pop();
    if (!white(i)) continue;
    px[i * 4 + 3] = 0;
    const x = i % OW, y = (i / OW) | 0;
    if (x > 0) stack.push(i - 1);
    if (x < OW - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - OW);
    if (y < OH - 1) stack.push(i + OW);
  }

  const raw = { raw: { width: OW, height: OH, channels: 4 } };
  await sharp(Buffer.from(px), raw).png().toFile(`${OUT}/loid.png`);
  // Head = hat + face down to the chin: the top 16 art rows (+ padding), squared up for the piece.
  const headH = 16 + PAD;
  const side = Math.max(OW, headH);
  await sharp(Buffer.from(px), raw)
    .extract({ left: 0, top: 0, width: OW, height: headH })
    .extend({ top: Math.floor((side - headH) / 2), bottom: Math.ceil((side - headH) / 2), left: Math.floor((side - OW) / 2), right: Math.ceil((side - OW) / 2), background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(`${OUT}/loid-head.png`);
  console.log(`loid: ${cols}x${rows} art pixels (cell ${cw.toFixed(2)}x${ch.toFixed(2)})`);
}

// ---------- Anya ----------
{
  const src = 'art/source/anya_forger_overworld_sprite_by_darkusshadow_df58sr3.png';
  await sharp(src).png().toFile(`${OUT}/anya-sheet.png`);
  // Front-facing idle frame (row 0, col 0), trimmed to content.
  const frame = await sharp(src).extract({ left: 0, top: 0, width: 64, height: 64 }).png().toBuffer();
  const trimmed = await sharp(frame).trim({ threshold: 0 }).png().toBuffer({ resolveWithObject: true });
  await sharp(trimmed.data).png().toFile(`${OUT}/anya.png`);
  const { width: tw, height: th } = trimmed.info;
  // Head = hair + face (top ~68% of the trimmed figure), squared.
  const headH = Math.round(th * 0.68);
  const side = Math.max(tw, headH);
  await sharp(trimmed.data)
    .extract({ left: 0, top: 0, width: tw, height: headH })
    .extend({ top: Math.floor((side - headH) / 2), bottom: Math.ceil((side - headH) / 2), left: Math.floor((side - tw) / 2), right: Math.ceil((side - tw) / 2), background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(`${OUT}/anya-head.png`);
  console.log(`anya: idle frame ${tw}x${th}, head ${side}x${side}`);
}
