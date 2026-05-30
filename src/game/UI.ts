import { PlantType, PLANT_DATA } from './types';
import * as C from './Constants';

export class UI {
  cardHeight: number = C.CARD_HEIGHT;
  cardWidth: number = C.CARD_WIDTH;
  cardGap: number = C.CARD_GAP;
  cards: { type: PlantType; rect: { x: number; y: number; w: number; h: number } }[] = [];
  private hoverCard: PlantType | null = null;
  private cooldowns: Map<PlantType, number> = new Map();

  constructor(_canvasWidth: number, canvasHeight: number) {
    const types = [
      PlantType.BasicShooter,
      PlantType.DoubleShooter,
      PlantType.Sunflower,
      PlantType.WallNut,
      PlantType.FreezePlant,
      PlantType.BombPlant,
    ];
    const startX = 120; // after sun counter
    const y = canvasHeight - this.cardHeight - 12;
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

  setCooldown(type: PlantType, duration: number): void {
    this.cooldowns.set(type, duration);
  }

  updateCooldowns(dt: number): void {
    for (const [type, remaining] of this.cooldowns) {
      const newTime = remaining - dt;
      if (newTime <= 0) {
        this.cooldowns.delete(type);
      } else {
        this.cooldowns.set(type, newTime);
      }
    }
  }

  isOnCooldown(type: PlantType): boolean {
    return this.cooldowns.has(type) && this.cooldowns.get(type)! > 0;
  }

  getCooldownRatio(type: PlantType): number {
    const remaining = this.cooldowns.get(type);
    if (!remaining || remaining <= 0) return 0;
    return remaining / C.PLANT_CARD_COOLDOWN;
  }

  render(ctx: CanvasRenderingContext2D, energy: number, selected: PlantType | null, waveLabel: string, gameState: string, score: number, muted: boolean = false, shovelActive: boolean = false): void {
    // === SUN COUNTER (PvZ style) ===
    // Outer frame
    ctx.fillStyle = '#5C3317';
    const scX = 8, scY = 8, scW = 100, scH = 42;
    ctx.beginPath();
    ctx.moveTo(scX + 6, scY);
    ctx.lineTo(scX + scW - 6, scY);
    ctx.quadraticCurveTo(scX + scW, scY, scX + scW, scY + 6);
    ctx.lineTo(scX + scW, scY + scH - 6);
    ctx.quadraticCurveTo(scX + scW, scY + scH, scX + scW - 6, scY + scH);
    ctx.lineTo(scX + 6, scY + scH);
    ctx.quadraticCurveTo(scX, scY + scH, scX, scY + scH - 6);
    ctx.lineTo(scX, scY + 6);
    ctx.quadraticCurveTo(scX, scY, scX + 6, scY);
    ctx.closePath();
    ctx.fill();
    // Inner
    ctx.fillStyle = '#7B5B3A';
    ctx.beginPath();
    ctx.moveTo(scX + 4, scY + 2);
    ctx.lineTo(scX + scW - 4, scY + 2);
    ctx.quadraticCurveTo(scX + scW - 2, scY + 2, scX + scW - 2, scY + 4);
    ctx.lineTo(scX + scW - 2, scY + scH - 4);
    ctx.quadraticCurveTo(scX + scW - 2, scY + scH - 2, scX + scW - 4, scY + scH - 2);
    ctx.lineTo(scX + 4, scY + scH - 2);
    ctx.quadraticCurveTo(scX + 2, scY + scH - 2, scX + 2, scY + scH - 4);
    ctx.lineTo(scX + 2, scY + 4);
    ctx.quadraticCurveTo(scX + 2, scY + 2, scX + 4, scY + 2);
    ctx.closePath();
    ctx.fill();
    // Sun icon
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(35, 29, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFA000';
    ctx.beginPath();
    ctx.arc(35, 29, 10, 0, Math.PI * 2);
    ctx.fill();
    // Sun rays
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(35 + Math.cos(a) * 12, 29 + Math.sin(a) * 12);
      ctx.lineTo(35 + Math.cos(a) * 17, 29 + Math.sin(a) * 17);
      ctx.stroke();
    }
    // Energy number
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${energy}`, 55, 35);

    // === SCORE ===
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, ctx.canvas.width - 20, 28);

    // === WAVE INDICATOR (top right) ===
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    const wlW = 260, wlH = 30;
    const wlX = ctx.canvas.width - wlW - 10;
    ctx.beginPath();
    ctx.moveTo(wlX + 8, 8);
    ctx.lineTo(wlX + wlW - 8, 8);
    ctx.quadraticCurveTo(wlX + wlW, 8, wlX + wlW, 16);
    ctx.lineTo(wlX + wlW, 8 + wlH - 8);
    ctx.quadraticCurveTo(wlX + wlW, 8 + wlH, wlX + wlW - 8, 8 + wlH);
    ctx.lineTo(wlX + 8, 8 + wlH);
    ctx.quadraticCurveTo(wlX, 8 + wlH, wlX, 8 + wlH - 8);
    ctx.lineTo(wlX, 16);
    ctx.quadraticCurveTo(wlX, 8, wlX + 8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(waveLabel, wlX + wlW / 2, 28);

    // === CARD BAR (PvZ style) ===
    const barY = ctx.canvas.height - this.cardHeight - 22;
    const barH = this.cardHeight + 22;
    // Dark brown background
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(0, barY, ctx.canvas.width, barH);
    // Gold top border
    ctx.fillStyle = '#FFB300';
    ctx.fillRect(0, barY, ctx.canvas.width, 3);
    // Inner lighter brown
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(0, barY + 3, ctx.canvas.width, barH - 3);
    // Bottom border
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(0, ctx.canvas.height - 3, ctx.canvas.width, 3);

    // === PLANT CARDS ===
    for (const card of this.cards) {
      const data = PLANT_DATA[card.type];
      const r = card.rect;
      const onCooldown = this.isOnCooldown(card.type);
      const canAfford = energy >= data.cost;
      const isSelected = selected === card.type;

      // Card shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(r.x + 2, r.y + 2, r.w, r.h);

      // Card background
      if (isSelected) {
        ctx.fillStyle = '#7CB342';
      } else if (onCooldown || !canAfford) {
        ctx.fillStyle = '#5D4037';
      } else {
        ctx.fillStyle = '#689F38';
      }
      ctx.fillRect(r.x, r.y, r.w, r.h);

      // Card inner border
      ctx.strokeStyle = isSelected ? '#C0CA33' : canAfford && !onCooldown ? '#AED581' : '#795548';
      ctx.lineWidth = isSelected ? 2.5 : 1;
      ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
      ctx.lineWidth = 1;

      // Gold outer border for selected
      if (isSelected) {
        ctx.strokeStyle = '#FFB300';
        ctx.lineWidth = 2;
        ctx.strokeRect(r.x - 1, r.y - 1, r.w + 2, r.h + 2);
        ctx.lineWidth = 1;
      }

      // Plant symbol (emoji)
      ctx.font = '22px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.symbol, r.x + r.w / 2, r.y + r.h * 0.38);
      ctx.textBaseline = 'alphabetic';

      // Cost with sun icon
      const costColor = canAfford ? '#FFD600' : '#999';
      ctx.fillStyle = costColor;
      ctx.font = 'bold 11px Arial';
      ctx.fillText(`${data.cost}`, r.x + r.w / 2, r.y + r.h - 10);

      // Small sun icon next to cost
      ctx.fillStyle = canAfford ? '#FFD700' : '#666';
      ctx.beginPath();
      ctx.arc(r.x + r.w / 2 - 18, r.y + r.h - 13, 5, 0, Math.PI * 2);
      ctx.fill();

      // Cooldown overlay
      if (onCooldown) {
        const ratio = this.getCooldownRatio(card.type);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(r.x, r.y, r.w, r.h * ratio);
        // Cooldown timer text
        const remaining = this.cooldowns.get(card.type)!;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(remaining)}`, r.x + r.w / 2, r.y + r.h / 2 + 5);
      }

