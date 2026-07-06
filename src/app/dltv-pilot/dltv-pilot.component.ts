import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LearningStateIndicatorComponent } from './learning-state-indicator.component';
import { LearningState, ScriptStep, getScriptResponse, getSuggestedReply } from './dltv-mock-script';

interface ChatMessage {
  role: 'ai' | 'student';
  text: string;
  imageUrl?: string;
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

            <dl class="lesson-meta">
              <div><dt>ปีการศึกษา</dt><dd>2569 / 1</dd></div>
              <div><dt>ชั้น</dt><dd>มัธยมศึกษาปีที่ 2</dd></div>
              <div><dt>กลุ่มสาระ</dt><dd>คณิตศาสตร์</dd></div>
              <div><dt>หน่วย</dt><dd>หน่วยการเรียนรู้ที่ 1 · ทฤษฎีบทพีทาโกรัส</dd></div>
              <div><dt>เรื่อง</dt><dd>ทฤษฎีบทพีทาโกรัส (1) · 19 พ.ค. 69</dd></div>
              <div><dt>ตัวชี้วัด</dt><dd>ค 2.2 ม.2/5</dd></div>
            </dl>

            <p class="lesson-concept">
              <span class="concept-label">สาระสำคัญ</span>
              ทฤษฎีบทพีทาโกรัสสามารถนำมาใช้แก้ปัญหาคณิตศาสตร์ โดยหาความยาวของด้านใดด้านหนึ่งของรูปสามเหลี่ยมมุมฉากที่ต้องการทราบได้เสมอ เมื่อทราบความยาวของด้านอีกสองด้าน
            </p>

            <a
              href="https://dltv.ac.th/teachplan/episode/108101"
              target="_blank"
              rel="noopener"
              class="btn-dltv"
            >
              ▶ เปิดบทเรียน DLTV
            </a>

            <div class="lesson-media">
              <div class="lesson-media-head">สื่อประกอบการสอน</div>
              <ul>
                <li><span class="doc-ico">📄</span> สื่อประกอบการสอน เรื่อง ทฤษฎีบทพีทาโกรัส (1)</li>
                <li><span class="doc-ico">📄</span> ใบกิจกรรมประกอบการสอนที่ 2</li>
                <li><span class="doc-ico">📄</span> แบบฝึกหัดประกอบการสอนที่ 3</li>
              </ul>
            </div>

            <section class="ai-check-box">
              <h3 class="ai-check-title">หลังเรียนบทนี้ AI จะช่วยตรวจอะไร</h3>
              <ol class="ai-check-list">
                <li>ระบุได้ว่าด้านใดคือด้านตรงข้ามมุมฉาก</li>
                <li>อธิบายได้ว่าทำไมด้านนั้นจึงเป็น <em>c</em></li>
                <li>นำหลักการไปใช้กับรูปใหม่ได้ ไม่เลือกจากความยาวเพียงอย่างเดียว</li>
              </ol>
              <p class="ai-check-note">AI ใช้บริบทจากบทเรียนนี้เพื่อช่วยตรวจความเข้าใจหลังเรียน โดยไม่แทนที่บทเรียน DLTV และไม่ตัดสินใจแทนครู</p>
            </section>

            <div class="lesson-divider">
              <span>เรียนบทเรียนเสร็จแล้ว?</span>
            </div>

            <button class="btn-tutor" (click)="startSession()">
              ตรวจความเข้าใจหลังเรียน
            </button>

