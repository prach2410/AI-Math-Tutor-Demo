import { Component, inject, signal, computed } from '@angular/core';
import { TutorService, SCENARIOS } from '../tutor.service';
import { OnboardingService } from '../onboarding/onboarding.service';

const FEEDBACK_FORM_URL = 'https://forms.gle/31keQMXNtNk6YKF7A';

function cleanText(text: string): string {
  return text
    .replace(/ระดับ\s*:\s*กำลังพัฒนา/g, '🌱 กำลังเติบโต')
    .replace(/Keep Going!\s*🚀/gi, 'หนูทำได้ดีมากแล้ว 🚀')
    .replace(/Keep going!\s*🚀/gi, 'หนูทำได้ดีมากแล้ว 🚀');
}

@Component({
  selector: 'app-lesson-complete',
  standalone: true,
  template: `
    <div class="complete-wrap">
      <div class="complete-card">

        <!-- Hero / Celebration -->
        <div class="complete-hero">
          <div class="hero-emoji">🎉</div>
          <h1 class="hero-title">เยี่ยมมาก!</h1>
          <p class="hero-sub">หนูเรียนจบบทนี้แล้ว</p>
        </div>

        <!-- Section 1: วันนี้หนูได้เรียนรู้อะไร -->
        @if (tutor.reflection().length > 0) {
          <section class="section">
            <h2 class="section-title">📚 วันนี้หนูได้เรียนรู้อะไร</h2>
            <ul class="check-list">
              @for (item of tutor.reflection(); track item) {
                <li>✓ {{ item }}</li>
              }
            </ul>
          </section>
        }

        <!-- Section 2: บันทึกของหนู -->
        @if (tutor.studentNote()) {
          <section class="section">
            <h2 class="section-title">📒 บันทึกของหนู</h2>
            <pre class="section-text">{{ cleanedNote() }}</pre>
          </section>
        }

        <!-- Section 3: Feedback จาก AI Tutor -->
        @if (tutor.studentFeedback()) {
          <section class="section">
            <h2 class="section-title">⭐ Feedback จาก AI Tutor</h2>

            @if (goodPoints().length > 0) {
              <div class="feedback-block">
                <p class="feedback-label good-label">จุดที่หนูทำได้ดี</p>
                <ul class="check-list">
                  @for (item of goodPoints(); track item) {
                    <li>✓ {{ item }}</li>
                  }
                </ul>
              </div>
            }

            @if (nextPractice().length > 0) {
              <div class="feedback-block">
                <p class="feedback-label next-label">ครั้งหน้าลองฝึกเพิ่ม</p>
                <ul class="check-list growth">
                  @for (item of nextPractice(); track item) {
                    <li>🌱 {{ item }}</li>
                  }
                </ul>
              </div>
            }

            @if (goodPoints().length === 0 && nextPractice().length === 0) {
              <pre class="section-text">{{ cleanedFeedback() }}</pre>
            }
          </section>
        }

        <!-- Section 4: ใช้ในชีวิตจริง -->
        @if (tutor.realWorldUses().length > 0) {
          <section class="section">
            <h2 class="section-title">💡 ใช้ในชีวิตจริง</h2>
            <ul class="check-list uses">
              @for (use of tutor.realWorldUses(); track use) {
                <li>• {{ use }}</li>
              }
            </ul>
          </section>
        }

        <!-- Section 5: สรุปสำหรับผู้ปกครอง (Collapsible, default collapsed) -->
        @if (tutor.parentSummary()) {
          <section class="section parent-section">
            <button class="parent-toggle" (click)="toggleParent()">
              <span class="section-title parent-title">👨‍👩‍👧 สรุปสำหรับผู้ปกครอง</span>
              <span class="toggle-icon">{{ parentExpanded() ? '▲' : '▼' }}</span>
            </button>
            @if (parentExpanded()) {
              <pre class="section-text parent-text">{{ cleanedParentSummary() }}</pre>
            }
          </section>
        }

        <!-- CTA หลัก -->
        <div class="cta-row">
          <button class="cta-btn cta-next"   (click)="nextLesson()">📚 เรียนบทถัดไป</button>
          <button class="cta-btn cta-review" (click)="reviewAgain()">🔁 ทบทวนอีกครั้ง</button>
          <button class="cta-btn cta-home"   (click)="goHome()">🏠 กลับหน้าหลัก</button>
        </div>

        <!-- Feedback CTA -->
        <div class="feedback-cta">
          <p class="feedback-cta-title">💬 ช่วยพัฒนา AI Tutor</p>
          <p class="feedback-cta-desc">ความคิดเห็นของหนูมีค่ามาก<br>และจะช่วยให้ AI Tutor ช่วยนักเรียนคนอื่นได้ดีขึ้น</p>
          <a class="cta-btn cta-feedback" [href]="feedbackUrl" target="_blank" rel="noopener">
            💬 ส่งความคิดเห็น
          </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .complete-wrap {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .complete-wrap::-webkit-scrollbar { width: 6px; }
    .complete-wrap::-webkit-scrollbar-track { background: transparent; }
    .complete-wrap::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    .complete-wrap::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

    .complete-card {
      background: white;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      gap: 0;
      overflow: hidden;
    }

    .complete-hero {
      background: linear-gradient(135deg, #1e40af, #2563eb);
      padding: 28px 24px 20px;
      text-align: center;
      color: white;
    }
    .hero-emoji { font-size: 40px; line-height: 1; margin-bottom: 8px; }
    .hero-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .hero-sub   { font-size: 14px; opacity: 0.85; }

    .section {
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 10px;
      display: block;
    }

    .check-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .check-list li {
      font-size: 13.5px;
      color: #374151;
      line-height: 1.5;
    }
    .check-list:not(.uses):not(.growth) li {
      padding-left: 4px;
      color: #166534;
      font-weight: 500;
    }
    .check-list.growth li {
      padding-left: 4px;
      color: #92400e;
    }
    .check-list.uses li {
      padding-left: 4px;
      color: #374151;
    }

    .feedback-block {
      margin-bottom: 12px;
    }
    .feedback-block:last-child { margin-bottom: 0; }

    .feedback-label {
      font-size: 12.5px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .good-label  { color: #15803d; }
    .next-label  { color: #b45309; }

    .section-text {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 13.5px;
      line-height: 1.7;
      color: #374151;
    }

    /* Parent section collapsible */
    .parent-section {
      background: #f0fdf4;
      padding: 0;
    }

    .parent-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
      text-align: left;
      gap: 8px;
    }
    .parent-toggle:hover { background: #dcfce7; }

    .parent-title { color: #14532d; margin-bottom: 0; }

    .toggle-icon {
      font-size: 11px;
      color: #14532d;
      flex-shrink: 0;
    }

    .parent-text {
      padding: 0 20px 16px;
      color: #166534;
    }

    /* Main CTAs */
    .cta-row {
      display: flex;
      gap: 10px;
      padding: 18px 20px 12px;
      flex-wrap: wrap;
      background: #f8fafc;
    }

    .cta-btn {
      flex: 1;
      min-width: 120px;
      padding: 10px 14px;
      border: none;
      border-radius: 20px;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
      white-space: nowrap;
      text-align: center;
      text-decoration: none;
      display: inline-block;
    }
    .cta-btn:hover { opacity: 0.85; }

    .cta-next     { background: #2563eb; color: white; }
    .cta-review   { background: #f59e0b; color: white; }
    .cta-home     { background: #e2e8f0; color: #374151; }
    .cta-feedback { background: #7c3aed; color: white; }

    /* Feedback CTA section */
    .feedback-cta {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 14px 20px 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      text-align: center;
    }

    .feedback-cta-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #1e293b;
    }

    .feedback-cta-desc {
      font-size: 12.5px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 4px;
    }

    .feedback-cta .cta-feedback {
      flex: none;
      min-width: 160px;
    }
  `]
})
export class LessonCompleteComponent {
  protected tutor      = inject(TutorService);
  protected onboarding = inject(OnboardingService);

