# Changelog

All notable changes to Demon Slayer (Vince) are documented here. Versions use the format `MAJOR.MINOR` with date.

---

## Version 3.2.50 – 2026-03-10

### Changed
- **Mobile compatibility:** The game now renders correctly on phones, tablets, and desktops. Viewport meta tags prevent double-tap zoom, pull-to-refresh, and address bar resize on mobile browsers. The canvas fills the full viewport with `FIT` scaling and dark letterboxing on non-4:3 screens. (`index.html`, `main.js`)
- **Touch-friendly controls:** Settings +/- buttons enlarged from 44x36 to 48x48. Shop buy/sell buttons enlarged to meet the 44px minimum tap target. (`SettingsScene.js`, `ShopScene.js`)
- **Fullscreen toggle:** The main menu now shows a small fullscreen button in the bottom-right corner for mobile browsers. (`MenuScene.js`)

---

## Version 3.2.49 – 2026-03-10

### Changed
- **Inventory stacking:** Identical items in the general bag grid now stack into a single visual slot with a quantity label (e.g. `x3`). Equipped items remain individual. The underlying slot-based data model is unchanged. (`SceneUi.js`, `InventoryOverworldScene.js`, `InventoryPanel.js`)
- **Bag durability hidden:** Durability text no longer appears on bag grid cells. It remains visible on equipped-item slots and in the tooltip for equipment. (`InventoryOverworldScene.js`, `InventoryPanel.js`)
- **Shop sell stacking:** The sell list now groups identical non-equipped items into one row with a quantity and "each" price label. Selling removes one unit at a time. (`ShopScene.js`)

---

## Version 3.2.38–3.2.48 – 2026-03-10

### Fixed
- **Reaper evasion:** The Reaper now strips only equipment-based evasion at fight start; skill-based evasion can still build during the fight. (`Hero.js`, `CombatScene.js`)

### Changed
- **Warrior skill icons:** All seven Warrior skills (`Heavy Strike`, `Execute`, `Iron Skin`, `Evasion`, `Holy Light`, `Whirlwind`, `Life Drain`) now use framed dark-fantasy pixel-art icons in both the combat skill bar and level-up list. (`assets/ui/skills/button-*.png`)
- **Combat skill slots:** Skill icons no longer draw visible blue square backgrounds behind them. (`SkillButtons.js`)
- **Settings scene:** Uses `SettingsScene-bg.png` with an invisible `Back` plaque hotspot from `SettingsScene-bg-hotspots-800x600.json`. Controls block and title have independent layout offsets. (`SettingsScene.js`, `BootScene.js`)
- **Shop scene:** Uses `shop-with-buttons-bg.png` with invisible `Buy`/`Sell` sign hotspots from `shop-with-buttons-bg-hotspots-800x600.json`. (`ShopScene.js`, `BootScene.js`)
- **Loot scene:** Uses `LootScene-bg.png` with an invisible `Continue` plaque hotspot from `LootScene-bg-hotspots-800x600.json`. Continuing claims pending loot. (`LootScene.js`, `BootScene.js`)
- **Shared Continue button:** Cleaned `continue-button.png` replaces rectangle-plus-text Continue buttons in Event, Loot fallback, SkillTree, UnlockSelect, ClassOrigin, and Transition scenes via a reusable art-button helper in `SceneUi.js`.
- **Overworld/Town utility icons:** Bottom `Inventory` and `Character Sheet` icons shifted 30px right; Town now mirrors the same pair. Town-launched inventory, character sheet, and skill tree return to Town instead of overworld. (`OverworldScene.js`, `TownScene.js`, `InventoryOverworldScene.js`, `CharacterSheetScene.js`, `SkillTreeScene.js`)
- **Inventory bag alignment:** General inventory items render at 49x49 with a final 10px right offset on the first two bag columns. (`InventoryOverworldScene.js`, `InventoryPanel.js`)

---

## Version 3.2.35 – 2026-03-09

### Changed
- **Event scene:** Uses `EventScene-bg.png` as a framed narrative/merchant backdrop while keeping existing code-driven buttons. (`BootScene.js`, `EventScene.js`)

---

## Version 3.2.34 – 2026-03-09

### Fixed
- **Imp idle boot warnings:** `imp_idle` animation now derives frame count from the loaded spritesheet instead of requesting non-existent frames 36-47. (`BootScene.js`)

---

## Version 3.2.29–3.2.33 – 2026-03-09

