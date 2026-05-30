export class AudioManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private volume: number = 0.3;

  init(): void {
    this.ctx = new AudioContext();
  }

  private ensureCtx(): AudioContext {
    if (!this.ctx) this.init();
    return this.ctx!;
  }

  toggleMute(): void {
    this.muted = !this.muted;
    if (this.muted && this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
    } else if (!this.muted) {
      this.startMusic();
    }
  }

  private musicSource: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;

  startMusic(): void {
    if (this.muted) return;
    try {
      const ctx = this.ensureCtx();
      if (this.musicSource) return;

      // Simple ambient music loop using oscillators
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.connect(ctx.destination);
      this.musicGain = gain;

      // Pad chord
      const oscs: OscillatorNode[] = [];
      for (const freq of notes) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.connect(gain);
        osc.start(now);
        oscs.push(osc);
      }
      this.musicSource = oscs[0];

      // Slowly modulate volume
      const modulate = () => {
        if (!this.musicGain || this.muted) return;
        const t = ctx.currentTime;
        this.musicGain.gain.setValueAtTime(0.03 + Math.sin(t * 0.5) * 0.02, t);
      };
      setInterval(modulate, 500);
    } catch (_e) {
      // ignore
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  playPlace(): void {
    if (this.muted) return;
    this.playTone(440, 0.1, 'sine');
    setTimeout(() => this.playTone(550, 0.1, 'sine'), 50);
  }

  playShoot(): void {
    if (this.muted) return;
    this.playTone(800, 0.05, 'square');
  }

  playHit(): void {
    if (this.muted) return;
    this.playNoise(0.05);
  }

  playEnemyDeath(): void {
    if (this.muted) return;
    this.playTone(300, 0.15, 'sawtooth');
    setTimeout(() => this.playTone(200, 0.1, 'sawtooth'), 80);
  }

  playWin(): void {
    if (this.muted) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine'), i * 150);
    });
  }

  playLose(): void {
    if (this.muted) return;
    const notes = [400, 350, 300, 250];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sawtooth'), i * 200);
    });
  }

  playWaveStart(): void {
    if (this.muted) return;
    this.playTone(600, 0.1, 'sine');
    setTimeout(() => this.playTone(800, 0.15, 'sine'), 100);
  }

  private playTone(freq: number, duration: number, type: OscillatorType): void {
    try {
      const ctx = this.ensureCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_e) {
      // ignore audio errors
    }
  }

  private playNoise(duration: number): void {
    try {
      const ctx = this.ensureCtx();
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch (_e) {
      // ignore audio errors
    }
  }
}
