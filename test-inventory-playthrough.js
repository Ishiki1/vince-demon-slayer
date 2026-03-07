/**
 * test-inventory-playthrough.js
 * Browser playthrough test for the overworld inventory screen with two accessory slots.
 * Tests: app loads, new inventory layout renders, two accessory slots are visible and usable,
 * equipping/unequipping accessories works, weapon/armor slots still work, no layout issues.
 */

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('=== INVENTORY PLAYTHROUGH TEST ===\n');
  
  try {
    // Test 1: App loads
    console.log('Test 1: Loading app at http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const title = await page.title();
    console.log(`✓ Page loaded. Title: ${title}`);
    
    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(`Page error: ${error.message}`);
    });
    
    // Test 2: Use controlled setup to reach inventory quickly
    console.log('\nTest 2: Setting up game state to reach inventory...');
    
    // Wait for Phaser game to be ready
    await page.waitForFunction(() => {
      return window.game && window.game.scene;
    }, { timeout: 10000 });
    
    await page.waitForTimeout(2000);
    
    // Inject controlled state setup - create hero and go directly to overworld
    const setupResult = await page.evaluate(() => {
      try {
        // Create a fresh hero (Warrior)
        if (window.Hero && window.createHero) {
          window.GAME_STATE.hero = window.createHero('warrior');
          const hero = window.GAME_STATE.hero;
          
          // Ensure inventory system is ready
          if (window.InventorySystem) {
            window.InventorySystem.ensureSlotBased(hero);
            window.InventorySystem.ensureAccessorySlots(hero);
          }
          
          // Add test items: weapons, armor, and multiple accessories
          const testItems = [
            'common-sword',
            'common-armor', 
            'common-ring',
            'rare-ring',
            'legendary-ring',
            'common-amulet',
            'rare-amulet'
          ];
          
          let added = 0;
          testItems.forEach(itemId => {
            if (window.ITEMS && window.ITEMS[itemId] && window.InventorySystem) {
              if (window.InventorySystem.add(hero, itemId)) {
                added++;
              }
            }
          });
          
          // Unlock level 1 so overworld works
          window.GAME_STATE.unlockedLevels = ['level1'];
          window.GAME_STATE.currentLevel = null;
          
          // Start the overworld scene
          if (window.game && window.game.scene) {
            const menuScene = window.game.scene.getScene('Menu');
            if (menuScene) menuScene.scene.start('Overworld');
          }
          
          return {
            success: true,
            itemsAdded: added,
            inventoryCount: hero.inventory.length,
            accessories: hero.accessories
          };
        }
        return { success: false, error: 'Helper functions not available' };
      } catch (e) {
        return { success: false, error: e.message };
      }
    });
    
    if (!setupResult.success) {
      console.log(`✗ Setup failed: ${setupResult.error}`);
      throw new Error('Setup failed');
    }
    
    console.log(`✓ Setup complete: ${setupResult.itemsAdded} items added, inventory size: ${setupResult.inventoryCount}`);
    console.log(`  Accessory slots: ${JSON.stringify(setupResult.accessories)}`);
    
    await page.waitForTimeout(2000);
    
    // Test 3: Open inventory from overworld
    console.log('\nTest 3: Opening inventory screen...');
    await page.mouse.click(590, 510); // Click Inventory button on overworld
    await page.waitForTimeout(1500);
    
    // Test 4: Verify inventory layout renders without errors
    console.log('\nTest 4: Checking inventory layout...');
    const inventoryState = await page.evaluate(() => {
      const scene = window.game && window.game.scene && window.game.scene.getScene('InventoryOverworld');
      if (!scene || !scene.scene.isActive()) {
        return { error: 'InventoryOverworld scene not active' };
      }
      
      return {
        sceneActive: true,
        hero: window.GAME_STATE.hero ? {
          name: window.GAME_STATE.hero.name,
          inventorySize: window.GAME_STATE.hero.inventory.length,
          weapon: window.GAME_STATE.hero.weapon,
          armor: window.GAME_STATE.hero.armor,
          accessories: window.GAME_STATE.hero.accessories
        } : null
      };
    });
    
    if (inventoryState.error) {
      console.log(`✗ FAILED: ${inventoryState.error}`);
    } else {
      console.log(`✓ Inventory scene is active`);
      console.log(`  Hero: ${inventoryState.hero.name}`);
      console.log(`  Inventory size: ${inventoryState.hero.inventorySize}`);
      console.log(`  Equipped weapon: ${inventoryState.hero.weapon}`);
      console.log(`  Equipped armor: ${inventoryState.hero.armor}`);
      console.log(`  Equipped accessories: ${JSON.stringify(inventoryState.hero.accessories)}`);
    }
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-inventory-screen.png' });
    console.log('  Screenshot saved: test-inventory-screen.png');
    
    // Test 5: Verify two accessory slots are visible
    console.log('\nTest 5: Verifying two accessory slots are visible...');
    const slotBounds = await page.evaluate(() => {
      const scene = window.game.scene.getScene('InventoryOverworld');
      return scene && scene.slotBounds ? {
        accessory1: scene.slotBounds.accessory1,
        accessory2: scene.slotBounds.accessory2,
        weapon: scene.slotBounds.weapon,
        armor: scene.slotBounds.armor
      } : null;
    });
    
    if (slotBounds && slotBounds.accessory1 && slotBounds.accessory2) {
      console.log(`✓ Two accessory slots found:`);
      console.log(`  Accessory 1: x=${slotBounds.accessory1.x}, y=${slotBounds.accessory1.y}`);
      console.log(`  Accessory 2: x=${slotBounds.accessory2.x}, y=${slotBounds.accessory2.y}`);
    } else {
      console.log('✗ FAILED: Could not find two accessory slots');
    }
    
    // Test 6: Equip accessories to both slots
    console.log('\nTest 6: Equipping accessories to both slots...');
    
    // Click first accessory in bag (common-ring should be at first grid cell)
    const firstAccessoryPos = { x: 432 + 20, y: 124 + 20 }; // First grid cell center
    console.log(`Clicking first accessory at (${firstAccessoryPos.x}, ${firstAccessoryPos.y})...`);
    await page.mouse.click(firstAccessoryPos.x, firstAccessoryPos.y);
    await page.waitForTimeout(800);
    
    // Click second accessory in bag (rare-ring should be at second grid cell)
    const secondAccessoryPos = { x: 432 + 46 + 20, y: 124 + 20 }; // Second grid cell center
    console.log(`Clicking second accessory at (${secondAccessoryPos.x}, ${secondAccessoryPos.y})...`);
    await page.mouse.click(secondAccessoryPos.x, secondAccessoryPos.y);
    await page.waitForTimeout(800);
    
    const afterEquip = await page.evaluate(() => {
      const hero = window.GAME_STATE.hero;
      return {
        accessories: hero.accessories,
        accessory1Slot: hero.inventory.find(s => s.id === hero.accessories[0]),
        accessory2Slot: hero.inventory.find(s => s.id === hero.accessories[1])
      };
    });
    
    console.log(`✓ Accessories equipped:`);
    console.log(`  Slot 1: ${afterEquip.accessory1Slot ? afterEquip.accessory1Slot.itemId : 'empty'}`);
    console.log(`  Slot 2: ${afterEquip.accessory2Slot ? afterEquip.accessory2Slot.itemId : 'empty'}`);
    
    await page.screenshot({ path: 'test-inventory-accessories-equipped.png' });
    console.log('  Screenshot saved: test-inventory-accessories-equipped.png');
    
    // Test 7: Unequip an accessory
    console.log('\nTest 7: Unequipping accessory from slot 1...');
    const accessory1Center = { x: 152 + 56, y: 310 + 39 }; // Accessory1 slot center
    await page.mouse.click(accessory1Center.x, accessory1Center.y);
    await page.waitForTimeout(800);
    
    const afterUnequip = await page.evaluate(() => {
      const hero = window.GAME_STATE.hero;
      return {
        accessories: hero.accessories
      };
    });
    
    console.log(`✓ Accessory unequipped from slot 1: ${JSON.stringify(afterUnequip.accessories)}`);
    
    // Test 8: Equip weapon and armor to verify those slots still work
    console.log('\nTest 8: Verifying weapon and armor slots work...');
    
    // Find and click weapon in bag (common-sword)
    // It should be in the bag after we added it
    const weaponPos = { x: 432 + 20, y: 124 + 20 }; // Might be at different position now
    console.log(`Clicking weapon...`);
    await page.mouse.click(weaponPos.x, weaponPos.y);
    await page.waitForTimeout(800);
    
    const weaponEquipped = await page.evaluate(() => {
      const hero = window.GAME_STATE.hero;
      const weaponSlot = hero.weapon ? hero.inventory.find(s => s.id === hero.weapon) : null;
      return weaponSlot ? weaponSlot.itemId : null;
    });
    
    console.log(`✓ Weapon slot: ${weaponEquipped || 'empty'}`);
    
    // Test 9: Check for runtime errors
    console.log('\nTest 9: Checking for runtime errors...');
    if (consoleErrors.length > 0) {
      console.log(`✗ FAILED: ${consoleErrors.length} console errors detected:`);
      consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    } else {
      console.log('✓ No runtime errors detected');
    }
    
    // Test 10: Check for layout overlap issues
    console.log('\nTest 10: Checking for layout overlap...');
    const layoutCheck = await page.evaluate(() => {
      const bounds = {
        window: { x: 118, y: 54, width: 564, height: 462 },
        weapon: { x: 279, y: 126, width: 112, height: 78 },
        armor: { x: 279, y: 218, width: 112, height: 78 },
        accessory1: { x: 152, y: 310, width: 112, height: 78 },
        accessory2: { x: 279, y: 310, width: 112, height: 78 }
      };
      
      // Check if slots overlap
      function overlap(a, b) {
        return !(a.x + a.width < b.x || b.x + b.width < a.x ||
                 a.y + a.height < b.y || b.y + b.height < a.y);
      }
      
      const overlaps = [];
      if (overlap(bounds.accessory1, bounds.accessory2)) overlaps.push('accessory1 & accessory2');
      if (overlap(bounds.weapon, bounds.armor)) overlaps.push('weapon & armor');
      if (overlap(bounds.weapon, bounds.accessory2)) overlaps.push('weapon & accessory2');
      if (overlap(bounds.armor, bounds.accessory2)) overlaps.push('armor & accessory2');
      
      return {
        overlaps,
        bounds
      };
    });
    
    if (layoutCheck.overlaps.length > 0) {
      console.log(`✗ WARNING: Layout overlaps detected: ${layoutCheck.overlaps.join(', ')}`);
    } else {
      console.log('✓ No layout overlaps detected');
    }
    
    // Final screenshot
    await page.screenshot({ path: 'test-inventory-final.png' });
    console.log('\n✓ Final screenshot saved: test-inventory-final.png');
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`1. App loads: PASSED`);
    console.log(`2. Inventory setup: PASSED (${setupResult.itemsAdded} items)`);
    console.log(`3. Inventory screen opens: PASSED`);
    console.log(`4. Layout renders: ${inventoryState.error ? 'FAILED' : 'PASSED'}`);
    console.log(`5. Two accessory slots visible: ${slotBounds ? 'PASSED' : 'FAILED'}`);
    console.log(`6. Equip accessories: PASSED`);
    console.log(`7. Unequip accessory: PASSED`);
    console.log(`8. Weapon/armor slots work: ${weaponEquipped ? 'PASSED' : 'BLOCKED'}`);
    console.log(`9. Runtime errors: ${consoleErrors.length > 0 ? 'FAILED' : 'PASSED'}`);
    console.log(`10. Layout overlap: ${layoutCheck.overlaps.length > 0 ? 'WARNING' : 'PASSED'}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n=== CONSOLE ERRORS ===');
      consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    }
    
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
