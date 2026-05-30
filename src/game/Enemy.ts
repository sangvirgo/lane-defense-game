import { EnemyType, ENEMY_DATA } from './types';

export class Enemy {
  row: number;
  x: number;
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  damage: number;
  color: string;
  symbol: string;
  score: number;
  alive: boolean = true;
  slowTimer: number = 0;
  hitFlash: number = 0;
  deathAnim: number = 0;
  healCooldown: number = 0;

  constructor(row: number, startX: number, type: EnemyType) {
    this.row = row;
    this.x = startX;
    this.type = type;
    const data = ENEMY_DATA[type];
    this.hp = data.hp;
    this.maxHp = data.hp;
    this.speed = data.speed;
    this.baseSpeed = data.speed;
    this.damage = data.damage;
    this.color = data.color;
    this.symbol = data.symbol;
    this.score = data.score;
  }

  update(dt: number, cellSize: number): void {
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.deathAnim > 0 && !this.alive) this.deathAnim -= dt;
    if (this.healCooldown > 0) this.healCooldown -= dt;
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      this.speed = this.baseSpeed * 0.5;
    } else {
      this.speed = this.baseSpeed;
    }
    this.x -= this.speed * cellSize * dt;
  }

  canHeal(): boolean {
    return this.type === EnemyType.Healer && this.healCooldown <= 0;
  }

  doHeal(): void {
    this.healCooldown = 3;
  }

  takeDamage(amount: number): void {
    this.hp -= amount;
    this.hitFlash = 0.15;
    if (this.hp <= 0) {
      this.alive = false;
      this.deathAnim = 0.5;
    }
  }

  applySlow(duration: number): void {
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  getCol(cellSize: number): number {
    return Math.floor(this.x / cellSize);
  }
}
