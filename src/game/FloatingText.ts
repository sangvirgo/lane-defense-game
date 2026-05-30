export class FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number = -40;

  constructor(x: number, y: number, text: string, color: string, duration: number = 0.8) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = duration;
    this.maxLife = duration;
  }

  update(dt: number): void {
    this.y += this.vy * dt;
    this.life -= dt;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
  }

  isDead(): boolean {
    return this.life <= 0;
  }
}
