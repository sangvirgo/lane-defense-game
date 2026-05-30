import { GameEngine } from './game/GameEngine';

const canvas = document.getElementById('game') as HTMLCanvasElement;
canvas.width = 810;
canvas.height = 370;
canvas.style.cursor = 'pointer';

const engine = new GameEngine(canvas);

// Init audio and start music on first user interaction (autoplay policy)
document.addEventListener('click', () => {
  engine.audio.init();
  engine.audio.startMusic();
}, { once: true });

engine.start();
