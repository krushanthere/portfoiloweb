// Procedural Web Audio API sound generator for the Wormhole Hyperspace Preloader
// Zero external files required; 100% lightweight & synthesized in real-time.

class WormholeAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private isInitialized: boolean = false;

  // Audio Nodes
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;
  private warpWhistleOsc: OscillatorNode | null = null;
  private warpWhistleGain: GainNode | null = null;

  public init() {
    if (typeof window === "undefined") return;

    if (this.ctx && this.ctx.state !== "closed" && this.isInitialized) {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Low-frequency hyperspace rumble (Sub-bass drone)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneGain = this.ctx.createGain();

      this.droneOsc1.type = "sawtooth";
      this.droneOsc1.frequency.setValueAtTime(45, this.ctx.currentTime);

      this.droneOsc2.type = "sine";
      this.droneOsc2.frequency.setValueAtTime(55, this.ctx.currentTime);

      this.droneFilter.type = "lowpass";
      this.droneFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
      this.droneFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.droneGain.gain.exponentialRampToValueAtTime(0.25, this.ctx.currentTime + 0.8);

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();

      // High-frequency relativistic warp whistle
      this.warpWhistleOsc = this.ctx.createOscillator();
      this.warpWhistleGain = this.ctx.createGain();
      const whistleFilter = this.ctx.createBiquadFilter();

      this.warpWhistleOsc.type = "sine";
      this.warpWhistleOsc.frequency.setValueAtTime(180, this.ctx.currentTime);

      whistleFilter.type = "bandpass";
      whistleFilter.frequency.setValueAtTime(600, this.ctx.currentTime);
      whistleFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      this.warpWhistleGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.warpWhistleGain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 1.0);

      this.warpWhistleOsc.connect(whistleFilter);
      whistleFilter.connect(this.warpWhistleGain);
      this.warpWhistleGain.connect(this.masterGain);

      this.warpWhistleOsc.start();

      this.isInitialized = true;
    } catch {
      // Gracefully handle browser restrictions
    }
  }

  public updateSpeed(speedFactor: number, boost: boolean) {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;

    const baseDroneFreq = 45 + speedFactor * 40 + (boost ? 25 : 0);
    const filterFreq = 120 + speedFactor * 300 + (boost ? 180 : 0);
    const whistleFreq = 220 + speedFactor * 750 + (boost ? 350 : 0);

    if (this.droneOsc1) {
      this.droneOsc1.frequency.setTargetAtTime(baseDroneFreq, now, 0.1);
    }
    if (this.droneOsc2) {
      this.droneOsc2.frequency.setTargetAtTime(baseDroneFreq * 1.25, now, 0.1);
    }
    if (this.droneFilter) {
      this.droneFilter.frequency.setTargetAtTime(filterFreq, now, 0.1);
    }
    if (this.warpWhistleOsc) {
      this.warpWhistleOsc.frequency.setTargetAtTime(whistleFreq, now, 0.1);
    }
  }

  public playWarpExit() {
    if (!this.ctx || !this.masterGain || this.ctx.state === "closed") {
      this.init();
    }
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      // Sonic hyperspace boom on event horizon breach
      const boomOsc = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      const boomFilter = this.ctx.createBiquadFilter();

      boomOsc.type = "sawtooth";
      boomOsc.frequency.setValueAtTime(240, now);
      boomOsc.frequency.exponentialRampToValueAtTime(25, now + 1.2);

      boomFilter.type = "lowpass";
      boomFilter.frequency.setValueAtTime(700, now);
      boomFilter.frequency.exponentialRampToValueAtTime(40, now + 1.2);

      boomGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      boomOsc.connect(boomFilter);
      boomFilter.connect(boomGain);
      boomGain.connect(this.masterGain);

      boomOsc.start(now);
      boomOsc.stop(now + 1.4);

      // Fade master out smoothly
      this.masterGain.gain.setTargetAtTime(0.0001, now + 0.2, 0.3);
    } catch {
      // Ignore
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      if (!this.isInitialized || !this.ctx || this.ctx.state === "closed") {
        this.init();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      if (this.ctx && this.masterGain) {
        this.masterGain.gain.setTargetAtTime(0.25, this.ctx.currentTime, 0.05);
      }
    } else {
      if (this.ctx && this.masterGain) {
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public stop() {
    if (this.ctx && this.ctx.state !== "closed") {
      try {
        if (this.masterGain) {
          this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        this.droneOsc1?.stop();
        this.droneOsc2?.stop();
        this.warpWhistleOsc?.stop();
        this.ctx.close();
      } catch {
        // Ignore
      }
    }
    this.ctx = null;
    this.masterGain = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneFilter = null;
    this.droneGain = null;
    this.warpWhistleOsc = null;
    this.warpWhistleGain = null;
    this.isInitialized = false;
  }
}

export const wormholeAudio = new WormholeAudioEngine();
