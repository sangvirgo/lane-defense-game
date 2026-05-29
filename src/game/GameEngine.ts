import { Board } from './Board';
import { Plant } from './Plant';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { WaveManager } from './Wave';
import { UI } from './UI';
import { PlantType, WAVE_DATA } from './types';

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  board: Board;
  ui: UI;
  waveManager: WaveManager;

  plants: Plant[] = [];
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];

  energy: number = 50;
  energyTimer: number = 0;
  selectedPlant: PlantType | null = null;
  gameState: 'playing' | 'won' | 'lost' = 'playing';

  private lastTime: number = 0;
  private running: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.board = new Board(5, 9, 60, 0, 50);
    this.ui = new UI(canvas.width, canvas.height);
    this.waveManager = new WaveManager(WAVE_DATA);
    this.setupEvents();
  }

  private setupEvents(): void {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.gameState !== 'playing') {
        if (this.ui.isRestartClick(x, y, this.canvas.width, this.canvas.height)) {
          this.restart();
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
      if (existing) return;

      const { cost } = this.getPlantCost(this.selectedPlant);
      if (this.energy < cost) return;

      this.energy -= cost;
      this.plants.push(new Plant(cell, this.selectedPlant));
    });
  }

  private getPlantCost(type: PlantType): { cost: number } {
    const costs: Record<PlantType, number> = {
      [PlantType.BasicShooter]: 100,
      [PlantType.WallNut]: 50,
      [PlantType.Sunflower]: 50,
    };
    return { cost: costs[type] };
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
    if (this.gameState !== 'playing') return;

    // Energy regen
    this.energyTimer += dt;
    if (this.energyTimer >= 1) {
      this.energyTimer -= 1;
      this.energy = Math.min(999, this.energy + 1);
    }

    // Sunflower energy
    for (const plant of this.plants) {
      if (plant.type === PlantType.Sunflower) {
        plant.fireCooldown -= dt;
        if (plant.fireCooldown <= 0) {
          plant.fireCooldown = 10;
          this.energy = Math.min(999, this.energy + 25);
        }
      }
    }

    // Spawn enemies
    const startX = this.board.offsetX + this.board.cols * this.board.cellSize + 20;
    const newEnemy = this.waveManager.update(dt, startX);
    if (newEnemy) this.enemies.push(newEnemy);

    // Update plants & shoot
    for (const plant of this.plants) {
      if (plant.type === PlantType.BasicShooter) {
        const shouldShoot = plant.update(dt);
        if (shouldShoot) {
          const center = this.board.getCellCenter(plant.pos.row, plant.pos.col);
          this.projectiles.push(new Projectile(plant.pos.row, center.x, center.y, 300, plant.damage));
        }
      }
    }

    // Update enemies
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      enemy.update(dt, this.board.cellSize);

      // Check if enemy reached left side
      if (enemy.x < this.board.offsetX) {
        this.gameState = 'lost';
        return;
      }

      // Check collision with plants
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

      // Check collision with enemies
      for (const enemy of this.enemies) {
        if (!enemy.alive || enemy.row !== proj.row) continue;
        if (Math.abs(proj.x - enemy.x) < 20 && Math.abs(proj.y - (this.board.offsetY + enemy.row * this.board.cellSize + this.board.cellSize / 2)) < 20) {
          enemy.takeDamage(proj.damage);
          proj.alive = false;
          break;
        }
      }
    }

    // Clean up dead
    this.enemies = this.enemies.filter(e => e.alive);
    this.projectiles = this.projectiles.filter(p => p.alive);
    this.plants = this.plants.filter(p => !p.isDead());

    // Check win
    if (this.waveManager.isDone() && this.enemies.length === 0) {
      this.gameState = 'won';
    }
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.board.render(ctx);

    // Render plants
    for (const plant of this.plants) {
      const center = this.board.getCellCenter(plant.pos.row, plant.pos.col);
      ctx.fillStyle = plant.color;
      ctx.fillRect(center.x - 25, center.y - 25, 50, 50);
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(plant.symbol, center.x, center.y + 8);

      // HP bar
      const hpRatio = plant.hp / plant.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(center.x - 25, center.y - 30, 50, 4);
      ctx.fillStyle = hpRatio > 0.5 ? '#4CAF50' : hpRatio > 0.25 ? '#FF9800' : '#F44336';
      ctx.fillRect(center.x - 25, center.y - 30, 50 * hpRatio, 4);
    }

    // Render enemies
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const ey = this.board.offsetY + enemy.row * this.board.cellSize + this.board.cellSize / 2;
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x - 20, ey - 20, 40, 40);
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(enemy.symbol, enemy.x, ey + 6);

      // HP bar
      const hpRatio = enemy.hp / enemy.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x - 20, ey - 25, 40, 4);
      ctx.fillStyle = '#F44336';
      ctx.fillRect(enemy.x - 20, ey - 25, 40 * hpRatio, 4);
    }

    // Render projectiles
    for (const proj of this.projectiles) {
      if (!proj.alive) continue;
      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // UI
    this.ui.render(ctx, this.energy, this.selectedPlant, this.waveManager.getWaveLabel(), this.gameState);
  }

  restart(): void {
    this.plants = [];
    this.enemies = [];
    this.projectiles = [];
    this.energy = 50;
    this.energyTimer = 0;
    this.selectedPlant = null;
    this.gameState = 'playing';
    this.waveManager = new WaveManager(WAVE_DATA);
  }
}
