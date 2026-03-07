import path from 'node:path';
import { parseArgs, removeBackgroundImage } from './remove-background.mjs';
import { generateHoverSheet } from './generate-hover-sheet.mjs';

function toForwardSlashes(value) {
  return value.replace(/\\/g, '/');
}

function relativeToProject(filePath, projectRoot) {
  const relative = path.relative(projectRoot, filePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    return toForwardSlashes(filePath);
  }
  return toForwardSlashes(relative);
}

function defaultTextureKeyFromInput(inputPath) {
  return path.basename(inputPath, path.extname(inputPath))
    .replace(/-proof(?:-v\d+)?$/i, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const proofPath = args.proof || args.input;
  if (!proofPath) throw new Error('Missing required --proof path');

  const projectRoot = args.projectRoot || process.cwd();
  const outputDir = args.outputDir || path.join(projectRoot, 'assets', 'items');
  const textureKey = args.textureKey || args.visualId || defaultTextureKeyFromInput(proofPath);
  const visualId = args.visualId || textureKey;
  const cleanedOutput = args.output || path.join(outputDir, `${textureKey}.png`);
  const hoverOutput = args.hoverOutput || path.join(outputDir, `${textureKey}-hover-pulse_256x256_sheet.png`);

  const cleanupResult = await removeBackgroundImage({
    input: proofPath,
    output: cleanedOutput,
    canvas: args.canvas,
    padding: args.padding,
    threshold: args.threshold,
    quantize: args.quantize,
    maxPalette: args.maxPalette,
  });

  const hoverResult = await generateHoverSheet({
    input: cleanedOutput,
    output: hoverOutput,
    frames: args.frames,
  });

  const cleanedAssetPath = relativeToProject(cleanedOutput, projectRoot);
  const hoverAssetPath = relativeToProject(hoverOutput, projectRoot);

  const manifestEntry = {
    visualId,
    textureKey,
    basePath: cleanedAssetPath,
    preload: true,
    hover: {
      sheetKey: `${textureKey}-hover-sheet`,
      animKey: `${textureKey}-hover`,
      path: hoverAssetPath,
      frameWidth: 256,
      frameHeight: 256,
      frameRate: 16,
      style: 'fullCycle',
    },
  };

  console.log(JSON.stringify({
    proofPath: toForwardSlashes(proofPath),
    projectRoot: toForwardSlashes(projectRoot),
    textureKey,
    visualId,
    cleaned: cleanupResult,
    hover: hoverResult,
    manifestEntry,
    manifestPatchHint: `registerItemVisual('${visualId}', ${JSON.stringify(manifestEntry, null, 2)});`,
    itemPatchHint: `visualId: '${visualId}'`,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
