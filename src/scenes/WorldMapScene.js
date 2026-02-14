import Player from '../entities/Player.js';
import NPC from '../entities/NPC.js';
import Dialogue from '../systems/Dialogue.js';

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldMapScene' });
    this.houseZones = {};
    this.activeZone = null;
    this.interactKey = null;
    this.promptText = null;
    this.dialogueOpen = false;
    this.npcTalkedOnce = false;
  }

  create() {
    const mapData = this.cache.json.get('map-data') || this._getDefaultMapData();
    this.mapData = mapData;

    const worldW = this.scale.width;
    const worldH = 600;

    // Offset to center the original 800px layout in the wider canvas
    this.offsetX = (worldW - 800) / 2;

    // --- Draw the village ---
    this.drawVillage(worldW, worldH);

    // --- Physics world bounds ---
    this.physics.world.setBounds(0, 0, worldW, worldH);

    // --- Create house interaction zones ---
    this.createHouseZones();

    // --- Floating house labels ---
    this.createHouseLabels();

    // --- Spawn the player ---
    const spawn = mapData.spawn || { x: 400, y: 450 };
    this.player = new Player(this, spawn.x + this.offsetX, spawn.y);
    this.player.setCollideWorldBounds(true);

    // --- Spawn the Sihong NPC at the center of the map ---
    this.npc = new NPC(this, 400 + this.offsetX, 350, {
      name: 'Sihong',
      portrait: 'portrait1',
      dialogueKey: 'npc',
    });

    // --- Dialogue system ---
    this.dialogue = new Dialogue(this.game);
    this._dialogueCooldown = false;
    this._interactionCooldown = false;
    this.game.events.on('dialogue-closed', () => {
      if (this.player) this.player.moveTarget = null;
      this.dialogueOpen = false;
      // Prevent re-triggering the same interaction before the player walks away
      this._interactionCooldown = true;
      // Brief cooldown prevents the closing tap from registering as movement
      this._dialogueCooldown = true;
      setTimeout(() => { this._dialogueCooldown = false; }, 200);

      // Belt-and-suspenders: manually reset every Phaser pointer.
      // The Dialogue system dispatches a synthetic pointerup on the canvas,
      // but if that event doesn't fully propagate (e.g. on some iOS builds),
      // force-clear the stuck state so taps register again.
      const pointers = this.input.manager.pointers;
      for (const p of pointers) {
        if (p && p.isDown) {
          p.isDown = false;
          p.buttons = 0;
          p.primaryDown = false;
        }
      }
    });

    // --- Camera: fixed, no scrolling ---
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setScroll(0, 0);

    // --- Input setup ---
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // --- Detect touch device ---
    this.isTouch = this.sys.game.device.input.touch;

    // --- Tap/click to interact (for mobile support) ---
    this.input.on('pointerdown', (pointer) => {
      if (this.dialogueOpen || this._dialogueCooldown) return;

      // Skip interaction checks while cooldown is active (player just
      // closed a dialogue and hasn't moved away yet). Taps will fall
      // through to the Player's pointerdown handler for movement.
      if (!this._interactionCooldown) {
        // Check if player is in a house zone
        if (this.activeZone) {
          this.handleHouseInteraction(this.activeZone);
          this.player.moveTarget = null;
          return;
        }

        // Check if player is near NPC AND the tap is near the NPC
        if (this.npc && this.npc.playerNearby) {
          const distToNPC = Phaser.Math.Distance.Between(
            pointer.worldX, pointer.worldY, this.npc.x, this.npc.y
          );
          if (distToNPC < 60) {
            this.handleNPCInteraction();
            this.player.moveTarget = null;
            return;
          }
        }
      }
    });

    // --- Interaction prompt (fixed to camera, hidden initially) ---
    this.promptText = this.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 6, y: 4 },
    });
    this.promptText.setScrollFactor(0);
    this.promptText.setDepth(100);
    this.promptText.setVisible(false);
    this.promptText.setPosition(
      this.cameras.main.width / 2,
      this.cameras.main.height - 40
    );
    this.promptText.setOrigin(0.5);
    this.promptText.setInteractive({ useHandCursor: true });
    this.promptText.on('pointerdown', () => {
      if (this._interactionCooldown) return;
      if (this.activeZone) {
        this.handleHouseInteraction(this.activeZone);
        this.player.moveTarget = null;
      }
    });

    // --- Temporary debug overlay (remove once movement bug is fixed) ---
    this._debugTapCount = 0;
    this._debugRawTapCount = 0;
    this._debugText = this.add.text(4, 4, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#00ff00',
      backgroundColor: '#000000cc',
      padding: { x: 4, y: 3 },
    });
    this._debugText.setScrollFactor(0);
    this._debugText.setDepth(999);

    // Count Phaser-level taps
    this.input.on('pointerdown', () => { this._debugTapCount++; });

    // Count raw DOM taps on the canvas (bypasses Phaser)
    this.game.canvas.addEventListener('pointerdown', () => {
      this._debugRawTapCount++;
    }, true);
  }

  // ----------------------------------------------------------------
  // Draw the village scene
  // ----------------------------------------------------------------
  drawVillage(worldW, worldH) {
    // Grass background
    const grassGfx = this.add.graphics();
    grassGfx.fillStyle(0x6b8e23, 1);
    grassGfx.fillRect(0, 0, worldW, worldH);

    // Subtle grass texture variation
    for (let y = 0; y < worldH; y += 16) {
      for (let x = 0; x < worldW; x += 16) {
        if (Math.random() < 0.2) {
          const shade = Phaser.Math.Between(0, 2);
          const colors = [0x7a9e2e, 0x5f7e1a, 0x648c20];
          grassGfx.fillStyle(colors[shade], 0.3);
          grassGfx.fillRect(x, y, 16, 16);
        }
      }
    }

    // Draw dirt paths between houses and spawn
    this.drawPaths();

    // Draw houses (each one distinct)
    this.drawHouses();

    // Place decorations (trees, bushes, flowers, fences, fountain, creatures)
    this.placeDecorations();
  }

  // ----------------------------------------------------------------
  // Draw dirt paths connecting the houses
  // ----------------------------------------------------------------
  drawPaths() {
    const pathGfx = this.add.graphics();
    const pathColor = 0xaa8855;
    const pathWidth = 24;
    const houses = this.mapData.houses;
    const spawn = this.mapData.spawn || { x: 400, y: 450 };
    const ox = this.offsetX;

    pathGfx.fillStyle(pathColor, 1);

    // Path from spawn to center
    const centerX = 400 + ox;
    const centerY = 300;
    pathGfx.fillRect(centerX - pathWidth / 2, centerY, pathWidth, spawn.y - centerY);

    // Horizontal path connecting all three houses
    const leftHouse = houses.aboutMe;
    const rightHouse = houses.education;
    const midY = houses.workExperience.y + 60;
    pathGfx.fillRect(leftHouse.x + ox - 10, midY - pathWidth / 2, rightHouse.x - leftHouse.x + 20, pathWidth);

    // Vertical connectors from horizontal path down to each house door area
    for (const house of Object.values(houses)) {
      const houseBottom = house.y + 60;
      if (houseBottom < midY) {
        pathGfx.fillRect(house.x + ox - pathWidth / 2, houseBottom, pathWidth, midY - houseBottom + pathWidth / 2);
      } else {
        pathGfx.fillRect(house.x + ox - pathWidth / 2, midY - pathWidth / 2, pathWidth, houseBottom - midY + pathWidth);
      }
    }

    // Vertical path from center horizontal path down to spawn
    pathGfx.fillRect(centerX - pathWidth / 2, midY, pathWidth, spawn.y - midY);

    // Add subtle path border/shadow
    pathGfx.fillStyle(0x997744, 0.4);
    pathGfx.fillRect(leftHouse.x + ox - 12, midY - pathWidth / 2 - 2, rightHouse.x - leftHouse.x + 24, 2);
    pathGfx.fillRect(leftHouse.x + ox - 12, midY + pathWidth / 2, rightHouse.x - leftHouse.x + 24, 2);

    // Scatter a few small pebbles/stones on the path for detail
    const stoneGfx = this.add.graphics();
    stoneGfx.setDepth(0);
    for (let i = 0; i < 20; i++) {
      const sx = Phaser.Math.Between(leftHouse.x + ox - 10, rightHouse.x + ox + 10);
      const sy = Phaser.Math.Between(midY - 10, midY + 10);
      stoneGfx.fillStyle(0x998866, 0.5);
      stoneGfx.fillCircle(sx, sy, Phaser.Math.Between(1, 2));
    }
  }

  // ----------------------------------------------------------------
  // Draw three distinct houses
  // ----------------------------------------------------------------
  drawHouses() {
    const houses = this.mapData.houses;
    const ox = this.offsetX;

    // Each house has its own design
    this.drawCottage(houses.aboutMe.x + ox, houses.aboutMe.y);
    this.drawOffice(houses.workExperience.x + ox, houses.workExperience.y);
    this.drawSchool(houses.education.x + ox, houses.education.y);
  }

  // ----------------------------------------------------------------
  // About Me — cozy cottage with a chimney
  // ----------------------------------------------------------------
  drawCottage(x, y) {
    const gfx = this.add.graphics();
    const wallW = 100;
    const wallH = 60;
    const roofOverhang = 14;

    // Shadow
    gfx.fillStyle(0x000000, 0.15);
    gfx.fillRect(x - wallW / 2 + 4, y - wallH / 2 + 4 + 20, wallW, wallH);

    // Wall — warm wood tone
    gfx.fillStyle(0xc4956a, 1);
    gfx.fillRect(x - wallW / 2, y - wallH / 2 + 20, wallW, wallH);

    // Horizontal wood planks
    gfx.lineStyle(1, 0xb08050, 0.4);
    for (let py = y - wallH / 2 + 30; py < y + wallH / 2 + 20; py += 10) {
      gfx.lineBetween(x - wallW / 2, py, x + wallW / 2, py);
    }

    // Wall outline
    gfx.lineStyle(2, 0x333333, 0.5);
    gfx.strokeRect(x - wallW / 2, y - wallH / 2 + 20, wallW, wallH);

    // Roof — peaked triangle, red-brown
    gfx.fillStyle(0x8b4513, 1);
    gfx.beginPath();
    gfx.moveTo(x - wallW / 2 - roofOverhang, y - wallH / 2 + 20);
    gfx.lineTo(x, y - wallH / 2 - 30);
    gfx.lineTo(x + wallW / 2 + roofOverhang, y - wallH / 2 + 20);
    gfx.closePath();
    gfx.fillPath();

    // Roof outline
    gfx.lineStyle(2, 0x222222, 0.5);
    gfx.beginPath();
    gfx.moveTo(x - wallW / 2 - roofOverhang, y - wallH / 2 + 20);
    gfx.lineTo(x, y - wallH / 2 - 30);
    gfx.lineTo(x + wallW / 2 + roofOverhang, y - wallH / 2 + 20);
    gfx.closePath();
    gfx.strokePath();

    // Chimney
    gfx.fillStyle(0x6b3a2a, 1);
    gfx.fillRect(x + 20, y - wallH / 2 - 28, 14, 22);
    gfx.lineStyle(1, 0x333333, 0.5);
    gfx.strokeRect(x + 20, y - wallH / 2 - 28, 14, 22);

    // Smoke puffs
    gfx.fillStyle(0xcccccc, 0.3);
    gfx.fillCircle(x + 27, y - wallH / 2 - 34, 4);
    gfx.fillCircle(x + 30, y - wallH / 2 - 42, 5);
    gfx.fillCircle(x + 26, y - wallH / 2 - 50, 3);

    // Rounded door
    const doorW = 20;
    const doorH = 32;
    gfx.fillStyle(0x5c3317, 1);
    gfx.fillRect(x - doorW / 2, y + wallH / 2 + 20 - doorH, doorW, doorH);
    gfx.fillStyle(0x5c3317, 1);
    gfx.fillCircle(x, y + wallH / 2 + 20 - doorH, doorW / 2);

    // Door knob
    gfx.fillStyle(0xdaa520, 1);
    gfx.fillCircle(x + doorW / 2 - 5, y + wallH / 2 + 20 - doorH / 2, 2);

    // One large window with shutters
    const windowW = 18;
    const windowH = 16;
    const wx = x - wallW / 2 + 18;
    const wy = y - wallH / 2 + 32;

    // Shutters
    gfx.fillStyle(0x5c3317, 1);
    gfx.fillRect(wx - 4, wy, 4, windowH);
    gfx.fillRect(wx + windowW, wy, 4, windowH);

    // Window glass
    gfx.fillStyle(0x87ceeb, 0.8);
    gfx.fillRect(wx, wy, windowW, windowH);
    gfx.lineStyle(1, 0x333333, 0.7);
    gfx.strokeRect(wx, wy, windowW, windowH);
    gfx.lineBetween(wx + windowW / 2, wy, wx + windowW / 2, wy + windowH);
    gfx.lineBetween(wx, wy + windowH / 2, wx + windowW, wy + windowH / 2);

    // Second window on right side
    const wx2 = x + wallW / 2 - 18 - windowW;
    gfx.fillStyle(0x5c3317, 1);
    gfx.fillRect(wx2 - 4, wy, 4, windowH);
    gfx.fillRect(wx2 + windowW, wy, 4, windowH);
    gfx.fillStyle(0x87ceeb, 0.8);
    gfx.fillRect(wx2, wy, windowW, windowH);
    gfx.lineStyle(1, 0x333333, 0.7);
    gfx.strokeRect(wx2, wy, windowW, windowH);
    gfx.lineBetween(wx2 + windowW / 2, wy, wx2 + windowW / 2, wy + windowH);
    gfx.lineBetween(wx2, wy + windowH / 2, wx2 + windowW, wy + windowH / 2);

    // Flower box under left window
    gfx.fillStyle(0x8b4513, 1);
    gfx.fillRect(wx - 2, wy + windowH + 1, windowW + 4, 4);
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillCircle(wx + 3, wy + windowH, 3);
    gfx.fillStyle(0xff9999, 1);
    gfx.fillCircle(wx + 10, wy + windowH - 1, 3);
    gfx.fillStyle(0xff6b6b, 1);
    gfx.fillCircle(wx + 16, wy + windowH, 3);

    gfx.setDepth(2);
  }

  // ----------------------------------------------------------------
  // Work Experience — taller office building with flat roof
  // ----------------------------------------------------------------
  drawOffice(x, y) {
    const gfx = this.add.graphics();
    const wallW = 110;
    const wallH = 80;

    // Shadow
    gfx.fillStyle(0x000000, 0.15);
    gfx.fillRect(x - wallW / 2 + 4, y - wallH / 2 + 4 + 10, wallW, wallH);

    // Wall — stone gray
    gfx.fillStyle(0xb8b0a0, 1);
    gfx.fillRect(x - wallW / 2, y - wallH / 2 + 10, wallW, wallH);

    // Brick-like pattern
    gfx.lineStyle(1, 0xa8a090, 0.3);
    for (let row = 0; row < 8; row++) {
      const py = y - wallH / 2 + 10 + row * 10;
      gfx.lineBetween(x - wallW / 2, py, x + wallW / 2, py);
      const offset = row % 2 === 0 ? 0 : 11;
      for (let bx = x - wallW / 2 + offset; bx < x + wallW / 2; bx += 22) {
        gfx.lineBetween(bx, py, bx, py + 10);
      }
    }

    // Wall outline
    gfx.lineStyle(2, 0x333333, 0.5);
    gfx.strokeRect(x - wallW / 2, y - wallH / 2 + 10, wallW, wallH);

    // Flat roof with parapet
    gfx.fillStyle(0x6b5a4a, 1);
    gfx.fillRect(x - wallW / 2 - 6, y - wallH / 2 + 4, wallW + 12, 10);
    gfx.lineStyle(2, 0x333333, 0.4);
    gfx.strokeRect(x - wallW / 2 - 6, y - wallH / 2 + 4, wallW + 12, 10);

    // Sign board above door
    gfx.fillStyle(0x4a3520, 1);
    gfx.fillRect(x - 24, y - wallH / 2 + 16, 48, 12);
    gfx.lineStyle(1, 0xdaa520, 0.8);
    gfx.strokeRect(x - 24, y - wallH / 2 + 16, 48, 12);

    // Double doors
    const doorW = 14;
    const doorH = 34;
    const doorBase = y + wallH / 2 + 10;
    gfx.fillStyle(0x4a2510, 1);
    gfx.fillRect(x - doorW - 1, doorBase - doorH, doorW, doorH);
    gfx.fillRect(x + 1, doorBase - doorH, doorW, doorH);
    gfx.lineStyle(1, 0x333333, 0.5);
    gfx.strokeRect(x - doorW - 1, doorBase - doorH, doorW, doorH);
    gfx.strokeRect(x + 1, doorBase - doorH, doorW, doorH);

    // Door knobs
    gfx.fillStyle(0xdaa520, 1);
    gfx.fillCircle(x - 3, doorBase - doorH / 2, 2);
    gfx.fillCircle(x + 3, doorBase - doorH / 2, 2);

    // Three rows of windows (office-like grid)
    const windowW = 12;
    const windowH = 14;
    const windowCols = [x - 36, x - 16, x + 16, x + 36];
    const windowRows = [y - wallH / 2 + 34, y - wallH / 2 + 56];

    for (const wy of windowRows) {
      for (const wx of windowCols) {
        // Window glow
        gfx.fillStyle(0xfff8cc, 0.4);
        gfx.fillRect(wx - windowW / 2 - 1, wy - 1, windowW + 2, windowH + 2);
        // Window glass
        gfx.fillStyle(0x87ceeb, 0.8);
        gfx.fillRect(wx - windowW / 2, wy, windowW, windowH);
        gfx.lineStyle(1, 0x333333, 0.6);
        gfx.strokeRect(wx - windowW / 2, wy, windowW, windowH);
        // Cross
        gfx.lineBetween(wx, wy, wx, wy + windowH);
        gfx.lineBetween(wx - windowW / 2, wy + windowH / 2, wx + windowW / 2, wy + windowH / 2);
      }
    }

    // Steps in front of door
    gfx.fillStyle(0x999999, 1);
    gfx.fillRect(x - 20, doorBase, 40, 4);
    gfx.fillRect(x - 24, doorBase + 4, 48, 4);

    gfx.setDepth(2);
  }

  // ----------------------------------------------------------------
  // Education — school/library with a clock tower
  // ----------------------------------------------------------------
  drawSchool(x, y) {
    const gfx = this.add.graphics();
    const wallW = 100;
    const wallH = 60;

    // Shadow
    gfx.fillStyle(0x000000, 0.15);
    gfx.fillRect(x - wallW / 2 + 4, y - wallH / 2 + 4 + 20, wallW, wallH);

    // Wall — warm sandy stone
    gfx.fillStyle(0xd4c4a8, 1);
    gfx.fillRect(x - wallW / 2, y - wallH / 2 + 20, wallW, wallH);

    // Wall outline
    gfx.lineStyle(2, 0x333333, 0.5);
    gfx.strokeRect(x - wallW / 2, y - wallH / 2 + 20, wallW, wallH);

    // Gabled roof — blue-grey slate
    gfx.fillStyle(0x4a6070, 1);
    gfx.beginPath();
    gfx.moveTo(x - wallW / 2 - 10, y - wallH / 2 + 20);
    gfx.lineTo(x, y - wallH / 2 - 20);
    gfx.lineTo(x + wallW / 2 + 10, y - wallH / 2 + 20);
    gfx.closePath();
    gfx.fillPath();
    gfx.lineStyle(2, 0x222222, 0.5);
    gfx.beginPath();
    gfx.moveTo(x - wallW / 2 - 10, y - wallH / 2 + 20);
    gfx.lineTo(x, y - wallH / 2 - 20);
    gfx.lineTo(x + wallW / 2 + 10, y - wallH / 2 + 20);
    gfx.closePath();
    gfx.strokePath();

    // Clock tower on top
    const towerW = 20;
    const towerH = 20;
    const towerBase = y - wallH / 2 - 20;
    gfx.fillStyle(0xd4c4a8, 1);
    gfx.fillRect(x - towerW / 2, towerBase - towerH, towerW, towerH);
    gfx.lineStyle(1, 0x333333, 0.5);
    gfx.strokeRect(x - towerW / 2, towerBase - towerH, towerW, towerH);

    // Tower pointed roof
    gfx.fillStyle(0x4a6070, 1);
    gfx.beginPath();
    gfx.moveTo(x - towerW / 2 - 3, towerBase - towerH);
    gfx.lineTo(x, towerBase - towerH - 14);
    gfx.lineTo(x + towerW / 2 + 3, towerBase - towerH);
    gfx.closePath();
    gfx.fillPath();

    // Clock face
    gfx.fillStyle(0xfffff0, 1);
    gfx.fillCircle(x, towerBase - towerH / 2, 6);
    gfx.lineStyle(1, 0x333333, 0.8);
    gfx.strokeCircle(x, towerBase - towerH / 2, 6);
    // Clock hands
    const clockCY = towerBase - towerH / 2;
    gfx.lineBetween(x, clockCY, x, clockCY - 4); // 12 o'clock
    gfx.lineBetween(x, clockCY, x + 3, clockCY + 1); // ~3 o'clock

    // Arched entrance
    const doorW = 22;
    const doorH = 30;
    const doorBase = y + wallH / 2 + 20;
    gfx.fillStyle(0x3a4a5a, 1);
    gfx.fillRect(x - doorW / 2, doorBase - doorH, doorW, doorH);
    gfx.fillCircle(x, doorBase - doorH, doorW / 2);

    // Door detail — arch highlight
    gfx.lineStyle(1, 0x222222, 0.5);
    gfx.strokeCircle(x, doorBase - doorH, doorW / 2);

    // Door knob
    gfx.fillStyle(0xdaa520, 1);
    gfx.fillCircle(x + doorW / 2 - 5, doorBase - doorH / 2, 2);

    // Tall windows (arched top) — 2 on each side
    const ww = 12;
    const wh = 20;
    const winPositions = [
      x - wallW / 2 + 14,
      x - wallW / 2 + 32,
      x + wallW / 2 - 14 - ww,
      x + wallW / 2 - 32 - ww,
    ];
    const wy = y - wallH / 2 + 28;

    for (const wx of winPositions) {
      gfx.fillStyle(0x87ceeb, 0.8);
      gfx.fillRect(wx, wy, ww, wh);
      gfx.fillCircle(wx + ww / 2, wy, ww / 2);
      gfx.lineStyle(1, 0x333333, 0.6);
      gfx.strokeRect(wx, wy, ww, wh);
      gfx.strokeCircle(wx + ww / 2, wy, ww / 2);
      // Vertical divider
      gfx.lineBetween(wx + ww / 2, wy - ww / 2, wx + ww / 2, wy + wh);
    }

    // Columns flanking the door
    gfx.fillStyle(0xc8b898, 1);
    gfx.fillRect(x - doorW / 2 - 6, doorBase - doorH - 6, 5, doorH + 6);
    gfx.fillRect(x + doorW / 2 + 1, doorBase - doorH - 6, 5, doorH + 6);

    gfx.setDepth(2);
  }

  // ----------------------------------------------------------------
  // Place trees, bushes, flowers, fences, fountain, ambient creatures
  // ----------------------------------------------------------------
  placeDecorations() {
    const hasTreeSprite = this.textures.exists('tree-prop');
    const hasBushSprite = this.textures.exists('bush-prop');
    const ox = this.offsetX;
    const worldW = this.scale.width;

    // --- Trees along edges and scattered ---
    const treePositions = [
      { x: 50, y: 80 }, { x: 120, y: 50 },
      { x: 720, y: 60 }, { x: 760, y: 120 },
      { x: 40, y: 500 }, { x: 90, y: 550 },
      { x: 700, y: 520 }, { x: 760, y: 480 },
      { x: 300, y: 60 }, { x: 530, y: 70 },
      { x: 50, y: 300 }, { x: 750, y: 350 },
      // Additional trees for denser feeling
      { x: 170, y: 560 }, { x: 630, y: 560 },
      { x: 20, y: 180 }, { x: 780, y: 240 },
    ];

    // Add edge trees for the extended area
    if (ox > 30) {
      // Left edge trees
      for (let ty = 60; ty < 580; ty += 100) {
        treePositions.push({ x: -ox + 30, y: ty + Phaser.Math.Between(-20, 20) });
        if (ox > 80) treePositions.push({ x: -ox + 80, y: ty + 50 + Phaser.Math.Between(-20, 20) });
      }
      // Right edge trees
      for (let ty = 60; ty < 580; ty += 100) {
        treePositions.push({ x: 800 + ox - 30, y: ty + Phaser.Math.Between(-20, 20) });
        if (ox > 80) treePositions.push({ x: 800 + ox - 80, y: ty + 50 + Phaser.Math.Between(-20, 20) });
      }
    }

    for (const pos of treePositions) {
      if (hasTreeSprite) {
        const tree = this.add.image(pos.x + ox, pos.y, 'tree-prop');
        tree.setScale(0.5);
        tree.setDepth(1);
      } else {
        this.drawFallbackTree(pos.x + ox, pos.y);
      }
    }

    // --- Bushes scattered around ---
    const bushPositions = [
      { x: 70, y: 140 }, { x: 160, y: 90 },
      { x: 680, y: 100 }, { x: 740, y: 170 },
      { x: 60, y: 450 }, { x: 130, y: 510 },
      { x: 660, y: 480 }, { x: 730, y: 540 },
      { x: 250, y: 500 }, { x: 550, y: 510 },
      { x: 350, y: 80 }, { x: 480, y: 90 },
      // Additional bushes near houses
      { x: 100, y: 260 }, { x: 200, y: 310 },
      { x: 600, y: 310 }, { x: 700, y: 260 },
    ];

    // Add edge bushes for extended area
    if (ox > 30) {
      for (let by = 100; by < 560; by += 80) {
        bushPositions.push({ x: -ox + 50, y: by + Phaser.Math.Between(-15, 15) });
        bushPositions.push({ x: 800 + ox - 50, y: by + Phaser.Math.Between(-15, 15) });
      }
    }

    for (const pos of bushPositions) {
      if (hasBushSprite) {
        const bush = this.add.image(pos.x + ox, pos.y, 'bush-prop');
        bush.setScale(0.8);
        bush.setDepth(1);
      } else {
        this.drawFallbackBush(pos.x + ox, pos.y);
      }
    }

    // --- Flower patches ---
    this.drawFlowerPatches();

    // --- Wooden fences ---
    this.drawFences();

    // --- Street lamps along paths ---
    this.drawStreetLamps();

    // --- Stone well near fountain area ---
    this.drawWell(320 + ox, 430);

    // --- Stone fountain near center ---
    this.drawFountain(400 + ox, 500);

    // --- Small pond ---
    this.drawPond(680 + ox, 420);

    // --- Signpost at village entrance ---
    this.drawSignpost(400 + ox, 560);

    // --- Stepping stones near pond ---
    this.drawSteppingStones();

    // --- Wooden barrel and crate props ---
    this.drawBarrelsAndCrates();

    // --- Ambient creatures (treant and mole) ---
    this.placeCreatures();
  }

  drawFlowerPatches() {
    const flowerGfx = this.add.graphics();
    flowerGfx.setDepth(1);
    const ox = this.offsetX;

    const patches = [
      { x: 200 + ox, y: 350, count: 6 },
      { x: 600 + ox, y: 360, count: 5 },
      { x: 100 + ox, y: 380, count: 4 },
      { x: 320 + ox, y: 520, count: 5 },
      { x: 500 + ox, y: 540, count: 4 },
      { x: 180 + ox, y: 170, count: 3 },
      { x: 620 + ox, y: 170, count: 3 },
      // More flower patches around houses
      { x: 80 + ox, y: 240, count: 4 },
      { x: 220 + ox, y: 200, count: 3 },
      { x: 580 + ox, y: 200, count: 3 },
      { x: 720 + ox, y: 240, count: 4 },
      { x: 450 + ox, y: 400, count: 3 },
    ];

    const flowerColors = [0xff6b6b, 0xff9999, 0xffcc66, 0xcc88ff, 0x66ccff, 0xff88aa, 0xffaacc, 0xaaddff];

    for (const patch of patches) {
      for (let i = 0; i < patch.count; i++) {
        const fx = patch.x + Phaser.Math.Between(-16, 16);
        const fy = patch.y + Phaser.Math.Between(-10, 10);
        const color = flowerColors[Phaser.Math.Between(0, flowerColors.length - 1)];

        // Stem
        flowerGfx.fillStyle(0x3a8a3a, 1);
        flowerGfx.fillRect(fx, fy, 1, 5);

        // Petals
        flowerGfx.fillStyle(color, 1);
        flowerGfx.fillCircle(fx, fy, 3);

        // Center
        flowerGfx.fillStyle(0xffee88, 1);
        flowerGfx.fillCircle(fx, fy, 1);
      }
    }
  }

  drawFences() {
    const fenceGfx = this.add.graphics();
    fenceGfx.setDepth(1);
    const ox = this.offsetX;

    const fenceSegments = [
      { x1: 20 + ox, x2: 120 + ox, y: 420 },
      { x1: 680 + ox, x2: 780 + ox, y: 420 },
      { x1: 240 + ox, x2: 310 + ox, y: 100 },
      { x1: 490 + ox, x2: 560 + ox, y: 100 },
      // Additional fences around village perimeter
      { x1: 20 + ox, x2: 20 + ox, y: 580, vertical: true, y2: 460 },
      { x1: 780 + ox, x2: 780 + ox, y: 580, vertical: true, y2: 460 },
    ];

    for (const seg of fenceSegments) {
      if (seg.vertical) {
        // Vertical fence
        const postSpacing = 20;
        for (let fy = seg.y2; fy <= seg.y; fy += postSpacing) {
          fenceGfx.fillStyle(0x8b6914, 1);
          fenceGfx.fillRect(seg.x1 - 2, fy - 12, 4, 14);
          fenceGfx.fillStyle(0xa07818, 1);
          fenceGfx.fillRect(seg.x1 - 3, fy - 13, 6, 3);
        }
        fenceGfx.fillStyle(0x8b6914, 1);
        fenceGfx.fillRect(seg.x1 - 1, seg.y2 - 10, 2, seg.y - seg.y2);
        fenceGfx.fillRect(seg.x1 - 1, seg.y2 - 5, 2, seg.y - seg.y2);
      } else {
        const postSpacing = 20;
        for (let fx = seg.x1; fx <= seg.x2; fx += postSpacing) {
          fenceGfx.fillStyle(0x8b6914, 1);
          fenceGfx.fillRect(fx - 2, seg.y - 12, 4, 14);
          fenceGfx.fillStyle(0xa07818, 1);
          fenceGfx.fillRect(fx - 3, seg.y - 13, 6, 3);
        }
        fenceGfx.fillStyle(0x8b6914, 1);
        fenceGfx.fillRect(seg.x1, seg.y - 10, seg.x2 - seg.x1, 2);
        fenceGfx.fillRect(seg.x1, seg.y - 5, seg.x2 - seg.x1, 2);
      }
    }
  }

  drawStreetLamps() {
    const gfx = this.add.graphics();
    gfx.setDepth(3);
    const ox = this.offsetX;

    const lampPositions = [
      { x: 280 + ox, y: 200 }, { x: 520 + ox, y: 200 },
      { x: 350 + ox, y: 400 }, { x: 450 + ox, y: 400 },
      { x: 200 + ox, y: 440 }, { x: 600 + ox, y: 440 },
    ];

    for (const pos of lampPositions) {
      // Pole
      gfx.fillStyle(0x555555, 1);
      gfx.fillRect(pos.x - 1, pos.y - 18, 3, 20);

      // Lamp head
      gfx.fillStyle(0x666666, 1);
      gfx.fillRect(pos.x - 4, pos.y - 22, 9, 5);

      // Light glow
      gfx.fillStyle(0xffee88, 0.25);
      gfx.fillCircle(pos.x, pos.y - 20, 12);
      gfx.fillStyle(0xffee88, 0.15);
      gfx.fillCircle(pos.x, pos.y - 16, 18);

      // Lamp flame
      gfx.fillStyle(0xffcc33, 0.8);
      gfx.fillCircle(pos.x, pos.y - 19, 2);
    }
  }

  drawWell(x, y) {
    const gfx = this.add.graphics();
    gfx.setDepth(2);

    // Stone base
    gfx.fillStyle(0x888888, 1);
    gfx.fillEllipse(x, y + 4, 28, 12);

    // Wall
    gfx.fillStyle(0x999999, 1);
    gfx.fillRect(x - 12, y - 10, 24, 14);

    // Stone texture lines
    gfx.lineStyle(1, 0x777777, 0.4);
    gfx.lineBetween(x - 12, y - 4, x + 12, y - 4);
    gfx.lineBetween(x - 12, y, x + 12, y);

    // Roof supports
    gfx.fillStyle(0x664422, 1);
    gfx.fillRect(x - 11, y - 22, 3, 12);
    gfx.fillRect(x + 8, y - 22, 3, 12);

    // Roof
    gfx.fillStyle(0x8b4513, 1);
    gfx.beginPath();
    gfx.moveTo(x - 16, y - 22);
    gfx.lineTo(x, y - 30);
    gfx.lineTo(x + 16, y - 22);
    gfx.closePath();
    gfx.fillPath();

    // Water inside
    gfx.fillStyle(0x3377aa, 0.6);
    gfx.fillEllipse(x, y - 2, 18, 6);

    // Bucket
    gfx.fillStyle(0x8b6914, 1);
    gfx.fillRect(x + 2, y - 16, 6, 8);
    gfx.lineStyle(1, 0x666666, 0.6);
    gfx.lineBetween(x + 5, y - 16, x + 5, y - 22);
  }

  drawFountain(x, y) {
    const gfx = this.add.graphics();
    gfx.setDepth(1);

    // Base — circular stone
    gfx.fillStyle(0x999999, 1);
    gfx.fillEllipse(x, y + 6, 40, 16);

    // Basin
    gfx.fillStyle(0xaaaaaa, 1);
    gfx.fillEllipse(x, y, 34, 12);

    // Water surface
    gfx.fillStyle(0x4488cc, 0.7);
    gfx.fillEllipse(x, y, 28, 8);

    // Center pillar
    gfx.fillStyle(0xbbbbbb, 1);
    gfx.fillRect(x - 3, y - 16, 6, 16);

    // Top bowl
    gfx.fillStyle(0xaaaaaa, 1);
    gfx.fillEllipse(x, y - 16, 14, 6);

    // Water drops
    gfx.fillStyle(0x66aadd, 0.6);
    gfx.fillCircle(x - 6, y - 8, 2);
    gfx.fillCircle(x + 5, y - 10, 1.5);
    gfx.fillCircle(x + 8, y - 6, 1.5);
    gfx.fillCircle(x - 4, y - 4, 1);
  }

  drawPond(x, y) {
    const gfx = this.add.graphics();
    gfx.setDepth(0);

    // Pond border (dirt/rocks)
    gfx.fillStyle(0x887755, 0.6);
    gfx.fillEllipse(x, y, 60, 36);

    // Small rocks around pond
    const rockGfx = this.add.graphics();
    rockGfx.setDepth(0);
    rockGfx.fillStyle(0x888877, 0.7);
    rockGfx.fillCircle(x - 26, y + 4, 3);
    rockGfx.fillCircle(x + 24, y - 2, 4);
    rockGfx.fillCircle(x - 20, y - 10, 3);
    rockGfx.fillCircle(x + 18, y + 10, 3);

    // Water
    gfx.fillStyle(0x3377aa, 0.7);
    gfx.fillEllipse(x, y, 50, 28);

    // Water shimmer
    gfx.fillStyle(0x88bbdd, 0.4);
    gfx.fillEllipse(x - 6, y - 3, 18, 8);

    // Lily pads
    gfx.fillStyle(0x338833, 0.8);
    gfx.fillCircle(x + 10, y + 4, 5);
    gfx.fillStyle(0x44aa44, 0.8);
    gfx.fillCircle(x + 10, y + 4, 3);

    gfx.fillStyle(0x338833, 0.7);
    gfx.fillCircle(x - 12, y + 6, 3);

    gfx.fillStyle(0x338833, 0.7);
    gfx.fillCircle(x - 6, y - 8, 4);
    gfx.fillStyle(0x44aa44, 0.6);
    gfx.fillCircle(x - 6, y - 8, 2);

    // Tiny flower on lily pad
    gfx.fillStyle(0xff88aa, 0.8);
    gfx.fillCircle(x + 10, y + 3, 1.5);
  }

  drawSignpost(x, y) {
    const gfx = this.add.graphics();
    gfx.setDepth(2);

    // Post
    gfx.fillStyle(0x664422, 1);
    gfx.fillRect(x - 2, y - 28, 5, 30);

    // Sign board
    gfx.fillStyle(0x8b6914, 1);
    gfx.fillRect(x - 20, y - 28, 40, 14);
    gfx.lineStyle(1, 0x553311, 0.6);
    gfx.strokeRect(x - 20, y - 28, 40, 14);

    // Text on sign
    this.add.text(x, y - 21, 'VILLAGE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5px',
      color: '#f4e4c1',
    }).setOrigin(0.5).setDepth(3);
  }

  drawSteppingStones() {
    const gfx = this.add.graphics();
    gfx.setDepth(0);
    const ox = this.offsetX;

    // Stepping stones from path to pond
    const stones = [
      { x: 640 + ox, y: 400 }, { x: 650 + ox, y: 410 },
      { x: 660 + ox, y: 405 }, { x: 655 + ox, y: 420 },
    ];

    for (const s of stones) {
      gfx.fillStyle(0x999988, 0.7);
      gfx.fillEllipse(s.x, s.y, 8, 6);
      gfx.fillStyle(0xaaa99a, 0.4);
      gfx.fillEllipse(s.x - 1, s.y - 1, 5, 3);
    }

    // Stepping stones near well
    const wellStones = [
      { x: 300 + ox, y: 420 }, { x: 310 + ox, y: 425 },
      { x: 330 + ox, y: 422 },
    ];
    for (const s of wellStones) {
      gfx.fillStyle(0x999988, 0.7);
      gfx.fillEllipse(s.x, s.y, 7, 5);
    }
  }

  drawBarrelsAndCrates() {
    const gfx = this.add.graphics();
    gfx.setDepth(2);
    const ox = this.offsetX;

    // Barrel near cottage (About Me)
    this.drawBarrel(gfx, 205 + ox, 280);
    this.drawBarrel(gfx, 218 + ox, 278);

    // Crate near office (Work Experience)
    this.drawCrate(gfx, 460 + ox, 188);
    this.drawCrate(gfx, 474 + ox, 190);

    // Barrel near school (Education)
    this.drawBarrel(gfx, 595 + ox, 280);
  }

  drawBarrel(gfx, x, y) {
    // Body
    gfx.fillStyle(0x8b5e3c, 1);
    gfx.fillRect(x - 6, y - 8, 12, 14);
    // Rounded top
    gfx.fillEllipse(x, y - 8, 12, 4);
    // Metal bands
    gfx.fillStyle(0x666666, 1);
    gfx.fillRect(x - 6, y - 4, 12, 2);
    gfx.fillRect(x - 6, y + 2, 12, 2);
    // Top highlight
    gfx.fillStyle(0x9b6e4c, 0.5);
    gfx.fillEllipse(x, y - 8, 8, 2);
  }

  drawCrate(gfx, x, y) {
    // Body
    gfx.fillStyle(0xa07830, 1);
    gfx.fillRect(x - 7, y - 7, 14, 14);
    // Outline
    gfx.lineStyle(1, 0x705020, 0.6);
    gfx.strokeRect(x - 7, y - 7, 14, 14);
    // Cross planks
    gfx.lineBetween(x - 7, y - 7, x + 7, y + 7);
    gfx.lineBetween(x + 7, y - 7, x - 7, y + 7);
  }

  placeCreatures() {
    const ox = this.offsetX;

    // Treant — ambient creature near trees (left side)
    if (this.textures.exists('treant-idle-front')) {
      const treant = this.add.sprite(80 + ox, 350, 'treant-idle-front', 0);
      treant.setScale(1.2);
      treant.setDepth(1);
      this.tweens.add({
        targets: treant,
        y: treant.y - 2,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Second treant on right side
    if (this.textures.exists('treant-idle-front')) {
      const treant2 = this.add.sprite(740 + ox, 380, 'treant-idle-front', 0);
      treant2.setScale(1.0);
      treant2.setFlipX(true);
      treant2.setDepth(1);
      this.tweens.add({
        targets: treant2,
        y: treant2.y - 2,
        duration: 2400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Mole — small critter near bushes (bottom right)
    if (this.textures.exists('mole-idle-front')) {
      const mole = this.add.sprite(590 + ox, 530, 'mole-idle-front', 0);
      mole.setScale(1.0);
      mole.setDepth(1);
      this.tweens.add({
        targets: mole,
        alpha: { from: 1, to: 0.3 },
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Second mole near left trees
    if (this.textures.exists('mole-idle-front')) {
      const mole2 = this.add.sprite(150 + ox, 480, 'mole-idle-front', 0);
      mole2.setScale(0.9);
      mole2.setFlipX(true);
      mole2.setDepth(1);
      this.tweens.add({
        targets: mole2,
        alpha: { from: 1, to: 0.4 },
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  drawFallbackTree(x, y) {
    const gfx = this.add.graphics();
    // Trunk
    gfx.fillStyle(0x664422, 1);
    gfx.fillRect(x - 4, y, 8, 18);
    // Canopy layers
    gfx.fillStyle(0x2d6b2d, 1);
    gfx.fillCircle(x, y - 6, 16);
    gfx.fillStyle(0x3a8a3a, 1);
    gfx.fillCircle(x - 4, y - 10, 10);
    gfx.fillCircle(x + 5, y - 8, 10);
    gfx.setDepth(1);
  }

  drawFallbackBush(x, y) {
    const gfx = this.add.graphics();
    gfx.fillStyle(0x3a7a3a, 1);
    gfx.fillCircle(x, y, 8);
    gfx.fillCircle(x - 5, y + 2, 6);
    gfx.fillCircle(x + 5, y + 2, 6);
    gfx.fillStyle(0x4a9a4a, 0.6);
    gfx.fillCircle(x - 2, y - 3, 5);
    gfx.setDepth(1);
  }

  // ----------------------------------------------------------------
  // House interaction zones
  // ----------------------------------------------------------------
  createHouseZones() {
    const houses = this.mapData.houses;
    const ox = this.offsetX;
    for (const [key, house] of Object.entries(houses)) {
      const z = house.zone;
      const zone = this.add.zone(z.x + ox, z.y, z.w, z.h);
      this.physics.add.existing(zone, true);
      zone.setOrigin(0.5);
      zone.name = key;
      this.houseZones[key] = zone;
    }
  }

  // ----------------------------------------------------------------
  // Stable text labels above houses (no tween animation)
  // ----------------------------------------------------------------
  createHouseLabels() {
    const houses = this.mapData.houses;
    const ox = this.offsetX;
    for (const [key, house] of Object.entries(houses)) {
      const labelY = house.y - 70;

      const label = this.add.text(house.x + ox, labelY, house.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      });
      label.setOrigin(0.5);
      label.setDepth(50);
    }
  }

  // ----------------------------------------------------------------
  // Update loop
  // ----------------------------------------------------------------
  update() {
    if (!this.player) return;

    // Block all game input while dialogue is open
    if (this.dialogueOpen) {
      this.player.body.setVelocity(0, 0);
      this.player.moveTarget = null;
      return;
    }

    // Update player movement
    this.player.update();

    // Update NPC proximity check (NPC is static, no following)
    if (this.npc) {
      this.npc.updateProximity(this.player);
    }

    // Check house zone overlaps
    this.activeZone = null;
    for (const [key, zone] of Object.entries(this.houseZones)) {
      const dx = this.player.x - zone.x;
      const dy = this.player.y - zone.y;
      const halfW = zone.width / 2;
      const halfH = zone.height / 2;
      if (Math.abs(dx) < halfW && Math.abs(dy) < halfH) {
        this.activeZone = key;
        break;
      }
    }

    // Show/hide interaction prompt
    if (this.activeZone) {
      const house = this.mapData.houses[this.activeZone];
      const action = this.isTouch ? 'Tap' : 'Press SPACE';
      this.promptText.setText(`${action} to enter ${house.label}`);
      this.promptText.setVisible(true);
      this.promptText.setInteractive();
    } else if (this.npc && this.npc.playerNearby) {
      const action = this.isTouch ? 'Tap' : 'Press SPACE';
      this.promptText.setText(`${action} to talk`);
      this.promptText.setVisible(true);
      this.promptText.setInteractive();
    } else {
      this.promptText.setVisible(false);
      this.promptText.disableInteractive();
    }

    // Reset interaction cooldown once the player has walked away
    if (this._interactionCooldown) {
      const nearNPC = this.npc && this.npc.playerNearby;
      if (!nearNPC && !this.activeZone) {
        this._interactionCooldown = false;
      }
    }

    // Handle interaction input
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      if (this._interactionCooldown) { /* wait for player to move away */ }
      else if (this.activeZone) {
        this.handleHouseInteraction(this.activeZone);
      } else if (this.npc && this.npc.playerNearby) {
        this.handleNPCInteraction();
      }
    }

    // --- Update debug overlay ---
    if (this._debugText) {
      const p = this.input.activePointer;
      this._debugText.setText(
        `v7 | ptr.isDown=${p.isDown}\n` +
        `dlgOpen=${this.dialogueOpen} cool=${this._dialogueCooldown}\n` +
        `iCool=${this._interactionCooldown} zone=${this.activeZone || '-'}\n` +
        `npcNear=${this.npc?.playerNearby || false}\n` +
        `phaserTaps=${this._debugTapCount} rawTaps=${this._debugRawTapCount}\n` +
        `moveTarget=${this.player.moveTarget ? 'yes' : 'no'}\n` +
        `vel=${Math.round(this.player.body.velocity.x)},${Math.round(this.player.body.velocity.y)}`
      );
    }
  }

  // ----------------------------------------------------------------
  // Interaction handlers
  // ----------------------------------------------------------------
  handleHouseInteraction(houseKey) {
    const resumeData = this.cache.json.get('resume-data');
    if (!resumeData) return;

    const houseData = resumeData.houses[houseKey];
    if (!houseData) return;

    this.dialogueOpen = true;
    this.dialogue.show({
      type: 'island',
      title: houseData.title,
      content: houseData,
      islandKey: houseKey,
    });
  }

  handleNPCInteraction() {
    const resumeData = this.cache.json.get('resume-data');
    if (!resumeData || !resumeData.npc) return;

    const npc = resumeData.npc;
    const lines = this.npcTalkedOnce && npc.dialogueShort
      ? npc.dialogueShort
      : npc.dialogue;

    this.dialogueOpen = true;
    this.dialogue.show({
      type: 'npc',
      title: npc.name,
      portrait: npc.portrait,
      content: lines,
    });
    this.npcTalkedOnce = true;
  }

  _getDefaultMapData() {
    return {
      spawn: { x: 400, y: 450 },
      houses: {
        aboutMe: {
          label: 'About Me',
          x: 150, y: 240,
          zone: { x: 150, y: 280, w: 100, h: 60 },
        },
        workExperience: {
          label: 'Work Experience',
          x: 400, y: 140,
          zone: { x: 400, y: 180, w: 100, h: 60 },
        },
        education: {
          label: 'Education',
          x: 650, y: 240,
          zone: { x: 650, y: 280, w: 100, h: 60 },
        },
      },
    };
  }
}
