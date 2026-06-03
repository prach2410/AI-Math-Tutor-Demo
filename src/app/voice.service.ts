import { Injectable, signal } from '@angular/core';

// Web Speech API types not in all TS lib.dom.d.ts versions
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:  ((e: SpeechRecognitionEvent) => void) | null;
  onerror:   ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend:     (() => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

@Injectable({ providedIn: 'root' })
export class VoiceService {
  readonly isListening = signal(false);
  readonly transcript  = signal('');
  readonly error       = signal('');

  private recognition: SpeechRecognition | null = null;

  isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  startListening(): void {
    if (!this.isSupported()) {
      this.error.set('browser ไม่รองรับ Voice — ใช้ Chrome หรือ Edge ครับ');
      return;
    }
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    this.recognition = new SR() as SpeechRecognition;
    this.recognition.lang = 'th-TH';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (e: SpeechRecognitionEvent) => {
      this.transcript.set(e.results[0][0].transcript);
    };
    this.recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error !== 'no-speech') {
        this.error.set(e.error === 'not-allowed'
          ? 'ไม่ได้รับอนุญาตใช้ไมค์ — กรุณาอนุญาตในเบราว์เซอร์'
          : `เกิดข้อผิดพลาด: ${e.error}`);
      }
      this.isListening.set(false);
    };
    this.recognition.onend = () => {
      this.isListening.set(false);
    };

    this.recognition.start();
    this.isListening.set(true);
    this.error.set('');
  }

  stopListening(): void {
    this.recognition?.stop();
    this.isListening.set(false);
  }

  speak(text: string): void {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.cleanForSpeech(text));
    utterance.lang = 'th-TH';
    utterance.rate = 0.95;
    speechSynthesis.speak(utterance);
  }

  private cleanForSpeech(text: string): string {
    return text
      // strip emoji
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
      .replace(/[☀-➿]/g, '')
      // common English fragments → Thai
      .replace(/Keep Going!/gi, 'ไปต่อได้เลย')
      .replace(/Feedback/gi, 'ผลการเรียนรู้')
      .replace(/AI Tutor/gi, 'ครูเอไอ')
      .replace(/Level:/gi, 'ระดับ')
      // clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  cancelSpeech(): void {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
}
