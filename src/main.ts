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

// Init audio on first user interaction (autoplay policy)
document.addEventListener('click', () => {
  engine.audio.init();
}, { once: true });

engine.start();
