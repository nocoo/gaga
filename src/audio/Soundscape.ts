/** A quiet, original pentatonic soundscape. Nothing downloads or autoplays. */
export class Soundscape {
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private melodyIndex = 0;
  enabled = false;
  private readonly melody = [0, 7, 12, 9, 4, 7, 2, 0, 4, 9, 7, 2, 12, 7, 4, 2];

  async toggle() {
    if (this.enabled) { this.mute(); return false; }
    if (!this.context) {
      this.context = new AudioContext();
      this.gain = this.context.createGain(); this.gain.gain.value = 0;
      this.gain.connect(this.context.destination);
    }
    await this.context.resume();
    this.enabled = true;
    this.gain!.gain.cancelScheduledValues(this.context.currentTime);
    this.gain!.gain.setTargetAtTime(.16, this.context.currentTime, .2);
    this.scheduleMelody();
    this.timer = setInterval(() => this.scheduleMelody(), 2400);
    return true;
  }

  private note(frequency: number, at: number, length: number, volume: number, type: OscillatorType = 'sine') {
    if (!this.context || !this.gain) return;
    const oscillator = this.context.createOscillator(), envelope = this.context.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, at); envelope.gain.linearRampToValueAtTime(volume, at + .018); envelope.gain.exponentialRampToValueAtTime(.0001, at + length);
    oscillator.connect(envelope); envelope.connect(this.gain);
    oscillator.start(at); oscillator.stop(at + length + .05);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }

  private scheduleMelody() {
    if (!this.context || !this.enabled || document.hidden) return;
    const now = this.context.currentTime + .04;
    for (let i = 0; i < 4; i++) {
      const semitone = this.melody[this.melodyIndex++ % this.melody.length];
      const frequency = 261.63 * 2 ** (semitone / 12);
      this.note(frequency, now + i * .6, 1.7, .2);
      this.note(frequency * 2, now + i * .6, .5, .018);
    }
    this.note(130.81, now, 3, .12); this.note(196, now + 1.2, 2, .05);
  }

  chime(index = 0) {
    if (!this.context || !this.enabled) return;
    this.note(523.25 * 2 ** ([0, 2, 4, 7, 9, 12, 14][index % 7] / 12), this.context.currentTime + .005, .7, .22);
  }

  private mute() {
    this.enabled = false;
    if (this.timer) clearInterval(this.timer); this.timer = null;
    if (this.context && this.gain) this.gain.gain.setTargetAtTime(0, this.context.currentTime, .12);
  }

  dispose() { this.mute(); void this.context?.close(); }
}
