import { WaveData, EnemyType } from './types';
import { Enemy } from './Enemy';

export class WaveManager {
  waves: WaveData[];
  currentWave: number = 0;
  spawnQueue: { type: EnemyType; row: number }[] = [];
  spawnTimer: number = 0;
  spawnInterval: number = 0;
  allSpawned: boolean = false;

  constructor(waves: WaveData[]) {
    this.waves = waves;
    this.loadWave(0);
  }

  loadWave(index: number): void {
    if (index >= this.waves.length) {
      this.allSpawned = true;
      return;
    }
    this.currentWave = index;
    const wave = this.waves[index];
    this.spawnInterval = wave.spawnInterval;
    this.spawnTimer = 0;
    this.spawnQueue = [];
    for (const group of wave.enemies) {
      for (let i = 0; i < group.count; i++) {
        const row = group.row === -1 ? Math.floor(Math.random() * 5) : group.row;
        this.spawnQueue.push({ type: group.type, row });
      }
    }
    // Shuffle
    for (let i = this.spawnQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
    }
  }

  update(dt: number, startX: number): Enemy | null {
    if (this.allSpawned || this.spawnQueue.length === 0) return null;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnInterval;
      const next = this.spawnQueue.shift()!;
      return new Enemy(next.row, startX, next.type);
    }
    return null;
  }

  nextWave(_startX: number): void {
    this.loadWave(this.currentWave + 1);
  }

  isDone(): boolean {
    return this.allSpawned && this.spawnQueue.length === 0;
  }

  getWaveLabel(): string {
    return `Wave ${this.currentWave + 1} / ${this.waves.length}`;
  }
}
