# Test Case: Stone Golem

## Creature Description
A massive humanoid figure made of cracked granite and dark stone, with glowing orange magma visible through the cracks. Thick, heavy limbs, broad shoulders, small glowing orange eyes. No neck -- the head merges into the torso. Chunks of rock float near its shoulders. Much larger and bulkier than existing goons.

## Why This Tests the Skill
- **Very different proportions**: Existing goons (toad, mushroom, plant) are compact or organic. The golem is tall, wide, and geometric. Tests whether the skill's prompts adapt to radically different body shapes or assume a default creature silhouette.
- **Earth tones near outline**: Dark stone coloring is close to the thick black outline color. Tests whether the cleanup and processing preserve the outline distinction, and whether the skill warns about dark-creature-on-outline blending.
- **Melee slam attack**: No projectile -- the golem raises both fists and slams downward/forward toward the LEFT. This is a pure body-motion attack, which tests whether the attack prompt template handles non-projectile attacks. The "toward the left" direction must be conveyed through body lean and arm extension, not a flying object.
- **Frame count for heavy motion**: A massive creature slamming needs enough frames for the weight to read. Too few frames and the slam looks instant and weightless. Tests whether frame count guidance accounts for creature mass and attack style.

## Goon Definition

| Field | Value |
|-------|-------|
| goonType | `'golem'` |
| Display name | `'Stone Golem'` |
| hpMult | `2.0` |
| dmgMult | `0.7` |
| Skill id | `'quake-slam-skill'` |
| Skill effect | `clearHeroCombatBuffs` |
| Skill schedule | `{ everyTurns: 4, firstUseTurn: 3 }` |
| Spawn weight | `8` |

## Attack Type
Ground slam -- the golem raises both massive fists overhead, leans forward toward the LEFT, and slams fists into the ground, creating a shockwave. Rocks/debris scatter. Then slowly rises back to standing pose.

## Expected Dry-Run Coverage
The dry-run should show:
1. A reference prompt that describes the golem's massive proportions, magma cracks, and floating rock chunks
2. An idle prompt with heavy, slow breathing motion -- subtle rock-chunk floating, magma glow pulsing, slight body sway conveying immense weight
3. An attack prompt where the slam motion goes toward the LEFT (body leans left, fists extend left-and-down), with enough frames for the weight to read
4. Processing commands with grid dimensions matching a potentially larger frame count
5. Post-cleanup check for dark-stone vs black-outline separation
6. All code insertion points with `golem` as the goonType
7. Consideration of whether the golem's bulk needs different display sizing or if the standard enemyW/enemyH works
