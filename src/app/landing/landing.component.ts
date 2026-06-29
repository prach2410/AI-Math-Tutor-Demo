import { Component, output } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `
    <div class="landing">

      <!-- Hero -->
      <section class="hero">
        <div class="hero-inner">
          <span class="badge">🎓 เปิดให้ใช้งานฟรีเพื่อการศึกษา</span>
          <h1 class="hero-headline">
            AI ที่ช่วยทำการบ้านคณิตศาสตร์...<br>
            <span class="headline-accent">โดยสอนจนหนูเข้าใจ</span>
          </h1>
          <p class="hero-sub">
            ติดการบ้านคณิตศาสตร์อยู่ใช่ไหม?<br>
            ให้ AI ช่วยอธิบายทีละขั้น ไม่รีบเฉลย<br>
            ถามกลับเพื่อเช็กความเข้าใจ<br>
            และช่วยให้หนูทำโจทย์ได้ด้วยตัวเอง
          </p>
          <button class="cta-btn" (click)="onContinue()">เริ่มเรียนฟรี</button>
          <p class="cta-sub">ใช้ฟรี • ไม่ต้องสมัครสมาชิก • แค่ใส่ชื่อเล่นก็เริ่มเรียนได้</p>
        </div>
      </section>

      <!-- Educational Mission -->
      <section class="mission">
        <div class="section-inner">
          <h2 class="section-title">🎓 สร้างขึ้นเพื่อการศึกษา เปิดให้ใช้งานฟรี</h2>
          <p class="mission-body">
            AI Math Tutor เป็นโครงการที่พัฒนาขึ้น<br>
            เพื่อช่วยให้นักเรียนไทยเข้าใจคณิตศาสตร์มากขึ้น
          </p>
          <p class="mission-body">
            เราเชื่อว่าเด็กทุกคนควรมีโอกาสเข้าถึงผู้ช่วยการเรียนรู้ที่ดี<br>
            ไม่ว่าจะมีติวเตอร์หรือไม่
          </p>
          <p class="mission-body">
            จึงเปิดให้ใช้งานฟรี เพื่อให้นักเรียน ผู้ปกครอง และครู<br>
            ร่วมทดลอง พร้อมส่งข้อเสนอแนะ เพื่อพัฒนาระบบให้ดียิ่งขึ้น
          </p>
          <div class="highlight-cards">
            <div class="h-card">🎓<br>ฟรีเพื่อการศึกษา</div>
            <div class="h-card">🚀<br>เริ่มเรียนได้ทันที</div>
            <div class="h-card">👤<br>ไม่ต้องสมัครสมาชิก</div>
            <div class="h-card">❤️<br>พัฒนาร่วมกับผู้ใช้จริง</div>
          </div>
          <div class="beta-notice">
            <strong>ระบบอยู่ในช่วงพัฒนา (Beta)</strong><br>
            ความคิดเห็นของทุกคนจะช่วยให้ AI Tutor สอนนักเรียนไทยได้ดียิ่งขึ้น
          </div>
        </div>
      </section>

      <!-- Teach Not Answer -->
      <section class="teach-section">
        <div class="section-inner">
          <h2 class="section-title">ไม่ใช่ AI ที่บอกคำตอบแล้วจบ</h2>
          <p class="teach-body">
            เป้าหมายของ AI Tutor ไม่ใช่การทำการบ้านแทนนักเรียน<br>
            แต่คือการช่วยให้นักเรียนเข้าใจวิธีคิด<br>
            และสามารถทำข้อถัดไปได้ด้วยตัวเอง
          </p>
          <div class="compare-table">
            <div class="compare-row compare-header">
              <div class="compare-cell">AI ทั่วไป</div>
              <div class="compare-cell accent">AI Math Tutor</div>
            </div>
            <div class="compare-row">
              <div class="compare-cell">รีบเฉลย</div>
              <div class="compare-cell accent">พาคิดทีละขั้น</div>
            </div>
            <div class="compare-row">
              <div class="compare-cell">ตอบจบเป็นข้อ</div>
              <div class="compare-cell accent">ถามกลับเพื่อเช็กความเข้าใจ</div>
            </div>
            <div class="compare-row">
              <div class="compare-cell">ไม่รู้พื้นฐาน</div>
              <div class="compare-cell accent">วิเคราะห์จุดอ่อน</div>
            </div>
            <div class="compare-row">
              <div class="compare-cell">ช่วยให้ได้คำตอบ</div>
              <div class="compare-cell accent">ช่วยให้เข้าใจ</div>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="how-section">
        <div class="section-inner">
          <h2 class="section-title">เริ่มเรียนง่าย ๆ ใน 3 ขั้นตอน</h2>
          <div class="steps">
            <div class="step">
              <div class="step-num">1</div>
              <div class="step-text">
                <strong>ใส่ชื่อเล่น</strong><br>
                <span>ไม่ต้องสมัครสมาชิก</span>
              </div>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <div class="step-text">
                <strong>ถ่ายรูปหรือพิมพ์โจทย์ที่ติด</strong><br>
                <span>AI จะอ่านและช่วยวิเคราะห์ให้</span>
              </div>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <div class="step-text">
                <strong>เรียนกับ AI Tutor</strong><br>
                <span>AI จะสอน ถาม ตรวจความเข้าใจ และสรุปสิ่งที่ควรฝึกต่อ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Parent Section -->
      <section class="parent-section">
        <div class="section-inner">
          <h2 class="section-title">สำหรับผู้ปกครอง</h2>
          <p class="teach-body">
            AI Tutor ไม่ได้ทำการบ้านแทนเด็ก<br>
            แต่ช่วยให้เด็กเข้าใจโจทย์ ฝึกคิดอย่างเป็นขั้นตอน<br>
            และสร้างความมั่นใจในการเรียนคณิตศาสตร์
          </p>
          <ul class="parent-bullets">
            <li>✅ ลดความกลัวคณิตศาสตร์</li>
            <li>✅ ถามซ้ำได้ไม่จำกัด</li>
            <li>✅ วิเคราะห์จุดอ่อน</li>
            <li>✅ เน้นความเข้าใจมากกว่าการจำ</li>
          </ul>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="final-cta">
        <div class="section-inner">
          <h2 class="final-cta-title">พร้อมเริ่มเรียนแล้วหรือยัง?</h2>
          <p class="final-cta-body">ใช้ฟรี • ไม่ต้องสมัครสมาชิก • เริ่มได้ภายใน 1 นาที</p>
          <button class="cta-btn" (click)="onContinue()">เริ่มเรียนฟรี</button>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <p class="footer-title">AI Math Tutor</p>
        <p class="footer-body">โครงการเพื่อการศึกษา</p>
        <p class="footer-body">
          เราเชื่อว่าเด็กทุกคนควรมีโอกาสเข้าใจคณิตศาสตร์ ไม่ว่าจะมีติวเตอร์หรือไม่<br>
          AI ถูกสร้างขึ้นเพื่อช่วยการเรียนรู้ ไม่ใช่เพื่อแทนครู
        </p>
        <a class="footer-feedback" href="https://forms.gle/q9eV47ktwTvXhT2NA" target="_blank" rel="noopener">
          💬 ส่งข้อเสนอแนะให้ทีมพัฒนา
        </a>
      </footer>

    </div>
  `,
  styles: [`
    .landing {
      min-height: 100dvh;
      background: #f8fafc;
      font-family: inherit;
      color: #1e293b;
      overflow-y: auto;
    }

    /* ── Hero ── */
    .hero {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%);
      color: white;
      padding: 48px 24px 52px;
      text-align: center;
    }
    .hero-inner {
      max-width: 560px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
    }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.35);
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .hero-headline {
      font-size: 28px;
      font-weight: 800;
      line-height: 1.35;
      margin: 0;
    }
    .headline-accent {
      color: #bfdbfe;
    }
    .hero-sub {
      font-size: 15px;
      line-height: 1.8;
      opacity: 0.9;
      margin: 0;
    }
    .cta-btn {
      background: white;
      color: #1e3a8a;
      border: none;
      border-radius: 14px;
      padding: 16px 40px;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(0,0,0,0.25); }
    .cta-btn:active { transform: translateY(0) scale(0.97); }
    .cta-sub {
      font-size: 13px;
      opacity: 0.75;
      margin: -6px 0 0;
    }

    /* ── Shared section ── */
    .section-inner {
      max-width: 560px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
    }
    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      line-height: 1.4;
    }

    /* ── Mission ── */
    .mission {
      background: white;
      padding: 44px 24px;
    }
    .mission-body {
      font-size: 15px;
      line-height: 1.8;
      color: #334155;
      margin: 0;
    }
    .highlight-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      width: 100%;
      margin-top: 8px;
    }
    .h-card {
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      border-radius: 12px;
      padding: 16px 8px;
      font-size: 13px;
      font-weight: 600;
      color: #1e40af;
      text-align: center;
      line-height: 1.5;
    }
    .beta-notice {
      background: #fef9c3;
      border: 1px solid #fde047;
      border-radius: 10px;
      padding: 14px 20px;
      font-size: 13.5px;
      line-height: 1.7;
      color: #713f12;
      text-align: center;
      width: 100%;
      box-sizing: border-box;
    }

    /* ── Teach Not Answer ── */
    .teach-section {
      background: #f1f5f9;
      padding: 44px 24px;
    }
    .teach-body {
      font-size: 15px;
      line-height: 1.8;
      color: #334155;
      margin: 0;
    }
    .compare-table {
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      background: white;
    }
    .compare-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .compare-row + .compare-row {
      border-top: 1px solid #e2e8f0;
    }
    .compare-cell {
      padding: 12px 16px;
      font-size: 14px;
      color: #64748b;
      text-align: center;
    }
    .compare-header .compare-cell {
      font-weight: 700;
      font-size: 13px;
      background: #f8fafc;
      color: #475569;
      padding: 10px 16px;
    }
    .compare-cell.accent {
      color: #1e40af;
      font-weight: 600;
      background: #eff6ff;
    }
    .compare-header .compare-cell.accent {
      background: #dbeafe;
    }

    /* ── How It Works ── */
    .how-section {
      background: white;
      padding: 44px 24px;
    }
    .steps {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .step {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      text-align: left;
    }
    .step-num {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #1e40af;
      color: white;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-text {
      font-size: 14px;
      line-height: 1.7;
      color: #334155;
    }
    .step-text strong {
      font-size: 15px;
      color: #0f172a;
    }

    /* ── Parent ── */
    .parent-section {
      background: #f0fdf4;
      padding: 44px 24px;
    }
    .parent-bullets {
      list-style: none;
      padding: 0;
      margin: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .parent-bullets li {
      font-size: 15px;
      color: #166534;
      background: white;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 12px 18px;
      text-align: left;
    }

    /* ── Final CTA ── */
    .final-cta {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      padding: 52px 24px;
      color: white;
      text-align: center;
    }
    .final-cta .section-inner { gap: 14px; }
    .final-cta-title {
      font-size: 22px;
      font-weight: 800;
      margin: 0;
      color: white;
    }
    .final-cta-body {
      font-size: 14px;
      opacity: 0.85;
      margin: 0;
    }

    /* ── Footer ── */
    .footer {
      background: #0f172a;
      color: rgba(255,255,255,0.65);
      padding: 32px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }
    .footer-title {
      font-size: 16px;
      font-weight: 700;
      color: rgba(255,255,255,0.9);
      margin: 0;
    }
    .footer-body {
      font-size: 13px;
      line-height: 1.7;
      margin: 0;
    }
    .footer-feedback {
      font-size: 13px;
      color: #93c5fd;
      text-decoration: none;
      margin-top: 8px;
    }
    .footer-feedback:hover { color: #bfdbfe; }

    /* ── Mobile ── */
    @media (max-width: 640px) {
      .hero { padding: 36px 20px 40px; }
      .hero-headline { font-size: 22px; }
      .hero-sub { font-size: 14px; }
      .cta-btn { padding: 14px 32px; font-size: 16px; }
      .section-title { font-size: 18px; }
      .mission, .teach-section, .how-section, .parent-section { padding: 36px 20px; }
      .highlight-cards {
        grid-template-columns: repeat(2, 1fr);
      }
      .compare-cell { padding: 10px 10px; font-size: 13px; }
      .final-cta { padding: 40px 20px; }
      .final-cta-title { font-size: 19px; }
    }
  `]
})
export class LandingComponent {
  readonly continue = output<void>();

  protected onContinue(): void {
    this.continue.emit();
  }
}
