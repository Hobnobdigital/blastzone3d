# 🧩 BLASTZONE3D - CODING SPECIFICATION
**For Claude Code CLI to implement**

## 🎯 CRITICAL REQUIREMENTS

### Camera & View (HIGHEST PRIORITY - FIX FIRST!)
```typescript
// Current: Tilted view with blind spots
camera.position.set(0, 10, 10);
camera.lookAt(0, 0, 0);

// REQUIRED: Flatter isometric, fully visible 13x13 grid
camera.position.set(0, 18, 12); // Higher, less tilted
camera.lookAt(0, 0, 0);
camera.fov = 50; // Wider FOV to see full board

// OR use orthographic camera for perfect isometric:
const camera = new THREE.OrthographicCamera(
  -aspect * viewSize / 2,
  aspect * viewSize / 2, 
  viewSize / 2,
  -viewSize / 2,
  0.1,
  1000
);
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);
```

**Test:** All 13x13 cells must be visible. No blind spots. User can see entire play area.

### Color Palette (VIBRANT, NOT DARK!)
```typescript
// Current: Dark gray background (0x222222) - BORING!
scene.background = new THREE.Color(0x222222); // ❌

// REQUIRED: Vibrant, themed backgrounds
const LEVEL_THEMES = {
  grasslands: {
    background: new THREE.Color(0x87CEEB), // Sky blue
    ambient: new THREE.Color(0xFFFFDD),
    floor: 0x4CAF50, // Grass green
    walls: 0xD2691E // Saddle brown
  },
  lava: {
    background: new THREE.Color(0x1a0000), // Dark red
    ambient: new THREE.Color(0xFF6B35),
    floor: 0x8B0000, // Dark red
    walls: 0x2F2F2F // Charcoal
  },
  ice: {
    background: new THREE.Color(0xE0F7FA), // Light cyan
    ambient: new THREE.Color(0xB3E5FC),
    floor: 0x81D4FA, // Light blue
    walls: 0xB0BEC5 // Blue gray
  }
};
```

## 📐 GAME ARCHITECTURE

### File Structure
```
src/
├── main.ts              # Entry point, initialization
├── Game.ts              # Main game class, game loop
├── systems/
│   ├── InputManager.ts  # Keyboard/touch input
│   ├── AudioManager.ts  # Music + SFX playback
│   ├── AssetLoader.ts   # Load textures, models, audio
│   └── ParticleSystem.ts # Explosion particles
├── entities/
│   ├── Player.ts        # Player character
│   ├── Enemy.ts         # Enemy base class
│   ├── Bomb.ts          # Bomb entity
│   ├── Explosion.ts     # Explosion logic
│   └── PowerUp.ts       # Power-up items
├── world/
│   ├── Grid.ts          # 13x13 grid system
│   ├── Cell.ts          # Grid cell (wall, floor, etc.)
│   └── Level.ts         # Level data & progression
├── ui/
│   ├── HUD.ts           # Health, score, timer
│   ├── Menu.ts          # Main menu
│   ├── PauseMenu.ts     # Pause screen
│   └── VictoryScreen.ts # Level complete screen
└── utils/
    ├── Constants.ts     # Game constants
    └── Helpers.ts       # Utility functions
```

### Grid System (13x13 Bomberman Classic)
```typescript
export class Grid {
  readonly WIDTH = 13;
  readonly HEIGHT = 13;
  readonly CELL_SIZE = 1; // 1 unit in 3D space
  
  cells: Cell[][];
  
  constructor() {
    this.cells = [];
    for (let y = 0; y < this.HEIGHT; y++) {
      this.cells[y] = [];
      for (let x = 0; x < this.WIDTH; x++) {
        // Bomberman pattern: edges + every other interior cell is indestructible
        const isEdge = x === 0 || y === 0 || x === this.WIDTH-1 || y === this.HEIGHT-1;
        const isFixedWall = !isEdge && x % 2 === 0 && y % 2 === 0;
        
        this.cells[y][x] = new Cell({
          x, y,
          type: (isEdge || isFixedWall) ? 'indestructible' : 'floor',
          hasDestructibleWall: !isEdge && !isFixedWall && Math.random() > 0.3
        });
      }
    }
    
    // Clear spawn areas (4 corners for multiplayer, center-left for single player)
    this.clearSpawnArea(1, 1); // Top-left
    this.clearSpawnArea(this.WIDTH-2, 1); // Top-right
    this.clearSpawnArea(1, this.HEIGHT-2); // Bottom-left  
    this.clearSpawnArea(this.WIDTH-2, this.HEIGHT-2); // Bottom-right
  }
  
  clearSpawnArea(x: number, y: number): void {
    // Clear 3x3 area around spawn point
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cell = this.getCell(x + dx, y + dy);
        if (cell && cell.type !== 'indestructible') {
          cell.hasDestructibleWall = false;
        }
      }
    }
  }
  
  getCell(x: number, y: number): Cell | null {
    if (x < 0 || x >= this.WIDTH || y < 0 || y >= this.HEIGHT) return null;
    return this.cells[y][x];
  }
  
  worldToGrid(worldX: number, worldZ: number): { x: number, y: number } {
    return {
      x: Math.floor(worldX / this.CELL_SIZE + this.WIDTH / 2),
      y: Math.floor(worldZ / this.CELL_SIZE + this.HEIGHT / 2)
    };
  }
  
  gridToWorld(gridX: number, gridY: number): { x: number, z: number } {
    return {
      x: (gridX - this.WIDTH / 2) * this.CELL_SIZE,
      z: (gridY - this.HEIGHT / 2) * this.CELL_SIZE
    };
  }
}
```

