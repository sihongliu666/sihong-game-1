# Wuxia Resume Game - Specification

A personal resume website built as a 2D Wuxia-themed pixel art game. The player (visitor) navigates a hero character across an ocean map to visit islands, each representing a section of the resume. An NPC (representing the site owner) lives on the map and can be interacted with for personal introduction.

---

## 1. Game Overview

| Property | Value |
|----------|-------|
| **Type** | Top-down 2D RPG-style exploration |
| **Engine** | Phaser 3 (HTML5 game framework) |
| **Purpose** | Personal resume / portfolio website |
| **View** | Top-down overworld map |
| **Controls** | Arrow keys / WASD to move, Enter/Space to interact |

---

## 2. Game Scenes

### 2.1 World Map (Main Scene)

An ocean-based overworld with 4 islands arranged across the map. The player spawns on a central dock/pier and can walk/sail between islands. Water tiles surround all islands.

**Islands:**

| Island | Theme | Color Accent | Description |
|--------|-------|-------------|-------------|
| **Projects Island** | Rocky/Forest | Green | Showcases personal and professional projects |
| **Education Island** | Mountain | Blue | Lists degrees, certifications, courses |
| **Work Experience Island** | Town | Warm/Orange | Timeline of professional roles |
| **Hobby Island** | Beach | Yellow/Sand | Personal interests and side activities |

### 2.2 Island Interior (Detail View)

When the player walks onto an island and presses interact, a dialogue/scroll UI appears with the resume content for that section. Each island has its own tileset style and NPC guide.

### 2.3 NPC Interaction (Dialogue System)

- One primary NPC: **"Sihong"** (the site owner) — appears on the main map near the spawn point
- Pressing interact near the NPC opens a dialogue box with a character portrait and personal introduction text
- Each island can optionally have a secondary NPC or sign post that triggers the resume content

---

## 3. Asset Manifest

All paths are relative to the project root.

### 3.1 World Map — Overworld Tileset

Used to build the ocean, grass, sand, and island terrain on the main map.

```
Legacy Collection/Assets/Environments/Overworld/Overworld 32x32/Tileset/overworld.png
Legacy Collection/Assets/Environments/Overworld/Overworld 32x32/previews/productiontiles.png
Legacy Collection/Assets/Environments/Overworld/Overworld 32x32/previews/tiles-export.png
Legacy Collection/Assets/Environments/Overworld/Overworld 32x32/previews/beaches.png
Legacy Collection/Assets/Environments/Overworld/Overworld 16x16/Tileset/overworld.png
Legacy Collection/Assets/Environments/Overworld/Overworld 16x16/previews/overworld-preview.png
```

**Primary tileset:** `Overworld 32x32/Tileset/overworld.png`
Contains: grass, water, sand, bridges, paths, trees — everything needed for the top-down world map.

### 3.2 Ocean / Water Background

Parallax ocean layers for the water surrounding islands.

```
Legacy Collection/Assets/Environments/Ocean View Files/Layers/Day/Back.png
Legacy Collection/Assets/Environments/Ocean View Files/Layers/Day/Middle.png
Legacy Collection/Assets/Environments/Ocean View Files/Layers/Day/Tile.png
Legacy Collection/Assets/Environments/Ocean View Files/Layers/Day/Clouds.png
Legacy Collection/Assets/Environments/Ocean View Files/Previews/day.png
```

### 3.3 Projects Island — Forest Theme

```
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/tileset.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/objects.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/sliced-objects/tree-orange.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/sliced-objects/tree-pink.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/sliced-objects/rock.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/sliced-objects/rock-monument.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/sliced-objects/sign.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/sliced-objects/bush.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/sliced-objects/bush-tall.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/sliced-objects/trunk.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/waterfall animation/waterfall-1.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/waterfall animation/waterfall-2.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/environment/waterfall animation/waterfall-3.png
```

### 3.4 Education Island — Mountain Theme

```
Legacy Collection/Assets/Environments/Tiny RPG Mountain Files/png/tileset.png
Legacy Collection/Assets/Environments/Tiny RPG Mountain Files/png/bridge.png
Legacy Collection/Assets/Environments/Tiny RPG Mountain Files/Preview/mountain-preview.png
Legacy Collection/Assets/Environments/Mountain Dusk/version A/Layers/sky.png
Legacy Collection/Assets/Environments/Mountain Dusk/version A/Layers/far-mountains.png
Legacy Collection/Assets/Environments/Mountain Dusk/version A/Layers/mountains.png
Legacy Collection/Assets/Environments/Mountain Dusk/version A/Layers/trees.png
Legacy Collection/Assets/Environments/Mountain Dusk/version A/Layers/far-clouds.png
```

