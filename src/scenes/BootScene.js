export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.createLoadingBar();

    // --- Tilesets ---
    this.load.image('town-tileset', 'assets/tilesets/town-tileset.png');
    this.load.image('town-tileset-img', 'assets/tilesets/top-down-town-tileset.png');

    // --- Vegetation props ---
    this.load.image('tree-prop', 'assets/props/tree-1.png');
    this.load.image('bush-prop', 'assets/props/bush-1.png');

    // --- Hero idle (single frame 32x32) ---
    this.load.spritesheet('hero-idle-front', 'assets/characters/hero-idle-front.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('hero-idle-back', 'assets/characters/hero-idle-back.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('hero-idle-side', 'assets/characters/hero-idle-side.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // --- Hero walk (6 frames, each 32x32) ---
    this.load.spritesheet('hero-walk-front', 'assets/characters/hero-walk-front.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('hero-walk-back', 'assets/characters/hero-walk-back.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('hero-walk-side', 'assets/characters/hero-walk-side.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // --- NPC spritesheet (16x16 frames, 3 cols x 4 rows) ---
    this.load.spritesheet('npc', 'assets/characters/npc.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // --- Ambient creatures ---
    this.load.spritesheet('treant-idle-front', 'assets/characters/treant-idle-front.png', {
      frameWidth: 31,
      frameHeight: 35,
    });
    this.load.spritesheet('mole-idle-front', 'assets/characters/mole-idle-front.png', {
      frameWidth: 24,
      frameHeight: 24,
    });

    // --- Portraits ---
    this.load.image('portrait1', 'assets/portraits/portrait1.png');
    this.load.image('portrait2', 'assets/portraits/portrait2.png');

    // --- Visual effects ---
    this.load.spritesheet('slash-horizontal', 'assets/fx/slash-horizontal.png', {
      frameWidth: 65,
      frameHeight: 40,
    });
    this.load.spritesheet('energy-smack', 'assets/fx/energy-smack.png', {
      frameWidth: 128,
      frameHeight: 96,
    });
    // --- Props ---
    this.load.image('sign', 'assets/props/sign.png');

    // --- Data files ---
    this.load.json('resume-data', 'src/data/resume.json');
    this.load.json('map-data', 'src/data/mapData.json');
  }

  createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const titleText = this.add.text(width / 2, height / 2 - 60, "Welcome to Sihong's Webpage", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#e2c044',
    });
    titleText.setOrigin(0.5);

    const progressText = this.add.text(width / 2, height / 2 + 40, 'Loading...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#f0f0f0',
    });
    progressText.setOrigin(0.5);

    // Loading bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRect(width / 2 - 160, height / 2 - 10, 320, 20);

    // Loading bar fill
    const barFill = this.add.graphics();

    this.load.on('progress', (value) => {
      barFill.clear();
      barFill.fillStyle(0xe2c044, 1);
      barFill.fillRect(width / 2 - 158, height / 2 - 8, 316 * value, 16);
      progressText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressText.setText('Ready!');
    });

    // Don't get stuck if some assets fail to load
    this.load.on('loaderror', (file) => {
      console.warn('Failed to load:', file.key, file.url);
    });
  }

  create() {
    // Create hero animations
    this.createHeroAnimations();

    // Transition to world map
    this.scene.start('WorldMapScene');
  }

  createHeroAnimations() {
    // Idle animations
    this.anims.create({
      key: 'hero-idle-down',
      frames: this.anims.generateFrameNumbers('hero-idle-front', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: 'hero-idle-up',
      frames: this.anims.generateFrameNumbers('hero-idle-back', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: 'hero-idle-side',
      frames: this.anims.generateFrameNumbers('hero-idle-side', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: -1,
    });

    // Walk animations (6 frames each)
    this.anims.create({
      key: 'hero-walk-down',
      frames: this.anims.generateFrameNumbers('hero-walk-front', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'hero-walk-up',
      frames: this.anims.generateFrameNumbers('hero-walk-back', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'hero-walk-side',
      frames: this.anims.generateFrameNumbers('hero-walk-side', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    // NPC idle animation (first row of spritesheet, frames 0-2)
    this.anims.create({
      key: 'npc-idle',
      frames: this.anims.generateFrameNumbers('npc', { start: 0, end: 2 }),
      frameRate: 4,
      repeat: -1,
    });
  }
}
