import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LearningStateIndicatorComponent } from './learning-state-indicator.component';
import { LearningState, getScriptResponse } from './dltv-mock-script';

interface ChatMessage {
  role: 'ai' | 'student';
  text: string;
}

type PilotPage = 'lesson' | 'session' | 'evidence';

@Component({
  selector: 'app-dltv-pilot',
  standalone: true,
  imports: [FormsModule, LearningStateIndicatorComponent],
  template: `
    <div class="pilot-shell">

      <!-- HEADER -->
      <header class="pilot-header">
        <div class="pilot-header-inner">
          <div class="pilot-brand">
            <span class="pilot-badge">PILOT</span>
            <span class="pilot-title">AI Tutor × DLTV</span>
          </div>
          <div class="pilot-lesson-label">คณิตศาสตร์ ม.2 · ทฤษฎีบทพีทาโกรัส (1)</div>
        </div>
      </header>

      <main class="pilot-main">

        <!-- PAGE 1: Lesson Companion -->
        @if (page() === 'lesson') {
          <div class="lesson-page">
            <div class="lesson-source-badge">
              <img src="https://www.dltv.ac.th/favicon.ico" alt="DLTV" class="dltv-favicon" onerror="this.style.display='none'" />
              แหล่งเรียนรู้: DLTV
            </div>
            <h2 class="lesson-title">คณิตศาสตร์ ม.2<br>ทฤษฎีบทพีทาโกรัส (1)</h2>
            <p class="lesson-sub">เริ่มต้นด้วยการเรียนจากบทเรียน DLTV</p>

            <a
              href="https://dltv.ac.th/teachplan/episode/108101"
              target="_blank"
              rel="noopener"
              class="btn-dltv"
            >
              ▶ เปิดบทเรียน DLTV
            </a>

            <div class="lesson-divider">
              <span>เรียนบทเรียนเสร็จแล้ว?</span>
            </div>

            <button class="btn-tutor" (click)="startSession()">
              ตรวจความเข้าใจกับ AI Tutor →
            </button>

            <p class="lesson-note">AI ไม่ได้มาแทน DLTV หรือครู แต่ช่วยตรวจว่าเข้าใจจริงหรือแค่จำสูตร</p>
          </div>
        }

        <!-- PAGE 2: AI Tutor Session -->
        @if (page() === 'session') {
          <div class="session-page">

            <div class="session-indicator-row">
              <app-learning-state-indicator [state]="learningState()" />
            </div>

            <div class="chat-area" #chatArea>
              @for (msg of messages(); track $index) {
                <div class="msg-row" [class.msg-ai]="msg.role === 'ai'" [class.msg-student]="msg.role === 'student'">
                  @if (msg.role === 'ai') {
                    <div class="msg-avatar">🤖</div>
                  }
                  <div class="msg-bubble">{{ msg.text }}</div>
                  @if (msg.role === 'student') {
                    <div class="msg-avatar">👦</div>
                  }
                </div>
              }
              @if (aiTyping()) {
                <div class="msg-row msg-ai">
                  <div class="msg-avatar">🤖</div>
                  <div class="msg-bubble typing-dots"><span></span><span></span><span></span></div>
                </div>
              }
            </div>

            @if (learningState() !== 'EVIDENCE_SUMMARY') {
              <div class="input-section">
                @if (messages().length <= 1) {
                  <p class="input-hint">💬 พิมพ์คำตอบของคุณ แล้วกด <strong>ส่ง</strong> หรือกด Enter</p>
                }
                <div class="input-row">
                  <input
                    class="chat-input"
                    type="text"
                    [(ngModel)]="draft"
                    placeholder="พิมพ์คำตอบที่นี่..."
                    (keydown.enter)="sendMessage()"
                    [disabled]="aiTyping()"
                  />
                  <button class="btn-send" (click)="sendMessage()" [disabled]="aiTyping() || !draft.trim()">
                    ส่ง
                  </button>
                </div>
              </div>
            } @else {
              <div class="evidence-cta">
                <button class="btn-evidence" (click)="showEvidence()">
                  ดูสรุปผลสำหรับครู →
                </button>
              </div>
            }
          </div>
        }

        <!-- PAGE 3: Teacher Evidence -->
        @if (page() === 'evidence') {
          <div class="evidence-page">
            <h2 class="evidence-title">📋 สรุปผลสำหรับครู</h2>
            <div class="evidence-meta">
              <span>นักเรียน: <strong>ตัวอย่างนักเรียน A</strong></span>
              <span>บทเรียน: <strong>ทฤษฎีบทพีทาโกรัส (1)</strong></span>
              <span class="dltv-tag">แหล่งเรียนรู้: DLTV</span>
            </div>

            <div class="before-after">
              <div class="ba-col before">
                <div class="ba-header">ก่อนได้รับความช่วยเหลือ</div>
                <ul>
                  <li>จำสูตร a² + b² = c² ได้</li>
                  <li>แต่ยังระบุไม่ได้ว่าด้าน c คือด้านตรงข้ามมุมฉาก</li>
                  <li>สับสนระหว่าง "ด้านที่ยาวที่สุด" กับ "ด้านตรงข้ามมุมฉาก"</li>
                </ul>
              </div>
              <div class="ba-col after">
                <div class="ba-header">หลังได้รับความช่วยเหลือ</div>
                <ul>
                  <li>ระบุด้าน c ได้ถูกต้อง</li>
                  <li>แก้โจทย์ 6-8-10 ได้ด้วยตัวเอง</li>
                  <li>อธิบายกลับเป็นคำพูดตัวเองได้</li>
                </ul>
              </div>
            </div>

            <div class="evidence-findings">
              <div class="finding-item">
                <span class="finding-label">จุดที่พบ:</span>
                สับสนระหว่าง "ด้านที่ยาวที่สุด" กับ "ด้านตรงข้ามมุมฉาก"
              </div>
              <div class="finding-item">
                <span class="finding-label">การช่วยเหลือของ AI:</span>
                ทบทวนความหมายด้านตรงข้ามมุมฉาก + ให้เด็กอธิบายกลับด้วยคำตัวเอง
              </div>
              <div class="finding-item">
                <span class="finding-label">ข้อสังเกตสำหรับครู:</span>
                ควรให้แบบฝึกเพิ่มเรื่องการระบุด้านตรงข้ามมุมฉากจากรูปที่หมุนหลายทิศทาง
              </div>
            </div>

            <div class="teacher-note">
              ⓘ ข้อมูลนี้เป็นเพียงข้อสังเกตเพื่อช่วยครู<br>
              <strong>การตัดสินใจสอนต่อเป็นของครูเสมอ</strong>
            </div>

            <button class="btn-restart" (click)="restart()">← ลองใหม่อีกครั้ง</button>
          </div>
        }

      </main>
    </div>
  `,
  styles: [`
    /* Shell */
    .pilot-shell {
      min-height: 100dvh;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      font-family: 'Segoe UI', Tahoma, sans-serif;
    }

    /* Header */
    .pilot-header {
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      padding: 12px 20px;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .pilot-header-inner {
      max-width: 680px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .pilot-brand { display: flex; align-items: center; gap: 8px; }
    .pilot-badge {
      font-size: 10px;
      font-weight: 700;
      background: #7c3aed;
      color: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .pilot-title { font-weight: 700; font-size: 16px; color: #1e293b; }
    .pilot-lesson-label { font-size: 13px; color: #64748b; margin-left: auto; }

    /* Main */
    .pilot-main {
      flex: 1;
      max-width: 680px;
      width: 100%;
      margin: 0 auto;
      padding: 24px 16px 40px;
      box-sizing: border-box;
    }

    /* ── PAGE 1: Lesson Companion ── */
    .lesson-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
      padding-top: 16px;
    }
    .lesson-source-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #64748b;
      background: #f1f5f9;
      padding: 4px 12px;
      border-radius: 20px;
    }
    .dltv-favicon { width: 16px; height: 16px; }
    .lesson-title {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.4;
      margin: 0;
    }
    .lesson-sub { color: #64748b; margin: 0; font-size: 15px; }

    .btn-dltv {
      display: inline-block;
      padding: 14px 32px;
      background: #0057b8;
      color: #fff;
      text-decoration: none;
      border-radius: 10px;
      font-size: 17px;
      font-weight: 700;
      width: 100%;
      max-width: 360px;
      box-sizing: border-box;
      transition: background 0.2s;
    }
    .btn-dltv:hover { background: #0046a0; }

    .lesson-divider {
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 360px;
      gap: 10px;
      color: #94a3b8;
      font-size: 13px;
    }
    .lesson-divider::before, .lesson-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    .btn-tutor {
      padding: 12px 32px;
      background: #f8fafc;
      color: #1e293b;
      border: 2px solid #cbd5e1;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      max-width: 360px;
      transition: border-color 0.2s, background 0.2s;
    }
    .btn-tutor:hover { border-color: #7c3aed; background: #faf5ff; color: #7c3aed; }

    .lesson-note {
      font-size: 12px;
      color: #94a3b8;
      max-width: 320px;
      line-height: 1.5;
      margin: 0;
    }

    /* ── PAGE 2: Session ── */
    .session-page {
      display: flex;
      flex-direction: column;
      height: calc(100dvh - 120px);
    }
    .session-indicator-row {
      padding: 8px 0 12px;
      display: flex;
      justify-content: center;
    }
    .chat-area {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 4px 0;
    }
    .msg-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }
    .msg-ai { flex-direction: row; }
    .msg-student { flex-direction: row-reverse; }
    .msg-avatar { font-size: 22px; flex-shrink: 0; }
    .msg-bubble {
      max-width: 78%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 15px;
      line-height: 1.55;
    }
    .msg-ai .msg-bubble {
      background: #f1f5f9;
      color: #1e293b;
      border-bottom-left-radius: 4px;
    }
    .msg-student .msg-bubble {
      background: #7c3aed;
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    /* typing dots */
    .typing-dots { display: flex; gap: 4px; padding: 14px 18px; align-items: center; }
    .typing-dots span {
      width: 7px; height: 7px; border-radius: 50%; background: #94a3b8;
      animation: bounce 1.2s ease-in-out infinite;
    }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    .input-section {
      border-top: 1px solid #e2e8f0;
      margin-top: 8px;
      padding-top: 10px;
    }
    .input-hint {
      font-size: 12px;
      color: #64748b;
      margin: 0 0 8px;
      text-align: center;
    }
    .input-row {
      display: flex;
      gap: 8px;
    }
    .chat-input {
      flex: 1;
      padding: 11px 14px;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
    }
    .chat-input:focus { border-color: #7c3aed; }
    .btn-send {
      padding: 11px 20px;
      background: #7c3aed;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-send:disabled { background: #cbd5e1; cursor: not-allowed; }
    .btn-send:hover:not(:disabled) { background: #6d28d9; }

    .evidence-cta { padding-top: 16px; display: flex; justify-content: center; }
    .btn-evidence {
      padding: 13px 32px;
      background: #16a34a;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-evidence:hover { background: #15803d; }

    /* ── PAGE 3: Evidence ── */
    .evidence-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .evidence-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    .evidence-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
      font-size: 14px;
      color: #475569;
    }
    .dltv-tag {
      background: #eff6ff;
      color: #1d4ed8;
      padding: 2px 10px;
      border-radius: 12px;
      font-weight: 600;
    }

    .before-after {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    @media (max-width: 480px) {
      .before-after { grid-template-columns: 1fr; }
    }
    .ba-col {
      border-radius: 10px;
      padding: 14px 16px;
    }
    .before { background: #fff7ed; border: 1px solid #fed7aa; }
    .after  { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .ba-header {
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .before .ba-header { color: #9a3412; }
    .after  .ba-header { color: #166534; }
    .ba-col ul { margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.6; }
    .before ul { color: #7c2d12; }
    .after  ul { color: #14532d; }

    .evidence-findings {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .finding-item { font-size: 14px; color: #334155; line-height: 1.5; }
    .finding-label { font-weight: 700; color: #1e293b; margin-right: 4px; }

    .teacher-note {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 14px 16px;
      font-size: 14px;
      color: #1e40af;
      line-height: 1.6;
      text-align: center;
    }

    .btn-restart {
      align-self: flex-start;
      padding: 10px 20px;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-restart:hover { background: #e2e8f0; }
  `],
})
export class DltvPilotComponent {
  page = signal<PilotPage>('lesson');
  messages = signal<ChatMessage[]>([]);
  learningState = signal<LearningState>('RECALL_CHECK');
  aiTyping = signal(false);
  draft = '';
  private turn = 0;

