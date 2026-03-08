import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
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

function createImage(width, height) {
  return {
    width,
    height,
    data: Buffer.alloc(width * height * 4, 0),
  };
}

function readAlpha(data, width, x, y) {
  return data[(y * width + x) * 4 + 3];
}

function writePixel(data, width, x, y, r, g, b, a) {
  const idx = (y * width + x) * 4;
  data[idx] = r;
  data[idx + 1] = g;
  data[idx + 2] = b;
  data[idx + 3] = a;
}

function copyPixel(src, dst, srcWidth, dstWidth, srcX, srcY, dstX, dstY) {
  const srcIdx = (srcY * srcWidth + srcX) * 4;
  const dstIdx = (dstY * dstWidth + dstX) * 4;
  dst[dstIdx] = src[srcIdx];
  dst[dstIdx + 1] = src[srcIdx + 1];
  dst[dstIdx + 2] = src[srcIdx + 2];
  dst[dstIdx + 3] = src[srcIdx + 3];
}

function glowStrength(frameIndex, frameCount) {
  const mid = (frameCount - 1) / 2;
  const distance = Math.abs(frameIndex - mid);
  const maxDistance = Math.max(mid, 1);
  const normalized = 1 - (distance / maxDistance);
  return Math.max(0, normalized);
}

function generateFrame(icon, frameIndex, frameCount) {
  const frame = createImage(icon.width, icon.height);
  const strength = glowStrength(frameIndex, frameCount);
  const outerRadius = 3;
  const innerRadius = 1.5;

  for (let y = 0; y < icon.height; y += 1) {
    for (let x = 0; x < icon.width; x += 1) {
      const alpha = readAlpha(icon.data, icon.width, x, y);
      if (alpha > 0) {
        copyPixel(icon.data, frame.data, icon.width, frame.width, x, y, x, y);
        continue;
      }

      let nearest = Infinity;
      for (let oy = -outerRadius; oy <= outerRadius; oy += 1) {
        for (let ox = -outerRadius; ox <= outerRadius; ox += 1) {
          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= icon.width || ny >= icon.height) continue;
          if (readAlpha(icon.data, icon.width, nx, ny) === 0) continue;
          const dist = Math.sqrt((ox * ox) + (oy * oy));
          if (dist < nearest) nearest = dist;
        }
      }

      if (!Number.isFinite(nearest) || nearest > outerRadius) continue;

      const falloff = nearest <= innerRadius
        ? 1
        : 1 - ((nearest - innerRadius) / (outerRadius - innerRadius));
      const alphaOut = Math.round(210 * strength * clamp(falloff, 0, 1));
      if (alphaOut <= 0) continue;

      const r = 255;
      const g = nearest <= 2 ? 226 : 181;
      const b = nearest <= 2 ? 92 : 36;
      writePixel(frame.data, frame.width, x, y, r, g, b, alphaOut);
    }
  }

  return frame;
}

export async function generateHoverSheet(options) {
  const input = options.input;
  const output = options.output;
  const frames = Number(options.frames || 20);
  if (!input || !output) throw new Error('Expected input and output');

  const source = PNG.sync.read(await fs.readFile(input));
  const sheet = createImage(source.width * frames, source.height);

  for (let frameIndex = 0; frameIndex < frames; frameIndex += 1) {
    const frame = generateFrame(source, frameIndex, frames);
    for (let y = 0; y < frame.height; y += 1) {
      for (let x = 0; x < frame.width; x += 1) {
        copyPixel(
          frame.data,
          sheet.data,
          frame.width,
          sheet.width,
          x,
          y,
          x + (frameIndex * frame.width),
          y
        );
      }
    }
  }

  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, PNG.sync.write(sheet));
  return { input, output, frames };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await generateHoverSheet({
    input: args.input,
    output: args.output,
    frames: args.frames,
  });
  console.log(JSON.stringify(result, null, 2));
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}
