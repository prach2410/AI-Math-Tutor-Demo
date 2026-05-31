import { Component, output, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

const STORAGE_KEY = 'ai_tutor_guide_seen';

@Component({
  selector: 'app-first-time-guide',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="overlay" (click)="onOverlayClick($event)">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="guide-title">

          <div class="welcome-section">
            <div class="wave">👋</div>
            <h1 id="guide-title" class="welcome-title">สวัสดีครับ</h1>
            <p class="welcome-sub">ยินดีต้อนรับสู่ <strong>AI Tutor คณิตศาสตร์ ม.2</strong></p>
            <p class="welcome-msg">ครู AI จะช่วยให้หนูเรียนคณิตศาสตร์แบบทีละขั้น<br>
              ไม่ต้องกลัวตอบผิดนะ 😊<br>
              เพราะการเรียนรู้สำคัญกว่าการตอบถูกทุกข้อ</p>
          </div>

          <div class="steps-section">
            <h2 class="steps-title">วิธีใช้งาน</h2>
            <ol class="steps-list">
              <li>
                <span class="step-num">1️⃣</span>
                <div>
                  <strong>อ่านโจทย์</strong>
                  <p>เริ่มจากอ่านโจทย์ให้เข้าใจก่อน</p>
                </div>
              </li>
              <li>
                <span class="step-num">2️⃣</span>
                <div>
                  <strong>ลองตอบด้วยตัวเอง</strong>
                  <p>พิมพ์คำตอบในช่องแชท แล้วกดส่ง</p>
                </div>
              </li>
              <li>
                <span class="step-num">3️⃣</span>
                <div>
                  <strong>ถ้าไม่แน่ใจ</strong>
                  <p>กด 💡 <em>คำใบ้</em> เพื่อรับคำแนะนำเล็ก ๆ น้อย ๆ โดยยังไม่เฉลยคำตอบ</p>
                </div>
              </li>
              <li>
                <span class="step-num">4️⃣</span>
                <div>
                  <strong>ถ้ายังไม่รู้จะเริ่มอย่างไร</strong>
                  <p>กด 🆘 <em>ช่วยเริ่มให้หน่อย</em> ครูจะช่วยทำตัวอย่างให้ดู 1 ขั้น แล้วให้หนูลองทำต่อเอง</p>
                </div>
              </li>
              <li>
                <span class="step-num">5️⃣</span>
                <div>
                  <strong>เรียนจบบทแล้ว</strong>
                  <p>หนูจะได้รับ 📒 บันทึกของหนู · 🎉 วันนี้ได้เรียนรู้อะไร · 👨‍👩‍👧 สรุปสำหรับผู้ปกครอง · 💡 ใช้ในชีวิตจริง</p>
                </div>
              </li>
            </ol>
          </div>

          <div class="goal-section">
            <p class="goal-text">
              AI Tutor ไม่ได้ถูกสร้างขึ้นมาเพื่อทำการบ้านแทนหนู<br>
              แต่ถูกสร้างขึ้นมาเพื่อช่วยให้หนูเข้าใจวิธีคิด<br>
              และเรียนรู้ได้ด้วยตัวเองมากขึ้นทุกวัน
            </p>
          </div>

          <div class="footer">
            <label class="no-show">
              <input type="checkbox" [(ngModel)]="dontShowAgain" />
              ไม่ต้องแสดงอีก
            </label>
            <button class="start-btn" (click)="close()">🚀 เริ่มเรียนกันเลย!</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
      backdrop-filter: blur(2px);
    }

    .modal {
      background: white;
      border-radius: 16px;
      padding: 28px 32px;
      max-width: 520px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Welcome */
    .welcome-section {
      text-align: center;
    }

    .wave {
      font-size: 36px;
      animation: wave 1.5s ease-in-out infinite;
      display: inline-block;
      transform-origin: 70% 70%;
    }

    @keyframes wave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(20deg); }
      75% { transform: rotate(-10deg); }
    }

    .welcome-title {
      font-size: 22px;
      font-weight: 700;
      margin: 8px 0 4px;
      color: #1e293b;
    }

    .welcome-sub {
      font-size: 15px;
      color: #475569;
      margin: 0 0 8px;
    }

    .welcome-msg {
      font-size: 14px;
      color: #64748b;
      line-height: 1.7;
      margin: 0;
    }

    /* Steps */
    .steps-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 12px;
    }

    .steps-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .steps-list li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 14px;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }

    .step-num {
      font-size: 18px;
      flex-shrink: 0;
      line-height: 1.4;
    }

    .steps-list li div strong {
      font-size: 14px;
      color: #1e293b;
      display: block;
      margin-bottom: 2px;
    }

    .steps-list li div p {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }

    /* Goal */
    .goal-section {
      background: linear-gradient(135deg, #eff6ff, #f0fdf4);
      border-radius: 10px;
      padding: 14px 16px;
      border: 1px solid #bfdbfe;
    }

    .goal-text {
      font-size: 13.5px;
      color: #1e40af;
      line-height: 1.8;
      margin: 0;
      text-align: center;
    }

    /* Footer */
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .no-show {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #64748b;
      cursor: pointer;
      user-select: none;
    }

    .no-show input { cursor: pointer; }

    .start-btn {
      padding: 11px 28px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 24px;
      font-family: inherit;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      white-space: nowrap;
    }

    .start-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
    .start-btn:active { transform: translateY(0); }

    /* ── Mobile: bottom sheet ── */
    @media (max-width: 600px) {
      .overlay {
        align-items: flex-end;
        padding: 0;
      }

      .modal {
        border-radius: 20px 20px 0 0;
        max-width: 100%;
        max-height: 92vh;
        padding: 20px 18px 28px;
        gap: 14px;
        /* slide up animation */
        animation: slideUp 0.28s ease-out;
      }

      @keyframes slideUp {
        from { transform: translateY(40px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }

      /* drag handle hint */
      .modal::before {
        content: '';
        display: block;
        width: 40px;
        height: 4px;
        background: #cbd5e1;
        border-radius: 2px;
        margin: 0 auto -6px;
      }

      .wave { font-size: 28px; }
      .welcome-title { font-size: 18px; }
      .welcome-sub   { font-size: 14px; }
      .welcome-msg   { font-size: 13px; }

      .steps-list li { padding: 8px 10px; gap: 8px; }
      .step-num      { font-size: 16px; }
      .steps-list li div strong { font-size: 13px; }
      .steps-list li div p      { font-size: 12px; }

      .goal-text { font-size: 12.5px; }

      .footer {
        flex-direction: column;
        align-items: stretch;
      }

      .no-show { justify-content: center; }

      .start-btn {
        width: 100%;
        text-align: center;
        font-size: 16px;
        padding: 13px;
      }
    }
  `],
  imports: [FormsModule]
})
export class FirstTimeGuideComponent implements OnInit {
  readonly dismissed = output<void>();

  protected visible = signal(false);
  protected dontShowAgain = true;

  ngOnInit(): void {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      this.visible.set(true);
    }
  }

  protected close(): void {
    if (this.dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, '1');
    }
    this.visible.set(false);
    this.dismissed.emit();
  }

  protected onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.close();
    }
  }
}
