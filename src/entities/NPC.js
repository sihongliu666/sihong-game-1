export default class NPC extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {{ name: string, portrait: string, dialogueKey: string }} config
   */
  constructor(scene, x, y, config) {
    // Use hero-idle-front (32x32) for 2x higher resolution than npc (16x16)
    super(scene, x, y, 'hero-idle-front', 0);

    this.config = config;
    this.npcName = config.name || 'NPC';
    this.portrait = config.portrait || 'portrait1';
    this.dialogueKey = config.dialogueKey || 'npc';

    // Add to scene and enable physics (static body — NPC stays in place)
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    // Play the front-facing idle animation (facing toward the viewer/screen)
    this.play('hero-idle-down');

    // Tint to distinguish from the player character
    this.setTint(0x88bbff);

    this.setScale(1.8);
    this.setDepth(5);

    // Floating name label above the NPC
    this.nameLabel = scene.add.text(x, y - 24, this.npcName, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#e2c044',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(10);

    // Interaction prompt (hidden by default)
    this.prompt = scene.add.text(x, y + 24, '[Space] Talk', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(10).setVisible(false);

    // Idle bobbing tween
    this.bobTween = scene.tweens.add({
      targets: this,
      y: y - 3,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Track whether player is nearby
    this.playerNearby = false;

    // Interaction zone radius (in pixels)
    this.interactionRadius = 50;
  }

  /**
   * Check proximity to the player and show/hide the interaction prompt.
   * Call this each frame from the scene's update().
   * @param {Phaser.Physics.Arcade.Sprite} player
   */
  updateProximity(player) {
    if (!player) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const wasNearby = this.playerNearby;
    this.playerNearby = dist < this.interactionRadius;

    if (this.playerNearby && !wasNearby) {
      this.prompt.setVisible(true);
      this.scene.tweens.add({
        targets: this.prompt,
        alpha: { from: 0.5, to: 1 },
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
    } else if (!this.playerNearby && wasNearby) {
      this.prompt.setVisible(false);
      this.scene.tweens.killTweensOf(this.prompt);
      this.prompt.setAlpha(1);
    }

    // Keep labels tracking the NPC (since it bobs)
    this.nameLabel.setPosition(this.x, this.y - 24);
    this.prompt.setPosition(this.x, this.y + 24);
  }

  canInteract() {
    return this.playerNearby;
  }

  destroy() {
    if (this.nameLabel) this.nameLabel.destroy();
    if (this.prompt) this.prompt.destroy();
    if (this.bobTween) this.bobTween.remove();
    super.destroy();
  }
}
