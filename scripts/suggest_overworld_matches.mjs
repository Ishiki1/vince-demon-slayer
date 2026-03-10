import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const DEFAULT_CONFIG_PATH = 'assets/overworld/overworld-hotspots-800x600-matcher-config.json';

const DEFAULT_CONFIG = {
  background: 'assets/overworld/overworld-bg-800x600-hotspots.png',
  output: 'assets/overworld/overworld-suggested-matches.json',
  sourceCanvas: [900, 600],
  targetCanvas: [800, 600],
  matches: [
    {
      id: 'level5',
      sprite: 'assets/overworld/level1-overworld.png',
      search: { x: 110, y: 110, width: 220, height: 160 },
      scale: { min: 0.42, max: 0.82, step: 0.04 },
    },
    {
      id: 'level6',
      sprite: 'assets/overworld/level4-overworld.png',
      search: { x: 0, y: 45, width: 200, height: 160 },
      scale: { min: 0.22, max: 0.60, step: 0.02 },
    },
    {
      id: 'level7',
      sprite: 'assets/overworld/level3-overworld.png',
      search: { x: 260, y: 60, width: 220, height: 170 },
      scale: { min: 0.24, max: 0.58, step: 0.02 },
    },
    {
      id: 'level9',
      sprite: 'assets/overworld/level9-overworld.png',
      search: { x: 520, y: 60, width: 210, height: 170 },
      scale: { min: 0.24, max: 0.58, step: 0.02 },
    },
    {
      id: 'level10',
      sprite: 'assets/overworld/castle-overworld.png',
      search: { x: 0, y: 0, width: 280, height: 170 },
      scale: { min: 0.28, max: 0.72, step: 0.02 },
    },
    {
      id: 'level4',
      sprite: 'assets/overworld/level8-overworld.png',
      search: { x: 0, y: 230, width: 270, height: 250 },
      scale: { min: 0.30, max: 0.78, step: 0.02 },
    },
  ],
};

function parseArgs(argv) {
  const args = { config: DEFAULT_CONFIG_PATH, output: null };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--config') {
      args.config = argv[i + 1];
      i += 1;
      continue;
    }
    if (value === '--output') {
      args.output = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function readConfig(configPath) {
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) {
    return { ...DEFAULT_CONFIG, __path: resolved };
  }
  return {
    ...DEFAULT_CONFIG,
    ...JSON.parse(fs.readFileSync(resolved, 'utf8')),
    __path: resolved,
  };
}

function readPng(path) {
  return PNG.sync.read(fs.readFileSync(path));
}

function createEmpty(width, height) {
  return { width, height, data: Buffer.alloc(width * height * 4) };
}

function resizeBilinear(image, targetWidth, targetHeight) {
  const out = createEmpty(targetWidth, targetHeight);
  const srcW = image.width;
  const srcH = image.height;
  for (let y = 0; y < targetHeight; y++) {
    const srcY = (y + 0.5) * srcH / targetHeight - 0.5;
    const y0 = Math.max(0, Math.floor(srcY));
    const y1 = Math.min(srcH - 1, y0 + 1);
    const wy = srcY - y0;
    for (let x = 0; x < targetWidth; x++) {
      const srcX = (x + 0.5) * srcW / targetWidth - 0.5;
      const x0 = Math.max(0, Math.floor(srcX));
      const x1 = Math.min(srcW - 1, x0 + 1);
      const wx = srcX - x0;
      const idx00 = (y0 * srcW + x0) * 4;
      const idx10 = (y0 * srcW + x1) * 4;
      const idx01 = (y1 * srcW + x0) * 4;
      const idx11 = (y1 * srcW + x1) * 4;
      const outIdx = (y * targetWidth + x) * 4;
      for (let c = 0; c < 4; c++) {
        const top = image.data[idx00 + c] * (1 - wx) + image.data[idx10 + c] * wx;
        const bottom = image.data[idx01 + c] * (1 - wx) + image.data[idx11 + c] * wx;
        out.data[outIdx + c] = Math.round(top * (1 - wy) + bottom * wy);
      }
    }
  }
  return out;
}

function cropOpaqueBounds(image) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const a = image.data[(y * image.width + x) * 4 + 3];
      if (!a) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) throw new Error('No opaque pixels found.');
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const out = createEmpty(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = ((minY + y) * image.width + (minX + x)) * 4;
      const dstIdx = (y * width + x) * 4;
      out.data[dstIdx] = image.data[srcIdx];
      out.data[dstIdx + 1] = image.data[srcIdx + 1];
      out.data[dstIdx + 2] = image.data[srcIdx + 2];
      out.data[dstIdx + 3] = image.data[srcIdx + 3];
    }
  }
  return out;
}

function luminance(r, g, b) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function buildBackgroundMaps(image) {
  const luminanceMap = new Float32Array(image.width * image.height);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const idx = (y * image.width + x) * 4;
      luminanceMap[y * image.width + x] = luminance(
        image.data[idx],
        image.data[idx + 1],
        image.data[idx + 2],
      );
    }
  }
  return { luminanceMap };
}

