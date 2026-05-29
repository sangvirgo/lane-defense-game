import { PlantType } from './types';

export class Projectile {
  row: number;
  x: number;
  y: number;
  speed: number;
  damage: number;
  plantType: PlantType;
  alive: boolean = true;

  constructor(row: number, x: number, y: number, speed: number, damage: number, plantType: PlantType) {
    this.row = row;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.damage = damage;
    this.plantType = plantType;
  }

  update(dt: number): void {
    this.x += this.speed * dt;
  }
}
