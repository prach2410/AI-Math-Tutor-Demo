import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProblemItem } from './homework.service';
import { TeachingService, TeachingStep, NotesResponse, ConfirmFigureResponse } from './teaching.service';

type FlowState = 'recall' | 'mode-select' | 'loading' | 'confirm' | 'step' | 'done' | 'solve' | 'error';
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

        @case ('recall') {
          <div class="tf-recall">
            <div class="tf-recall-card">
              <p class="tf-recall-heading">🔄 ทบทวนสั้นๆ ก่อนเริ่มการบ้านวันนี้</p>
              <p class="tf-recall-question">{{ recallQuestion() }}</p>
            </div>

            @if (!recallFeedback()) {
              <textarea
                class="tf-input"
                [(ngModel)]="recallAnswerText"
                placeholder="ลองตอบสั้นๆ (หรือกดข้ามไปเริ่มการบ้านได้เลย)"
                rows="2"
                [disabled]="recallSubmitting()">
              </textarea>
              <button
                class="tf-submit"
                (click)="submitRecall()"
                [disabled]="recallSubmitting() || !recallAnswerText.trim()">
                {{ recallSubmitting() ? 'กำลังส่ง...' : 'ตอบ' }}
              </button>
              <button class="tf-btn-secondary" (click)="startAfterRecall()">ข้ามไปเริ่มการบ้าน</button>
            } @else {
              <div class="tf-recall-feedback">{{ recallFeedback() }}</div>
              <button class="tf-submit" (click)="startAfterRecall()">เริ่มการบ้านวันนี้ →</button>
            }
          </div>
        }

        @case ('mode-select') {
          <div class="tf-mode-select">
            <!-- Problem card -->
            <div class="tf-problem-banner">
              <p class="tf-problem-banner-label">โจทย์ข้อที่ {{ problem.index }}</p>
              <p class="tf-problem-banner-text">{{ problem.problemText }}</p>
              @if (problem.latex) {
                <code class="tf-problem-banner-latex">{{ problem.latex }}</code>
              }
            </div>

            <p class="tf-mode-heading">เลือกวิธีเรียน</p>
            <div class="tf-mode-btns">
              <button class="tf-mode-btn tf-mode-btn--guide" (click)="selectGuideFirst()">
                <span class="tf-mode-btn-icon">🧠</span>
                <span class="tf-mode-btn-label">สอนให้คิดเอง</span>
                <span class="tf-mode-btn-desc">AI ถามทีละขั้น คิดหาคำตอบด้วยตัวเอง</span>
              </button>
              <button class="tf-mode-btn tf-mode-btn--solve" (click)="loadSolve()">
                <span class="tf-mode-btn-icon">💡</span>
                <span class="tf-mode-btn-label">ช่วยทำก่อน สอนทีหลัง</span>
                <span class="tf-mode-btn-desc">ดูวิธีทำเต็มก่อน แล้วค่อยทำความเข้าใจ</span>
              </button>
            </div>
          </div>
        }

        @case ('loading') {
          <div class="tf-loading">
            <div class="spinner"></div>
            <p class="tf-loading-text">{{ loadingText() }}</p>
            @if (solveLoading()) {
              <p class="tf-loading-tip">{{ tips[tipIndex()] }}</p>
            }
          </div>
        }

        @case ('confirm') {
          <div class="tf-confirm">
            <!-- Problem card -->
            <div class="tf-problem-banner">
              <p class="tf-problem-banner-label">โจทย์ข้อที่ {{ problem.index }}</p>
              <p class="tf-problem-banner-text">{{ problem.problemText }}</p>
              @if (problem.latex) {
                <code class="tf-problem-banner-latex">{{ problem.latex }}</code>
              }
            </div>

            <div class="tf-confirm-card">
              <p class="tf-confirm-heading">🔍 AI เข้าใจรูปว่า...</p>
              <p class="tf-confirm-desc">{{ figureDescription() }}</p>
            </div>

            <div class="tf-confirm-input-group">
              <label class="tf-confirm-label">มีอะไรที่ต่างจากรูปจริงบ้างไหม? (ถ้าไม่มี กดยืนยันได้เลย)</label>
              <textarea
                class="tf-input"
                [(ngModel)]="studentNote"
                placeholder="เช่น มุมฉากอยู่ที่มุม C ด้านที่ต้องหาคือ AB"
                rows="2"
                [disabled]="confirming()">
              </textarea>
            </div>

            <button
              class="tf-submit"
              (click)="confirmFigure()"
              [disabled]="confirming()">
              {{ confirming() ? 'กำลังโหลด...' : '✅ ยืนยัน เริ่มเรียน' }}
            </button>
          </div>
        }

        @case ('step') {
          <div class="tf-step">

            <!-- Problem card — stays visible throughout all steps -->
            <div class="tf-problem-banner">
              <p class="tf-problem-banner-label">โจทย์ข้อที่ {{ problem.index }}</p>
              <p class="tf-problem-banner-text">{{ problem.problemText }}</p>
              @if (problem.latex) {
                <code class="tf-problem-banner-latex">{{ problem.latex }}</code>
              }
            </div>

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
              <p class="tf-input-hint">
                💡 มีเลขยกกำลังในคำตอบ? พิมพ์แบบไหนก็ได้ — เช่น
                <b>n^12</b> · <b>n12</b> · <b>n ยกกำลัง 12</b>
              </p>
              <textarea
                class="tf-input"
                [(ngModel)]="answer"
                placeholder="พิมพ์คำตอบของคุณที่นี่... (เลขยกกำลังพิมพ์ n12 ก็ได้)"
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
            <p class="tf-done-heading">เยี่ยมมาก! ทำข้อ {{ problem.index }} เสร็จแล้ว!</p>
            <div class="tf-problem-recap">
              <p class="tf-recap-label">โจทย์ข้อที่ {{ problem.index }}</p>
              <p class="tf-recap-text">{{ problem.problemText }}</p>
            </div>

            <!-- Notes & Parent Summary -->
            @if (notesLoading()) {
              <div class="tf-notes-loading">
                <div class="spinner"></div>
                <p>กำลังสรุปสิ่งที่เรียน...</p>
              </div>
            } @else if (notes()) {
              <div class="tf-notes-card">
                <p class="tf-notes-label">📝 บันทึกของฉัน</p>
                <p class="tf-notes-text">{{ notes()!.studentNotes }}</p>
              </div>
              <div class="tf-summary-card">
                <p class="tf-notes-label">👨‍👩‍👧 สรุปสำหรับผู้ปกครอง</p>
                <p class="tf-notes-text">{{ notes()!.parentSummary }}</p>
              </div>
            }

            @if (hasNextProblem) {
              <button class="tf-btn-primary" (click)="goNextProblem()">ข้อต่อไป →</button>
            }
            <button class="tf-btn-secondary" (click)="restart()">เลือกโจทย์ใหม่</button>
          </div>
        }

        @case ('solve') {
          <div class="tf-solve">
            <!-- Problem card -->
            <div class="tf-problem-banner">
              <p class="tf-problem-banner-label">โจทย์ข้อที่ {{ problem.index }}</p>
              <p class="tf-problem-banner-text">{{ problem.problemText }}</p>
              @if (problem.latex) {
                <code class="tf-problem-banner-latex">{{ problem.latex }}</code>
              }
            </div>

            <!-- Solution steps -->
            <div class="tf-solve-section">
              <p class="tf-solve-section-label">📋 วิธีทำทีละขั้น</p>
              <ol class="tf-solve-steps">
                @for (step of solutionSteps(); track $index) {
                  <li class="tf-solve-step">
                    {{ step }}
                    @if (isKeyStep($index)) {
                      <div class="tf-explain-row">
                        <button class="tf-explain-btn" (click)="toggleExplain($index, step)">
                          {{ explainState()[$index]?.open ? '🔍 ซ่อน ▲' : '🔍 อธิบายเพิ่ม' }}
                        </button>
                      </div>
                      @if (explainState()[$index]?.loading) {
                        <p class="tf-explain-loading">กำลังอธิบาย...</p>
                      }
                      @if (explainState()[$index]?.open && explainState()[$index]?.text) {
                        <div class="tf-explain-card">{{ explainState()[$index]!.text }}</div>
                      }
                    }
                  </li>
                }
              </ol>
            </div>

            <!-- Understanding nudge -->
            @if (understandingStep()) {
              <div class="tf-understand-card">
                <p class="tf-understand-label">🤔 ก่อนไปต่อ ลองคิดดู...</p>
                <p class="tf-understand-text">{{ understandingStep() }}</p>
              </div>
            }

            <div class="tf-solve-actions">
              @if (hasNextProblem) {
                <button class="tf-btn-primary" (click)="goNextProblem()">ข้อต่อไป →</button>
              }
              <button class="tf-btn-secondary" (click)="restart()">เลือกโจทย์ใหม่</button>
            </div>
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

    /* Problem banner */
    .tf-problem-banner {
      background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px;
      padding: 12px 14px; margin-bottom: 12px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .tf-problem-banner-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.07em; color: #1e40af; margin: 0;
    }
    .tf-problem-banner-text {
      font-size: 15px; color: #1e293b; margin: 0; line-height: 1.65; font-weight: 500;
    }
    .tf-problem-banner-latex {
      font-size: 13px; color: #1d4ed8; background: #dbeafe;
      border-radius: 6px; padding: 4px 8px; font-family: monospace;
      word-break: break-all; display: block;
    }

    /* Confirm Step */
    .tf-confirm { display: flex; flex-direction: column; gap: 12px; width: 100%; }
    .tf-confirm-card {
      background: #fefce8; border: 1.5px solid #fde68a; border-radius: 12px;
      padding: 14px; display: flex; flex-direction: column; gap: 6px;
    }
    .tf-confirm-heading { font-size: 14px; font-weight: 700; color: #92400e; margin: 0; }
    .tf-confirm-desc    { font-size: 14px; color: #1e293b; margin: 0; line-height: 1.7; white-space: pre-wrap; }
    .tf-confirm-input-group { display: flex; flex-direction: column; gap: 6px; }
    .tf-confirm-label { font-size: 13px; color: #475569; font-weight: 500; }

    /* Recall (MVP1.5 session continuity) */
    .tf-recall { display: flex; flex-direction: column; gap: 12px; width: 100%; }
    .tf-recall-card {
      background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px;
      padding: 14px; display: flex; flex-direction: column; gap: 6px;
    }
    .tf-recall-heading  { font-size: 13px; font-weight: 700; color: #1d4ed8; margin: 0; }
    .tf-recall-question { font-size: 15px; color: #1e293b; margin: 0; line-height: 1.7; }
    .tf-recall-feedback {
      background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;
      padding: 10px 12px; font-size: 14px; color: #166534; line-height: 1.7; white-space: pre-wrap;
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
    .tf-input-hint {
      margin: 0; padding: 8px 12px; background: #f0f9ff; border: 1px solid #e0f2fe;
      border-radius: 8px; font-size: 13px; color: #475569; line-height: 1.5;
    }
    .tf-input-hint b { color: #0369a1; font-weight: 600; }
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

    .tf-notes-loading {
      display: flex; align-items: center; gap: 10px;
      font-size: 13px; color: #64748b;
    }
    .tf-notes-loading .spinner { width: 18px; height: 18px; border-width: 2px; }
    .tf-notes-loading p { margin: 0; }

    .tf-notes-card, .tf-summary-card {
      background: white; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 14px; width: 100%; text-align: left;
    }
    .tf-notes-card   { border-left: 3px solid #2563eb; }
    .tf-summary-card { border-left: 3px solid #7c3aed; }
    .tf-notes-label  { font-size: 12px; font-weight: 700; color: #475569; margin: 0 0 6px; }
    .tf-notes-text   { font-size: 14px; color: #1e293b; margin: 0; line-height: 1.7; white-space: pre-wrap; }

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

    /* Mode select */
    .tf-mode-select { display: flex; flex-direction: column; gap: 14px; width: 100%; }
    .tf-mode-heading { font-size: 14px; font-weight: 600; color: #475569; margin: 0; text-align: center; }
    .tf-mode-btns { display: flex; flex-direction: column; gap: 10px; }
    .tf-mode-btn {
      display: flex; flex-direction: column; align-items: flex-start; gap: 3px;
      padding: 14px 16px; border-radius: 12px; border: 2px solid transparent;
      background: white; cursor: pointer; font-family: inherit; text-align: left;
      transition: border-color 0.15s, background 0.15s;
    }
    .tf-mode-btn--guide  { border-color: #bfdbfe; background: #eff6ff; }
    .tf-mode-btn--guide:hover  { border-color: #2563eb; background: #dbeafe; }
    .tf-mode-btn--solve  { border-color: #bbf7d0; background: #f0fdf4; }
    .tf-mode-btn--solve:hover  { border-color: #16a34a; background: #dcfce7; }
    .tf-mode-btn-icon  { font-size: 22px; line-height: 1; }
    .tf-mode-btn-label { font-size: 15px; font-weight: 700; color: #1e293b; }
    .tf-mode-btn-desc  { font-size: 12px; color: #64748b; line-height: 1.4; }

    /* Solve */
    .tf-loading-tip {
      font-size: 13px; color: #475569;
      max-width: 280px; text-align: center;
      line-height: 1.6; margin: 0;
    }

    .tf-solve { display: flex; flex-direction: column; gap: 14px; width: 100%; }
    .tf-solve-section {
      background: white; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 14px; display: flex; flex-direction: column; gap: 10px;
    }
    .tf-solve-section-label { font-size: 13px; font-weight: 700; color: #475569; margin: 0; }
    .tf-solve-steps { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
    .tf-solve-step { font-size: 14px; color: #1e293b; line-height: 1.65; white-space: pre-wrap; }
    .tf-understand-card {
      background: #fefce8; border: 1.5px solid #fde68a; border-radius: 12px;
      padding: 14px; display: flex; flex-direction: column; gap: 6px;
    }
    .tf-understand-label { font-size: 13px; font-weight: 700; color: #92400e; margin: 0; }
    .tf-understand-text  { font-size: 14px; color: #1e293b; margin: 0; line-height: 1.65; }
    .tf-solve-actions { display: flex; flex-direction: column; gap: 8px; }

    /* Explain per-step */
    .tf-explain-row { margin-top: 6px; }
    .tf-explain-btn {
      background: #eff6ff; border: 1px solid #bfdbfe;
      border-radius: 6px; padding: 4px 10px;
      cursor: pointer; font-size: 12px; font-family: inherit;
      color: #1d4ed8; font-weight: 500;
      transition: background 0.1s, border-color 0.1s;
    }
    .tf-explain-btn:hover { background: #dbeafe; border-color: #93c5fd; }
    .tf-explain-loading { font-size: 12px; color: #64748b; margin: 4px 0 0; }
    .tf-explain-card {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 10px 12px; margin-top: 6px;
      font-size: 13px; color: #1e293b; line-height: 1.65;
      white-space: pre-wrap;
    }
  `]
})
export class TeachingFlowComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) problem!: ProblemItem;
  @Input() onRestart?: () => void;
  @Input() onNextProblem?: () => void;
  @Input() hasNextProblem = false;
  @Input() visionModel = '';
  @Input() analysisStartedAt = '';
  @Input() analysisEndedAt = '';

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
  protected notes              = signal<NotesResponse | null>(null);
  protected notesLoading       = signal(false);
  protected figureDescription  = signal('');
  protected confirming         = signal(false);
  protected solutionSteps      = signal<string[]>([]);
  protected understandingStep  = signal('');
  protected solveLoading       = signal(false);
  protected loadingText        = signal('AI กำลังวางแผนการสอน...');
  protected explainState       = signal<Record<number, { loading: boolean; text: string; open: boolean }>>({});
  protected keyStepIndices     = signal<number[]>([]);

  protected answer       = '';
  protected studentNote  = '';
  private sessionId = '';

  // MVP1.5 session continuity — recall warm-up ก่อนเริ่มการบ้าน
  protected recallQuestion   = signal('');
  protected recallFeedback   = signal('');
  protected recallSubmitting = signal(false);
  protected recallAnswerText = '';
  private recallChecked = false;

  protected readonly tips = [
    '💡 บวกเลขทุกหลัก — ถ้าผลรวมหาร 3 ลงตัว เลขนั้นก็หาร 3 ลงตัว (729 → 7+2+9=18 ✓)',
    '💡 รากที่สาม: จับกลุ่มทีละ 3 ตัวเหมือนกัน แล้วดึงออกมาได้ 1 ตัว',
    '💡 จำไว้: 2³=8 · 3³=27 · 4³=64 · 5³=125 · 6³=216 · 7³=343 · 8³=512 · 9³=729',
    '💡 เลขคู่ → หาร 2 ได้เสมอ · เลขลงท้าย 0 หรือ 5 → หาร 5 ได้เสมอ',
    '💡 ∛−n = −(∛n) — รากที่สามของเลขลบมีคำตอบจริง (ต่างจากรากที่สอง)',
    '💡 ตรวจสอบคำตอบ: ถ้า ∛n = a → ลอง a×a×a ดูว่าได้ n ไหม',
    '💡 บวกเลขทุกหลัก — ถ้าหาร 9 ลงตัว เลขนั้นหาร 9 ลงตัวด้วย (1+2+6=9 → 126 ÷ 9 ✓)',
  ];
  protected tipIndex = signal(0);
  private tipInterval: ReturnType<typeof setInterval> | null = null;

  protected showHintLadder(): boolean {
    const v = this.judgeFeedback()?.verdict;
    return v === 'partial' || v === 'wrong';
  }

  ngOnInit(): void { this.maybeRecall(); }

  // เช็ค recall ครั้งเดียวตอนเปิด flow · ล้มเหลว/ไม่มี → เข้า mode-select ตามปกติ (fail-safe)
  private async maybeRecall(): Promise<void> {
    if (this.recallChecked) { this.state.set('mode-select'); return; }
    this.recallChecked = true;
    try {
      const res = await this.teaching.recall(this.problem.topic);
      if (res.show && res.recallQuestion) {
        this.recallQuestion.set(res.recallQuestion);
        this.recallFeedback.set('');
        this.recallAnswerText = '';
        this.state.set('recall');
        return;
      }
    } catch { /* recall เป็น optional — ไม่บล็อกการบ้าน */ }
    this.state.set('mode-select');
  }

  protected async submitRecall(): Promise<void> {
    if (this.recallSubmitting()) return;
    this.recallSubmitting.set(true);
    try {
      const res = await this.teaching.recallAnswer(
        this.recallQuestion(), this.recallAnswerText, this.problem.topic);
      this.recallFeedback.set(res.feedback);
    } catch {
      this.recallFeedback.set('มาเริ่มการบ้านวันนี้กันเลย!');
    } finally {
      this.recallSubmitting.set(false);
    }
  }

  protected startAfterRecall(): void { this.state.set('mode-select'); }

  ngOnDestroy(): void {
    if (this.tipInterval) { clearInterval(this.tipInterval); this.tipInterval = null; }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['problem'] && !changes['problem'].firstChange) {
      this.answer = '';
      this.hintBadge.set('');
      this.hintText.set('');
      this.judgeFeedback.set(null);
      this.solutionSteps.set([]);
      this.understandingStep.set('');
      this.explainState.set({});
      this.keyStepIndices.set([]);
      this.state.set('mode-select');
    }
  }

  protected selectGuideFirst(): void {
    this.loadingText.set('AI กำลังวางแผนการสอน...');
    this.loadSession();
  }

  protected async loadSolve(): Promise<void> {
    if (this.solveLoading()) return;
    this.solveLoading.set(true);
    this.loadingText.set('AI กำลังเตรียมวิธีทำ...');
    this.tipIndex.set(0);
    this.state.set('loading');
    this.tipInterval = setInterval(() => {
      this.tipIndex.update(i => (i + 1) % this.tips.length);
    }, 10000);
    try {
      const res = await this.teaching.solve(
        this.problem.problemText,
        this.problem.latex,
        this.problem.topic,
        this.visionModel,
        this.analysisStartedAt,
        this.analysisEndedAt
      );
      this.sessionId = res.sessionId;
      this.solutionSteps.set(res.solutionSteps);
      this.understandingStep.set(res.understandingStep);
      this.keyStepIndices.set(res.keyStepIndices ?? []);
      this.state.set('solve');
    } catch {
      this.errorMsg.set('ไม่สามารถโหลดวิธีทำได้ กรุณาลองใหม่');
      this.state.set('error');
    } finally {
      this.solveLoading.set(false);
      if (this.tipInterval) { clearInterval(this.tipInterval); this.tipInterval = null; }
    }
  }

  protected async loadSession(): Promise<void> {
    this.state.set('loading');
    this.judgeFeedback.set(null);
    this.hintText.set('');
    this.notes.set(null);
    this.figureDescription.set('');
    this.studentNote = '';
    try {
      const res = await this.teaching.start(
        this.problem.problemText,
        this.problem.latex,
        this.problem.topic,
        this.problem.hasFigure,
        this.visionModel,
        this.analysisStartedAt,
        this.analysisEndedAt
      );
      this.sessionId = res.sessionId;

      if (res.needsConfirm) {
        this.figureDescription.set(res.figureDescription);
        this.state.set('confirm');
        return;
      }

      this.currentStep.set(res.currentStep);
      this.totalSteps.set(res.totalSteps);
      this.state.set('step');
    } catch {
      this.errorMsg.set('ไม่สามารถเริ่มการสอนได้ กรุณาลองใหม่');
      this.state.set('error');
    }
  }

  protected async confirmFigure(): Promise<void> {
    if (this.confirming()) return;
    this.confirming.set(true);
    try {
      const res = await this.teaching.confirmFigure(this.sessionId, this.studentNote.trim());
      this.currentStep.set(res.currentStep);
      this.totalSteps.set(res.totalSteps);
      this.state.set('step');
    } catch {
      this.errorMsg.set('ยืนยันรูปไม่สำเร็จ กรุณาลองใหม่');
      this.state.set('error');
    } finally {
      this.confirming.set(false);
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
        this.loadNotes();
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

  private async loadNotes(): Promise<void> {
    if (!this.sessionId) return;
    this.notesLoading.set(true);
    try {
      const res = await this.teaching.notes(this.sessionId);
      this.notes.set(res);
    } catch {
      // fail silently — notes are a nice-to-have
    } finally {
      this.notesLoading.set(false);
    }
  }

  protected isKeyStep(i: number): boolean {
    const keys = this.keyStepIndices();
    if (keys.length > 0) return keys.includes(i + 1);
    // fallback: โชว์เฉพาะขั้น "เทคนิคสังเกต" ถ้ามี ไม่อย่างนั้นโชว์ทุกขั้น
    const steps = this.solutionSteps();
    const hasTechnique = steps.some(s => s.startsWith('💡 เทคนิคสังเกต'));
    if (hasTechnique) return steps[i]?.startsWith('💡 เทคนิคสังเกต') ?? false;
    return true;
  }

  protected async toggleExplain(i: number, stepText: string): Promise<void> {
    const current = this.explainState()[i];
    if (current?.text) {
      this.explainState.update(s => ({ ...s, [i]: { ...s[i], open: !s[i].open } }));
      return;
    }
    this.explainState.update(s => ({ ...s, [i]: { loading: true, text: '', open: false } }));
    try {
      const fullSolution = this.solutionSteps().join('\n');
      const res = await this.teaching.explain(
        this.problem.problemText, this.problem.topic, stepText, fullSolution
      );
      this.explainState.update(s => ({ ...s, [i]: { loading: false, text: res.explanation, open: true } }));
    } catch {
      this.explainState.update(s => ({ ...s, [i]: { loading: false, text: 'ไม่สามารถอธิบายเพิ่มได้ กรุณาลองใหม่', open: true } }));
    }
  }

  protected restart(): void { this.onRestart?.(); }
  protected goNextProblem(): void { this.onNextProblem?.(); }
}
