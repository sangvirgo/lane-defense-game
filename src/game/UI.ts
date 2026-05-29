import { PlantType, PLANT_DATA } from './types';

export class UI {
  cardHeight: number = 60;
  cardWidth: number = 80;
  cardGap: number = 10;
  cards: { type: PlantType; rect: { x: number; y: number; w: number; h: number } }[] = [];

  constructor(canvasWidth: number, canvasHeight: number) {
    const types = [PlantType.BasicShooter, PlantType.WallNut, PlantType.Sunflower];
    const totalWidth = types.length * this.cardWidth + (types.length - 1) * this.cardGap;
    const startX = (canvasWidth - totalWidth) / 2;
    const y = canvasHeight - this.cardHeight - 10;
    types.forEach((type, i) => {
      this.cards.push({
        type,
        rect: {
          x: startX + i * (this.cardWidth + this.cardGap),
          y,
          w: this.cardWidth,
          h: this.cardHeight,
        },
      });
    });
  }

  render(ctx: CanvasRenderingContext2D, energy: number, selected: PlantType | null, waveLabel: string, gameState: string): void {
    // Energy display
    ctx.fillStyle = '#FFD600';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`☀ ${energy}`, 20, 30);

    // Wave label
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(waveLabel, ctx.canvas.width / 2, 30);

    // Plant cards
    for (const card of this.cards) {
      const data = PLANT_DATA[card.type];
      const r = card.rect;
      ctx.fillStyle = selected === card.type ? '#558B2F' : '#33691E';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = '#8BC34A';
      ctx.lineWidth = selected === card.type ? 3 : 1;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.lineWidth = 1;

      // Symbol
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(data.symbol, r.x + r.w / 2, r.y + 30);

      // Cost
      ctx.font = '12px Arial';
      ctx.fillStyle = energy >= data.cost ? '#FFD600' : '#999';
      ctx.fillText(`${data.cost}`, r.x + r.w / 2, r.y + 50);
    }

    // Game state overlay
    if (gameState === 'won' || gameState === 'lost') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = gameState === 'won' ? '#4CAF50' : '#F44336';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(gameState === 'won' ? 'YOU WIN!' : 'GAME OVER', ctx.canvas.width / 2, ctx.canvas.height / 2 - 20);

      // Restart button
      ctx.fillStyle = '#2196F3';
      const bw = 160, bh = 50;
      const bx = ctx.canvas.width / 2 - bw / 2;
      const by = ctx.canvas.height / 2 + 20;
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('RESTART', ctx.canvas.width / 2, by + 33);
    }
  }

  getClickedCard(x: number, y: number): PlantType | null {
    for (const card of this.cards) {
      const r = card.rect;
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        return card.type;
      }
    }
    return null;
  }

  isRestartClick(x: number, y: number, canvasWidth: number, canvasHeight: number): boolean {
    const bw = 160, bh = 50;
    const bx = canvasWidth / 2 - bw / 2;
    const by = canvasHeight / 2 + 20;
    return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
  }
}
