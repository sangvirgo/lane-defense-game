export class LawnMower {
  row: number;
  x: number;
  active: boolean = false;
  consumed: boolean = false;
  speed: number = 350;

  constructor(row: number, x: number) {
    this.row = row;
    this.x = x;
  }

  activate(): void {
    this.active = true;
    this.x = -20; // start from left edge of canvas
  }

  update(dt: number): void {
    if (this.active && !this.consumed) {
      this.x += this.speed * dt;
    }
  }

  isOffScreen(canvasWidth: number): boolean {
    return this.x > canvasWidth + 50;
  }
}
