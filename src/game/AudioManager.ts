export class AudioManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private volume: number = 0.3;
  private musicGain: GainNode | null = null;
  private musicOscs: OscillatorNode[] = [];
  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private musicPlaying: boolean = false;

  init(): void {
    if (this.ctx) return;
    this.ctx = new AudioContext();
  }

  private ensureCtx(): AudioContext {
    if (!this.ctx) this.init();
    return this.ctx!;
  }

  toggleMute(): void {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  private stopMusic(): void {
    if (this.musicGain) {
      try {
        this.musicGain.gain.setValueAtTime(0, this.ctx!.currentTime);
      } catch (_e) { /* ignore */ }
    }
    for (const osc of this.musicOscs) {
      try { osc.stop(); } catch (_e) { /* ignore */ }
    }
    this.musicOscs = [];
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.musicPlaying = false;
    this.musicGain = null;
  }

  startMusic(): void {
    if (this.muted || this.musicPlaying) return;
    try {
      const ctx = this.ensureCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.connect(ctx.destination);
      this.musicGain = gain;

      // Fun PvZ-style melody loop
      const melody = [
        // C major arpeggio pattern
        { notes: [261.63, 329.63, 392.00], dur: 0.4 },
        { notes: [349.23, 440.00, 523.25], dur: 0.4 },
        { notes: [392.00, 493.88, 587.33], dur: 0.4 },
        { notes: [329.63, 415.30, 523.25], dur: 0.4 },
        { notes: [293.66, 369.99, 440.00], dur: 0.4 },
        { notes: [349.23, 440.00, 523.25], dur: 0.4 },
        { notes: [392.00, 493.88, 587.33], dur: 0.4 },
        { notes: [523.25, 659.25, 783.99], dur: 0.6 },
      ];

      let step = 0;
      const playStep = () => {
        if (this.muted || !this.musicGain) return;
        const currentCtx = this.ensureCtx();
        const now = currentCtx.currentTime;
        const { notes, dur } = melody[step % melody.length];

        for (const freq of notes) {
          const osc = currentCtx.createOscillator();
          const noteGain = currentCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          noteGain.gain.setValueAtTime(0.03, now);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
          osc.connect(noteGain);
          noteGain.connect(this.musicGain!);
          osc.start(now);
          osc.stop(now + dur);
        }

        // Bass note every 2 steps
        if (step % 2 === 0) {
          const bassFreq = notes[0] / 2;
          const bassOsc = currentCtx.createOscillator();
          const bassGain = currentCtx.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(bassFreq, now);
          bassGain.gain.setValueAtTime(0.05, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + dur * 2);
          bassOsc.connect(bassGain);
          bassGain.connect(this.musicGain!);
          bassOsc.start(now);
          bassOsc.stop(now + dur * 2);
        }

        step++;
      };

      playStep();
      this.musicInterval = setInterval(playStep, 400);
      this.musicPlaying = true;
    } catch (_e) {
      // ignore
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  playReady(): void {
    if (this.muted) return;
    // Ascending fanfare
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.25, 'sine'), i * 200);
    });
  }

  playPlace(): void {
    if (this.muted) return;
    this.playTone(440, 0.1, 'sine');
    setTimeout(() => this.playTone(550, 0.1, 'sine'), 50);
    setTimeout(() => this.playTone(660, 0.08, 'sine'), 100);
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
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.25, 'sine'), i * 150);
    });
  }

  playLose(): void {
    if (this.muted) return;
    const notes = [400, 350, 300, 250, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sawtooth'), i * 200);
    });
  }

  playWaveStart(): void {
    if (this.muted) return;
    this.playTone(600, 0.15, 'sine');
    setTimeout(() => this.playTone(800, 0.2, 'sine'), 100);
    setTimeout(() => this.playTone(1000, 0.15, 'sine'), 200);
  }

  playCountdownTick(): void {
    if (this.muted) return;
    this.playTone(660, 0.08, 'sine');
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
