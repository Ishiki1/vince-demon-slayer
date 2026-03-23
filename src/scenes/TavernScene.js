/**
 * TavernScene.js
 * Art-first tavern with hotspot-driven interactions.
 * Barkeeper offers rest and rumors; tables seat quest NPCs; notice board shows hints.
 */

const ELEMENTAL_STONE_IDS = ['fire-stone', 'wind-stone', 'ice-stone', 'lightning-stone', 'water-stone'];
const HERB_IDS = ['moonpetal', 'thornroot', 'ghostcap', 'witchbloom', 'nightshade'];

function heroHasItemType(hero, typeOrIds) {
  if (!hero || !hero.inventory) return false;
  if (Array.isArray(typeOrIds)) return hero.inventory.some(s => typeOrIds.includes(s.itemId));
  return hero.inventory.some(s => { const it = ITEMS[s.itemId]; return it && it.type === typeOrIds; });
}

const TAVERN_CONTEXTUAL_RUMORS = [
  {
    id: 'witch-approaching',
    condition: (h, s) => s.day >= 2 && s.day % 4 >= 2 && !s.dungeonProgress && !s.pendingWitchDungeon,
    texts: [
      'They say every few nights the old witch stirs. Her cellar opens for those who\'ve been out long enough.',
      'A traveler warned me — when the moon turns, the witch sends word. Be ready.',
      'The hag in the woods keeps a schedule, they say. Folks who camp long enough always get her invitation.',
    ],
  },
  {
    id: 'witch-ready',
    condition: (h, s) => s.pendingWitchDungeon === true,
    texts: [
      'Word is the witch\'s dungeon stands open right now. Brave or foolish, the choice is yours.',
      'Her door\'s unlocked tonight. The nightshade down there doesn\'t grow anywhere else.',
      'The witch is expecting visitors — I saw smoke from her chimney. Don\'t say I didn\'t warn you.',
    ],
  },
  {
    id: 'reaper-approaching',
    condition: (h, s) => s.day >= 7 && s.day < 10 && !s.day10ReaperResolved,
    texts: [
      'Old hands say something waits at the crossroads after ten camps. Keep your purse heavy.',
      'A chill follows adventurers who stay out too long. Some say Death itself comes to collect.',
      'Count your nights carefully, friend. Around the tenth, the tall one appears.',
    ],
  },
  {
    id: 'reaper-imminent',
    condition: (h, s) => s.day >= 10 && !s.day10ReaperResolved,
    texts: [
      'The Reaper walks the crossroads. Gold might buy you passage — if you\'re whole when he finds you.',
      'I wouldn\'t go out there without full strength. Something ancient waits, and it doesn\'t bargain with the wounded.',
      'Ten nights out. He\'s there now, they say — tall, patient, and interested in your coin or your life.',
    ],
  },
  {
    id: 'revisit-reaper',
    condition: (h, s) => (s.completedLevelIds || []).length >= 3,
    texts: [
      'Careful treading old ground. Folk who revisit cleared roads sometimes find Death walking beside them.',
      'They say the deeper the path you retrace, the more likely the Reaper tags along for the stroll.',
    ],
  },
  {
    id: 'unique-sets',
    condition: (h) => heroHasItemType(h, ELEMENTAL_STONE_IDS),
    texts: [
      'A blade, mail, and trinket forged from the same heart-stone? The smiths say they wake a second blessing.',
      'Elemental stones are worth more than gold. Forge a matched weapon, armor, and accessory — the set sings together.',
      'I\'ve seen warriors glow with power — three pieces of one element, all crafted by the blacksmith. Quite a sight.',
    ],
  },
  {
    id: 'mine-hint',
    condition: (h) => h.gold >= 50 && !heroHasItemType(h, ELEMENTAL_STONE_IDS),
    texts: [
      'The old mine tunnels sometimes yield elemental stones. A pickaxe rental and a bit of luck is all it takes.',
      'If you\'re looking for something the shop can\'t sell, try the mine. Five kinds of ore sleep in those walls.',
    ],
  },
  {
    id: 'alchemy-herbs',
    condition: (h) => heroHasItemType(h, HERB_IDS),
    texts: [
      'Got herbs weighing down your pack? The alchemist brews things no shop can stock.',
      'The cauldron doesn\'t care for secrets — bring leaf and coin. The rarest brews need a blossom even witches guard.',
    ],
  },
  {
    id: 'blacksmith-craft',
    condition: (h) => {
      if (!heroHasItemType(h, ELEMENTAL_STONE_IDS)) return false;
      const stoneIds = h.inventory.filter(s => ELEMENTAL_STONE_IDS.includes(s.itemId)).map(s => s.itemId);
      for (const sid of stoneIds) {
        const hasUnique = h.inventory.some(s => { const it = ITEMS[s.itemId]; return it && it.rarity === 'unique' && it.setId === sid; });
        if (!hasUnique) return true;
      }
      return false;
    },
    texts: [
      'Ores from the deep shaft and a heavy purse can make steel sing. The blacksmith knows the old recipes.',
      'Don\'t just sit on those stones. The blacksmith can forge something unique — something with real power.',
    ],
  },
  {
    id: 'boss-level10',
    condition: (h, s) => (s.unlockedLevels || []).includes('level10') && !(s.completedLevelIds || []).includes('level10'),
    texts: [
      'The castle gates are open, but the vampire lord sits the throne. Many enter. Few walk back.',
      'Level 10 is no ordinary dungeon. Prepare well — the lord of that keep has ended many runs.',
    ],
  },
  {
    id: 'boss-level20',
    condition: (h, s) => (s.unlockedLevels || []).includes('level20') && !(s.completedLevelIds || []).includes('level20'),
    texts: [
      'The Demon Empire awaits at the end of the road. Everything you\'ve built leads to that final gate.',
      'Beyond level 20, there is only glory or dust. Sharpen everything you have.',
    ],
  },
  {
    id: 'act2-tease',
    condition: (h, s) => s.act === 1 && (s.completedLevelIds || []).length >= 8,
    texts: [
      'They say the world widens after the vampire falls. New lands, new horrors, new power.',
      'Beat the castle lord and the map itself changes — or so the veterans tell me over their cups.',
    ],
  },
  {
    id: 'generic',
    condition: () => true,
    texts: [
      'Quiet night tonight. The kind where trouble brews somewhere you can\'t see.',
      'Another round? You look like you\'ve seen things out there.',
      'The fire\'s warm and the ale\'s cold. Enjoy it while you can, adventurer.',
      'I\'ve poured drinks for heroes and fools alike. Sometimes they\'re the same person.',
      'Every patron in this room has a story. Most of them end badly.',
    ],
  },
];

class TavernScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Tavern' });
  }

  getHotspotManifest() {
    if (!this.cache || !this.cache.json) return null;
    const manifest = this.cache.json.get('tavern-hotspots');
    if (!manifest || !Array.isArray(manifest.hotspots)) return null;
    return manifest;
  }

  getHotspot(id) {
    const manifest = this.getHotspotManifest();
    if (!manifest) return null;
    return manifest.hotspots.find(h => h.id === id) || null;
  }

  showTooltip(lines, x, y, below) {
    this.hideTooltip();
    const clampedX = Math.min(Math.max(x, 120), CONFIG.WIDTH - 120);
    const originY = below ? 0 : 1;
    const text = this.add.text(clampedX, y, lines.join('\n'), {
      fontSize: 13,
      color: '#e5e7eb',
      fontFamily: 'Arial',
      lineSpacing: 2,
      align: 'center',
    }).setOrigin(0.5, originY).setDepth(30).setWordWrapWidth(220);
    const bgW = text.width + 24;
    const bgH = text.height + 16;
    const bgY = below ? y + text.height / 2 : y - text.height / 2;
    const bg = this.add.rectangle(clampedX, bgY, bgW, bgH, 0x0f172a, 0.92)
      .setStrokeStyle(1, 0x94a3b8, 0.9).setDepth(29);
    this.tooltipBg = bg;
    this.tooltipText = text;
  }

  hideTooltip() {
    if (this.tooltipBg) { this.tooltipBg.destroy(); this.tooltipBg = null; }
    if (this.tooltipText) { this.tooltipText.destroy(); this.tooltipText = null; }
  }

  getContextualRumor(hero) {
    const state = typeof GAME_STATE !== 'undefined' ? GAME_STATE : {};
    const eligible = TAVERN_CONTEXTUAL_RUMORS.filter(r => {
      if (r.id === 'generic') return false;
      try { return r.condition(hero, state); } catch (_) { return false; }
    });
    const pool = eligible.length > 0 ? eligible : TAVERN_CONTEXTUAL_RUMORS.filter(r => r.id === 'generic');
    const entry = pool[Math.floor(Math.random() * pool.length)];
    return entry.texts[Math.floor(Math.random() * entry.texts.length)];
  }

  createHotspotButton(hotspotId, tooltip, onClick, options) {
    const hotspot = this.getHotspot(hotspotId);
    if (!hotspot) return null;
    const below = options && options.tooltipBelow;
    const hitArea = this.add.rectangle(
      hotspot.centerX, hotspot.centerY,
      hotspot.width, hotspot.height,
      0x000000, 0
    ).setInteractive({ useHandCursor: !!onClick }).setDepth(20);
    hitArea.on('pointerover', () => {
      const tipY = below ? hotspot.y + hotspot.height + 6 : hotspot.y - 6;
      this.showTooltip(
        Array.isArray(tooltip) ? tooltip : [tooltip],
        hotspot.centerX, tipY, below,
      );
    });
    hitArea.on('pointerout', () => this.hideTooltip());
    if (onClick) {
      hitArea.on('pointerdown', () => {
        this.hideTooltip();
        onClick();
      });
    }
    return hitArea;
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    if (typeof applyAnimationSettings === 'function') applyAnimationSettings(this);
    const hero = GAME_STATE.hero;
    this.tooltipBg = null;
    this.tooltipText = null;

    const hasArt = !!addSceneBackground(this, 'tavern-ui-background');
    if (!hasArt) {
      this.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0f172a);
    }

    this.add.text(20, 32, 'Tavern', {
      fontSize: 28,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 5,
    }).setOrigin(0, 0.5);
    this.add.text(20, 62, 'Gold: ' + hero.gold, {
      fontSize: 18,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 4,
    }).setOrigin(0, 0.5);

    createTownNavRow(this, { currentSection: 'tavern' });

    this.wireBarkeeper(hero);
    this.wireTableHotspots();
    this.wireNoticeBoard();
    this.wireExit();
  }

  wireBarkeeper(hero) {
    const restCost = typeof getRestGoldCost === 'function' ? getRestGoldCost(hero) : 0;
    const canRest = hero.gold >= restCost && hero.hp < hero.maxHp;
    const rumorPreview = this.getContextualRumor(hero);
    const shortRumor = rumorPreview.length > 50 ? rumorPreview.substring(0, 47) + '...' : rumorPreview;

    const lines = ['Barkeeper'];
    if (canRest) {
      lines.push('Rest: ' + restCost + ' gold');
      lines.push('(click to rest & hear a rumor)');
    } else if (hero.hp >= hero.maxHp) {
      lines.push('You look well-rested.');
      lines.push('(click to hear a rumor)');
    } else {
      lines.push('Rest: ' + restCost + ' gold (not enough)');
      lines.push('(click to hear a rumor)');
    }
    lines.push('"' + shortRumor + '"');

    this.createHotspotButton('barkeeper', lines, () => {
      if (canRest) {
        if (typeof performTownRest === 'function') {
          performTownRest(hero);
        } else {
          hero.gold -= restCost;
          if (typeof hero.refillCombatStats === 'function') hero.refillCombatStats();
        }
      }
      this.showRumor(hero);
      if (canRest) {
        this.time.delayedCall(1500, () => this.scene.restart());
      }
    }, { tooltipBelow: true });
  }

  wireTableHotspots() {
    const tables = ['center-table', 'left-table-upper', 'left-table-lower', 'upper-right-table', 'lower-right-table'];
    tables.forEach((tableId, index) => {
      const tableNum = index + 1;
      this.createHotspotButton(tableId, [
        'Table ' + tableNum,
        'Quest NPCs gather here.',
        '(Coming soon)',
      ], () => {
        this.showRumor();
      });
    });
  }

  wireNoticeBoard() {
    this.createHotspotButton('notice-board', [
      'Notice Board',
      'Bounties and rumors.',
      '(Coming soon)',
    ], () => {
      this.showRumor();
    });
  }

  wireExit() {
    this.createHotspotButton('exit', ['Back to Town'], () => {
      this.scene.start('Town');
    });
  }

  showRumor(hero) {
    if (!hero) hero = GAME_STATE.hero;
    const rumor = this.getContextualRumor(hero);
    this.hideTooltip();
    if (this.rumorText && this.rumorText.active) this.rumorText.destroy();
    if (this.rumorBg && this.rumorBg.active) this.rumorBg.destroy();
    const text = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT - 40, '"' + rumor + '"', {
      fontSize: 14,
      color: '#fbbf24',
      fontFamily: 'Arial',
      fontStyle: 'italic',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(30).setWordWrapWidth(600);
    const bg = this.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT - 40, text.width + 20, text.height + 10, 0x0f172a, 0.8)
      .setDepth(29);
    this.rumorText = text;
    this.rumorBg = bg;
    this.time.delayedCall(5000, () => {
      if (text && text.active) text.destroy();
      if (bg && bg.active) bg.destroy();
    });
  }
}
