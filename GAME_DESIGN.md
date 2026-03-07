# Game Project Document for GAME_DESIGN.md

**Game Name:** Demon Slayer  
**Genre:** Roguelike / Light RPG Dungeon Crawler (2D Pixel Art)  
**Engine:** Phaser 3 – organized multi-file structure  
**Focus:** Gameplay first (Version 1 today), graphics/sounds later with Sorceress  

## Core Hero
- **Names:** Vince (Warrior), Isabella (Sorceress). Player chooses class at start; Sorceress unlocks after level 10.
- Stats differ by class: Warrior uses Strength for damage; Sorceress uses Intelligence. Default skill: Warrior "Slash", Sorceress "Fireball".
- Starting stats (Warrior): Strength 10, Health 10, Mana 10, Defense 0. Sorceress has different base stats (e.g. higher Intelligence).
- Weapons increase Strength or Intelligence by class; Armor increases Defense. Full inventory system for equipping items.

## Progression
- Fights give Experience Points
- XP bar fills → Level Up → choose 1 skill from Warrior skill tree
- Skills cost Mana (stronger = more Mana)
- Rare health/mana potions drop

## Levels & Map
- Each level = exactly 5 fights (4 goons + 1 boss)
- Overworld map screen to travel between levels and revisit
- Level 1 unlocked, others locked until previous completed
- Final goal: Defeat the evil demon in his castle

## Loot System
- Randomized loot after every fight
- Rarity: Common, Rare, Legendary
- Weapons, armor, potions

## Combat
- Simple real-time combat (expandable to turn-based later)
- Monsters have stats and deal damage
- UI buttons for skills/items showing strength/mana cost

## Story & Polish (later)
- Room for narration and story text
- Nice animations for Vince

## Technical Rules
- Phaser 3 with Arcade Physics
- Start with colored shapes/rectangles (replace with sprites later)
- Everything must be scalable for new environments, classes, levels
- UI: Buttons for skills, inventory, map

## ASSET NAMING CONVENTION (super important!)
All sprites and assets will be named clearly so we can drag-and-drop Sorceress pixel art later. Warrior uses Vince hero assets; Sorceress uses Isabella / Sorceress assets when available.
- **Hero:** vince.png (Warrior), Sorceress art as added
- **Level 1:** L1goon1.png, L1goon2.png, L1goon3.png, L1goon4.png, L1boss.png
- **Level 2:** L2goon1.png, L2goon2.png, L2goon3.png, L2goon4.png, L2boss.png
- And so on for future levels
- **Items:** common-sword.png, rare-armor.png, health-potion.png
- **UI:** button-slash.png, xp-bar.png

## Controls
The game is entirely handled with the mouse. 

---

Make this game fun and easy for a dad and his 5-year-old son to build together one tiny feature at a time. Keep code clean with comments.

*End of Game Project Document.*
