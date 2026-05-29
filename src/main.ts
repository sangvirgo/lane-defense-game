import { GameEngine } from './game/GameEngine';

const canvas = document.createElement('canvas');
canvas.width = 810;
canvas.height = 370;
canvas.style.display = 'block';
canvas.style.margin = '20px auto';
canvas.style.border = '2px solid #333';
canvas.style.cursor = 'pointer';
document.body.appendChild(canvas);

const engine = new GameEngine(canvas);
engine.start();
