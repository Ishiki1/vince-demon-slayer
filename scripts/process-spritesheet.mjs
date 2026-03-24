import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const FRAME_SIZE = 512;

// ---------------------------------------------------------------------------
// HSV conversion
// ---------------------------------------------------------------------------

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0, s = max === 0 ? 0 : d / max, v = max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, v };
}

// ---------------------------------------------------------------------------
// Pass 1 – HSV-based chroma key detection
// ---------------------------------------------------------------------------

function isChromaGreen(r, g, b, a, opts) {
  if (a < 10) return true;
  const { h, s, v } = rgbToHsv(r, g, b);
  const hLo = opts.hueLo ?? 60;
  const hHi = opts.hueHi ?? 170;
  const sMin = opts.satMin ?? 0.15;
  const vMin = opts.valMin ?? 0.10;
  return h >= hLo && h <= hHi && s >= sMin && v >= vMin;
}

function floodFillChromaGreen(png, opts) {
  const { width, height, data } = png;
  const visited = new Uint8Array(width * height);
  const stack = [];

  for (let x = 0; x < width; x++) {
    stack.push(x, 0);
    stack.push(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    stack.push(0, y);
    stack.push(width - 1, y);
  }

  while (stack.length > 0) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const idx = y * width + x;
    if (visited[idx]) continue;
    const pi = idx * 4;
    const r = data[pi], g = data[pi + 1], b = data[pi + 2], a = data[pi + 3];
    if (!isChromaGreen(r, g, b, a, opts)) continue;
    visited[idx] = 1;
    data[pi + 3] = 0;
    stack.push(x - 1, y, x + 1, y, x, y - 1, x, y + 1);
  }

  removeOrphanGreenIslands(png, opts);
  return png;
}

function removeOrphanGreenIslands(png, opts) {
  const { width, height, data } = png;
  for (let i = 0; i < width * height; i++) {
    const pi = i * 4;
    if (data[pi + 3] === 0) continue;
    const r = data[pi], g = data[pi + 1], b = data[pi + 2];
    if (!isChromaGreen(r, g, b, 255, opts)) continue;
    const x = i % width, y = Math.floor(i / width);
    let hasNonGreenNeighbor = false;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const ni = ny * width + nx;
      const na = data[ni * 4 + 3];
      if (na > 0 && !isChromaGreen(data[ni * 4], data[ni * 4 + 1], data[ni * 4 + 2], na, opts)) {
        hasNonGreenNeighbor = true;
        break;
      }
    }
    if (!hasNonGreenNeighbor) data[pi + 3] = 0;
  }
}

// ---------------------------------------------------------------------------
// Pass 2 – Spill suppression (neutralize green fringe on edge pixels)
// ---------------------------------------------------------------------------

function suppressGreenSpill(png, passes) {
  const { width, height, data } = png;
  for (let pass = 0; pass < (passes ?? 2); pass++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pi = (y * width + x) * 4;
        if (data[pi + 3] === 0) continue;
        if (!touchesTransparency(data, width, height, x, y)) continue;
        const r = data[pi], g = data[pi + 1], b = data[pi + 2];
        const maxRB = Math.max(r, b);
        if (g > maxRB + 8) {
          data[pi + 1] = maxRB + 4;
        }
      }
    }
  }
  return png;
}

function touchesTransparency(data, width, height, x, y) {
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true;
    if (data[(ny * width + nx) * 4 + 3] === 0) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Pass 3 – Alpha matting (soft edges near transparency boundary)
// ---------------------------------------------------------------------------

function alphaMatting(png, radius) {
  const r = radius ?? 2;
  const { width, height, data } = png;
  const distMap = new Float32Array(width * height).fill(Infinity);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) {
        distMap[y * width + x] = 0;
      }
    }
  }

  for (let pass = 0; pass < 2; pass++) {
    for (let y = (pass === 0 ? 0 : height - 1); pass === 0 ? y < height : y >= 0; pass === 0 ? y++ : y--) {
      for (let x = (pass === 0 ? 0 : width - 1); pass === 0 ? x < width : x >= 0; pass === 0 ? x++ : x--) {
        const idx = y * width + x;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const nd = distMap[ny * width + nx] + Math.sqrt(dx * dx + dy * dy);
          if (nd < distMap[idx]) distMap[idx] = nd;
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const pi = idx * 4;
      if (data[pi + 3] === 0) continue;
      const dist = distMap[idx];
      if (dist >= r) continue;
      const t = dist / r;
      const softAlpha = Math.round(data[pi + 3] * t);
      data[pi + 3] = Math.max(softAlpha, 0);
    }
  }
  return png;
}

// ---------------------------------------------------------------------------
// Content-aware grid detection (finds frame boundaries via transparent gaps)
// ---------------------------------------------------------------------------

