/**
 * ShopScene.js
 * Shop landing page: shows shop-with-buttons-bg with painted Buy and Sell
 * sign hotspots. Clicking either navigates to the BuyAndSell scene.
 */

class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Shop' });
  }

  getShopLandingHotspot(id) {
    if (!this.cache || !this.cache.json) return null;
    const manifest = this.cache.json.get('shop-landing-hotspots');
    if (!manifest || !Array.isArray(manifest.hotspots)) return null;
    return manifest.hotspots.find(h => h.id === id) || null;
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    if (typeof applyAnimationSettings === 'function') applyAnimationSettings(this);
    const hero = GAME_STATE.hero;

    const hasArt = !!addSceneBackground(this, 'shop-ui-background');
    if (!hasArt) {
      this.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0f172a);
    }

    this.add.text(CONFIG.WIDTH / 2, 20, 'Gold: ' + hero.gold, {
      fontSize: 18,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 5,
    }).setOrigin(0.5, 0.5).setDepth(25);

    createTownNavRow(this, { currentSection: 'shop' });

    const buyHotspot = this.getShopLandingHotspot('buy');
    const sellHotspot = this.getShopLandingHotspot('sell');

    if (buyHotspot) {
      const buyArea = this.add.rectangle(
        buyHotspot.centerX, buyHotspot.centerY,
        buyHotspot.width, buyHotspot.height,
        0x000000, 0
      ).setInteractive({ useHandCursor: true });
      buyArea.on('pointerdown', () => this.scene.start('BuyAndSell'));
    }

    if (sellHotspot) {
      const sellArea = this.add.rectangle(
        sellHotspot.centerX, sellHotspot.centerY,
        sellHotspot.width, sellHotspot.height,
        0x000000, 0
      ).setInteractive({ useHandCursor: true });
      sellArea.on('pointerdown', () => this.scene.start('BuyAndSell'));
    }

    if (!hasArt) {
      createButton(this, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 30, 200, 48, 'Buy', { bgColor: 0x4ade80 }, () => {
        this.scene.start('BuyAndSell');
      });
      createButton(this, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 40, 200, 48, 'Sell', { bgColor: 0x8b5cf6 }, () => {
        this.scene.start('BuyAndSell');
      });
      createButton(this, CONFIG.WIDTH / 2, CONFIG.HEIGHT - 60, 180, 48, 'Back to Town', () => {
        this.scene.start('Town');
      });
    }
  }
}
