# Spritework reference (Demon Slayer – Vince)

Use this file when adding or changing sprites and animations. It documents the current setup and the steps to follow.

---

## Overview

- **Engine:** Phaser 3. Sprites use **spritesheets** (one image with a grid of frames). Use `load.spritesheet()` for multi-frame sheets and `load.image()` for single-frame icons.
- **Hero assets** live in `assets/hero/`. Display size in combat is set in `config.js` via `CONFIG.HERO_SPRITE_DISPLAY_WIDTH` / `CONFIG.HERO_SPRITE_DISPLAY_HEIGHT`, not by image size. Hero sheets use **512x512 pixels per frame**.
- **Item assets** are driven by `src/data/itemVisuals.js`. `BootScene.js` preloads item art and hover sheets by looping the manifest. Item definitions in `src/data/items.js` point at `visualId` entries so selectors, hover keys, and class-specific visuals resolve from one source of truth.
- **Sorceress items** live in `itemVisuals.js` as `preload: false` placeholders until bespoke art exists. The first approved batch (`unique-pyre-staff`, `unique-phoenix-robe`, `unique-cinder-orb`) is wired with real art and hover sheets. Remaining placeholders render fallback icon containers.
- **Scene backgrounds** use static art with invisible hotspot manifests where applicable. See the asset table below for paths and texture keys.
- **Overworld** uses `overworld-bg-800x600-hotspots.png` with invisible travel hotspots from `overworld-hotspots-800x600.json`. Only the `town-overworld` sprite is rendered on top; level/castle icon files remain on disk as reference only.
- **Inventory** uses `assets/ui/Inventory.png` as its layout frame. Placement contract: hero portrait center `166,186` at `84x128`, equip-slot centers `286,138` / `286,234` / `166,342` / `286,342`, `5x6` bag grid starting at `366,96` with `54x54` cells and `8px` gaps. Bag items render at `49x49` with a `10px` right offset on the first two columns.

---

## Repo Item Pipeline

- Clean proof to icon: `npm run asset:clean -- --input <proof> --output assets/items/<name>.png --projectRoot C:\GameCraft\Vince`
- Generate hover sheet: `npm run asset:hover -- --input assets/items/<name>.png --output assets/items/<name>-hover-pulse_256x256_sheet.png`
- Both at once: `npm run asset:process-approved -- --proof <proof> --textureKey <name> --visualId <name> --projectRoot C:\GameCraft\Vince`
- Validate pipeline: `npm run validate:item-pipeline`
- Placeholder-only entries use `preload: false` in the manifest.

---

## Asset location and naming

### Hero spritesheets (512x512 per frame)

| Purpose | Path | Texture key |
|---------|------|-------------|
| Idle | `assets/hero/Vince-idle.png` | `hero_sheet` |
| Slash | `assets/hero/vince-regular-attack1.png` | `hero_slash_sheet` |
| Heavy Strike | `assets/hero/heavy_strike_512x512_sheet.png` | `hero_heavy_strike_sheet` |
| Healing (Holy Light) | `assets/hero/healing_512x512_sheet.png` | `hero_healing_sheet` |
| Execute | `assets/hero/execute_512x512_sheet.png` | `hero_execute_sheet` |
| Whirlwind (AoE) | `assets/hero/whirlwind_512x512_sheet.png` | `hero_whirlwind_sheet` |
| Evade (Evasion) | `assets/hero/evade_512x512_sheet.png` | `hero_evade_sheet` |
| Iron Skin | `assets/hero/iron_skin_512x512_sheet.png` | `hero_iron_skin_sheet` |
| Life Drain (AoE) | `assets/hero/lifedrain2_512x512_sheet.png` | `hero_life_drain_sheet` |
| Thorncape (block/reflect) | `assets/hero/thorncape_512x512_sheet.png` | `hero_thorncape_sheet` |
| Iron Evasion | `assets/hero/iron_evasion_512x512_sheet.png` | `hero_iron_evasion_sheet` |
| Set idle: Lightning | `assets/hero/lightning_set_idle_512x512_sheet.png` | `hero_lightning_set_idle_sheet` |
| Set idle: Wind | `assets/hero/wind_set_idle_512x512_sheet.png` | `hero_wind_set_idle_sheet` |
| Set idle: Fire | `assets/hero/fire_set_idle_512x512_sheet.png` | `hero_fire_set_idle_sheet` |
| Set idle: Water | `assets/hero/water_set_idle_512x512_sheet.png` | `hero_water_set_idle_sheet` |
| Set idle: Ice | `assets/hero/ice_set_idle_512x512_sheet.png` | `hero_ice_set_idle_sheet` |

