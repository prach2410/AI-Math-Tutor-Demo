import {
  Component, inject, Input, OnInit, OnChanges,
  ElementRef, ViewChild, AfterViewChecked, effect
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FreeTalkService } from './free-talk.service';
import { TutorService } from '../tutor.service';

@Component({
  selector: 'app-free-talk',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="ft-wrap">

      <!-- Header -->
      <div class="ft-header">
        <span class="ft-icon">💬</span>
        <div class="ft-header-text">
          <span class="ft-title">Free Talk</span>
          <span class="ft-sub">{{ duringLesson ? 'พักจากบทเรียน' : 'คุยกับพี่ก่อน' }}</span>
        </div>
        @if (duringLesson) {
          <button class="ft-back-btn" (click)="returnToLesson()">
            ← กลับเรียน
          </button>
        }
      </div>

      <!-- Messages -->
      <div class="ft-messages" #msgEl>
        @for (msg of ft.messages(); track $index) {
          <div class="ft-row" [class.ft-user-row]="msg.role === 'user'">
            @if (msg.role === 'assistant') {
              <div class="ft-avatar">🤖</div>
            }
            <div class="ft-bubble"
              [class.ft-ai]="msg.role === 'assistant'"
              [class.ft-user]="msg.role === 'user'">
              <pre class="ft-text">{{ msg.content }}</pre>
            </div>
            @if (msg.role === 'user') {
              <div class="ft-avatar">🧒</div>
            }
          </div>
        }

        @if (ft.loading()) {
          <div class="ft-row">
            <div class="ft-avatar">🤖</div>
            <div class="ft-bubble ft-ai typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        }
      </div>

      <!-- Suggest lesson banner -->
      @if (ft.suggestLesson() && !ft.loading()) {
        <div class="ft-suggest">
          <span>พร้อมเรียนแล้วไหม? 😊</span>
          <button class="ft-suggest-btn" (click)="returnToLesson()">
            📚 {{ duringLesson ? 'กลับไปทำต่อ' : 'เริ่มเรียนเลย' }}
          </button>
        </div>
      }

      <!-- Input -->
      <div class="ft-input-bar">
        <input
          #inputEl
          class="ft-input"
          type="text"
          placeholder="พิมพ์อะไรก็ได้..."
          [(ngModel)]="inputText"
          (keydown.enter)="send()"
          [disabled]="ft.loading()"
        />
        <button
          class="ft-send-btn"
          (click)="send()"
          [disabled]="ft.loading() || !inputText.trim()"
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

    .ft-wrap {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      background: white;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .ft-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: linear-gradient(90deg, #7c3aed, #a855f7);
      flex-shrink: 0;
    }

    .ft-icon { font-size: 22px; }

    .ft-header-text {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .ft-title {
      font-size: 14px;
      font-weight: 700;
      color: white;
    }

    .ft-sub {
      font-size: 11px;
      color: rgba(255,255,255,0.8);
    }

    .ft-back-btn {
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.35);
      color: white;
      border-radius: 16px;
      padding: 5px 12px;
      font-family: inherit;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .ft-back-btn:hover { background: rgba(255,255,255,0.28); }

    .ft-messages {
      flex: 1;
      overflow-y: auto;
      padding: 18px 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      scroll-behavior: smooth;
    }

    .ft-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }
    .ft-user-row { flex-direction: row-reverse; }

    .ft-avatar {
      font-size: 22px;
      width: 34px;
      text-align: center;
      flex-shrink: 0;
    }

    .ft-bubble {
      max-width: 72%;
      padding: 12px 16px;
      border-radius: var(--radius);
      font-size: 14.5px;
      line-height: 1.65;
    }

    .ft-ai {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-bottom-left-radius: 4px;
    }

    .ft-user {
      background: var(--color-user-bubble);
      border: 1px solid var(--color-user-border);
      border-bottom-right-radius: 4px;
    }

    .ft-text {
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
      background: #a855f7;
      animation: bounce 1.2s infinite;
    }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-6px); opacity: 1; }
    }

    .ft-suggest {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      background: #f0fdf4;
      border-top: 1px solid #bbf7d0;
      font-size: 14px;
      color: #15803d;
      flex-shrink: 0;
    }

    .ft-suggest-btn {
      padding: 7px 18px;
      background: #16a34a;
      color: white;
      border: none;
      border-radius: 16px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .ft-suggest-btn:hover { background: #15803d; }

    .ft-input-bar {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      flex-shrink: 0;
    }

    .ft-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 14.5px;
      outline: none;
      transition: border-color 0.2s;
    }
    .ft-input:focus { border-color: #a855f7; }

    .ft-send-btn {
      padding: 10px 20px;
      background: #7c3aed;
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
    .ft-send-btn:hover:not(:disabled) { background: #6d28d9; }
    .ft-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 640px) {
      .ft-bubble { max-width: 85%; font-size: 14px; }
    }
  `]
})
export class FreeTalkComponent implements OnInit, AfterViewChecked {
  @ViewChild('msgEl') private msgEl!: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') private inputEl?: ElementRef<HTMLInputElement>;

  @Input() duringLesson = false;

  protected ft    = inject(FreeTalkService);
  private   tutor = inject(TutorService);
  protected inputText = '';

  constructor() {
    effect(() => {
      this.ft.messages();
      this.scrollToBottom();
    });
  }

  ngOnInit(): void {
    this.ft.start(this.duringLesson);
    if (this.duringLesson) {
      this.tutor.trackFreeTalkDuringLesson();
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  protected send(): void {
    const text = this.inputText.trim();
    if (!text) return;
    this.inputText = '';
    this.ft.send(text, this.duringLesson);
  }

  protected returnToLesson(): void {
    this.tutor.exitFreeTalk();
  }

  private scrollToBottom(): void {
    const el = this.msgEl?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
