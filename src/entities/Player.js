/**
 * Player - Hero character with 4-directional movement, animation, and mouse click-to-move.
 *
 * Animations are created in BootScene.createHeroAnimations() using these keys:
 *   idle:  hero-idle-down, hero-idle-up, hero-idle-side
 *   walk:  hero-walk-down, hero-walk-up, hero-walk-side
 *
 * For left-facing movement the side animation is played with flipX = true.
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  static SPEED = 120;

  constructor(scene, x, y) {
    super(scene, x, y, 'hero-idle-front', 0);

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale up for better visibility
    this.setScale(1.8);

    // Physics body setup — slightly smaller than the 32x32 frame for tight collisions
    this.body.setSize(16, 16);
    this.body.setOffset(8, 14);
    this.setDepth(3);

    // State tracking
    this.facing = 'down';     // 'up' | 'down' | 'left' | 'right'
    this.state = 'idle';      // 'idle' | 'walking'

    // Mouse click-to-move target
    this.moveTarget = null;

    // Input — keyboard
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Input — mouse click
    scene.input.on('pointerdown', (pointer) => {
      this.moveTarget = { x: pointer.worldX, y: pointer.worldY };
    });

    // Play default idle animation
    this.play('hero-idle-down');
  }

  // ------------------------------------------------------------------
  // Main update — call this from the scene's update()
  // ------------------------------------------------------------------
  update() {
    this.handleMovement();
  }

  // ------------------------------------------------------------------
  // Movement — keyboard takes priority, then mouse target
  // ------------------------------------------------------------------
  handleMovement() {
    const speed = Player.SPEED;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;
    const hasKeyboard = left || right || up || down;

    if (hasKeyboard) {
      // Keyboard movement cancels any mouse target
      this.moveTarget = null;

      let vx = 0;
      let vy = 0;
      if (left) vx -= 1;
      if (right) vx += 1;
      if (up) vy -= 1;
      if (down) vy += 1;

      // Normalize diagonal movement
      if (vx !== 0 && vy !== 0) {
        const diag = Math.SQRT1_2;
        vx *= diag;
        vy *= diag;
      }

      this.body.setVelocity(vx * speed, vy * speed);
      this.updateFacing(vx, vy);
      this.playWalkAnimation();
      this.state = 'walking';

    } else if (this.moveTarget) {
      // Mouse click-to-move
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.moveTarget.x, this.moveTarget.y);

      if (dist > 6) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.moveTarget.x, this.moveTarget.y);
        const vx = Math.cos(angle);
        const vy = Math.sin(angle);
        this.body.setVelocity(vx * speed, vy * speed);
        this.updateFacing(vx, vy);
        this.playWalkAnimation();
        this.state = 'walking';
      } else {
        // Arrived at target
        this.moveTarget = null;
        this.body.setVelocity(0, 0);
        this.playIdleAnimation();
        this.state = 'idle';
      }

    } else {
      // No input — idle
      this.body.setVelocity(0, 0);
      this.playIdleAnimation();
      this.state = 'idle';
    }
  }

  updateFacing(vx, vy) {
    if (vx < 0) this.facing = 'left';
    else if (vx > 0) this.facing = 'right';
    else if (vy < 0) this.facing = 'up';
    else if (vy > 0) this.facing = 'down';
  }

  playWalkAnimation() {
    const animKey = this.getWalkAnimKey();
    if (this.anims.currentAnim?.key !== animKey) {
      this.play(animKey, true);
    }
    this.updateFlip();
  }

  playIdleAnimation() {
    const animKey = this.getIdleAnimKey();
    if (this.anims.currentAnim?.key !== animKey) {
      this.play(animKey, true);
    }
    this.updateFlip();
  }

  getWalkAnimKey() {
    switch (this.facing) {
      case 'up': return 'hero-walk-up';
      case 'down': return 'hero-walk-down';
      case 'left':
      case 'right': return 'hero-walk-side';
    }
  }

  getIdleAnimKey() {
    switch (this.facing) {
      case 'up': return 'hero-idle-up';
      case 'down': return 'hero-idle-down';
      case 'left':
      case 'right': return 'hero-idle-side';
    }
  }

  updateFlip() {
    if (this.facing === 'left') {
      this.setFlipX(true);
    } else if (this.facing === 'right') {
      this.setFlipX(false);
    }
    if (this.facing === 'up' || this.facing === 'down') {
      this.setFlipX(false);
    }
  }
}
