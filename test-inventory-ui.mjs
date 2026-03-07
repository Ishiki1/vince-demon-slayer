import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Opening Vince app at http://localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    console.log('Taking initial screenshot...');
    await page.screenshot({ path: 'test-screenshots/01-menu.png' });

    // Start game
    console.log('Clicking Play...');
    await page.click('text=Play');
    await page.waitForTimeout(1000);

    console.log('Selecting Warrior...');
    await page.click('text=Warrior');
    await page.waitForTimeout(1000);

    console.log('Clicking Continue from origin story...');
    await page.click('text=Continue');
    await page.waitForTimeout(2000);

    console.log('Taking overworld screenshot...');
    await page.screenshot({ path: 'test-screenshots/02-overworld.png' });

    // Set up inventory with items via browser console
    console.log('Setting up test inventory via console...');
    await page.evaluate(() => {
      // Add some test items to inventory
      const hero = window.GAME_STATE.hero;
      const InventorySystem = window.InventorySystem;
      
      // Add a weapon
      InventorySystem.add(hero, 'rusty-sword');
      // Add armor
      InventorySystem.add(hero, 'leather-armor');
      // Add two accessories (rings)
      InventorySystem.add(hero, 'common-ring');
      InventorySystem.add(hero, 'rare-ring');
      
      // Equip them
      const weaponSlot = hero.inventory.find(s => s && s.itemId === 'rusty-sword');
      const armorSlot = hero.inventory.find(s => s && s.itemId === 'leather-armor');
      const ring1Slot = hero.inventory.find(s => s && s.itemId === 'common-ring');
      const ring2Slot = hero.inventory.find(s => s && s.itemId === 'rare-ring');
      
      if (weaponSlot) InventorySystem.equip(hero, weaponSlot.id);
      if (armorSlot) InventorySystem.equip(hero, armorSlot.id);
      if (ring1Slot) InventorySystem.equip(hero, ring1Slot.id);
      if (ring2Slot) InventorySystem.equip(hero, ring2Slot.id);
      
      console.log('Inventory setup complete. Accessories:', hero.accessories);
    });

    await page.waitForTimeout(500);

    console.log('Opening inventory from overworld...');
    // Click the inventory icon in the overworld
    await page.click('img[src*="inventory-icon"]');
    await page.waitForTimeout(2000);

    console.log('Taking inventory screen screenshot...');
    await page.screenshot({ path: 'test-screenshots/03-inventory-open.png' });

    // Inspect what's visible
    console.log('\n=== VISUAL VERIFICATION ===');
    
    // Check for frame art visibility
    const hasFrameArt = await page.evaluate(() => {
      const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'InventoryOverworldScene');
      if (!scene) return { present: false, reason: 'Scene not found' };
      
      const frame = scene.children.list.find(child => 
        child.type === 'Graphics' && child.x === 400 && child.y === 300
      );
      
      return {
        present: !!frame,
        visible: frame ? frame.visible : false,
        alpha: frame ? frame.alpha : 0,
        fillColor: frame ? frame.fillColor : null,
        strokeColor: frame ? frame.strokeColor : null
      };
    });
    
    console.log('Frame Art Check:', JSON.stringify(hasFrameArt, null, 2));

    // Check for placeholder sprites (sword/armor/ring/amulet)
    const placeholderCheck = await page.evaluate(() => {
      const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'InventoryOverworldScene');
      if (!scene) return { error: 'Scene not found' };
      
      // Look for any text objects that say "Sword", "Armor", "Ring", "Amulet" as placeholders
      const textObjects = scene.children.list.filter(child => child.type === 'Text');
      const placeholderTexts = textObjects.filter(t => 
        t.text && (
          t.text.toLowerCase().includes('sword') ||
          t.text.toLowerCase().includes('armor') ||
          t.text.toLowerCase().includes('ring') ||
          t.text.toLowerCase().includes('amulet')
        )
      );
      
      return {
        foundPlaceholders: placeholderTexts.length,
        examples: placeholderTexts.slice(0, 3).map(t => ({ text: t.text, visible: t.visible }))
      };
    });
    
    console.log('Placeholder Check:', JSON.stringify(placeholderCheck, null, 2));

    // Check for actual item sprites
    const spriteCheck = await page.evaluate(() => {
      const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'InventoryOverworldScene');
      if (!scene) return { error: 'Scene not found' };
      
      const sprites = scene.children.list.filter(child => child.type === 'Sprite' || child.type === 'Image');
      const itemSprites = sprites.filter(s => 
        s.texture && s.texture.key && (
          s.texture.key.includes('sword') ||
          s.texture.key.includes('armor') ||
          s.texture.key.includes('ring') ||
          s.texture.key.includes('amulet')
        )
      );
      
      return {
        totalSprites: sprites.length,
        itemSprites: itemSprites.length,
        examples: itemSprites.slice(0, 5).map(s => ({ 
          key: s.texture.key, 
          visible: s.visible,
          alpha: s.alpha,
          x: s.x,
          y: s.y
        }))
      };
    });
    
    console.log('Sprite Check:', JSON.stringify(spriteCheck, null, 2));

    // Check for weight text
    const weightCheck = await page.evaluate(() => {
      const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'InventoryOverworldScene');
      if (!scene) return { error: 'Scene not found' };
      
      const textObjects = scene.children.list.filter(child => child.type === 'Text');
      const weightTexts = textObjects.filter(t => 
        t.text && t.text.toLowerCase().includes('weight')
      );
      
      return {
        found: weightTexts.length,
        examples: weightTexts.map(t => ({ text: t.text, visible: t.visible }))
      };
    });
    
    console.log('Weight Text Check:', JSON.stringify(weightCheck, null, 2));

    // Check close button
    const closeButtonCheck = await page.evaluate(() => {
      const scene = window.game?.scene?.scenes?.find(s => s.scene.key === 'InventoryOverworldScene');
      if (!scene) return { error: 'Scene not found' };
      
      const buttons = scene.children.list.filter(child => 
        (child.type === 'Rectangle' || child.type === 'Graphics') &&
        child.input && child.input.enabled
      );
      
      const closeButtons = buttons.filter(b => {
        const nearbyText = scene.children.list.find(t => 
          t.type === 'Text' && 
          Math.abs(t.x - b.x) < 50 && 
          Math.abs(t.y - b.y) < 20 &&
          t.text.toLowerCase().includes('back')
        );
        return !!nearbyText;
      });
      
      return {
        totalButtons: buttons.length,
        closeButtons: closeButtons.length,
        closeButtonsInteractive: closeButtons.filter(b => b.input.enabled).length
      };
    });
    
    console.log('Close Button Check:', JSON.stringify(closeButtonCheck, null, 2));

    // Test close button
    console.log('\n=== TESTING CLOSE BUTTON ===');
    const closeBtn = await page.locator('text=Back').first();
    if (await closeBtn.isVisible()) {
      console.log('Close button visible, clicking...');
      await closeBtn.click();
      await page.waitForTimeout(1000);
      
      const backToOverworld = await page.evaluate(() => {
        const activeScene = window.game?.scene?.keys?.find(key => window.game.scene.isActive(key));
        return activeScene;
      });
      
      console.log('After close, active scene:', backToOverworld);
      await page.screenshot({ path: 'test-screenshots/04-after-close.png' });
    } else {
      console.log('Close button not visible!');
    }

    // Test equipping/unequipping accessories
    console.log('\n=== TESTING ACCESSORY EQUIP/UNEQUIP ===');
    
    // Open inventory again
    console.log('Opening inventory again...');
    await page.click('img[src*="inventory-icon"]');
    await page.waitForTimeout(2000);
    
    // Check current accessories
    const initialAccessories = await page.evaluate(() => {
      return window.GAME_STATE.hero.accessories;
    });
    console.log('Initial accessories:', initialAccessories);
    
    // Try to unequip first accessory
    console.log('Looking for Unequip button for first accessory...');
    const unequipButtons = await page.locator('text=Unequip').all();
    if (unequipButtons.length > 0) {
      console.log(`Found ${unequipButtons.length} Unequip buttons, clicking first...`);
      await unequipButtons[0].click();
      await page.waitForTimeout(1000);
      
      const afterUnequip = await page.evaluate(() => {
        return window.GAME_STATE.hero.accessories;
      });
      console.log('After unequip:', afterUnequip);
      await page.screenshot({ path: 'test-screenshots/05-after-unequip.png' });
    } else {
      console.log('No Unequip buttons found!');
    }
    
    // Try to equip it back
    console.log('Looking for Equip button...');
    const equipButtons = await page.locator('text=Equip').all();
    if (equipButtons.length > 0) {
      console.log(`Found ${equipButtons.length} Equip buttons, clicking first...`);
      await equipButtons[0].click();
      await page.waitForTimeout(1000);
      
      const afterEquip = await page.evaluate(() => {
        return window.GAME_STATE.hero.accessories;
      });
      console.log('After equip:', afterEquip);
      await page.screenshot({ path: 'test-screenshots/06-after-equip.png' });
    } else {
      console.log('No Equip buttons found!');
    }

    console.log('\n=== TEST COMPLETE ===');
    console.log('Screenshots saved to test-screenshots/ folder');
    console.log('Check the screenshots and console output above for verification results.');

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'test-screenshots/error.png' });
  } finally {
    await page.waitForTimeout(5000); // Keep browser open for inspection
    await browser.close();
  }
})();
