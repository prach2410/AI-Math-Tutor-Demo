import {
  Component, inject, OnInit,
  ElementRef, ViewChild, AfterViewChecked, effect
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectBrainTutorService, ProjectBrainPhase } from './project-brain-tutor.service';
import { TutorService } from '../tutor.service';

const PHASE_LABELS: Record<ProjectBrainPhase, string> = {
  teach:     '📖 เรียนรู้',
  retrieval: '🔄 ต่อจากครั้งก่อน',
  check:     '✅ ตรวจความเข้าใจ',
  reflect:   '💭 สะท้อนความคิด',
  grill:     '🔍 ฝึกคิด',
  summary:   '📋 สรุปความเข้าใจ',
};

@Component({
  selector: 'app-project-brain-tutor',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="pb-wrap">

      <!-- Header -->
      <div class="pb-header">
        <span class="pb-icon">🧠</span>
        <div class="pb-header-text">
          <span class="pb-title">Project Brain</span>
          <span class="pb-sub">{{ phaseLabel }}</span>
        </div>
        <button class="pb-back-btn" (click)="exit()">← กลับ</button>
      </div>

      <!-- Messages -->
      <div class="pb-messages" #msgEl>
        @for (msg of pb.messages(); track $index) {
          <div class="pb-row" [class.pb-user-row]="msg.role === 'user'">
            @if (msg.role === 'assistant') {
              <div class="pb-avatar">🧠</div>
            }
            <div class="pb-bubble"
              [class.pb-ai]="msg.role === 'assistant'"
              [class.pb-user]="msg.role === 'user'">
              <pre class="pb-text">{{ msg.content }}</pre>
            </div>
            @if (msg.role === 'user') {
              <div class="pb-avatar">🧑</div>
            }
          </div>
        }

        @if (pb.loading()) {
          <div class="pb-row">
            <div class="pb-avatar">🧠</div>
            <div class="pb-bubble pb-ai typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        }
      </div>

      <!-- Summary banner -->
      @if (pb.suggestSummary() && !pb.loading() && pb.phase() !== 'summary') {
        <div class="pb-suggest">
          <span>พร้อมดูสรุปความเข้าใจแล้วไหม? 😊</span>
          <button class="pb-suggest-btn" (click)="requestSummary()">
            📋 ดูสรุปความเข้าใจ
          </button>
        </div>
      }

      <!-- Input -->
      <div class="pb-input-bar">
        <input
          #inputEl
          class="pb-input"
          type="text"
          placeholder="พิมพ์ความคิดของคุณ..."
          [(ngModel)]="inputText"
          (keydown.enter)="send()"
          [disabled]="pb.loading()"
        />
        <button
          class="pb-send-btn"
          (click)="send()"
          [disabled]="pb.loading() || !inputText.trim()"
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

    .pb-wrap {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      background: white;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .pb-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: linear-gradient(90deg, #1e40af, #3b82f6);
      flex-shrink: 0;
    }

    .pb-icon { font-size: 22px; }

    .pb-header-text {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .pb-title {
      font-size: 14px;
      font-weight: 700;
      color: white;
    }

    .pb-sub {
      font-size: 11px;
      color: rgba(255,255,255,0.8);
    }

    .pb-back-btn {
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
    .pb-back-btn:hover { background: rgba(255,255,255,0.28); }

    .pb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 18px 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      scroll-behavior: smooth;
    }

    .pb-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }
    .pb-user-row { flex-direction: row-reverse; }

    .pb-avatar {
      font-size: 22px;
      width: 34px;
      text-align: center;
      flex-shrink: 0;
    }

    .pb-bubble {
      max-width: 72%;
      padding: 12px 16px;
      border-radius: var(--radius);
      font-size: 14.5px;
      line-height: 1.65;
    }

    .pb-ai {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-bottom-left-radius: 4px;
    }

    .pb-user {
      background: var(--color-user-bubble);
      border: 1px solid var(--color-user-border);
      border-bottom-right-radius: 4px;
    }

    .pb-text {
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
      background: #3b82f6;
      animation: bounce 1.2s infinite;
    }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-6px); opacity: 1; }
    }

    .pb-suggest {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      background: #eff6ff;
      border-top: 1px solid #bfdbfe;
      font-size: 14px;
      color: #1e40af;
      flex-shrink: 0;
    }

    .pb-suggest-btn {
      padding: 7px 18px;
      background: #1e40af;
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
    .pb-suggest-btn:hover { background: #1e3a8a; }

    .pb-input-bar {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      flex-shrink: 0;
    }

    .pb-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 14.5px;
      outline: none;
      transition: border-color 0.2s;
    }
    .pb-input:focus { border-color: #3b82f6; }

    .pb-send-btn {
      padding: 10px 20px;
      background: #1e40af;
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
    .pb-send-btn:hover:not(:disabled) { background: #1e3a8a; }
    .pb-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 640px) {
      .pb-bubble { max-width: 85%; font-size: 14px; }
    }
  `]
})
export class ProjectBrainTutorComponent implements OnInit, AfterViewChecked {
  @ViewChild('msgEl')  private msgEl!: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') private inputEl?: ElementRef<HTMLInputElement>;

  protected pb    = inject(ProjectBrainTutorService);
  private   tutor = inject(TutorService);
  protected inputText = '';

  protected get phaseLabel(): string {
    return PHASE_LABELS[this.pb.phase()] ?? '';
  }

  constructor() {
    effect(() => {
      this.pb.messages();
      this.scrollToBottom();
      if (!this.pb.loading()) {
        setTimeout(() => this.inputEl?.nativeElement.focus());
      }
    });
  }

  ngOnInit(): void {
    this.pb.start();
    setTimeout(() => this.inputEl?.nativeElement.focus());
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  protected send(): void {
    const text = this.inputText.trim();
    if (!text) return;
    this.inputText = '';
    this.pb.send(text);
  }

  protected requestSummary(): void {
    this.pb.saveEvidence(this.tutor.sessionId());
    this.pb.requestSummary();
  }

  protected exit(): void {
    this.pb.saveEvidence(this.tutor.sessionId());
    this.tutor.exitProjectBrainMode();
  }

  private scrollToBottom(): void {
    const el = this.msgEl?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