### Player Movement (Grid-Based)
```typescript
export class Player {
  gridX: number;
  gridY: number;
  worldX: number;
  worldZ: number;
  speed: number = 4; // cells per second
  isMoving: boolean = false;
  direction: { x: number, y: number } = { x: 0, y: 0 };
  
  mesh: THREE.Mesh;
  
  update(deltaTime: number, grid: Grid, input: InputManager): void {
    // Get input direction
    const newDir = input.getDirection(); // { x: -1/0/1, y: -1/0/1 }
    
    if (newDir.x !== 0 || newDir.y !== 0) {
      this.direction = newDir;
      this.isMoving = true;
    }
    
    if (this.isMoving) {
      // Calculate target position
      const targetX = this.worldX + this.direction.x * this.speed * deltaTime;
      const targetZ = this.worldZ + this.direction.y * this.speed * deltaTime;
      
      // Check collision
      const targetGridPos = grid.worldToGrid(targetX, targetZ);
      const targetCell = grid.getCell(targetGridPos.x, targetGridPos.y);
      
      if (targetCell && targetCell.isWalkable()) {
        this.worldX = targetX;
        this.worldZ = targetZ;
        this.mesh.position.set(this.worldX, 0.5, this.worldZ);
      } else {
        this.isMoving = false;
      }
      
      // Snap to grid when close to center
      const cellCenter = grid.gridToWorld(this.gridX, this.gridY);
      const distToCenter = Math.sqrt(
        Math.pow(this.worldX - cellCenter.x, 2) +
        Math.pow(this.worldZ - cellCenter.z, 2)
      );
      
      if (distToCenter < 0.1) {
        this.worldX = cellCenter.x;
        this.worldZ = cellCenter.z;
        this.gridX = targetGridPos.x;
        this.gridY = targetGridPos.y;
      }
    }
  }
  
  placeBomb(grid: Grid): Bomb | null {
    const cell = grid.getCell(this.gridX, this.gridY);
    if (cell && !cell.hasBomb && this.bombsAvailable > 0) {
      this.bombsAvailable--;
      const bomb = new Bomb(this.gridX, this.gridY, this.explosionRange);
      cell.hasBomb = true;
      return bomb;
    }
    return null;
  }
}
```

### Bomb & Explosion Logic
```typescript
export class Bomb {
  gridX: number;
  gridY: number;
  fuseTime: number = 3.0; // 3 seconds
  explosionRange: number = 2;
  mesh: THREE.Mesh;
  
  update(deltaTime: number): boolean {
    this.fuseTime -= deltaTime;
    
    // Pulsing animation as it counts down
    const pulseScale = 1 + Math.sin(this.fuseTime * 10) * 0.1;
    this.mesh.scale.setScalar(pulseScale);
    
    return this.fuseTime <= 0; // Return true when ready to explode
  }
}

export class Explosion {
  range: number;
  directions: Array<{ dx: number, dy: number }> = [
    { dx: 1, dy: 0 },  // Right
    { dx: -1, dy: 0 }, // Left
    { dx: 0, dy: 1 },  // Down
    { dx: 0, dy: -1 }  // Up
  ];
  
  execute(gridX: number, gridY: number, grid: Grid, entities: Entity[]): void {
    // Explode center
    this.explodeCell(gridX, gridY, grid, entities);
    
    // Explode in 4 directions
    for (const dir of this.directions) {
      for (let i = 1; i <= this.range; i++) {
        const cellX = gridX + dir.dx * i;
        const cellY = gridY + dir.dy * i;
        const cell = grid.getCell(cellX, cellY);
        
        if (!cell) break; // Out of bounds
        if (cell.type === 'indestructible') break; // Hit solid wall
        
        this.explodeCell(cellX, cellY, grid, entities);
        
        if (cell.hasDestructibleWall) {
          cell.hasDestructibleWall = false; // Destroy wall
          // Maybe spawn power-up (20% chance)
          if (Math.random() < 0.2) {
            this.spawnPowerUp(cellX, cellY);
          }
          break; // Stop explosion
        }
      }
    }
    
    // Play explosion sound
    audioManager.play('explosion');
    
    // Spawn particle effects
    particleSystem.createExplosion(gridX, gridY);
    
    // Camera shake
    camera.shake(0.3, 0.5);
  }
  
  explodeCell(x: number, y: number, grid: Grid, entities: Entity[]): void {
    const cell = grid.getCell(x, y);
    if (!cell) return;
    
    // Damage entities in this cell
    for (const entity of entities) {
      if (entity.gridX === x && entity.gridY === y) {
        entity.takeDamage(1);
      }
    }
    
    // Remove bomb if present
    if (cell.hasBomb) {
      cell.hasBomb = false;
    }
  }
}
```

