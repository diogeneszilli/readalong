/**
 * Thin wrapper over the browser Web Speech API (SpeechRecognition).
 * Chrome-only in practice; Safari's implementation is not continuous.
 *
 * Chrome ends a continuous session after a few seconds of silence, so the
 * wrapper transparently restarts it while `listening` is true and keeps the
 * accumulated transcript across restarts.
 */

// Minimal typings — lib.dom does not ship SpeechRecognition types.
interface SRAlternative {
  transcript: string;
}
interface SRResult {
  isFinal: boolean;
  0: SRAlternative;
}
interface SREvent extends Event {
  resultIndex: number;
  results: ArrayLike<SRResult>;
}
interface SRErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type SRConstructor = new () => SpeechRecognitionLike;

function getCtor(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SRConstructor;
    webkitSpeechRecognition?: SRConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechSupported(): boolean {
  return getCtor() !== null;
}

export interface ReadAloudListener {
  /** Full transcript so far: committed text + current interim guess. */
  onTranscript(full: string, interim: string): void;
  onError?(code: string): void;
}

export class ReadAloudRecognizer {
  private rec: SpeechRecognitionLike | null = null;
  private committed = "";
  private interim = "";
  private listening = false;

  constructor(private listener: ReadAloudListener) {}

  get isListening() {
    return this.listening;
  }

  get transcript() {
    return `${this.committed} ${this.interim}`.trim();
  }

  start() {
    const Ctor = getCtor();
    if (!Ctor) {
      this.listener.onError?.("unsupported");
      return;
    }
    this.committed = "";
    this.interim = "";
    this.listening = true;
    this.spawn(Ctor);
  }

  private spawn(Ctor: SRConstructor) {
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0].transcript;
        if (r.isFinal) this.committed = `${this.committed} ${t}`.trim();
        else interim += ` ${t}`;
      }
      this.interim = interim.trim();
      this.listener.onTranscript(this.transcript, this.interim);
    };

    rec.onerror = (e) => {
      // "no-speech" and "aborted" are routine; anything else is worth surfacing.
      if (e.error !== "no-speech" && e.error !== "aborted") {
        this.listener.onError?.(e.error);
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          this.listening = false;
        }
      }
    };

    rec.onend = () => {
      // Chrome stops after silence; keep going until stop() is called.
      if (this.listening) {
        try {
          this.spawn(Ctor);
        } catch {
          this.listening = false;
        }
      }
    };

    this.rec = rec;
    rec.start();
  }

  stop(): string {
    this.listening = false;
    this.interim = "";
    try {
      this.rec?.stop();
    } catch {
      /* already stopped */
    }
    this.rec = null;
    return this.transcript;
  }
}

/** Speak a word or sentence with the browser's built-in voice. */
export function speak(text: string, rate = 0.85) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  window.speechSynthesis.speak(u);
}
