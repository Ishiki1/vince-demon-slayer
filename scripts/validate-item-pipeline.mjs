import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

async function readProjectFile(projectRoot, relativePath) {
  return fs.readFile(path.join(projectRoot, relativePath), 'utf8');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (_) {
    return false;
  }
}

function toAbsolutePath(projectRoot, filePath) {
  if (!filePath) return null;
  return path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);
}

async function loadData(projectRoot) {
  const context = {
    console,
  };
  context.globalThis = context;
  vm.createContext(context);

  const files = [
    'src/data/classes.js',
    'src/data/skills.js',
    'src/data/itemVisuals.js',
    'src/data/items.js',
  ];

  for (const relativePath of files) {
    const source = await readProjectFile(projectRoot, relativePath);
    vm.runInContext(source, context, { filename: relativePath });
  }

  return {
    ITEMS: vm.runInContext('ITEMS', context),
    ITEM_VISUALS: vm.runInContext('ITEM_VISUALS', context),
  };
}

async function main() {
  const projectRoot = process.cwd();
  const { ITEMS, ITEM_VISUALS } = await loadData(projectRoot);
  const bootSceneSource = await readProjectFile(projectRoot, 'src/scenes/BootScene.js');

  const errors = [];
  const warnings = [];
  const usedVisualIds = new Set();

  Object.values(ITEMS).forEach((item) => {
    const visualId = item.visualId || item.id;
    usedVisualIds.add(visualId);
    const visual = ITEM_VISUALS[visualId];
    if (!visual) {
      errors.push(`Missing visual manifest entry for item '${item.id}' (visualId '${visualId}').`);
      return;
    }

    if (item.assetKey !== visual.textureKey) {
      errors.push(`Item '${item.id}' assetKey '${item.assetKey}' does not match visual textureKey '${visual.textureKey}'.`);
    }

    if (visual.hover) {
      if (item.hoverSheetKey !== visual.hover.sheetKey) {
        errors.push(`Item '${item.id}' hoverSheetKey '${item.hoverSheetKey}' does not match manifest '${visual.hover.sheetKey}'.`);
      }
      if (item.hoverAnimKey !== visual.hover.animKey) {
        errors.push(`Item '${item.id}' hoverAnimKey '${item.hoverAnimKey}' does not match manifest '${visual.hover.animKey}'.`);
      }
    }
  });

  for (const visual of Object.values(ITEM_VISUALS)) {
    const basePath = toAbsolutePath(projectRoot, visual.basePath);
    const baseExists = await fileExists(basePath);

    if (visual.preload !== false) {
      if (!baseExists) {
        errors.push(`Preloaded visual '${visual.visualId}' is missing base file '${visual.basePath}'.`);
      }
      if (visual.hover) {
        const hoverPath = toAbsolutePath(projectRoot, visual.hover.path);
        const hoverExists = await fileExists(hoverPath);
        if (!hoverExists) {
          errors.push(`Preloaded visual '${visual.visualId}' is missing hover file '${visual.hover.path}'.`);
        }
      }
    } else if (!baseExists) {
      warnings.push(`Planned visual '${visual.visualId}' has no asset file yet (expected for placeholder-only entries).`);
    }

    if (!usedVisualIds.has(visual.visualId)) {
      warnings.push(`Visual manifest entry '${visual.visualId}' is not referenced by any item definition.`);
    }
  }

  if (!bootSceneSource.includes('getPreloadItemVisuals')) {
    errors.push("BootScene no longer appears to preload items from 'getPreloadItemVisuals()'.");
  }

  if (!bootSceneSource.includes('visual.hover.style === \'pingPong\'')) {
    errors.push('BootScene is missing manifest-driven hover animation style registration.');
  }

  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (errors.length > 0) {
    console.error('Validation failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(`Validated ${Object.keys(ITEMS).length} items and ${Object.keys(ITEM_VISUALS).length} visual entries.`);
  if (warnings.length === 0) {
    console.log('No warnings.');
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
