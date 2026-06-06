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
  private _waiting      = signal<'name' | 'answer' | 'hint' | 'guided' | 'free-talk-demo' | 'mode' | 'done' | 'learn-or-talk' | 'complete'>('name');
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
      this._messages.update(m => [...m, { role: 'user', content: '💬 คุยกับพี่ก่อน' }]);
      this._loading.set(true);
      setTimeout(() => {
        this._messages.update(m => [
          ...m,
          {
            role: 'assistant',
            content: 'ได้เลยครับ 😊\n\nตอนเรียน ถ้าหนูรู้สึกเครียด เหนื่อย หรืออยากพักสักครู่\nกดปุ่ม 💬 "คุยกับพี่ก่อน" ได้เลยครับ\n\nพี่จะคุยด้วยก่อน แล้วค่อยกลับมาเรียนต่อนะครับ',
          },
        ]);
        this._loading.set(false);
        this._waiting.set('learn-or-talk');
      }, 600);
    } else {
      this.startStep1();
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
        ? `ยินดีที่ได้รู้จักนะครับ ${name} 😊\n\nวันนี้อยากทำอะไรก่อนดีครับ?`
        : `ยินดีที่ได้รู้จักครับ 😊\n\nวันนี้อยากทำอะไรก่อนดีครับ?`;
      setTimeout(() => {
        this._messages.update(m => [...m, { role: 'assistant', content: greeting }]);
        this._loading.set(false);
        this._waiting.set('learn-or-talk');
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
          content: 'ยอดเยี่ยม 🎉\n\nนี่คือตัวอย่างการตอบคำถาม\n\nต่อไปเราจะลองใช้เครื่องมือช่วยเรียนกันครับ 🛠️',
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
    this._messages.update(m => [
      ...m,
      { role: 'user', content: mode === 'text' ? '⌨️ พิมพ์ข้อความ' : '🎤 พูดออกเสียง' },
    ]);
    this._loading.set(true);
    const intro = mode === 'text'
      ? 'เข้าใจแล้วครับ ⌨️\n\nตอนตอบโจทย์ พิมพ์คำตอบในช่องด้านล่าง\nแล้วกด Enter หรือปุ่ม "ส่ง" ได้เลยครับ'
      : 'เข้าใจแล้วครับ 🎤\n\nตอนตอบโจทย์ กดปุ่มไมค์ค้างไว้แล้วพูดคำตอบ\nพี่จะฟังและแปลงเสียงให้เองเลยครับ\n\nและพี่จะพูดตอบกลับให้ได้ยินด้วยนะครับ 🔊';
    setTimeout(() => {
      this._messages.update(m => [...m, { role: 'assistant', content: intro }]);
      this._loading.set(false);
      this._waiting.set('complete');
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
      this.startFreeTalkDemo();
    }, 600);
  }

  handleFreeTalkDemoClick(): void {
    if (this._waiting() !== 'free-talk-demo') return;
    this._loading.set(true);

    setTimeout(() => {
      this._messages.update(m => [
        ...m,
        {
          role: 'assistant',
          content: 'นี่คือโหมดคุยกับพี่ 💬\n\nเวลาเรียนแล้วรู้สึกเครียด เหนื่อย หรืออยากพักสักครู่\nกดปุ่มนี้แล้วคุยกับพี่ได้เลยครับ\n\nพี่จะรับฟัง แล้วค่อยกลับมาเรียนต่อด้วยกันนะครับ',
        },
      ]);
      this._loading.set(false);
      this.startModeIntro();
    }, 600);
  }

  private startStep0(): void {
    this._step.set(0);
    this._waiting.set('done');
    this._messages.set([
      {
        role: 'assistant',
        content: 'สวัสดีครับ 😊\n\nเรามาลองทำโจทย์กันก่อนเลยนะครับ',
      },
    ]);
    setTimeout(() => this.startStep1(), 800);
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

  private startFreeTalkDemo(): void {
    setTimeout(() => {
      this._messages.update(m => [
        ...m,
        { role: 'assistant', content: 'ลองกดปุ่ม\n\n💬 คุยกับพี่ก่อน\n\nดูนะครับ' },
      ]);
      this._waiting.set('free-talk-demo');
    }, 400);
  }

  private startModeIntro(): void {
    setTimeout(() => {
      this._messages.update(m => [
        ...m,
        { role: 'assistant', content: 'ต่อไปเลือกวิธีที่หนูสะดวกคุยกับพี่นะครับ 😊' },
      ]);
      this._waiting.set('mode');
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
