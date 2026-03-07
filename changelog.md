# Changelog

All notable changes to Demon Slayer (Vince) are documented here. Versions use the format `MAJOR.MINOR` with date and timestamp.

---

## Version 3.2.5 – 2026-03-08

**Date:** 2026-03-08  
**Timestamp:** Finalize inventory hotspot and item placement

### Fixed
- **Inventory close button:** The painted `Close` plaque in the overworld inventory now has a larger invisible hotspot aligned to the art so the screen can be exited reliably again.
- **Bottom-left artifact:** Removed the last dark status-strip rectangle that was still visible in the lower-left corner of the inventory background.

### Changed
- **Bag item presentation:** General inventory item icons are now much larger and shifted left/down so they sit more naturally inside the painted bag slots.
- **Equipment slot placement:** Weapon, armor, and accessory icons now sit lower and slightly more to the right so they better match the updated paper-doll wells.

### Technical
- [src/scenes/InventoryOverworldScene.js](src/scenes/InventoryOverworldScene.js): Removes the leftover lower-left status rectangle, expands the invisible `Close` hit area, and retunes bag/equipped icon offsets and sizes for the cleaned inventory background.

---

## Version 3.2.4 – 2026-03-08

**Date:** 2026-03-08  
**Timestamp:** Clean inventory layout overlays and alignment

### Changed
- **Inventory presentation:** The overworld inventory now renders directly on the cleaned `Inventory.png` art without the extra dark slot-cover boxes that previously sat on top of the weapon, armor, and accessory wells.
- **Item icon framing:** Equipped items and bag items no longer draw the extra square rarity border in the overworld inventory, so the background artwork itself provides the slot framing.
- **Layout alignment:** The hero portrait, equipped items, and bag-item icon sizes and offsets were retuned so they sit more cleanly inside the updated inventory artwork.

### Technical
- [src/scenes/InventoryOverworldScene.js](src/scenes/InventoryOverworldScene.js): Removes the layout cover rectangles, drops the item-border rectangle pass, and centralizes the hero/equipped/bag placement tuning used by the inventory layout image path.
- [spritework.md](spritework.md): Updates the inventory-layout note so it reflects the new direct-on-art rendering approach instead of the old masking workaround.

---

## Version 3.2.3 – 2026-03-08

**Date:** 2026-03-08  
**Timestamp:** Hide blacksmith hotspots and lower alignment

### Fixed
- **Blacksmith menu hotspots:** The clickable plaque areas on the blacksmith landing screen are now fully invisible to the player instead of showing a visible hover box.
- **Plaque hit-area alignment:** The blacksmith landing hotspots were moved slightly lower and tightened vertically so they better match the painted background buttons.

### Technical
- [src/scenes/BlacksmithScene.js](src/scenes/BlacksmithScene.js): Removes the landing-menu hover overlay and retunes the plaque hotspot coordinates so the invisible hit areas line up more closely with the `blacksmith.png` artwork.

---

## Version 3.2.2 – 2026-03-08

**Date:** 2026-03-08  
**Timestamp:** Add blacksmith landing background menu

### Changed
- **Blacksmith entry screen:** Visiting the blacksmith now opens a dedicated landing menu that uses the approved `blacksmith.png` artwork instead of dropping straight into the repair list.
- **Button alignment and routing:** The painted `Craft Items`, `Upgrade Items`, `Repair Items`, and `Back to Town` plaques now have real interactive hotspots aligned to their on-art button sizes and positions.
- **Blacksmith return flow:** Repair, craft, and upgrade detail views now return to the blacksmith landing menu so the new background screen acts as the hub.

### Technical
- [assets/ui/blacksmith.png](assets/ui/blacksmith.png), [src/scenes/BootScene.js](src/scenes/BootScene.js): Wires the blacksmith landing background into the scene preload list with a dedicated UI texture key.
- [src/scenes/BlacksmithScene.js](src/scenes/BlacksmithScene.js): Adds the new default menu mode, overlays plaque-sized interactive hit areas on the background art, and preserves the existing repair/craft detail flows behind the new landing screen.
- [src/scenes/UpgradeScene.js](src/scenes/UpgradeScene.js), [spritework.md](spritework.md): Makes `Back to Blacksmith` explicitly return to the landing menu and documents the new UI background asset.

---

## Version 3.2.1 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Activate first Sorceress unique item batch

### Changed
- **Sorceress fire-set visuals:** `Pyre Staff`, `Phoenix Robe`, and `Cinder Orb` now use their own approved Sorceress unique item art instead of placeholder icon containers.
- **Shared item surfaces:** The first Sorceress bespoke icons now flow through the same manifest-driven preload, loot hover, inventory, shop, blacksmith, upgrade, and merchant rendering path already used by Warrior uniques.

### Technical
- [assets/items/unique-pyre-staff.png](assets/items/unique-pyre-staff.png), [assets/items/unique-phoenix-robe.png](assets/items/unique-phoenix-robe.png), [assets/items/unique-cinder-orb.png](assets/items/unique-cinder-orb.png): Adds cleaned approved Sorceress fire unique icons using the repo-native cleanup pipeline.
- [assets/items/unique-pyre-staff-hover-pulse_256x256_sheet.png](assets/items/unique-pyre-staff-hover-pulse_256x256_sheet.png), [assets/items/unique-phoenix-robe-hover-pulse_256x256_sheet.png](assets/items/unique-phoenix-robe-hover-pulse_256x256_sheet.png), [assets/items/unique-cinder-orb-hover-pulse_256x256_sheet.png](assets/items/unique-cinder-orb-hover-pulse_256x256_sheet.png): Adds dedicated hover pulse sheets for the first Sorceress bespoke item batch.
- [src/data/itemVisuals.js](src/data/itemVisuals.js), [spritework.md](spritework.md): Promotes the fire unique Sorceress manifest entries from placeholder-only mode to real preloaded visuals and documents the new asset keys.

---

## Version 3.1.53 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Wire approved final unique accessory icons

### Changed
- **Unique Warrior accessory art:** `Ice Shard`, `Spark Ring`, and `Dew Pendant` now use their own approved Vince-side item icons instead of falling back to the generic legendary amulet and ring art.
- **Inventory and vendor visuals:** The final unique Warrior accessory art now appears in inventory, shop, blacksmith, upgrade, and merchant surfaces because those items now resolve to dedicated accessory texture keys everywhere shared item icon rendering reads `assetKey`.
- **Loot hover coverage:** The same three approved accessory icons now use dedicated pulsing golden hover sheets in the loot scene, and they automatically participate in the inventory's unique-only golden hover path.

### Technical
- [assets/items/ice-shard.png](assets/items/ice-shard.png), [assets/items/spark-ring.png](assets/items/spark-ring.png), [assets/items/dew-pendant.png](assets/items/dew-pendant.png): Adds cleaned approved unique Warrior accessory icons.
- [assets/items/ice-shard-hover-pulse_256x256_sheet.png](assets/items/ice-shard-hover-pulse_256x256_sheet.png), [assets/items/spark-ring-hover-pulse_256x256_sheet.png](assets/items/spark-ring-hover-pulse_256x256_sheet.png), [assets/items/dew-pendant-hover-pulse_256x256_sheet.png](assets/items/dew-pendant-hover-pulse_256x256_sheet.png): Adds dedicated hover pulse sheets for the final approved unique Warrior accessory icons.
- [src/data/items.js](src/data/items.js), [src/scenes/BootScene.js](src/scenes/BootScene.js), [spritework.md](spritework.md): Wires the final unique Warrior accessory texture keys into data, preload, hover animation registration, and sprite documentation.

---

## Version 3.2.0 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Scale class and item asset pipeline

### Added
- **Class registry:** Class metadata now lives in a shared registry, including names, base stats, growth, starting skills, unlock rules, origin text, and combat idle visual mappings.
- **Item visual manifest:** Item icon paths, hover sheets, preload rules, and placeholder-only future entries now live in one manifest instead of being split between item data and manual `BootScene` lists.
- **Repo-native asset tooling:** Vince now ships its own icon cleanup, hover-sheet generation, approved-proof processing, and item-pipeline validation scripts via `package.json` commands.

### Changed
- **Selector-driven item routing:** Loot, shop, crafting, and merchant pools now come from item metadata such as `allowedClasses`, `recipeMaterial`, `setId`, and eligibility flags instead of Warrior-vs-Sorceress arrays.
- **Unified hover and icon rendering:** Shared item surfaces now resolve hover behavior and icon fallbacks from one path, and missing Sorceress textures intentionally render placeholder icons instead of silently disappearing.
- **Sorceress pilot coverage:** Sorceress item definitions now flow through the same selector, manifest, preload, fallback, and browser-verification path used for Vince items, which makes future class migrations much cheaper.

### Technical
- [src/data/classes.js](src/data/classes.js), [src/entities/Hero.js](src/entities/Hero.js), [src/scenes/ClassSelectScene.js](src/scenes/ClassSelectScene.js), [src/scenes/ClassOriginScene.js](src/scenes/ClassOriginScene.js), [src/scenes/TransitionScene.js](src/scenes/TransitionScene.js), [src/data/skills.js](src/data/skills.js), [src/systems/progression.js](src/systems/progression.js), [src/systems/saveLoad.js](src/systems/saveLoad.js), [src/scenes/CombatScene.js](src/scenes/CombatScene.js): Moves class behavior behind a shared registry and removes direct Warrior/Sorceress branching from hero creation, class UI, progression defaults, unlock handling, save defaults, and set-idle lookup.
- [src/data/itemVisuals.js](src/data/itemVisuals.js), [src/data/items.js](src/data/items.js), [src/systems/loot.js](src/systems/loot.js), [src/systems/shop.js](src/systems/shop.js), [src/scenes/EventScene.js](src/scenes/EventScene.js), [src/scenes/BlacksmithScene.js](src/scenes/BlacksmithScene.js): Makes item metadata the source of truth for selectors, crafting recipes, merchant pools, and visual linkage.
- [src/scenes/BootScene.js](src/scenes/BootScene.js), [src/ui/SceneUi.js](src/ui/SceneUi.js), [src/scenes/InventoryOverworldScene.js](src/scenes/InventoryOverworldScene.js), [src/scenes/LootScene.js](src/scenes/LootScene.js): Replaces manual preload and per-scene hover wiring with manifest-driven loops plus shared item-hover helpers and placeholder icon rendering.
- [scripts/remove-background.mjs](scripts/remove-background.mjs), [scripts/generate-hover-sheet.mjs](scripts/generate-hover-sheet.mjs), [scripts/finalize-icon.mjs](scripts/finalize-icon.mjs), [scripts/process-approved-item.mjs](scripts/process-approved-item.mjs), [scripts/validate-item-pipeline.mjs](scripts/validate-item-pipeline.mjs), [package.json](package.json): Vendors the asset pipeline into the repo, adds `pngjs`, and exposes cleanup, hover, process-approved, and validation commands.

---

## Version 3.1.52 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Wire approved lightning and water unique item icons

### Changed
- **Unique Warrior item art:** `Stormbreaker`, `Tide Blade`, `Volt Mail`, and `Wave Guard` now use their own approved Vince-side item icons instead of falling back to the generic legendary sword and armor art.
- **Inventory and vendor visuals:** The approved lightning and water unique weapon and armor art now appears in the correct inventory, shop, blacksmith, upgrade, and merchant surfaces because those scenes now render item icons from `assetKey` instead of text-only rows where relevant.
- **Loot hover coverage:** The same four approved unique icons now use dedicated pulsing golden hover sheets in the loot scene, and they automatically participate in the inventory's unique-only golden hover path.

