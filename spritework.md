# Spritework reference (Demon Slayer – Vince)

Use this file when adding or changing hero (or other) sprites and animations. It documents the current setup and the steps to follow next time.

---

## Overview

- **Engine:** Phaser 3. Sprites use **spritesheets** (one image with a grid of frames), not single images, so animations play frame-by-frame.
- **Hero assets** live in `assets/hero/`. Display size in combat is set in `config.js`, not by the image size.
- **Item assets** are now driven by `src/data/itemVisuals.js`. `BootScene.js` preloads item art and hover sheets by looping the manifest instead of maintaining a hand-edited item list.
- **Item definitions** in `src/data/items.js` now point at `visualId` entries, so selectors, hover keys, and future Sorceress or class-specific visuals all resolve from the same source of truth.
- **Town landing scene** now uses `assets/overworld/town-bg.png` as a fullscreen backdrop and routes travel through the shared top-right Town/service icon row instead of plaque hotspots.
- **Blacksmith scenes** now use `assets/overworld/blacksmith-bg.png` as the shared forge backdrop for the landing menu plus blacksmith subviews, while keeping craft/repair/upgrade controls code-driven.
- **Shop scene** now uses `assets/overworld/shop-bg.png` as its static backdrop behind the buy/sell UI.
- **Mine scene** now uses `assets/overworld/mine-bg.png` as its static backdrop behind the rent-pickaxe flow.
- **Alchemist scene** now uses `assets/overworld/alchemist-bg.png` as its placeholder backdrop.
- **Service navigation icons** `inn-icon`, `shop-icon`, `blacksmith-icon`, `mine-icon`, `alchemist-icon`, and `overworld-icon` are now preloaded and used by Town-related scenes for the shared top-right navigation row.
- **Combat and loot scenes** now reuse level-specific backdrops for `level1` through `level10` when those backgrounds exist, falling back to the default dark presentation for later levels or special encounters without matching art.

## Repo Item Pipeline

- Clean an approved proof into a square transparent icon with `npm run asset:clean -- --input <proof> --output assets/items/<name>.png --projectRoot C:\GameCraft\Vince`.
- Generate a hover sheet with `npm run asset:hover -- --input assets/items/<name>.png --output assets/items/<name>-hover-pulse_256x256_sheet.png`.
- Do both at once and emit a manifest-friendly summary with `npm run asset:process-approved -- --proof <proof> --textureKey <name> --visualId <name> --projectRoot C:\GameCraft\Vince`.
- Validate the item registry, visual manifest, files on disk, and preload assumptions with `npm run validate:item-pipeline`.
- Placeholder-only entries are allowed in the manifest by setting `preload: false`. This is how Sorceress items are now piloted before bespoke art exists.

---

## Asset location and naming