### Enemy AI (Simple Chase Behavior)
```typescript
export class Enemy extends Entity {
  aiUpdateInterval: number = 0.5; // Update AI every 0.5s
  aiTimer: number = 0;
  targetDirection: { x: number, y: number } = { x: 0, y: 0 };
  
  update(deltaTime: number, grid: Grid, player: Player): void {
    this.aiTimer += deltaTime;
    
    if (this.aiTimer >= this.aiUpdateInterval) {
      this.aiTimer = 0;
      this.updateAI(grid, player);
    }
    
    // Move toward target
    this.move(deltaTime, grid);
  }
  
  updateAI(grid: Grid, player: Player): void {
    // Simple pathfinding: move toward player
    const dx = player.gridX - this.gridX;
    const dy = player.gridY - this.gridY;
    
    // Choose primary direction (whichever is farther)
    if (Math.abs(dx) > Math.abs(dy)) {
      this.targetDirection = { x: Math.sign(dx), y: 0 };
    } else {
      this.targetDirection = { x: 0, y: Math.sign(dy) };
    }
    
    // Check if path is blocked
    const targetCell = grid.getCell(
      this.gridX + this.targetDirection.x,
      this.gridY + this.targetDirection.y
    );
    
    if (!targetCell || !targetCell.isWalkable()) {
      // Try perpendicular direction
      if (this.targetDirection.x !== 0) {
        this.targetDirection = { x: 0, y: Math.random() > 0.5 ? 1 : -1 };
      } else {
        this.targetDirection = { x: Math.random() > 0.5 ? 1 : -1, y: 0 };
      }
    }
  }
}
```

### Level Progression
```typescript
export interface LevelConfig {
  number: number;
  theme: 'grasslands' | 'cave' | 'lava' | 'ice' | 'space';
  enemyCount: number;
  enemyTypes: string[];
  enemySpeed: number;
  musicTrack: string;
}

export const LEVELS: LevelConfig[] = [
  { number: 1, theme: 'grasslands', enemyCount: 3, enemyTypes: ['balloon'], enemySpeed: 2, musicTrack: 'level-gameplay' },
  { number: 2, theme: 'grasslands', enemyCount: 4, enemyTypes: ['balloon', 'ghost'], enemySpeed: 2.5, musicTrack: 'level-gameplay' },
  { number: 3, theme: 'cave', enemyCount: 5, enemyTypes: ['ghost', 'ghost'], enemySpeed: 3, musicTrack: 'level-gameplay' },
  { number: 4, theme: 'cave', enemyCount: 6, enemyTypes: ['balloon', 'ghost', 'knight'], enemySpeed: 3, musicTrack: 'level-gameplay' },
  { number: 5, theme: 'lava', enemyCount: 7, enemyTypes: ['knight', 'knight', 'ghost'], enemySpeed: 3.5, musicTrack: 'boss-level' },
  // ... up to level 10+
];

export class Level {
  config: LevelConfig;
  grid: Grid;
  player: Player;
  enemies: Enemy[];
  isComplete: boolean = false;
  
  constructor(levelNumber: number) {
    this.config = LEVELS[levelNumber - 1] || LEVELS[0];
    this.grid = new Grid();
    this.applyTheme(this.config.theme);
    this.spawnPlayer();
    this.spawnEnemies();
    audioManager.playMusic(this.config.musicTrack);
  }
  
  update(deltaTime: number): void {
    this.player.update(deltaTime, this.grid);
    
    for (const enemy of this.enemies) {
      enemy.update(deltaTime, this.grid, this.player);
    }
    
    // Check win condition: all enemies defeated
    if (this.enemies.length === 0 && !this.isComplete) {
      this.onLevelComplete();
    }
  }
  
  onLevelComplete(): void {
    this.isComplete = true;
    audioManager.playSound('level-complete');
    audioManager.playMusic('victory');
    // Show victory screen with stats
    ui.showVictoryScreen({
      level: this.config.number,
      time: this.elapsedTime,
      score: this.calculateScore()
    });
  }
}
```

