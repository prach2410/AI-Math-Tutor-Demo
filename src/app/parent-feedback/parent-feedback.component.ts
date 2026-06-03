import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TutorService } from '../tutor.service';

interface FeedbackForm {
  understandingLevel: string;
  mostValuableSection: string;
  comment: string;
}

@Component({
  selector: 'app-parent-feedback',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (submitted()) {
      <div class="thank-you">
        <span class="thank-icon">✅</span>
        <p class="thank-text">ขอบคุณสำหรับความคิดเห็นครับ</p>
        <p class="thank-sub">ข้อมูลของคุณจะช่วยพัฒนา AI Tutor<br>ให้ช่วยนักเรียนได้ดียิ่งขึ้น</p>
      </div>
    } @else {
      <div class="feedback-form">
        <p class="form-title">💬 แบ่งปันความคิดเห็นสั้นๆ</p>

        <!-- Q1: Required -->
        <div class="question">
          <p class="question-text">สรุปนี้ช่วยให้คุณเข้าใจสิ่งที่ลูกเรียนมากขึ้นหรือไม่?
            <span class="required">*</span>
          </p>
          <div class="emoji-options">
            @for (opt of understandingOptions; track opt.value) {
              <button
                type="button"
                class="emoji-btn"
                [class.selected]="form.understandingLevel === opt.value"
                (click)="selectUnderstanding(opt.value)"
              >
                <span class="emoji">{{ opt.emoji }}</span>
                <span class="label">{{ opt.label }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Q2: Optional -->
        <div class="question">
          <p class="question-text">ส่วนไหนมีประโยชน์มากที่สุด?
            <span class="optional">(ไม่บังคับ)</span>
          </p>
          <div class="chip-options">
            @for (opt of valuableOptions; track opt.value) {
              <button
                type="button"
                class="chip-btn"
                [class.selected]="form.mostValuableSection === opt.value"
                (click)="toggleValuable(opt.value)"
              >
                {{ opt.label }}
              </button>
            }
          </div>
        </div>

        <!-- Q3: Optional -->
        <div class="question">
          <p class="question-text">มีอะไรที่อยากเห็นเพิ่มเติมไหม?
            <span class="optional">(ไม่บังคับ)</span>
          </p>
          <textarea
            class="comment-input"
            [(ngModel)]="form.comment"
            placeholder="พิมพ์ความคิดเห็นที่นี่..."
            rows="2"
            (focus)="onFeedbackStarted()"
          ></textarea>
        </div>

        <button
          class="submit-btn"
          type="button"
          [disabled]="!form.understandingLevel"
          (click)="submit()"
        >
          ส่ง Feedback
        </button>
      </div>
    }
  `,
  styles: [`
    .thank-you {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 16px;
      background: #f0fdf4;
      border-radius: 8px;
      margin-top: 12px;
      text-align: center;
    }
    .thank-icon { font-size: 22px; }
    .thank-text { font-size: 14px; font-weight: 600; color: #15803d; margin: 0; }
    .thank-sub  { font-size: 12px; color: #166534; margin: 0; line-height: 1.6; }

    .feedback-form {
      margin-top: 12px;
      padding: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 2px 0;
    }

    .question { display: flex; flex-direction: column; gap: 8px; }

    .question-text {
      font-size: 13px;
      color: #374151;
      margin: 0;
      line-height: 1.4;
    }

    .required { color: #dc2626; margin-left: 2px; }
    .optional  { font-size: 11px; color: #94a3b8; margin-left: 4px; }

    .emoji-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .emoji-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      background: white;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
      min-width: 68px;
    }
    .emoji-btn:hover { border-color: #86efac; background: #f0fdf4; }
    .emoji-btn.selected { border-color: #16a34a; background: #dcfce7; }

    .emoji { font-size: 20px; line-height: 1; }
    .label { font-size: 11.5px; color: #374151; text-align: center; line-height: 1.3; }

    .chip-options {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .chip-btn {
      padding: 5px 10px;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      background: white;
      font-size: 12px;
      color: #374151;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }
    .chip-btn:hover   { border-color: #86efac; background: #f0fdf4; }
    .chip-btn.selected { border-color: #16a34a; background: #dcfce7; color: #15803d; font-weight: 600; }

    .comment-input {
      width: 100%;
      padding: 8px 10px;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-family: inherit;
      font-size: 13px;
      color: #374151;
      resize: vertical;
      box-sizing: border-box;
    }
    .comment-input:focus {
      outline: none;
      border-color: #86efac;
    }

    .submit-btn {
      align-self: flex-start;
      padding: 8px 20px;
      background: #16a34a;
      color: white;
      border: none;
      border-radius: 20px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .submit-btn:hover:not(:disabled) { opacity: 0.85; }
    .submit-btn:disabled { background: #cbd5e1; cursor: not-allowed; }
  `]
})
export class ParentFeedbackComponent {
  protected tutor = inject(TutorService);
  protected submitted = signal(false);
  private feedbackStartedLogged = false;

  protected form: FeedbackForm = {
    understandingLevel: '',
    mostValuableSection: '',
    comment: '',
  };

  protected understandingOptions = [
    { value: 'more_understanding',    emoji: '😊', label: 'เข้าใจมากขึ้น' },
    { value: 'somewhat_understanding',emoji: '😐', label: 'พอเข้าใจ' },
    { value: 'still_unclear',         emoji: '😕', label: 'ยังไม่ค่อยเข้าใจ' },
  ];

  protected valuableOptions = [
    { value: 'learning_outcomes',    label: 'สิ่งที่ลูกเรียนรู้' },
    { value: 'strengths',            label: 'จุดที่ลูกทำได้ดี' },
    { value: 'improvements',         label: 'สิ่งที่ควรฝึกเพิ่ม' },
    { value: 'real_world_connection', label: 'การเชื่อมโยงกับชีวิตจริง' },
    { value: 'all_sections',          label: 'ทั้งหมดมีประโยชน์' },
  ];

  protected selectUnderstanding(value: string): void {
    this.form.understandingLevel = value;
    this.onFeedbackStarted();
  }

  protected toggleValuable(value: string): void {
    this.form.mostValuableSection = this.form.mostValuableSection === value ? '' : value;
    this.onFeedbackStarted();
  }

  protected onFeedbackStarted(): void {
    if (!this.feedbackStartedLogged) {
      this.feedbackStartedLogged = true;
      this.tutor.logEvent('parent_feedback_started');
    }
  }

  protected submit(): void {
    if (!this.form.understandingLevel) return;
    this.submitted.set(true);
    this.tutor.submitParentFeedback({
      understandingLevel: this.form.understandingLevel,
      mostValuableSection: this.form.mostValuableSection || undefined,
      comment: this.form.comment || undefined,
    });
  }
}