### Technical
- [assets/items/stormbreaker.png](assets/items/stormbreaker.png), [assets/items/tide-blade.png](assets/items/tide-blade.png), [assets/items/volt-mail.png](assets/items/volt-mail.png), [assets/items/wave-guard.png](assets/items/wave-guard.png): Adds cleaned approved unique Warrior item icons.
- [assets/items/stormbreaker-hover-pulse_256x256_sheet.png](assets/items/stormbreaker-hover-pulse_256x256_sheet.png), [assets/items/tide-blade-hover-pulse_256x256_sheet.png](assets/items/tide-blade-hover-pulse_256x256_sheet.png), [assets/items/volt-mail-hover-pulse_256x256_sheet.png](assets/items/volt-mail-hover-pulse_256x256_sheet.png), [assets/items/wave-guard-hover-pulse_256x256_sheet.png](assets/items/wave-guard-hover-pulse_256x256_sheet.png): Adds dedicated hover pulse sheets for the newly approved lightning and water unique Warrior items.
- [src/data/items.js](src/data/items.js), [src/scenes/BootScene.js](src/scenes/BootScene.js), [src/scenes/ShopScene.js](src/scenes/ShopScene.js), [src/scenes/BlacksmithScene.js](src/scenes/BlacksmithScene.js), [src/scenes/UpgradeScene.js](src/scenes/UpgradeScene.js), [src/scenes/EventScene.js](src/scenes/EventScene.js), [src/ui/SceneUi.js](src/ui/SceneUi.js), [spritework.md](spritework.md): Wires the new unique item texture keys into preload, hover animation registration, shared vendor/item icon rendering, and sprite documentation.

---

## Version 3.1.51 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Wire approved wind and ice unique item icons

### Changed
- **Unique Warrior item art:** `Storm Guard`, `Wind Band`, `Frostbite`, and `Glacier Plate` now use their own approved Vince-side item icons instead of falling back to the generic legendary sword, armor, and ring art.
- **Inventory and equipment visuals:** The approved wind and ice unique weapon, armor, and accessory art now appears in the correct Diablo-style inventory slots because those items resolve to their own dedicated texture keys.
- **Loot hover coverage:** The same four approved unique icons now use dedicated pulsing golden hover sheets in the loot scene, and they automatically participate in the inventory's unique-only golden hover path.

### Technical
- [assets/items/storm-guard.png](assets/items/storm-guard.png), [assets/items/wind-band.png](assets/items/wind-band.png), [assets/items/frostbite.png](assets/items/frostbite.png), [assets/items/glacier-plate.png](assets/items/glacier-plate.png): Adds cleaned approved unique Warrior item icons.
- [assets/items/storm-guard-hover-pulse_256x256_sheet.png](assets/items/storm-guard-hover-pulse_256x256_sheet.png), [assets/items/wind-band-hover-pulse_256x256_sheet.png](assets/items/wind-band-hover-pulse_256x256_sheet.png), [assets/items/frostbite-hover-pulse_256x256_sheet.png](assets/items/frostbite-hover-pulse_256x256_sheet.png), [assets/items/glacier-plate-hover-pulse_256x256_sheet.png](assets/items/glacier-plate-hover-pulse_256x256_sheet.png): Adds dedicated hover pulse sheets for the newly approved wind and ice unique Warrior items.
- [src/data/items.js](src/data/items.js), [src/scenes/BootScene.js](src/scenes/BootScene.js), [spritework.md](spritework.md): Wires the new unique item texture keys into data, preload, hover animation registration, and sprite documentation.

---

## Version 3.1.50 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Wire approved fire and wind unique item icons

### Changed
- **Unique Warrior item art:** `Ember Cleaver`, `Inferno Plate`, `Flame Pendant`, and `Gale Edge` now use their own approved Vince-side item icons instead of falling back to the generic legendary sword, armor, and amulet art.
- **Inventory slot visuals:** The approved unique weapon, armor, and accessory art now appears in the correct Diablo-style inventory equip slots because those items resolve to their own dedicated texture keys.
- **Inventory unique hover:** The overworld inventory scene now automatically applies the golden hover animation to unique items only by deriving the hover sheet and animation keys from the item's `assetKey`.
- **Loot hover coverage:** The same four approved unique icons now use dedicated pulsing golden hover sheets in the loot scene.

### Technical
- [assets/items/ember-cleaver.png](assets/items/ember-cleaver.png), [assets/items/inferno-plate.png](assets/items/inferno-plate.png), [assets/items/flame-pendant.png](assets/items/flame-pendant.png), [assets/items/gale-edge.png](assets/items/gale-edge.png): Adds cleaned approved unique Warrior item icons.
- [assets/items/ember-cleaver-hover-pulse_256x256_sheet.png](assets/items/ember-cleaver-hover-pulse_256x256_sheet.png), [assets/items/inferno-plate-hover-pulse_256x256_sheet.png](assets/items/inferno-plate-hover-pulse_256x256_sheet.png), [assets/items/flame-pendant-hover-pulse_256x256_sheet.png](assets/items/flame-pendant-hover-pulse_256x256_sheet.png), [assets/items/gale-edge-hover-pulse_256x256_sheet.png](assets/items/gale-edge-hover-pulse_256x256_sheet.png): Adds dedicated hover pulse sheets for the newly approved unique Warrior items.
- [src/data/items.js](src/data/items.js), [src/scenes/BootScene.js](src/scenes/BootScene.js), [src/scenes/InventoryOverworldScene.js](src/scenes/InventoryOverworldScene.js), [spritework.md](spritework.md): Wires the new unique item texture keys into data, preload, hover animation registration, inventory hover behavior, and sprite documentation.

---

## Version 3.1.49 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Add dual accessory inventory layout

### Added
- **Dual accessory equipment:** Vince now supports equipping two accessory items at the same time instead of a single accessory slot.

### Changed
- **Inventory presentation:** The overworld inventory now uses a Diablo-style paper-doll layout with dedicated `Weapon`, `Armor`, `Accessory`, and `Accessory` equip slots plus a general item grid, and equipped gear no longer appears in the bag grid while it is worn.
- **Set bonus logic:** Full-set idle visuals and unique set bonuses now trigger when weapon and armor match either equipped accessory instead of requiring one specific accessory field.
- **Save migration:** Older saves with a single accessory field now migrate into the new two-slot accessory structure automatically.
- **Legendary item art:** `Cursed Demon Blade`, `Shadow Veil`, and `Phantom Cloak` now point at their own approved Vince-side item icons instead of borrowing the generic legendary sword, armor, and amulet art.
- **Loot hover coverage:** The new `Cursed Demon Blade`, `Shadow Veil`, and `Phantom Cloak` loot icons now use the same pulsing golden hover treatment as the rest of Vince's lootable item icons.

### Technical
- [src/entities/Hero.js](src/entities/Hero.js): Replaced the single accessory model with helper-backed dual accessory support and updated stat/set calculations to sum both accessories.
- [src/systems/inventory.js](src/systems/inventory.js), [src/systems/saveLoad.js](src/systems/saveLoad.js): Added dual accessory equip/unequip helpers plus legacy save migration into `accessories: [slot1, slot2]`.
- [src/scenes/InventoryOverworldScene.js](src/scenes/InventoryOverworldScene.js), [src/ui/InventoryPanel.js](src/ui/InventoryPanel.js), [src/scenes/CharacterSheetScene.js](src/scenes/CharacterSheetScene.js), [src/scenes/CombatScene.js](src/scenes/CombatScene.js), [src/scenes/ShopScene.js](src/scenes/ShopScene.js), [src/scenes/BlacksmithScene.js](src/scenes/BlacksmithScene.js): Updated inventory- and equipment-facing UI to understand two accessory slots.
- [src/scenes/BootScene.js](src/scenes/BootScene.js): Preloads the new inventory layout frame art used by the overworld inventory scene.
- [assets/items/cursed-demon-blade.png](assets/items/cursed-demon-blade.png), [assets/items/shadow-veil.png](assets/items/shadow-veil.png), [assets/items/phantom-cloak.png](assets/items/phantom-cloak.png), [src/data/items.js](src/data/items.js), [src/scenes/BootScene.js](src/scenes/BootScene.js): Adds the first batch of approved bespoke Warrior legendary item icons and wires their asset keys.
- [assets/items/cursed-demon-blade-hover-pulse_256x256_sheet.png](assets/items/cursed-demon-blade-hover-pulse_256x256_sheet.png), [assets/items/shadow-veil-hover-pulse_256x256_sheet.png](assets/items/shadow-veil-hover-pulse_256x256_sheet.png), [assets/items/phantom-cloak-hover-pulse_256x256_sheet.png](assets/items/phantom-cloak-hover-pulse_256x256_sheet.png), [src/scenes/BootScene.js](src/scenes/BootScene.js): Adds and registers loot-scene golden hover pulse sheets for the first batch of bespoke Warrior legendary item icons.

---

## Version 3.1.43 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Restore town label and enlarge level 6

### Changed
- **Town label:** Moved the `Visit Town` label back into the visible canvas area under the town icon.
- **Overworld node emphasis:** Increased `Level 6` again so it now matches the larger `Level 5` presentation, and moved both `Level 5` and `Level 6` labels closer under their sprites.

### Technical
- [src/scenes/OverworldScene.js](src/scenes/OverworldScene.js): Repositions the town label, increases the `level6` size override, and tightens the `level5`/`level6` label offsets.

---

## Version 3.1.46 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Add material icons and loot hover glow

### Added
- **Crafting material art:** Added dedicated pixel-art icons for `Fire Stone`, `Wind Stone`, `Ice Stone`, `Lightning Stone`, and `Water Stone`.

### Changed
- **Loot hover feedback:** Material drops now use the same pulsing golden hover glow style as the other item icons when shown in the loot scene.

### Technical
- [src/data/items.js](src/data/items.js): Adds `assetKey` values for all five material items so UI scenes can render their icons.
- [src/scenes/BootScene.js](src/scenes/BootScene.js): Preloads the new material icons and hover sheets, then registers their hover animations.
- [spritework.md](spritework.md): Documents the new material icon assets and hover sheet keys.

---

## Version 3.1.47 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Strengthen material gold hover sheets

### Fixed
- **Material hover visuals:** Rebuilt all five material hover spritesheets so the gold glow is clearly visible instead of reading like a dark outline.

### Technical
- [assets/items](assets/items): Replaced the generated hover pulse sheets for `fire-stone`, `wind-stone`, `ice-stone`, `lightning-stone`, and `water-stone` while keeping the base item icons unchanged.

---

## Version 3.1.48 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Match material hover sheets to Vince reference

### Fixed
- **Material hover pulse style:** Rebuilt all five material hover sheets so they match the existing Vince item-hover workflow instead of baking a constant gold outline onto the item art.

### Technical
- [assets/items](assets/items): Replaced the material hover pulse strips using the same outside-glow pulse behavior as `common-armor-hover-pulse_256x256_sheet.png`.
- [vince-pixel-art-specialist](C:/Users/paulf/.cursor/agents/vince-pixel-art-specialist.md): Documents the approved Vince hover-sheet workflow and reference-check expectations.

