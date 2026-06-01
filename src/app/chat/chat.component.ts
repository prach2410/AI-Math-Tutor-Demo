import {
  Component, inject, ElementRef, ViewChild, AfterViewChecked, AfterViewInit, effect, computed
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TutorService } from '../tutor.service';

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
            <p class="guide-title">🤖 AI Tutor จะช่วยหนูคิดทีละขั้น</p>
            <p class="guide-sub">หนูสามารถ</p>
            <div class="guide-items">
              <div class="guide-item">
                <span class="guide-icon">💡</span>
                <div>
                  <strong>ขอคำใบ้</strong>
                  <p>เมื่อไม่แน่ใจ</p>
                </div>
              </div>
              <div class="guide-item">
                <span class="guide-icon">🆘</span>
                <div>
                  <strong>ช่วยเริ่มให้หน่อย</strong>
                  <p>เมื่อไม่รู้จะเริ่มอย่างไร</p>
                </div>
              </div>
              <div class="guide-item">
                <span class="guide-icon">👀</span>
                <div>
                  <strong>ทำตัวอย่างให้ดู</strong>
                  <p>เมื่ออยากดูตัวอย่างคล้ายกัน</p>
                </div>
              </div>
            </div>
            <p class="guide-goal">เป้าหมายของเรา ไม่ใช่แค่หาคำตอบ<br>แต่คือการเข้าใจวิธีคิด 😊</p>
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
      }

      <div class="chat-input-bar">
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
      padding: 5px 12px;
      border-radius: 16px;
      font-family: inherit;
      font-size: 12.5px;
      cursor: pointer;
      border: 1px solid;
      transition: background 0.15s;
      white-space: nowrap;
    }

    .hint-btn   { background: #fffbeb; color: #92400e; border-color: #fcd34d; }
    .guided-btn { background: #f0f9ff; color: #0369a1; border-color: #7dd3fc; }
    .worked-btn { background: #faf5ff; color: #7e22ce; border-color: #c084fc; }

    .hint-btn:hover   { background: #fef9c3; }
    .guided-btn:hover { background: #e0f2fe; }
    .worked-btn:hover { background: #f3e8ff; }

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

    /* Empty state guide */
    .empty-state-guide {
      margin: 12px;
      padding: 16px 18px;
      background: linear-gradient(135deg, #eff6ff, #f0fdf4);
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      font-size: 13.5px;
      color: #1e293b;
    }
    .guide-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 6px;
    }
    .guide-sub {
      font-size: 12.5px;
      color: #64748b;
      margin-bottom: 10px;
    }
    .guide-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }
    .guide-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 10px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .guide-icon { font-size: 18px; flex-shrink: 0; line-height: 1.3; }
    .guide-item strong { display: block; font-size: 13px; color: #1e293b; }
    .guide-item p { font-size: 12px; color: #64748b; margin: 2px 0 0; }
    .guide-goal {
      font-size: 13px;
      color: #166534;
      text-align: center;
      line-height: 1.6;
      padding: 8px;
      background: #f0fdf4;
      border-radius: 8px;
    }
  `]
})
export class ChatComponent implements AfterViewInit, AfterViewChecked {
  @ViewChild('messagesContainer') private container!: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') private inputEl!: ElementRef<HTMLInputElement>;

  protected tutor = inject(TutorService);
  protected inputText = '';
  protected readonly hasUserMsg = computed(() =>
    this.tutor.messages().some(m => m.role === 'user')
  );

  constructor() {
    effect(() => {
      this.tutor.messages();
      this.scrollToBottom();
      // refocus after each message (loading becomes false)
      if (!this.tutor.loading()) {
        setTimeout(() => this.focusInput());
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

  private focusInput(): void {
    this.inputEl?.nativeElement.focus();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const el = this.container?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
