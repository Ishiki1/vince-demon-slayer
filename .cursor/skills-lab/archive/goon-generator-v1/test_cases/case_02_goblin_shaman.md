# Test Case: Goblin Shaman

## Creature Description
A hunched green-skinned goblin wearing a tattered robe and bone necklace, clutching a gnarled wooden staff topped with a glowing purple crystal. Yellow eyes, pointed ears, sharp teeth visible in a snarl. The staff crystal emits faint purple wisps of magical energy.

## Why This Tests the Skill
- **Green creature on green background**: The goblin has green skin on a green (#00FF00) background. This is the hardest cleanup scenario -- the flood-fill must distinguish creature green from background green. Tests whether the skill warns about this edge case and provides threshold guidance.
- **Held item consistency**: The staff must appear in every single frame of both idle and attack sheets, in the same hand, at consistent relative position. Image generators frequently drop or move held items between frames.
- **Spell attack direction**: The attack is a magical projectile launched from the staff. The projectile must travel toward the LEFT. This tests whether the prompt describes projectile direction explicitly enough to prevent the common "projectile going right" failure.
- **Complex idle**: Staff crystal glow pulsing adds a second layer of idle motion beyond body breathing. Tests prompt detail for multi-element idle animation.

## Goon Definition

| Field | Value |
|-------|-------|
| goonType | `'shaman'` |
| Display name | `'Goblin Shaman'` |
| hpMult | `0.9` |
| dmgMult | `1.1` |
| Skill id | `'hex-bolt-skill'` |
| Skill effect | `vulnerableHero` |
| Skill schedule | `{ everyTurns: 2, firstUseTurn: 1 }` |
| Spawn weight | `10` |

## Attack Type
Spell cast -- the shaman raises the staff high, the crystal flares with energy, then a bolt of purple magic fires from the staff tip toward the LEFT, the shaman staggers back slightly from the recoil.

## Expected Dry-Run Coverage
The dry-run should show:
1. A reference prompt that describes the green skin, staff, and crystal clearly
2. Special handling for green-on-green cleanup (threshold guidance, post-cleanup verification for green skin preservation vs background removal)
3. An idle prompt with staff-crystal glow pulsing described alongside body breathing
4. An attack prompt where the spell bolt explicitly fires toward the LEFT edge in every relevant frame
5. Verification that the staff appears consistently across all frames
6. Post-cleanup check specifically for green skin vs green background separation
7. All code insertion points with `shaman` as the goonType
