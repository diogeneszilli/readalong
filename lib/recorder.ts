/**
 * Records microphone audio as 16 kHz mono PCM and encodes it as WAV, which
 * every transcription model accepts. Runs alongside Web Speech recognition on
 * the same microphone; the WAV is only uploaded when the child taps "I'm done".
 */
export const TARGET_RATE = 16_000;

export class WavRecorder {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: ScriptProcessorNode | null = null;
  private chunks: Float32Array[] = [];
  private inputRate = TARGET_RATE;

  async start(): Promise<void> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone recording is not supported in this browser.");
    }
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.ctx = new AudioContext();
    this.inputRate = this.ctx.sampleRate;
    const source = this.ctx.createMediaStreamSource(this.stream);
    // ScriptProcessorNode is deprecated but universally supported; fine for a 30 s clip.
    this.node = this.ctx.createScriptProcessor(4096, 1, 1);
    this.node.onaudioprocess = (e) => {
      this.chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    };
    source.connect(this.node);
    this.node.connect(this.ctx.destination);
  }

  /** Stops recording and returns a WAV blob (16 kHz, mono, 16-bit). */
  stop(): Blob {
    this.node?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.ctx?.close();
    const samples = downsample(concat(this.chunks), this.inputRate, TARGET_RATE);
    this.chunks = [];
    this.node = null;
    this.stream = null;
    this.ctx = null;
    return new Blob([encodeWav(samples, TARGET_RATE)], { type: "audio/wav" });
  }

  get seconds(): number {
    return this.chunks.reduce((n, c) => n + c.length, 0) / this.inputRate;
  }
}

export function concat(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

/** Simple averaging downsampler; adequate for speech. */
export function downsample(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const outLength = Math.floor(input.length / ratio);
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    out[i] = end > start ? sum / (end - start) : 0;
  }
  return out;
}

export function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