| Purpose        | Path                                      | Texture key (preload)   |
|----------------|-------------------------------------------|-------------------------|
| Hero idle      | `assets/hero/Vince-idle.png`              | `hero_sheet`            |
| Hero slash     | `assets/hero/vince-regular-attack1.png`   | `hero_slash_sheet`      |
| Hero heavy strike | `assets/hero/heavy_strike_512x512_sheet.png` | `hero_heavy_strike_sheet` |
| Hero healing (Holy Light only; Sorceress uses different sprites) | `assets/hero/healing_512x512_sheet.png` | `hero_healing_sheet` |
| Hero execute | `assets/hero/execute_512x512_sheet.png` | `hero_execute_sheet` |
| Hero whirlwind (AoE) | `assets/hero/whirlwind_512x512_sheet.png` | `hero_whirlwind_sheet` |
| Hero evade (Evasion skill) | `assets/hero/evade_512x512_sheet.png` | `hero_evade_sheet` |
| Hero iron skin | `assets/hero/iron_skin_512x512_sheet.png` | `hero_iron_skin_sheet` |
| Hero life drain (AoE) | `assets/hero/lifedrain2_512x512_sheet.png` | `hero_life_drain_sheet` |
| Hero thorncape (block/reflect) | `assets/hero/thorncape_512x512_sheet.png` | `hero_thorncape_sheet` |
| Hero iron evasion (Iron Evasion skill) | `assets/hero/iron_evasion_512x512_sheet.png` | `hero_iron_evasion_sheet` |
| Hero idle (full Lightning unique set) | `assets/hero/lightning_set_idle_512x512_sheet.png` | `hero_lightning_set_idle_sheet` |
| Hero idle (full Wind unique set) | `assets/hero/wind_set_idle_512x512_sheet.png` | `hero_wind_set_idle_sheet` |
| Hero idle (full Fire unique set) | `assets/hero/fire_set_idle_512x512_sheet.png` | `hero_fire_set_idle_sheet` |
| Hero idle (full Water unique set) | `assets/hero/water_set_idle_512x512_sheet.png` | `hero_water_set_idle_sheet` |
| Hero idle (full Ice unique set) | `assets/hero/ice_set_idle_512x512_sheet.png` | `hero_ice_set_idle_sheet` |
| Standard boss idle placeholder | `assets/goons/vampire_idle_512x512_sheet.png` | `vampire_idle_sheet` |
| Standard boss attack placeholder | `assets/goons/vampire_attack_512x512_sheet.png` | `vampire_attack_sheet` |
| Bat idle | `assets/goons/bat_idle_512x512_sheet.png` | `bat_idle_sheet` |
| Bat attack | `assets/goons/bat_attack_512x512_sheet.png` | `bat_attack_sheet` |
| Overworld scene background | `assets/overworld/overworld-bg.png` | `overworld-ui-background` |
| Level 1 combat/loot background | `assets/overworld/level1-bg.png` | `level1-ui-background` |
| Level 2 combat/loot background | `assets/overworld/level2-bg.png` | `level2-ui-background` |
| Level 3 combat/loot background | `assets/overworld/level3-bg.png` | `level3-ui-background` |
| Level 4 combat/loot background | `assets/overworld/level4-bg.png` | `level4-ui-background` |
| Level 5 combat/loot background | `assets/overworld/level5-bg.png` | `level5-ui-background` |
| Level 6 combat/loot background | `assets/overworld/level6-bg.png` | `level6-ui-background` |
| Level 7 combat/loot background | `assets/overworld/level7-bg.png` | `level7-ui-background` |
| Level 8 combat/loot background | `assets/overworld/level8-bg.png` | `level8-ui-background` |
| Level 9 combat/loot background | `assets/overworld/level9-bg.png` | `level9-ui-background` |
| Level 10 combat/loot background | `assets/overworld/level10-bg.png` | `level10-ui-background` |
| Town landing background | `assets/overworld/town-bg.png` | `town-ui-background` |
| Blacksmith scene background | `assets/overworld/blacksmith-bg.png` | `blacksmith-ui-background` |
| Shop scene background | `assets/overworld/shop-bg.png` | `shop-ui-background` |
| Mine scene background | `assets/overworld/mine-bg.png` | `mine-ui-background` |
| Alchemist scene background | `assets/overworld/alchemist-bg.png` | `alchemist-ui-background` |
| Overworld animated background sheet (currently not wired) | `assets/overworld/overworldmap_background_sheet.png` | not wired |
| Town overworld icon | `assets/overworld/town-overworld.png` | `town-overworld` |
| Level 1 overworld icon | `assets/overworld/level1-overworld.png` | `level1-overworld` |
| Level 2 overworld icon | `assets/overworld/level2-overworld.png` | `level2-overworld` |
| Level 3 overworld icon | `assets/overworld/level3-overworld.png` | `level3-overworld` |
| Level 4 overworld icon | `assets/overworld/level4-overworld.png` | `level4-overworld` |
| Level 5 overworld icon | `assets/overworld/level5-overworld.png` | `level5-overworld` |
| Level 6 overworld icon | `assets/overworld/level6-overworld.png` | `level6-overworld` |
| Level 7 overworld icon | `assets/overworld/level7-overworld.png` | `level7-overworld` |
| Level 8 overworld icon | `assets/overworld/level8-overworld.png` | `level8-overworld` |
| Level 9 overworld icon | `assets/overworld/level9-overworld.png` | `level9-overworld` |
| Castle overworld icon | `assets/overworld/castle-overworld.png` | `castle-overworld` |
| Overworld settings UI icon | `assets/ui/settings-icon.png` | `settings-icon` |
| Overworld save-game UI icon | `assets/ui/save-game-icon.png` | `save-game-icon` |
| Overworld abandon-run UI icon | `assets/ui/abandon-run-icon.png` | `abandon-run-icon` |
| Overworld inventory UI icon | `assets/ui/inventory-icon.png` | `inventory-icon` |
| Overworld character-sheet UI icon | `assets/ui/character-sheet-icon.png` | `character-sheet-icon` |
| Town/service blacksmith UI icon | `assets/ui/blacksmith-icon.png` | `blacksmith-icon` |
| Town/service alchemist UI icon | `assets/ui/alchemist-icon.png` | `alchemist-icon` |
| Town/service shop UI icon | `assets/ui/shop-icon.png` | `shop-icon` |
| Town/service inn UI icon | `assets/ui/inn-icon.png` | `inn-icon` |
| Town/service mine UI icon | `assets/ui/mine-icon.png` | `mine-icon` |
| Town/service overworld UI icon | `assets/ui/overworld-icon.png` | `overworld-icon` (distinct from `town-overworld`) |
| Overworld inventory layout frame | `assets/ui/Inventory.png` | `inventory-ui-layout` |
| Rusty Sword item icon | `assets/items/common-sword.png` | `common-sword` |
| Common armor item icon | `assets/items/common-armor.png` | `common-armor` |
| Common ring item icon | `assets/items/common-ring.png` | `common-ring` |
| Common amulet item icon | `assets/items/common-amulet.png` | `common-amulet` |
| Rare steel sword item icon | `assets/items/rare-sword.png` | `rare-sword` |
| Rare armor item icon | `assets/items/rare-armor.png` | `rare-armor` |
| Rare ring item icon | `assets/items/rare-ring.png` | `rare-ring` |
| Rare amulet item icon | `assets/items/rare-amulet.png` | `rare-amulet` |
| Legendary weapon item icon | `assets/items/legendary-sword.png` | `legendary-sword` |
| Pyre Staff item icon | `assets/items/unique-pyre-staff.png` | `unique-pyre-staff` |
| Cursed Demon Blade item icon | `assets/items/cursed-demon-blade.png` | `cursed-demon-blade` |
| Ember Cleaver item icon | `assets/items/ember-cleaver.png` | `ember-cleaver` |
| Frostbite item icon | `assets/items/frostbite.png` | `frostbite` |
| Stormbreaker item icon | `assets/items/stormbreaker.png` | `stormbreaker` |
| Tide Blade item icon | `assets/items/tide-blade.png` | `tide-blade` |
| Gale Edge item icon | `assets/items/gale-edge.png` | `gale-edge` |
| Ice Shard item icon | `assets/items/ice-shard.png` | `ice-shard` |
| Legendary armor item icon | `assets/items/legendary-armor.png` | `legendary-armor` |
| Phoenix Robe item icon | `assets/items/unique-phoenix-robe.png` | `unique-phoenix-robe` |
| Shadow Veil item icon | `assets/items/shadow-veil.png` | `shadow-veil` |
| Inferno Plate item icon | `assets/items/inferno-plate.png` | `inferno-plate` |
| Storm Guard item icon | `assets/items/storm-guard.png` | `storm-guard` |
| Glacier Plate item icon | `assets/items/glacier-plate.png` | `glacier-plate` |
| Volt Mail item icon | `assets/items/volt-mail.png` | `volt-mail` |
| Wave Guard item icon | `assets/items/wave-guard.png` | `wave-guard` |
| Legendary ring item icon | `assets/items/legendary-ring.png` | `legendary-ring` |
| Cinder Orb item icon | `assets/items/unique-cinder-orb.png` | `unique-cinder-orb` |
| Spark Ring item icon | `assets/items/spark-ring.png` | `spark-ring` |
| Legendary amulet item icon | `assets/items/legendary-amulet.png` | `legendary-amulet` |
| Dew Pendant item icon | `assets/items/dew-pendant.png` | `dew-pendant` |
| Phantom Cloak item icon | `assets/items/phantom-cloak.png` | `phantom-cloak` |
| Flame Pendant item icon | `assets/items/flame-pendant.png` | `flame-pendant` |
| Wind Band item icon | `assets/items/wind-band.png` | `wind-band` |
| Common armor hover outline | `assets/items/common-armor-hover-pulse_256x256_sheet.png` | `common-armor-hover-sheet` |
| Common ring hover outline | `assets/items/common-ring-hover-pulse_256x256_sheet.png` | `common-ring-hover-sheet` |
| Common amulet hover outline | `assets/items/common-amulet-hover-pulse_256x256_sheet.png` | `common-amulet-hover-sheet` |
| Rare steel sword hover outline | `assets/items/rare-sword-hover-pulse_256x256_sheet.png` | `rare-sword-hover-sheet` |
| Rare armor hover outline | `assets/items/rare-armor-hover-pulse_256x256_sheet.png` | `rare-armor-hover-sheet` |
| Rare ring hover outline | `assets/items/rare-ring-hover-pulse_256x256_sheet.png` | `rare-ring-hover-sheet` |
| Rare amulet hover outline | `assets/items/rare-amulet-hover-pulse_256x256_sheet.png` | `rare-amulet-hover-sheet` |
| Legendary weapon hover outline | `assets/items/legendary-sword-hover-pulse_256x256_sheet.png` | `legendary-sword-hover-sheet` |
| Pyre Staff hover outline | `assets/items/unique-pyre-staff-hover-pulse_256x256_sheet.png` | `unique-pyre-staff-hover-sheet` |
| Cursed Demon Blade hover outline | `assets/items/cursed-demon-blade-hover-pulse_256x256_sheet.png` | `cursed-demon-blade-hover-sheet` |
| Ember Cleaver hover outline | `assets/items/ember-cleaver-hover-pulse_256x256_sheet.png` | `ember-cleaver-hover-sheet` |
| Frostbite hover outline | `assets/items/frostbite-hover-pulse_256x256_sheet.png` | `frostbite-hover-sheet` |
| Stormbreaker hover outline | `assets/items/stormbreaker-hover-pulse_256x256_sheet.png` | `stormbreaker-hover-sheet` |
| Tide Blade hover outline | `assets/items/tide-blade-hover-pulse_256x256_sheet.png` | `tide-blade-hover-sheet` |
| Gale Edge hover outline | `assets/items/gale-edge-hover-pulse_256x256_sheet.png` | `gale-edge-hover-sheet` |
| Ice Shard hover outline | `assets/items/ice-shard-hover-pulse_256x256_sheet.png` | `ice-shard-hover-sheet` |
| Legendary armor hover outline | `assets/items/legendary-armor-hover-pulse_256x256_sheet.png` | `legendary-armor-hover-sheet` |
| Phoenix Robe hover outline | `assets/items/unique-phoenix-robe-hover-pulse_256x256_sheet.png` | `unique-phoenix-robe-hover-sheet` |
| Shadow Veil hover outline | `assets/items/shadow-veil-hover-pulse_256x256_sheet.png` | `shadow-veil-hover-sheet` |
| Inferno Plate hover outline | `assets/items/inferno-plate-hover-pulse_256x256_sheet.png` | `inferno-plate-hover-sheet` |
| Storm Guard hover outline | `assets/items/storm-guard-hover-pulse_256x256_sheet.png` | `storm-guard-hover-sheet` |
| Glacier Plate hover outline | `assets/items/glacier-plate-hover-pulse_256x256_sheet.png` | `glacier-plate-hover-sheet` |
| Volt Mail hover outline | `assets/items/volt-mail-hover-pulse_256x256_sheet.png` | `volt-mail-hover-sheet` |
| Wave Guard hover outline | `assets/items/wave-guard-hover-pulse_256x256_sheet.png` | `wave-guard-hover-sheet` |
| Legendary ring hover outline | `assets/items/legendary-ring-hover-pulse_256x256_sheet.png` | `legendary-ring-hover-sheet` |
| Cinder Orb hover outline | `assets/items/unique-cinder-orb-hover-pulse_256x256_sheet.png` | `unique-cinder-orb-hover-sheet` |
| Spark Ring hover outline | `assets/items/spark-ring-hover-pulse_256x256_sheet.png` | `spark-ring-hover-sheet` |
| Legendary amulet hover outline | `assets/items/legendary-amulet-hover-pulse_256x256_sheet.png` | `legendary-amulet-hover-sheet` |
| Dew Pendant hover outline | `assets/items/dew-pendant-hover-pulse_256x256_sheet.png` | `dew-pendant-hover-sheet` |
| Phantom Cloak hover outline | `assets/items/phantom-cloak-hover-pulse_256x256_sheet.png` | `phantom-cloak-hover-sheet` |
| Flame Pendant hover outline | `assets/items/flame-pendant-hover-pulse_256x256_sheet.png` | `flame-pendant-hover-sheet` |
| Wind Band hover outline | `assets/items/wind-band-hover-pulse_256x256_sheet.png` | `wind-band-hover-sheet` |
| Rusty Sword hover outline (active pulse test) | `assets/items/common-sword-hover-pulse_256x256_sheet.png` | `common-sword-hover-sheet` |
| Rusty Sword hover outline (legacy static version) | `assets/items/common-sword-hover_256x256_sheet.png` | not wired |
| Rusty Sword traveling hover proof of concept | `assets/items/common-sword-hover-travel_256x256_sheet.png` | not wired |
| Health Potion item icon | `assets/items/health-potion.png` | `health-potion` |
| Health Potion hover outline | `assets/items/health-potion-hover_256x256_sheet.png` | `health-potion-hover-sheet` |
| Mana Potion item icon | `assets/items/mana-potion.png` | `mana-potion` |
| Mana Potion hover outline | `assets/items/mana-potion-hover_256x256_sheet.png` | `mana-potion-hover-sheet` |
| Avoid Death Potion item icon | `assets/items/avoid-death-potion.png` | `avoid-death-potion` |
| Avoid Death Potion hover outline | `assets/items/avoid-death-potion-hover_256x256_sheet.png` | `avoid-death-potion-hover-sheet` |
| Fire Stone material icon | `assets/items/fire-stone.png` | `fire-stone` |
| Fire Stone hover outline | `assets/items/fire-stone-hover-pulse_256x256_sheet.png` | `fire-stone-hover-sheet` |
| Wind Stone material icon | `assets/items/wind-stone.png` | `wind-stone` |
| Wind Stone hover outline | `assets/items/wind-stone-hover-pulse_256x256_sheet.png` | `wind-stone-hover-sheet` |
| Ice Stone material icon | `assets/items/ice-stone.png` | `ice-stone` |
| Ice Stone hover outline | `assets/items/ice-stone-hover-pulse_256x256_sheet.png` | `ice-stone-hover-sheet` |
| Lightning Stone material icon | `assets/items/lightning-stone.png` | `lightning-stone` |
| Lightning Stone hover outline | `assets/items/lightning-stone-hover-pulse_256x256_sheet.png` | `lightning-stone-hover-sheet` |
| Water Stone material icon | `assets/items/water-stone.png` | `water-stone` |
| Water Stone hover outline | `assets/items/water-stone-hover-pulse_256x256_sheet.png` | `water-stone-hover-sheet` |

