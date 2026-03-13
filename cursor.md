# Cursor / AI Guidelines for This Project

Use this file as the repo-level operating guide for **Demon Slayer (Vince)**. Check it at the start of any non-trivial change and use it to find the right deeper doc before editing code.

---

## Changelog

- **Always update `changelog.md`** for user-facing changes and notable technical or process changes.
- Follow the version/date style already used in `changelog.md`.
- Add your new entry at the top, after any existing latest entry.
- Keep entries concise and group under **Added** / **Changed** / **Fixed** / **Technical** as needed.

---

## Project conventions

- **Engine:** Phaser 3 with Arcade Physics.
- **Input:** Mouse-only unless a change explicitly introduces something else.
- **Code style:** Keep code readable for a dad and 5-year-old building together. Favor clear names and small helpers over cleverness.
- **State model:** No backend auth or server state. Runtime state lives in `GAME_STATE`; persistence lives in `localStorage`.
- **Assets:** Follow `GAME_DESIGN.md` naming conventions so placeholder art can be swapped cleanly later.

---

## Branch / PR Workflow

- **Persistent AI branch:** Use `cursorai` for AI-authored follow-up work when a long-lived AI branch is preferred.
- **Before starting AI work:** Sync the chosen AI branch with the latest intended base before editing so stale merged history does not accumulate.
- **After merging AI work to `main`:** Sync the AI branch back to the latest `main` before the next task.
- **Cleanup preference:** Once the needed commits are safely merged to `main`, delete old `cursor/...` follow-up branches locally and remotely.

---

## Docs map

- `README.md` -> how to run the repo and basic project layout.
- `GAME_DESIGN.md` -> gameplay goals, naming conventions, and product intent.
- `spritework.md` -> sprite wiring, item art pipeline, hotspot-backed backgrounds, and inventory layout contracts.
- `changelog.md` -> release and process history.
- `.cursor/skills/cloud-agent-starter/SKILL.md` -> default Cloud run/test workflow for this repo.
- `.cursor/skills/background-hotspotting/SKILL.md` -> approval workflow for painted backgrounds and hotspot manifests.

Do not duplicate large asset tables, coordinates, or hotspot geometry here; keep those in `spritework.md`.

---

## Quick start and validation

- Install dependencies with `npm install` if needed.
- Check available scripts with `npm run`.
- Start the local server only when needed with `npm run dev`.
- Default local URL is `http://localhost:3000`.
- Prefer lightweight reachability checks such as `curl -I http://localhost:3000` before assuming a UI session is needed.
- For touched JS files, prefer targeted checks such as `node --check <file>` over broad test runs.

---

## Testing and evidence

- Do **not** default to browser playthrough testing for this repo.
- Prefer targeted terminal checks, code inspection, and narrow runtime validation.
- If visual proof is needed, request:
  1. a screenshot of the relevant scene or state,
  2. browser console output for `window.game?.scene?.getScenes(true).map(s => s.scene.key)`,
  3. browser console output for `localStorage.getItem('vince_saveState')`,
  4. any runtime error stack traces.
- When reproducing deep gameplay states, prefer controlled state setup through `localStorage`, `GAME_STATE`, save data, or scene restarts instead of long manual playthroughs.

---

## Source-of-truth files

- `src/main.js` -> `GAME_STATE` shape, run reset behavior, and scene registration.
- `src/config.js` -> gameplay tuning constants and shared layout values.
- `src/systems/saveLoad.js` -> save payload shape, `SAVE_VERSION`, and migration behavior.
- `src/data/unlocks.js` -> run unlock definitions and selection storage.
- `src/data/classes.js` -> class metadata, unlock rules, origins, and combat idle visuals.
- `src/data/itemVisuals.js` -> item icon paths, hover sheets, preload flags, and placeholder visuals.
- `src/data/sounds.js` -> audio manifest and sound keys.
- `src/ui/SceneUi.js` -> shared UI helpers and common button/icon patterns.

Prefer updating these registries and helpers instead of scattering duplicate definitions across scenes.

---

## State and storage

- `GAME_STATE` in `src/main.js` is the runtime source of truth for the active run.
- Persistent keys currently include:
  - `vince_saveState`
  - `vince_totalPoints`
  - `vince_runUnlockSelection`
  - `vince_musicVolume`
  - `vince_sfxVolume`
  - `vince_animationSpeed`
- If you change what a run persists, review `SAVE_VERSION`, payload compatibility, and migration behavior in `src/systems/saveLoad.js`.
- Be careful with run-state flags such as `runUnlocks`, `forcedEncounter`, `pendingDay10Reaper`, `day10ReaperResolved`, and `freeMineWeekUsed`; these affect flow across scenes and saves.

---

## Working patterns and learnings

- **Hero guard:** Scenes that require a hero should begin `create()` with `if (!GAME_STATE.hero) { this.scene.start('Menu'); return; }`.
- **Skill lookup:** Use `getSkill(hero, skillId)` or `getSkillsForClass(hero)` consistently instead of ad hoc fallbacks.
- **CONFIG-first tuning:** Prefer `CONFIG` keys over inline numeric fallbacks so balance stays centralized.
- **Registry-first edits:** For classes, visuals, unlocks, sounds, and save schema, update the registry/source file first rather than duplicating data in scenes.
- **Shared UI helpers:** Use the helper that matches the surface:
  - `createButton()` for simple fallback rectangle buttons,
  - `createUiArtButton()` for painted/plaque CTA buttons,
  - `createUiIconButton()` / `createRightAlignedUiIconRow()` for icon controls,
  - `createTownNavRow()` for town/service navigation.
- **Art-first scenes:** For painted backgrounds with click targets, keep hotspot definitions in manifest JSON, load them through `BootScene`, and keep runtime hotspots invisible unless a visible hover effect is explicitly requested.
- **Hotspot workflow:** Use the `background-hotspotting` skill and update `spritework.md` when hotspot bounds, proofs, or background interaction contracts change.
- **Boot/preload flow:** `BootScene` loads the minimal menu/settings shell. Heavy gameplay assets load in `GamePreload`. When entering gameplay from menu/load/class flow, prefer `startSceneWithGameplayPreload(...)`.
- **Combat animation flow:** Add new hero one-shot animations through the `oneShotAnims` registration path in `BootScene`, and trigger them through `playHeroAnimThen(...)` in `CombatScene`.

---

## Before making changes

1. Read this file first.
2. Read the deeper doc that matches the area you are touching (`README.md`, `GAME_DESIGN.md`, `spritework.md`, or the relevant skill).
3. If the change touches gameplay tuning, save data, unlocks, or class data, inspect the corresponding source-of-truth file before editing scenes.
4. If the change touches painted backgrounds, hotspots, sprites, or layout contracts, read `spritework.md` before editing.
5. After implementing notable work, add a concise entry to `changelog.md`.