---

## Version 3.1.45 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Match town hover scaling with map nodes

### Changed
- **Town hover feedback:** The town icon now grows slightly on hover just like the other overworld destination icons.

### Technical
- [src/scenes/OverworldScene.js](src/scenes/OverworldScene.js): Adds hover resize handlers to the town map button hit area.

---

## Version 3.1.44 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Restore overworld background and tighten level labels

### Changed
- **Overworld background:** Wired the static `overworld.png` artwork back into the world map so the scene no longer renders on a plain dark backdrop.
- **Level text placement:** Moved the `Level 5` and `Level 6` labels closer under their sprites to better match their larger node sizes.

### Technical
- [src/scenes/BootScene.js](src/scenes/BootScene.js): Preloads the `overworld-ui-background` texture.
- [src/scenes/OverworldScene.js](src/scenes/OverworldScene.js): Renders the static overworld background image and tightens the label offsets for `level5` and `level6`.
- [spritework.md](spritework.md): Documents the wired static overworld background.

---

## Version 3.1.42 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Enlarge level 5 more and tighten utility rows

### Changed
- **Overworld node emphasis:** Increased `Level 5` to a larger `3x` presentation and boosted `Level 6` again so it reads more strongly than the standard `1.5x` nodes.
- **Level text placement:** Moved the `Level 5` and `Level 6` labels closer under their sprites.
- **Utility icon spacing:** Tightened the shared top-right and bottom-right utility icon spacing a little further.

### Technical
- [src/scenes/OverworldScene.js](src/scenes/OverworldScene.js): Adds per-level size overrides for `level5`, `level6`, and `level10`, custom label offsets for levels 5 and 6, and a tighter shared UI icon spacing value.

---

## Version 3.1.41 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Enlarge level 5 and 6, tighten UI spacing

### Changed
- **Overworld node emphasis:** Increased `Level 5` and `Level 6` to the same larger `2x` node size as town and castle.
- **Utility icon spacing:** Tightened the top-right and bottom-right utility icon rows and made them use the same shared spacing value so both groups line up more evenly.

### Technical
- [src/scenes/OverworldScene.js](src/scenes/OverworldScene.js): Treats `level5`, `level6`, and `level10` as the larger node class and standardizes both utility icon rows on one spacing constant.

---

## Version 3.1.40 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Enlarge overworld nodes and normalize top-right icon

### Changed
- **Overworld node scale:** Increased all regular level icons to a uniform `1.5x` size and increased both town and castle to a matching larger `2x` size so they stand out as major destinations.
- **Top-right icon sizing:** Reduced `Abandon Run` to the same size as `Settings` and `Save Game`.

### Technical
- [src/scenes/OverworldScene.js](src/scenes/OverworldScene.js): Enlarges Act 1 level nodes, gives castle and town matching larger display sizes, adjusts node label spacing for the new sizes, and normalizes the `Abandon Run` icon size.

---

## Version 3.1.39 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Tidy overworld icon spacing

### Changed
- **Overworld layout:** Grouped `Settings`, `Save Game`, and `Abandon Run` into an evenly spaced top-right icon row, moved `Inventory` and `Character Sheet` into an evenly spaced bottom-right icon row, and re-centered the Act 1 level/castle icons into a cleaner two-row middle layout while keeping town bottom-left.

### Technical
- [src/scenes/OverworldScene.js](src/scenes/OverworldScene.js): Replaced the previous path-position coordinates with a centered Act 1 grid layout and standardized the top-right and bottom-right overworld utility icon spacing.

---

## Version 3.1.38 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Restore plain overworld background and icon controls

### Changed
- **Overworld controls:** Replaced the `Settings`, `Save Game`, `Abandon Run`, `Inventory`, and `Character Sheet` rectangle buttons with dedicated sprite icons that show the same label text as hover tooltips.
- **Overworld background:** Removed the animated overworld background from the live scene and restored the original plain project background while keeping the current town and level icon positions intact.

### Added
- **Overworld UI icon art:** Added new small pixel-art control icons for settings, save game, abandon run, inventory, and character sheet.

### Technical
- [assets/ui/settings-icon.png](assets/ui/settings-icon.png), [assets/ui/save-game-icon.png](assets/ui/save-game-icon.png), [assets/ui/abandon-run-icon.png](assets/ui/abandon-run-icon.png), [assets/ui/inventory-icon.png](assets/ui/inventory-icon.png), [assets/ui/character-sheet-icon.png](assets/ui/character-sheet-icon.png): Added overworld utility-control icons with transparent backgrounds.
- [src/scenes/BootScene.js](src/scenes/BootScene.js): Preloads the new overworld UI icon textures and removes the live overworld background-sheet preload/animation registration.
- [src/scenes/OverworldScene.js](src/scenes/OverworldScene.js): Removes the animated background layer and swaps the remaining utility buttons for icon-based controls with hover tooltips.
- [spritework.md](spritework.md): Documents the new overworld UI icons and the current non-wired status of the animated overworld background sheet.

---

## Version 3.1.37 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Move overworld nodes onto path

### Changed
- **Overworld map layout:** Repositioned the Act 1 level and castle icons to follow the dirt-path flow more closely, and moved the town icon further to the far left side of the map.

### Technical
- [src/scenes/OverworldScene.js](src/scenes/OverworldScene.js): Added a fixed Act 1 node-position map for the overworld path layout while keeping the previous grid as a fallback for destinations without custom coordinates.

---

## Version 3.1.36 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Add animated overworld map background

### Changed
- **Overworld presentation:** The overworld now uses the animated `overworldmap_background_sheet` as a looping background, with the town, level, and castle icons placed on top as the primary clickable map nodes instead of the old button-like level cards.

### Technical
- [assets/overworld/overworldmap_background_sheet.png](assets/overworld/overworldmap_background_sheet.png): Added as the animated overworld background sheet.
- [src/scenes/BootScene.js](src/scenes/BootScene.js): Preloads the overworld background spritesheet and registers the looping `overworldmap_background` animation.
- [src/scenes/OverworldScene.js](src/scenes/OverworldScene.js): Plays the animated background behind the map and uses icon-first clickable level nodes with fallback rectangle nodes when an icon texture is missing.
- [spritework.md](spritework.md): Documents the overworld background sheet and current map-scene layering behavior.

---

## Version 3.1.35 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Wire overworld icons and clean level backgrounds

### Changed
- **Overworld map presentation:** Town and the Act 1 destination nodes now use the new overworld icon art instead of only rectangle placeholders, while destinations without icon art still fall back safely to the old node style.

### Fixed
- **Level 4-6 overworld art:** Reprocessed the `level4`, `level5`, and `level6` overworld icons to remove the unwanted green background.

### Technical
- [assets/overworld/level4-overworld.png](assets/overworld/level4-overworld.png), [assets/overworld/level5-overworld.png](assets/overworld/level5-overworld.png), [assets/overworld/level6-overworld.png](assets/overworld/level6-overworld.png): Re-ran background cleanup on the affected overworld icons.
- [src/scenes/BootScene.js](src/scenes/BootScene.js): Preloads the overworld icon texture keys for town, levels 1-9, and the castle.
- [src/scenes/OverworldScene.js](src/scenes/OverworldScene.js): Uses the preloaded overworld icons for town and Act 1 map nodes, with rectangle-node fallback when no matching icon exists.
- [spritework.md](spritework.md): Updates the overworld icon entries to reflect the live texture keys and current map-scene usage.

---

## Version 3.1.34 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Add overworld location icon set

### Added
- **Overworld location art:** Added a full set of transparent pixel-art overworld icons for the town, nine level destinations, and the final castle based on the provided visual brief.

### Technical
- [assets/overworld/town-overworld.png](assets/overworld/town-overworld.png), [assets/overworld/level1-overworld.png](assets/overworld/level1-overworld.png), [assets/overworld/level2-overworld.png](assets/overworld/level2-overworld.png), [assets/overworld/level3-overworld.png](assets/overworld/level3-overworld.png), [assets/overworld/level4-overworld.png](assets/overworld/level4-overworld.png), [assets/overworld/level5-overworld.png](assets/overworld/level5-overworld.png), [assets/overworld/level6-overworld.png](assets/overworld/level6-overworld.png), [assets/overworld/level7-overworld.png](assets/overworld/level7-overworld.png), [assets/overworld/level8-overworld.png](assets/overworld/level8-overworld.png), [assets/overworld/level9-overworld.png](assets/overworld/level9-overworld.png), [assets/overworld/castle-overworld.png](assets/overworld/castle-overworld.png): Added cleaned transparent map-icon assets for the current overworld destinations.
- [spritework.md](spritework.md): Documents the new overworld icon asset paths and notes that they are not yet wired into the map scene.

---

## Version 3.1.33 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Separate Isabella items and add hover sheets

### Changed
- **Sorceress item wiring:** Isabella/Sorceress gear no longer borrows the newly added Vince-side shared item icons, so those items stay unwired until dedicated Sorceress art is added.
- **Rare sword icon:** Regenerated the `rare-sword` item art so it now reads clearly as a steel sword.

### Added
- **New item hover sheets:** Added pulsing golden hover-outline spritesheets for every newly created common, rare, and legendary Vince-side item icon family.

### Technical
- [src/data/items.js](src/data/items.js): Removed `assetKey` wiring from Sorceress weapons, armor, accessories, and unique sets.
- [assets/items/rare-sword.png](assets/items/rare-sword.png): Replaced the previous ambiguous icon with a proper steel sword.
- [assets/items/common-armor-hover-pulse_256x256_sheet.png](assets/items/common-armor-hover-pulse_256x256_sheet.png), [assets/items/common-ring-hover-pulse_256x256_sheet.png](assets/items/common-ring-hover-pulse_256x256_sheet.png), [assets/items/common-amulet-hover-pulse_256x256_sheet.png](assets/items/common-amulet-hover-pulse_256x256_sheet.png), [assets/items/rare-sword-hover-pulse_256x256_sheet.png](assets/items/rare-sword-hover-pulse_256x256_sheet.png), [assets/items/rare-armor-hover-pulse_256x256_sheet.png](assets/items/rare-armor-hover-pulse_256x256_sheet.png), [assets/items/rare-ring-hover-pulse_256x256_sheet.png](assets/items/rare-ring-hover-pulse_256x256_sheet.png), [assets/items/rare-amulet-hover-pulse_256x256_sheet.png](assets/items/rare-amulet-hover-pulse_256x256_sheet.png), [assets/items/legendary-sword-hover-pulse_256x256_sheet.png](assets/items/legendary-sword-hover-pulse_256x256_sheet.png), [assets/items/legendary-armor-hover-pulse_256x256_sheet.png](assets/items/legendary-armor-hover-pulse_256x256_sheet.png), [assets/items/legendary-ring-hover-pulse_256x256_sheet.png](assets/items/legendary-ring-hover-pulse_256x256_sheet.png), [assets/items/legendary-amulet-hover-pulse_256x256_sheet.png](assets/items/legendary-amulet-hover-pulse_256x256_sheet.png): Added pulsing hover-outline sheets for the newly created Vince-side item icons.
- [src/scenes/BootScene.js](src/scenes/BootScene.js): Preloads and registers the new hover-sheet texture keys and animations.
- [spritework.md](spritework.md): Documents the corrected rare sword art, the new hover sheets, and the intentional Sorceress item-icon separation.

---