### 3.5 Work Experience Island — Town Theme

```
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Town/tileset/tileset.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Town/tileset/grass-tile.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Town/tileset/grass-tile-2.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Town/tileset/grass-tile-3.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Town/tileset/example.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Town/spritesheets/npc.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Vegetation props/tree-1.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Vegetation props/tree-2.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Vegetation props/bush-1.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Vegetation props/bush-2.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Vegetation props/bush-3.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Vegetation props/plant-1.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Vegetation props/plant-2.png
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Vegetation props/plant-3.png
```

### 3.6 Hobby Island — Beach/Rocky Beach Theme

```
Legacy Collection/Assets/Environments/Rocky Beach environment/layers/background.png
Legacy Collection/Assets/Environments/Rocky Beach environment/layers/tileset.png
Legacy Collection/Assets/Environments/Rocky Beach environment/layers/mountain.png
Legacy Collection/Assets/Environments/Rocky Beach environment/layers/tiles-example.png
Legacy Collection/Assets/Misc/Water splash/spritesheet.png
Legacy Collection/Assets/Misc/Water splash/Sprites/frame1.png
Legacy Collection/Assets/Misc/Water splash/Sprites/frame2.png
Legacy Collection/Assets/Misc/Water splash/Sprites/frame3.png
```

### 3.7 Boat / Raft (Water Navigation)

Player switches to a boat sprite when sailing between islands.

```
Legacy Collection/Assets/Environments/ships-graveyard/PNG/layers/boat-front.png
Legacy Collection/Assets/Environments/ships-graveyard/PNG/layers/boat-middle.png
Legacy Collection/Assets/Environments/ships-graveyard/PNG/layers/boat-far.png
```

Note: These are side-view boat layers. For top-down usage, we may need to extract/rotate a small raft from the overworld tileset, or draw a simple 32x32 raft sprite. The overworld tileset (`Overworld 32x32/Tileset/overworld.png`) may contain boat tiles — check the tileset for raft/dock tiles.

### 3.8 Player Character (Hero)

The player-controlled character who navigates the map on land. Uses the Tiny RPG hero with 4-directional walk, idle, and attack animations.

**Spritesheets (recommended for Phaser 3):**
```
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/hero/idle/hero-idle-front.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/hero/idle/hero-idle-back.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/hero/idle/hero-idle-side.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/hero/walk/hero-walk-front.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/hero/walk/hero-back-walk.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/hero/walk/hero-walk-side.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/hero/attack/hero-attack-front.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/hero/attack/hero-attack-back.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/hero/attack/hero-attack-side.png
```

**Individual frames (for custom animation):**
```
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/idle/hero-idle-front/hero-idle-front.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/idle/hero-idle-back/hero-idle-back.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/idle/hero-idle-side/hero-idle-side.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-front/hero-walk-front-1.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-front/hero-walk-front-2.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-front/hero-walk-front-3.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-front/hero-walk-front-4.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-front/hero-walk-front-5.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-front/hero-walk-front-6.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-side/hero-walk-side-1.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-side/hero-walk-side-2.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-side/hero-walk-side-3.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-side/hero-walk-side-4.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-side/hero-walk-side-5.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-side/hero-walk-side-6.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-back/hero-walk-back-1.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-back/hero-walk-back-2.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-back/hero-walk-back-3.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-back/hero-walk-back-4.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-back/hero-walk-back-5.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/hero/walk/hero-walk-back/hero-walk-back-6.png
```

### 3.9 NPC — "Sihong" (Site Owner)

Uses the Tiny RPG Town NPC spritesheet for the main NPC character, with Warped Portraits for the dialogue portrait.

**NPC Sprite:**
```
Legacy Collection/Assets/Packs/tiny-rpg-town-files/Environments/Town/spritesheets/npc.png
```

