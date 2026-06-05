import { Injectable, signal, inject } from '@angular/core';
import { StudentProfileService } from '../student-profile/student-profile.service';
import { TutorService } from '../tutor.service';
import { InteractionMode } from '../models/learning.model';

export interface OnboardingMessage {
  role: 'user' | 'assistant';
  content: string;
  isHint?: boolean;
  isGuided?: boolean;
}

type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;

const STORAGE_KEY = 'ai_tutor_onboarding_done';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private studentProfile = inject(StudentProfileService);
  private tutor          = inject(TutorService);

  private _active       = signal(false);
  private _messages     = signal<OnboardingMessage[]>([]);
  private _step         = signal<OnboardingStep>(0);
  private _waiting      = signal<'name' | 'answer' | 'hint' | 'guided' | 'done' | 'learn-or-talk' | 'mode' | 'complete'>('name');
  private _loading      = signal(false);
  private _goFreeTalk   = signal(false);

  readonly isActive    = this._active.asReadonly();
  readonly messages    = this._messages.asReadonly();
  readonly step        = this._step.asReadonly();
  readonly waiting     = this._waiting.asReadonly();
  readonly loading     = this._loading.asReadonly();
  readonly goFreeTalk  = this._goFreeTalk.asReadonly();

  init(): void {
    const done = localStorage.getItem(STORAGE_KEY);
    if (done) return;
    this._active.set(true);
    this.startStep0();
  }

  skip(): void {
    localStorage.setItem(STORAGE_KEY, '1');
    this._active.set(false);
  }

  complete(): void {
    localStorage.setItem(STORAGE_KEY, '1');
    this._active.set(false);
  }

  restart(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._messages.set([]);
    this._goFreeTalk.set(false);
    this._active.set(true);
    this.startStep0();
  }

  handleLearnOrTalkSelected(choice: 'learn' | 'free-talk'): void {
    if (choice === 'free-talk') {
      this._goFreeTalk.set(true);
      this._waiting.set('complete');
    } else {
      this._goFreeTalk.set(false);
      this._waiting.set('mode');
    }
  }

  handleAnswer(text: string): void {
    if (this._loading()) return;

    // Step 0: collect name
    if (this._waiting() === 'name') {
      const name = text.trim();
      if (name) this.studentProfile.setDisplayName(name);
      this._messages.update(m => [...m, { role: 'user', content: name || 'ข้ามไปก่อนครับ' }]);
      this._loading.set(true);
      const greeting = name
        ? `ยินดีที่ได้รู้จักนะครับ ${name} 😊\n\nก่อนเริ่มเรียนจริง เรามาลองใช้ AI Tutor กันก่อนนะครับ`
        : 'ยินดีที่ได้รู้จักครับ 😊\n\nก่อนเริ่มเรียนจริง เรามาลองใช้ AI Tutor กันก่อนนะครับ';
      setTimeout(() => {
        this._messages.update(m => [...m, { role: 'assistant', content: greeting }]);
        this._loading.set(false);
        this.startStep1();
      }, 600);
      return;
    }

    if (this._waiting() !== 'answer') return;

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

  handleModeSelected(mode: InteractionMode): void {
    this.tutor.setInteractionMode(mode);
    this._waiting.set('complete');
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

  private startStep0(): void {
    const existingName = this.studentProfile.displayName();
    if (existingName) {
      // ชื่อมีอยู่แล้ว ข้าม step 0 ไปเลย
      this._messages.set([
        {
          role: 'assistant',
          content: `ยินดีต้อนรับกลับนะครับ ${existingName} 😊\n\nมาเรียนต่อกันเลยครับ`,
        },
      ]);
      this.startStep1();
      return;
    }

    this._step.set(0);
    this._waiting.set('name');
    this._messages.set([
      {
        role: 'assistant',
        content: 'สวัสดีครับ 😊\n\nก่อนเริ่มเรียน ขอรู้จักหน่อยนะครับ\n\nชื่อเล่นของน้องคืออะไรครับ?\n(ไม่ต้องใส่ก็ได้ กด Enter เพื่อข้าม)',
      },
    ]);
  }

  private startStep1(): void {
    this._step.set(1);
    this._waiting.set('answer');
    setTimeout(() => {
      this._messages.update(m => [
        ...m,
        {
          role: 'assistant',
          content: 'ไม่ต้องกลัวตอบผิดนะครับ มาลองกันเลย\n\n2 + 3 ได้เท่าไรครับ?',
        },
      ]);
    }, 400);
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
    this._waiting.set('done');

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

    setTimeout(() => {
      this._waiting.set('learn-or-talk');
    }, 4200);
  }
}
