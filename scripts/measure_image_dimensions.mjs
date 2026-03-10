import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

function parseArgs(argv) {
  const args = { input: null };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--input') {
      args.input = argv[i + 1];
      i += 1;
    }
  }
  if (!args.input) {
    throw new Error('Usage: node scripts/measure_image_dimensions.mjs --input <path>');
  }
  return args;
}

function parseSvgDimensions(raw) {
  const widthMatch = raw.match(/\bwidth=["']([0-9.]+)(px)?["']/i);
  const heightMatch = raw.match(/\bheight=["']([0-9.]+)(px)?["']/i);
  if (widthMatch && heightMatch) {
    return {
      width: Math.round(Number(widthMatch[1])),
      height: Math.round(Number(heightMatch[1])),
      source: 'width-height',
    };
  }

  const viewBoxMatch = raw.match(/\bviewBox=["'][^"']*?([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)["']/i);
  if (viewBoxMatch) {
    return {
      width: Math.round(Number(viewBoxMatch[3])),
      height: Math.round(Number(viewBoxMatch[4])),
      source: 'viewBox',
    };
  }

  throw new Error('Could not determine SVG dimensions.');
}

function readJpegSize(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    const isSof = [
      0xc0, 0xc1, 0xc2, 0xc3,
      0xc5, 0xc6, 0xc7,
      0xc9, 0xca, 0xcb,
      0xcd, 0xce, 0xcf,
    ].includes(marker);
    if (isSof) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += 2 + length;
  }
  throw new Error('Could not determine JPEG dimensions.');
}

function measureImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') {
    const png = PNG.sync.read(fs.readFileSync(filePath));
    return { width: png.width, height: png.height, type: 'png' };
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    const jpeg = readJpegSize(fs.readFileSync(filePath));
    return { ...jpeg, type: 'jpeg' };
  }
  if (ext === '.svg') {
    const svg = parseSvgDimensions(fs.readFileSync(filePath, 'utf8'));
    return { width: svg.width, height: svg.height, type: 'svg', source: svg.source };
  }
  throw new Error(`Unsupported file type: ${ext}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const resolved = path.resolve(args.input);
  const result = measureImage(resolved);
  console.log(JSON.stringify({
    input: args.input,
    resolved,
    width: result.width,
    height: result.height,
    type: result.type,
    ...(result.source ? { source: result.source } : {}),
  }, null, 2));
}

main();
