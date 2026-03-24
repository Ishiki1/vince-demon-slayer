# Test Case: Frost Spider

## Creature Description
A large ice-covered spider with crystalline legs, glowing pale-blue eyes, and frost particles drifting from its body. Eight thin segmented legs with icy tips. Dark blue-gray carapace coated in frost. Roughly the size of a large dog.

## Why This Tests the Skill
- **Thin legs**: Tests whether green cleanup preserves fine detail. Eight thin crystalline legs are easy to lose during flood-fill green removal -- any aggressive threshold will eat into the leg pixels.
- **Attack direction**: A lunging/pouncing spider is a classic case where the image generator wants to show the spider jumping "at the viewer" or to the right. The skill must enforce leftward lunge.
- **Idle subtlety**: A spider's idle is subtle -- slight leg twitches, frost particle drift, body pulsing. Tests whether the prompt describes enough micro-motion for a convincing idle loop.
- **Frame count stress**: With 8 legs moving, more frames may be needed for smooth motion. Tests whether the frame count guidance produces fluid multi-limb animation.

## Goon Definition

| Field | Value |
|-------|-------|
| goonType | `'spider'` |
| Display name | `'Frost Spider'` |
| hpMult | `1.2` |
| dmgMult | `0.8` |
| Skill id | `'frost-web-skill'` |
| Skill effect | `weakenHero` |
| Skill schedule | `{ everyTurns: 3, firstUseTurn: 2 }` |
| Spawn weight | `12` |

## Attack Type
Lunging bite -- the spider crouches, then launches its body forward (toward the LEFT) with mandibles extended, snapping at the target, then recoils back to resting position.

## Expected Dry-Run Coverage
The dry-run should show:
1. A reference prompt that describes the frost spider's crystalline legs and ice details
2. An idle prompt with 8-leg micro-motion described per frame
3. An attack prompt where EVERY frame description says the spider faces/lunges LEFT
4. Processing commands with correct grid dimensions matching the requested frame count
5. A post-cleanup check specifically noting thin-leg preservation
6. All 5 code insertion points with `spider` as the goonType
7. Data registration with the stats above