**Dialogue Portraits (choose one set):**
```
Legacy Collection/Assets/Misc/Warped Portraits Files/Portraits with transparent bg/portraits1.png
Legacy Collection/Assets/Misc/Warped Portraits Files/Portraits with transparent bg/portraits2.png
Legacy Collection/Assets/Misc/Warped Portraits Files/Portraits with transparent bg/portraits3.png
Legacy Collection/Assets/Misc/Warped Portraits Files/Portraits with transparent bg/portraits4.png
```

### 3.10 Island NPCs / Enemies (Decorative)

Optional ambient characters on islands to add life.

**Treant (Projects Island guardian):**
```
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/treant/idle/treant-idle-front.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/treant/idle/treant-idle-side.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/treant/walk/treant-walk-front.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/treant/walk/treant-walk-side.png
```

**Mole (Hobby Island critter):**
```
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/mole/idle/mole-idle-front.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/mole/idle/mole-idle-side.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/mole/walk/mole-walk-front.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/mole/walk/mole-walk-side.png
```

### 3.11 Collectibles & UI Decorations

```
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/misc/gem.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/spritesheets/misc/coin.png
Legacy Collection/Assets/Misc/gems/spritesheets/gems-spritesheet.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/misc/hearts/hearts-1.png
Legacy Collection/Assets/Packs/tiny-RPG-forest-files/PNG/sprites/misc/hearts/hearts-2.png
```

### 3.12 Visual Effects (Wuxia Flair)

Martial arts-style effects for transitions or decorative animations.

**Slash Effects:**
```
Legacy Collection/Assets/Misc/Grotto-escape-2-FX/spritesheets/slash-horizontal.png
Legacy Collection/Assets/Misc/Grotto-escape-2-FX/spritesheets/slash-upward.png
Legacy Collection/Assets/Misc/Grotto-escape-2-FX/spritesheets/slash-circular.png
```

**Energy Effects:**
```
Legacy Collection/Assets/Misc/Grotto-escape-2-FX/spritesheets/energy-smack.png
Legacy Collection/Assets/Misc/Grotto-escape-2-FX/spritesheets/energy-shield.png
Legacy Collection/Assets/Misc/Grotto-escape-2-FX/spritesheets/fire-ball.png
Legacy Collection/Assets/Misc/Grotto-escape-2-FX/spritesheets/electro-shock.png
```

### 3.13 Fantasy Weapons (Decorative / Island Props)

```
Legacy Collection/Assets/Misc/fantasy weapons set/PNG/1.png
Legacy Collection/Assets/Misc/fantasy weapons set/PNG/2.png
Legacy Collection/Assets/Misc/fantasy weapons set/PNG/3.png
Legacy Collection/Assets/Misc/fantasy weapons set/PNG/4.png
Legacy Collection/Assets/Misc/fantasy weapons set/PNG/5.png
Legacy Collection/Assets/Misc/fantasy weapons set/PNG/6.png
Legacy Collection/Assets/Misc/fantasy weapons set/PNG/7.png
Legacy Collection/Assets/Misc/fantasy weapons set/PNG/8.png
Legacy Collection/Assets/Misc/fantasy weapons set/PNG/9.png
Legacy Collection/Assets/Misc/fantasy weapons set/PNG/10.png
```

---

## 4. Functional Requirements

### 4.1 World Map

- [ ] Render a top-down tile-based map using the 32x32 overworld tileset
- [ ] Map contains ocean/water tiles as the base layer
- [ ] 4 distinct islands placed on the map, each visually differentiated
- [ ] Player spawns at a central location (dock or small starting island)
- [ ] Camera follows the player character
- [ ] Smooth scrolling as the player moves

### 4.2 Player Movement

- [ ] 4-directional movement (up/down/left/right) using arrow keys or WASD
- [ ] Animated walk cycle matching the direction of movement
- [ ] Idle animation when the player is not moving
- [ ] Collision detection — player cannot walk into deep water or off-map
- [ ] When entering water zones, player switches to a boat/raft sprite and sails between islands
- [ ] Transition animation when boarding/disembarking the boat at island shores

### 4.3 Island Interaction

- [ ] Each island has a clearly marked interaction zone (sign post, glowing area, or NPC)
- [ ] When the player enters the zone, a prompt appears ("Press Enter to explore")
- [ ] Pressing Enter/Space opens the island's content panel

### 4.4 NPC System

- [ ] Sihong NPC stands near the spawn point on the main map
- [ ] NPC has an idle animation (using the town NPC sprite)
- [ ] When the player approaches the NPC, an interaction prompt appears
- [ ] Pressing Enter/Space opens a dialogue box with:
  - Character portrait (from Warped Portraits)
  - Name label: "Sihong"
  - Personal introduction text (typewriter effect)
  - "Next" / "Close" button to advance or dismiss

