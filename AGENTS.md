# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Demon Slayer (Vince) is a client-side Phaser 3 roguelike browser game. There is no backend, no database, and no build step. JavaScript is loaded via `<script>` tags in `index.html` from the Phaser CDN plus local `src/` files.

### Running the dev server

Run:

`npm run dev`

This starts `npx serve -l 3000` and serves the game at `http://localhost:3000`.

### Linting and testing

- There is no ESLint, Prettier, or formal automated gameplay test suite configured.
- Use `node --check <file>` for syntax checks on touched JavaScript files.
- Use `curl -I http://localhost:3000` for a non-UI availability check when the dev server is running.
- Do not attempt browser playthrough testing by default. Prefer terminal checks, code inspection, screenshots, and console output when visual proof is needed.

### Key files

- `cursor.md` - project conventions, learnings, and workflow guidance.
- `GAME_DESIGN.md` - full game design document.
- `changelog.md` - versioned changelog; update it for user-facing or notable technical changes.
- `spritework.md` - sprite, animation, and UI art reference.
- `.cursor/skills/cloud-agent-starter/SKILL.md` - command-first run and test playbook for this repo.

### Gotchas

- Phaser 3 loads from CDN, so the game needs network access when the browser first fetches Phaser.
- Script load order in `index.html` matters; dependencies must appear before dependents.
- Game state lives in `GAME_STATE` plus localStorage keys such as `vince_saveState` and `vince_totalPoints`.
