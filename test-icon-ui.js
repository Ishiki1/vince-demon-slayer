/**
 * Playwright test script for Vince icon-first UI verification
 * Tests combat skill buttons and skill tree icons with hover behavior
 */

const { chromium } = require('playwright');

const TEST_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    combatSkillIcons: { status: 'Failed', details: '' },
    combatSkillHover: { status: 'Failed', details: '' },
    skillTreeActiveIcons: { status: 'Failed', details: '' },
    skillTreePassiveIcons: { status: 'Failed', details: '' },
    skillTreeHover: { status: 'Failed', details: '' },
  };

  try {
    console.log('Navigating to', TEST_URL);
    await page.goto(TEST_URL);
    await sleep(2000);

    // Wait for Phaser to load
    console.log('Waiting for game to initialize...');
    await page.waitForFunction(() => window.game && window.GAME_STATE, { timeout: 10000 });
    await sleep(1000);

    // Setup: create a warrior hero with multiple skills to test in combat
    console.log('Setting up test hero with combat skills...');
    await page.evaluate(() => {
      const hero = {
        name: 'TestVince',
        class: 'warrior',
        level: 5,
        xp: 0,
        xpForNextLevel: 100,
        skillPoints: 0,
        strength: 10,
        defense: 5,
        intelligence: 0,
        maxHealth: 50,
        currentHealth: 50,
        maxMana: 20,
        currentMana: 20,
        evasion: 0,
        gold: 100,
        inventory: [],
        skills: ['slash', 'heavyStrike', 'execute', 'ironSkin', 'holyLight'],
        passives: [],
        lockedSkillId: null,
        refillCombatStats() {
          this.currentHealth = this.maxHealth;
          this.currentMana = this.maxMana;
        },
      };
      window.GAME_STATE = { hero, day: 1 };
      window.game.scene.start('Combat', { enemyDef: { name: 'TestGoblin', health: 20, damage: 5, defense: 2, xp: 10 } });
    });

    await sleep(2000);

    // TEST 1: Verify combat skill buttons render with icons
    console.log('\n=== TEST 1: Combat Skill Button Icons ===');
    const combatIconCheck = await page.evaluate(() => {
      const scene = window.game.scene.getScene('Combat');
      if (!scene || !scene.skillButtons) return { found: false, reason: 'No skill buttons found' };
      
      const buttons = scene.skillButtons;
      if (!buttons || typeof buttons !== 'object') return { found: false, reason: 'skillButtons not accessible' };
      
      // Try to check if icons exist in the scene
      const children = scene.children.list;
      const iconImages = children.filter(child => 
        child.type === 'Image' && 
        child.texture && 
        child.texture.key && 
        child.texture.key.startsWith('button-')
      );
      
      return {
        found: iconImages.length > 0,
        iconCount: iconImages.length,
        iconKeys: iconImages.map(img => img.texture.key),
        totalChildren: children.length,
      };
    });

    if (combatIconCheck.found && combatIconCheck.iconCount >= 3) {
      results.combatSkillIcons.status = 'Passed';
      results.combatSkillIcons.details = `Found ${combatIconCheck.iconCount} skill icons: ${combatIconCheck.iconKeys.join(', ')}`;
      console.log('✓ PASSED:', results.combatSkillIcons.details);
    } else {
      results.combatSkillIcons.details = `Expected multiple skill icons, found ${combatIconCheck.iconCount}. Icons: ${combatIconCheck.iconKeys.join(', ')}`;
      console.log('✗ FAILED:', results.combatSkillIcons.details);
    }

    // TEST 2: Verify combat skill hover behavior (icon grows and tooltip appears)
    console.log('\n=== TEST 2: Combat Skill Hover Behavior ===');
    
    // Find a skill button on canvas
    const skillButtonLocation = await page.evaluate(() => {
      const scene = window.game.scene.getScene('Combat');
      if (!scene) return null;
      
      const children = scene.children.list;
      const iconImage = children.find(child => 
        child.type === 'Image' && 
        child.texture && 
        child.texture.key && 
        child.texture.key.startsWith('button-')
      );
      
      if (!iconImage) return null;
      
      // Get canvas position
      const canvas = window.game.canvas;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      return {
        x: rect.left + iconImage.x / scaleX,
        y: rect.top + iconImage.y / scaleY,
        originalWidth: iconImage.displayWidth,
        originalHeight: iconImage.displayHeight,
      };
    });

    if (skillButtonLocation) {
      await page.mouse.move(skillButtonLocation.x, skillButtonLocation.y);
      await sleep(500);

      const hoverCheck = await page.evaluate((origWidth, origHeight) => {
        const scene = window.game.scene.getScene('Combat');
        if (!scene) return { scaled: false, tooltip: false };
        
        const children = scene.children.list;
        const iconImage = children.find(child => 
          child.type === 'Image' && 
          child.texture && 
          child.texture.key && 
          child.texture.key.startsWith('button-')
        );
        
        const tooltip = children.find(child => 
          child.type === 'Text' && 
          child.visible &&
          child.depth === 20
        );
        
        return {
          scaled: iconImage && (iconImage.displayWidth > origWidth || iconImage.displayHeight > origHeight),
          tooltip: !!tooltip,
          tooltipText: tooltip ? tooltip.text : '',
          newWidth: iconImage ? iconImage.displayWidth : 0,
          newHeight: iconImage ? iconImage.displayHeight : 0,
        };
      }, skillButtonLocation.originalWidth, skillButtonLocation.originalHeight);

      if (hoverCheck.scaled && hoverCheck.tooltip) {
        results.combatSkillHover.status = 'Passed';
        results.combatSkillHover.details = `Icon grew on hover (${skillButtonLocation.originalWidth}→${hoverCheck.newWidth}) and tooltip appeared: "${hoverCheck.tooltipText.substring(0, 50)}..."`;
        console.log('✓ PASSED:', results.combatSkillHover.details);
      } else if (hoverCheck.scaled) {
        results.combatSkillHover.status = 'Partial';
        results.combatSkillHover.details = `Icon grew on hover but no tooltip found`;
        console.log('⚠ PARTIAL:', results.combatSkillHover.details);
      } else if (hoverCheck.tooltip) {
        results.combatSkillHover.status = 'Partial';
        results.combatSkillHover.details = `Tooltip appeared but icon did not grow (${skillButtonLocation.originalWidth} vs ${hoverCheck.newWidth})`;
        console.log('⚠ PARTIAL:', results.combatSkillHover.details);
      } else {
        results.combatSkillHover.details = `No hover effect detected (size: ${skillButtonLocation.originalWidth} vs ${hoverCheck.newWidth}, tooltip: ${hoverCheck.tooltip})`;
        console.log('✗ FAILED:', results.combatSkillHover.details);
      }

      await page.mouse.move(0, 0);
      await sleep(300);
    } else {
      results.combatSkillHover.details = 'Could not locate skill button to test hover';
      console.log('✗ FAILED:', results.combatSkillHover.details);
    }

    // Navigate to skill tree to test tree icons
    console.log('\n=== Navigating to Skill Tree ===');
    await page.evaluate(() => {
      const hero = window.GAME_STATE.hero;
      hero.skillPoints = 5;
      hero.level = 3;
      window.game.scene.start('SkillTree', { from: 'overworld' });
    });

    await sleep(2000);

    // TEST 3: Verify skill tree active skill icons
    console.log('\n=== TEST 3: Skill Tree Active Skill Icons ===');
    const activeIconCheck = await page.evaluate(() => {
      const scene = window.game.scene.getScene('SkillTree');
      if (!scene) return { found: false, reason: 'Skill tree scene not found' };
      
      const children = scene.children.list;
      const activeText = children.find(child => 
        child.type === 'Text' && 
        child.text && 
        child.text.includes('Active skills')
      );
      
      if (!activeText) return { found: false, reason: 'Active skills header not found' };
      
      // Find icon images near the active skills section
      const activeIcons = children.filter(child => 
        child.type === 'Image' && 
        child.texture && 
        child.texture.key && 
        (child.texture.key.startsWith('button-') || child.texture.key.startsWith('passive-')) &&
        child.x < 400 && // Left column
        child.y > 130 && child.y < 400
      );
      
      return {
        found: activeIcons.length > 0,
        iconCount: activeIcons.length,
        iconKeys: activeIcons.map(img => img.texture.key),
      };
    });

    if (activeIconCheck.found && activeIconCheck.iconCount > 0) {
      results.skillTreeActiveIcons.status = 'Passed';
      results.skillTreeActiveIcons.details = `Found ${activeIconCheck.iconCount} active skill icons: ${activeIconCheck.iconKeys.join(', ')}`;
      console.log('✓ PASSED:', results.skillTreeActiveIcons.details);
    } else {
      results.skillTreeActiveIcons.details = `Expected active skill icons, found ${activeIconCheck.iconCount}`;
      console.log('✗ FAILED:', results.skillTreeActiveIcons.details);
    }

    // TEST 4: Verify skill tree passive skill icons
    console.log('\n=== TEST 4: Skill Tree Passive Skill Icons ===');
    const passiveIconCheck = await page.evaluate(() => {
      const scene = window.game.scene.getScene('SkillTree');
      if (!scene) return { found: false, reason: 'Skill tree scene not found' };
      
      const children = scene.children.list;
      const passiveText = children.find(child => 
        child.type === 'Text' && 
        child.text && 
        child.text.includes('Passive skills')
      );
      
      if (!passiveText) return { found: false, reason: 'Passive skills header not found' };
      
      // Find icon images near the passive skills section
      const passiveIcons = children.filter(child => 
        child.type === 'Image' && 
        child.texture && 
        child.texture.key && 
        (child.texture.key.startsWith('button-') || child.texture.key.startsWith('passive-')) &&
        child.x > 400 && // Right column
        child.y > 130 && child.y < 400
      );
      
      return {
        found: passiveIcons.length > 0,
        iconCount: passiveIcons.length,
        iconKeys: passiveIcons.map(img => img.texture.key),
      };
    });

    if (passiveIconCheck.found && passiveIconCheck.iconCount > 0) {
      results.skillTreePassiveIcons.status = 'Passed';
      results.skillTreePassiveIcons.details = `Found ${passiveIconCheck.iconCount} passive skill icons: ${passiveIconCheck.iconKeys.join(', ')}`;
      console.log('✓ PASSED:', results.skillTreePassiveIcons.details);
    } else {
      results.skillTreePassiveIcons.details = `Expected passive skill icons, found ${passiveIconCheck.iconCount}`;
      console.log('✗ FAILED:', results.skillTreePassiveIcons.details);
    }

    // TEST 5: Verify skill tree icon hover behavior
    console.log('\n=== TEST 5: Skill Tree Icon Hover Behavior ===');
    
    const treeIconLocation = await page.evaluate(() => {
      const scene = window.game.scene.getScene('SkillTree');
      if (!scene) return null;
      
      const children = scene.children.list;
      const iconImage = children.find(child => 
        child.type === 'Image' && 
        child.texture && 
        child.texture.key && 
        (child.texture.key.startsWith('button-') || child.texture.key.startsWith('passive-'))
      );
      
      if (!iconImage) return null;
      
      const canvas = window.game.canvas;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      return {
        x: rect.left + iconImage.x / scaleX,
        y: rect.top + iconImage.y / scaleY,
        originalWidth: iconImage.displayWidth,
        originalHeight: iconImage.displayHeight,
      };
    });

    if (treeIconLocation) {
      await page.mouse.move(treeIconLocation.x, treeIconLocation.y);
      await sleep(500);

      const treeHoverCheck = await page.evaluate((origWidth, origHeight) => {
        const scene = window.game.scene.getScene('SkillTree');
        if (!scene) return { scaled: false, tooltip: false };
        
        const children = scene.children.list;
        const iconImage = children.find(child => 
          child.type === 'Image' && 
          child.texture && 
          child.texture.key && 
          (child.texture.key.startsWith('button-') || child.texture.key.startsWith('passive-'))
        );
        
        const tooltip = children.find(child => 
          child.type === 'Text' && 
          child.visible &&
          child.depth === 20
        );
        
        return {
          scaled: iconImage && (iconImage.displayWidth > origWidth || iconImage.displayHeight > origHeight),
          tooltip: !!tooltip,
          tooltipText: tooltip ? tooltip.text : '',
          newWidth: iconImage ? iconImage.displayWidth : 0,
        };
      }, treeIconLocation.originalWidth, treeIconLocation.originalHeight);

      if (treeHoverCheck.scaled && treeHoverCheck.tooltip) {
        results.skillTreeHover.status = 'Passed';
        results.skillTreeHover.details = `Icon grew on hover (${treeIconLocation.originalWidth}→${treeHoverCheck.newWidth}) and tooltip appeared: "${treeHoverCheck.tooltipText.substring(0, 50)}..."`;
        console.log('✓ PASSED:', results.skillTreeHover.details);
      } else if (treeHoverCheck.scaled) {
        results.skillTreeHover.status = 'Partial';
        results.skillTreeHover.details = `Icon grew on hover but no tooltip found`;
        console.log('⚠ PARTIAL:', results.skillTreeHover.details);
      } else if (treeHoverCheck.tooltip) {
        results.skillTreeHover.status = 'Partial';
        results.skillTreeHover.details = `Tooltip appeared but icon did not grow`;
        console.log('⚠ PARTIAL:', results.skillTreeHover.details);
      } else {
        results.skillTreeHover.details = `No hover effect detected`;
        console.log('✗ FAILED:', results.skillTreeHover.details);
      }
    } else {
      results.skillTreeHover.details = 'Could not locate tree icon to test hover';
      console.log('✗ FAILED:', results.skillTreeHover.details);
    }

  } catch (error) {
    console.error('Test execution error:', error);
    throw error;
  } finally {
    await sleep(1000);
    await browser.close();
  }

  return results;
}

// Run and report
runTests().then(results => {
  console.log('\n' + '='.repeat(60));
  console.log('TEST REPORT: Vince Icon-First UI Verification');
  console.log('='.repeat(60));
  console.log('\n1. Combat Skill Icons:', results.combatSkillIcons.status);
  console.log('   ', results.combatSkillIcons.details);
  console.log('\n2. Combat Skill Hover:', results.combatSkillHover.status);
  console.log('   ', results.combatSkillHover.details);
  console.log('\n3. Skill Tree Active Icons:', results.skillTreeActiveIcons.status);
  console.log('   ', results.skillTreeActiveIcons.details);
  console.log('\n4. Skill Tree Passive Icons:', results.skillTreePassiveIcons.status);
  console.log('   ', results.skillTreePassiveIcons.details);
  console.log('\n5. Skill Tree Hover:', results.skillTreeHover.status);
  console.log('   ', results.skillTreeHover.details);
  console.log('\n' + '='.repeat(60));
  
  const allPassed = Object.values(results).every(r => r.status === 'Passed');
  process.exit(allPassed ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