### Enemy spritesheets (512x512 per frame)

| Purpose | Path | Texture key |
|---------|------|-------------|
| Boss idle (placeholder) | `assets/goons/vampire_idle_512x512_sheet.png` | `vampire_idle_sheet` |
| Boss attack (placeholder) | `assets/goons/vampire_attack_512x512_sheet.png` | `vampire_attack_sheet` |
| Bat idle | `assets/goons/bat_idle_512x512_sheet.png` | `bat_idle_sheet` |
| Bat attack | `assets/goons/bat_attack_512x512_sheet.png` | `bat_attack_sheet` |

### Scene backgrounds

| Scene | Path | Texture key |
|-------|------|-------------|
| Overworld map | `assets/overworld/overworld-bg-800x600-hotspots.png` | `overworld-ui-background` |
| Level 1-10 combat/loot | `assets/overworld/levelN-bg.png` | `levelN-ui-background` |
| Main menu | `assets/overworld/startgame-bg.png` | `startgame-ui-background` |
| Town | `assets/overworld/town-bg.png` | `town-ui-background` |
| Blacksmith | `assets/overworld/blacksmith-bg.png` | `blacksmith-ui-background` |
| Shop | `assets/overworld/shop-with-buttons-bg.png` | `shop-ui-background` |
| Mine | `assets/overworld/mine-bg.png` | `mine-ui-background` |
| Alchemist | `assets/overworld/alchemist-bg.png` | `alchemist-ui-background` |
| Event | `assets/ui/EventScene-bg.png` | `eventscene-ui-background` |
| Loot | `assets/ui/LootScene-bg.png` | `lootscene-ui-background` |
| Settings | `assets/ui/SettingsScene-bg.png` | `settingsscene-ui-background` |

### UI icons and controls

| Purpose | Path | Texture key |
|---------|------|-------------|
| Continue button (shared) | `assets/ui/continue-button.png` | `continue-button` |
| Inventory layout frame | `assets/ui/Inventory.png` | `inventory-ui-layout` |
| Settings | `assets/ui/settings-icon.png` | `settings-icon` |
| Save game | `assets/ui/save-game-icon.png` | `save-game-icon` |
| Abandon run | `assets/ui/abandon-run-icon.png` | `abandon-run-icon` |
| Inventory | `assets/ui/inventory-icon.png` | `inventory-icon` |
| Character sheet | `assets/ui/character-sheet-icon.png` | `character-sheet-icon` |
| Town/service: inn | `assets/ui/inn-icon.png` | `inn-icon` |
| Town/service: shop | `assets/ui/shop-icon.png` | `shop-icon` |
| Town/service: blacksmith | `assets/ui/blacksmith-icon.png` | `blacksmith-icon` |
| Town/service: mine | `assets/ui/mine-icon.png` | `mine-icon` |
| Town/service: alchemist | `assets/ui/alchemist-icon.png` | `alchemist-icon` |
| Town/service: overworld | `assets/ui/overworld-icon.png` | `overworld-icon` (distinct from `town-overworld`) |
| Town overworld sprite | `assets/overworld/town-overworld.png` | `town-overworld` |

### Warrior skill icons (`assets/ui/skills/`)

Texture key matches the filename without extension: `button-heavy-strike`, `button-execute`, `button-iron-skin`, `button-evasion`, `button-holy-light`, `button-whirlwind`, `button-life-drain`, `button-thorncape`, `button-iron-evasion`. Passive icons: `passive-str1`, `passive-hp2`.

### Item icons and hover sheets (`assets/items/`)

Item icons and hover sheets follow predictable naming conventions. The canonical list lives in `src/data/itemVisuals.js`; do not duplicate it here.

**Naming conventions:**
- Icon: `assets/items/<name>.png` -> texture key `<name>`
- Hover sheet: `assets/items/<name>-hover-pulse_256x256_sheet.png` -> texture key `<name>-hover-sheet`
- Potions use `*-hover_256x256_sheet.png` (no `-pulse-` infix) for their hover sheets.

