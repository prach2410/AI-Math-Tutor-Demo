import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HomeworkAnalysisResult } from './homework.service';
import { TeachingService, TeachingStep } from './teaching.service';

type FlowState = 'loading' | 'step' | 'done' | 'error';

@Component({
  selector: 'app-teaching-flow',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="tf-container">

      @switch (state()) {

        @case ('loading') {
          <div class="tf-loading">
            <div class="spinner"></div>
            <p class="tf-loading-text">AI กำลังวางแผนการสอน...</p>
          </div>
        }

        @case ('step') {
          <div class="tf-step">
            <div class="tf-progress">
              <span class="tf-step-label">ขั้นที่ {{ currentStep()?.step }} / {{ totalSteps() }}</span>
              <div class="tf-progress-bar">
                <div class="tf-progress-fill"
                  [style.width.%]="((currentStep()?.step ?? 1) / totalSteps()) * 100">
                </div>
              </div>
            </div>

            <div class="tf-question-card">
              <p class="tf-question">{{ currentStep()?.guidingQuestion }}</p>
              @if (currentStep()?.conceptHint) {
                <p class="tf-hint">💡 {{ currentStep()?.conceptHint }}</p>
              }
            </div>

            @if (feedback()) {
              <div class="tf-feedback">{{ feedback() }}</div>
            }

            <div class="tf-input-row">
              <textarea
                class="tf-input"
                [(ngModel)]="answer"
                placeholder="พิมพ์คำตอบของคุณที่นี่..."
                rows="3"
                [disabled]="submitting()"
                (keydown.control.enter)="submit()"
              ></textarea>
              <button
                class="tf-submit"
                (click)="submit()"
                [disabled]="submitting() || !answer.trim()">
                {{ submitting() ? '...' : 'ส่งคำตอบ' }}
              </button>
            </div>
          </div>
        }

        @case ('done') {
          <div class="tf-done">
            <div class="tf-done-icon">🎉</div>
            <p class="tf-done-heading">เยี่ยมมาก! ทำโจทย์เสร็จแล้ว!</p>
            <div class="tf-problem-recap">
              <p class="tf-recap-label">โจทย์</p>
              <p class="tf-recap-text">{{ problem.problemText }}</p>
            </div>
            <button class="tf-btn-secondary" (click)="restart()">เลือกโจทย์ใหม่</button>
          </div>
        }

        @case ('error') {
          <div class="tf-error">
            <p class="tf-error-icon">⚠️</p>
            <p class="tf-error-msg">{{ errorMsg() }}</p>
            <button class="tf-btn-primary" (click)="loadSession()">ลองใหม่</button>
          </div>
        }

      }

    </div>
  `,
  styles: [`
    .tf-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 480px;
    }

    /* Loading */
    .tf-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px 20px;
    }
    .spinner {
      width: 32px; height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .tf-loading-text { font-size: 15px; color: #64748b; margin: 0; }

    /* Progress */
    .tf-progress { display: flex; flex-direction: column; gap: 6px; width: 100%; }
    .tf-step-label { font-size: 12px; font-weight: 600; color: #64748b; }
    .tf-progress-bar { height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
    .tf-progress-fill { height: 100%; background: #2563eb; border-radius: 99px; transition: width 0.3s ease; }

    /* Question card */
    .tf-question-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tf-question { font-size: 16px; color: #1e293b; margin: 0; line-height: 1.65; font-weight: 500; }
    .tf-hint { font-size: 13px; color: #64748b; margin: 0; }

    /* Feedback */
    .tf-feedback {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 14px;
      color: #15803d;
      margin-top: 8px;
    }

    /* Input */
    .tf-step { display: flex; flex-direction: column; gap: 0; width: 100%; }
    .tf-input-row { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
    .tf-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 15px;
      font-family: inherit;
      resize: vertical;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.15s;
      color: #1e293b;
    }
    .tf-input:focus { border-color: #2563eb; }
    .tf-input:disabled { background: #f8fafc; color: #94a3b8; }

    .tf-submit {
      padding: 12px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }
    .tf-submit:hover:not(:disabled) { opacity: 0.9; }
    .tf-submit:active { transform: scale(0.97); }
    .tf-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Done */
    .tf-done {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      text-align: center;
      padding: 12px 0;
      width: 100%;
    }
    .tf-done-icon { font-size: 56px; line-height: 1; }
    .tf-done-heading { font-size: 20px; font-weight: 700; color: #15803d; margin: 0; }
    .tf-problem-recap {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      width: 100%;
      text-align: left;
    }
    .tf-recap-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; margin: 0 0 4px; }
    .tf-recap-text  { font-size: 14px; color: #1e293b; margin: 0; line-height: 1.6; }

    /* Error */
    .tf-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      text-align: center;
      padding: 20px 0;
    }
    .tf-error-icon { font-size: 32px; }
    .tf-error-msg  { font-size: 15px; color: #9a3412; margin: 0; }

    /* Shared buttons */
    .tf-btn-primary {
      padding: 11px 24px; background: #2563eb; color: white;
      border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
      font-family: inherit; cursor: pointer;
    }
    .tf-btn-primary:hover { opacity: 0.9; }
    .tf-btn-secondary {
      padding: 11px 24px; background: #f1f5f9; color: #334155;
      border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 600;
      font-family: inherit; cursor: pointer;
    }
    .tf-btn-secondary:hover { background: #e2e8f0; }
  `]
})
export class TeachingFlowComponent implements OnInit {
  @Input({ required: true }) problem!: HomeworkAnalysisResult;
  @Input() onRestart?: () => void;

  private teaching = inject(TeachingService);

  protected state       = signal<FlowState>('loading');
  protected currentStep = signal<TeachingStep | null>(null);
  protected totalSteps  = signal(0);
  protected feedback    = signal('');
  protected errorMsg    = signal('');
  protected submitting  = signal(false);

  protected answer = '';
  private sessionId = '';

  ngOnInit(): void {
    this.loadSession();
  }

  protected async loadSession(): Promise<void> {
    this.state.set('loading');
    this.feedback.set('');
    try {
      const res = await this.teaching.start(
        this.problem.problemText,
        this.problem.latex,
        this.problem.topic,
        false  // hasFigure — Confirm Step ทำใน S2c
      );
      this.sessionId = res.sessionId;
      this.currentStep.set(res.currentStep);
      this.totalSteps.set(res.totalSteps);
      this.state.set('step');
    } catch {
      this.errorMsg.set('ไม่สามารถเริ่มการสอนได้ กรุณาลองใหม่');
      this.state.set('error');
    }
  }

  protected async submit(): Promise<void> {
    if (!this.answer.trim() || this.submitting()) return;

    this.submitting.set(true);
    this.feedback.set('');
    try {
      const res = await this.teaching.answer(this.sessionId, this.answer.trim());
      this.answer = '';

      if (res.done) {
        this.state.set('done');
        return;
      }

      this.feedback.set(res.encouragement);
      if (res.nextStep) {
        this.currentStep.set(res.nextStep);
      }
    } catch {
      this.feedback.set('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      this.submitting.set(false);
    }
  }

  protected restart(): void {
    this.onRestart?.();
  }
}