### Changed
- **Overworld hotspot-driven travel:** The overworld now uses `overworld-bg-800x600-hotspots.png` as its painted map backdrop and reads `overworld-hotspots-800x600.json` for invisible travel hotspots. Old act-level icon sprites are no longer drawn; only the town overlay sprite remains. (`OverworldScene.js`, `BootScene.js`)
- **Hotspot tuning:** Multiple passes refined hotspot bounds for levels 1-10 and town against painted silhouettes, including minimal-label proof variants for cleaner review.
- **Invisible hotspots as default:** Hovered hotspots show only tooltips at runtime. The orbiting firefly hover idea is preserved as unwired reference material only.
- **Unified hotspotting skill:** `background-hotspotting` now covers measurement, normalization, matcher hints, manifest validation, and proof rendering. `re-size-image` and `pixel-grid` redirect to it.

---

## Version 3.2.25–3.2.28 – 2026-03-09

### Added
- **Overworld hotspot approval workflow:** Reusable manifest + proof generator for mapping the overworld route onto composite map art. Includes pixel grid, hotspot rectangles, center marks, coordinate callouts, and a minimal-label proof mode. (`scripts/overworld_hotspot_proof.py`, `scripts/suggest_overworld_matches.mjs`)
- **Validation utilities:** Image-dimension and hotspot-manifest validators so proof runs fail fast on inconsistencies. (`scripts/measure_image_dimensions.mjs`, `scripts/validate_hotspot_manifest.py`)

### Changed
- **Hotspot proof iterations:** Multiple coordinate refinement passes for the overworld manifest against clean grid crops and outer painted silhouettes.
- **Skill organization:** Added `re-size-image` and `pixel-grid` project skills, later consolidated into `background-hotspotting`.

---

## Version 3.2.22–3.2.24 – 2026-03-08

### Changed
- **Main menu:** Uses `startgame-bg.png` as a full painted landing menu with invisible hotspots over `Load Game`, `Start New Game`, and `Settings`. Earlier iterations used separate plaque sprites and a three-button art stack with tooltips. (`MenuScene.js`, `BootScene.js`)

### Fixed
- **Overworld icon cleanup:** Removed green matte/fringe from `level2-overworld.png` and `level4-overworld.png`. (`assets/overworld/`)

---

## Version 3.2.16–3.2.21 – 2026-03-08

### Added
- **Dedicated loot background:** `LootScene-bg.png` used as the loot-screen backdrop when available, falling back to the level background. (`BootScene.js`, `LootScene.js`)
- **Town navigation icons:** Cleaned transparent icons for `blacksmith`, `alchemist`, `shop`, `inn`, `mine`, and `overworld` services. (`assets/ui/*-icon.png`)
- **Menu settings button:** Dedicated themed settings button below the other menu actions. (`assets/ui/menu-settings-button.png`, `MenuScene.js`)

### Changed
- **Town/service navigation:** Town, Shop, Blacksmith, Mine, Alchemist, and Upgrade scenes share a reusable top-right icon row for local travel and overworld return via `SceneUi.js` helpers.
- **Service backdrops:** Town uses `town-bg.png`, Blacksmith uses `blacksmith-bg.png`, Shop uses `shop-with-buttons-bg.png` (before hotspot pass), Mine uses `mine-bg.png`, Alchemist uses `alchemist-bg.png`. All preserve existing gameplay logic.
- **New run flow:** Skips class-selection when only Vince is unlocked, going straight to `UnlockSelect`. (`MenuScene.js`, `ClassSelectScene.js`)
- **Level backgrounds:** Levels 1-7 (later extended to 1-10) use dedicated `levelN-bg.png` art during combat and loot, with fallback for levels without art. (`BootScene.js`, `CombatScene.js`, `LootScene.js`)

---

## Version 3.2.10–3.2.15 – 2026-03-08

### Changed
- **Combat inventory:** Now uses the same full-screen `Inventory.png` layout, paper-doll slots, bag grid, and close hotspot as the overworld inventory instead of the older side-panel list. (`InventoryPanel.js`)
- **Overworld title:** Reads `Overworld` instead of `World Map`. (`OverworldScene.js`)
- **Blacksmith scene:** Uses `blacksmith-bg.png` as the forge backdrop with invisible `Craft`/`Upgrade`/`Repair`/`Back to Town` hotspots aligned to painted plaques. Multiple passes tuned hotspot alignment and visibility. (`BlacksmithScene.js`, `BootScene.js`)
- **Town scene:** Uses `town-bg.png` with invisible plaque hotspots for Rest, Shop, Blacksmith, Mine, Alchemist, and Back to Overworld. Added Alchemist placeholder scene. (`TownScene.js`, `AlchemistScene.js`)
- **New game safety:** `Start New Game` shows a confirmation popup when a save already exists. (`MenuScene.js`)