  startSession(): void {
    this.page.set('session');
    this.turn = 0;
    this.learningState.set('RECALL_CHECK');
    // AI opens with a question, not an explanation
    this.messages.set([{
      role: 'ai',
      text: 'จากบทเรียนเมื่อกี้ หนูลองเล่าให้ฟังหน่อยว่า ถ้าเรารู้ความยาวด้านสองด้านของสามเหลี่ยมมุมฉาก เราหาด้านที่เหลือได้อย่างไร?',
    }]);
  }

  sendMessage(): void {
    const text = this.draft.trim();
    if (!text || this.aiTyping()) return;
    this.draft = '';

    this.messages.update((msgs) => [...msgs, { role: 'student', text }]);
    this.aiTyping.set(true);

    setTimeout(() => {
      const { step } = getScriptResponse(text, this.turn);
      this.learningState.set(step.nextState);
      this.messages.update((msgs) => [...msgs, { role: 'ai', text: step.aiMessage }]);
      this.aiTyping.set(false);
      if (step.nextState !== 'EVIDENCE_SUMMARY') {
        this.turn++;
      }
    }, 900);
  }

  showEvidence(): void {
    this.page.set('evidence');
  }

  restart(): void {
    this.page.set('lesson');
    this.messages.set([]);
    this.turn = 0;
    this.learningState.set('RECALL_CHECK');
  }
}
