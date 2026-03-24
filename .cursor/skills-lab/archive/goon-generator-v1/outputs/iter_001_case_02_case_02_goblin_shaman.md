# Dry-run: iter_001 — case_02 — Goblin Shaman (goon-generator skill only)

**Iteration 1 change:** Phase 6 now includes a **Green residue check** after `process-spritesheet.mjs`: a Node.js scan for bright chroma-green pixels on processed PNGs, pass/fail thresholds, remediation (re-run processing with higher flood-fill threshold), and a documented special case for green-skinned creatures (skip automation; inspect for `#00FF00` halo). All other skill content is treated as unchanged from the baseline used for iter_000.

Below is **Phase 6** as it would appear in this dry-run (`<goon>` = `shaman`). The Goblin Shaman is **green-skinned**, so the dry-run follows the skill’s special case.

---

## Phase 6: Process sprite sheets

**Commands:**

```bash
node scripts/process-spritesheet.mjs <raw-idle-path> assets/goons/shaman_idle_512x512_sheet.png 4 2
node scripts/process-spritesheet.mjs <raw-attack-path> assets/goons/shaman_attack_512x512_sheet.png 3 2
```

The script:

1. Flood-fill removes border-connected green.
2. Splits into grid cells by cols/rows.
3. Centers each cell's content in a 512×512 transparent frame.
4. Composites all frames into a single-row horizontal strip.

**Verify dimensions and frame count:**

```bash
node -e "const {PNG}=require('pngjs'),fs=require('fs'); for(const f of ['idle','attack']){const p='assets/goons/shaman_'+f+'_512x512_sheet.png'; if(!fs.existsSync(p)){console.log(f,'MISSING');continue;} const d=PNG.sync.read(fs.readFileSync(p)); console.log(f,d.width+'x'+d.height,'=',(d.width/512),'frames');}"
```

Both sheets must exist, have height 512, and width divisible by 512.

### Green residue check

After processing, scan each output PNG for leftover bright green (chroma key residue). A pixel counts as **bright green** when: `r < 100`, `g > 200`, `b < 100`, and `a > 0`.

**Special case — green-skinned creatures:** If the goon is intentionally green-skinned, **skip** this automated count (legitimate green body pixels can false-positive). Instead, visually inspect the processed sheets for a **`#00FF00` halo** or fringe around the silhouette.

**Goblin Shaman:** Green-skinned — **do not** use the automated bright-green pixel count for pass/fail. Perform **visual inspection** for chroma halos and fringes after processing.

*(For non-green-skinned goons, the automated snippet would be:)*

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
const goon = 'shaman';
for (const anim of ['idle', 'attack']) {
  const p = 'assets/goons/' + goon + '_' + anim + '_512x512_sheet.png';
  if (!fs.existsSync(p)) { console.log(anim, 'MISSING'); continue; }
  const img = PNG.sync.read(fs.readFileSync(p));
  const c = countBrightGreen(img);
  console.log(anim, 'bright-green pixels:', c);
}
"
```

**Thresholds (when automation applies):**

- **Default:** `0` bright-green pixels acceptable on processed sheets.
- **Creatures with intentional green** (non-skin markings, etc.): fewer than `50` bright-green pixels may be acceptable after visual confirmation that residue is not a halo.

**Remediation:** If visual inspection shows halo/fringe, or if automation (on non-green-skinned goons) fails the count, re-run `process-spritesheet.mjs` with a **higher** green-removal threshold (e.g. `40` or `48`), then **re-check** (visual for green-skin; automated + visual for others).

<!-- SCORES
{
  "scores": {
    "Attack Animation Quality": 50,
    "Facing Direction Enforcement": 40,
    "Green Cleanup Verification": 70,
    "Frame Count Adequacy": 35,
    "Phase Completeness": 80,
    "Prompt Adaptability": 40
  },
  "reasoning": {
    "Attack Animation Quality": "Unchanged from baseline: spell-cast template and leftward peak are present; still no negative prompts or anti-patterns.",
    "Facing Direction Enforcement": "Unchanged: generic visual inspect before processing; no goblin-specific gates or retry count.",
    "Green Cleanup Verification": "Largest gain: automated path plus explicit green-skinned bypass and #00FF00 halo visual inspection directly addresses false positives on green skin; remediation loop still applies via re-process and re-check.",
    "Frame Count Adequacy": "Unchanged: 8/6 frames without added timing reasoning.",
    "Phase Completeness": "Unchanged: eight phases and wiring touchpoints; Phase 6 is more complete for cleanup verification.",
    "Prompt Adaptability": "Slight uptick: green-creature special case is creature-adaptive and matches goblin shaman; other edge cases (staff consistency, etc.) still implicit only."
  }
}
-->

Weighted case score: 50×0.25 + 40×0.20 + 70×0.20 + 35×0.15 + 80×0.10 + 40×0.10 = 12.5 + 8.0 + 14.0 + 5.25 + 8.0 + 4.0 = **51.75**
