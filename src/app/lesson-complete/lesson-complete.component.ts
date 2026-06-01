import { Component, inject } from '@angular/core';
import { TutorService, SCENARIOS } from '../tutor.service';
import { OnboardingService } from '../onboarding/onboarding.service';

@Component({
  selector: 'app-lesson-complete',
  standalone: true,
  template: `
    <div class="complete-wrap">
      <div class="complete-card">

        <div class="complete-hero">
          <div class="hero-emoji">🎉</div>
          <h1 class="hero-title">เรียนจบบทเรียนแล้ว!</h1>
          <p class="hero-sub">{{ tutor.scenario().icon }} {{ tutor.scenario().title }}</p>
        </div>

        <!-- Section 1: วันนี้ได้เรียนรู้อะไร -->
        @if (tutor.reflection().length > 0) {
          <section class="section">
            <h2 class="section-title">🎉 วันนี้หนูได้เรียนรู้อะไร</h2>
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
            <pre class="section-text">{{ tutor.studentNote() }}</pre>
          </section>
        }

        <!-- Section 3: Feedback -->
        @if (tutor.studentFeedback()) {
          <section class="section">
            <h2 class="section-title">⭐ Feedback จาก AI Tutor</h2>
            <pre class="section-text">{{ tutor.studentFeedback() }}</pre>
          </section>
        }

        <!-- Section 4: ใช้ในชีวิตจริง -->
        @if (tutor.realWorldUses().length > 0) {
          <section class="section">
            <h2 class="section-title">💡 ใช้ในชีวิตจริง</h2>
            <ul class="check-list uses">
              @for (use of tutor.realWorldUses(); track use) {
                <li>{{ use }}</li>
              }
            </ul>
          </section>
        }

        <!-- Section 5: สรุปผู้ปกครอง -->
        @if (tutor.parentSummary()) {
          <section class="section parent-section">
            <h2 class="section-title">👨‍👩‍👧 สรุปสำหรับผู้ปกครอง</h2>
            <pre class="section-text">{{ tutor.parentSummary() }}</pre>
          </section>
        }

        <!-- CTA -->
        <div class="cta-row">
          <button class="cta-btn cta-next" (click)="nextLesson()">📚 เรียนบทถัดไป</button>
          <button class="cta-btn cta-review" (click)="reviewAgain()">🔁 ทบทวนอีกครั้ง</button>
          <button class="cta-btn cta-home" (click)="goHome()">🏠 กลับหน้าหลัก</button>
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
    .hero-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .hero-sub { font-size: 14px; opacity: 0.85; }

    .section {
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 10px;
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
    .check-list:not(.uses) li { padding-left: 4px; color: #166534; font-weight: 500; }

    .section-text {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 13.5px;
      line-height: 1.7;
      color: #374151;
    }

    .parent-section { background: #f0fdf4; }
    .parent-section .section-title { color: #14532d; }
    .parent-section .section-text { color: #166534; }

    .cta-row {
      display: flex;
      gap: 10px;
      padding: 18px 20px;
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
    }
    .cta-btn:hover { opacity: 0.85; }

    .cta-next   { background: #2563eb; color: white; }
    .cta-review { background: #f59e0b; color: white; }
    .cta-home   { background: #e2e8f0; color: #374151; }
  `]
})
export class LessonCompleteComponent {
  protected tutor       = inject(TutorService);
  protected onboarding  = inject(OnboardingService);

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