## Version 3.1.32 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Fill missing item icon families

### Added
- **Item icon coverage:** Added the missing common, rare, and legendary item icon families so the remaining shared gear and unique-item `assetKey` groups now have sprite coverage.

### Technical
- [assets/items/common-armor.png](assets/items/common-armor.png), [assets/items/common-ring.png](assets/items/common-ring.png), [assets/items/common-amulet.png](assets/items/common-amulet.png), [assets/items/rare-sword.png](assets/items/rare-sword.png), [assets/items/rare-armor.png](assets/items/rare-armor.png), [assets/items/rare-ring.png](assets/items/rare-ring.png), [assets/items/rare-amulet.png](assets/items/rare-amulet.png), [assets/items/legendary-sword.png](assets/items/legendary-sword.png), [assets/items/legendary-armor.png](assets/items/legendary-armor.png), [assets/items/legendary-ring.png](assets/items/legendary-ring.png), [assets/items/legendary-amulet.png](assets/items/legendary-amulet.png): Added finalized pixel-art item icons for every previously missing shared item asset family.
- [BootScene.js](src/scenes/BootScene.js): Preloads the newly added item icon texture keys so existing item data can render them in UI scenes.
- [spritework.md](spritework.md): Documents the new item icon asset paths and texture keys.

---

## Version 3.1.27 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Add Rusty Sword hover outline

### Added
- **Rusty Sword hover animation:** The Rusty Sword loot icon now plays a bright animated golden outline while the player hovers over it.

### Technical
- [assets/items/common-sword-hover_256x256_sheet.png](assets/items/common-sword-hover_256x256_sheet.png): Added a four-frame hover-outline spritesheet generated from the Rusty Sword icon.
- [BootScene.js](src/scenes/BootScene.js): Preloads the hover sheet and registers the `common-sword-hover` animation.
- [SceneUi.js](src/ui/SceneUi.js): Added a reusable helper for swapping a sprite to a hover animation and back to its base texture.
- [LootScene.js](src/scenes/LootScene.js): Uses a sprite-based item icon so the Rusty Sword hover animation can play on the loot screen.

---

## Version 3.1.31 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Try 20-frame Rusty Sword pulse in game

### Changed
- **Rusty Sword hover test:** The live Rusty Sword hover animation now uses the pulse proof sheet in-game so the slower 20-frame golden outline can be evaluated directly on the loot screen.

### Technical
- [assets/items/common-sword-hover-pulse_256x256_sheet.png](assets/items/common-sword-hover-pulse_256x256_sheet.png): Regenerated the Rusty Sword pulse proof as a 20-frame sheet for a slower cycle.
- [BootScene.js](src/scenes/BootScene.js): Points the `common-sword-hover-sheet` preload to the pulse test asset and registers the Rusty Sword hover as a full-cycle animation.
- [spritework.md](spritework.md): Updated the Rusty Sword hover entries to reflect the active pulse test and legacy/proof variants.

---

## Version 3.1.30 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Add pulsing Rusty Sword hover proof

### Added
- **Rusty Sword hover pulse proof of concept:** Added a separate non-wired hover spritesheet where the golden outline pulses on and off instead of traveling around the sword.

### Technical
- [assets/items/common-sword-hover-pulse_256x256_sheet.png](assets/items/common-sword-hover-pulse_256x256_sheet.png): Added an 8-frame Rusty Sword hover proof-of-concept sheet for pulse-based visual review.
- [spritework.md](spritework.md): Documented the pulsing-hover proof asset and how it differs from the traveling version.

---

## Version 3.1.29 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Add traveling Rusty Sword hover proof

### Added
- **Rusty Sword hover proof of concept:** Added a separate non-wired hover spritesheet where the brightest golden glow travels quickly around the sword outline instead of only pulsing.

### Technical
- [assets/items/common-sword-hover-travel_256x256_sheet.png](assets/items/common-sword-hover-travel_256x256_sheet.png): Added a 12-frame Rusty Sword hover proof-of-concept sheet for visual review before game integration.
- [spritework.md](spritework.md): Documented the traveling-hover proof asset and its intent.

---

## Version 3.1.28 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Add potion hover outlines

### Added
- **Potion hover animations:** Health, Mana, and Avoid Death potion loot icons now use the same animated golden hover-outline treatment as the Rusty Sword.

### Changed
- **Reusable icon hover wiring:** Hover-outline animation hookup now follows the base texture naming convention, so icon assets can opt into the same effect without custom per-item logic.

### Technical
- [assets/items/health-potion-hover_256x256_sheet.png](assets/items/health-potion-hover_256x256_sheet.png), [assets/items/mana-potion-hover_256x256_sheet.png](assets/items/mana-potion-hover_256x256_sheet.png), [assets/items/avoid-death-potion-hover_256x256_sheet.png](assets/items/avoid-death-potion-hover_256x256_sheet.png): Added matching four-frame golden hover-outline spritesheets for potion icons.
- [BootScene.js](src/scenes/BootScene.js): Preloads the potion hover sheets and registers their hover animations.
- [SceneUi.js](src/ui/SceneUi.js): Derives hover sheet and animation keys from the base texture key when available.
- [spritework.md](spritework.md): Documents the potion hover-outline assets and shared hover pattern.

---

## Version 3.1.26 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Refresh Rusty Sword icon cleanup

### Changed
- **Rusty Sword icon:** Regenerated the `common-sword` asset with a cleaner pixel-art source and re-verified it on the loot screen for centered, readable display.

### Technical
- [assets/items/common-sword.png](assets/items/common-sword.png): Replaced the previous Rusty Sword icon with a cleaner finalized PNG.

---

## Version 3.1.25 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Add Rusty Sword item icon

### Added
- **Rusty Sword icon:** The `Rusty Sword` now has a dedicated pixel-art item icon generated through the `pixel-art-generator` workflow and cleaned for transparent UI display.

### Technical
- [assets/items/common-sword.png](assets/items/common-sword.png): Added the finalized `common-sword` item icon.
- [BootScene.js](src/scenes/BootScene.js): Preloads the `common-sword` texture key.
- [spritework.md](spritework.md): Documents the Rusty Sword icon asset path and texture key.

---

## Version 3.1.24 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Clean potion icon backgrounds

### Fixed
- **Potion icon backgrounds:** Generated potion item icons now sit on a transparent canvas with tighter icon framing instead of showing baked checkerboard or matte backgrounds in loot-style UI.

### Technical
- [assets/items/health-potion.png](assets/items/health-potion.png), [assets/items/mana-potion.png](assets/items/mana-potion.png), [assets/items/avoid-death-potion.png](assets/items/avoid-death-potion.png): Cleaned or regenerated baked background artifacts and repacked the icons for UI display.

---

## Version 3.1.23 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Add animation-speed setting

### Added
- **Animation speed setting:** Settings now includes an `Animations` row with the same minus/plus control style as Music and SFX, letting players switch between `100%`, `150%`, and `200%` speed.

### Changed
- **Faster gameplay option:** Sprite playback, combat pacing delays, and scene tweens now respect the saved animation-speed setting so the whole game feels snappier when increased.

### Technical
- [audio.js](src/systems/audio.js): Added persisted animation-speed helpers plus a shared scene-application utility.
- [SettingsScene.js](src/scenes/SettingsScene.js): Added the new settings row and live update handling.
- [BootScene.js](src/scenes/BootScene.js), [MenuScene.js](src/scenes/MenuScene.js), [OverworldScene.js](src/scenes/OverworldScene.js), [CombatScene.js](src/scenes/CombatScene.js): Apply the saved animation-speed setting to global animation playback and scene timing.

---

## Version 3.1.22 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Add health and mana potion pixel-art icons

### Added
- **Potion icons:** Health and Mana Potions now have dedicated pixel-art item icons sized for Vince's smaller UI asset tier so they read cleanly in loot and other inventory-style screens.

### Technical
- [BootScene.js](src/scenes/BootScene.js): Preloads the new `health-potion` and `mana-potion` item textures.
- [spritework.md](spritework.md): Documents the new potion item icon asset paths and texture keys.

---

## Version 3.1.21 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Reaper drops Avoid Death Potion

### Added
- **Avoid Death Potion:** Reaper fights now reward a new `Avoid Death Potion` that grants invulnerability for `3` turns.
- **Potion art:** The `Avoid Death Potion` now has its own dedicated icon and shows that sprite on the loot screen when it drops.

### Technical
- [items.js](src/data/items.js): Added the new potion definition and UI effect text.
- [inventory.js](src/systems/inventory.js): Potion use now supports the invulnerability effect.
- [combat.js](src/systems/combat.js), [CombatScene.js](src/scenes/CombatScene.js): Enemy attacks now respect temporary invulnerability, show the status in combat, and count it down by turn.
- [saveLoad.js](src/systems/saveLoad.js): Added `invulnerableRounds` to saved hero state.
- [BootScene.js](src/scenes/BootScene.js), [LootScene.js](src/scenes/LootScene.js): Preload and display the new potion icon.

---

## Version 3.1.20 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Restrict random Reaper and delay day-10 popup until healed

### Changed
- **Random Reaper ambush:** Revisiting an old completed level can now only roll the random Reaper at the very start of the level, not in the middle of later fights.
- **Day-10 Reaper timing:** The day-10 Reaper popup now waits until Vince is fully restored on the world map, so you can heal first and then face or pay off the Reaper before entering the next level.

### Technical
- [CombatScene.js](src/scenes/CombatScene.js): Random Reaper ambushes now require `currentFightIndex === 0`.
- [OverworldScene.js](src/scenes/OverworldScene.js): Added a “fully restored” gate for the day-10 Reaper popup and level-entry interception.

---

## Version 3.1.19 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Align unique upgrade text with actual effects

### Changed
- **Unique weapon upgrades:** Upgraded unique weapons now grant `+10% Damage` instead of showing or behaving like a strength/intelligence bonus.
- **Unique armor/accessory upgrades:** The Upgrade Unique screen now lists the actual stats each item upgrade improves, and unique armor stat bonuses now apply correctly in hero calculations so the tooltip matches real gameplay.

### Technical
- [items.js](src/data/items.js): Replaced element-based upgrade text with item-based unique upgrade multipliers and summary helpers.
- [Hero.js](src/entities/Hero.js): Added item-based upgrade multiplier handling, armor stat contribution for strength/intelligence/health/mana, and weapon damage multiplier support.
- [combat.js](src/systems/combat.js), [CombatScene.js](src/scenes/CombatScene.js): Applied unique weapon damage upgrades to outgoing combat damage, including Flame Aura ticks.
- [UpgradeScene.js](src/scenes/UpgradeScene.js): Upgrade rows now display and store the new item-specific upgrade effects.

---

## Version 3.1.18 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Keep enemy formation on-screen

### Changed
- **Combat spacing:** Enemy groups now spawn closer to Vince and automatically tighten their spacing when needed so large groups stay inside the combat screen instead of drifting off the right edge.

### Technical
- [CombatScene.js](src/scenes/CombatScene.js): Replaced the fixed enemy `startX`/`step` layout with a bounded formation helper that shifts multi-enemy packs left and compresses them to fit the viewport.

---

## Version 3.1.17 – 2026-03-07

**Date:** 2026-03-07  
**Timestamp:** Enforce run point budget in unlock selection