Use **spritesheets** for any multi-frame animation. Do **not** use `load.image()` for a sheet; use `load.spritesheet()` so each frame can be played in sequence.

For single-frame item icons like the `Avoid Death Potion`, use `load.image()` instead.

Most Sorceress / Isabella item visuals still live in `src/data/itemVisuals.js` as `preload: false` placeholder entries until bespoke art exists. The first approved bespoke batch, `unique-pyre-staff`, `unique-phoenix-robe`, and `unique-cinder-orb`, is now wired as real preloaded item art with dedicated hover sheets. Shared item UI surfaces still fall back to placeholder icon containers for the remaining placeholder-only entries instead of silently rendering nothing.

The overworld location icons listed above are now preloaded and used by `OverworldScene.js` for town plus Act 1 destinations. Any destination without a matching icon texture, such as the current Act 2 levels, still falls back to the rectangle-node UI.

The overworld scene now uses `assets/ui/overworld.png` as its static map background. The animated overworld background sheet remains available on disk but is not wired.

The top and bottom overworld utility controls now use dedicated UI icon sprites with hover tooltips instead of rectangle buttons with always-visible text labels.

The overworld inventory scene now uses `assets/ui/Inventory.png` as its frame/layout reference directly. The live `800x600` placement contract matches `inventory-layout-redesign-guide.svg`: hero portrait center `166,186` at `84x128`, equip-slot centers `286,138` / `286,234` / `166,342` / `286,342`, and a `5x6` bag grid starting at `366,96` with `54x54` cells and `8` px gaps.

