/**
 * events.js
 * Random event definitions: id, weight, title, body. Optional choices or isMerchant.
 * Effects applied in eventEffects.js; narrative only here for voice/UI polish.
 */

const RANDOM_EVENTS = [
  {
    id: 'temple',
    weight: 12,
    title: 'Ancient Temple',
    body: 'You find a crumbling temple. You pray at the altar. A warm light fills you.',
  },
  {
    id: 'trap',
    weight: 10,
    title: 'Hidden Trap',
    body: 'A hidden pit gives way. You fall and land hard.',
  },
  {
    id: 'witch',
    weight: 8,
    title: 'The Witch',
    body: 'A witch blocks your path and curses you with a cackle.',
  },
  {
    id: 'dungeon',
    weight: 12,
    title: 'Small Dungeon',
    body: 'You discover a small dungeon. A chest sits in the corner.',
  },
  {
    id: 'devil',
    weight: 6,
    title: 'The Devil\'s Offer',
    body: 'A small devil offers a blade. "Power for a price," it hisses.',
    choices: ['Take the blade', 'Refuse'],
  },
  {
    id: 'mentor',
    weight: 10,
    title: 'The Mentor',
    body: 'A seasoned warrior offers to train you.',
    choices: ['+3 Strength', '+3 Health', '+3 Mana', '+3 Defense'],
  },
  {
    id: 'priest',
    weight: 8,
    title: 'Holy Light',
    body: 'A priest teaches you a prayer of light.',
  },
  {
    id: 'robber',
    weight: 10,
    title: 'Pickpocket',
    body: 'A thief dashes past. Your purse feels lighter.',
  },
  {
    id: 'legendaryMerchant',
    weight: 6,
    title: 'Legendary Merchant',
    body: 'A cloaked figure steps from the shadows. "I deal only in the finest wares." Three legendary items are laid out before you.',
    isMerchant: true,
  },
  {
    id: 'skillPointShrine',
    weight: 5,
    title: 'Shrine of Wisdom',
    body: 'You find a shrine of wisdom. Your mind sharpens.',
  },
];

/** Legendary item ids for Legendary Merchant event (3 random). */
const LEGENDARY_MERCHANT_POOL = [
  'legendary-sword', 'legendary-armor', 'legendary-ring', 'legendary-amulet',
  'health-potion-legendary', 'mana-potion-legendary', 'cursed-demon-blade',
];
