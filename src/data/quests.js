/**
 * quests.js
 * Lightweight quest definitions and helpers for tavern NPC quests.
 */

const QUESTS = {
  'herb-medicine': {
    id: 'herb-medicine',
    name: 'Medicine for a Friend',
    giver: 'center-table',
    giverName: 'Wounded Traveler',
    description: 'A wounded traveler at the tavern needs a Moonpetal to brew medicine for his injured friend.',
    acceptText: 'Please, I need a Moonpetal from the witch\'s dungeon.\nMy friend is badly hurt and only that herb can save him.\nI\'ll make it worth your while.',
    reminderText: 'Have you found a Moonpetal yet?\nPlease hurry — my friend doesn\'t have much time.',
    turnInText: 'You found one! Thank you so much.\nTake these — they\'ve served me well on the road.\nMay they serve you even better.',
    objective: { type: 'deliverHerb', herbId: 'moonpetal', count: 1 },
    rewardItemId: 'sunglasses-of-true-sight',
    rewardText: 'Received: Sunglasses of True Sight',
  },
};

function getQuestById(questId) {
  return QUESTS[questId] || null;
}

function getAvailableQuests(gameState) {
  if (!gameState) return [];
  const completed = gameState.completedQuestIds || [];
  const activeId = gameState.activeQuestId;
  return Object.values(QUESTS).filter(
    (q) => !completed.includes(q.id) && q.id !== activeId
  );
}

function getAvailableQuestForGiver(gameState, giverId) {
  return getAvailableQuests(gameState).find((q) => q.giver === giverId) || null;
}

function getActiveQuest(gameState) {
  if (!gameState || !gameState.activeQuestId) return null;
  return QUESTS[gameState.activeQuestId] || null;
}

function canCompleteQuest(hero, quest) {
  if (!hero || !quest || !quest.objective) return false;
  if (quest.objective.type === 'deliverHerb') {
    const herbId = quest.objective.herbId;
    const needed = quest.objective.count || 1;
    if (!hero.inventory || !Array.isArray(hero.inventory)) return false;
    const count = hero.inventory.filter(
      (slot) => slot && slot.itemId === herbId && slot.durability > 0
    ).length;
    return count >= needed;
  }
  return false;
}

function completeQuest(hero, quest) {
  if (!hero || !quest || !quest.objective) return false;
  if (quest.objective.type === 'deliverHerb') {
    const herbId = quest.objective.herbId;
    const needed = quest.objective.count || 1;
    let removed = 0;
    for (let i = 0; i < hero.inventory.length && removed < needed; i++) {
      if (hero.inventory[i] && hero.inventory[i].itemId === herbId && hero.inventory[i].durability > 0) {
        if (typeof InventorySystem !== 'undefined') {
          InventorySystem.remove(hero, hero.inventory[i].id);
        } else {
          hero.inventory.splice(i, 1);
          i--;
        }
        removed++;
      }
    }
  }
  if (quest.rewardItemId && typeof InventorySystem !== 'undefined') {
    InventorySystem.add(hero, quest.rewardItemId);
  }
  GAME_STATE.activeQuestId = null;
  if (!Array.isArray(GAME_STATE.completedQuestIds)) GAME_STATE.completedQuestIds = [];
  GAME_STATE.completedQuestIds.push(quest.id);
  return true;
}