  protected parentExpanded = signal(false);
  protected feedbackUrl = FEEDBACK_FORM_URL;

  protected cleanedFeedback = computed(() => cleanText(this.tutor.studentFeedback()));
  protected cleanedNote     = computed(() => cleanText(this.tutor.studentNote()));
  protected cleanedParentSummary = computed(() => cleanText(this.tutor.parentSummary()));

  protected goodPoints = computed(() => {
    const raw = cleanText(this.tutor.studentFeedback());
    if (!raw) return [];
    return raw
      .split('\n')
      .filter(l => /^[✓✔]/.test(l.trim()))
      .map(l => l.replace(/^[✓✔]\s*/, '').trim())
      .filter(l => l.length > 0);
  });

  protected nextPractice = computed(() => {
    const raw = cleanText(this.tutor.studentFeedback());
    if (!raw) return [];
    return raw
      .split('\n')
      .filter(l => /^🌱/.test(l.trim()))
      .map(l => l.replace(/^🌱\s*/, '').trim())
      .filter(l => l.length > 0);
  });

  protected toggleParent(): void {
    this.parentExpanded.update(v => !v);
  }

  protected nextLesson(): void {
    const ids = SCENARIOS.map(s => s.id);
    const idx = ids.indexOf(this.tutor.scenario().id);
    const nextId = ids[(idx + 1) % ids.length];
    this.tutor.selectScenario(nextId);
  }

  protected reviewAgain(): void {
    this.tutor.selectScenario(this.tutor.scenario().id);
  }

  protected goHome(): void {
    this.onboarding.restart();
  }
}
