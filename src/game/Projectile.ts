export class Projectile {
  row: number;
  x: number;
  y: number;
  speed: number;
  damage: number;
  alive: boolean = true;

  constructor(row: number, x: number, y: number, speed: number, damage: number) {
    this.row = row;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.damage = damage;
  }

  update(dt: number): void {
    this.x += this.speed * dt;
  }
}
