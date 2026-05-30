import { Board } from './Board';
import { Plant } from './Plant';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { WaveManager } from './Wave';
import { UI } from './UI';
import { AudioManager } from './AudioManager';
import { ParticleSystem } from './Particles';
import { FloatingText } from './FloatingText';
import { Renderer } from './Renderer';
import { SaveManager, SaveData } from './SaveManager';
import { PlantType, LEVELS, PLANT_DATA } from './types';
import { LawnMower } from './LawnMower';
import * as C from './Constants';

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  board: Board;
  ui: UI;
  waveManager: WaveManager;
  audio: AudioManager;
  particles: ParticleSystem;
  floatingTexts: FloatingText[] = [];
  time: number = 0;
  saveData: SaveData;
  selectedLevel: number = 0;

  plants: Plant[] = [];
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  lawnMowers: LawnMower[] = [];

  energy: number = 50;
  energyTimer: number = 0;
  selectedPlant: PlantType | null = null;
  gameState: 'playing' | 'won' | 'lost' | 'levelComplete' = 'playing';
  score: number = 0;

  private lastTime: number = 0;
  private running: boolean = false;
  private paused: boolean = false;
  private shovelActive: boolean = false;
  private showStartScreen: boolean = true;
  private showLevelSelect: boolean = false;
  private lastCountdownSecond: number = -1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.showStartScreen = true;
    this.board = new Board(C.GRID_ROWS, C.GRID_COLS, C.CELL_SIZE, C.GRID_OFFSET_X, C.GRID_OFFSET_Y);
    this.ui = new UI(canvas.width, canvas.height);
    this.waveManager = new WaveManager(LEVELS);
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();
    this.time = 0;
    this.saveData = SaveManager.load() || { levelStars: [0, 0, 0, 0, 0], highScore: 0, unlockedPlants: ['basic_shooter', 'sunflower', 'wall_nut'] };
    this.energy = this.waveManager.getStartEnergy();
    this.setupEvents();
  }

  private setupEvents(): void {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.showStartScreen) {
        this.showStartScreen = false;
        return;
      }
      if (e.key === 'Escape') {
        if (this.shovelActive) {
          this.shovelActive = false;
        } else {
          this.paused = !this.paused;
        }
        return;
      }
      if (this.paused || this.gameState !== 'playing') return;
      const plantKeys: Record<string, PlantType> = {
        '1': PlantType.BasicShooter,
        '2': PlantType.DoubleShooter,
        '3': PlantType.Sunflower,
        '4': PlantType.WallNut,
        '5': PlantType.FreezePlant,
        '6': PlantType.BombPlant,
      };
      if (plantKeys[e.key]) {
        this.selectedPlant = plantKeys[e.key];
        this.shovelActive = false;
      } else if (e.key === 's' || e.key === 'S') {
        this.shovelActive = !this.shovelActive;
        this.selectedPlant = null;
      }
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Start screen
      if (this.showStartScreen) {
        this.showStartScreen = false;
        this.showLevelSelect = true;
        return;
      }

      // Level select
      if (this.showLevelSelect) {
        const level = this.getClickedLevel(x, y);
        if (level >= 0 && level < LEVELS.length) {
          this.selectedLevel = level;
          this.showLevelSelect = false;
          this.startLevel(level);
        }
        return;
      }

      // Mute toggle
      if (this.ui.isMuteClick(x, y, this.canvas.width)) {
        this.audio.toggleMute();
        return;
      }

      if (this.gameState !== 'playing') {
        if (this.ui.isRestartClick(x, y, this.canvas.width, this.canvas.height)) {
          if (this.gameState === 'levelComplete') {
            this.nextLevel();
          } else {
            this.restart();
          }
        }
        return;
      }

      const card = this.ui.getClickedCard(x, y);
      if (card !== null) {
        if (!this.ui.isOnCooldown(card)) {
          this.selectedPlant = card;
          this.shovelActive = false;
        }
        return;
      }

      // Shovel click
      if (this.shovelActive) {
        const cell = this.board.getCellFromPixel(x, y);
        if (cell) {
          const idx = this.plants.findIndex(p => p.pos.row === cell.row && p.pos.col === cell.col);
          if (idx >= 0) {
            this.plants.splice(idx, 1);
            this.shovelActive = false;
          }
        }
        return;
      }

      if (this.selectedPlant === null) return;

      const cell = this.board.getCellFromPixel(x, y);
      if (!cell) return;

      const existing = this.plants.find(p => p.pos.row === cell.row && p.pos.col === cell.col);
      if (existing) {
        this.tryUpgrade(existing);
        return;
      }

      const cost = this.getPlantCost(this.selectedPlant);
      if (this.energy < cost) return;
      if (this.ui.isOnCooldown(this.selectedPlant)) return;

      this.energy -= cost;
      this.plants.push(new Plant(cell, this.selectedPlant));
      this.audio.playPlace();
      this.ui.setCooldown(this.selectedPlant, C.PLANT_CARD_COOLDOWN);
      this.selectedPlant = null;
      const center = this.board.getCellCenter(cell.row, cell.col);
      this.particles.emit(center.x, center.y, 8, '#8BC34A');
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.ui.setHover(e.clientX - rect.left, e.clientY - rect.top);
    });
  }

  private tryUpgrade(plant: Plant): void {
    const upgradeCost = C.UPGRADE_COST;
    if (this.energy < upgradeCost) return;

    if (plant.type === PlantType.BasicShooter) {
      this.energy -= upgradeCost;
      plant.type = PlantType.DoubleShooter;
      const data = PLANT_DATA[PlantType.DoubleShooter];
      plant.color = data.color;
      plant.symbol = data.symbol;
      plant.description = data.description;
      plant.special = data.special;
      plant.fireRate = data.fireRate;
      plant.maxHp = data.hp;
      plant.hp = Math.min(plant.hp + 50, plant.maxHp);
    } else if (plant.type === PlantType.WallNut) {
      this.energy -= upgradeCost;
      plant.type = PlantType.ShieldWall;
      const wd = PLANT_DATA[PlantType.ShieldWall];
      plant.color = wd.color;
      plant.symbol = wd.symbol;
      plant.description = wd.description;
      plant.special = wd.special;
      plant.maxHp = wd.hp;
      plant.hp = Math.min(plant.hp + 200, plant.maxHp);
    } else if (plant.type === PlantType.FreezePlant) {
      this.energy -= upgradeCost;
      plant.type = PlantType.IceShooter;
      const id = PLANT_DATA[PlantType.IceShooter];
      plant.color = id.color;
      plant.symbol = id.symbol;
      plant.description = id.description;
      plant.special = id.special;
      plant.fireRate = id.fireRate;
      plant.damage = id.damage;
      plant.maxHp = id.hp;
      plant.hp = Math.min(plant.hp + 50, plant.maxHp);
    }
  }

  private getPlantCost(type: PlantType): number {
    const costs: Record<PlantType, number> = {
      [PlantType.BasicShooter]: 75,
      [PlantType.DoubleShooter]: 200,
      [PlantType.Sunflower]: 50,
      [PlantType.WallNut]: 50,
      [PlantType.FreezePlant]: 150,
      [PlantType.BombPlant]: 125,
      [PlantType.IceShooter]: 0,
      [PlantType.ShieldWall]: 0,
    };
    return costs[type];
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  private loop = (): void => {
    if (!this.running) return;
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.update(dt);
    this.render();
    requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    this.time += dt;
    if (this.showStartScreen || this.paused || this.gameState !== 'playing') return;

    // UI cooldowns
    this.ui.updateCooldowns(dt);

    // Countdown tick sound
    if (this.waveManager.isInDelay()) {
      const sec = Math.ceil(this.waveManager.getDelayRemaining());
      if (sec !== this.lastCountdownSecond && sec > 0 && sec <= 8) {
        this.lastCountdownSecond = sec;
        this.audio.playCountdownTick();
      }
    }

    // Check if wave just started
    if (this.waveManager.consumeWaveStart()) {
      this.audio.playWaveStart();
      this.lastCountdownSecond = -1;
    }

    // Energy regen
    this.energyTimer += dt;
    if (this.energyTimer >= 1) {
      this.energyTimer -= 1;
      this.energy = Math.min(C.ENERGY_MAX, this.energy + C.ENERGY_REGEN_RATE);
    }

    // Plant updates
    for (const plant of this.plants) {
      const shouldAct = plant.update(dt);
      if (shouldAct) {
        if (plant.type === PlantType.Sunflower) {
          this.energy = Math.min(C.ENERGY_MAX, this.energy + 30);
          const center = this.board.getCellCenter(plant.pos.row, plant.pos.col);
          this.floatingTexts.push(new FloatingText(center.x, center.y - 20, '+30 ☀', '#FFD600'));
        } else {
          const center = this.board.getCellCenter(plant.pos.row, plant.pos.col);
          this.projectiles.push(new Projectile(plant.pos.row, center.x, center.y, C.PROJECTILE_SPEED, plant.damage, plant.type));
          this.audio.playShoot();
          this.floatingTexts.push(new FloatingText(center.x, center.y - 20, '💥', '#FFD600', 0.3));
        }
      }
    }

    // Spawn enemies
    const startX = this.board.offsetX + this.board.cols * this.board.cellSize + 20;
    const newEnemy = this.waveManager.update(dt, startX);
    if (newEnemy) this.enemies.push(newEnemy);

    // Update enemies
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      // Check if enemy is blocked by a plant BEFORE moving
      const enemyCol = enemy.getCol(this.board.cellSize, this.board.offsetX);
      let blocked = false;
      for (const plant of this.plants) {
        if (plant.pos.row === enemy.row && plant.pos.col === enemyCol) {
          // Enemy stops and attacks the plant
          plant.takeDamage(enemy.damage * dt);
          blocked = true;
          break;
        }
      }

      if (!blocked) {
        enemy.update(dt, this.board.cellSize);
      }

      if (enemy.x < this.board.offsetX) {
        // Try to activate a lawn mower for this row
        const mower = this.lawnMowers.find(m => m.row === enemy.row && !m.active && !m.consumed);
        if (mower) {
          mower.activate();
          this.audio.playShoot();
        } else {
          // No mower available - check if one is already active (coming to save)
          const activeMower = this.lawnMowers.find(m => m.row === enemy.row && m.active && !m.consumed);
          if (!activeMower) {
            this.gameState = 'lost';
            this.audio.playLose();
            return;
          }
        }
      }

      // Healer heals nearby enemies
      if (enemy.canHeal()) {
        for (const other of this.enemies) {
          if (other !== enemy && other.alive && other.row === enemy.row && Math.abs(other.x - enemy.x) < 100) {
            other.hp = Math.min(other.maxHp, other.hp + C.HEAL_AMOUNT);
            enemy.doHeal();
            this.particles.emit(other.x, this.board.offsetY + other.row * this.board.cellSize + this.board.cellSize / 2, 5, '#00BCD4');
            break;
          }
        }
      }
    }

    // Update projectiles
    for (const proj of this.projectiles) {
      if (!proj.alive) continue;
      proj.update(dt);

      for (const enemy of this.enemies) {
        if (!enemy.alive || enemy.row !== proj.row) continue;
        const ey = this.board.offsetY + enemy.row * this.board.cellSize + this.board.cellSize / 2;
        if (Math.abs(proj.x - enemy.x) < C.COLLISION_THRESHOLD && Math.abs(proj.y - ey) < C.COLLISION_THRESHOLD) {
          enemy.takeDamage(proj.damage);
          if (proj.plantType === PlantType.FreezePlant) {
            enemy.applySlow(3);
          }
          this.audio.playHit();
          this.particles.emit(proj.x, proj.y, 3, '#FFEB3B');
          this.floatingTexts.push(new FloatingText(proj.x, proj.y - 10, `-${proj.damage}`, '#F44336'));
          proj.alive = false;
          break;
        }
      }
    }

    // Clean up dead enemies with effects
    for (const enemy of this.enemies) {
      if (!enemy.alive) {
        this.audio.playEnemyDeath();
        this.particles.emit(enemy.x, this.board.offsetY + enemy.row * this.board.cellSize + this.board.cellSize / 2, 10, enemy.color);
        this.score += enemy.score;
      }
    }
    this.enemies = this.enemies.filter(e => e.alive);
    this.projectiles = this.projectiles.filter(p => p.alive);
    this.plants = this.plants.filter(p => !p.isDead());

    // Update lawn mowers
    for (const mower of this.lawnMowers) {
      if (!mower.active || mower.consumed) continue;
      mower.update(dt);

      // Kill enemies in the same row that the mower passes
      for (const enemy of this.enemies) {
        if (!enemy.alive || enemy.row !== mower.row) continue;
        if (Math.abs(enemy.x - mower.x) < C.CELL_SIZE * 0.7) {
          enemy.takeDamage(enemy.maxHp + 100); // instant kill
          this.particles.emit(enemy.x, this.board.offsetY + enemy.row * this.board.cellSize + this.board.cellSize / 2, 15, '#FF5722');
        }
      }

      // Mark as consumed when off screen
      if (mower.isOffScreen(this.canvas.width)) {
        mower.consumed = true;
      }
    }
    // Remove consumed mowers
    this.lawnMowers = this.lawnMowers.filter(m => !m.consumed);

    // Check wave completion
    if (this.waveManager.isWaveDone() && this.enemies.length === 0) {
      this.waveManager.nextWave();
    }

    // Update particles & floating texts
    this.particles.update(dt);
    for (const ft of this.floatingTexts) ft.update(dt);
    this.floatingTexts = this.floatingTexts.filter(ft => !ft.isDead());

    // Check level completion
    if (this.waveManager.isLevelDone() && this.enemies.length === 0) {
      if (this.waveManager.currentLevel >= LEVELS.length - 1) {
        this.gameState = 'won';
        this.audio.playWin();
      } else {
        this.gameState = 'levelComplete';
        this.audio.playWin();
      }
      // Save stars based on remaining plants
      const stars = this.plants.length >= 8 ? 3 : this.plants.length >= 4 ? 2 : 1;
      this.saveData.levelStars[this.waveManager.currentLevel] = Math.max(
        this.saveData.levelStars[this.waveManager.currentLevel], stars
      );
      this.saveData.highScore = Math.max(this.saveData.highScore, this.score);
      SaveManager.save(this.saveData);
    }
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Background (sky, clouds, grass, fence)
    Renderer.drawBackground(ctx, this.canvas.width, this.canvas.height, this.time);

    this.board.render(ctx);

    // Render lawn mowers
    for (const mower of this.lawnMowers) {
      if (mower.consumed) continue;
      const centerY = this.board.offsetY + mower.row * this.board.cellSize + this.board.cellSize / 2;
      Renderer.drawLawnMower(ctx, mower.active ? mower.x : this.board.offsetX - 25, centerY, mower.active, this.time);
    }

    // Render plants
    for (const plant of this.plants) {
      const center = this.board.getCellCenter(plant.pos.row, plant.pos.col);
      const hpRatio = plant.hp / plant.maxHp;
      Renderer.drawPlant(ctx, center.x, center.y, plant.type, this.time, hpRatio);

      // HP bar
      ctx.fillStyle = '#333';
      ctx.fillRect(center.x - 22, center.y - 32, 44, 5);
      ctx.fillStyle = hpRatio > 0.5 ? '#4CAF50' : hpRatio > 0.25 ? '#FF9800' : '#F44336';
      ctx.fillRect(center.x - 22, center.y - 32, 44 * hpRatio, 5);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(center.x - 22, center.y - 32, 44, 5);
      ctx.lineWidth = 1;
    }

    // Render enemies
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const ey = this.board.offsetY + enemy.row * this.board.cellSize + this.board.cellSize / 2;
      Renderer.drawEnemy(ctx, enemy.x, ey, enemy.type, this.time, enemy.slowTimer, enemy.hitFlash, enemy.deathAnim);

      // HP bar
      const hpRatio = enemy.hp / enemy.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x - 20, ey - 28, 40, 5);
      ctx.fillStyle = '#F44336';
      ctx.fillRect(enemy.x - 20, ey - 28, 40 * hpRatio, 5);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(enemy.x - 20, ey - 28, 40, 5);
      ctx.lineWidth = 1;
    }

    // Render projectiles
    for (const proj of this.projectiles) {
      if (!proj.alive) continue;
      Renderer.drawProjectile(ctx, proj.x, proj.y, proj.plantType, this.time);
    }

    // Floating texts
    for (const ft of this.floatingTexts) {
      ft.render(ctx);
    }

    // Particles
    this.particles.render(ctx);

    // Countdown overlay during delay
    if (this.waveManager.isInDelay() && this.gameState === 'playing') {
      const remaining = this.waveManager.getDelayRemaining();
      const sec = Math.ceil(remaining);
      const isFirstWave = this.waveManager.currentWave === 0;

      // Dim overlay
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Countdown box
      const boxW = 280, boxH = 120;
      const boxX = this.canvas.width / 2 - boxW / 2;
      const boxY = this.canvas.height / 2 - boxH / 2;

      // Box shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.moveTo(boxX + 12, boxY + 4);
      ctx.lineTo(boxX + boxW + 12, boxY + 4);
      ctx.quadraticCurveTo(boxX + boxW + 12, boxY + 4, boxX + boxW + 12, boxY + 12);
      ctx.lineTo(boxX + boxW + 12, boxY + boxH + 4);
      ctx.quadraticCurveTo(boxX + boxW + 12, boxY + boxH + 4, boxX + boxW + 4, boxY + boxH + 4);
      ctx.lineTo(boxX + 12, boxY + boxH + 4);
      ctx.closePath();
      ctx.fill();

      // Box background
      ctx.fillStyle = 'rgba(20,20,40,0.9)';
      ctx.beginPath();
      ctx.moveTo(boxX + 12, boxY);
      ctx.lineTo(boxX + boxW - 12, boxY);
      ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + 12);
      ctx.lineTo(boxX + boxW, boxY + boxH - 12);
      ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - 12, boxY + boxH);
      ctx.lineTo(boxX + 12, boxY + boxH);
      ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - 12);
      ctx.lineTo(boxX, boxY + 12);
      ctx.quadraticCurveTo(boxX, boxY, boxX + 12, boxY);
      ctx.closePath();
      ctx.fill();
      // Gold border
      ctx.strokeStyle = '#FFB300';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.lineWidth = 1;

      // "GET READY!" text
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (isFirstWave) {
        ctx.fillText('GET READY!', this.canvas.width / 2, boxY + 35);
      } else {
        ctx.fillStyle = '#FF9800';
        ctx.fillText(`WAVE ${this.waveManager.currentWave + 1}`, this.canvas.width / 2, boxY + 35);
      }

      // Big countdown number
      const pulseScale = 1 + Math.sin(remaining * Math.PI * 2) * 0.08;
      ctx.save();
      ctx.translate(this.canvas.width / 2, boxY + 80);
      ctx.scale(pulseScale, pulseScale);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 40px Arial';
      ctx.fillText(`${sec}`, 0, 0);
      ctx.restore();

      // Progress bar
      const barW = boxW - 40;
      const barH = 6;
      const barX = boxX + 20;
      const barY = boxY + boxH - 18;
      const progress = isFirstWave
        ? 1 - (remaining / C.INITIAL_WAVE_DELAY)
        : 1 - (remaining / C.BETWEEN_WAVE_DELAY);
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#FFB300';
      ctx.fillRect(barX, barY, barW * progress, barH);

      ctx.textBaseline = 'alphabetic';
    }

    // UI
    this.ui.render(ctx, this.energy, this.selectedPlant, this.waveManager.getWaveLabel(), this.gameState, this.score, this.audio.isMuted(), this.shovelActive);

    // Start screen
    if (this.showStartScreen) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      // Title
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 52px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌿 LANE DEFENSE 🌿', this.canvas.width / 2, this.canvas.height / 2 - 70);
      ctx.fillStyle = '#fff';
      ctx.font = '20px Arial';
      ctx.fillText('Defend your garden from invaders!', this.canvas.width / 2, this.canvas.height / 2 - 25);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#8BC34A';
      ctx.fillText('▶ Click to start', this.canvas.width / 2, this.canvas.height / 2 + 20);
      ctx.fillStyle = '#aaa';
      ctx.font = '13px Arial';
      ctx.fillText('Keys: 1-6 select plants | S shovel | ESC pause', this.canvas.width / 2, this.canvas.height / 2 + 55);
      ctx.textBaseline = 'alphabetic';
    }

    // Level select screen
    if (this.showLevelSelect) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SELECT LEVEL', this.canvas.width / 2, 50);

      const bw = 180, bh = 55, gap = 15;
      const totalH = LEVELS.length * bh + (LEVELS.length - 1) * gap;
      const startY = (this.canvas.height - totalH) / 2;

      for (let i = 0; i < LEVELS.length; i++) {
        const by = startY + i * (bh + gap);
        const bx = this.canvas.width / 2 - bw / 2;
        const stars = this.saveData.levelStars[i] || 0;

        // Button shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(bx + 3, by + 3, bw, bh);

        ctx.fillStyle = '#33691E';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#8BC34A';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.lineWidth = 1;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Level ${i + 1}`, this.canvas.width / 2, by + 22);

        let starStr = '';
        for (let s = 0; s < 3; s++) {
          starStr += s < stars ? '⭐' : '☆';
        }
        ctx.font = '14px Arial';
        ctx.fillText(starStr, this.canvas.width / 2, by + 42);
      }
      ctx.textBaseline = 'alphabetic';
    }

    // Pause screen
    if (this.paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⏸ PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 10);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Press ESC to resume', this.canvas.width / 2, this.canvas.height / 2 + 25);
      ctx.textBaseline = 'alphabetic';
    }
  }

  nextLevel(): void {
    this.plants = [];
    this.enemies = [];
    this.projectiles = [];
    this.selectedPlant = null;
    this.gameState = 'playing';
    this.lastCountdownSecond = -1;
    this.waveManager.loadLevel(this.waveManager.currentLevel + 1);
    this.energy = this.waveManager.getStartEnergy();
    this.ui = new UI(this.canvas.width, this.canvas.height);
    this.lawnMowers = [];
    for (let r = 0; r < C.GRID_ROWS; r++) {
      this.lawnMowers.push(new LawnMower(r, C.GRID_OFFSET_X - 25));
    }
  }

  restart(): void {
    this.plants = [];
    this.enemies = [];
    this.projectiles = [];
    this.energy = 50;
    this.energyTimer = 0;
    this.selectedPlant = null;
    this.gameState = 'playing';
    this.score = 0;
    this.lastCountdownSecond = -1;
    this.waveManager = new WaveManager(LEVELS);
    this.energy = this.waveManager.getStartEnergy();
    this.ui = new UI(this.canvas.width, this.canvas.height);
    this.lawnMowers = [];
    for (let r = 0; r < C.GRID_ROWS; r++) {
      this.lawnMowers.push(new LawnMower(r, C.GRID_OFFSET_X - 25));
    }
  }

  private startLevel(level: number): void {
    this.plants = [];
    this.enemies = [];
    this.projectiles = [];
    this.selectedPlant = null;
    this.gameState = 'playing';
    this.score = 0;
    this.lastCountdownSecond = -1;
    this.waveManager = new WaveManager(LEVELS);
    this.waveManager.loadLevel(level);
    this.energy = this.waveManager.getStartEnergy();
    this.ui = new UI(this.canvas.width, this.canvas.height);
    this.audio.playReady();
    this.lawnMowers = [];
    for (let r = 0; r < C.GRID_ROWS; r++) {
      this.lawnMowers.push(new LawnMower(r, C.GRID_OFFSET_X - 25));
    }
  }

  private getClickedLevel(x: number, y: number): number {
    const bw = 180, bh = 55, gap = 15;
    const totalH = LEVELS.length * bh + (LEVELS.length - 1) * gap;
    const startY = (this.canvas.height - totalH) / 2;
    for (let i = 0; i < LEVELS.length; i++) {
      const by = startY + i * (bh + gap);
      const bx = this.canvas.width / 2 - bw / 2;
      if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
        return i;
      }
    }
    return -1;
  }
}
