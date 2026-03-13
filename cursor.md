# Cursor / AI Guidelines for This Project

Use this file as the source of additional rules when working on **Demon Slayer (Vince)** in `C:\GameCraft\Vince`. Check it at the start of any non-trivial change.

---

## Changelog

- **Always update the changelog** when you make user-facing or notable technical changes.
- File: [changelog.md](changelog.md)
- Add a new version entry (e.g. `2.2.0`) with:
  - **Date** and **Timestamp** (or short description)
  - **Added** / **Changed** / **Fixed** / **Technical** as needed
- Keep entries concise; link to relevant files in Technical when helpful.

---

## Project Conventions

- **Engine:** Phaser 3, Arcade Physics. Mouse-only controls unless specified otherwise.
- **Code style:** Clean, well-commented code. Aim for readability for a dad and 5-year-old building together (see [GAME_DESIGN.md](GAME_DESIGN.md)).
- **Assets:** Naming follows [GAME_DESIGN.md](GAME_DESIGN.md) (e.g. `vince.png`, `L1goon1.png`, `common-sword.png`) for future Sorceress art drop-in.
- **State:** Global `GAME_STATE` and hero object; no backend. Scenes and systems live under [src/](src/).

---

## Branch / PR Workflow

- **Persistent AI branch:** Use `cursorai` for AI-authored follow-up work when a long-lived AI branch is preferred.
- **Before starting AI work:** Sync the chosen AI branch with the latest intended base before editing so stale merged history does not accumulate.
- **After merging AI work to `main`:** Sync the AI branch back to the latest `main` before the next task.
- **Cleanup preference:** Once the needed commits are safely merged to `main`, delete old `cursor/...` follow-up branches locally and remotely.

---

## Learnings (consider on future changes)

- **Hero and scenes:** Scenes that assume `GAME_STATE.hero` should guard at the start of `create()` with `if (!GAME_STATE.hero) { this.scene.start('Menu'); return; }` so missing hero (e.g. after reset) does not cause errors. Applied in CombatScene, TownScene, ShopScene, BlacksmithScene, MineScene, LootScene, CharacterSheetScene, InventoryOverworldScene.
- **Skill lookup:** Use `getSkill(hero, skillId)` (from [skills.js](src/data/skills.js)) or `getSkillsForClass(hero)` consistently; avoid `typeof getSkillsForClass === 'function' ? ... : WARRIOR_SKILLS` fallbacks.
- **CONFIG:** Prefer CONFIG keys only (e.g. `CONFIG.REAPER_BASE_CHANCE`) without inline fallbacks (e.g. `|| 0.08`) so tuning lives in [config.js](src/config.js).
- **Buttons:** For "rectangle + text + interactive + pointerdown", use the shared `createButton(scene, x, y, w, h, label, options?, callback)` in [SceneUi.js](src/ui/SceneUi.js) to reduce duplication (e.g. TownScene uses it for all five buttons).
- **BootScene one-shot anims:** Add new hero skill animations via the `oneShotAnims` array and `registerOneShotHeroAnim(sheetKey, animKey, frameRate)` in [BootScene.js](src/scenes/BootScene.js); avoid copy-pasting the old manual frame-generation block.
- **CombatScene turn flow:** Use `endPlayerTurn()` to centralize "update bars, set turn state, disable skills, delayed doEnemyTurn". Use `playHeroAnimThen(sheetKey, animKey, callback)` when a skill should play an animation and then run a callback (e.g. `endPlayerTurn` or AoE effects) so timing and animationcomplete logic stay in one place.
- **Browser playthrough methodology:** For gameplay verification, first confirm the local server is already running on `http://localhost:3000` (or start it if needed). Prefer an automated browser playthrough over static code inspection. Use browser-side scene/state inspection to read Phaser objects directly when the UI is canvas-based, and use controlled state setup (`localStorage`, `GAME_STATE`, hero stats/inventory, or scene restarts) to jump to deep scenarios like merchants, day events, or flee outcomes. After any state manipulation, still verify the visible in-browser UI and resulting game state. If a long end-to-end scenario flakes, rerun that scenario in isolation before calling it a bug. Clean up any temporary browser test files after the run.

---

## Before Making Changes

1. Read [cursor.md](cursor.md) (this file) for rules like changelog updates.
2. If the change affects gameplay, balance, or structure, consider [GAME_DESIGN.md](GAME_DESIGN.md).
3. After implementing, add or update an entry in [changelog.md](changelog.md).
