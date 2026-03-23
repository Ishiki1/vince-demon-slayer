# Dry-run: iter_001 — case_03 — Stone Golem (goon-generator skill only)

**Iteration 1 change:** Phase 6 now includes a **Green residue check** after `process-spritesheet.mjs`: a Node.js scan for bright chroma-green pixels on processed PNGs, pass/fail thresholds, remediation (re-run processing with higher flood-fill threshold), and a documented special case for green-skinned creatures (skip automation; inspect for `#00FF00` halo). All other skill content is treated as unchanged from the baseline used for iter_000.

Below is **Phase 6** as it would appear in this dry-run (`<goon>` = `golem`).

---

## Phase 6: Process sprite sheets

**Commands:**

```bash
node scripts/process-spritesheet.mjs <raw-idle-path> assets/goons/golem_idle_512x512_sheet.png 4 2
node scripts/process-spritesheet.mjs <raw-attack-path> assets/goons/golem_attack_512x512_sheet.png 3 2
```

The script:

1. Flood-fill removes border-connected green.
2. Splits into grid cells by cols/rows.
3. Centers each cell's content in a 512×512 transparent frame.
4. Composites all frames into a single-row horizontal strip.

**Verify dimensions and frame count:**

```bash
node -e "const {PNG}=require('pngjs'),fs=require('fs'); for(const f of ['idle','attack']){const p='assets/goons/golem_'+f+'_512x512_sheet.png'; if(!fs.existsSync(p)){console.log(f,'MISSING');continue;} const d=PNG.sync.read(fs.readFileSync(p)); console.log(f,d.width+'x'+d.height,'=',(d.width/512),'frames');}"
```

Both sheets must exist, have height 512, and width divisible by 512.

### Green residue check

After processing, scan each output PNG for leftover bright green (chroma key residue). A pixel counts as **bright green** when: `r < 100`, `g > 200`, `b < 100`, and `a > 0`.

**Special case — green-skinned creatures:** If the goon is intentionally green-skinned, **skip** this automated count (legitimate green body pixels can false-positive). Instead, visually inspect the processed sheets for a **`#00FF00` halo** or fringe around the silhouette.

**Stone Golem:** Not green-skinned — run the automated check.

```bash
node -e "
const { PNG } = require('pngjs');
const fs = require('fs');
function countBrightGreen(img) {
  let n = 0;
  const d = img.data, w = img.width, h = img.height;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3];
    if (a > 0 && r < 100 && g > 200 && b < 100) n++;
  }
  return n;
}
const goon = 'golem';
for (const anim of ['idle', 'attack']) {
  const p = 'assets/goons/' + goon + '_' + anim + '_512x512_sheet.png';
  if (!fs.existsSync(p)) { console.log(anim, 'MISSING'); continue; }
  const img = PNG.sync.read(fs.readFileSync(p));
  const c = countBrightGreen(img);
  console.log(anim, 'bright-green pixels:', c);
}
"
```

**Thresholds:**

- **Default:** `0` bright-green pixels acceptable on processed sheets.
- **Creatures with intentional green** (non-skin markings, etc.): fewer than `50` bright-green pixels may be acceptable after visual confirmation that residue is not a halo.

**Remediation:** If the count fails, re-run `process-spritesheet.mjs` with a **higher** green-removal threshold (e.g. `40` or `48`), then **re-run this green residue check** until the sheet passes.

<!-- SCORES
{
  "scores": {
    "Attack Animation Quality": 45,
    "Facing Direction Enforcement": 40,
    "Green Cleanup Verification": 60,
    "Frame Count Adequacy": 30,
    "Phase Completeness": 75,
    "Prompt Adaptability": 35
  },
  "reasoning": {
    "Attack Animation Quality": "Unchanged from baseline: slam sequence described; still no negative prompts; heavy golem motion in six frames remains tight.",
    "Facing Direction Enforcement": "Unchanged: same visual gates as baseline iter_000 for this case.",
    "Green Cleanup Verification": "Improved with automated scan, thresholds, and remediation; no extra guidance for dark stone vs black outline or magma-edge false greens.",
    "Frame Count Adequacy": "Unchanged: 8/6 with limited timing reasoning for golem weight class.",
    "Phase Completeness": "Unchanged relative to baseline case doc (golem iter_000 had shorter Phase 6); skill still has eight phases; weighted PC kept at baseline 75 for this case.",
    "Prompt Adaptability": "Unchanged: golem-specific crack/magma risks not expanded; green-skin rule N/A."
  }
}
-->

Weighted case score: 45×0.25 + 40×0.20 + 60×0.20 + 30×0.15 + 75×0.10 + 35×0.10 = 11.25 + 8.0 + 12.0 + 4.5 + 7.5 + 3.5 = **46.75**