### 4.5 Resume Content Panels

Each island opens a styled content panel (RPG dialogue/scroll style):

#### Projects Island
- [ ] List of projects with title, description, tech stack, and links
- [ ] Scroll/paginate if content overflows

#### Education Island
- [ ] Degree(s), institution, graduation year
- [ ] Certifications and relevant coursework

#### Work Experience Island
- [ ] Company name, role, date range
- [ ] Bullet points for each role's highlights
- [ ] Chronological order (most recent first)

#### Hobby Island
- [ ] List of hobbies and personal interests
- [ ] Optional: small icons or images for each hobby

### 4.6 UI / HUD

- [ ] Mini-map or island labels visible on the world map
- [ ] Floating labels above each island ("Projects", "Education", etc.)
- [ ] Interaction prompts near NPCs and island zones
- [ ] Dialogue box with pixel art border/frame
- [ ] Responsive — works on desktop browsers (mobile optional)

---

## 5. Visual Design

### 5.1 Art Style
- Pixel art, 32x32 tile grid for the overworld
- Tiny RPG character style (16x16 characters on 32x32 world)
- Consistent color palette across all islands
- Wuxia flavor through: martial arts effect animations on transitions, fantasy weapons as decorative props, mountain/mist scenery

### 5.2 Map Layout (Approximate)

```
         [Education Island]
              (Mountain)
                  ~
                  ~
[Projects]~~~~[SPAWN]~~~~[Work Experience]
  (Forest)    [Sihong]       (Town)
                  ~
                  ~
          [Hobby Island]
             (Beach)

~ = water (player sails via boat/raft)
```

### 5.3 Color Themes per Island

| Island | Primary | Tileset |
|--------|---------|---------|
| Projects | Green/Forest | tiny-RPG-forest tileset |
| Education | Blue/Mountain | Tiny RPG Mountain tileset |
| Work Experience | Warm/Town | tiny-rpg-town tileset |
| Hobby | Sand/Coastal | Rocky Beach tileset |

---

## 6. Technical Architecture

```
index.html              — Entry point
styles.css              — UI styling (dialogue boxes, HUD overlays)
src/
  main.js               — Phaser 3 game config and initialization
  scenes/
    BootScene.js         — Asset preloading
    WorldMapScene.js     — Main overworld map scene
    IslandScene.js       — Island interior / detail view
  entities/
    Player.js            — Player character controller (land + boat states)
    NPC.js               — NPC behavior and dialogue trigger
    Boat.js              — Boat sprite and sailing mechanics
  systems/
    Dialogue.js          — Dialogue box / content panel system (DOM overlay)
    IslandZone.js        — Island interaction zone detection
  data/
    resume.json          — All resume content (projects, education, work, hobbies)
    mapData.json         — Tiled map export (JSON) for Phaser tilemap loader
assets/                  — Copied/organized from Legacy Collection
  tileset/               — Overworld and island tilesets
  characters/            — Hero, NPC, and ambient creature spritesheets
  portraits/             — NPC dialogue portraits
  fx/                    — Visual effects spritesheets
  props/                 — Weapons, signs, decorations
```

### 6.1 Data-Driven Content

All resume text is stored in `resume.json` so it can be updated without touching game code:

```json
{
  "npc": {
    "name": "Sihong",
    "portrait": "assets/portraits/portrait.png",
    "dialogue": [
      "Welcome, traveler! I am Sihong.",
      "Feel free to explore these islands to learn about me.",
      "Each island holds a different part of my story."
    ]
  },
  "islands": {
    "projects": { ... },
    "education": { ... },
    "workExperience": { ... },
    "hobbies": { ... }
  }
}
```

---

## 7. Non-Functional Requirements

- [ ] Page loads in under 3 seconds on broadband
- [ ] All assets are optimized (compressed PNGs, sprite atlases where possible)
- [ ] Phaser 3 as the sole runtime dependency (loaded via CDN or bundled)
- [ ] Deployable as a static site (GitHub Pages, Netlify, Vercel)
- [ ] Keyboard-only navigation (accessibility baseline)
- [ ] Content is indexable — include a `<noscript>` fallback with plain HTML resume