function sampleSprite(image) {
  const samples = [];
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const idx = (y * image.width + x) * 4;
      const a = image.data[idx + 3];
      if (!a) continue;
      if (x % 2 !== 0 || y % 2 !== 0) continue;
      samples.push({
        x,
        y,
        r: image.data[idx],
        g: image.data[idx + 1],
        b: image.data[idx + 2],
        lum: luminance(image.data[idx], image.data[idx + 1], image.data[idx + 2]),
      });
    }
  }
  return { samples, sampleCount: samples.length };
}

function pearson(spriteSamples, bgLums) {
  let sumA = 0;
  let sumB = 0;
  for (let i = 0; i < spriteSamples.length; i++) {
    sumA += spriteSamples[i].lum;
    sumB += bgLums[i];
  }
  const meanA = sumA / spriteSamples.length;
  const meanB = sumB / spriteSamples.length;
  let cov = 0;
  let varA = 0;
  let varB = 0;
  for (let i = 0; i < spriteSamples.length; i++) {
    const da = spriteSamples[i].lum - meanA;
    const db = bgLums[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  if (varA <= 1e-6 || varB <= 1e-6) return 0;
  return cov / Math.sqrt(varA * varB);
}

function scoreCandidate(spriteInfo, background, bgMaps, x, y) {
  const bgLums = new Float32Array(spriteInfo.sampleCount);
  let colorDiffSum = 0;
  for (let i = 0; i < spriteInfo.samples.length; i++) {
    const sample = spriteInfo.samples[i];
    const px = x + sample.x;
    const py = y + sample.y;
    const bgIdx = py * background.width + px;
    const bgDataIdx = bgIdx * 4;
    const bgLum = bgMaps.luminanceMap[bgIdx];
    bgLums[i] = bgLum;
    colorDiffSum += Math.abs(sample.r - background.data[bgDataIdx]);
    colorDiffSum += Math.abs(sample.g - background.data[bgDataIdx + 1]);
    colorDiffSum += Math.abs(sample.b - background.data[bgDataIdx + 2]);
  }
  const corr = pearson(spriteInfo.samples, bgLums);
  const colorScore = 1 - colorDiffSum / (spriteInfo.sampleCount * 255 * 3);
  return colorScore * 0.8 + Math.max(0, corr) * 0.2;
}

function prepareSprite(path, scale) {
  const sprite = cropOpaqueBounds(readPng(path));
  const width = Math.max(1, Math.round(sprite.width * scale));
  const height = Math.max(1, Math.round(sprite.height * scale));
  const scaled = resizeBilinear(sprite, width, height);
  const samples = sampleSprite(scaled);
  return {
    image: scaled,
    width,
    height,
    samples: samples.samples,
    sampleCount: samples.sampleCount,
  };
}

function suggestMatch(config, background, bgMaps, sourceWidth, sourceHeight, xScale, yScale) {
  let best = null;
  for (let scale = config.scale.min; scale <= config.scale.max + 1e-6; scale += config.scale.step) {
    const spriteInfo = prepareSprite(config.sprite, scale);
    const scanStep = Math.max(1, Number(config.scanStep || 2));
    const maxX = Math.min(sourceWidth - spriteInfo.width, config.search.x + config.search.width);
    const maxY = Math.min(sourceHeight - spriteInfo.height, config.search.y + config.search.height);
    for (let y = config.search.y; y <= maxY; y += scanStep) {
      for (let x = config.search.x; x <= maxX; x += scanStep) {
        const score = scoreCandidate(spriteInfo, background, bgMaps, x, y);
        if (!best || score > best.score) {
          best = {
            id: config.id,
            sprite: config.sprite,
            textureKey: config.textureKey || path.basename(config.sprite, path.extname(config.sprite)),
            ...(config.bgReference ? { bgReference: config.bgReference } : {}),
            ...(config.routeHint ? { routeHint: config.routeHint } : {}),
            score,
            sourceRect: {
              x,
              y,
              width: spriteInfo.width,
              height: spriteInfo.height,
            },
            x: Math.round(x * xScale),
            y: Math.round(y * yScale),
            width: Math.round(spriteInfo.width * xScale),
            height: Math.round(spriteInfo.height * yScale),
            centerX: Math.round((x + spriteInfo.width / 2) * xScale),
            centerY: Math.round((y + spriteInfo.height / 2) * yScale),
            scale: Number(scale.toFixed(3)),
          };
        }
      }
    }
  }
  return best;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = readConfig(args.config);
  const [sourceWidth, sourceHeight] = config.sourceCanvas;
  const [targetWidth, targetHeight] = config.targetCanvas;
  const xScale = targetWidth / sourceWidth;
  const yScale = targetHeight / sourceHeight;
  const outputPath = args.output || config.output || DEFAULT_CONFIG.output;
  const background = readPng(config.background);
  const bgMaps = buildBackgroundMaps(background);
  const results = config.matches.map((entry) => suggestMatch(entry, background, bgMaps, sourceWidth, sourceHeight, xScale, yScale));
  fs.writeFileSync(
    outputPath,
    JSON.stringify({
      config: config.__path,
      background: config.background,
      sourceCanvas: [sourceWidth, sourceHeight],
      targetCanvas: [targetWidth, targetHeight],
      results,
    }, null, 2),
  );
  console.log(JSON.stringify({ config: config.__path, output: outputPath, results }, null, 2));
}

main();
