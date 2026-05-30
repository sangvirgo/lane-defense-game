import { GameEngine } from './game/GameEngine';
import * as C from './game/Constants';

const canvas = document.getElementById('game') as HTMLCanvasElement;
canvas.width = C.CANVAS_WIDTH;
canvas.height = C.CANVAS_HEIGHT;
canvas.style.cursor = 'pointer';

const engine = new GameEngine(canvas);

// Init audio and start music on first user interaction (autoplay policy)
document.addEventListener('click', () => {
  engine.audio.init();
  engine.audio.startMusic();
}, { once: true });

engine.start();
