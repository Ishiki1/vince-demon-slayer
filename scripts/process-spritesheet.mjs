import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const FRAME_SIZE = 512;
const GREEN_THRESHOLD = 38;

function isGreen(r, g, b, a) {
  if (a < 10) return true;
  return g > 120 && g > r * 1.3 && g > b * 1.3 && (g - r) > 40 && (g - b) > 40;
}

function floodFillGreen(png) {
  const { width, height, data } = png;
  const visited = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x++) {
    queue.push([x, 0], [x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    queue.push([0, y], [width - 1, y]);
  }

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const idx = y * width + x;
    if (visited[idx]) continue;
    const pi = idx * 4;
    const r = data[pi], g = data[pi + 1], b = data[pi + 2], a = data[pi + 3];
    if (!isGreen(r, g, b, a) && a > 10) continue;
    visited[idx] = 1;
    data[pi + 3] = 0;
    queue.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
  }

  for (let i = 0; i < width * height; i++) {
    const pi = i * 4;
    if (data[pi + 3] === 0) continue;
    const r = data[pi], g = data[pi + 1], b = data[pi + 2];
    if (isGreen(r, g, b, 255)) {
      const neighbors = [];
      const x = i % width, y = Math.floor(i / width);
      for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const ni = ny * width + nx;
          if (data[ni * 4 + 3] > 0 && !isGreen(data[ni*4], data[ni*4+1], data[ni*4+2], data[ni*4+3])) {
            neighbors.push(ni);
          }
        }
      }
      if (neighbors.length === 0) data[pi + 3] = 0;
    }
  }
  return png;
}

function isDividerLine(png, isVertical, pos, start, end) {
  const { width, height, data } = png;
  let darkCount = 0;
  let total = 0;
  for (let i = start; i < end; i++) {
    const x = isVertical ? pos : i;
    const y = isVertical ? i : pos;
    if (x >= width || y >= height) continue;
    const pi = (y * width + x) * 4;
    const a = data[pi + 3];
    if (a < 10) continue;
    total++;
    const r = data[pi], g = data[pi + 1], b = data[pi + 2];
    if (r < 60 && g < 60 && b < 60) darkCount++;
  }
  return total > 0 && darkCount / total > 0.6;
}

function findFrameBounds(png, cols, rows) {
  const { width, height } = png;
  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(height / rows);
  const frames = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const sx = col * cellW;
      const sy = row * cellH;
      frames.push({ x: sx, y: sy, w: cellW, h: cellH });
    }
  }
  return frames;
}

function extractFrame(png, bounds) {
  const { data, width } = png;
  const frame = new PNG({ width: bounds.w, height: bounds.h });

  for (let y = 0; y < bounds.h; y++) {
    for (let x = 0; x < bounds.w; x++) {
      const srcX = bounds.x + x;
      const srcY = bounds.y + y;
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
      const tx = offsetX + dx;
      const ty = offsetY + dy;
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

function processSheet(inputPath, outputPath, cols, rows) {
  console.log(`Processing ${inputPath} (${cols}x${rows} grid)...`);
  const raw = PNG.sync.read(fs.readFileSync(inputPath));
  console.log(`  Raw dimensions: ${raw.width}x${raw.height}`);

  floodFillGreen(raw);
  console.log('  Green background removed');

  const bounds = findFrameBounds(raw, cols, rows);
  console.log(`  Found ${bounds.length} frame cells`);

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
  const sheet = compositeSheet(processedFrames, FRAME_SIZE);
  const buf = PNG.sync.write(sheet);
  fs.writeFileSync(outputPath, buf);
  console.log(`  Saved: ${outputPath} (${sheet.width}x${sheet.height}, ${processedFrames.length} frames)\n`);
  return processedFrames.length;
}

const args = process.argv.slice(2);
const inputPath = args[0];
const outputPath = args[1];
const cols = parseInt(args[2] || '4');
const rows = parseInt(args[3] || '2');

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/process-spritesheet.mjs <input> <output> [cols] [rows]');
  process.exit(1);
}

processSheet(inputPath, outputPath, cols, rows);