## 🎨 VISUAL POLISH

### Particle System
```typescript
export class ParticleSystem {
  createExplosion(gridX: number, gridY: number): void {
    const worldPos = grid.gridToWorld(gridX, gridY);
    
    // Fire particles
    for (let i = 0; i < 20; i++) {
      const particle = new Particle({
        position: new THREE.Vector3(worldPos.x, 0.5, worldPos.z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          Math.random() * 5 + 2,
          (Math.random() - 0.5) * 5
        ),
        color: new THREE.Color(0xFF6B35),
        lifetime: 0.5 + Math.random() * 0.5,
        size: 0.3
      });
      this.particles.push(particle);
    }
    
    // Smoke particles
    for (let i = 0; i < 10; i++) {
      const particle = new Particle({
        position: new THREE.Vector3(worldPos.x, 0.5, worldPos.z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 2
        ),
        color: new THREE.Color(0x666666),
        lifetime: 1.0 + Math.random() * 0.5,
        size: 0.5
      });
      this.particles.push(particle);
    }
  }
}
```

### Camera Shake
```typescript
export class Camera {
  shakeIntensity: number = 0;
  shakeDuration: number = 0;
  originalPosition: THREE.Vector3;
  
  shake(intensity: number, duration: number): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.originalPosition = this.position.clone();
  }
  
  update(deltaTime: number): void {
    if (this.shakeDuration > 0) {
      this.shakeDuration -= deltaTime;
      
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeZ = (Math.random() - 0.5) * this.shakeIntensity;
      
      this.position.set(
        this.originalPosition.x + shakeX,
        this.originalPosition.y + shakeY,
        this.originalPosition.z + shakeZ
      );
    } else if (this.shakeIntensity > 0) {
      this.position.copy(this.originalPosition);
      this.shakeIntensity = 0;
    }
  }
}
```

## 🔊 AUDIO INTEGRATION

### Audio Manager
```typescript
export class AudioManager {
  private audioContext: AudioContext;
  private sounds: Map<string, AudioBuffer> = new Map();
  private music: Map<string, AudioBuffer> = new Map();
  private currentMusic: AudioBufferSourceNode | null = null;
  
  async loadSound(name: string, path: string): Promise<void> {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.sounds.set(name, audioBuffer);
  }
  
  playSound(name: string, volume: number = 1.0): void {
    const buffer = this.sounds.get(name);
    if (!buffer) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }
  
  playMusic(name: string, loop: boolean = true): void {
    // Stop current music with fade out
    if (this.currentMusic) {
      this.fadeOut(this.currentMusic, 0.5);
    }
    
    const buffer = this.music.get(name);
    if (!buffer) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
    
    // Fade in
    gainNode.gain.linearRampToValueAtTime(0.6, this.audioContext.currentTime + 1.0);
    
    this.currentMusic = source;
  }
}
```

## 🎯 IMPLEMENTATION PRIORITY

1. **CAMERA FIX** (FIRST!) - Flatten view, ensure 13x13 grid fully visible
2. **COLOR UPDATE** - Apply vibrant theme colors, remove dark gray
3. **Grid System** - 13x13 grid with proper Bomberman layout
4. **Player Movement** - Smooth grid-based movement with input
5. **Bomb Placement** - Place bombs on current cell
6. **Explosion Logic** - 4-directional blast with wall destruction
7. **Enemy AI** - Basic chase behavior
8. **Asset Loading** - Load textures/audio from assets/ folder
9. **Audio System** - Integrate all music + SFX
10. **Particle Effects** - Explosions, smoke, fire
11. **Level System** - Progression, victory screens, themes
12. **UI/UX** - HUD, menus, pause, victory/defeat screens
13. **Polish** - Camera shake, lighting, post-processing

## 🧪 TESTING CHECKLIST

- [ ] All 13x13 grid cells visible (no blind spots)
- [ ] Player can reach all walkable cells
- [ ] Bombs explode in correct pattern
- [ ] Walls destroyed by explosions
- [ ] Enemies pathfind correctly
- [ ] Power-ups apply effects
- [ ] Level progression works
- [ ] Victory screen shows on level complete
- [ ] All audio plays correctly
- [ ] Game runs at 60fps
- [ ] Mobile controls work
- [ ] Responsive UI

---
**BUILD THIS TO WIN! 🔥**
