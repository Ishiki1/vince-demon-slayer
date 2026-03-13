import fs from 'node:fs/promises';
import { PNG } from 'pngjs';

const args = process.argv.slice(2);
const input = args.find((_, i, a) => a[i - 1] === '--input');
const output = args.find((_, i, a) => a[i - 1] === '--output');
const refPath = args.find((_, i, a) => a[i - 1] === '--ref');

if (!input || !output || !refPath) {
  console.error('Usage: node composite-skill-icon.mjs --input <transparent.png> --output <final.png> --ref <reference-icon.png>');
  process.exit(1);
}

const refBuf = await fs.readFile(refPath);
const ref = PNG.sync.read(refBuf);
const SIZE = ref.width;

const srcBuf = await fs.readFile(input);
const src = PNG.sync.read(srcBuf);

const dst = new PNG({ width: SIZE, height: SIZE });

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const ri = (y * SIZE + x) * 4;
    dst.data[ri] = ref.data[ri];
    dst.data[ri + 1] = ref.data[ri + 1];
    dst.data[ri + 2] = ref.data[ri + 2];
    dst.data[ri + 3] = ref.data[ri + 3];
  }
}

const bgR = 22, bgG = 24, bgB = 34;
const borderW = 5;
for (let y = borderW; y < SIZE - borderW; y++) {
  for (let x = borderW; x < SIZE - borderW; x++) {
    const di = (y * SIZE + x) * 4;
    dst.data[di] = bgR;
    dst.data[di + 1] = bgG;
    dst.data[di + 2] = bgB;
    dst.data[di + 3] = 255;
  }
}

const scaleX = src.width / (SIZE - borderW * 2);
const scaleY = src.height / (SIZE - borderW * 2);

for (let y = borderW; y < SIZE - borderW; y++) {
  for (let x = borderW; x < SIZE - borderW; x++) {
    const srcX = Math.min(Math.round((x - borderW) * scaleX), src.width - 1);
    const srcY = Math.min(Math.round((y - borderW) * scaleY), src.height - 1);
    const si = (srcY * src.width + srcX) * 4;
    const alpha = src.data[si + 3] / 255;
    if (alpha === 0) continue;

    const di = (y * SIZE + x) * 4;
    dst.data[di] = Math.round(src.data[si] * alpha + dst.data[di] * (1 - alpha));
    dst.data[di + 1] = Math.round(src.data[si + 1] * alpha + dst.data[di + 1] * (1 - alpha));
    dst.data[di + 2] = Math.round(src.data[si + 2] * alpha + dst.data[di + 2] * (1 - alpha));
    dst.data[di + 3] = 255;
  }
}

await fs.writeFile(output, PNG.sync.write(dst));
const stat = await fs.stat(output);
console.log(`Wrote ${output} (${stat.size} bytes, ${SIZE}x${SIZE})`);