function detectGridBoundaries(png, expectedCols, expectedRows) {
  const { width, height, data } = png;

  function columnOpacity(x) {
    let count = 0;
    for (let y = 0; y < height; y++) {
      if (data[(y * width + x) * 4 + 3] > 20) count++;
    }
    return count / height;
  }

  function rowOpacity(y) {
    let count = 0;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 20) count++;
    }
    return count / width;
  }

  function findGaps(opacityFn, length, expectedCount) {
    const threshold = 0.05;
    const opacities = [];
    for (let i = 0; i < length; i++) opacities.push(opacityFn(i));

    const gaps = [];
    let inGap = false, gapStart = 0;
    for (let i = 0; i < length; i++) {
      if (opacities[i] < threshold) {
        if (!inGap) { inGap = true; gapStart = i; }
      } else {
        if (inGap) {
          gaps.push({ start: gapStart, end: i, mid: Math.floor((gapStart + i) / 2) });
          inGap = false;
        }
      }
    }
    if (inGap) gaps.push({ start: gapStart, end: length, mid: Math.floor((gapStart + length) / 2) });

    const interiorGaps = gaps.filter(g => g.start > 0 && g.end < length);
    if (interiorGaps.length === expectedCount - 1) return interiorGaps;
    return null;
  }

  const vGaps = findGaps(columnOpacity, width, expectedCols);
  const hGaps = findGaps(rowOpacity, height, expectedRows);

  if (vGaps && hGaps) {
    const colStarts = [0, ...vGaps.map(g => g.end)];
    const colEnds = [...vGaps.map(g => g.start), width];
    const rowStarts = [0, ...hGaps.map(g => g.end)];
    const rowEnds = [...hGaps.map(g => g.start), height];

    const frames = [];
    for (let r = 0; r < rowStarts.length; r++) {
      for (let c = 0; c < colStarts.length; c++) {
        frames.push({
          x: colStarts[c],
          y: rowStarts[r],
          w: colEnds[c] - colStarts[c],
          h: rowEnds[r] - rowStarts[r],
        });
      }
    }
    return frames;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Uniform grid fallback
// ---------------------------------------------------------------------------

function findFrameBounds(png, cols, rows) {
  const { width, height } = png;
  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(height / rows);
  const frames = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      frames.push({ x: col * cellW, y: row * cellH, w: cellW, h: cellH });
    }
  }
  return frames;
}

// ---------------------------------------------------------------------------
// Frame extraction and centering (unchanged from v1)
// ---------------------------------------------------------------------------

function extractFrame(png, bounds) {
  const { data, width } = png;
  const frame = new PNG({ width: bounds.w, height: bounds.h });
  for (let y = 0; y < bounds.h; y++) {
    for (let x = 0; x < bounds.w; x++) {
      const srcX = bounds.x + x, srcY = bounds.y + y;
      if (srcX >= png.width || srcY >= png.height) continue;
      const si = (srcY * width + srcX) * 4;
      const di = (y * bounds.w + x) * 4;
      frame.data[di] = data[si];
      frame.data[di + 1] = data[si + 1];
      frame.data[di + 2] = data[si + 2];
      frame.data[di + 3] = data[si + 3];
    }
  }
  return frame;
}

