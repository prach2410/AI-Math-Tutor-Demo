import {
  Component, inject, ElementRef, ViewChild,
  AfterViewChecked, AfterViewInit, effect
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OnboardingService } from './onboarding.service';
import { TutorService } from '../tutor.service';
import { VoiceService } from '../voice.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="onboarding-wrap">

      <!-- Top bar -->
      <div class="top-bar">
        <div class="badge">🎮 ทดลองใช้ AI Tutor · ประมาณ 1 นาที</div>
        <button class="skip-btn" (click)="skip()">ข้ามไปเรียนเลย →</button>
      </div>

      <!-- Step indicators -->
      <div class="steps-bar">
        @for (n of [1,2,3,4,5]; track n) {
          <div class="step-dot"
            [class.done]="ob.step() > n"
            [class.active]="ob.step() === n">
            {{ n }}
          </div>
        }
        <span class="step-label">ขั้นที่ {{ ob.step() }} / 5</span>
      </div>

      <!-- Messages -->
      <div class="messages" #msgContainer>
        @for (msg of ob.messages(); track $index) {
          <div class="bubble-row" [class.user-row]="msg.role === 'user'">
            @if (msg.role === 'assistant') {
              <div class="avatar">🤖</div>
            }
            <div class="bubble"
              [class.ai-bubble]="msg.role === 'assistant' && !msg.isHint && !msg.isGuided"
              [class.hint-bubble]="msg.isHint"
              [class.guided-bubble]="msg.isGuided"
              [class.user-bubble]="msg.role === 'user'">
              <pre class="bubble-text">{{ msg.content }}</pre>
            </div>
            @if (msg.role === 'user') {
              <div class="avatar">🧒</div>
            }
          </div>
        }

        @if (ob.loading()) {
          <div class="bubble-row">
            <div class="avatar">🤖</div>
            <div class="bubble ai-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        }
      </div>

      <!-- Assist buttons (steps 2 & 3) -->
      @if (ob.waiting() === 'hint' || ob.waiting() === 'guided') {
        <div class="assist-bar">
          <button class="assist-btn hint-btn"
            [class.pulse]="ob.waiting() === 'hint'"
            [disabled]="ob.waiting() !== 'hint' || ob.loading()"
            (click)="ob.handleHintClick()">
            💡 ขอคำใบ้
          </button>
          <button class="assist-btn guided-btn"
            [class.pulse]="ob.waiting() === 'guided'"
            [disabled]="ob.waiting() !== 'guided' || ob.loading()"
            (click)="ob.handleGuidedClick()">
            🆘 ช่วยเริ่มให้หน่อย
          </button>
          <button class="assist-btn worked-btn" disabled>
            👀 ทำตัวอย่างให้ดู
          </button>
        </div>
      }

      <!-- Input (step 0 = name, step 1 = answer) -->
      @if (ob.waiting() === 'name' || ob.waiting() === 'answer') {
        <div class="input-bar">
          <input
            #inputEl
            class="chat-input"
            type="text"
            [placeholder]="ob.waiting() === 'name' ? 'พิมพ์ชื่อเล่น หรือ Enter เพื่อข้าม...' : 'พิมพ์คำตอบของหนู...'"
            [(ngModel)]="inputText"
            (keydown.enter)="send()"
            [disabled]="ob.loading()"
          />
          <button
            class="send-btn"
            (click)="send()"
            [disabled]="ob.loading() || (ob.waiting() === 'answer' && !inputText.trim())">
            ส่ง ➤
          </button>
        </div>
      }

      <!-- Mode selection (step 5 → after messages) -->
      @if (ob.waiting() === 'mode' && !ob.loading()) {
        <div class="mode-select-bar">
          <p class="mode-prompt">วันนี้อยากเรียนแบบไหนครับ? 😊</p>
          <div class="mode-btns">
            <button class="mode-btn text-mode" (click)="ob.handleModeSelected('text')">
              <span class="mode-icon">⌨️</span>
              <span class="mode-label">พิมพ์ข้อความ</span>
            </button>
            <button class="mode-btn voice-mode"
              (click)="ob.handleModeSelected('voice')"
              [disabled]="!voiceSupported"
              [title]="voiceSupported ? '' : 'ใช้ได้บน Chrome / Edge เท่านั้น'"
            >
              <span class="mode-icon">🎤</span>
              <span class="mode-label">พูดออกเสียง</span>
              @if (!voiceSupported) {
                <small class="mode-note">Chrome เท่านั้น</small>
              }
            </button>
          </div>
        </div>
      }

      <!-- Complete button (after mode selected) -->
      @if (ob.waiting() === 'complete' && !ob.loading()) {
        <div class="complete-bar">
          <button class="start-btn" (click)="startLesson()">เริ่มเรียน 🚀</button>
        </div>
      }

    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    .onboarding-wrap {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      background: white;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    /* Top bar */
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: linear-gradient(90deg, #1e40af, #2563eb);
      flex-shrink: 0;
      gap: 8px;
    }

    .badge {
      font-size: 12.5px;
      color: rgba(255,255,255,0.9);
      font-weight: 600;
    }

    .skip-btn {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      border-radius: 16px;
      padding: 4px 12px;
      font-family: inherit;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .skip-btn:hover { background: rgba(255,255,255,0.25); }

    /* Step dots */
    .steps-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
      background: #f8fafc;
    }

    .step-dot {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      background: white;
      transition: all 0.2s;
    }
    .step-dot.done   { background: #22c55e; border-color: #22c55e; color: white; }
    .step-dot.active { background: #2563eb; border-color: #2563eb; color: white; }

    .step-label {
      font-size: 12px;
      color: var(--color-text-muted);
      margin-left: auto;
    }

    /* Messages */
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      scroll-behavior: smooth;
    }

    .bubble-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }
    .user-row { flex-direction: row-reverse; }

    .avatar {
      font-size: 22px;
      flex-shrink: 0;
      width: 34px;
      text-align: center;
    }

    .bubble {
      max-width: 72%;
      padding: 12px 16px;
      border-radius: var(--radius);
      font-size: 14.5px;
      line-height: 1.65;
    }

    .ai-bubble     { background: var(--color-ai-bubble); border: 1px solid var(--color-ai-border); border-bottom-left-radius: 4px; }
    .user-bubble   { background: var(--color-user-bubble); border: 1px solid var(--color-user-border); border-bottom-right-radius: 4px; }
    .hint-bubble   { background: #fffbeb; border: 1px solid #fcd34d; border-bottom-left-radius: 4px; font-style: italic; }
    .guided-bubble { background: #f0f9ff; border: 1.5px solid #38bdf8; border-bottom-left-radius: 4px; }

    .bubble-text {
      white-space: pre-wrap;
      font-family: inherit;
      margin: 0;
    }

    .typing {
      display: flex;
      gap: 5px;
      align-items: center;
      padding: 14px 18px;
    }
    .typing span {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--color-primary);
      animation: bounce 1.2s infinite;
    }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-6px); opacity: 1; }
    }

    /* Assist bar */
    .assist-bar {
      padding: 4px 16px 6px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      flex-shrink: 0;
    }

    .assist-btn {
      padding: 5px 12px;
      border-radius: 16px;
      font-family: inherit;
      font-size: 12.5px;
      cursor: pointer;
      border: 1px solid;
      transition: background 0.15s, box-shadow 0.15s;
      white-space: nowrap;
    }
    .assist-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .hint-btn   { background: #fffbeb; color: #92400e; border-color: #fcd34d; }
    .guided-btn { background: #f0f9ff; color: #0369a1; border-color: #7dd3fc; }
    .worked-btn { background: #faf5ff; color: #7e22ce; border-color: #c084fc; }

    /* Pulse animation for the button the user should click */
    .pulse {
      animation: pulseBtn 1.4s ease-in-out infinite;
    }
    @keyframes pulseBtn {
      0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); }
      50%       { box-shadow: 0 0 0 6px rgba(37,99,235,0); }
    }
    .hint-btn.pulse   { animation-name: pulseHint; }
    .guided-btn.pulse { animation-name: pulseGuided; }
    @keyframes pulseHint {
      0%, 100% { box-shadow: 0 0 0 0 rgba(234,179,8,0.5); }
      50%       { box-shadow: 0 0 0 7px rgba(234,179,8,0); }
    }
    @keyframes pulseGuided {
      0%, 100% { box-shadow: 0 0 0 0 rgba(14,165,233,0.5); }
      50%       { box-shadow: 0 0 0 7px rgba(14,165,233,0); }
    }

    /* Input bar */
    .input-bar {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      flex-shrink: 0;
    }

    .chat-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 14.5px;
      outline: none;
      transition: border-color 0.2s;
    }
    .chat-input:focus { border-color: var(--color-primary); }

    .send-btn {
      padding: 10px 20px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      white-space: nowrap;
    }
    .send-btn:hover:not(:disabled) { background: #1d4ed8; }
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Mode selection bar */
    .mode-select-bar {
      padding: 14px 16px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .mode-prompt {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .mode-btns {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .mode-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 14px 24px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      background: white;
      cursor: pointer;
      font-family: inherit;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
      min-width: 120px;
    }
    .mode-btn:hover:not(:disabled) {
      box-shadow: 0 3px 12px rgba(0,0,0,0.1);
      transform: translateY(-1px);
    }
    .mode-btn:active:not(:disabled) { transform: translateY(0) scale(0.97); }
    .mode-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    .text-mode:hover:not(:disabled)  { border-color: #2563eb; }
    .voice-mode:hover:not(:disabled) { border-color: #16a34a; }

    .mode-icon  { font-size: 28px; line-height: 1; }
    .mode-label { font-size: 13px; font-weight: 600; color: #1e293b; }
    .mode-note  { font-size: 10px; color: #94a3b8; }

    /* Complete bar */
    .complete-bar {
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      display: flex;
      justify-content: center;
      flex-shrink: 0;
    }

    .start-btn {
      padding: 12px 36px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 24px;
      font-family: inherit;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    .start-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
    .start-btn:active { transform: translateY(0); }

    /* Mobile */
    @media (max-width: 640px) {
      .badge { font-size: 11px; }
      .bubble { max-width: 85%; font-size: 14px; }

      .mode-select-bar { padding: 12px; gap: 8px; }
      .mode-prompt { font-size: 13.5px; }
      .mode-btns { width: 100%; gap: 8px; }
      .mode-btn {
        flex: 1;
        flex-direction: row;
        justify-content: center;
        padding: 14px 12px;
        min-width: 0;
        gap: 8px;
      }
      .mode-icon { font-size: 22px; }
      .mode-label { font-size: 13.5px; }
    }
  `]
})
export class OnboardingComponent implements AfterViewInit, AfterViewChecked {
  @ViewChild('msgContainer') private container!: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') private inputEl?: ElementRef<HTMLInputElement>;

  protected ob            = inject(OnboardingService);
  private tutor           = inject(TutorService);
  private voice           = inject(VoiceService);
  protected voiceSupported = this.voice.isSupported();
  protected inputText = '';

  constructor() {
    effect(() => {
      this.ob.messages();
      this.scrollToBottom();
      if (!this.ob.loading() && (this.ob.waiting() === 'answer' || this.ob.waiting() === 'name')) {
        setTimeout(() => this.inputEl?.nativeElement.focus());
      }
    });
  }

  ngAfterViewInit(): void {
    this.inputEl?.nativeElement.focus();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  protected send(): void {
    // name step allows empty (skip)
    if (this.ob.waiting() === 'answer' && !this.inputText.trim()) return;
    const text = this.inputText.trim();
    this.inputText = '';
    this.ob.handleAnswer(text);
  }

  protected skip(): void {
    this.ob.skip();
    this.tutor.init();
  }

  protected startLesson(): void {
    const mode = this.tutor.interactionMode();
    this.ob.complete();
    this.tutor.init();
    if (mode) this.tutor.setInteractionMode(mode);
  }

  private scrollToBottom(): void {
    const el = this.container?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
