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
import { PlantType, LEVELS, PLANT_DATA } from './types';

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

  plants: Plant[] = [];
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];

  energy: number = 50;
  energyTimer: number = 0;
  selectedPlant: PlantType | null = null;
  gameState: 'playing' | 'won' | 'lost' | 'levelComplete' = 'playing';
  score: number = 0;

  private lastTime: number = 0;
  private running: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.board = new Board(5, 9, 60, 0, 50);
    this.ui = new UI(canvas.width, canvas.height);
    this.waveManager = new WaveManager(LEVELS);
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();
    this.time = 0;
    this.energy = this.waveManager.getStartEnergy();
    this.setupEvents();
  }

  private setupEvents(): void {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

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
        this.selectedPlant = card;
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

      this.energy -= cost;
      this.plants.push(new Plant(cell, this.selectedPlant));
      this.audio.playPlace();
      const center = this.board.getCellCenter(cell.row, cell.col);
      this.particles.emit(center.x, center.y, 5, '#8BC34A');
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.ui.setHover(e.clientX - rect.left, e.clientY - rect.top);
    });
  }

  private tryUpgrade(plant: Plant): void {
    const upgradeCost = 100;
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
      [PlantType.BasicShooter]: 100,
      [PlantType.DoubleShooter]: 200,
      [PlantType.Sunflower]: 50,
      [PlantType.WallNut]: 50,
      [PlantType.FreezePlant]: 175,
      [PlantType.BombPlant]: 150,
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
    if (this.gameState !== 'playing') return;

    // Energy regen
    this.energyTimer += dt;
    if (this.energyTimer >= 1) {
      this.energyTimer -= 1;
      this.energy = Math.min(999, this.energy + 1);
    }

    // Plant updates
    for (const plant of this.plants) {
      const shouldAct = plant.update(dt);
      if (shouldAct) {
        if (plant.type === PlantType.Sunflower) {
          this.energy = Math.min(999, this.energy + 25);
          const center = this.board.getCellCenter(plant.pos.row, plant.pos.col);
          this.floatingTexts.push(new FloatingText(center.x, center.y - 20, '+25 ☀', '#FFD600'));
        } else {
          const center = this.board.getCellCenter(plant.pos.row, plant.pos.col);
          this.projectiles.push(new Projectile(plant.pos.row, center.x, center.y, 300, plant.damage, plant.type));
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
      enemy.update(dt, this.board.cellSize);

      if (enemy.x < this.board.offsetX) {
        this.gameState = 'lost';
        this.audio.playLose();
        return;
      }

      const enemyCol = enemy.getCol(this.board.cellSize);
      for (const plant of this.plants) {
        if (plant.pos.row === enemy.row && plant.pos.col === enemyCol) {
          plant.takeDamage(enemy.damage * dt);
          break;
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
        if (Math.abs(proj.x - enemy.x) < 20 && Math.abs(proj.y - ey) < 20) {
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
        this.particles.emit(enemy.x, this.board.offsetY + enemy.row * this.board.cellSize + this.board.cellSize / 2, 8, enemy.color);
        this.score += enemy.score;
      }
    }
    this.enemies = this.enemies.filter(e => e.alive);
    this.projectiles = this.projectiles.filter(p => p.alive);
    this.plants = this.plants.filter(p => !p.isDead());

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
    }
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Background
    Renderer.drawBackground(ctx, this.canvas.width, this.canvas.height, this.time);

    this.board.render(ctx);

    // Render plants
    for (const plant of this.plants) {
      const center = this.board.getCellCenter(plant.pos.row, plant.pos.col);
      const hpRatio = plant.hp / plant.maxHp;
      Renderer.drawPlant(ctx, center.x, center.y, plant.type, this.time, hpRatio);

      // HP bar
      ctx.fillStyle = '#333';
      ctx.fillRect(center.x - 20, center.y - 30, 40, 4);
      ctx.fillStyle = hpRatio > 0.5 ? '#4CAF50' : hpRatio > 0.25 ? '#FF9800' : '#F44336';
      ctx.fillRect(center.x - 20, center.y - 30, 40 * hpRatio, 4);
    }

    // Render enemies
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const ey = this.board.offsetY + enemy.row * this.board.cellSize + this.board.cellSize / 2;
      Renderer.drawEnemy(ctx, enemy.x, ey, enemy.type, this.time, enemy.slowTimer, enemy.hitFlash, enemy.deathAnim);

      // HP bar
      const hpRatio = enemy.hp / enemy.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x - 18, ey - 24, 36, 4);
      ctx.fillStyle = '#F44336';
      ctx.fillRect(enemy.x - 18, ey - 24, 36 * hpRatio, 4);
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

    // UI
    this.ui.render(ctx, this.energy, this.selectedPlant, this.waveManager.getWaveLabel(), this.gameState, this.score, this.audio.isMuted());
  }

  nextLevel(): void {
    this.plants = [];
    this.enemies = [];
    this.projectiles = [];
    this.selectedPlant = null;
    this.gameState = 'playing';
    this.waveManager.loadLevel(this.waveManager.currentLevel + 1);
    this.energy = this.waveManager.getStartEnergy();
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
    this.waveManager = new WaveManager(LEVELS);
    this.energy = this.waveManager.getStartEnergy();
  }
}
