/**
 * Microphone input level meter via Web Audio. Independent of speech
 * recognition, so it shows that audio is arriving even when the recognizer
 * returns nothing — the key diagnostic for "is the mic working?".
 */
export class MicLevelMeter {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private raf = 0;

  constructor(private onLevel: (level: number) => void) {}

  async start(): Promise<void> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.ctx = new AudioContext();
    const source = this.ctx.createMediaStreamSource(this.stream);
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const buf = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      // Speech RMS is typically 0.02–0.2; scale so normal speech fills most of the bar.
      this.onLevel(Math.min(1, rms * 5));
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    void this.ctx?.close();
    this.ctx = null;
    this.onLevel(0);
  }
}
