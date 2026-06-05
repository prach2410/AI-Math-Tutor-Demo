import {
  Component, inject, ElementRef, ViewChild, AfterViewChecked, AfterViewInit, effect, computed
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TutorService } from '../tutor.service';
import { VoiceService } from '../voice.service';
import { InteractionMode } from '../models/learning.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Progress bar -->
    @if (tutor.totalSteps() > 0) {
      <div class="progress-bar-wrap">
        <div class="progress-steps">
          @for (n of stepRange(); track n) {
            <div class="step-dot" [class.done]="n < tutor.currentStep()" [class.active]="n === tutor.currentStep()">
              {{ n }}
            </div>
          }
        </div>
        <span class="progress-label">
          @if (tutor.finished()) {
            ✅ เสร็จสิ้น!
          } @else {
            ขั้นที่ {{ tutor.currentStep() }} / {{ tutor.totalSteps() }}
          }
        </span>
      </div>
    }

    <div class="chat-wrapper">
      <div class="chat-messages" #messagesContainer>

        @if (!hasUserMsg() && tutor.messages().length > 0) {
          <div class="empty-state-guide">
            <p class="guide-title">😊 ไม่จำเป็นต้องตอบถูกทันที</p>
            <p class="guide-sub">ค่อย ๆ คิดไปด้วยกันนะ — ถ้าติดตรงไหน ใช้ปุ่มด้านล่างได้เลย</p>
            <div class="guide-items">
              <div class="guide-item">
                <span class="guide-icon">💡</span>
                <div class="guide-item-text">
                  <strong>ขอคำใบ้</strong>
                  <p>ช่วยบอกแนวทาง โดยไม่เฉลยคำตอบ</p>
                </div>
              </div>
              <div class="guide-item">
                <span class="guide-icon">🆘</span>
                <div class="guide-item-text">
                  <strong>ช่วยเริ่มให้หน่อย</strong>
                  <p>เหมาะเมื่อไม่รู้ว่าจะเริ่มตรงไหน</p>
                </div>
              </div>
              <div class="guide-item">
                <span class="guide-icon">👀</span>
                <div class="guide-item-text">
                  <strong>ทำตัวอย่างให้ดู</strong>
                  <p>เมื่ออยากดูตัวอย่างคล้ายกัน</p>
                </div>
              </div>
            </div>
          </div>
        }

        @for (msg of tutor.messages(); track $index) {
          <div class="bubble-row" [class.user-row]="msg.role === 'user'">
            @if (msg.role === 'assistant') {
              <div class="avatar ai-avatar">🤖</div>
            }
            <div class="bubble"
              [class.ai-bubble]="msg.role === 'assistant' && !msg.isHint && !msg.isGuided && !msg.isWorkedExample"
              [class.hint-bubble]="msg.isHint"
              [class.guided-bubble]="msg.isGuided"
              [class.worked-bubble]="msg.isWorkedExample"
              [class.user-bubble]="msg.role === 'user'">
              <pre class="bubble-text">{{ msg.content }}</pre>
            </div>
            @if (msg.role === 'user') {
              <div class="avatar user-avatar">🧒</div>
            }
          </div>
        }

        @if (tutor.loading()) {
          <div class="bubble-row">
            <div class="avatar ai-avatar">🤖</div>
            <div class="bubble ai-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        }
      </div>

      @if (!tutor.finished() && !tutor.loading()) {
        <div class="assist-bar">
          <button class="assist-btn hint-btn" (click)="tutor.requestAssist('hint')">
            💡 ขอคำใบ้
          </button>
          <button class="assist-btn guided-btn" (click)="tutor.requestAssist('guided')">
            🆘 ช่วยเริ่มให้หน่อย
          </button>
          <button class="assist-btn worked-btn" (click)="tutor.requestAssist('worked-example')">
            👀 ทำตัวอย่างให้ดู
          </button>
        </div>
        <div class="freetalk-bar">
          <button class="freetalk-feature-btn" (click)="tutor.enterFreeTalk()">
            <span class="ft-btn-icon">💬</span>
            <span class="ft-btn-text">
              <span class="ft-btn-label">คุยกับพี่ก่อน</span>
              <span class="ft-btn-sub">เครียด เหนื่อย หรืออยากพัก — คุยได้เลย</span>
            </span>
          </button>
        </div>
      }

      <div class="chat-input-bar">
        <button class="mode-toggle-btn"
          (click)="switchMode()"
          [title]="tutor.interactionMode() === 'voice' ? 'เปลี่ยนเป็นพิมพ์' : 'เปลี่ยนเป็นพูด'"
          [disabled]="tutor.loading() || tutor.finished()"
        >
          {{ tutor.interactionMode() === 'voice' ? '⌨️' : '🎤' }}
        </button>
        @if (tutor.interactionMode() === 'voice') {
          <div class="voice-bar">
            <button
              class="mic-btn"
              [class.listening]="voice.isListening()"
              (click)="toggleMic()"
              [disabled]="tutor.loading() || tutor.finished()"
            >
              {{ voice.isListening() ? '🔴' : '🎙️' }}
              {{ voice.isListening() ? 'กำลังฟัง...' : 'กดเพื่อพูด' }}
            </button>
            @if (voice.transcript()) {
              <span class="transcript-preview">{{ voice.transcript() }}</span>
            }
            @if (voice.error()) {
              <span class="voice-error">{{ voice.error() }}</span>
            }
          </div>
        } @else {
          <input
            #inputEl
            class="chat-input"
            type="text"
            [placeholder]="tutor.finished() ? 'เรียนจบแล้วครับ 🎉' : 'พิมพ์คำตอบของหนู...'"
            [(ngModel)]="inputText"
            (keydown.enter)="send()"
            [disabled]="tutor.loading() || tutor.finished()"
          />
          <button
            class="send-btn"
            (click)="send()"
            [disabled]="tutor.loading() || tutor.finished() || !inputText.trim()"
          >
            ส่ง ➤
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    /* Progress bar */
    .progress-bar-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      background: var(--color-surface);
      border-radius: var(--radius) var(--radius) 0 0;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
    }

    .progress-steps {
      display: flex;
      gap: 6px;
    }

    .step-dot {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      background: white;
      transition: all 0.2s;
    }

    .step-dot.done {
      background: #22c55e;
      border-color: #22c55e;
      color: white;
    }

    .step-dot.active {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
    }

    .progress-label {
      font-size: 13px;
      color: var(--color-text-muted);
      margin-left: auto;
    }

    /* Chat */
    .chat-wrapper {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      background: var(--color-surface);
      border-radius: 0 0 var(--radius) var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .chat-messages {
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

    .user-row {
      flex-direction: row-reverse;
    }

    .avatar {
      font-size: 24px;
      flex-shrink: 0;
      width: 36px;
      text-align: center;
    }

    .bubble {
      max-width: 72%;
      padding: 12px 16px;
      border-radius: var(--radius);
      font-size: 14.5px;
      line-height: 1.65;
    }

    .ai-bubble {
      background: var(--color-ai-bubble);
      border: 1px solid var(--color-ai-border);
      border-bottom-left-radius: 4px;
    }

    .user-bubble {
      background: var(--color-user-bubble);
      border: 1px solid var(--color-user-border);
      border-bottom-right-radius: 4px;
    }

    .hint-bubble {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-bottom-left-radius: 4px;
      font-style: italic;
    }

    .guided-bubble {
      background: #f0f9ff;
      border: 1.5px solid #38bdf8;
      border-bottom-left-radius: 4px;
    }

    .worked-bubble {
      background: #faf5ff;
      border: 1.5px solid #c084fc;
      border-bottom-left-radius: 4px;
      font-family: monospace;
      font-size: 13.5px;
    }

    .assist-bar {
      padding: 4px 16px 6px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .assist-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 13px;
      border-radius: 16px;
      font-family: inherit;
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
      border: 1.5px solid;
      transition: background 0.15s, box-shadow 0.15s, transform 0.1s, border-color 0.15s;
      white-space: nowrap;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .assist-btn::after { content: ' →'; opacity: 0.5; font-size: 11px; }
    .assist-btn:hover  { box-shadow: 0 2px 8px rgba(0,0,0,0.12); transform: translateY(-1px); }
    .assist-btn:active { transform: translateY(0) scale(0.97); box-shadow: none; }

    .hint-btn   { background: #fffbeb; color: #92400e; border-color: #fcd34d; }
    .guided-btn { background: #f0f9ff; color: #0369a1; border-color: #7dd3fc; }
    .worked-btn { background: #faf5ff; color: #7e22ce; border-color: #c084fc; }

    .hint-btn:hover   { background: #fef9c3; border-color: #f59e0b; }
    .guided-btn:hover { background: #e0f2fe; border-color: #38bdf8; }
    .worked-btn:hover { background: #f3e8ff; border-color: #a855f7; }

    .freetalk-bar {
      padding: 0 16px 8px;
      flex-shrink: 0;
    }

    .freetalk-feature-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      background: linear-gradient(135deg, #f5f3ff, #ede9fe);
      border: 1.5px solid #c4b5fd;
      border-radius: 12px;
      cursor: pointer;
      font-family: inherit;
      text-align: left;
      transition: background 0.15s, border-color 0.15s, transform 0.1s, box-shadow 0.15s;
    }
    .freetalk-feature-btn:hover {
      background: linear-gradient(135deg, #ede9fe, #ddd6fe);
      border-color: #7c3aed;
      box-shadow: 0 2px 10px rgba(124,58,237,0.15);
      transform: translateY(-1px);
    }
    .freetalk-feature-btn:active { transform: translateY(0); }

    .ft-btn-icon { font-size: 22px; flex-shrink: 0; }

    .ft-btn-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .ft-btn-label {
      font-size: 13.5px;
      font-weight: 700;
      color: #5b21b6;
    }

    .ft-btn-sub {
      font-size: 11.5px;
      color: #7c3aed;
      opacity: 0.8;
    }

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
      width: 8px;
      height: 8px;
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

    .chat-input-bar {
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

    .mode-toggle-btn {
      padding: 8px 10px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: var(--radius-sm);
      font-size: 16px;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .mode-toggle-btn:hover:not(:disabled) { background: #e2e8f0; }
    .mode-toggle-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .voice-bar {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .mic-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: #f0fdf4;
      color: #15803d;
      border: 2px solid #86efac;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 14.5px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    .mic-btn:hover:not(:disabled) { background: #dcfce7; border-color: #4ade80; }
    .mic-btn.listening {
      background: #fef2f2;
      color: #dc2626;
      border-color: #fca5a5;
      animation: mic-pulse 1.4s infinite;
    }
    .mic-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    @keyframes mic-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.3); }
      50%       { box-shadow: 0 0 0 6px rgba(220,38,38,0); }
    }

    .transcript-preview {
      flex: 1;
      font-size: 13.5px;
      color: #475569;
      font-style: italic;
    }

    .voice-error {
      flex: 1;
      font-size: 13px;
      color: #dc2626;
    }

    /* Empty state guide — compact (~35% shorter) */
    .empty-state-guide {
      margin: 8px 12px;
      padding: 10px 14px;
      background: linear-gradient(135deg, #eff6ff, #f0fdf4);
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      font-size: 13px;
      color: #1e293b;
    }
    .guide-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 6px;
    }
    .guide-sub {
      font-size: 11.5px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .guide-items {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 0;
    }
    .guide-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 6px 10px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      cursor: default;
    }
    .guide-icon { font-size: 15px; flex-shrink: 0; line-height: 1.4; }
    .guide-item-text { display: flex; flex-direction: column; gap: 1px; }
    .guide-item strong { font-size: 12.5px; color: #1e293b; }
    .guide-item p { font-size: 11.5px; color: #64748b; margin: 0; line-height: 1.4; }

    /* ── Mobile ── */
    @media (max-width: 640px) {
      .chat-input-bar { padding: 8px 10px; gap: 6px; }

      .mode-toggle-btn { padding: 10px 11px; font-size: 18px; }

      .mic-btn {
        flex: 1;
        justify-content: center;
        padding: 12px 10px;
        font-size: 14px;
      }

      .transcript-preview { font-size: 12.5px; }

      .assist-bar { padding: 4px 10px 5px; gap: 5px; }
      .assist-btn { font-size: 12px; padding: 6px 10px; }
      .assist-btn::after { display: none; }
    }
  `]
})
export class ChatComponent implements AfterViewInit, AfterViewChecked {
  @ViewChild('messagesContainer') private container!: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') private inputEl!: ElementRef<HTMLInputElement>;

  protected tutor  = inject(TutorService);
  protected voice  = inject(VoiceService);
  protected inputText = '';
  protected readonly hasUserMsg = computed(() =>
    this.tutor.messages().some(m => m.role === 'user')
  );

  constructor() {
    effect(() => {
      this.tutor.messages();
      this.scrollToBottom();
      if (!this.tutor.loading()) {
        setTimeout(() => this.focusInput());
      }
    });

    // Auto-send when STT transcript arrives
    effect(() => {
      const t = this.voice.transcript();
      if (t && !this.tutor.loading() && !this.tutor.finished()) {
        this.tutor.sendMessage(t);
        this.voice.transcript.set('');
      }
    });

    // TTS: read AI response aloud in voice mode
    effect(() => {
      const msgs = this.tutor.messages();
      if (this.tutor.interactionMode() !== 'voice') return;
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant' && !this.tutor.loading()) {
        this.voice.speak(last.content);
      }
    });
  }

  ngAfterViewInit(): void {
    this.focusInput();
  }

  protected stepRange(): number[] {
    return Array.from({ length: this.tutor.totalSteps() }, (_, i) => i + 1);
  }

  protected send(): void {
    const text = this.inputText.trim();
    if (!text || this.tutor.loading() || this.tutor.finished()) return;
    this.inputText = '';
    this.tutor.sendMessage(text);
  }

  protected switchMode(): void {
    const from = this.tutor.interactionMode();
    const to: InteractionMode = from === 'voice' ? 'text' : 'voice';
    this.tutor.logEvent(`interaction_mode_changed_from_${from}_to_${to}`);
    this.voice.cancelSpeech();
    this.tutor.setInteractionMode(to);
  }

  protected toggleMic(): void {
    if (this.voice.isListening()) {
      this.voice.stopListening();
    } else {
      this.voice.transcript.set('');
      this.voice.error.set('');
      this.voice.startListening();
    }
  }

  private focusInput(): void {
    this.inputEl?.nativeElement?.focus?.();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const el = this.container?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
