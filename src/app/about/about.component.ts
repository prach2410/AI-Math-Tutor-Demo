import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <button class="about-btn" (click)="open()" title="เกี่ยวกับ">
      ℹ️ เกี่ยวกับ
    </button>

    @if (visible()) {
      <div class="overlay" (click)="onOverlayClick($event)">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="about-title">

          <div class="modal-header">
            <h1 id="about-title" class="modal-title">เกี่ยวกับ</h1>
            <button class="close-btn" (click)="close()" aria-label="ปิด">✕</button>
          </div>

          <div class="modal-body">

            <section class="hero">
              <h2>AI Tutor คณิตศาสตร์ ม.2</h2>
              <p>
                โครงการนี้เกิดขึ้นจากความตั้งใจเล็ก ๆ ของพ่อคนหนึ่งที่อยากช่วยให้ลูกเรียนคณิตศาสตร์ได้อย่างมั่นใจมากขึ้น
                จุดเริ่มต้นไม่ได้มาจากการอยากสร้าง AI ที่เก่งที่สุด แต่เริ่มจากคำถามง่าย ๆ ว่า
              </p>
              <blockquote>"จะทำอย่างไรให้เด็กคนหนึ่งรู้สึกว่าคณิตศาสตร์ไม่ใช่เรื่องน่ากลัว"</blockquote>
            </section>

            <section>
              <h3>ปัญหาที่พบบ่อย</h3>
              <ul>
                <li>ไม่เข้าใจพื้นฐาน</li>
                <li>ไม่กล้าถามในห้องเรียน</li>
                <li>กลัวตอบผิด</li>
                <li>ไม่เห็นว่าคณิตศาสตร์นำไปใช้ทำอะไรได้</li>
                <li>รู้สึกว่าการเรียนเป็นเรื่องน่าเบื่อ</li>
              </ul>
            </section>

            <section class="tagline-section">
              <p class="tagline">AI เพื่อนติวส่วนตัว</p>
              <p class="tagline-sub">ที่ช่วยให้นักเรียนเรียนรู้แบบทีละขั้น คิดด้วยตนเองก่อนรับคำตอบ และเชื่อมโยงบทเรียนกับชีวิตจริง</p>
            </section>

            <section>
              <h3>แนวคิดสำคัญ</h3>
              <div class="principles">
                <div class="principle-card">
                  <div class="principle-icon">🎓</div>
                  <strong>Teach, Don't Answer</strong>
                  <p>AI ไม่ควรแค่ตอบคำถาม แต่ช่วยให้นักเรียนเข้าใจวิธีคิดและเรียนรู้ด้วยตนเอง</p>
                </div>
                <div class="principle-card">
                  <div class="principle-icon">🌍</div>
                  <strong>Real-World Learning</strong>
                  <p>เชื่อมโยงคณิตศาสตร์กับสิ่งรอบตัว เช่น ตู้ปลา ถังน้ำ กล่องพัสดุ</p>
                </div>
                <div class="principle-card">
                  <div class="principle-icon">📒</div>
                  <strong>Learning Asset Ownership</strong>
                  <p>นักเรียนได้รับบันทึกการเรียนรู้และวิธีคิดกลับไปเป็นคลังความรู้ของตนเอง</p>
                </div>
              </div>
            </section>

            <section>
              <h3>สถานะปัจจุบัน</h3>
              <p>โครงการอยู่ในระยะ <strong>Demo</strong> กำลังทดลองแนวทางการเรียนรู้ร่วมกับนักเรียนและผู้ปกครอง เพื่อพัฒนาแนวทางการสอนที่เหมาะสมที่สุดก่อนขยายต่อไป</p>
            </section>

            <section class="vision-section">
              <p class="vision">
                เราไม่ได้สร้าง AI ที่ทำการบ้านแทนเด็ก<br>
                เราอยากสร้าง AI ที่ช่วยให้เด็กเรียนรู้ได้ด้วยตัวเองมากขึ้นทุกวัน<br>
                และช่วยให้การเรียนรู้เป็นเรื่องที่สนุก เข้าใจง่าย และเข้าถึงได้สำหรับทุกคน
              </p>
              <p class="from">— จากโครงการเล็ก ๆ ในครอบครัว สู่เพื่อนร่วมเรียนรู้สำหรับนักเรียนทุกคน</p>
            </section>

          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .about-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 13px;
      background: rgba(255,255,255,0.15);
      color: white;
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      font-family: inherit;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .about-btn:hover { background: rgba(255,255,255,0.25); }

    /* Overlay */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      padding: 16px;
      backdrop-filter: blur(2px);
    }

    .modal {
      background: white;
      border-radius: 16px;
      max-width: 560px;
      width: 100%;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px 14px;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
    }

    .modal-title {
      font-size: 17px;
      font-weight: 700;
      color: #1e293b;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1;
      padding: 2px 6px;
      border-radius: 6px;
      transition: color 0.15s, background 0.15s;
    }
    .close-btn:hover { color: #1e293b; background: #f1f5f9; }

    .modal-body {
      overflow-y: auto;
      padding: 20px 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    section h2 {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
    }

    section h3 {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 8px;
    }

    section p {
      font-size: 14px;
      color: #475569;
      line-height: 1.7;
    }

    blockquote {
      border-left: 3px solid #2563eb;
      padding: 8px 14px;
      background: #eff6ff;
      border-radius: 0 8px 8px 0;
      font-size: 14px;
      color: #1e40af;
      font-style: italic;
      margin-top: 10px;
    }

    ul {
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    ul li {
      font-size: 13.5px;
      color: #475569;
      line-height: 1.5;
    }

    /* Tagline */
    .tagline-section {
      background: linear-gradient(135deg, #1e40af, #2563eb);
      border-radius: 12px;
      padding: 16px 20px;
      text-align: center;
    }
    .tagline {
      font-size: 18px;
      font-weight: 700;
      color: white !important;
      margin-bottom: 6px;
    }
    .tagline-sub {
      font-size: 13px;
      color: rgba(255,255,255,0.85) !important;
      line-height: 1.6;
    }

    /* Principles */
    .principles {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .principle-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .principle-icon { font-size: 22px; flex-shrink: 0; line-height: 1.3; }
    .principle-card strong {
      display: block;
      font-size: 13.5px;
      color: #1e293b;
      margin-bottom: 3px;
    }
    .principle-card p {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }

    /* Vision */
    .vision-section {
      background: linear-gradient(135deg, #f0fdf4, #eff6ff);
      border-radius: 12px;
      padding: 16px 20px;
      text-align: center;
      border: 1px solid #bbf7d0;
    }
    .vision {
      font-size: 14px;
      color: #166534 !important;
      line-height: 1.9;
      font-weight: 500;
    }
    .from {
      font-size: 12.5px;
      color: #64748b !important;
      margin-top: 10px;
      font-style: italic;
    }

    /* Mobile */
    @media (max-width: 600px) {
      .about-btn span { display: none; }

      .overlay {
        align-items: flex-end;
        padding: 0;
      }
      .modal {
        border-radius: 20px 20px 0 0;
        max-width: 100%;
        max-height: 92vh;
        animation: slideUp 0.25s ease-out;
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      .modal-header { padding: 14px 18px 12px; }
      .modal-body   { padding: 16px 18px 32px; gap: 16px; }
    }
  `]
})
export class AboutComponent {
  protected visible = signal(false);

  open(): void   { this.visible.set(true);  }
  protected close(): void { this.visible.set(false); }

  protected onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.close();
    }
  }
}