      // Keyboard shortcut number
      const idx = this.cards.indexOf(card);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '9px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${idx + 1}`, r.x + r.w - 3, r.y + 11);
    }

    // === MUTE BUTTON ===
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(muted ? '🔇' : '🔊', ctx.canvas.width - 35, 48);
    ctx.textBaseline = 'alphabetic';

    // === SHOVEL INDICATOR ===
    if (shovelActive) {
      ctx.fillStyle = 'rgba(255,152,0,0.9)';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('🔧 DIGGING', 8, 65);
    }

    // === KEYBOARD HINTS ===
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('[1-6] Plants  [S] Shovel  [ESC] Pause', ctx.canvas.width / 2, ctx.canvas.height - 4);

    // Tooltip on hover
    this.renderTooltip(ctx);

    // Game state overlay
    if (gameState === 'won' || gameState === 'lost' || gameState === 'levelComplete') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Banner background
      const bannerY = ctx.canvas.height / 2 - 80;
      ctx.fillStyle = gameState === 'won' ? 'rgba(76,175,80,0.9)' : gameState === 'levelComplete' ? 'rgba(33,150,243,0.9)' : 'rgba(244,67,54,0.9)';
      ctx.beginPath();
      ctx.moveTo(ctx.canvas.width / 2 - 160, bannerY);
      ctx.lineTo(ctx.canvas.width / 2 + 160, bannerY);
      ctx.lineTo(ctx.canvas.width / 2 + 150, bannerY + 100);
      ctx.lineTo(ctx.canvas.width / 2 - 150, bannerY + 100);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 42px Arial';
      ctx.textAlign = 'center';
      const msg = gameState === 'won' ? 'YOU WIN!' : gameState === 'levelComplete' ? 'LEVEL COMPLETE!' : 'GAME OVER';
      ctx.fillText(msg, ctx.canvas.width / 2, ctx.canvas.height / 2 - 30);

      // Stars
      if (gameState === 'levelComplete' || gameState === 'won') {
        ctx.font = '28px Arial';
        let starStr = '';
        for (let i = 0; i < 3; i++) {
          starStr += '⭐ ';
        }
        ctx.fillText(starStr, ctx.canvas.width / 2, ctx.canvas.height / 2 + 5);
      }

      // Score
      ctx.fillStyle = '#FFD600';
      ctx.font = 'bold 22px Arial';
      ctx.fillText(`Score: ${score}`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 35);

      // Button
      ctx.fillStyle = '#fff';
      const bw = 200, bh = 50;
      const bx = ctx.canvas.width / 2 - bw / 2;
      const by = ctx.canvas.height / 2 + 50;
      // Button shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(bx + 3, by + 3, bw, bh);
      // Button
      ctx.fillStyle = gameState === 'levelComplete' ? '#1565C0' : '#2196F3';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.lineWidth = 1;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      const btnText = gameState === 'levelComplete' ? 'NEXT LEVEL →' : '🔄 RESTART';
      ctx.fillText(btnText, ctx.canvas.width / 2, by + 33);
    }
  }

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

    const ttW = 180, ttH = 80;
    const ttX = r.x;
    const ttY = r.y - ttH - 8;

    // Tooltip bg
    ctx.fillStyle = 'rgba(30,30,30,0.95)';
    ctx.beginPath();
    ctx.moveTo(ttX + 6, ttY);
    ctx.lineTo(ttX + ttW - 6, ttY);
    ctx.quadraticCurveTo(ttX + ttW, ttY, ttX + ttW, ttY + 6);
    ctx.lineTo(ttX + ttW, ttY + ttH - 6);
    ctx.quadraticCurveTo(ttX + ttW, ttY + ttH, ttX + ttW - 6, ttY + ttH);
    ctx.lineTo(ttX + 6, ttY + ttH);
    ctx.quadraticCurveTo(ttX, ttY + ttH, ttX, ttY + ttH - 6);
    ctx.lineTo(ttX, ttY + 6);
    ctx.quadraticCurveTo(ttX, ttY, ttX + 6, ttY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8BC34A';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.lineWidth = 1;

    // Tooltip content
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(data.description, ttX + 8, ttY + 18);
    if (data.special) {
      ctx.fillStyle = '#8BC34A';
      ctx.font = '11px Arial';
      ctx.fillText(`✦ ${data.special}`, ttX + 8, ttY + 34);
    }
    ctx.fillStyle = '#FFD600';
    ctx.font = '11px Arial';
    ctx.fillText(`☀ ${data.cost}  |  HP: ${data.hp}`, ttX + 8, ttY + 50);
    if (data.damage > 0) {
      ctx.fillStyle = '#EF5350';
      ctx.fillText(`⚔ DMG: ${data.damage}  |  Rate: ${data.fireRate}/s`, ttX + 8, ttY + 66);
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
    const bw = 200, bh = 50;
    const bx = canvasWidth / 2 - bw / 2;
    const by = canvasHeight / 2 + 50;
    return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
  }

  isMuteClick(x: number, y: number, canvasWidth: number): boolean {
    const mx = canvasWidth - 35;
    const my = 48;
    return x >= mx - 15 && x <= mx + 15 && y >= my - 15 && y <= my + 15;
  }
}