### Fixed
- **Inventory presentation:** Removed dark slot-cover boxes, extra rarity borders, and lower-left status strip. Retuned hero portrait, equip slot, and bag item placement to match `Inventory.png` art directly. Close hotspot enlarged. (`InventoryOverworldScene.js`)

---

## Version 3.2.1–3.2.9 – 2026-03-07 to 2026-03-08

### Added
- **Reusable enemy buff removal:** Shared `buff-removal-skill` definition with turn-based cadence. Reaper uses it every third turn to strip combat buffs. Enemy attack animations routed through a shared helper. (`enemySkills.js`, `levels.js`, `Enemy.js`, `CombatScene.js`)

### Fixed
- **Run unlock carryover:** Fresh runs now clear previous unlock selections. (`unlocks.js`, `main.js`)
- **Battle buff stacking:** Defense and evasion buffs stack correctly across multiple uses; status line shows combined total. Evasion capped at 90%. (`Hero.js`, `CombatScene.js`, `config.js`)

### Changed
- **Sorceress fire-set visuals:** `Pyre Staff`, `Phoenix Robe`, `Cinder Orb` now use approved bespoke art with dedicated hover sheets instead of placeholder containers. (`assets/items/unique-pyre-staff*.png`, `assets/items/unique-phoenix-robe*.png`, `assets/items/unique-cinder-orb*.png`, `itemVisuals.js`)
- **Holy Light:** Now restores 35% of max HP instead of a flat heal. (`skills.js`, `CombatScene.js`)
- **Auto-attack:** Clicking a living enemy without preselecting a skill uses the hero's default 0-mana attack. (`skills.js`, `CombatScene.js`)
- **Inventory close/placement:** Finalized close hotspot, bag item sizes, and equip slot positions for the `Inventory.png` layout. (`InventoryOverworldScene.js`)
- **Mine reward popup:** Shows the found material's sprite at 96x96. (`MineScene.js`)

---

## Version 3.2.0 – 2026-03-07

### Added
- **Class registry:** Shared class metadata (names, stats, growth, skills, unlock rules, origin text, combat idle mappings) in `classes.js`.
- **Item visual manifest:** `itemVisuals.js` centralizes icon paths, hover sheets, preload rules, and placeholder entries. `BootScene.js` preloads by looping the manifest.
- **Repo-native asset tooling:** `npm run asset:clean`, `asset:hover`, `asset:process-approved`, `validate:item-pipeline` via vendored scripts (`remove-background.mjs`, `generate-hover-sheet.mjs`, `finalize-icon.mjs`, `process-approved-item.mjs`, `validate-item-pipeline.mjs`).

### Changed
- **Selector-driven item routing:** Loot, shop, crafting, and merchant pools use item metadata (`allowedClasses`, `recipeMaterial`, `setId`) instead of Warrior-vs-Sorceress arrays.
- **Unified hover/icon rendering:** Shared surfaces resolve hover behavior and icon fallbacks from one path. Missing Sorceress textures render placeholder icons.
- **Sorceress pilot:** Sorceress items flow through the same selector, manifest, preload, fallback, and verification path as Vince items.

---

## Version 3.1.49–3.1.53 – 2026-03-07

### Added
- **Dual accessory equipment:** Vince supports two accessory slots. Set bonuses trigger when weapon and armor match either accessory. Older saves auto-migrate. (`Hero.js`, `inventory.js`, `saveLoad.js`)

### Changed
- **Inventory layout:** Diablo-style paper-doll with Weapon, Armor, and two Accessory equip slots plus a general item grid. Equipped gear no longer appears in the bag. (`InventoryOverworldScene.js`, `InventoryPanel.js`)
- **Unique Warrior item art (all five elemental sets):** Approved bespoke icons and dedicated pulsing hover sheets wired for `Cursed Demon Blade`, `Shadow Veil`, `Phantom Cloak`, `Ember Cleaver`, `Inferno Plate`, `Flame Pendant`, `Gale Edge`, `Frostbite`, `Glacier Plate`, `Storm Guard`, `Wind Band`, `Stormbreaker`, `Tide Blade`, `Volt Mail`, `Wave Guard`, `Ice Shard`, `Spark Ring`, `Dew Pendant`. All flow through shared vendor/item icon rendering. (`assets/items/*.png`, `items.js`, `BootScene.js`)
- **Inventory unique hover:** Overworld inventory auto-applies golden hover animation to unique items by deriving keys from `assetKey`. (`InventoryOverworldScene.js`)