            <p class="lesson-note">AI ไม่ได้มาแทน DLTV หรือครู แต่ช่วยตรวจว่าเข้าใจจริงหรือแค่จำสูตร</p>
          </div>
        }

        <!-- PAGE 2: AI Tutor Session -->
        @if (page() === 'session') {
          <div class="session-page">

            <div class="session-top-row">
              <button class="btn-back" (click)="page.set('lesson')">← กลับ</button>
              <app-learning-state-indicator [state]="learningState()" />
            </div>

            <div class="chat-area" #chatArea>
              @for (msg of messages(); track $index) {
                <div class="msg-row" [class.msg-ai]="msg.role === 'ai'" [class.msg-student]="msg.role === 'student'">
                  @if (msg.role === 'ai') {
                    <div class="msg-avatar">🤖</div>
                  }
                  <div class="msg-bubble">
                    {{ msg.text }}
                    @if (msg.imageUrl) {
                      <img [src]="msg.imageUrl" alt="โจทย์" class="msg-img" />
                    }
                  </div>
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
                @if (suggestedReply()) {
                  <div class="chip-row">
                    <button class="chip" (click)="sendChip()" [disabled]="aiTyping()">
                      💬 {{ suggestedReply() }}
                    </button>
                  </div>
                }
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
                  <li>ใช้ a² + b² = c² กับโจทย์สี่เหลี่ยม ABCD ได้ (AC = 50)</li>
                  <li>แต่ระบุ AC ว่า "ด้านที่ยาวที่สุด" — ยังไม่ผูกกับมุมฉาก</li>
                  <li>จุดพื้นฐานที่ข้ามไป: บทเรียน DLTV ข้ามไปโจทย์แบ่งรูปเลย</li>
                </ul>
              </div>
              <div class="ba-col after">
                <div class="ba-header">หลังได้รับความช่วยเหลือ</div>
                <ul>
                  <li>ระบุได้ว่า AC คือด้านตรงข้ามมุมฉาก ABC (ไม่ใช่แค่ยาวที่สุด)</li>
                  <li>แก้แบบฝึกหัด 3 ข้อ 2 (MN = 10) ได้ด้วยตัวเอง</li>
                  <li>อธิบายกลับเป็นคำพูดตัวเองได้</li>
                </ul>
              </div>
            </div>

            <div class="evidence-findings">
              <div class="finding-item">
                <span class="finding-label">จุดที่พบ:</span>
                นักเรียนจำสูตรได้แต่ยังขาด จุดพื้นฐานที่ข้ามไป — ยังไม่เชื่อม "เส้นทแยง → สามเหลี่ยมมุมฉาก → ด้านตรงข้ามมุมฉาก"
              </div>
              <div class="finding-item">
                <span class="finding-label">การช่วยเหลือของ AI:</span>
                ถามเช็คความเข้าใจ → ช่วยชี้จากรูปสี่เหลี่ยม ABCD → ให้เด็กอธิบายกลับ → ทดสอบด้วยโจทย์ใหม่ (ว่าว แบบฝึกหัด 3 ข้อ 2)
              </div>
              <div class="finding-item">
                <span class="finding-label">ข้อเสนอแนะสำหรับครู:</span>
                ตรวจ<strong>ใบกิจกรรม 2</strong> + <strong>แบบฝึกหัด 3 (ข้อ 1, 3 โจทย์แบ่งรูป)</strong> เพื่อยืนยันว่าเชื่อมโยงได้จริง
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

    /* Lesson metadata — mirrors the real DLTV teachplan page */
    .lesson-meta {
      width: 100%;
      max-width: 360px;
      box-sizing: border-box;
      margin: 0;
      text-align: left;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    .lesson-meta > div {
      display: grid;
      grid-template-columns: 84px 1fr;
      gap: 10px;
      padding: 8px 14px;
      font-size: 13px;
      border-top: 1px solid #f1f5f9;
    }
    .lesson-meta > div:first-child { border-top: none; }
    .lesson-meta dt { color: #94a3b8; margin: 0; }
    .lesson-meta dd { color: #334155; margin: 0; font-weight: 600; }

    .lesson-concept {
      width: 100%;
      max-width: 360px;
      box-sizing: border-box;
      text-align: left;
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      color: #475569;
    }
    .concept-label {
      display: inline-block;
      font-weight: 700;
      color: #1e293b;
      margin-right: 4px;
    }

    /* Accompanying media — same items the teacher checks on the evidence page */
    .lesson-media {
      width: 100%;
      max-width: 360px;
      box-sizing: border-box;
      text-align: left;
    }
    .lesson-media-head {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 6px;
    }
    .lesson-media ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .lesson-media li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #475569;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
    }
    .lesson-media .doc-ico { flex-shrink: 0; }

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

    /* Secondary "what AI checks" box — stays quieter than the DLTV button */
    .ai-check-box {
      width: 100%;
      max-width: 360px;
      box-sizing: border-box;
      text-align: left;
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 10px;
      padding: 14px 16px;
    }
    .ai-check-title {
      margin: 0 0 8px;
      font-size: 14px;
      font-weight: 700;
      color: #6b21a8;
    }
    .ai-check-list {
      margin: 0;
      padding-left: 20px;
      font-size: 13.5px;
      line-height: 1.6;
      color: #475569;
    }
    .ai-check-list li { margin-bottom: 2px; }
    .ai-check-list em { font-style: italic; font-weight: 600; color: #6b21a8; }
    .ai-check-note {
      margin: 10px 0 0;
      font-size: 12px;
      line-height: 1.5;
      color: #94a3b8;
    }

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
    .session-top-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 0 12px;
    }
    .btn-back {
      padding: 6px 14px;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .btn-back:hover { background: #e2e8f0; }
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

    .msg-img {
      display: block;
      margin-top: 10px;
      max-width: 100%;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
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

    .chip-row { margin-top: 8px; }
    .chip {
      padding: 8px 14px;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1.5px solid #bfdbfe;
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      max-width: 100%;
      text-align: left;
      transition: background 0.15s;
      white-space: normal;
      line-height: 1.4;
    }
    .chip:hover:not(:disabled) { background: #dbeafe; }
    .chip:disabled { opacity: 0.5; cursor: not-allowed; }

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
  suggestedReply = signal<string | undefined>(undefined);
  draft = '';
  private turn = 0;

  startSession(): void {
    this.page.set('session');
    this.turn = 0;
    this.learningState.set('RECALL_CHECK');
    this.messages.set([{
      role: 'ai',
      text: 'จากบทเรียนเมื่อกี้ — สี่เหลี่ยม ABCD กว้าง 30 ยาว 40 หน่วย · หนูจะหาความยาวเส้นทแยงมุม AC ได้อย่างไร?',
      imageUrl: '/dltv-pilot/rect-abcd.jpg',
    }]);
    this.suggestedReply.set(getSuggestedReply(0));
  }

  sendChip(): void {
    const text = this.suggestedReply();
    if (!text) return;
    this.draft = text;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.draft.trim();
    if (!text || this.aiTyping()) return;
    this.draft = '';
    this.suggestedReply.set(undefined);

    this.messages.update((msgs) => [...msgs, { role: 'student', text }]);
    this.aiTyping.set(true);

    setTimeout(() => {
      const { step } = getScriptResponse(text, this.turn);
      this.learningState.set(step.nextState);
      const aiMsg: ChatMessage = { role: 'ai', text: step.aiMessage };
      if (step.imageUrl) aiMsg.imageUrl = step.imageUrl;
      this.messages.update((msgs) => [...msgs, aiMsg]);
      this.aiTyping.set(false);
      if (step.nextState !== 'EVIDENCE_SUMMARY') {
        this.turn++;
        this.suggestedReply.set(getSuggestedReply(this.turn));
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
    this.suggestedReply.set(undefined);
  }
}
