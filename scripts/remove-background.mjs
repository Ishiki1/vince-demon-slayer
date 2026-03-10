import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function quantize(value, step) {
  return clamp(Math.round(value / step) * step, 0, 255);
}

function colorKey(pixel, step) {
  return [
    quantize(pixel.r, step),
    quantize(pixel.g, step),
    quantize(pixel.b, step),
  ].join(',');
}

function parseColorKey(key) {
  const [r, g, b] = key.split(',').map((part) => Number(part));
  return { r, g, b };
}

function matchesPalette(pixel, palette, threshold) {
  if (pixel.a === 0) return true;
  return palette.some((bg) =>
    Math.abs(pixel.r - bg.r) <= threshold &&
    Math.abs(pixel.g - bg.g) <= threshold &&
    Math.abs(pixel.b - bg.b) <= threshold
  );
}

function readPixel(data, width, channels, x, y) {
  const idx = (y * width + x) * channels;
  return {
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3],
  };
}

function isGreenDominant(pixel, margin = 12) {
  return pixel.a > 0 && pixel.g > pixel.r + margin && pixel.g > pixel.b + margin;
}

function touchesTransparency(data, width, height, x, y) {
  const neighbors = [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ];
  return neighbors.some(([nx, ny]) => {
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true;
    const neighborAlphaIdx = (ny * width + nx) * 4 + 3;
    return data[neighborAlphaIdx] === 0;
  });
}

function createEmptyImage(width, height) {
  return {
    width,
    height,
    data: Buffer.alloc(width * height * 4, 0),
  };
}

function cropImage(image, left, top, width, height) {
  const cropped = createEmptyImage(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = ((top + y) * image.width + (left + x)) * 4;
      const dstIdx = (y * width + x) * 4;
      cropped.data[dstIdx] = image.data[srcIdx];
      cropped.data[dstIdx + 1] = image.data[srcIdx + 1];
      cropped.data[dstIdx + 2] = image.data[srcIdx + 2];
      cropped.data[dstIdx + 3] = image.data[srcIdx + 3];
    }
  }
  return cropped;
}

function resizeNearest(image, targetWidth, targetHeight) {
  const resized = createEmptyImage(targetWidth, targetHeight);
  for (let y = 0; y < targetHeight; y++) {
    const sourceY = clamp(Math.floor((y / targetHeight) * image.height), 0, image.height - 1);
    for (let x = 0; x < targetWidth; x++) {
      const sourceX = clamp(Math.floor((x / targetWidth) * image.width), 0, image.width - 1);
      const srcIdx = (sourceY * image.width + sourceX) * 4;
      const dstIdx = (y * targetWidth + x) * 4;
      resized.data[dstIdx] = image.data[srcIdx];
      resized.data[dstIdx + 1] = image.data[srcIdx + 1];
      resized.data[dstIdx + 2] = image.data[srcIdx + 2];
      resized.data[dstIdx + 3] = image.data[srcIdx + 3];
    }
  }
  return resized;
}

function compositeCentered(base, overlay, left, top) {
  for (let y = 0; y < overlay.height; y++) {
    for (let x = 0; x < overlay.width; x++) {
      const dstX = left + x;
      const dstY = top + y;
      if (dstX < 0 || dstY < 0 || dstX >= base.width || dstY >= base.height) continue;
      const srcIdx = (y * overlay.width + x) * 4;
      const dstIdx = (dstY * base.width + dstX) * 4;
      base.data[dstIdx] = overlay.data[srcIdx];
      base.data[dstIdx + 1] = overlay.data[srcIdx + 1];
      base.data[dstIdx + 2] = overlay.data[srcIdx + 2];
      base.data[dstIdx + 3] = overlay.data[srcIdx + 3];
    }
  }
}

function removeEdgeMatteSpill(data, width, height, palette, threshold) {
  if (palette.length === 0) return data;
  const spillThreshold = Math.max(threshold + 24, 48);
  let current = Buffer.from(data);

  for (let pass = 0; pass < 2; pass++) {
    const next = Buffer.from(current);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const pixel = {
          r: current[idx],
          g: current[idx + 1],
          b: current[idx + 2],
          a: current[idx + 3],
        };
        if (pixel.a === 0) continue;
        if (!matchesPalette(pixel, palette, spillThreshold)) continue;
        if (pixel.g <= pixel.r + 16 || pixel.g <= pixel.b + 16) continue;

        const neighbors = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ];
        const hitsTransparency = neighbors.some(([nx, ny]) => {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true;
          const neighborAlphaIdx = (ny * width + nx) * 4 + 3;
          return current[neighborAlphaIdx] === 0;
        });
        if (!hitsTransparency) continue;

        next[idx] = 0;
        next[idx + 1] = 0;
        next[idx + 2] = 0;
        next[idx + 3] = 0;
      }
    }
    current = next;
  }

  return current;
}

