import { BootScene } from './scenes/BootScene.js';
import { WorldMapScene } from './scenes/WorldMapScene.js';

const BASE_HEIGHT = 600;
const aspectRatio = window.innerWidth / window.innerHeight;
const gameWidth = Math.max(800, Math.round(BASE_HEIGHT * aspectRatio));

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: gameWidth,
  height: BASE_HEIGHT,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#6b8e23',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, WorldMapScene],
};

const game = new Phaser.Game(config);
