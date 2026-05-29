import { GameEngine } from './game/GameEngine';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const engine = new GameEngine(canvas);
engine.start();
