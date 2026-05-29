import { Position } from './types';

export class Board {
  rows: number;
  cols: number;
  cellSize: number;
  offsetX: number;
  offsetY: number;

  constructor(rows: number, cols: number, cellSize: number, offsetX: number, offsetY: number) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.offsetX + c * this.cellSize;
        const y = this.offsetY + r * this.cellSize;
        ctx.fillStyle = (r + c) % 2 === 0 ? '#2d5a1e' : '#3a6b2a';
        ctx.fillRect(x, y, this.cellSize, this.cellSize);
        ctx.strokeStyle = '#1a3a10';
        ctx.strokeRect(x, y, this.cellSize, this.cellSize);
      }
    }
  }

  getCellFromPixel(px: number, py: number): Position | null {
    const col = Math.floor((px - this.offsetX) / this.cellSize);
    const row = Math.floor((py - this.offsetY) / this.cellSize);
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      return { row, col };
    }
    return null;
  }

  getCellCenter(row: number, col: number): { x: number; y: number } {
    return {
      x: this.offsetX + col * this.cellSize + this.cellSize / 2,
      y: this.offsetY + row * this.cellSize + this.cellSize / 2,
    };
  }
}
