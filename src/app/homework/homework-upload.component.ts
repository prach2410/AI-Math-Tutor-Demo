import { Component, inject, signal, OnDestroy } from '@angular/core';
import { HomeworkService, HomeworkAnalysisResult } from './homework.service';
import { TutorService } from '../tutor.service';

type UploadState = 'idle' | 'analyzing' | 'result' | 'confirmed';

@Component({
  selector: 'app-homework-upload',
  standalone: true,
  template: `
    <div class="hw-container">
      <div class="hw-header">
        <button class="back-btn" (click)="tutor.exitHomeworkMode()">← กลับ</button>
        <h2 class="hw-title">📷 โจทย์การบ้าน</h2>
      </div>

      <div class="hw-body">
        @switch (state()) {
          @case ('idle') {
            <div class="upload-zone">
              <div class="upload-icon-big">📷</div>
              <p class="upload-heading">อัปโหลดโจทย์คณิตศาสตร์</p>
              <p class="upload-sub">AI จะอ่านโจทย์จากรูปภาพให้</p>
              <div class="upload-btns">
                <button class="btn btn-primary" (click)="cameraInput.click()">📷 ถ่ายรูป</button>
                <button class="btn btn-secondary" (click)="fileInput.click()">📁 เลือกไฟล์</button>
              </div>
              <input #cameraInput type="file" accept="image/*" capture="environment" hidden (change)="onFileSelected($event)" />
              <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelected($event)" />
            </div>
          }
          @case ('analyzing') {
            <div class="analyzing-zone">
              @if (imageUrl()) {
                <img class="preview-img" [src]="imageUrl()!" alt="ภาพโจทย์" />
              }
              <div class="spinner-wrapper">
                <div class="spinner"></div>
                <p class="analyzing-text">กำลังอ่านโจทย์...</p>
              </div>
            </div>
          }
          @case ('result') {
            <div class="result-zone">
              @if (imageUrl()) {
                <img class="preview-img" [src]="imageUrl()!" alt="ภาพโจทย์" />
              }
              @if (result()?.readable) {
                <div class="problem-card">
                  <p class="problem-label">โจทย์ที่อ่านได้</p>
                  <p class="problem-text">{{ result()?.problemText }}</p>
                  @if (result()?.latex) {
                    <div class="latex-box">
                      <span class="latex-label">สูตร:</span>
                      <code class="latex-text">{{ result()?.latex }}</code>
                    </div>
                  }
                  @if (result()?.topic) {
                    <span class="topic-chip">{{ result()?.topic }}</span>
                  }
                </div>
                <div class="confirm-row">
                  <button class="btn btn-confirm" (click)="confirmProblem()">✅ ใช่ โจทย์นี้เลย</button>
                  <button class="btn btn-retake" (click)="retake()">🔄 ถ่ายใหม่</button>
                </div>
              } @else {
                <div class="error-card">
                  <p class="error-icon-big">🔍</p>
                  <p class="error-msg">{{ result()?.message ?? 'อ่านโจทย์ไม่ออก' }}</p>
                </div>
                <button class="btn btn-primary" style="margin-top:8px" (click)="retake()">🔄 ถ่ายใหม่</button>
              }
            </div>
          }
          @case ('confirmed') {
            <div class="confirmed-zone">
              <p class="confirmed-icon-big">✅</p>
              <p class="confirmed-heading">ยืนยันโจทย์เรียบร้อย!</p>
              <div class="problem-card" style="width:100%">
                <p class="problem-text">{{ result()?.problemText }}</p>
                @if (result()?.topic) {
                  <span class="topic-chip">{{ result()?.topic }}</span>
                }
              </div>
              <p class="sprint-note">🚧 การสอนแบบ AI จะพร้อมใน Sprint ถัดไป</p>
              <button class="btn btn-secondary" (click)="retake()">เลือกโจทย์ใหม่</button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .hw-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-surface, #f8fafc);
      border-radius: var(--radius, 12px);
      overflow: hidden;
      box-shadow: var(--shadow, 0 1px 4px rgba(0,0,0,0.08));
    }

    .hw-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
    }

    .back-btn {
      background: none;
      border: none;
      color: var(--color-primary, #2563eb);
      font-size: 14px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      font-family: inherit;
      white-space: nowrap;
    }
    .back-btn:hover { background: #f1f5f9; }

    .hw-title {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .hw-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Upload zone */
    .upload-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px 20px;
      text-align: center;
      width: 100%;
      max-width: 400px;
    }

    .upload-icon-big { font-size: 64px; line-height: 1; }

    .upload-heading {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .upload-sub {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .upload-btns {
      display: flex;
      gap: 12px;
      margin-top: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }

    /* Buttons */
    .btn {
      padding: 12px 24px;
      border-radius: 10px;
      font-family: inherit;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: opacity 0.15s, transform 0.1s;
    }
    .btn:active { transform: scale(0.97); }

    .btn-primary { background: var(--color-primary, #2563eb); color: white; }
    .btn-primary:hover { opacity: 0.9; }

    .btn-secondary { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; }
    .btn-secondary:hover { background: #e2e8f0; }

    .btn-confirm { background: #16a34a; color: white; flex: 1; }
    .btn-confirm:hover { opacity: 0.9; }

    .btn-retake { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; flex: 1; }
    .btn-retake:hover { background: #e2e8f0; }

    /* Analyzing zone */
    .analyzing-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      width: 100%;
      max-width: 400px;
    }

    .preview-img {
      width: 100%;
      max-height: 240px;
      object-fit: contain;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }

    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: var(--color-primary, #2563eb);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .analyzing-text { font-size: 15px; color: #64748b; margin: 0; }

    /* Result zone */
    .result-zone {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 14px;
      width: 100%;
      max-width: 480px;
    }

    .problem-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .problem-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
      margin: 0;
      letter-spacing: 0.05em;
    }

    .problem-text {
      font-size: 15px;
      color: #1e293b;
      margin: 0;
      line-height: 1.65;
    }

    .latex-box {
      display: flex;
      align-items: baseline;
      gap: 8px;
      background: #f8fafc;
      border-radius: 8px;
      padding: 8px 12px;
    }

    .latex-label { font-size: 12px; color: #64748b; white-space: nowrap; }

    .latex-text {
      font-size: 14px;
      color: #0f172a;
      font-family: monospace;
      word-break: break-all;
    }

    .topic-chip {
      display: inline-block;
      padding: 3px 10px;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      width: fit-content;
    }

    .confirm-row { display: flex; gap: 10px; }

    .error-card {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }

    .error-icon-big { font-size: 36px; line-height: 1; }
    .error-msg { font-size: 15px; color: #9a3412; margin: 0; }

    /* Confirmed zone */
    .confirmed-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      width: 100%;
      max-width: 480px;
      text-align: center;
    }

    .confirmed-icon-big { font-size: 56px; line-height: 1; }

    .confirmed-heading {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .sprint-note { font-size: 13px; color: #94a3b8; margin: 0; }
  `]
})
export class HomeworkUploadComponent implements OnDestroy {
  protected tutor = inject(TutorService);
  private homeworkService = inject(HomeworkService);

  protected state = signal<UploadState>('idle');
  protected result = signal<HomeworkAnalysisResult | null>(null);
  protected imageUrl = signal<string | null>(null);

  private objectUrl: string | null = null;

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = URL.createObjectURL(file);
    this.imageUrl.set(this.objectUrl);
    this.state.set('analyzing');

    try {
      const result = await this.homeworkService.analyze(file);
      this.result.set(result);
    } catch {
      this.result.set({
        problemText: '', latex: '', topic: '',
        readable: false,
        message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
      });
    }

    this.state.set('result');
    input.value = '';
  }

  protected confirmProblem(): void {
    this.state.set('confirmed');
  }

  protected retake(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.imageUrl.set(null);
    this.result.set(null);
    this.state.set('idle');
  }

  ngOnDestroy(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }
}
