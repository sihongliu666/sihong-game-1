/**
 * Boat - A simple procedurally drawn raft that appears under the player when sailing.
 */
export default class Boat extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    // Generate the raft texture once and cache it
    if (!scene.textures.exists('raft')) {
      Boat.createRaftTexture(scene);
    }

    super(scene, x, y, 'raft');
    scene.add.existing(this);

    this.setDepth(-1); // Render below the player
    this.setVisible(false);
    this.setActive(false);

    // Bobbing tween (paused initially)
    this.bobTween = scene.tweens.add({
      targets: this,
      y: { from: y - 1, to: y + 1 },
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      paused: true,
    });
  }

  static createRaftTexture(scene) {
    const g = scene.add.graphics();
    const w = 36;
    const h = 28;

    // Shadow / outline
    g.fillStyle(0x4a2f0a, 0.4);
    g.fillRoundedRect(1, 1, w, h, 3);

    // Main deck planks
    const plankColor = 0x8b5e3c;
    const plankDark = 0x6b3f1c;
    const plankWidth = w / 5;

    for (let i = 0; i < 5; i++) {
      g.fillStyle(i % 2 === 0 ? plankColor : plankDark, 1);
      g.fillRect(i * plankWidth, 0, plankWidth, h);
    }

    // Plank border
    g.lineStyle(1, 0x3d1f00, 0.8);
    g.strokeRoundedRect(0, 0, w, h, 2);

    // Cross-beams (horizontal ties)
    g.lineStyle(2, 0x5a3a1a, 1);
    g.lineBetween(0, h * 0.3, w, h * 0.3);
    g.lineBetween(0, h * 0.7, w, h * 0.7);

    g.generateTexture('raft', w, h);
    g.destroy();
  }

  show(x, y) {
    this.setPosition(x, y);
    this.setVisible(true);
    this.setActive(true);
    this.bobTween.resume();
  }

  hide() {
    this.setVisible(false);
    this.setActive(false);
    this.bobTween.pause();
  }

  follow(x, y) {
    this.x = x;
    // Keep the bobbing offset relative to the player by updating the tween's base
    this.bobTween.updateTo('y', y + 1, true);
  }
}
