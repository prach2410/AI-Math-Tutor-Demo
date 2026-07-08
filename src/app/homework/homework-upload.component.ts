import { Component, inject, signal, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HomeworkService, HomeworkAnalysisResult, HomeworkRead } from './homework.service';
import { TutorService } from '../tutor.service';
import { TeachingFlowComponent } from './teaching-flow.component';

type UploadState = 'idle' | 'typing' | 'collecting' | 'analyzing' | 'result' | 'confirmed' | 'history';

interface SelectedImage {
  file: File;
  url: string;
}

@Component({
  selector: 'app-homework-upload',
  standalone: true,
  imports: [TeachingFlowComponent, FormsModule],
  host: { style: 'display: flex; flex-direction: column; flex: 1; min-height: 0;' },
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
              <input #cameraInput type="file" accept="image/*" capture="environment" hidden (change)="addFiles($event)" />
              <input #fileInput type="file" accept="image/*" multiple hidden (change)="addFiles($event)" />
              <div class="upload-divider">— หรือ —</div>
              <button class="btn btn-type" (click)="startTyping()">⌨️ พิมพ์โจทย์เอง</button>
              <p class="upload-type-note">รู้โจทย์อยู่แล้ว? พิมพ์เลย ไม่ต้องรออ่านรูป</p>
              <button class="btn btn-history" (click)="loadHistory()">📚 การบ้านที่อัปไว้</button>
            </div>
          }

          @case ('typing') {
            <div class="typing-zone">
              <div class="typing-top">
                <button class="btn btn-ghost btn-sm" (click)="state.set('idle')">← กลับ</button>
                <p class="typing-heading">⌨️ พิมพ์โจทย์ที่ติด</p>
              </div>
              <p class="typing-sub">พิมพ์โจทย์คณิตศาสตร์ที่อยากให้ช่วย แล้วเริ่มเรียนได้เลย</p>
              <textarea
                class="typing-input"
                [(ngModel)]="typedText"
                placeholder="เช่น หาปริมาตรของตู้ปลาทรงสี่เหลี่ยม กว้าง 30 ซม. ยาว 50 ซม. สูง 40 ซม."
                rows="4"
                (keydown.control.enter)="startTypedProblem()">
              </textarea>
              <div class="typing-hint">
                <p class="typing-hint-line">💡 เลขยกกำลังพิมพ์ <code>^</code> เช่น <code>2^5</code> · รากพิมพ์เป็นคำ เช่น "รากที่สามของ 27" — AI เข้าใจหมด</p>
                <p class="typing-hint-line typing-hint-photo">📷 ถ้าโจทย์มีสัญลักษณ์เยอะ กดกลับไป "ถ่ายรูป" ง่ายกว่า</p>
              </div>
              <button class="btn btn-analyze" style="width:100%" [disabled]="!typedText.trim()" (click)="startTypedProblem()">
                🧠 เริ่มเรียนโจทย์นี้
              </button>
            </div>
          }

          @case ('collecting') {
            <div class="collecting-zone">
              <p class="collecting-heading">รูปที่เลือก ({{ images().length }} รูป)</p>
              <div class="thumbnails">
                @for (img of images(); track img.url; let i = $index) {
                  <div class="thumb-wrapper">
                    <img class="thumb" [src]="img.url" [alt]="'รูปที่ ' + (i + 1)" />
                    <button class="thumb-remove" (click)="removeImage(i)" title="ลบรูปนี้">✕</button>
                    <span class="thumb-num">{{ i + 1 }}</span>
                  </div>
                }
              </div>
              <p class="collecting-hint">โจทย์ยาวหลายหน้า? เพิ่มรูปทุกหน้า แล้วกดวิเคราะห์</p>
              <div class="collecting-btns">
                <button class="btn btn-ghost" (click)="cameraMore.click()">📷 เพิ่มรูป</button>
                <button class="btn btn-ghost" (click)="fileMore.click()">📁 เพิ่มไฟล์</button>
                <button class="btn btn-analyze" (click)="analyze()">
                  🔍 วิเคราะห์โจทย์{{ images().length > 1 ? ' (' + images().length + ' รูป)' : '' }}
                </button>
              </div>
              <input #cameraMore type="file" accept="image/*" capture="environment" hidden (change)="addFiles($event)" />
              <input #fileMore type="file" accept="image/*" multiple hidden (change)="addFiles($event)" />
            </div>
          }

          @case ('analyzing') {
            <div class="analyzing-zone">
              <div class="thumbnails">
                @for (img of images(); track img.url; let i = $index) {
                  <img class="thumb" [src]="img.url" [alt]="'รูปที่ ' + (i + 1)" />
                }
              </div>
              <div class="spinner-wrapper">
                <div class="spinner"></div>
                <p class="analyzing-text">{{ analyzingMsg() }}{{ images().length > 1 ? ' (' + images().length + ' รูป)' : '' }}</p>
                <p class="analyzing-sub">ใช้เวลาสักครู่ รออีกนิดนะ · {{ elapsed() }} วินาที</p>
              </div>
            </div>
          }

          @case ('result') {
            <div class="result-zone">
              <div class="thumbnails small">
                @for (img of images(); track img.url; let i = $index) {
                  <img class="thumb" [src]="img.url" [alt]="'รูปที่ ' + (i + 1)" />
                }
              </div>
              @if (result()?.readable && result()!.problems.length > 0) {
                @if (result()!.problems.length > 1) {
                  <!-- Multiple problems: show grouped list -->
                  <p class="count-badge">พบ {{ result()!.problems.length }} ข้อ — เลือกข้อที่จะทำ</p>
                  <div class="problem-list">
                    @for (group of groupedProblems(); track group.groupIndex) {
                      @if (group.groupTitle) {
                        <div class="group-header">
                          <span class="group-num">ข้อ {{ group.groupIndex }}</span>
                          <span class="group-title">{{ group.groupTitle }}</span>
                        </div>
                      }
                      @for (item of group.items; track item.p.index; let j = $index) {
                        <button class="problem-list-item" [class.problem-list-sub]="group.groupTitle" (click)="confirmProblem(item.i)">
                          <div class="pli-row">
                            <span class="pli-num">{{ j + 1 }})</span>
                            <span class="pli-text">{{ item.p.subText || item.p.problemText }}</span>
                          </div>
                          @if (item.p.topic && !group.groupTitle) {
                            <span class="pli-chip">{{ item.p.topic }}</span>
                          }
                        </button>
                      }
                    }
                  </div>
                  <button class="btn btn-retake" style="width:100%" (click)="retake()">🔄 ถ่ายใหม่</button>
                } @else {
                  <!-- Single problem: keep existing confirm flow -->
                  <div class="problem-card">
                    <p class="problem-label">โจทย์ที่อ่านได้</p>
                    <p class="problem-text">{{ result()!.problems[0].problemText }}</p>
                    @if (result()!.problems[0].latex) {
                      <div class="latex-box">
                        <span class="latex-label">สูตร:</span>
                        <code class="latex-text">{{ result()!.problems[0].latex }}</code>
                      </div>
                    }
                    @if (result()!.problems[0].topic) {
                      <span class="topic-chip">{{ result()!.problems[0].topic }}</span>
                    }
                  </div>
                  <div class="confirm-row">
                    <button class="btn btn-confirm" (click)="confirmProblem(0)">✅ ใช่ โจทย์นี้เลย</button>
                    <button class="btn btn-retake" (click)="retake()">🔄 ถ่ายใหม่</button>
                  </div>
                }
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
              <div class="confirmed-header">
                <span class="confirmed-badge">
                  ✅ ข้อที่ {{ result()!.problems[currentProblemIndex()].index }}
                  @if (result()!.problems.length > 1) {
                    / {{ result()!.problems.length }}
                  }
                </span>
                <button class="btn btn-ghost btn-sm" (click)="retake()">เปลี่ยนโจทย์</button>
              </div>
              <app-teaching-flow
                [problem]="result()!.problems[currentProblemIndex()]"
                [hasNextProblem]="currentProblemIndex() < result()!.problems.length - 1"
                [onNextProblem]="nextProblem.bind(this)"
                [onRestart]="backToList.bind(this)"
                [visionModel]="visionModel()"
                [analysisStartedAt]="analysisStartedAt()"
                [analysisEndedAt]="analysisEndedAt()">
              </app-teaching-flow>
            </div>
          }

          @case ('history') {
            <div class="history-zone">
              <div class="history-top">
                <button class="btn btn-ghost btn-sm" (click)="state.set('idle')">← กลับ</button>
                <p class="history-heading">📚 การบ้านที่อัปไว้</p>
              </div>
              @if (historyLoading()) {
                <div class="spinner-wrapper">
                  <div class="spinner"></div>
                  <p class="analyzing-text">กำลังโหลด...</p>
                </div>
              } @else if (historyList().length === 0) {
                <div class="error-card">
                  <p class="error-icon-big">📭</p>
                  <p class="error-msg">ยังไม่มีการบ้านที่อัปไว้</p>
                </div>
              } @else {
                <div class="history-list">
                  @for (r of historyList(); track r.id) {
                    <button class="history-item" (click)="openRead(r)">
                      <div class="hi-top">
                        <span class="hi-topic">{{ readTitle(r) }}</span>
                        <span class="hi-count">{{ r.problemCount }} ข้อ</span>
                      </div>
                      <p class="hi-time">{{ formatTime(r.createdAt) }}</p>
                    </button>
                  }
                </div>
              }
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
      background: #eff6ff; border: 1.5px solid #bfdbfe;
      color: #1d4ed8; font-size: 14px; font-weight: 600;
      cursor: pointer; padding: 6px 14px; border-radius: 8px; font-family: inherit;
      white-space: nowrap;
    }
    .back-btn:hover { background: #dbeafe; border-color: #93c5fd; }

    .hw-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; }

    .hw-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Buttons */
    .btn {
      padding: 11px 22px;
      border-radius: 10px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: opacity 0.15s, transform 0.1s;
      white-space: nowrap;
    }
    .btn:active { transform: scale(0.97); }

    .btn-primary  { background: var(--color-primary, #2563eb); color: white; }
    .btn-primary:hover { opacity: 0.9; }

    .btn-secondary { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; }
    .btn-secondary:hover { background: #e2e8f0; }

    .btn-ghost { background: transparent; color: #475569; border: 1px solid #cbd5e1; }
    .btn-ghost:hover { background: #f1f5f9; }

    .btn-analyze { background: var(--color-primary, #2563eb); color: white; flex: 1; }
    .btn-analyze:hover { opacity: 0.9; }

    .btn-confirm { background: #16a34a; color: white; flex: 1; }
    .btn-confirm:hover { opacity: 0.9; }

    .btn-retake  { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; flex: 1; }
    .btn-retake:hover { background: #e2e8f0; }

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
    .upload-heading  { font-size: 20px; font-weight: 700; color: #1e293b; margin: 0; }
    .upload-sub      { font-size: 14px; color: #64748b; margin: 0; }

    .upload-btns {
      display: flex;
      gap: 12px;
      margin-top: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }

    /* Thumbnails */
    .thumbnails {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
      width: 100%;
    }
    .thumbnails.small .thumb { max-height: 80px; }

    .thumb-wrapper {
      position: relative;
      display: inline-block;
    }

    .thumb {
      max-height: 140px;
      max-width: 160px;
      object-fit: contain;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      display: block;
    }

    .thumb-remove {
      position: absolute;
      top: -6px; right: -6px;
      width: 20px; height: 20px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      border: none;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .thumb-remove:hover { background: #dc2626; }

    .thumb-num {
      position: absolute;
      bottom: 4px; left: 4px;
      background: rgba(0,0,0,0.55);
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
      line-height: 1.4;
    }

    /* Collecting zone */
    .collecting-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      width: 100%;
      max-width: 480px;
    }

    .collecting-heading { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0; }
    .collecting-hint    { font-size: 13px; color: #64748b; margin: 0; text-align: center; }

    .collecting-btns {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      width: 100%;
      justify-content: center;
    }

    /* Analyzing zone */
    .analyzing-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      width: 100%;
      max-width: 480px;
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

    .analyzing-text { font-size: 15px; color: #334155; font-weight: 600; margin: 0; text-align: center; }
    .analyzing-sub { font-size: 13px; color: #94a3b8; margin: 0; text-align: center; }

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
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
      margin: 0;
      letter-spacing: 0.05em;
    }

    .problem-text { font-size: 15px; color: #1e293b; margin: 0; line-height: 1.65; }

    .latex-box {
      display: flex;
      align-items: baseline;
      gap: 8px;
      background: #f8fafc;
      border-radius: 8px;
      padding: 8px 12px;
    }

    .latex-label { font-size: 12px; color: #64748b; white-space: nowrap; }
    .latex-text  { font-size: 14px; color: #0f172a; font-family: monospace; word-break: break-all; }

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

    /* Problem list (multi-problem result) */
    .problem-list { display: flex; flex-direction: column; gap: 4px; width: 100%; }

    .group-header {
      display: flex; align-items: baseline; gap: 8px;
      padding: 10px 4px 4px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-top: 8px;
    }
    .group-header:first-child { margin-top: 0; }
    .group-num  { font-size: 12px; font-weight: 800; color: #1d4ed8; white-space: nowrap; }
    .group-title { font-size: 13px; font-weight: 600; color: #334155; line-height: 1.4; }

    .problem-list-item {
      display: flex; flex-direction: column; gap: 4px; text-align: left;
      padding: 10px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0;
      background: white; cursor: pointer; font-family: inherit;
      transition: border-color 0.15s, background 0.12s;
    }
    .problem-list-item:hover { border-color: #2563eb; background: #eff6ff; }
    .problem-list-item:active { transform: scale(0.98); }
    .problem-list-sub { margin-left: 12px; border-color: #f1f5f9; background: #f8fafc; }
    .problem-list-sub:hover { border-color: #93c5fd; background: #eff6ff; }

    .pli-row  { display: flex; align-items: baseline; gap: 6px; }
    .pli-num  { font-size: 12px; font-weight: 700; color: #2563eb; white-space: nowrap; flex-shrink: 0; }
    .pli-text {
      font-size: 14px; color: #1e293b; line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .pli-chip {
      font-size: 11px; font-weight: 600; color: #1e40af;
      background: #dbeafe; border-radius: 20px;
      padding: 2px 8px; width: fit-content;
    }

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
    .error-msg      { font-size: 15px; color: #9a3412; margin: 0; }

    .count-badge {
      font-size: 13px; font-weight: 700; color: #1e40af;
      background: #dbeafe; border-radius: 20px; padding: 4px 14px;
      margin: 0; width: fit-content; align-self: center;
    }

    /* Confirmed zone */
    .confirmed-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      width: 100%;
      max-width: 480px;
    }

    .confirmed-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .confirmed-badge {
      font-size: 13px;
      font-weight: 600;
      color: #16a34a;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 20px;
      padding: 4px 12px;
    }

    .btn-sm { padding: 6px 12px; font-size: 13px; }

    .btn-history {
      margin-top: 4px;
      background: transparent;
      color: #2563eb;
      border: 1.5px dashed #93c5fd;
      border-radius: 10px;
      padding: 9px 20px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    .btn-history:hover { background: #eff6ff; border-color: #2563eb; }

    /* Type-your-own entry */
    .upload-divider {
      font-size: 12px; color: #94a3b8; letter-spacing: 0.03em;
      margin: 4px 0 0;
    }
    .btn-type {
      background: #eef2ff; color: #4338ca; border: 1.5px solid #c7d2fe;
      width: 100%; max-width: 280px;
    }
    .btn-type:hover { background: #e0e7ff; border-color: #818cf8; }
    .upload-type-note { font-size: 12px; color: #94a3b8; margin: 0; }

    /* Typing zone */
    .typing-zone {
      display: flex; flex-direction: column; gap: 12px;
      width: 100%; max-width: 480px;
    }
    .typing-top { display: flex; align-items: center; gap: 12px; }
    .typing-heading { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0; }
    .typing-sub { font-size: 13px; color: #64748b; margin: 0; }
    .typing-input {
      width: 100%; padding: 12px 14px; border: 1.5px solid #cbd5e1; border-radius: 10px;
      font-size: 15px; font-family: inherit; resize: vertical; box-sizing: border-box;
      outline: none; transition: border-color 0.15s; color: #1e293b; line-height: 1.6;
    }
    .typing-input:focus { border-color: #2563eb; }
    .typing-hint { display: flex; flex-direction: column; gap: 4px; margin-top: -4px; }
    .typing-hint-line { font-size: 12px; color: #64748b; margin: 0; line-height: 1.6; }
    .typing-hint-line code {
      background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px;
      padding: 0 5px; font-family: monospace; font-size: 12px; color: #1e40af;
    }
    .typing-hint-photo { color: #94a3b8; }

    /* History zone */
    .history-zone {
      display: flex;
      flex-direction: column;
      gap: 14px;
      width: 100%;
      max-width: 480px;
    }

    .history-top {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .history-heading {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .history-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: left;
      padding: 12px 14px;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      background: white;
      cursor: pointer;
      font-family: inherit;
      transition: border-color 0.15s, background 0.12s;
    }
    .history-item:hover { border-color: #2563eb; background: #eff6ff; }
    .history-item:active { transform: scale(0.98); }

    .hi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .hi-topic {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .hi-count {
      font-size: 12px;
      font-weight: 600;
      color: #1e40af;
      background: #dbeafe;
      border-radius: 20px;
      padding: 2px 8px;
      white-space: nowrap;
    }

    .hi-time {
      font-size: 12px;
      color: #64748b;
      margin: 0;
    }
  `]
})
export class HomeworkUploadComponent implements OnDestroy {
  protected tutor = inject(TutorService);
  private homeworkService = inject(HomeworkService);

  protected state               = signal<UploadState>('idle');
  protected images              = signal<SelectedImage[]>([]);
  protected result              = signal<HomeworkAnalysisResult | null>(null);
  protected currentProblemIndex = signal(0);
  protected visionModel         = signal('');
  protected analysisStartedAt   = signal('');
  protected analysisEndedAt     = signal('');
  protected historyList         = signal<HomeworkRead[]>([]);
  protected historyLoading      = signal(false);

  protected elapsed             = signal(0);
  protected analyzingMsg        = signal('📖 กำลังอ่านโจทย์...');
  private analyzingTimer?: ReturnType<typeof setInterval>;

  protected typedText = '';

  // อ่านโจทย์ใช้เวลา ~35s (typhoon OCR + จัดเรียง) → ข้อความเปลี่ยนตามจังหวะ กันรู้สึกค้าง
  private startAnalyzingTimer(): void {
    this.elapsed.set(0);
    this.analyzingMsg.set('📖 กำลังอ่านโจทย์...');
    this.analyzingTimer = setInterval(() => {
      const s = this.elapsed() + 1;
      this.elapsed.set(s);
      if (s === 8)  this.analyzingMsg.set('✏️ กำลังจัดเรียงโจทย์ให้เป็นข้อๆ...');
      if (s === 20) this.analyzingMsg.set('⏳ อีกนิดนะ ใกล้เสร็จแล้ว...');
    }, 1000);
  }

  private stopAnalyzingTimer(): void {
    if (this.analyzingTimer) { clearInterval(this.analyzingTimer); this.analyzingTimer = undefined; }
  }

  addFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    const newEntries = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    this.images.update(prev => [...prev, ...newEntries]);
    this.state.set('collecting');
    input.value = '';
  }

  removeImage(index: number): void {
    this.images.update(prev => {
      URL.revokeObjectURL(prev[index].url);
      const next = prev.filter((_, i) => i !== index);
      return next;
    });
    if (this.images().length === 0) this.state.set('idle');
  }

  async analyze(): Promise<void> {
    const imgs = this.images();
    if (!imgs.length) return;

    this.state.set('analyzing');
    this.startAnalyzingTimer();
    try {
      const result = await this.homeworkService.analyze(imgs.map(i => i.file));
      this.result.set(result);
      this.visionModel.set(result.visionModel ?? '');
      this.analysisStartedAt.set(result.analysisStartedAt ?? '');
      this.analysisEndedAt.set(result.analysisEndedAt ?? '');
    } catch {
      this.result.set({
        readable: false,
        message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        problems: [],
      });
    } finally {
      this.stopAnalyzingTimer();
    }
    this.state.set('result');
  }

  protected groupedProblems() {
    const problems = this.result()?.problems ?? [];
    const hasGroups = problems.some(p => (p.groupIndex ?? 0) > 0);
    if (!hasGroups) {
      return [{ groupIndex: 0, groupTitle: '', items: problems.map((p, i) => ({ p, i })) }];
    }
    const map = new Map<number, { groupIndex: number; groupTitle: string; items: { p: typeof problems[0]; i: number }[] }>();
    problems.forEach((p, i) => {
      const gi = p.groupIndex ?? 0;
      if (!map.has(gi)) map.set(gi, { groupIndex: gi, groupTitle: p.groupTitle ?? '', items: [] });
      map.get(gi)!.items.push({ p, i });
    });
    return Array.from(map.values()).sort((a, b) => a.groupIndex - b.groupIndex);
  }

  protected confirmProblem(index: number): void {
    this.currentProblemIndex.set(index);
    this.state.set('confirmed');
  }

  protected startTyping(): void {
    this.typedText = '';
    this.tutor.logEvent('homework_typing_opened');
    this.state.set('typing');
  }

  // พิมพ์โจทย์ตรงเข้า teaching flow — ข้าม OCR ให้ path "ติดโจทย์ → ได้รับการสอน" สั้นที่สุด
  protected startTypedProblem(): void {
    const text = this.typedText.trim();
    if (!text) return;
    this.result.set({
      readable: true,
      message: '',
      problems: [{ index: 1, problemText: text, latex: '', topic: '', hasFigure: false }],
    });
    this.currentProblemIndex.set(0);
    this.visionModel.set('');
    this.analysisStartedAt.set('');
    this.analysisEndedAt.set('');
    this.tutor.logEvent('homework_typed_problem');
    // บันทึกให้โผล่ใน "การบ้านที่อัปไว้" + resume ได้ — fire-and-forget ไม่บล็อกการเข้าเรียน
    this.homeworkService.saveTyped(text).catch(() => {});
    this.state.set('confirmed');
  }

  protected nextProblem(): void {
    this.currentProblemIndex.update(i => i + 1);
  }

  protected backToList(): void {
    this.state.set('result');
  }

  protected retake(): void {
    this.images().forEach(i => URL.revokeObjectURL(i.url));
    this.images.set([]);
    this.result.set(null);
    this.visionModel.set('');
    this.analysisStartedAt.set('');
    this.analysisEndedAt.set('');
    this.typedText = '';
    this.state.set('idle');
  }

  async loadHistory(): Promise<void> {
    this.tutor.logEvent('homework_history_opened');
    this.historyLoading.set(true);
    this.state.set('history');
    try {
      const list = await this.homeworkService.listReads();
      this.historyList.set(list);
    } catch {
      this.historyList.set([]);
    } finally {
      this.historyLoading.set(false);
    }
  }

  protected openRead(r: HomeworkRead): void {
    this.result.set({ readable: true, message: '', problems: r.problems });
    this.visionModel.set(r.visionModel ?? '');
    this.analysisStartedAt.set(r.analysisStartedAt ?? '');
    this.analysisEndedAt.set(r.analysisEndedAt ?? '');
    this.tutor.logEvent('homework_resumed');
    this.state.set('result');
  }

  // typed reads มี topic ว่าง → ใช้ตัวโจทย์ที่พิมพ์เป็นชื่อรายการแทน
  protected readTitle(r: HomeworkRead): string {
    if (r.topic?.trim()) return r.topic;
    const t = r.problems?.[0]?.problemText?.trim() ?? '';
    if (!t) return 'ไม่ระบุหัวข้อ';
    return t.length > 50 ? t.slice(0, 50) + '…' : t;
  }

  protected formatTime(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString('th-TH', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  ngOnDestroy(): void {
    this.stopAnalyzingTimer();
    this.images().forEach(i => URL.revokeObjectURL(i.url));
  }
}