### Changed
- **Unlock costs:** All run unlocks now cost `50 RP`, including `Lucky`.
- **Unlock selection budget:** The unlock picker now enforces the current Total Run Points as a real budget for the run, so a `70 RP` total can no longer keep or select two `50 RP` unlocks at once.

### Technical
- [unlocks.js](src/data/unlocks.js): Added run-selection sanitizing against the RP budget and normalized unlock costs to `50`.
- [UnlockSelectScene.js](src/scenes/UnlockSelectScene.js): Removed free owned-unlock toggling and now treats unlock choice as a budget-limited run selection with cost shown on every button.

---

## Version 3.1.16 – 2026-03-06

**Date:** 2026-03-06  
**Timestamp:** Bat idle and attack sprites

### Changed
- **Bat animation:** Bats now use `bat_idle_512x512_sheet` for idle and `bat_attack_512x512_sheet` for their attack animation in combat.

### Technical
- [BootScene.js](src/scenes/BootScene.js): Preload and register `bat_idle_sheet` / `bat_attack_sheet`.
- [CombatScene.js](src/scenes/CombatScene.js): Bat enemies now render with their idle sprite and switch to the attack sprite during enemy turns before returning to idle.
- [spritework.md](spritework.md): Added the bat idle and attack assets to the animation reference.

---

## Version 3.1.15 – 2026-03-06

**Date:** 2026-03-06  
**Timestamp:** Temporary vampire boss placeholder

### Changed
- **Boss placeholder art:** Standard level bosses now use `vampire_idle_512x512_sheet` for idle, `vampire_attack_512x512_sheet` for attacks, and are named `Vampire` in combat as a temporary placeholder.

### Technical
- [BootScene.js](src/scenes/BootScene.js): Preload and register `vampire_idle_sheet` / `vampire_attack_sheet` animations for boss combat.
- [levels.js](src/data/levels.js): Standard bosses now use the temporary name `Vampire`.
- [CombatScene.js](src/scenes/CombatScene.js): Standard bosses render with vampire idle/attack sprites while the special Reaper encounter keeps its existing behavior.
- [spritework.md](spritework.md): Documented the temporary vampire boss placeholder assets.

---

## Version 3.1.14 – 2026-03-06

**Date:** 2026-03-06  
**Timestamp:** Ice set idle for Vince

### Changed
- **Ice set idle:** Vince now uses `ice_set_idle_512x512_sheet` for combat idle whenever the full Ice unique set is equipped.

### Technical
- [BootScene.js](src/scenes/BootScene.js): Preload and register `hero_ice_set_idle_sheet` / `hero_ice_set_idle`.
- [CombatScene.js](src/scenes/CombatScene.js): Full-set idle selection now supports Fire, Ice, Lightning, Water, and Wind unique sets for Vince.
- [spritework.md](spritework.md): Added the ice set idle asset to the hero animation reference.

---

## Version 3.1.13 – 2026-03-06

**Date:** 2026-03-06  
**Timestamp:** Loop all Vince set idle animations

### Changed
- **Set idle looping:** Vince's Fire, Lightning, Water, and Wind set idle animations now restart the same way as the default idle, so they keep looping whenever Vince is idle and still give way to skill animations while they play.

### Technical
- [CombatScene.js](src/scenes/CombatScene.js): Generalized hero idle animation detection so all `hero_*_set_idle` animations return through `playCurrentHeroIdle()` on animation completion.

---

## Version 3.1.12 – 2026-03-06

**Date:** 2026-03-06  
**Timestamp:** Water set idle for Vince

### Changed
- **Water set idle:** Vince now uses `water_set_idle_512x512_sheet` for combat idle whenever the full Water unique set is equipped.

### Technical
- [BootScene.js](src/scenes/BootScene.js): Preload and register `hero_water_set_idle_sheet` / `hero_water_set_idle`.
- [CombatScene.js](src/scenes/CombatScene.js): Full-set idle selection now supports Fire, Lightning, Water, and Wind unique sets for Vince.
- [spritework.md](spritework.md): Added the water set idle asset to the hero animation reference.

---

## Version 3.1.11 – 2026-03-06

**Date:** 2026-03-06  
**Timestamp:** Fire set idle for Vince

### Changed
- **Fire set idle:** Vince now uses `fire_set_idle_512x512_sheet` for combat idle whenever the full Fire unique set is equipped.

### Technical
- [BootScene.js](src/scenes/BootScene.js): Preload and register `hero_fire_set_idle_sheet` / `hero_fire_set_idle`.
- [CombatScene.js](src/scenes/CombatScene.js): Full-set idle selection now supports Fire, Lightning, and Wind unique sets for Vince.
- [spritework.md](spritework.md): Added the fire set idle asset to the hero animation reference.

---

## Version 3.1.10 – 2026-03-06

**Date:** 2026-03-06  
**Timestamp:** Wind set idle for Vince

### Changed
- **Wind set idle:** Vince now uses `wind_set_idle_512x512_sheet` for combat idle whenever the full Wind unique set is equipped.

### Technical
- [BootScene.js](src/scenes/BootScene.js): Preload and register `hero_wind_set_idle_sheet` / `hero_wind_set_idle`.
- [CombatScene.js](src/scenes/CombatScene.js): Full-set idle selection now supports both Lightning and Wind unique sets for Vince.
- [spritework.md](spritework.md): Added the wind set idle asset to the hero animation reference.

---

## Version 3.1.9 – 2026-03-06

**Date:** 2026-03-06  
**Timestamp:** Lightning set idle for Vince

### Changed
- **Lightning set idle:** Vince now uses `lightning_set_idle_512x512_sheet` for combat idle whenever the full Lightning unique set is equipped.

### Technical
- [BootScene.js](src/scenes/BootScene.js): Preload and register `hero_lightning_set_idle_sheet` / `hero_lightning_set_idle`.
- [CombatScene.js](src/scenes/CombatScene.js): Hero idle selection now swaps to the lightning-set idle for Vince when weapon, armor, and accessory are all the Lightning unique set, and updates again after hero actions or equipment changes.
- [spritework.md](spritework.md): Added the lightning set idle asset to the hero animation reference.

---

## Version 3.1.8 – 2026-03-06

**Date:** 2026-03-06  
**Timestamp:** Skeleton idle and attack spritesheet hookup

### Changed
- **Skeleton animation:** Skeleton enemies now use `skeleton_idle_512x512_sheet` for idle and `skeletonattack_512x512_sheet` for their attack animation in combat.

### Technical
- [BootScene.js](src/scenes/BootScene.js): Preload and register `skeleton_attack_sheet` / `skeleton_attack`.
- [CombatScene.js](src/scenes/CombatScene.js): Skeleton enemy turns now swap to the attack sheet, play the one-shot animation, then return to idle.

---

## Version 3.1.7 – 2026-03-06

**Date:** 2026-03-06  
**Timestamp:** Save browser playthrough methodology in project guidance

### Changed
- **Project guidance:** `cursor.md` now preserves the browser playthrough testing workflow used for gameplay verification, including server checks, Phaser scene inspection, targeted state setup, UI confirmation, isolated reruns for flaky scenarios, and cleanup of temporary test files.

### Technical
- [cursor.md](cursor.md): Added a reusable browser playthrough methodology note under project learnings.

---

## Version 3.1.6 – 2026-03-06

**Date:** 2026-03-06  
**Timestamp:** Day counter, Reaper fee event, mine unlock and QoL polish

### Added
- **Day system:** Runs now track days, show the current day on the World Map, and trigger a one-time Reaper visit on day 10 when returning to the map.
- **I Love Mining:** New run unlock. Once selected, one mine visit per week is free.

### Changed
- **World Map warning:** Entering a level for the first time while injured now warns the player and offers a rest option using the normal town rest cost.
- **Flee penalty:** Fleeing now costs 50% of current gold and removes 2 random inventory items instead of deleting all gold and breaking one equipped item.
- **Unlock costs:** Discount and Growth Spurt now cost 50 run points, and unlocks show their own RP costs correctly.
- **Combat and shop UI:** Low-mana skills and unaffordable Legendary Merchant purchases are greyed out more clearly. Passive skill buttons now match active skill button color.

### Technical
- [main.js](src/main.js), [saveLoad.js](src/systems/saveLoad.js): Added persistent run day/event/mine state and saved `runUnlocks`.
- [OverworldScene.js](src/scenes/OverworldScene.js), [LootScene.js](src/scenes/LootScene.js), [CombatScene.js](src/scenes/CombatScene.js): Added day progression, day-10 Reaper flow, first-visit low-HP warning, and scripted Reaper encounter support.
- [unlocks.js](src/data/unlocks.js), [UnlockSelectScene.js](src/scenes/UnlockSelectScene.js), [MineScene.js](src/scenes/MineScene.js): Added `iLoveMining`, per-unlock costs, and weekly free mining logic.
- [inventory.js](src/systems/inventory.js), [SkillButtons.js](src/ui/SkillButtons.js), [EventScene.js](src/scenes/EventScene.js), [SkillTreeScene.js](src/scenes/SkillTreeScene.js): Safe slot removal on flee, improved disabled button visuals, merchant affordability refresh, and passive button color alignment.

---

## Version 3.1.5 – 2025-03-06

**Date:** 2025-03-06  
**Timestamp:** Heavy Strike balance, character sheet multipliers and run bonuses

### Changed
- **Heavy Strike:** Mana cost reduced to 3 (was 4). Damage reduced to 1.5× Str (was 1.8× Str).
- **Character sheet:** Skills now show damage multipliers and effect text (e.g. "1.5x Str damage", heals, Def/Evasion, block/reflect). Run unlock bonuses (Lucky, Discount, Growth Spurt) are listed when active for the current run.

### Technical
- [skills.js](src/data/skills.js): `heavyStrike` `manaCost` 3, `damageMultiplier` 1.5.
- [CharacterSheetScene.js](src/scenes/CharacterSheetScene.js): Skill lines include multiplier/effect; "Run bonuses" section from `GAME_STATE.runUnlocks` and `UNLOCKS`.

---

## Version 3.1.3 – 2025-03-06

**Date:** 2025-03-06  
**Timestamp:** Thorncape animation, Iron Evasion & Crystal Fortress, Life Drain tier, evasion cap, enemy scaling, unique buffs

### Added
- **Thorncape animation:** Hero Thorncape (block/reflect) skill uses `thorncape_512x512_sheet.png` in combat. Preload and animation in BootScene; CombatScene plays it when Thorncape is used and returns to idle on complete.
- **Iron Evasion (Warrior):** New level-10 ultimate. 10 mana, +10 Def and 55% Evasion this battle. Cost 3 skill points. Uses `iron_evasion_512x512_sheet.png` animation.
- **Crystal Fortress (Sorceress):** New level-10 ultimate. 15 mana, 60% Evasion and 5 Def this battle. Cost 3 skill points. No dedicated spritesheet yet (to be added later).
- **Evasion cap:** Player evasion is capped at 95%. Combat log shows "Max evasion (95%) reached." when an evasion-granting skill would push total over the cap.

### Changed
- **Thorncape naming:** Skill id and all code references use `thorncape` (was `thornshield`). Skill tree tier 10 and data updated.
- **Life Drain:** Now becomes available at level 5 only. Removed from tier 4 choices; `skillTier` set to 5 in skills.js.
- **Enemy damage scaling:** Goon and boss damage scale more gently so L10/L15/L20 remain beatable. `ENEMY_SCALE_FACTOR` 1.45 → 1.30; `ENEMY_BOSS_PER_LEVEL_DAMAGE_FACTOR` 0.15 → 0.08. Approximate boss damage: L10 ~41 (was 155), L15 ~159 (was 906), L20 ~597 (was 11,798).
- **Unique items and set bonuses:** All 30 uniques and all element set bonuses buffed by +1 per integer stat (strength, intelligence, defense, health, mana) and +0.01 (1%) per evasion. Uniques remain the top tier above legendary.