---

## Frame size (hero)

Hero spritesheets use **512×512 pixels per frame**:

```js
frameWidth: 512,
frameHeight: 512,
```

If a new hero sheet has different frame dimensions, use that sheet’s frame size and note it here.

---

## Where things are done

| Step                    | File         | What to do |
|-------------------------|-------------|------------|
| Load spritesheet        | `BootScene.js` → `preload()` | `this.load.spritesheet(key, path, { frameWidth, frameHeight })` |
| Create animation        | `BootScene.js` → `create()`  | `this.anims.create({ key, frames, frameRate, repeat })` |
| Use sprite in combat    | `CombatScene.js`            | Create sprite, then `setTexture()`, `play()`, and handle `animationcomplete` |

---

## BootScene: loading and creating animations

### 1. Preload the spritesheet

In `BootScene.preload()`:

```js
this.load.spritesheet('hero_slash_sheet', 'assets/hero/vince-regular-attack1.png', {
  frameWidth: 512,
  frameHeight: 512,
});
```

- Use a **unique texture key** (e.g. `hero_slash_sheet` for the slash attack).
- Same frame size as other hero sheets (512×512) unless the asset is different.

### 2. Create the animation in create()

- **Looping animation (e.g. idle):** Use `repeat: 0` and restart it in an `animationcomplete` handler to avoid a one-frame blink. Optionally duplicate the first frame at the end for a seamless loop.
- **One-shot animation (e.g. slash):** Use `repeat: 0` and drive frames from the sheet. Get frame count from the texture so you don’t hard-code it:

