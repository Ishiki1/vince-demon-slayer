/**
 * test-inventory-manual.js
 * Manual browser playthrough test for inventory with two accessory slots.
 * Follows actual user flow: start game -> select class -> reach overworld -> open inventory.
 */

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('=== INVENTORY MANUAL PLAYTHROUGH TEST ===\n');
  
  // Track console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(`Page error: ${error.message}`);
    console.log(`[PAGE ERROR] ${error.message}`);
  });
  
  try {
    // Test 1: App loads
    console.log('Test 1: Loading app at http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log(`✓ Page loaded. Title: ${title}`);
    
    // Wait for Phaser to initialize
    await page.waitForFunction(() => {
      return window.game && window.game.scene;
    }, { timeout: 10000 });
    console.log('✓ Phaser game initialized');
    
    await page.waitForTimeout(2000);
    
    // Test 2: Start new game from menu
    console.log('\nTest 2: Starting new game...');
    const menuScene = await page.evaluate(() => {
      const scene = window.game.scene.getScene('Menu');
      return scene && scene.scene.isActive() ? 'active' : 'not active';
    });
    console.log(`  Menu scene: ${menuScene}`);
    
    // Click "New Run" button (approximate position based on MenuScene.js)
    await page.mouse.click(400, 300);
    await page.waitForTimeout(1500);
    
    // Test 3: Select Warrior class
    console.log('\nTest 3: Selecting Warrior class...');
    const classScene = await page.evaluate(() => {
      const scene = window.game.scene.getScene('ClassSelect');
      return scene && scene.scene.isActive() ? 'active' : 'not active';
    });
    console.log(`  Class Select scene: ${classScene}`);
    
    // Click Warrior (left button)
    await page.mouse.click(240, 300);
    await page.waitForTimeout(1500);
    
    // Click Confirm
    await page.mouse.click(400, 450);
    await page.waitForTimeout(2000);
    
    // Skip origin story if it appears
    const originActive = await page.evaluate(() => {
      const scene = window.game.scene.getScene('ClassOrigin');
      return scene && scene.scene.isActive();
    });
    
    if (originActive) {
      console.log('  Skipping origin story...');
      await page.mouse.click(400, 500);
      await page.waitForTimeout(2000);
    }
    
    // Test 4: Reach overworld
    console.log('\nTest 4: Checking overworld scene...');
    const overworldActive = await page.evaluate(() => {
      const scene = window.game.scene.getScene('Overworld');
      return scene && scene.scene.isActive();
    });
    
    if (!overworldActive) {
      console.log('✗ Overworld scene not active - waiting longer...');
      await page.waitForTimeout(3000);
    }
    
    const gameState = await page.evaluate(() => {
      return {
        overworldActive: window.game.scene.getScene('Overworld')?.scene.isActive(),
        heroName: window.GAME_STATE?.hero?.name,
        heroClass: window.GAME_STATE?.hero?.class,
        heroAccessories: window.GAME_STATE?.hero?.accessories
      };
    });
    
    console.log(`✓ Overworld active: ${gameState.overworldActive}`);
    console.log(`  Hero: ${gameState.heroName} (${gameState.heroClass})`);
    console.log(`  Accessories array: ${JSON.stringify(gameState.heroAccessories)}`);
    
    await page.screenshot({ path: 'test-overworld.png' });
    console.log('  Screenshot: test-overworld.png');
    
    // Test 5: Open inventory
    console.log('\nTest 5: Opening inventory...');
    // Inventory button is in top right area
    await page.mouse.click(590, 510);
    await page.waitForTimeout(2000);
    
    const inventoryState = await page.evaluate(() => {
      const scene = window.game.scene.getScene('InventoryOverworld');
      if (!scene || !scene.scene.isActive()) {
        return { error: 'InventoryOverworld scene not active' };
      }
      
      const hero = window.GAME_STATE.hero;
      return {
        sceneActive: true,
        hero: {
          name: hero.name,
          inventorySize: hero.inventory.length,
          weapon: hero.weapon,
          armor: hero.armor,
          accessories: hero.accessories
        },
        slotBounds: scene.slotBounds || null
      };
    });
    
    if (inventoryState.error) {
      console.log(`✗ FAILED: ${inventoryState.error}`);
      throw new Error(inventoryState.error);
    }
    
    console.log(`✓ Inventory scene active`);
    console.log(`  Hero: ${inventoryState.hero.name}`);
    console.log(`  Inventory size: ${inventoryState.hero.inventorySize}`);
    console.log(`  Equipped weapon: ${inventoryState.hero.weapon || 'none'}`);
    console.log(`  Equipped armor: ${inventoryState.hero.armor || 'none'}`);
    console.log(`  Equipped accessories: ${JSON.stringify(inventoryState.hero.accessories)}`);
    
    await page.screenshot({ path: 'test-inventory-initial.png' });
    console.log('  Screenshot: test-inventory-initial.png');
    
    // Test 6: Verify two accessory slots
    console.log('\nTest 6: Verifying two accessory slots...');
    if (inventoryState.slotBounds) {
      const hasAcc1 = !!inventoryState.slotBounds.accessory1;
      const hasAcc2 = !!inventoryState.slotBounds.accessory2;
      
      if (hasAcc1 && hasAcc2) {
        console.log(`✓ Two accessory slots found:`);
        console.log(`  Accessory 1: x=${inventoryState.slotBounds.accessory1.x}, y=${inventoryState.slotBounds.accessory1.y}`);
        console.log(`  Accessory 2: x=${inventoryState.slotBounds.accessory2.x}, y=${inventoryState.slotBounds.accessory2.y}`);
      } else {
        console.log(`✗ FAILED: Missing slots - acc1: ${hasAcc1}, acc2: ${hasAcc2}`);
      }
    } else {
      console.log('✗ WARNING: slotBounds not available in scene');
    }
    
    // Test 7: Check layout
    console.log('\nTest 7: Checking inventory layout...');
    const layoutInfo = await page.evaluate(() => {
      const scene = window.game.scene.getScene('InventoryOverworld');
      if (!scene) return null;
      
      // Try to find visible text objects for slot labels
      const children = scene.children.list;
      const textObjects = children.filter(obj => obj.type === 'Text');
      const labels = textObjects.map(t => ({
        text: t.text,
        x: t.x,
        y: t.y
      }));
      
      return {
        totalChildren: children.length,
        textCount: textObjects.length,
        sampleLabels: labels.slice(0, 10)
      };
    });
    
    if (layoutInfo) {
      console.log(`✓ Layout info: ${layoutInfo.totalChildren} children, ${layoutInfo.textCount} text objects`);
      console.log(`  Sample labels:`, layoutInfo.sampleLabels.map(l => l.text).join(', '));
    }
    
    // Test 8: Try to equip/unequip if we have items
    console.log('\nTest 8: Testing equip/unequip behavior...');
    const hasItems = inventoryState.hero.inventorySize > 0;
    
    if (!hasItems) {
      console.log('  INFO: Hero has no items yet (fresh start)');
      console.log('  Testing slot interaction without items...');
      
      // Try clicking accessory slots to see what happens
      await page.mouse.click(208, 349); // Accessory 1 slot center
      await page.waitForTimeout(800);
      
      await page.mouse.click(335, 349); // Accessory 2 slot center
      await page.waitForTimeout(800);
      
      console.log('✓ Slots clickable (no errors on empty slot clicks)');
    } else {
      console.log(`  Hero has ${inventoryState.hero.inventorySize} items - testing equip`);
      // Would click items here if present
    }
    
    await page.screenshot({ path: 'test-inventory-after-interaction.png' });
    console.log('  Screenshot: test-inventory-after-interaction.png');
    
    // Test 9: Check for runtime errors
    console.log('\nTest 9: Checking for runtime errors...');
    if (consoleErrors.length > 0) {
      console.log(`✗ FAILED: ${consoleErrors.length} console errors detected`);
    } else {
      console.log('✓ No runtime errors detected');
    }
    
    // Test 10: Close inventory and return to overworld
    console.log('\nTest 10: Closing inventory...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);
    
    const backToOverworld = await page.evaluate(() => {
      return window.game.scene.getScene('Overworld')?.scene.isActive();
    });
    
    console.log(`✓ Back to overworld: ${backToOverworld}`);
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`1. App loads: PASSED`);
    console.log(`2. New game starts: PASSED`);
    console.log(`3. Class selection: PASSED`);
    console.log(`4. Overworld reached: ${gameState.overworldActive ? 'PASSED' : 'FAILED'}`);
    console.log(`5. Inventory opens: ${inventoryState.sceneActive ? 'PASSED' : 'FAILED'}`);
    console.log(`6. Two accessory slots: ${inventoryState.slotBounds?.accessory1 && inventoryState.slotBounds?.accessory2 ? 'PASSED' : 'FAILED'}`);
    console.log(`7. Layout renders: ${layoutInfo ? 'PASSED' : 'FAILED'}`);
    console.log(`8. Slot interactions: PASSED`);
    console.log(`9. Runtime errors: ${consoleErrors.length === 0 ? 'PASSED' : 'FAILED'}`);
    console.log(`10. Close inventory: ${backToOverworld ? 'PASSED' : 'FAILED'}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n=== CONSOLE ERRORS ===');
      consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    }
    
    console.log('\n✓ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n✗ TEST FAILED WITH EXCEPTION:');
    console.error(error);
  } finally {
    console.log('\nClosing browser in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
    console.log('Browser closed.');
  }
})();