---

## Version 3.1.43–3.1.48 – 2026-03-07

### Added
- **Crafting material icons:** Dedicated pixel-art icons and pulsing hover sheets for Fire Stone, Wind Stone, Ice Stone, Lightning Stone, and Water Stone. (`assets/items/*-stone*.png`, `items.js`, `BootScene.js`)

### Changed
- **Overworld layout polish:** Multiple passes enlarged Level 5/6 nodes, tightened utility icon spacing, restored town label, and matched town hover scaling with map nodes. (`OverworldScene.js`)
- **Material hover sheets:** Rebuilt twice to match the existing Vince outside-glow pulse style.

---

## Version 3.1.34–3.1.42 – 2026-03-07

### Added
- **Overworld location icons:** Full set of transparent pixel-art icons for town, levels 1-9, and castle. (`assets/overworld/*-overworld.png`)
- **Overworld UI icons:** Settings, save game, abandon run, inventory, and character sheet sprite icons with hover tooltips replacing rectangle buttons. (`assets/ui/*-icon.png`)
- **Animated overworld background:** `overworldmap_background_sheet.png` added and briefly wired, then replaced by the static painted map.

### Changed
- **Overworld map evolution:** Progressed from rectangle nodes to icon-first clickable nodes, then to an animated background, then to the static `overworld.png` backdrop with path-following node positions, and finally to the hotspot-driven painted map (wired in 3.2.31+).
- **Overworld static background:** `overworld.png` wired as the world map backdrop. Level labels tightened under sprites. (`BootScene.js`, `OverworldScene.js`)

### Fixed
- **Green background cleanup:** Reprocessed level 4-6 overworld icons to remove unwanted green matte. (`assets/overworld/`)

---

## Version 3.1.25–3.1.33 – 2026-03-07

### Added
- **Item icon families:** Common, rare, and legendary icons for swords, armor, rings, and amulets. (`assets/items/common-*.png`, `assets/items/rare-*.png`, `assets/items/legendary-*.png`)
- **Item hover sheets:** Pulsing golden hover-outline spritesheets for all Vince-side item icon families. (`assets/items/*-hover-pulse_256x256_sheet.png`)
- **Rusty Sword hover:** Initial 4-frame hover outline, then a traveling-glow proof (12 frames), then a pulsing proof (8 frames), finalized as a 20-frame pulse test wired in-game. (`assets/items/common-sword-hover*.png`)
- **Potion hover outlines:** Health, Mana, and Avoid Death potions use the same animated golden hover treatment. Hover hookup follows base texture naming convention. (`assets/items/*-potion-hover*.png`)

### Changed
- **Sorceress item separation:** Isabella/Sorceress gear no longer borrows Vince-side icons; stays unwired until dedicated art exists. (`items.js`)
- **Rare sword icon:** Regenerated to read clearly as a steel sword. (`assets/items/rare-sword.png`)
- **Rusty Sword icon:** Regenerated with cleaner pixel-art source. (`assets/items/common-sword.png`)

---

## Version 3.1.21–3.1.24 – 2026-03-07

### Added
- **Avoid Death Potion:** Reaper drops grant 3-turn invulnerability. Dedicated icon and loot sprite. (`items.js`, `inventory.js`, `combat.js`, `CombatScene.js`, `saveLoad.js`)
- **Health and Mana Potion icons:** Dedicated pixel-art icons sized for Vince's UI tier. (`assets/items/health-potion.png`, `assets/items/mana-potion.png`)
- **Animation speed setting:** Settings row with 100%/150%/200% speed. Affects sprite playback, combat pacing, and scene tweens. (`audio.js`, `SettingsScene.js`, `BootScene.js`, `CombatScene.js`)

### Fixed
- **Potion icon backgrounds:** Cleaned baked checkerboard/matte artifacts to transparent. (`assets/items/*-potion.png`)

---

## Version 3.1.17–3.1.20 – 2026-03-07

