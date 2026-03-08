---
name: cloud-agent-starter
description: Minimal run and test playbook for Cloud agents working on Demon Slayer (Vince).
---

# Cloud Agent Starter Skill: Demon Slayer (Vince)

Use this skill at the start of any task so you can run high-signal checks quickly without unnecessary setup.

## 1) Fast environment setup (do this first)

1. Install dependencies once:
   - `npm install`
2. Confirm scripts:
   - `npm run`
3. Default rule for this repo:
   - Do **not** do browser playthrough testing by default.
   - Prefer terminal checks and code inspection.
   - If visual/runtime proof is required, ask for screenshots and console output.

## 2) Auth/login expectations

- There is **no backend auth or account login** flow in this codebase.
- App state is local and browser-based (`localStorage` + in-memory `GAME_STATE`).
- Relevant keys:
  - `vince_saveState` (run save)
  - `vince_totalPoints` (persistent run points)

## 3) Start the app only when needed

- Dev server:
  - `npm run dev`
- Expected URL:
  - `http://localhost:3000`
- Non-UI availability check:
  - `curl -I http://localhost:3000`

If a task can be validated without rendering gameplay, skip startup and use area-specific checks below.

## 4) Mocking state / feature flags (practical equivalents)

There is no formal feature-flag service. Treat these as flags/state switches:

- `src/config.js` constants (balance/tuning toggles)
- `GAME_STATE` fields in `src/main.js`:
  - `runUnlocks`
  - `forcedEncounter`
  - `pendingDay10Reaper`
  - `day10ReaperResolved`
- Save/load behavior in `src/systems/saveLoad.js` (`SAVE_KEY`, `SAVE_VERSION`)

Useful searches:

- `rg "runUnlocks|forcedEncounter|pendingDay10Reaper|day10ReaperResolved" src`
- `rg "SAVE_KEY|SAVE_VERSION|localStorage" src/main.js src/systems/saveLoad.js`

## 5) Testing workflow by codebase area

### A. Scene flow and boot wiring (`src/scenes`, `src/main.js`, `index.html`)

Use when changing scene transitions, menu flow, preload, or registration.

Checks:

- Syntax-check touched files:
  - `node --check src/main.js`
  - `node --check src/scenes/<ChangedScene>.js`
- Verify scene registration:
  - `rg "scene:\\s*\\[" src/main.js`
- Verify scene script inclusion:
  - `rg "src/scenes/" index.html`

### B. Gameplay systems and persistence (`src/systems`, `src/data`, `src/entities`)

Use when changing combat, inventory, loot, progression, config, or save/load logic.

Checks:

- Syntax-check touched files:
  - `node --check src/systems/<ChangedSystem>.js`
  - `node --check src/data/<ChangedDataFile>.js`
- Verify config and constants wiring:
  - `rg "CONFIG\\.|REAPER_|MINE_|CRAFT_|SHOP_" src`
- Verify save schema compatibility:
  - `rg "SAVE_VERSION|HERO_DATA_KEYS|localStorage" src/systems/saveLoad.js`

### C. UI helpers and interaction surfaces (`src/ui`, scene UI blocks)

Use when changing buttons, inventory rows, labels, or tooltip logic.

Checks:

- Syntax-check touched files:
  - `node --check src/ui/<ChangedUiFile>.js`
- Verify shared button helper usage:
  - `rg "createButton\\(" src/scenes src/ui`
- Verify interaction handlers still exist:
  - `rg "pointerdown|setInteractive|removeInteractive" src/scenes src/ui`

### D. Asset and animation hookups (`assets`, `src/scenes/BootScene.js`, `spritework.md`)

Use when adding/changing sprites, icons, or animation keys.

Checks:

- Verify asset preload lines:
  - `rg "load\\.(image|spritesheet)\\(" src/scenes/BootScene.js`
- Verify animation creation keys:
  - `rg "anims\\.create|registerOneShotHeroAnim|oneShotAnims" src/scenes/BootScene.js`
- Verify docs stay aligned:
  - Update `spritework.md` for new art wiring.

## 6) Requesting evidence when visual validation is required

When canvas behavior must be proven and you are not running a playthrough yourself, request:

1. A screenshot of the relevant scene/state.
2. DevTools console output for:
   - `window.game?.scene?.getScenes(true).map(s => s.scene.key)`
   - `localStorage.getItem('vince_saveState')`
3. Any runtime error stack traces from browser console.

## 7) How to update this skill when new runbook knowledge appears

1. Add the new trick as a short, command-first bullet in the relevant area above.
2. Keep instructions executable in Cloud terminals (copy/paste ready).
3. If behavior or conventions changed, also update `cursor.md` and `spritework.md` where relevant.
4. Add a concise changelog entry in `changelog.md` for notable process updates.
