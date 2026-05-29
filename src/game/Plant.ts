import { Position, PlantType, PLANT_DATA } from './types';

export class Plant {
  pos: Position;
  type: PlantType;
  hp: number;
  maxHp: number;
  damage: number;
  fireRate: number;
  fireCooldown: number = 0;
  color: string;
  symbol: string;
  description: string;
  special?: string;
  sunTimer: number = 0;

  constructor(pos: Position, type: PlantType) {
    this.pos = pos;
    this.type = type;
    const data = PLANT_DATA[type];
    this.hp = data.hp;
    this.maxHp = data.hp;
    this.damage = data.damage;
    this.fireRate = data.fireRate;
    this.color = data.color;
    this.symbol = data.symbol;
    this.description = data.description;
    this.special = data.special;
  }

  update(dt: number): boolean {
    if (this.type === PlantType.Sunflower) {
      this.sunTimer += dt;
      if (this.sunTimer >= 10) {
        this.sunTimer -= 10;
        return true; // produce energy
      }
      return false;
    }

    if (this.fireRate > 0) {
      this.fireCooldown -= dt;
      if (this.fireCooldown <= 0) {
        this.fireCooldown = 1 / this.fireRate;
        return true; // should shoot
      }
    }
    return false;
  }

  takeDamage(amount: number): void {
    this.hp -= amount;
  }

  isDead(): boolean {
    return this.hp <= 0;
  }
}
