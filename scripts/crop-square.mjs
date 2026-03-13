import fs from 'node:fs/promises';
import { PNG } from 'pngjs';

const args = process.argv.slice(2);
const input = args.find((_, i, a) => a[i - 1] === '--input');
const output = args.find((_, i, a) => a[i - 1] === '--output');
const size = Number(args.find((_, i, a) => a[i - 1] === '--size') || 256);
const borderWidth = Number(args.find((_, i, a) => a[i - 1] === '--border') || 5);
const addBorder = args.includes('--add-border');
const refPath = args.find((_, i, a) => a[i - 1] === '--ref');

if (!input || !output) {
  console.error('Usage: node crop-square.mjs --input <file> --output <file> [--size 256] [--add-border] [--ref <reference.png>] [--border 5]');
  process.exit(1);
}

const buf = await fs.readFile(input);
const src = PNG.sync.read(buf);
const { width, height, data } = src;

const side = Math.min(width, height);
const sx = Math.round((width - side) / 2);
const sy = Math.round((height - side) / 2);

const dst = new PNG({ width: size, height: size });

for (let dy = 0; dy < size; dy++) {
  const srcY = Math.min(sy + Math.round(dy * side / size), height - 1);
  for (let dx = 0; dx < size; dx++) {
    const srcX = Math.min(sx + Math.round(dx * side / size), width - 1);
    const si = (srcY * width + srcX) * 4;
    const di = (dy * size + dx) * 4;
    dst.data[di] = data[si];
    dst.data[di + 1] = data[si + 1];
    dst.data[di + 2] = data[si + 2];
    dst.data[di + 3] = data[si + 3];
  }
}

if (addBorder) {
  let outerR = 38, outerG = 36, outerB = 34;
  let midR = 62, midG = 58, midB = 54;
  let innerR = 82, innerG = 76, innerB = 70;

  if (refPath) {
    const refBuf = await fs.readFile(refPath);
    const ref = PNG.sync.read(refBuf);
    const rw = ref.width;
    const sample = (x, y) => {
      const i = (y * rw + x) * 4;
      return [ref.data[i], ref.data[i + 1], ref.data[i + 2]];
    };
    [outerR, outerG, outerB] = sample(0, Math.round(rw / 2));
    [midR, midG, midB] = sample(2, Math.round(rw / 2));
    [innerR, innerG, innerB] = sample(borderWidth - 1, Math.round(rw / 2));
  }

  const bw = borderWidth;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distFromEdge = Math.min(x, y, size - 1 - x, size - 1 - y);
      if (distFromEdge >= bw) continue;

      const di = (y * size + x) * 4;
      const t = distFromEdge / (bw - 1);

      if (t < 0.4) {
        dst.data[di] = outerR;
        dst.data[di + 1] = outerG;
        dst.data[di + 2] = outerB;
      } else if (t < 0.7) {
        dst.data[di] = midR;
        dst.data[di + 1] = midG;
        dst.data[di + 2] = midB;
      } else {
        dst.data[di] = innerR;
        dst.data[di + 1] = innerG;
        dst.data[di + 2] = innerB;
      }
      dst.data[di + 3] = 255;
    }
  }
}

await fs.writeFile(output, PNG.sync.write(dst));
const stat = await fs.stat(output);
console.log(`Wrote ${output} (${stat.size} bytes, ${size}x${size})`);