**Coverage:** Common/rare/legendary swords, armor, rings, amulets. All five elemental unique weapon/armor/accessory sets. Potions (health, mana, avoid-death). Crafting materials (fire/wind/ice/lightning/water stone). First Sorceress bespoke batch (pyre-staff, phoenix-robe, cinder-orb).

**Legacy/unwired hover proofs (on disk, not preloaded):**
- `common-sword-hover_256x256_sheet.png` — original static hover
- `common-sword-hover-travel_256x256_sheet.png` — 12-frame traveling glow proof

**Unwired overworld reference art (on disk, not preloaded):**
- `assets/overworld/level1-overworld.png` through `level9-overworld.png`, `castle-overworld.png`
- `assets/overworld/overworldmap_background_sheet.png` (animated background)
- `assets/ui/overworld-hover-firefly.svg` (orbiting hover prototype)

---

## Where things are done

| Step | File | What to do |
|------|------|------------|
| Load spritesheet | `BootScene.js` -> `preload()` | `this.load.spritesheet(key, path, { frameWidth, frameHeight })` |
| Create animation | `BootScene.js` -> `create()` | `this.anims.create({ key, frames, frameRate, repeat })` |
| Use sprite in combat | `CombatScene.js` | Create sprite, then `setTexture()`, `play()`, handle `animationcomplete` |

---

## BootScene: loading and creating animations

### Preload

```js
this.load.spritesheet('hero_slash_sheet', 'assets/hero/vince-regular-attack1.png', {
  frameWidth: 512,
  frameHeight: 512,
});
```

Use a unique texture key. Same frame size (512x512) unless the asset differs.

### Create

- **Looping (idle):** `repeat: 0` with restart in `animationcomplete` handler to avoid a one-frame blink.
- **One-shot:** Use the data-driven `oneShotAnims` array. Each entry is `{ sheetKey: 'hero_<name>_sheet', animKey: 'hero_<name>' }`. The helper `registerOneShotHeroAnim` is a no-op if the texture doesn't exist. Animation key (e.g. `hero_slash`) is what you pass to `sprite.play()` or `playHeroAnimThen()`.

---

## CombatScene: using sprites

- Hero sprite created once from `hero_sheet`, plays `hero_idle`.
- **Set idle swap:** When Vince has a full unique set equipped (weapon + armor + accessory), combat idle swaps to the matching `hero_<element>_set_idle_sheet` / `hero_<element>_set_idle`. All set idles loop via generalized idle detection in `playCurrentHeroIdle()`.
- **Bosses:** Standard bosses use `vampire_idle_sheet` / `vampire_attack_sheet` (placeholder, labeled `Vampire`). Reaper keeps its own sheets.
- **Enemies:** Bats and skeletons use their own idle/attack sheet pairs.
- **Item hover:** Loot icons swap to their hover sheet on pointer over. Hover keys are derived from the base texture key. Unique items in inventory auto-apply golden hover.
- **Skill animations:** Use `playHeroAnimThen(sheetKey, animKey, callback)`. Callback is typically `() => this.endPlayerTurn()` or the AoE/effect runner. No per-skill `animationcomplete` branch needed.
- **Manual approach (when needed):** `this.heroSprite.stop()`, `.setTexture('hero_<name>_sheet')`, `.play('hero_<name>')`. Check `this.anims.exists('hero_<name>')` when relevant.

---

## How to add a new hero animation

1. **Asset:** Add spritesheet under `assets/hero/` with 512x512 frames (or note different size here).
2. **BootScene preload:** `this.load.spritesheet('hero_<name>_sheet', 'assets/hero/<file>', { frameWidth: 512, frameHeight: 512 })`
3. **BootScene create:** Add `{ sheetKey: 'hero_<name>_sheet', animKey: 'hero_<name>' }` to the `oneShotAnims` array.
4. **CombatScene:** Call `playHeroAnimThen('hero_<name>_sheet', 'hero_<name>', callback)` where the skill is used. Single-target: `applySingleTargetSkill()`. AoE: `useSkill()` AoE branch. Self-buff: corresponding `useSkill()` branch.

---

## Checklist

- [ ] New animation uses a **spritesheet** (not `load.image`).
- [ ] Same **frame size** as other hero sheets (512x512) or documented here.
- [ ] Entry added to **oneShotAnims** in `BootScene.create()`.
- [ ] **CombatScene** uses `playHeroAnimThen('hero_<name>_sheet', 'hero_<name>', callback)`.
- [ ] `this.anims.exists('hero_<name>')` check in place where relevant.
