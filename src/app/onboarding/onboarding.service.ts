import { Injectable, signal } from '@angular/core';

export interface OnboardingMessage {
  role: 'user' | 'assistant';
  content: string;
  isHint?: boolean;
  isGuided?: boolean;
}

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

const STORAGE_KEY = 'ai_tutor_onboarding_done';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private _active    = signal(false);
  private _messages  = signal<OnboardingMessage[]>([]);
  private _step      = signal<OnboardingStep>(1);
  private _waiting   = signal<'answer' | 'hint' | 'guided' | 'done' | 'complete'>('answer');
  private _loading   = signal(false);

  readonly isActive = this._active.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly step     = this._step.asReadonly();
  readonly waiting  = this._waiting.asReadonly();
  readonly loading  = this._loading.asReadonly();

  init(): void {
    const done = localStorage.getItem(STORAGE_KEY);
    if (done) return;
    this._active.set(true);
    this.startStep1();
  }

  skip(): void {
    localStorage.setItem(STORAGE_KEY, '1');
    this._active.set(false);
  }

  complete(): void {
    localStorage.setItem(STORAGE_KEY, '1');
    this._active.set(false);
  }

  handleAnswer(text: string): void {
    if (this._waiting() !== 'answer' || this._loading()) return;

    this._messages.update(m => [...m, { role: 'user', content: text }]);
    this._loading.set(true);

    setTimeout(() => {
      this._messages.update(m => [
        ...m,
        {
          role: 'assistant',
          content: 'ยอดเยี่ยม 🎉\n\nนี่คือตัวอย่างการตอบคำถาม\n\nต่อไปเราจะลองใช้เครื่องมือช่วยเรียนกันครับ',
        },
      ]);
      this._loading.set(false);
      this.startStep2();
    }, 600);
  }

  handleHintClick(): void {
    if (this._waiting() !== 'hint') return;
    this._loading.set(true);

    setTimeout(() => {
      this._messages.update(m => [
        ...m,
        {
          role: 'assistant',
          content: 'นี่คือตัวอย่างคำใบ้\n\nเวลาหนูติดโจทย์ ครูจะไม่เฉลยทันที\nแต่จะช่วยให้หนูคิดต่อได้ครับ',
          isHint: true,
        },
      ]);
      this._loading.set(false);
      this.startStep3();
    }, 600);
  }

  handleGuidedClick(): void {
    if (this._waiting() !== 'guided') return;
    this._loading.set(true);

    setTimeout(() => {
      this._messages.update(m => [
        ...m,
        {
          role: 'assistant',
          content: 'นี่คือการช่วยเริ่ม\n\nเวลาหนูไม่รู้จะเริ่มตรงไหน\nครูจะช่วยทำให้ดู 1 ขั้น\nแล้วให้หนูลองทำต่อเองครับ',
          isGuided: true,
        },
      ]);
      this._loading.set(false);
      this.startStep4();
    }, 600);
  }

  private startStep1(): void {
    this._step.set(1);
    this._waiting.set('answer');
    this._messages.set([
      {
        role: 'assistant',
        content: 'สวัสดีครับ 😊\n\nก่อนเริ่มเรียนจริง เรามาลองใช้ AI Tutor กันก่อนนะ\n\nไม่ต้องกลัวตอบผิดครับ',
      },
      {
        role: 'assistant',
        content: '2 + 3 ได้เท่าไรครับ',
      },
    ]);
  }

  private startStep2(): void {
    this._step.set(2);
    this._waiting.set('hint');
    setTimeout(() => {
      this._messages.update(m => [
        ...m,
        {
          role: 'assistant',
          content: 'ลองกดปุ่ม\n\n💡 ขอคำใบ้\n\nดูนะครับ',
        },
      ]);
    }, 400);
  }

  private startStep3(): void {
    this._step.set(3);
    this._waiting.set('guided');
    setTimeout(() => {
      this._messages.update(m => [
        ...m,
        {
          role: 'assistant',
          content: 'ต่อไปลองกด\n\n🆘 ช่วยเริ่มให้หน่อย\n\nดูนะครับ',
        },
      ]);
    }, 400);
  }

  private startStep4(): void {
    this._step.set(4);
    this._waiting.set('done');
    setTimeout(() => {
      this._messages.update(m => [
        ...m,
        {
          role: 'assistant',
          content: 'เมื่อเรียนจบบท หนูจะได้รับ\n\n📒 บันทึกของหนู\n🎉 วันนี้ได้เรียนรู้อะไร\n💡 ใช้ในชีวิตจริง\n👨‍👩‍👧 สรุปสำหรับผู้ปกครอง',
        },
      ]);
      this.startStep5();
    }, 800);
  }

  private startStep5(): void {
    this._step.set(5);
    this._waiting.set('complete');

    const msgs: Array<{ content: string; delay: number }> = [
      { content: 'เยี่ยมมากครับ 🎉\n\nตอนนี้หนูรู้จัก AI Tutor แล้ว', delay: 600 },
      { content: 'จำไว้นะครับ\n\n✅ ตอบผิดได้\n✅ ขอคำใบ้ได้\n✅ ขอให้ครูช่วยเริ่มได้', delay: 1400 },
      { content: 'เป้าหมายไม่ใช่การตอบถูกทุกข้อ\n\nแต่คือ "เข้าใจวิธีคิดมากขึ้นทุกวัน"', delay: 2400 },
      { content: '🚀 พร้อมไปเรียนบทแรกกันเลย!', delay: 3400 },
    ];

    for (const { content, delay } of msgs) {
      setTimeout(() => {
        this._messages.update(m => [...m, { role: 'assistant', content }]);
      }, delay);
    }
  }
}