### Technical
- [spritework.md](spritework.md): Asset table and ways of working updated for Thorncape and Iron Evasion sheets.
- [BootScene.js](src/scenes/BootScene.js): Preload/create for `hero_thorncape_sheet`, `hero_iron_evasion_sheet`; animations `hero_thorncape`, `hero_iron_evasion`.
- [CombatScene.js](src/scenes/CombatScene.js): Combined def+evasion branch for Iron Evasion and Crystal Fortress; Thorncape and Iron Evasion animation triggers and `animationcomplete` reset; evasion-cap log when `getEvasionChance() >= 0.95` after evasion skills.
- [skills.js](src/data/skills.js): `thorncape` (id/name Thorncape), `ironEvasion`, `crystalFortress`; Life Drain `skillTier` 5, removed from tier 4 array; tier 10 arrays include ironEvasion/crystalFortress; cost 3 for new ultimates; file comment allows cost 1/2/3.
- [Hero.js](src/entities/Hero.js): `getEvasionChance()` caps at 0.95 (was 1).
- [config.js](src/config.js): ENEMY_SCALE_FACTOR 1.30, ENEMY_BOSS_PER_LEVEL_DAMAGE_FACTOR 0.08.
- [items.js](src/data/items.js): All unique item stat/evasion values +1 or +0.01; UNIQUE_SET_BONUSES all entries +1 per stat or +0.01 evasion.

---

## Version 3.1.4 – 2025-03-06

**Date:** 2025-03-06  
**Timestamp:** Isabella name, hero guards, CONFIG-only usage, BootScene/CombatScene refactor, createButton

### Changed
- **Hero names:** Sorceress is "Isabella"; Warrior remains "Vince".
- **Scene guards:** Scenes that depend on the hero (Combat, Town, Shop, Blacksmith, Mine, Loot, Character Sheet, Inventory Overworld) now redirect to Menu when `GAME_STATE.hero` is missing.
- **CONFIG only:** Reaper chance and shop/mine/blacksmith values use CONFIG only (no inline fallbacks).

### Technical
- [Hero.js](src/entities/Hero.js): `name: isSorceress ? 'Isabella' : 'Vince'`.
- CombatScene, TownScene, ShopScene, BlacksmithScene, MineScene, LootScene, CharacterSheetScene, InventoryOverworldScene: `if (!GAME_STATE.hero) { this.scene.start('Menu'); return; }` at start of `create()`.
- [CombatScene.js](src/scenes/CombatScene.js): Reaper uses CONFIG.REAPER_BASE_CHANCE and CONFIG.REAPER_PER_LEVEL only; `endPlayerTurn()`, `playHeroAnimThen()`; turn-ending branches use these; `applySingleTargetSkill` ends with `clearTargetMode()` + `endPlayerTurn()`.
- [BootScene.js](src/scenes/BootScene.js): `registerOneShotHeroAnim(sheetKey, animKey, frameRate)` and `oneShotAnims` array for one-shot hero anims; idle created separately.
- [skills.js](src/data/skills.js): `getSkill(hero, skillId)`; [combat.js](src/systems/combat.js) and CombatScene use it.
- [progression.js](src/systems/progression.js), [SkillTreeScene.js](src/scenes/SkillTreeScene.js), [CharacterSheetScene.js](src/scenes/CharacterSheetScene.js), [SkillButtons.js](src/ui/SkillButtons.js), [inventory.js](src/systems/inventory.js), [eventEffects.js](src/systems/eventEffects.js): `getSkillsForClass(hero)` only (no typeof fallback).
- [SceneUi.js](src/ui/SceneUi.js): New `createButton()` helper. [TownScene.js](src/scenes/TownScene.js): All five buttons use `createButton`. ShopScene, MineScene, BlacksmithScene: CONFIG-only usage for reroll cost, pickaxe rent, durability max unique.

---

## Version 3.1.2 – 2025-03-06

**Date:** 2025-03-06  
**Timestamp:** Shop sell filter, Blacksmith craft filter and tooltips

### Added
- **Shop — Sell:** Type filter (All, Weapons, Armor, Accessories, Consumables, Scrolls) so the sell list can be narrowed by item classification. Filter choice is kept when returning to Sell.

### Changed
- **Blacksmith — Craft:** Only recipes you can craft with materials you own are shown. If you have no crafting materials at all, the craft tab shows: "You do not currently own any materials for crafting. Try to visit the mine or find them by defeating monsters."
- **Blacksmith — Craft:** Effect text is shown only in the hover tooltip. The tooltip now includes item classification (Weapon, Armor, or Accessory) plus the effect line and durability. The recipe row shows only item name and cost (350g + 1 material).

### Technical
- [ShopScene.js](src/scenes/ShopScene.js): SHOP_SELL_FILTER_LABELS/VALUES; GAME_STATE.shopSellFilter; filter row and filtered sellable list.
- [BlacksmithScene.js](src/scenes/BlacksmithScene.js): buildCraftContent filters recipes by materialItemIds (materials in inventory); no-materials message when size === 0; tooltip has typeLabel + effect; row has name + cost only (no effect line).

---

## Version 3.1.1 – 2025-03-06

**Date:** 2025-03-06  
**Timestamp:** Reaper appearance chance reduced

### Changed
- **Reaper:** Base chance reduced from 8% to 5%; per-level increase reduced from 4% to 2% per level (on level revisit, non-boss only). e.g. Level 1 revisit = 5%, Level 10 = 23%, Level 20 = 43%.

### Technical
- [config.js](src/config.js): REAPER_BASE_CHANCE 0.05, REAPER_PER_LEVEL 0.02.

---

## Version 3.1.0 – 2025-03-06

**Date:** 2025-03-06  
**Timestamp:** Act 2 (levels 11–20), Mine, Blacksmith crafting, Reaper encounter

### Added
- **Act 2:** After defeating the Castle (level 10) boss, a transition scene plays: "The Demon is Defeated" — the demon's son takes the empire; levels 11–20 unlock. World Map shows Act 2 levels (Level 11 … Level 20 / Demon Empire). Sorceress class unlocks when entering Act 2 if not already unlocked. You cannot return to Act 1 levels.
- **Mine:** Town has "Visit Mine". Rent a pickaxe for 250g to mine one random crafting material (Fire Stone, Wind Stone, Ice Stone, Lightning Stone, Water Stone). Popup shows "You found: [material]!". Back to Town.
- **Crafting:** Blacksmith has "Repair" and "Craft" modes. Craft tab lists unique weapons, armor, and accessories by class (Warrior strength set, Sorceress intelligence set). Each recipe costs 350g + 1 matching material. Materials are obtained from the Mine (or loot). Crafted item is added to inventory.
- **Reaper:** When revisiting a level (re-entering a completed level for another fight, non-boss only), there is a chance the Reaper appears instead of normal goons. Chance scales with level (base + per-level). The Reaper is a tough boss-scale enemy (high HP and damage scaling with hero level). Hero gets "Frightened" for the fight: evasion set to 0, strength halved. Combat status line and log show Frightened. Beating or fleeing clears Frightened and ends the Reaper encounter.

### Changed
- **Level structure:** Game now has 20 levels total: Act 1 levels 1–10 (Castle at 10), Act 2 levels 11–20 (Demon Empire at 20). XP curve and level indices support 1–20. Level 10 boss is "Evil Demon"; level 20 boss is "Demon Emperor".

### Technical
- [TransitionScene.js](src/scenes/TransitionScene.js): Narrative after level 10 victory; sets `GAME_STATE.act = 2`, `unlockedLevels = ['level11']`, unlocks Sorceress; then Overworld.
- [levels.js](src/data/levels.js): `LEVELS_ACT1` (level1–level10), `LEVELS_ACT2` (level11–level20); `createReaper(heroLevel)` for Reaper stats.
- [OverworldScene.js](src/scenes/OverworldScene.js): Uses `LEVELS_ACT2` when `GAME_STATE.act === 2`.
- [LootScene.js](src/scenes/LootScene.js): After winning level 10 boss fight, starts Transition scene instead of overworld.
- [MineScene.js](src/scenes/MineScene.js): Rent pickaxe (CONFIG.MINE_PICKAXE_RENT); random material from MINE_MATERIAL_IDS; popup; Back to Town.
- [TownScene.js](src/scenes/TownScene.js): "Visit Mine" button starts Mine scene.
- [BlacksmithScene.js](src/scenes/BlacksmithScene.js): Repair/Craft tabs; `buildCraftContent`, `getCraftRecipesForClass(hero)`; craft cost 350g + 1 material; recipes from [items.js](src/data/items.js) (CRAFT_RECIPES_STRENGTH / CRAFT_RECIPES_INT).
- [items.js](src/data/items.js): Materials (fire-stone, wind-stone, etc.); unique gear and recipes by class.
- [config.js](src/config.js): CRAFT_COST 350, MINE_PICKAXE_RENT 250, REAPER_BASE_CHANCE 0.08, REAPER_PER_LEVEL 0.04; LOOT_TYPE_WEIGHTS includes material.
- [CombatScene.js](src/scenes/CombatScene.js): Reaper chance on revisit; `reaperFight`, `createReaper(hero.level)`; `showReaperPopup()`; hero.reaperFrightened; status/log show Frightened; clear on win/flee.
- [Hero.js](src/entities/Hero.js): `reaperFrightened` reduces getEffectiveEvasion to 0 and getEffectiveStrength by 50%.
- [main.js](src/main.js): GAME_STATE.act, reaperFight; resetRun() resets act to 1.

---

## Version 3.0.5 – 2025-03-05

**Date:** 2025-03-05  
**Timestamp:** Skill Tree tooltips, level display, passive balance, Skill Tree in Character Sheet

### Added
- **Skill Tree:** Current level is shown in the title (e.g. "Level Up — Level 3" or "Skill Tree — Level 3").
- **Character Sheet:** "Skill Tree" button at the bottom opens the Skill Tree (with `from: 'overworld'` so returning goes back to the map).

### Changed
- **Skill Tree tooltips:** Active and passive tooltips now use a consistent font (14px, Arial) so all tooltip text reads clearly and no longer appears pixelated.
- **Passives at level 2:** Only tier-1 (weak) passives are offered at level 2 (e.g. +1 Str, +2 HP, +2 Mana, +1 Def). Stronger tier-2 passives (+4 HP/Mana, +2 Str/Def) are no longer available at level 2.
- **One passive per stat per level:** For each level, only the strongest passive per stat is offered. Players no longer see both "+2 Max Health" and "+4 Max Health" at the same time; the option shown depends on level.
- **World Map:** Skill Tree button removed to avoid collision with Inventory. Skill Tree is now accessed from the Character Sheet.