- **One-shot animations:** The code uses a helper `registerOneShotHeroAnim(sheetKey, animKey, frameRate = 24)` and a data-driven `oneShotAnims` array. Each entry is `{ sheetKey: 'hero_<name>_sheet', animKey: 'hero_<name>' }`. The helper is a no-op if the texture does not exist. To add a new one-shot: add the spritesheet in preload, add `{ sheetKey: 'hero_<name>_sheet', animKey: 'hero_<name>' }` to the `oneShotAnims` array in `BootScene.create()`, and use the anim in CombatScene (e.g. via `playHeroAnimThen`).

- **Animation key** (e.g. `hero_slash`) is what you pass to `sprite.play()` or to `playHeroAnimThen()`.

---

## CombatScene: using the hero sprite

- The hero sprite is created once in `CombatScene.create()` from `hero_sheet` and plays `hero_idle`.
- If Vince has the full Lightning unique set equipped (weapon + armor + accessory), combat idle swaps to `hero_lightning_set_idle_sheet` / `hero_lightning_set_idle` instead of the default idle.
- If Vince has the full Wind unique set equipped (weapon + armor + accessory), combat idle swaps to `hero_wind_set_idle_sheet` / `hero_wind_set_idle` instead of the default idle.
- If Vince has the full Fire unique set equipped (weapon + armor + accessory), combat idle swaps to `hero_fire_set_idle_sheet` / `hero_fire_set_idle` instead of the default idle.
- If Vince has the full Water unique set equipped (weapon + armor + accessory), combat idle swaps to `hero_water_set_idle_sheet` / `hero_water_set_idle` instead of the default idle.
- If Vince has the full Ice unique set equipped (weapon + armor + accessory), combat idle swaps to `hero_ice_set_idle_sheet` / `hero_ice_set_idle` instead of the default idle.
- Standard level bosses currently use `vampire_idle_sheet` / `vampire_attack_sheet` as a temporary placeholder and are labeled `Vampire` in combat. The special Reaper encounter still uses the Reaper sheets and name.
- Bats now use `bat_idle_sheet` while waiting and `bat_attack_sheet` during their attack before returning to idle, matching the skeleton/imp combat sprite flow.
- The Rusty Sword loot icon now swaps to `common-sword-hover-sheet` / `common-sword-hover` while hovered, and that live hover key is currently loaded from `common-sword-hover-pulse_256x256_sheet.png` as a 20-frame pulse test.
- A non-wired proof-of-concept sheet also exists for the Rusty Sword at `common-sword-hover-travel_256x256_sheet.png`; it uses 12 frames with the brightest gold highlight moving around the outline so the glow appears to travel rather than only pulse.
- The older static Rusty Sword hover outline file remains at `common-sword-hover_256x256_sheet.png` if you want to compare the pulse test against the original non-pulsing version.
- Potion loot icons now follow the same pattern with matching hover sheets and animated gold-outline keys derived from their base texture key.
- Material loot icons now follow the same pattern with dedicated stone icons plus pulsing gold hover sheets derived from their base texture keys.
- Newly approved bespoke loot items such as `Cursed Demon Blade`, `Shadow Veil`, `Phantom Cloak`, `Ember Cleaver`, `Inferno Plate`, `Flame Pendant`, `Gale Edge`, `Storm Guard`, `Wind Band`, `Frostbite`, `Glacier Plate`, `Stormbreaker`, `Tide Blade`, `Volt Mail`, `Wave Guard`, `Ice Shard`, `Spark Ring`, and `Dew Pendant` follow the same derived hover-key pattern with their own dedicated pulse sheets instead of falling back to the generic legendary hover families.
- **For skills that play an animation then run logic:** Use `playHeroAnimThen(sheetKey, animKey, callback)` instead of manually setting texture, playing, and wiring `animationcomplete`. The callback (e.g. `() => this.endPlayerTurn()` or the AoE/effect runner) runs after the animation finishes. Many skill branches now use `playHeroAnimThen` and `endPlayerTurn()`.
- **Manual approach (when needed):** To play an animation yourself: `this.heroSprite.stop()`, `this.heroSprite.setTexture('hero_<name>_sheet')`, `this.heroSprite.play('hero_<name>')`. When a one-shot finishes, Phaser fires `animationcomplete`; the scene still uses this for cases like idle reset. For one-shots driven by `playHeroAnimThen`, no per-skill `animationcomplete` branch is needed.
- Trigger the animation only when the skill is used (e.g. in `applySingleTargetSkill()` or the appropriate branch in `useSkill()`), and check `this.anims.exists('hero_<name>')` when relevant.

