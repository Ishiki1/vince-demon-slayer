import path from 'node:path';
import { parseArgs, removeBackgroundImage } from './remove-background.mjs';

function toForwardSlashes(value) {
  return value.replace(/\\/g, '/');
}

function relativeToProject(filePath, projectRoot) {
  if (!projectRoot) return toForwardSlashes(filePath);
  const relative = path.relative(projectRoot, filePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    return toForwardSlashes(filePath);
  }
  return toForwardSlashes(relative);
}

function textureKeyFromOutput(output) {
  return path.basename(output, path.extname(output));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = args.input;
  const output = args.output;
  if (!input) throw new Error('Missing required --input path');
  if (!output) throw new Error('Missing required --output path');

  const textureKey = args.textureKey || textureKeyFromOutput(output);
  const projectRoot = args.projectRoot || '';

  const result = await removeBackgroundImage({
    input,
    output,
    canvas: args.canvas,
    padding: args.padding,
    threshold: args.threshold,
    quantize: args.quantize,
    maxPalette: args.maxPalette,
  });

  const assetPath = relativeToProject(output, projectRoot);
  const summary = {
    ...result,
    textureKey,
    preloadLine: `this.load.image('${textureKey}', '${assetPath}');`,
    itemDataHint: `visualId: '${textureKey}'`,
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
