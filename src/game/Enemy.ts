import { EnemyType, ENEMY_DATA } from './types';

export class Enemy {
  row: number;
  x: number;
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  color: string;
  symbol: string;
  alive: boolean = true;

  constructor(row: number, startX: number, type: EnemyType) {
    this.row = row;
    this.x = startX;
    this.type = type;
    const data = ENEMY_DATA[type];
    this.hp = data.hp;
    this.maxHp = data.hp;
    this.speed = data.speed;
    this.damage = data.damage;
    this.color = data.color;
    this.symbol = data.symbol;
  }

  update(dt: number, cellSize: number): void {
    this.x -= this.speed * cellSize * dt;
  }

  takeDamage(amount: number): void {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.alive = false;
    }
  }

  getCol(cellSize: number): number {
    return Math.floor(this.x / cellSize);
  }
}