---

## Display size

Combat sprites are scaled to the size in **config.js**:

- `CONFIG.HERO_SPRITE_DISPLAY_WIDTH` / `CONFIG.HERO_SPRITE_DISPLAY_HEIGHT` (e.g. 200×200)
- Set on the sprite with `.setDisplaySize(heroW, heroH)`. The source frames (512×512) are scaled to this; no need to change asset dimensions.

---

## How to add a new hero animation (e.g. another skill)

1. **Asset:** Add the spritesheet under `assets/hero/` (e.g. `heavy_strike_512x512_sheet.png`). Use a consistent frame size (512×512 for hero) or note the size in this doc.
2. **BootScene preload:** Add `this.load.spritesheet('hero_<name>_sheet', 'assets/hero/<filename>', { frameWidth: 512, frameHeight: 512 })`.
3. **BootScene create:** Add an entry to the `oneShotAnims` array: `{ sheetKey: 'hero_<name>_sheet', animKey: 'hero_<name>' }`. (Or call `registerOneShotHeroAnim` directly if needed.) Idle is created separately.
4. **CombatScene:** Where the skill is used, call `playHeroAnimThen('hero_<name>_sheet', 'hero_<name>', callback)`. The callback is often `() => this.endPlayerTurn()` or the AoE/effect runner. For **single-target attacks** use `applySingleTargetSkill()`; for **AoE** use the `useSkill()` AoE branch; for **self-buffs** use the corresponding branch in `useSkill()`. No need to add a per-skill `animationcomplete` branch when using `playHeroAnimThen`.

---

## Checklist

- [ ] New animation uses a **spritesheet** (not `load.image`).
- [ ] Same **frame size** as other hero sheets (512×512) or documented here.
- [ ] Entry added to **oneShotAnims** in BootScene.create() (or `registerOneShotHeroAnim` used).
- [ ] **CombatScene** uses `playHeroAnimThen('hero_<name>_sheet', 'hero_<name>', callback)` where the skill is triggered.
- [ ] Skill trigger and `this.anims.exists('hero_<name>')` check are in place where relevant.