function neutralizeGreenFringe(data, width, height, palette, threshold) {
  if (palette.length === 0) return data;
  const next = Buffer.from(data);
  const spillThreshold = Math.max(threshold + 28, 56);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pixel = {
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        a: data[idx + 3],
      };
      if (pixel.a === 0) continue;
      if (!touchesTransparency(data, width, height, x, y)) continue;

      if (matchesPalette(pixel, palette, spillThreshold)) {
        next[idx] = 0;
        next[idx + 1] = 0;
        next[idx + 2] = 0;
        next[idx + 3] = 0;
        continue;
      }

      if (!isGreenDominant(pixel, 8)) continue;

      const darkenedR = Math.round(pixel.r * 0.88);
      const darkenedB = Math.round(pixel.b * 0.92);
      const maxSide = Math.max(darkenedR, darkenedB);
      next[idx] = darkenedR;
      next[idx + 1] = Math.min(pixel.g, maxSide + 4);
      next[idx + 2] = darkenedB;
      next[idx + 3] = pixel.a;
    }
  }

  return next;
}

function removeEnclosedPaletteIslands(data, width, height, palette, threshold) {
  if (palette.length === 0) return data;
  const result = Buffer.from(data);
  const visited = new Uint8Array(width * height);
  const islandThreshold = Math.max(threshold + 8, 28);
  const neighbors = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (let startY = 0; startY < height; startY++) {
    for (let startX = 0; startX < width; startX++) {
      const startIndex = startY * width + startX;
      if (visited[startIndex]) continue;
      const startPixel = readPixel(result, width, 4, startX, startY);
      if (startPixel.a === 0 || !matchesPalette(startPixel, palette, islandThreshold)) continue;

      const queue = [[startX, startY]];
      const region = [];
      let touchesBorder = false;
      visited[startIndex] = 1;

      while (queue.length > 0) {
        const [x, y] = queue.shift();
        region.push([x, y]);
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesBorder = true;

        neighbors.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
          const index = ny * width + nx;
          if (visited[index]) return;
          const pixel = readPixel(result, width, 4, nx, ny);
          if (pixel.a === 0 || !matchesPalette(pixel, palette, islandThreshold)) return;
          visited[index] = 1;
          queue.push([nx, ny]);
        });
      }

      if (touchesBorder) continue;

      region.forEach(([x, y]) => {
        const idx = (y * width + x) * 4;
        result[idx] = 0;
        result[idx + 1] = 0;
        result[idx + 2] = 0;
        result[idx + 3] = 0;
      });
    }
  }

  return result;
}

function fillSmallTransparentHoles(data, width, height, maxHoleSize = 24) {
  const result = Buffer.from(data);
  const visited = new Uint8Array(width * height);
  const neighbors = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (let startY = 0; startY < height; startY++) {
    for (let startX = 0; startX < width; startX++) {
      const startIdx = startY * width + startX;
      if (visited[startIdx]) continue;
      const alphaIdx = startIdx * 4 + 3;
      if (result[alphaIdx] !== 0) continue;

      const queue = [[startX, startY]];
      const region = [];
      const boundaryPixels = [];
      let touchesBorder = false;
      visited[startIdx] = 1;

      while (queue.length > 0) {
        const [x, y] = queue.shift();
        region.push([x, y]);
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesBorder = true;

        neighbors.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
          const nIndex = ny * width + nx;
          const nAlphaIdx = nIndex * 4 + 3;
          if (result[nAlphaIdx] === 0) {
            if (!visited[nIndex]) {
              visited[nIndex] = 1;
              queue.push([nx, ny]);
            }
            return;
          }
          boundaryPixels.push([
            result[nIndex * 4],
            result[nIndex * 4 + 1],
            result[nIndex * 4 + 2],
            result[nAlphaIdx],
          ]);
        });
      }

      if (touchesBorder || region.length === 0 || region.length > maxHoleSize || boundaryPixels.length === 0) continue;

      const avg = boundaryPixels.reduce((sum, [r, g, b, a]) => {
        sum.r += r;
        sum.g += g;
        sum.b += b;
        sum.a += a;
        return sum;
      }, { r: 0, g: 0, b: 0, a: 0 });

      const count = boundaryPixels.length;
      const fillR = Math.round((avg.r / count) * 0.9);
      const fillG = Math.round((avg.g / count) * 0.9);
      const fillB = Math.round((avg.b / count) * 0.9);
      const fillA = Math.round(avg.a / count);

      region.forEach(([x, y]) => {
        const idx = (y * width + x) * 4;
        result[idx] = fillR;
        result[idx + 1] = fillG;
        result[idx + 2] = fillB;
        result[idx + 3] = fillA;
      });
    }
  }

  return result;
}