### Changed
- **Unlock costs and budget:** All run unlocks cost 50 RP. Unlock picker enforces Total Run Points as a real budget. (`unlocks.js`, `UnlockSelectScene.js`)
- **Unique upgrade text:** Upgraded unique weapons grant +10% Damage; armor/accessory upgrades list actual stat improvements and apply correctly. (`items.js`, `Hero.js`, `combat.js`, `UpgradeScene.js`)
- **Enemy formation:** Multi-enemy groups auto-tighten spacing to stay on-screen. (`CombatScene.js`)
- **Random Reaper:** Can only roll at fight index 0. Day-10 Reaper popup waits until Vince is fully restored. (`CombatScene.js`, `OverworldScene.js`)

---

## Version 3.1.8–3.1.16 – 2026-03-06

### Changed
- **Enemy sprites:** Skeleton idle/attack sheets wired. Bat idle/attack sheets wired. Standard bosses use vampire idle/attack as placeholder, labeled `Vampire`. (`BootScene.js`, `CombatScene.js`)
- **Unique set idle animations:** Lightning, Wind, Fire, Water, and Ice full-set idle spritesheets added and wired for Vince. All set idles loop correctly via generalized idle detection. (`BootScene.js`, `CombatScene.js`, `assets/hero/*_set_idle_512x512_sheet.png`)

---

## Version 3.1.6–3.1.7 – 2026-03-06

### Added
- **Day system:** Runs track days; day shown on World Map. Day-10 triggers a one-time Reaper visit.
- **I Love Mining unlock:** One free mine visit per week when selected.
- **Browser playthrough methodology:** Saved in `cursor.md` for future gameplay verification.

### Changed
- **World Map warning:** Entering a level while injured warns and offers rest.
- **Flee penalty:** 50% gold + 2 random inventory items instead of all gold + 1 equipped break.
- **Combat/shop UI:** Low-mana skills and unaffordable purchases greyed out more clearly. Passive skill buttons match active button color.

---

## Version 3.1.3–3.1.5 – 2025-03-06

### Added
- **Thorncape animation:** `thorncape_512x512_sheet.png` for block/reflect skill. Renamed from `thornshield`.
- **Iron Evasion (Warrior):** Level-10 ultimate. 10 mana, +10 Def and 55% Evasion. Uses `iron_evasion_512x512_sheet.png`.
- **Crystal Fortress (Sorceress):** Level-10 ultimate. 15 mana, 60% Evasion and 5 Def. No spritesheet yet.
- **Evasion cap:** 95% max (later reduced to 90% in 3.2.8).

### Changed
- **Heavy Strike:** Mana 3 (was 4), damage 1.5x Str (was 1.8x).
- **Life Drain:** Available at level 5 only.
- **Enemy scaling:** `ENEMY_SCALE_FACTOR` 1.45 to 1.30; boss per-level damage factor 0.15 to 0.08.
- **Unique items:** All 30 uniques and set bonuses buffed +1 per integer stat, +0.01 per evasion.
- **Character sheet:** Skills show damage multipliers and effect text. Run unlock bonuses listed.
- **Hero names:** Sorceress is "Isabella"; Warrior is "Vince".
- **Scene guards:** Combat, Town, Shop, Blacksmith, Mine, Loot, CharacterSheet, InventoryOverworld redirect to Menu when hero is missing.
- **CombatScene refactor:** `endPlayerTurn()`, `playHeroAnimThen()`, `applySingleTargetSkill()`. `oneShotAnims` array in BootScene. `createButton()` helper in SceneUi.

---

## Version 3.1.0–3.1.2 – 2025-03-06

### Added
- **Act 2:** Levels 11-20 unlock after defeating Castle boss. Transition narrative plays. Sorceress class unlocks on Act 2 entry.
- **Mine:** Rent pickaxe (250g) to mine a random crafting material. Town has "Visit Mine".
- **Crafting:** Blacksmith Craft tab lists unique recipes by class. 350g + 1 material each.
- **Reaper encounter:** Chance on level revisit, scales with level. Tough boss with Frightened debuff (0 evasion, halved strength). Base 5%, +2% per level (reduced from initial 8%/4%).

### Changed
- **Level structure:** 20 levels total across two acts. Level 10 boss "Evil Demon", level 20 boss "Demon Emperor".
- **Shop sell filter:** Type filter (All, Weapons, Armor, Accessories, Consumables, Scrolls) in sell list.
- **Blacksmith craft filter:** Only shows recipes craftable with owned materials; tooltip shows classification and effect.

---

## Version 3.0.0–3.0.5 – 2025-03-05 to 2025-03-06

