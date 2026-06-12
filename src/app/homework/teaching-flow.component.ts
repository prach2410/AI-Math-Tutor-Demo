import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HomeworkAnalysisResult } from './homework.service';
import { TeachingService, TeachingStep } from './teaching.service';

type FlowState = 'loading' | 'step' | 'done' | 'error';
type Verdict   = 'correct' | 'partial' | 'wrong' | null;

interface JudgeFeedback {
  verdict: Verdict;
  encouragement: string;
  reason: string;
  missing: string;
}

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

            <!-- Progress -->
            <div class="tf-progress">
              <span class="tf-step-label">ขั้นที่ {{ currentStep()?.step }} / {{ totalSteps() }}</span>
              <div class="tf-progress-bar">
                <div class="tf-progress-fill"
                  [style.width.%]="((currentStep()?.step ?? 1) / totalSteps()) * 100">
                </div>
              </div>
            </div>

            <!-- Question card -->
            <div class="tf-question-card">
              <p class="tf-question">{{ currentStep()?.guidingQuestion }}</p>
              @if (currentStep()?.conceptHint) {
                <p class="tf-concept-hint">💡 {{ currentStep()?.conceptHint }}</p>
              }
            </div>

            <!-- Judge feedback (after submitting answer) -->
            @if (judgeFeedback()) {
              <div class="tf-feedback" [class]="'tf-feedback--' + judgeFeedback()!.verdict">
                <p class="tf-feedback-encourage">{{ judgeFeedback()!.encouragement }}</p>
                @if (judgeFeedback()!.reason) {
                  <p class="tf-feedback-reason">{{ judgeFeedback()!.reason }}</p>
                }
                @if (judgeFeedback()!.missing) {
                  <p class="tf-feedback-missing">🔍 {{ judgeFeedback()!.missing }}</p>
                }
              </div>
            }

            <!-- Hint text (after requesting hint) -->
            @if (hintText()) {
              <div class="tf-hint-response">
                <span class="tf-hint-badge">{{ hintBadge() }}</span>
                <p class="tf-hint-text">{{ hintText() }}</p>
              </div>
            }

            <!-- Hint ladder (shown after wrong/partial answer) -->
            @if (showHintLadder()) {
              <div class="tf-hint-ladder">
                <p class="tf-hint-ladder-label">ต้องการความช่วยเหลือ?</p>
                <div class="tf-hint-btns">
                  <button class="tf-hint-btn"
                    [disabled]="hintLoading()"
                    (click)="requestHint(1)"
                    title="ใบ้สั้นๆ ชี้ทิศ">
                    💡 Hint
                  </button>
                  <button class="tf-hint-btn"
                    [disabled]="hintLoading()"
                    (click)="requestHint(2)"
                    title="ทำก้าวแรกให้ดูเป็นตัวอย่าง">
                    🆘 ช่วยเริ่ม
                  </button>
                  <button class="tf-hint-btn"
                    [disabled]="hintLoading()"
                    (click)="requestHint(3)"
                    title="ยกตัวอย่างโจทย์คล้ายกัน">
                    👀 ตัวอย่าง
                  </button>
                  <button class="tf-hint-btn tf-hint-btn--solution"
                    [disabled]="hintLoading()"
                    (click)="requestHintWithConfirm(4)"
                    title="เฉลยขั้นนี้ (ทางเลือกสุดท้าย)">
                    📖 เฉลย
                  </button>
                </div>
                @if (hintLoading()) {
                  <p class="tf-hint-loading">กำลังโหลด...</p>
                }
              </div>
            }

            <!-- Answer input -->
            <div class="tf-input-row">
              <textarea
                class="tf-input"
                [(ngModel)]="answer"
                placeholder="พิมพ์คำตอบของคุณที่นี่..."
                rows="3"
                [disabled]="submitting() || hintLoading()"
                (keydown.control.enter)="submit()"
              ></textarea>
              <button
                class="tf-submit"
                (click)="submit()"
                [disabled]="submitting() || hintLoading() || !answer.trim()">
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
      display: flex; flex-direction: column; align-items: center;
      gap: 12px; padding: 40px 20px;
    }
    .spinner {
      width: 32px; height: 32px;
      border: 3px solid #e2e8f0; border-top-color: #2563eb;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .tf-loading-text { font-size: 15px; color: #64748b; margin: 0; }

    /* Progress */
    .tf-step { display: flex; flex-direction: column; gap: 0; width: 100%; }
    .tf-progress { display: flex; flex-direction: column; gap: 6px; width: 100%; }
    .tf-step-label { font-size: 12px; font-weight: 600; color: #64748b; }
    .tf-progress-bar { height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
    .tf-progress-fill { height: 100%; background: #2563eb; border-radius: 99px; transition: width 0.4s ease; }

    /* Question card */
    .tf-question-card {
      background: white; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 16px; margin-top: 12px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .tf-question { font-size: 16px; color: #1e293b; margin: 0; line-height: 1.65; font-weight: 500; }
    .tf-concept-hint { font-size: 13px; color: #94a3b8; margin: 0; }

    /* Judge feedback */
    .tf-feedback {
      border-radius: 10px; padding: 12px 14px; margin-top: 10px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .tf-feedback--correct  { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .tf-feedback--partial  { background: #fffbeb; border: 1px solid #fde68a; }
    .tf-feedback--wrong    { background: #fff1f2; border: 1px solid #fecdd3; }

    .tf-feedback-encourage { font-size: 14px; font-weight: 600; margin: 0; }
    .tf-feedback--correct  .tf-feedback-encourage { color: #15803d; }
    .tf-feedback--partial  .tf-feedback-encourage { color: #92400e; }
    .tf-feedback--wrong    .tf-feedback-encourage { color: #9f1239; }

    .tf-feedback-reason  { font-size: 13px; color: #475569; margin: 0; }
    .tf-feedback-missing { font-size: 13px; color: #b45309; margin: 0; }

    /* Hint response */
    .tf-hint-response {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 12px 14px; margin-top: 10px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .tf-hint-badge {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      color: #6366f1; background: #ede9fe; border-radius: 4px;
      padding: 2px 8px; width: fit-content;
    }
    .tf-hint-text { font-size: 14px; color: #1e293b; margin: 0; line-height: 1.65; white-space: pre-wrap; }

    /* Hint ladder */
    .tf-hint-ladder { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
    .tf-hint-ladder-label { font-size: 12px; color: #64748b; font-weight: 600; margin: 0; }
    .tf-hint-btns { display: flex; gap: 6px; flex-wrap: wrap; }
    .tf-hint-btn {
      padding: 7px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
      background: white; font-size: 13px; font-family: inherit;
      cursor: pointer; color: #334155; font-weight: 500;
      transition: background 0.12s, border-color 0.12s;
    }
    .tf-hint-btn:hover:not(:disabled) { background: #f1f5f9; border-color: #cbd5e1; }
    .tf-hint-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .tf-hint-btn--solution { border-color: #fca5a5; color: #9f1239; }
    .tf-hint-btn--solution:hover:not(:disabled) { background: #fff1f2; }
    .tf-hint-loading { font-size: 13px; color: #64748b; margin: 0; }

    /* Input */
    .tf-input-row { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
    .tf-input {
      width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 10px;
      font-size: 15px; font-family: inherit; resize: vertical; box-sizing: border-box;
      outline: none; transition: border-color 0.15s; color: #1e293b;
    }
    .tf-input:focus { border-color: #2563eb; }
    .tf-input:disabled { background: #f8fafc; color: #94a3b8; }

    .tf-submit {
      padding: 12px; background: #2563eb; color: white; border: none;
      border-radius: 10px; font-size: 15px; font-weight: 600; font-family: inherit;
      cursor: pointer; transition: opacity 0.15s, transform 0.1s;
    }
    .tf-submit:hover:not(:disabled) { opacity: 0.9; }
    .tf-submit:active { transform: scale(0.97); }
    .tf-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Done */
    .tf-done {
      display: flex; flex-direction: column; align-items: center;
      gap: 14px; text-align: center; padding: 12px 0; width: 100%;
    }
    .tf-done-icon { font-size: 56px; line-height: 1; }
    .tf-done-heading { font-size: 20px; font-weight: 700; color: #15803d; margin: 0; }
    .tf-problem-recap {
      background: white; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 14px; width: 100%; text-align: left;
    }
    .tf-recap-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; margin: 0 0 4px; }
    .tf-recap-text  { font-size: 14px; color: #1e293b; margin: 0; line-height: 1.6; }

    /* Error */
    .tf-error {
      display: flex; flex-direction: column; align-items: center;
      gap: 10px; text-align: center; padding: 20px 0;
    }
    .tf-error-icon { font-size: 32px; }
    .tf-error-msg  { font-size: 15px; color: #9a3412; margin: 0; }

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

  protected state         = signal<FlowState>('loading');
  protected currentStep   = signal<TeachingStep | null>(null);
  protected totalSteps    = signal(0);
  protected judgeFeedback = signal<JudgeFeedback | null>(null);
  protected hintText      = signal('');
  protected hintBadge     = signal('');
  protected hintLoading   = signal(false);
  protected errorMsg      = signal('');
  protected submitting    = signal(false);

  protected answer = '';
  private sessionId = '';

  protected showHintLadder(): boolean {
    const v = this.judgeFeedback()?.verdict;
    return v === 'partial' || v === 'wrong';
  }

  ngOnInit(): void { this.loadSession(); }

  protected async loadSession(): Promise<void> {
    this.state.set('loading');
    this.judgeFeedback.set(null);
    this.hintText.set('');
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
    this.hintText.set('');
    this.judgeFeedback.set(null);
    try {
      const res = await this.teaching.answer(this.sessionId, this.answer.trim());
      this.answer = '';

      this.judgeFeedback.set({
        verdict:      res.verdict,
        encouragement: res.encouragement,
        reason:       res.reason,
        missing:      res.missing,
      });

      if (res.done) {
        this.state.set('done');
        return;
      }

      // correct + nextStep → ไปขั้นถัดไป
      if (res.verdict === 'correct' && res.nextStep) {
        this.currentStep.set(res.nextStep);
        // เคลียร์ feedback เมื่อขยับขั้นใหม่ (ตอบถูกแล้วไม่ต้องเห็นซ้ำ)
        setTimeout(() => this.judgeFeedback.set(null), 1200);
      }
      // partial/wrong → อยู่ขั้นเดิม แสดง feedback + hint ladder
    } catch {
      this.judgeFeedback.set({
        verdict: 'wrong',
        encouragement: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
        reason: '', missing: '',
      });
    } finally {
      this.submitting.set(false);
    }
  }

  protected async requestHint(level: number): Promise<void> {
    if (this.hintLoading()) return;
    this.hintLoading.set(true);
    this.hintText.set('');
    try {
      const res = await this.teaching.hint(this.sessionId, level);
      const badges: Record<number, string> = {
        1: '💡 Hint',
        2: '🆘 ช่วยเริ่ม',
        3: '👀 ตัวอย่าง',
        4: '📖 เฉลย',
      };
      this.hintBadge.set(badges[res.level] ?? '💡');
      this.hintText.set(res.help);
    } catch {
      this.hintText.set('ไม่สามารถโหลดความช่วยเหลือได้ กรุณาลองใหม่');
    } finally {
      this.hintLoading.set(false);
    }
  }

  protected requestHintWithConfirm(level: number): void {
    if (level === 4 && !confirm('ดูเฉลยขั้นนี้เลยไหม?\n(ลองคิดด้วยตัวเองก่อนดีกว่านะ 😊)')) return;
    this.requestHint(level);
  }

  protected restart(): void { this.onRestart?.(); }
}
