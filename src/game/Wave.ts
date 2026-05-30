import { EnemyType, LevelData } from './types';
import { Enemy } from './Enemy';
import * as C from './Constants';

export class WaveManager {
  levels: LevelData[];
  currentLevel: number = 0;
  currentWave: number = 0;
  spawnQueue: { type: EnemyType; row: number }[] = [];
  spawnTimer: number = 0;
  spawnInterval: number = 0;
  allSpawned: boolean = false;
  levelComplete: boolean = false;
  delayTimer: number = 0;
  started: boolean = false;
  waveStartTriggered: boolean = false;

  constructor(levels: LevelData[]) {
    this.levels = levels;
    this.loadLevel(0);
  }

  loadLevel(index: number): void {
    if (index >= this.levels.length) {
      this.allSpawned = true;
      this.levelComplete = true;
      return;
    }
    this.currentLevel = index;
    this.currentWave = 0;
    this.levelComplete = false;
    this.allSpawned = false;
    this.started = false;
    this.waveStartTriggered = false;
    this.loadWave(0);
  }

  loadWave(index: number): void {
    const level = this.levels[this.currentLevel];
    if (index >= level.waves.length) {
      this.allSpawned = true;
      return;
    }
    this.currentWave = index;
    const wave = level.waves[index];
    this.spawnInterval = wave.spawnInterval;
    this.spawnTimer = 0;
    this.started = false;
    this.waveStartTriggered = false;

    // Initial delay: 8s for wave 1, 3s for subsequent waves
    this.delayTimer = index === 0 ? C.INITIAL_WAVE_DELAY : C.BETWEEN_WAVE_DELAY;

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

    if (!this.started) {
      this.delayTimer -= dt;
      if (this.delayTimer <= 0) {
        this.started = true;
        this.waveStartTriggered = true;
      }
      return null;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnInterval;
      const next = this.spawnQueue.shift()!;
      return new Enemy(next.row, startX, next.type);
    }
    return null;
  }

  /** Returns true exactly once when the delay finishes and wave starts */
  consumeWaveStart(): boolean {
    if (this.waveStartTriggered) {
      this.waveStartTriggered = false;
      return true;
    }
    return false;
  }

  nextWave(): void {
    this.loadWave(this.currentWave + 1);
  }

  isWaveDone(): boolean {
    return this.spawnQueue.length === 0;
  }

  isLevelDone(): boolean {
    return this.allSpawned && this.spawnQueue.length === 0;
  }

  isAllLevelsDone(): boolean {
    return this.levelComplete;
  }

  getWaveLabel(): string {
    const level = this.levels[this.currentLevel];
    return `${level.name} — Wave ${this.currentWave + 1} / ${level.waves.length}`;
  }

  getLevelLabel(): string {
    return `Level ${this.currentLevel + 1} / ${this.levels.length}`;
  }

  getStartEnergy(): number {
    return this.levels[this.currentLevel].startEnergy;
  }

  getDelayRemaining(): number {
    return Math.max(0, this.delayTimer);
  }

  isInDelay(): boolean {
    return !this.started && !this.allSpawned;
  }
}