### Added
- **Sorceress class:** Second playable class (unlocked after level 10). Intelligence-based. Skills: Fireball, Flame Aura (DoT), Flame Wall (+40% evasion), and more.
- **Class origin narratives:** Story scene after class selection before hero creation.
- **Flee confirmation:** Modal warns about gold loss and item break. Post-flee narrative on overworld.
- **Skill points:** 2 per level-up. Skills cost 1-3 points. Multiple picks per level. Shrine of Wisdom grants +1.
- **Item sets by class:** Strength set (Warrior), intelligence set (Sorceress). Shared potions/scrolls.
- **Skill Tree:** Shows current level in title. Accessible from Character Sheet. Consistent tooltip font. Tier-1-only passives at level 2; one passive per stat per level.
- **Combat status effects line:** Active buffs shown under HP/Mana/Level.
- **Combat log:** Running log (top-right) of hero and enemy actions.
- **Game Over:** Full run reset with point tallying. "Abandon Run" on World Map.
- **Random event feedback:** Effect/loot/gold shown in green text after each event.

### Changed
- **Balance:** Defense no longer increases with level. Enemies have higher base HP (8) and damage (2) with steeper scaling (1.45).

### Fixed
- **Skill buttons:** Re-attaches `pointerdown` listener after `setInteractive()` so skills work after enemy turns.
- **Defeated enemies:** Sprites, names, and HP text hidden and made non-interactive at 0 HP.
- **Combat progression:** `doEnemyTurn` uses correct scene scope; calls `onCombatWin()` when all enemies dead.

---

## Version 2.3.0–2.4.0 – 2025-03-05

### Added
- **Multi-enemy fights:** 1-5 enemies per non-boss fight, count ramps by level. Target selection for single-target skills; AoE hits all.
- **Town rest cost:** Base + level-scaled gold cost.
- **Shop buy/sell:** Choice screen with buy and sell modes. Sell at 50% of buy price. Item classification shown.
- **Durability system:** Per-instance durability on equipment. Weapon degrades on damage-dealing skill use; armor on taking damage. Item removed at 0 with popup.
- **Slot-based inventory:** Array of `{ id, itemId, durability?, maxDurability? }` slots. Legacy save migration.
- **Inventory scroll and filters:** Scrollable list with type filters in both combat and overworld.
- **Blacksmith:** Repair damaged equipment by rarity-based cost.

### Changed
- **HP/Mana retention:** No longer refilled on level entry, loot, or Play. Persist until rest, level-up, or potions.
- **Whirlwind:** 7 mana, AoE. **Slash:** 0 mana.
- **Game over:** Hero reset to avoid soft-lock at 0 HP.

---

## Version 2.1.0–2.2.2 – 2025-03-04 to 2025-03-05

### Added
- **Unequip:** `InventorySystem.unequip(hero, type)` clears one equipment slot.
- **Equip/Unequip buttons:** Visible gray buttons per inventory row replacing invisible hit areas.
- **Item classification in inventory:** Grouped by type with section headers, sorted by rarity.
- **Character Sheet:** Level/XP, stats, skills with mana costs, equipped items with effects. Accessible from map and inventory.

### Fixed
- **Equip button hit areas:** `setDepth(1)` so they receive pointer events above text.
- **Combat stuck after kill:** `delayedCall` uses correct scope; `doEnemyTurn` calls `onCombatWin()` when no living enemies.

### Changed
- **No auto-equip on Take:** Loot only adds to inventory; player equips manually.

---

## Version 2.0.0 – 2025-03-04

### Added
- **Turn-based combat:** Alternating turns with enemy delay. Shake animation and floating damage numbers.
- **10 levels:** Levels 1-9 (dungeons) and Level 10 (Castle). Unlock progression.
- **Hero/enemy stat scaling:** Health, mana, strength, defense per level. Exponential enemy scaling.
- **Gold:** Monster drops scale by level. Used for shop.
- **Accessories:** New equipment slot with strength, health, mana bonuses.
- **Spell scrolls:** Use to permanently learn a skill. Available in loot and shop.
- **Loot overhaul:** Weapons, armor, accessories, scrolls, potions. Rarity-based values. Boss-only legendaries.
- **Overworld map:** Town (rest), Shop (buy), Inventory. Level nodes 1-10.
- **Shop:** Random stock of up to 5 items per visit.

---

## Version 1.0.0 – 2025-03-04

### Added
- Phaser 3 roguelike: Vince the Warrior, 2 levels, real-time combat, XP/level-up, loot (weapons, armor, potions), overworld map, mouse-only controls.
- Placeholder graphics (colored shapes and text). Asset naming convention for future Sorceress art.