function getContentBounds(png) {
  const { width, height, data } = png;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let hasContent = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 20) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        hasContent = true;
      }
    }
  }
  if (!hasContent) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function centerInFrame(framePng, targetSize) {
  const bounds = getContentBounds(framePng);
  if (!bounds) return new PNG({ width: targetSize, height: targetSize });

  const out = new PNG({ width: targetSize, height: targetSize });
  const scale = Math.min(targetSize * 0.9 / bounds.w, targetSize * 0.9 / bounds.h, 1);
  const scaledW = Math.round(bounds.w * scale);
  const scaledH = Math.round(bounds.h * scale);
  const offsetX = Math.round((targetSize - scaledW) / 2);
  const offsetY = Math.round((targetSize - scaledH) / 2);

  for (let dy = 0; dy < scaledH; dy++) {
    for (let dx = 0; dx < scaledW; dx++) {
      const sx = bounds.x + Math.floor(dx / scale);
      const sy = bounds.y + Math.floor(dy / scale);
      if (sx >= framePng.width || sy >= framePng.height) continue;
      const si = (sy * framePng.width + sx) * 4;
      const tx = offsetX + dx, ty = offsetY + dy;
      if (tx >= targetSize || ty >= targetSize) continue;
      const di = (ty * targetSize + tx) * 4;
      if (framePng.data[si + 3] > 20) {
        out.data[di] = framePng.data[si];
        out.data[di + 1] = framePng.data[si + 1];
        out.data[di + 2] = framePng.data[si + 2];
        out.data[di + 3] = framePng.data[si + 3];
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Sheet compositing
// ---------------------------------------------------------------------------

function compositeSheet(frames, frameSize) {
  const cols = frames.length;
  const sheet = new PNG({ width: frameSize * cols, height: frameSize });
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const xOff = i * frameSize;
    for (let y = 0; y < frameSize; y++) {
      for (let x = 0; x < frameSize; x++) {
        const si = (y * frameSize + x) * 4;
        const di = (y * sheet.width + xOff + x) * 4;
        sheet.data[di] = frame.data[si];
        sheet.data[di + 1] = frame.data[si + 1];
        sheet.data[di + 2] = frame.data[si + 2];
        sheet.data[di + 3] = frame.data[si + 3];
      }
    }
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

function processSheet(inputPath, outputPath, cols, rows, opts) {
  console.log(`Processing ${inputPath} (${cols}x${rows} grid)...`);
  const raw = PNG.sync.read(fs.readFileSync(inputPath));
  console.log(`  Raw dimensions: ${raw.width}x${raw.height}`);

  floodFillChromaGreen(raw, opts);
  console.log('  Pass 1: HSV chroma-key flood fill complete');

  suppressGreenSpill(raw, opts.spillPasses ?? 2);
  console.log('  Pass 2: Green spill suppression complete');

  alphaMatting(raw, opts.matteRadius ?? 2);
  console.log('  Pass 3: Alpha matting complete');

  let bounds = null;
  if (!opts.noAutoGrid) {
    bounds = detectGridBoundaries(raw, cols, rows);
    if (bounds) {
      console.log(`  Content-aware grid detected: ${bounds.length} frames`);
    }
  }
  if (!bounds) {
    bounds = findFrameBounds(raw, cols, rows);
    console.log(`  Uniform grid: ${bounds.length} frame cells`);
  }

  const processedFrames = [];
  for (let i = 0; i < bounds.length; i++) {
    const framePng = extractFrame(raw, bounds[i]);
    const content = getContentBounds(framePng);
    if (!content || content.w < 20 || content.h < 20) {
      console.log(`  Frame ${i}: empty/too small, skipping`);
      continue;
    }
    console.log(`  Frame ${i}: content ${content.w}x${content.h}`);
    const centered = centerInFrame(framePng, FRAME_SIZE);
    processedFrames.push(centered);
  }

  console.log(`  ${processedFrames.length} valid frames`);

  let greenCount = 0;
  for (const frame of processedFrames) {
    for (let i = 0; i < frame.data.length; i += 4) {
      const r = frame.data[i], g = frame.data[i + 1], b = frame.data[i + 2], a = frame.data[i + 3];
      if (a > 0 && g > 200 && r < 100 && b < 100) greenCount++;
    }
  }
  if (greenCount > 0) {
    console.log(`  WARNING: ${greenCount} bright-green pixels remain after cleanup`);
  } else {
    console.log('  Green residue check: CLEAN');
  }

  const sheet = compositeSheet(processedFrames, FRAME_SIZE);
  const buf = PNG.sync.write(sheet);
  fs.writeFileSync(outputPath, buf);
  console.log(`  Saved: ${outputPath} (${sheet.width}x${sheet.height}, ${processedFrames.length} frames)\n`);
  return processedFrames.length;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const positional = [];
const flags = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
    flags[key] = val;
    if (val !== 'true') i++;
  } else {
    positional.push(args[i]);
  }
}

const inputPath = positional[0];
const outputPath = positional[1];
const cols = parseInt(positional[2] || flags.cols || '4');
const rows = parseInt(positional[3] || flags.rows || '3');

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/process-spritesheet.mjs <input> <output> [cols] [rows] [--flags]');
  console.error('Flags:');
  console.error('  --hueLo N        HSV hue lower bound (default 60)');
  console.error('  --hueHi N        HSV hue upper bound (default 170)');
  console.error('  --satMin N       HSV saturation minimum (default 0.15)');
  console.error('  --valMin N       HSV value minimum (default 0.10)');
  console.error('  --spillPasses N  Green spill suppression passes (default 2)');
  console.error('  --matteRadius N  Alpha matting radius in px (default 2)');
  console.error('  --noAutoGrid     Disable content-aware grid detection');
  process.exit(1);
}

const opts = {
  hueLo: parseFloat(flags.hueLo ?? 60),
  hueHi: parseFloat(flags.hueHi ?? 170),
  satMin: parseFloat(flags.satMin ?? 0.15),
  valMin: parseFloat(flags.valMin ?? 0.10),
  spillPasses: parseInt(flags.spillPasses ?? 2),
  matteRadius: parseFloat(flags.matteRadius ?? 2),
  noAutoGrid: flags.noAutoGrid === 'true',
};

processSheet(inputPath, outputPath, cols, rows, opts);