### Technical
- [SkillTreeScene.js](src/scenes/SkillTreeScene.js): Title includes " — Level " + hero.level; tooltips use `fontSize: 14`, `fontFamily: 'Arial'`.
- [progression.js](src/systems/progression.js): `getChoicesForLevel()` uses `maxPassiveTier` (1 at level 2) and filters passives to one per effect stat (highest tier in pool).
- [OverworldScene.js](src/scenes/OverworldScene.js): Skill Tree button and label removed; Character Sheet button and text at x 520.
- [CharacterSheetScene.js](src/scenes/CharacterSheetScene.js): "Skill Tree" button added; "Back to Map" shifted to sit beside it.

---

## Version 3.0.4 – 2025-03-05

**Date:** 2025-03-05  
**Timestamp:** Battle UI, balance, game over reset, World Map, events feedback

### Added
- **Combat:** Status effects line under HP/Mana/Level showing active buffs (Def +X, Evasion X%, Flame Aura Xr, Frightened).
- **Combat:** Running combat log (top-right) showing hero skill use and effect (damage, heal, buff) and enemy actions (attacks, damage or Dodged).
- **Skills:** All learned skills now display in a two-row layout (5 per row) so 6+ skills are visible.
- **Game Over:** Run is fully reset (hero, levels, progress cleared); points from the run are added to total points (stored in localStorage for future unlocks). Game Over screen shows "Points this run" and "Total points".
- **World Map:** Title renamed from "Map" to "World Map". "Abandon Run" button tallies current run points into total and resets to Menu.
- **Random events:** Effect/loot/gold from each event is shown in green text (e.g. "You received: +5 Max HP (until next boss).", "You took 3 damage.", "You received: 50 gold."). Choice events show the result after picking an option.

### Changed
- **Balance:** Defense no longer increases with level; only armor and accessories provide defense. Enemies have higher base HP (8) and damage (2) and steeper scaling (1.45) so combat is harder.
- **New game:** Clicking Play from the menu resets run state so a fresh start does not carry over from a previous game over.

### Technical
- [config.js](src/config.js): HERO_STAT_PER_LEVEL defense removed; ENEMY_BASE_HP 8, ENEMY_BASE_DAMAGE 2, ENEMY_SCALE_FACTOR 1.45.
- [Hero.js](src/entities/Hero.js): getEffectiveDefense() uses only armor/accessory/passives/battle bonus, no level growth.
- [main.js](src/main.js): getTotalPoints(), addTotalPoints() (localStorage), resetRun(); CombatScene onCombatLose calls addTotalPoints(runPoints) and resetRun().
- [CombatScene.js](src/scenes/CombatScene.js): statusEffectsText, combatLogLines, combatLogText; logCombat(), updateStatusEffects(); log messages for skills and enemy attacks.
- [SkillButtons.js](src/ui/SkillButtons.js): Two rows (SKILLS_PER_ROW 5), smaller buttons (120x40). Disable via `enabled` flag and alpha only (no removeInteractive) so buttons stay clickable after enemy turn.
- [OverworldScene.js](src/scenes/OverworldScene.js): "World Map" title; Abandon Run button.
- [EventScene.js](src/scenes/EventScene.js): EventEffects.apply() return value shown; showEventResult() for choice events.
- [eventEffects.js](src/systems/eventEffects.js): apply() returns result message string per event type.

---

## Version 3.0.3 – 2025-03-05

**Date:** 2025-03-05  
**Timestamp:** Skill buttons work again after enemy turn

### Fixed
- **Combat:** After the enemy turn (e.g. when one of multiple enemies was defeated and the second attacked), skill buttons stayed unresponsive. In Phaser 3, calling `removeInteractive()` then `setInteractive()` again does not preserve the `pointerdown` listener. Re-enabling the buttons now re-attaches the click handler so Slash and other skills can be used on the next player turn.

### Technical
- [SkillButtons.js](src/ui/SkillButtons.js): Store `onPointerDown` per button; in `setEnabled(true)` after `setInteractive()` call `rect.on('pointerdown', b.onPointerDown)` so the listener is re-attached.

---

## Version 3.0.2 – 2025-03-05

**Date:** 2025-03-05  
**Timestamp:** Defeated enemy sprites disappear

### Fixed
- **Combat:** When an enemy reaches 0 HP, its sprite (red rectangle), name label, and HP text are now hidden so the defeated enemy disappears from the screen instead of remaining visible. Dead enemy sprites are also made non-interactive so they cannot be clicked.

### Technical
- [CombatScene.js](src/scenes/CombatScene.js): In `updateBars()`, for each enemy with `hp <= 0`, set `enemySprites[i]`, `enemyHpTexts[i]`, and `enemyNameTexts[i]` to `setVisible(false)` and call `removeInteractive()` on the sprite. Added `enemyNameTexts` array and push each enemy name text in the create loop so it can be hidden when the enemy dies.

---

## Version 3.0.1 – 2025-03-05

**Date:** 2025-03-05  
**Timestamp:** Flee modal cleanup, post-flee narrative, state init

### Fixed
- **Flee confirm modal:** Cancel and Flee now destroy all modal elements (box, title, body text, both button rectangles and their "Cancel" / "Flee" text labels) so no stray graphics remain on screen.
- **Post-flee message:** When no equipped item broke, the overworld narrative now says "No equipped item was broken." instead of omitting that line.

### Changed
- **GAME_STATE:** `fledGoldLost` and `fledItemBrokenName` are initialized to `null` in main.js and cleared when the overworld shows the flee result popup.

### Technical
- [CombatScene.js](src/scenes/CombatScene.js): `showFleeConfirmModal` stores all 7 elements in an `all` array; single `destroyAll()` used for both Cancel and Flee.
- [OverworldScene.js](src/scenes/OverworldScene.js): Flee popup message uses ternary for item-broke vs "No equipped item was broken."; OK destroys box, txt, okBtn, okTxt.
- [main.js](src/main.js): `fledGoldLost: null`, `fledItemBrokenName: null` in GAME_STATE.

---

## Version 3.0.0 – 2025-03-06

**Date:** 2025-03-06  
**Timestamp:** Sorceress class, skill points, flee narratives, class origins, item sets

### Added
- **Sorceress class:** Second playable class (unlocked after level 10). Uses Intelligence for spell damage. Unique skill tree: Fireball (0 mana), Flame Aura (DoT: all enemies take int damage each round for 3 rounds), Flame Wall (5 mana, +40% evasion for the rest of battle), and more. Daughter of the Warrior; narrative: she will ensure no one else suffers and defeat the demons for good.
- **Class origin narratives:** After choosing a class, a new scene shows the class origin story (Warrior: daughter kidnapped by the demon lord; Sorceress: defeat the demons once and for all). Continue then creates the hero and enters the overworld.
- **Flee confirmation and result:** Before fleeing, a modal warns that all gold will be lost and one random equipped item will break. Cancel or Flee. After fleeing, the overworld shows a narrative of what was lost (gold amount) and what item broke.
- **Skill points:** Each level-up grants 2 skill points. Skills cost 1 point (ultimate 2). Skill tree allows multiple picks per level and spending on previous tiers. Shrine of Wisdom event grants +1 skill point.
- **Item sets by class:** Weapon/armor/accessory drops and shop stock are filtered by hero class: strength set (Warrior), intelligence set (Sorceress). Potions and scrolls available to all. New int-based weapons, armor, and accessories for Sorceress.
- **Flame Aura:** Sorceress skill that deals int-based damage to all enemies at the start of each round for 3 rounds.
- **Flame Wall:** Sorceress tier-3 skill, 5 mana: +40% evasion for the remainder of the battle.

### Changed
- **Class selection:** Play opens Class Select (Warrior; Sorceress unlocked at level 10). Selecting a class opens the origin narrative, then Continue creates the hero.
- **Combat damage:** Warrior skills use Strength; Sorceress skills use Intelligence. Flame Aura applies DoT at start of each round.
- **Loot and shop:** Roll and generate stock by hero class for gear; shared pools for potions and scrolls.

### Technical
- New ClassOriginScene; ClassSelectScene starts ClassOrigin with classId; hero created on Continue.
- CombatScene: Flee opens confirm modal; doFlee sets GAME_STATE.fledGoldLost/fledItemBrokenName; Overworld shows flee result popup. Start-of-round Flame Aura tick.
- Hero: intelligence, getEffectiveIntelligence, getIntelligence; createHero sets class and base stats.
- skills.js: SORCERESS_SKILLS, SKILL_TREE_BY_TIER_SORCERESS; getSkillsForClass(hero).
- combat.js: dealDamage/dealDamageToAll use getStrength or getIntelligence by attacker class.
- items.js: statClass on gear; ITEMS_BY_TYPE_RARITY_STRENGTH / _INT; int set items.
- loot.js: rollLoot(isBoss, heroClass). shop.js: generateStock(hero). progression.js: class-aware getChoicesForLevel/applyChoice.

---

## Version 2.4.0 – 2025-03-05

**Date:** 2025-03-05  
**Timestamp:** Balance, multi-enemy, and target selection

### Added
- **Multi-enemy fights:** Non-boss fights can spawn 1–5 enemies; count ramps by level and stage (e.g. level 1 low chance for 2, level 5+ up to 5). Boss fights remain single-enemy. Enemies are laid out in a row; each attacks the hero on the enemy turn.
- **Target selection:** For single-target skills (Slash, Heavy Strike, Execute), player clicks the skill then clicks an enemy to target. AoE skills (Whirlwind) hit all enemies and need no target.
- **Town rest cost:** Rest in town now costs gold: base + (level × per-level). Price shown on the button; "Not enough gold!" if unable to pay. Rest still fully restores HP and Mana.

### Changed
- **HP/Mana retention:** HP and Mana are no longer refilled when entering a level, after taking loot before the next fight, or when clicking Play. They persist across fights and levels until restored by level-up, rest, or potions.
- **Level-up refill:** Accepting a level-up skill choice fully restores HP and Mana before continuing to loot.
- **Game over:** On combat loss, hero is reset so the next Play from the menu creates a fresh hero with full stats (avoids soft-lock at 0 HP).
- **Whirlwind:** Now costs 7 Mana and is AoE—hits all enemies at once.
- **Slash:** Now costs 0 Mana.

### Technical
- [config.js](src/config.js): REST_PRICE_BASE, REST_PRICE_PER_LEVEL; multi-enemy ramp params and max count by level.
- [skills.js](src/data/skills.js): Slash manaCost 0; Whirlwind manaCost 7, isAoe: true.
- [levels.js](src/data/levels.js) / helper: getEnemyCountForFight(levelIndex, fightIndex, isBoss).
- [combat.js](src/systems/combat.js): dealDamageToAll(attacker, targets, skillId).
- [CombatScene.js](src/scenes/CombatScene.js): this.enemies / this.enemySprites arrays; spawn from getEnemyCountForFight; enemy turn loops all living enemies; useSkill branches AoE vs single-target; selectedSkillId and enemy-sprite click for target selection.
- [TownScene.js](src/scenes/TownScene.js): Rest price display and gold check/deduction.
- [OverworldScene.js](src/scenes/OverworldScene.js): Removed refillCombatStats when starting Combat.
- [LootScene.js](src/scenes/LootScene.js): Removed refillCombatStats before next fight.
- [MenuScene.js](src/scenes/MenuScene.js): Removed refillCombatStats on Play.
- [CombatScene.js](src/scenes/CombatScene.js) onCombatLose: GAME_STATE.hero = null (or createHero) before starting Menu.

---

## Version 2.3.0 – 2025-03-05

**Date:** 2025-03-05  
**Timestamp:** Shop buy/sell, durability, inventory scroll/filters, blacksmith

