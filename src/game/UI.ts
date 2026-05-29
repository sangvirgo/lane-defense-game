import { PlantType, PLANT_DATA } from './types';

export class UI {
  cardHeight: number = 60;
  cardWidth: number = 70;
  cardGap: number = 8;
  cards: { type: PlantType; rect: { x: number; y: number; w: number; h: number } }[] = [];

  constructor(canvasWidth: number, canvasHeight: number) {
    const types = [
      PlantType.BasicShooter,
      PlantType.DoubleShooter,
      PlantType.Sunflower,
      PlantType.WallNut,
      PlantType.FreezePlant,
      PlantType.BombPlant,
    ];
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

  render(ctx: CanvasRenderingContext2D, energy: number, selected: PlantType | null, waveLabel: string, gameState: string, score: number): void {
    // Energy display
    ctx.fillStyle = '#FFD600';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`☀ ${energy}`, 20, 30);

    // Score
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, ctx.canvas.width - 20, 30);

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
      ctx.strokeStyle = energy >= data.cost ? '#8BC34A' : '#666';
      ctx.lineWidth = selected === card.type ? 3 : 1;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.lineWidth = 1;

      // Symbol
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(data.symbol, r.x + r.w / 2, r.y + 28);

      // Cost
      ctx.font = '11px Arial';
      ctx.fillStyle = energy >= data.cost ? '#FFD600' : '#999';
      ctx.fillText(`${data.cost}`, r.x + r.w / 2, r.y + 48);
    }

    // Tooltip on hover
    this.renderTooltip(ctx);

    // Game state overlay
    if (gameState === 'won' || gameState === 'lost' || gameState === 'levelComplete') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = gameState === 'won' ? '#4CAF50' : gameState === 'levelComplete' ? '#2196F3' : '#F44336';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      const msg = gameState === 'won' ? 'YOU WIN!' : gameState === 'levelComplete' ? 'LEVEL COMPLETE!' : 'GAME OVER';
      ctx.fillText(msg, ctx.canvas.width / 2, ctx.canvas.height / 2 - 30);

      // Score
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${score}`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 10);

      // Button
      ctx.fillStyle = '#2196F3';
      const bw = 180, bh = 50;
      const bx = ctx.canvas.width / 2 - bw / 2;
      const by = ctx.canvas.height / 2 + 30;
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      const btnText = gameState === 'levelComplete' ? 'NEXT LEVEL' : 'RESTART';
      ctx.fillText(btnText, ctx.canvas.width / 2, by + 33);
    }
  }

  private hoverCard: PlantType | null = null;

  setHover(x: number, y: number): void {
    this.hoverCard = null;
    for (const card of this.cards) {
      const r = card.rect;
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        this.hoverCard = card.type;
        break;
      }
    }
  }

  private renderTooltip(ctx: CanvasRenderingContext2D): void {
    if (!this.hoverCard) return;
    const data = PLANT_DATA[this.hoverCard];
    const card = this.cards.find(c => c.type === this.hoverCard)!;
    const r = card.rect;

    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(r.x, r.y - 80, r.w + 60, 75);
    ctx.strokeStyle = '#8BC34A';
    ctx.strokeRect(r.x, r.y - 80, r.w + 60, 75);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(data.description, r.x + 5, r.y - 60);
    if (data.special) {
      ctx.fillStyle = '#8BC34A';
      ctx.fillText(data.special, r.x + 5, r.y - 45);
    }
    ctx.fillStyle = '#FFD600';
    ctx.fillText(`Cost: ${data.cost} | HP: ${data.hp}`, r.x + 5, r.y - 30);
    if (data.damage > 0) {
      ctx.fillStyle = '#F44336';
      ctx.fillText(`DMG: ${data.damage} | Rate: ${data.fireRate}/s`, r.x + 5, r.y - 15);
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
    const bw = 180, bh = 50;
    const bx = canvasWidth / 2 - bw / 2;
    const by = canvasHeight / 2 + 30;
    return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
  }
}