export async function removeBackgroundImage(options) {
  const input = options.input;
  if (!input) throw new Error('Missing required input path');

  const output = options.output || input;
  const canvasSize = Math.max(16, Math.round(toNumber(options.canvas, 256)));
  const padding = Math.max(0, Math.round(toNumber(options.padding, 20)));
  const threshold = Math.max(0, Math.round(toNumber(options.threshold, 18)));
  const quantizeStep = Math.max(1, Math.round(toNumber(options.quantize, 16)));
  const maxPaletteColors = Math.max(1, Math.round(toNumber(options.maxPalette, 24)));

  const sourceBuffer = await fs.readFile(input);
  const png = PNG.sync.read(sourceBuffer);
  const { width, height } = png;
  const channels = 4;
  const data = png.data;

  const borderCounts = new Map();
  const addBorderPixel = (x, y) => {
    const pixel = readPixel(data, width, channels, x, y);
    if (pixel.a === 0) return;
    const key = colorKey(pixel, quantizeStep);
    borderCounts.set(key, (borderCounts.get(key) || 0) + 1);
  };

  for (let x = 0; x < width; x++) {
    addBorderPixel(x, 0);
    addBorderPixel(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    addBorderPixel(0, y);
    addBorderPixel(width - 1, y);
  }

  const palette = [...borderCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxPaletteColors)
    .map(([key]) => parseColorKey(key));

  const visited = new Uint8Array(width * height);
  const queue = [];
  const tryQueue = (x, y) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    const pixel = readPixel(data, width, channels, x, y);
    if (!matchesPalette(pixel, palette, threshold)) return;
    visited[idx] = 1;
    queue.push([x, y]);
  };

  if (palette.length > 0) {
    for (let x = 0; x < width; x++) {
      tryQueue(x, 0);
      tryQueue(x, height - 1);
    }
    for (let y = 1; y < height - 1; y++) {
      tryQueue(0, y);
      tryQueue(width - 1, y);
    }
  }

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    neighbors.forEach(([nx, ny]) => {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
      const idx = ny * width + nx;
      if (visited[idx]) return;
      const pixel = readPixel(data, width, channels, nx, ny);
      if (!matchesPalette(pixel, palette, threshold)) return;
      visited[idx] = 1;
      queue.push([nx, ny]);
    });
  }

  const cleaned = Buffer.from(data);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const visitIdx = y * width + x;
      if (!visited[visitIdx]) continue;
      const idx = (y * width + x) * channels;
      cleaned[idx] = 0;
      cleaned[idx + 1] = 0;
      cleaned[idx + 2] = 0;
      cleaned[idx + 3] = 0;
    }
  }
  const cleanedWithSpillRemoval = removeEdgeMatteSpill(cleaned, width, height, palette, threshold);
  const cleanedWithIslandRemoval = removeEnclosedPaletteIslands(cleanedWithSpillRemoval, width, height, palette, threshold);
  const cleanedWithNeutralizedFringe = neutralizeGreenFringe(cleanedWithIslandRemoval, width, height, palette, threshold);
  const cleanedWithHoleFill = fillSmallTransparentHoles(cleanedWithNeutralizedFringe, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels + 3;
      if (cleanedWithHoleFill[idx] === 0) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error('No opaque pixels remain after background removal');
  }

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  const cropped = cropImage({ width, height, data: cleanedWithHoleFill }, minX, minY, cropWidth, cropHeight);
  const innerSize = Math.max(1, canvasSize - padding * 2);
  const scale = Math.min(innerSize / cropped.width, innerSize / cropped.height);
  const resizedWidth = Math.max(1, Math.round(cropped.width * scale));
  const resizedHeight = Math.max(1, Math.round(cropped.height * scale));
  const resized = resizeNearest(cropped, resizedWidth, resizedHeight);

  const left = Math.floor((canvasSize - resized.width) / 2);
  const top = Math.floor((canvasSize - resized.height) / 2);

  const composed = createEmptyImage(canvasSize, canvasSize);
  compositeCentered(composed, resized, left, top);
  const finalWithoutFringe = neutralizeGreenFringe(composed.data, composed.width, composed.height, palette, threshold);
  const finalData = fillSmallTransparentHoles(finalWithoutFringe, composed.width, composed.height, Math.max(12, Math.round(canvasSize * 0.02)));
  const encoded = PNG.sync.write({
    width: composed.width,
    height: composed.height,
    data: finalData,
  });

  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, encoded);

  return {
    input,
    output,
    detectedBackgroundColors: palette,
    crop: { left: minX, top: minY, width: cropWidth, height: cropHeight },
    canvasSize,
    finalContent: { width: resized.width, height: resized.height, left, top },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await removeBackgroundImage({
    input: args.input,
    output: args.output,
    canvas: args.canvas,
    padding: args.padding,
    threshold: args.threshold,
    quantize: args.quantize,
    maxPalette: args.maxPalette,
  });
  console.log(JSON.stringify(result));
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}