### Added
- **Shop: Buy/Sell first screen:** Entering the shop shows a choice: "Buy" or "Sell". Buy opens the existing stock list; Sell lists the hero’s inventory with sell price (50% of buy price) and a Sell button per item. "Back to Shop" returns to the choice screen; "Back to Map" from the choice screen returns to the overworld.
- **Shop item classification:** Each item in the shop list now shows its type (Weapon, Armor, Accessories, Consumables, Scrolls) alongside name, rarity, and price.
- **Durability system:** Weapons, armor, and accessories have per-instance durability. Weapon durability decreases on each player skill use that deals damage; armor durability decreases when the hero takes damage. At 0, the item is removed and if equipped the slot is cleared; a popup shows "[Item name] broke! Visit Inventory to equip another." Potions and scrolls have no durability (consumed on use).
- **Slot-based inventory:** Inventory is now an array of slots `{ id, itemId, durability?, maxDurability? }`; equipment (weapon/armor/accessory) stores slot id. Existing saves are migrated from string itemIds to slots on load.
- **Inventory scroll and filters:** Both the combat inventory panel and the overworld inventory scene support a scrollable item list (Up/Down or scroll offset) and type filters: All, Weapons, Armor, Accessories, Consumables, Scrolls. Durability (e.g. 3/5) is shown for equippable items.
- **Blacksmith:** Town has a "Visit Blacksmith" button. Blacksmith scene lists only damaged equipment (durability &lt; max); shows repair cost by rarity (e.g. common 20%, rare 35%, legendary 50% of buy price). Repair button deducts gold and sets durability to max. "Back to Town" returns to the town screen.

### Technical
- [config.js](src/config.js): DURABILITY_MAX by rarity; REPAIR_PRICE_RATIO by rarity.
- [shop.js](src/systems/shop.js): getSellPrice(itemId) 50% of getPrice; getRepairPrice(itemId) by rarity.
- [ShopScene.js](src/scenes/ShopScene.js): GAME_STATE.shopView (choice | buy | sell); type labels; Sell UI.
- [inventory.js](src/systems/inventory.js): Slot-based add/equip/unequip/removeSlotById; ensureSlotBased migration; usePotion/useScroll remove by slot.
- New [durability.js](src/systems/durability.js): getMaxDurability, weaponUse, armorHit, checkBreak; GAME_STATE.lastBrokenItemName.
- [Hero.js](src/entities/Hero.js): Equipment and stats resolve by slot id.
- [CombatScene.js](src/scenes/CombatScene.js): weaponUse after skill damage; armorHit after hero takes damage; showBreakPopup.
- [combat.js](src/systems/combat.js): armorHit(hero) after damage applied.
- [InventoryPanel.js](src/ui/InventoryPanel.js): Slots, scroll, type filter, durability display.
- [InventoryOverworldScene.js](src/scenes/InventoryOverworldScene.js): Slots, scroll, type filter, durability.
- New [BlacksmithScene.js](src/scenes/BlacksmithScene.js): Damaged list, repair cost, Repair, Back to Town.
- [TownScene.js](src/scenes/TownScene.js): "Visit Blacksmith" button.
- [main.js](src/main.js), [index.html](index.html): BlacksmithScene registered and loaded.

---

## Version 2.2.2 – 2025-03-05

**Date:** 2025-03-05  
**Timestamp:** Combat not proceeding after killing an enemy

### Fixed
- **Combat stuck after killing an enemy:** When the last enemy was reduced to 0 HP by a player skill, the game sometimes did not advance to the enemy turn or to victory. The delayed callback for the enemy turn now uses Phaser’s callback scope (`this.time.delayedCall(700, this.doEnemyTurn, [], this)`) so `doEnemyTurn` runs with the correct scene context. In `doEnemyTurn()`, when all enemies are already dead (`living.length === 0`), the scene now calls `onCombatWin()` and returns instead of returning without transitioning, so the win flow always runs when appropriate.

### Technical
- [CombatScene.js](src/scenes/CombatScene.js): Both `delayedCall(700, ...)` for the enemy turn replaced with `delayedCall(700, this.doEnemyTurn, [], this)`; guard in `doEnemyTurn()`: if no living enemies, call `this.onCombatWin()` then return.

---

## Version 2.2.1 – 2025-03-04

**Date:** 2025-03-04  
**Timestamp:** Visible Equip/Unequip/Use buttons in inventory

### Changed
- **Inventory actions use visible buttons:** Equip, Unequip, and Use are now shown as explicit clickable buttons (gray rectangle with label) on the right of each inventory row in both the overworld inventory and the combat overlay panel. The previous inline "[Equip]" text and invisible full-row hit area are replaced so it is clear what to click.

### Technical
- [InventoryOverworldScene.js](src/scenes/InventoryOverworldScene.js): Per-row visible "Equip" / "Unequip" / "Use" button; item name and rarity no longer include inline action text.
- [InventoryPanel.js](src/ui/InventoryPanel.js): Same visible button per row in `refresh()`; button and label added to `itemTexts` for cleanup.

---

## Version 2.2.0 – 2025-03-04

**Date:** 2025-03-04  
**Timestamp:** Inventory classification, equip fix, character sheet

### Added
- **Item classification in inventory:** Inventory items are grouped by type with section headers (Weapons, Armor, Accessories, Consumables, Spell scrolls) in both the full-screen overworld inventory and the combat overlay panel. Items within each group are sorted by rarity (common → rare → legendary).
- **Character Sheet:** New scene showing full character summary: level and XP progress, Strength/Defense/HP/Mana (current and max), list of current skills with mana costs, and equipped items (Weapon, Armor, Accessory) with their effect lines. Accessible from the map via "Character Sheet" button and from the inventory screen via "Character Sheet" at the top.

### Fixed
- **Equip button:** Hit areas for inventory rows now use `setDepth(1)` so they receive pointer events above text. Clicks on [Equip]/[Unequip] now correctly equip or unequip the intended item in both overworld and combat inventory UIs.

### Technical
- [InventoryOverworldScene.js](src/scenes/InventoryOverworldScene.js): `groupInventoryByType()`, type-order and labels; grouped list with headers; hit areas `setDepth(1)`; Character Sheet button.
- [InventoryPanel.js](src/ui/InventoryPanel.js): `groupInventoryByTypePanel()`, section headers in `refresh()`, hit areas `setDepth(1)`.
- **New** [CharacterSheetScene.js](src/scenes/CharacterSheetScene.js): Level/XP, stats, skills, equipped items and effects, Back to Map.
- [main.js](src/main.js): CharacterSheetScene in scene list.
- [index.html](index.html): Script for CharacterSheetScene.js.
- [OverworldScene.js](src/scenes/OverworldScene.js): "Character Sheet" button.

---

## Version 2.1.0 – 2025-03-04

**Date:** 2025-03-04  
**Timestamp:** Equip/unequip and one-per-slot enforcement

### Added
- **Unequip:** `InventorySystem.unequip(hero, type)` clears one equipment slot (weapon/armor/accessory). Item stays in inventory.
- **Slot summary in inventory:** Combat panel and overworld inventory show "Weapon: [name or None]", "Armor: ...", "Accessory: ..." at the top so only one per slot is clear.
- **Equip/Unequip labels:** Each weapon/armor/accessory row shows "[Equip]" or "[Unequip]" depending on whether that item is currently in its slot. Click toggles (equip or unequip).

### Changed
- **No auto-equip on Take:** Taking loot only adds the item to inventory; player must equip from inventory.
- **One per slot enforced in UI:** Removed "(Equipped)" from every duplicate row; slot summary is the single source of truth. Data model already allowed only one id per slot; UI now makes this explicit and allows unequip.

### Technical
- [inventory.js](src/systems/inventory.js): Comment on one-per-slot; new `unequip(hero, type)`.
- [LootScene.js](src/scenes/LootScene.js): Take button no longer calls `equip`.
- [InventoryPanel.js](src/ui/InventoryPanel.js): Slot summary lines; Equip/Unequip per row.
- [CombatScene.js](src/scenes/CombatScene.js): `onInventoryItemClick` toggles equip vs unequip for weapon/armor/accessory.
- [InventoryOverworldScene.js](src/scenes/InventoryOverworldScene.js): Same slot summary and equip/unequip behavior.

---

## Version 2.0.0 – 2025-03-04

**Date:** 2025-03-04  
**Timestamp:** 2025-03-04 (implementation complete)

### Added
- **Turn-based combat:** Player and enemy take alternating turns; no real-time timer. Enemy acts after a short delay following player action.
- **10 levels:** Levels 1–9 (dungeons) and Level 10 (Castle). Unlock progression unchanged (complete level N to unlock N+1).
- **Hero stat scaling:** Health, mana, strength, and defense increase per level via CONFIG growth values. Effective stats used for combat and UI.
- **Enemy scaling:** Goon and boss HP/damage scale exponentially by level. Boss per level is the hardest encounter (multipliers).
- **Combat feedback:** Shake animation on the sprite that receives damage; floating red damage numbers that move up and fade.
- **Gold:** Monsters drop gold (goons and bosses; amount scales by level). Gold shown after combat and in LootScene; used for shop.
- **Accessories:** New equipment slot. Accessories can add strength, health, mana, or multiple (legendaries can add two or all three). Included in hero effective stats.
- **Spell scrolls:** New item type; use to permanently learn a skill. Scrolls in loot and shop.
- **Loot overhaul:** Weapons, armor, accessories, spell scrolls, potions. Goons cannot drop legendaries; bosses have better legendary chance. Potions are rare drops. Rarity-based stat values for potions (common low, legendary high).
- **Inventory improvements:** Shows item effects (e.g. +2 Str, +3 Def), rarity (Common/Rare/Legendary), and "(Equipped)" for weapon, armor, accessory. Usable from Overworld as well as combat.
- **Overworld map:** "Visit Town" (restore HP/Mana), "Visit Shop" (buy items), "Inventory" (view all loot and change equipment). Level nodes for levels 1–10.
- **Shop:** Random stock of up to 5 items per visit (weapons, armor, accessories, scrolls, potions). Legendaries can appear but are expensive and rare in the roll. Buy with gold.
- **Changelog:** This file (changelog.md) with versioned entries and dates.

### Changed
- Combat is turn-based instead of real-time.
- Victory condition: defeat Castle (Level 10) boss instead of Level 2.
- Inventory panel shows full item details and equipped state; damage calculation uses weapon + armor + accessory.
- Potions are rare in loot tables; boss vs goon drop rules applied.

### Technical
- CONFIG: `XP_PER_LEVEL` extended for 10 levels; `HERO_STAT_PER_LEVEL`; `ENEMY_BASE_HP`, `ENEMY_BASE_DAMAGE`, `ENEMY_SCALE_FACTOR`, boss multipliers; gold ranges; shop weights.
- New scenes: TownScene, ShopScene, InventoryOverworldScene. New system: shop.js. Enemy created from level index + isBoss (formula-based stats).

---

## Version 1.0.0 – Initial release

**Date:** 2025-03-04  
**Timestamp:** Initial game build (pre–plan)

### Added
- Phaser 3 roguelike: Vince the Warrior, 2 levels, real-time combat, XP/level-up, loot (weapons, armor, potions), overworld map, mouse-only controls.
- Placeholder graphics (colored shapes and text). Asset naming convention for future Sorceress art.
