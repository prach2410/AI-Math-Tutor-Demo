import { Component, inject, signal, OnDestroy, ElementRef } from '@angular/core';
import { TutorService } from '../tutor.service';
import { LearningJournalService, LearningJournalAnalysis } from './learning-journal.service';

type UploadState = 'idle' | 'collecting' | 'analyzing' | 'result';

const REFLECTION_OPTIONS = [
  { emoji: '🟢', label: 'อ๋อ เข้าใจแล้ว',  value: 'Understood' },
  { emoji: '🟡', label: 'เริ่มเข้าใจแล้ว', value: 'StartingToUnderstand' },
  { emoji: '🟠', label: 'ยังงงอยู่',        value: 'StillConfused' },
  { emoji: '🔴', label: 'ไม่เข้าใจเลย',    value: 'NotUnderstand' },
] as const;

interface SelectedImage { file: File; url: string; }

const DOC_TYPES: Record<string, { label: string; icon: string; bg: string; color: string; highlightLabel: string }> = {
  Whiteboard: { label: 'กระดานในห้องเรียน', icon: '📋', bg: '#dbeafe', color: '#1e40af', highlightLabel: 'ที่ครูสอน' },
  Notebook:   { label: 'สมุดจดของนักเรียน', icon: '📓', bg: '#ede9fe', color: '#5b21b6', highlightLabel: 'สิ่งที่จด' },
  Textbook:   { label: 'หนังสือเรียน',       icon: '📕', bg: '#fee2e2', color: '#991b1b', highlightLabel: 'แนวคิดหลัก' },
  Worksheet:  { label: 'ใบงาน',              icon: '📄', bg: '#dcfce7', color: '#166534', highlightLabel: 'โจทย์ที่ฝึก' },
  Homework:   { label: 'การบ้าน',            icon: '📝', bg: '#fef3c7', color: '#92400e', highlightLabel: 'งานที่ได้รับ' },
};

@Component({
  selector: 'app-learning-journal-upload',
  standalone: true,
  template: `
    <div class="lj-container">
      <div class="lj-header">
        <button class="back-btn" (click)="tutor.exitLearningJournalMode()">← กลับ</button>
        <h2 class="lj-title">📚 สิ่งที่เรียนวันนี้</h2>
      </div>

      <div class="lj-body">
        @switch (state()) {

          @case ('idle') {
            <div class="upload-zone">
              <div class="upload-icon">📚</div>
              <p class="upload-heading">เลือกรูปที่ถ่ายในห้องเรียน</p>
              <p class="upload-sub">กระดาน · สมุดจด · ใบงาน · หนังสือเรียน</p>
              <div class="upload-btns">
                <button class="btn btn-primary" (click)="galleryInput.click()">🖼️ เลือกจากแกลเลอรี่</button>
                <button class="btn btn-secondary" (click)="cameraInput.click()">📷 ถ่ายรูปใหม่</button>
              </div>
              <input #galleryInput type="file" accept="image/*" multiple hidden (change)="addFiles($event)" />
              <input #cameraInput type="file" accept="image/*" capture="environment" hidden (change)="addFiles($event)" />
            </div>
          }

          @case ('collecting') {
            <div class="collecting-zone">
              <p class="collecting-heading">รูปที่เลือก ({{ images().length }} รูป)</p>
              <div class="thumbnails">
                @for (img of images(); track img.url; let i = $index) {
                  <div class="thumb-wrapper">
                    <img class="thumb" [src]="img.url" [alt]="'รูปที่ ' + (i + 1)" />
                    <button class="thumb-remove" (click)="removeImage(i)">✕</button>
                    <span class="thumb-num">{{ i + 1 }}</span>
                  </div>
                }
              </div>
              <div class="collecting-btns">
                <button class="btn btn-ghost" (click)="moreGallery.click()">🖼️ เพิ่มรูป</button>
                <button class="btn btn-ghost" (click)="moreCamera.click()">📷 ถ่ายเพิ่ม</button>
                <button class="btn btn-analyze" (click)="analyze()">
                  🔍 วิเคราะห์{{ images().length > 1 ? ' (' + images().length + ' รูป)' : '' }}
                </button>
              </div>
              <input #moreGallery type="file" accept="image/*" multiple hidden (change)="addFiles($event)" />
              <input #moreCamera type="file" accept="image/*" capture="environment" hidden (change)="addFiles($event)" />
            </div>
          }

          @case ('analyzing') {
            <div class="analyzing-zone">
              <div class="thumbnails small">
                @for (img of images(); track img.url) {
                  <img class="thumb" [src]="img.url" alt="" />
                }
              </div>
              <div class="spinner-wrapper">
                <div class="spinner"></div>
                <p class="analyzing-text">กำลังวิเคราะห์{{ images().length > 1 ? ' ' + images().length + ' รูป' : '' }}...</p>
                <p class="analyzing-sub">AI อ่านและจำแนกประเภทเอกสาร</p>
              </div>
            </div>
          }

          @case ('result') {
            <div class="result-zone">
              <div class="thumbnails small">
                @for (img of images(); track img.url) {
                  <img class="thumb" [src]="img.url" alt="" />
                }
              </div>
              @if (result()?.duplicate) {
                <div class="duplicate-card">
                  <p class="dup-icon">🔁</p>
                  <p class="dup-msg">รูปนี้บันทึกไว้แล้ว</p>
                  <p class="dup-date">เมื่อ {{ formatDate(result()!.existingDate!) }}</p>
                </div>
              } @else if (result()?.readable) {
                @let r = result()!;
                @let dt = docType(r.documentType);
                <div class="type-badge" [style.background]="dt.bg" [style.color]="dt.color">
                  {{ dt.icon }} {{ dt.label }}
                </div>
                @if (r.topic) {
                  <div class="topic-row">
                    <span class="topic-label">หัวข้อ</span>
                    <span class="topic-text">{{ r.topic }}</span>
                  </div>
                }
                @if (r.summary) {
                  <div class="summary-card">
                    <p class="summary-label">สรุปเนื้อหา</p>
                    <p class="summary-text">{{ r.summary }}</p>
                  </div>
                }
                @if (r.highlights.length > 0) {
                  <div class="highlights-card">
                    <p class="highlights-label">{{ dt.highlightLabel }}</p>
                    <ul class="highlights-list">
                      @for (h of r.highlights; track h) {
                        <li>{{ h }}</li>
                      }
                    </ul>
                  </div>
                }
                @if (r.keywords.length > 0) {
                  <div class="keywords-row">
                    @for (kw of r.keywords; track kw) {
                      <span class="keyword-chip">{{ kw }}</span>
                    }
                  </div>
                }
                <div class="reflection-card">
                  <p class="reflection-q">ตอนนี้หนูอยู่ตรงไหน?</p>
                  <div class="reflection-btns">
                    @for (opt of reflectionOptions; track opt.value) {
                      <button
                        class="reflection-btn"
                        [class.selected]="reflection() === opt.value"
                        (click)="setReflection(opt.value)">
                        {{ opt.emoji }} {{ opt.label }}
                      </button>
                    }
                  </div>
                  @if (reflection()) {
                    <p class="reflection-thanks">ขอบคุณที่บอกนะ</p>
                  }
                </div>
              } @else {
                <div class="error-card">
                  <p class="error-icon">🔍</p>
                  <p class="error-msg">{{ result()?.message ?? 'วิเคราะห์ไม่ออก' }}</p>
                </div>
              }
              @if (saved()) {
                <div class="saved-badge">✅ บันทึกแล้ว</div>
              }
              <button class="btn btn-retake" (click)="retake()">🔄 เลือกรูปใหม่</button>
            </div>
          }

        }
      </div>
    </div>
  `,
  styles: [`
    .lj-container {
      display: flex; flex-direction: column; height: 100%;
      background: var(--color-surface, #f8fafc);
      border-radius: var(--radius, 12px);
      overflow: hidden;
      box-shadow: var(--shadow, 0 1px 4px rgba(0,0,0,0.08));
    }

    .lj-header {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .back-btn {
      background: #eff6ff; border: 1.5px solid #bfdbfe;
      color: #1d4ed8; font-size: 14px; font-weight: 600;
      cursor: pointer; padding: 6px 14px; border-radius: 8px; font-family: inherit;
    }
    .back-btn:hover { background: #dbeafe; border-color: #93c5fd; }
    .lj-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; }

    .lj-body {
      flex: 1; overflow-y: auto;
      padding: 20px 16px;
      display: flex; flex-direction: column; align-items: center;
    }

    /* Buttons */
    .btn {
      padding: 11px 22px; border-radius: 10px;
      font-family: inherit; font-size: 14px; font-weight: 600;
      cursor: pointer; border: none;
      transition: opacity 0.15s, transform 0.1s; white-space: nowrap;
    }
    .btn:active { transform: scale(0.97); }
    .btn-primary  { background: var(--color-primary, #2563eb); color: white; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-secondary { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; }
    .btn-secondary:hover { background: #e2e8f0; }
    .btn-ghost { background: transparent; color: #475569; border: 1px solid #cbd5e1; }
    .btn-ghost:hover { background: #f1f5f9; }
    .btn-analyze { background: #7c3aed; color: white; flex: 1; }
    .btn-analyze:hover { opacity: 0.9; }
    .btn-retake { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; width: 100%; margin-top: 4px; }
    .btn-retake:hover { background: #e2e8f0; }

    /* Upload zone */
    .upload-zone {
      display: flex; flex-direction: column; align-items: center;
      gap: 12px; padding: 40px 20px; text-align: center; width: 100%; max-width: 400px;
    }
    .upload-icon   { font-size: 64px; line-height: 1; }
    .upload-heading { font-size: 20px; font-weight: 700; color: #1e293b; margin: 0; }
    .upload-sub    { font-size: 14px; color: #64748b; margin: 0; }
    .upload-btns   { display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }

    /* Thumbnails */
    .thumbnails {
      display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; width: 100%;
    }
    .thumbnails.small .thumb { max-height: 80px; }
    .thumb-wrapper { position: relative; display: inline-block; }
    .thumb {
      max-height: 140px; max-width: 160px;
      object-fit: contain; border-radius: 8px;
      border: 1px solid #e2e8f0; display: block;
    }
    .thumb-remove {
      position: absolute; top: -6px; right: -6px;
      width: 20px; height: 20px; border-radius: 50%;
      background: #ef4444; color: white; border: none;
      font-size: 11px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    .thumb-remove:hover { background: #dc2626; }
    .thumb-num {
      position: absolute; bottom: 4px; left: 4px;
      background: rgba(0,0,0,0.55); color: white;
      font-size: 11px; font-weight: 700;
      padding: 1px 5px; border-radius: 4px; line-height: 1.4;
    }

    /* Collecting zone */
    .collecting-zone {
      display: flex; flex-direction: column; align-items: center;
      gap: 14px; width: 100%; max-width: 480px;
    }
    .collecting-heading { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0; }
    .collecting-btns {
      display: flex; gap: 8px; flex-wrap: wrap; width: 100%; justify-content: center;
    }

    /* Analyzing zone */
    .analyzing-zone {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; width: 100%; max-width: 480px;
    }
    .spinner-wrapper { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #7c3aed;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .analyzing-text { font-size: 15px; color: #64748b; margin: 0; }
    .analyzing-sub  { font-size: 13px; color: #94a3b8; margin: 0; }

    /* Result zone */
    .result-zone {
      display: flex; flex-direction: column; align-items: stretch;
      gap: 12px; width: 100%; max-width: 480px;
    }
    .type-badge {
      align-self: flex-start;
      padding: 6px 16px; border-radius: 20px;
      font-size: 14px; font-weight: 700;
    }
    .topic-row {
      display: flex; align-items: baseline; gap: 10px;
      background: white; border: 1px solid #e2e8f0;
      border-radius: 10px; padding: 12px 16px;
    }
    .topic-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; white-space: nowrap; }
    .topic-text  { font-size: 16px; font-weight: 600; color: #1e293b; }
    .summary-card {
      background: white; border: 1px solid #e2e8f0;
      border-radius: 12px; padding: 14px 16px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .summary-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin: 0; }
    .summary-text  { font-size: 14px; color: #334155; line-height: 1.7; margin: 0; }
    .highlights-card {
      background: white; border: 1px solid #e2e8f0;
      border-radius: 12px; padding: 14px 16px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .highlights-label {
      font-size: 11px; font-weight: 700; color: #94a3b8;
      text-transform: uppercase; margin: 0;
    }
    .highlights-list {
      margin: 0; padding-left: 18px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .highlights-list li { font-size: 14px; color: #1e293b; line-height: 1.5; }

    .keywords-row  { display: flex; flex-wrap: wrap; gap: 8px; }
    .keyword-chip  {
      padding: 4px 12px; background: #f1f5f9;
      border-radius: 20px; font-size: 13px; color: #475569;
      border: 1px solid #e2e8f0;
    }
    .saved-badge {
      background: #dcfce7; color: #166534;
      border: 1px solid #bbf7d0;
      border-radius: 8px; padding: 8px 14px;
      font-size: 13px; font-weight: 600;
      text-align: center;
    }

    .reflection-card {
      background: #faf5ff; border: 1px solid #e9d5ff;
      border-radius: 12px; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .reflection-q {
      font-size: 15px; font-weight: 700; color: #6b21a8;
      margin: 0; text-align: center;
    }
    .reflection-btns { display: flex; flex-direction: column; gap: 8px; }
    .reflection-btn {
      padding: 10px 16px; border-radius: 10px;
      font-family: inherit; font-size: 14px; font-weight: 500;
      cursor: pointer; border: 2px solid #e9d5ff;
      background: white; color: #1e293b;
      text-align: left; transition: background 0.12s, border-color 0.12s;
    }
    .reflection-btn:hover { background: #f5f3ff; border-color: #c4b5fd; }
    .reflection-btn.selected { background: #7c3aed; color: white; border-color: #7c3aed; }
    .reflection-thanks {
      font-size: 13px; color: #7c3aed; margin: 0; text-align: center; font-weight: 600;
    }

    .duplicate-card {
      background: #eff6ff; border: 1px solid #bfdbfe;
      border-radius: 12px; padding: 24px;
      display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center;
    }
    .dup-icon { font-size: 32px; line-height: 1; margin: 0; }
    .dup-msg  { font-size: 15px; font-weight: 600; color: #1e40af; margin: 0; }
    .dup-date { font-size: 13px; color: #3b82f6; margin: 0; }

    .error-card {
      background: #fff7ed; border: 1px solid #fed7aa;
      border-radius: 12px; padding: 24px;
      display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center;
    }
    .error-icon { font-size: 36px; line-height: 1; margin: 0; }
    .error-msg  { font-size: 15px; color: #9a3412; margin: 0; }
  `]
})
export class LearningJournalUploadComponent implements OnDestroy {
  protected tutor = inject(TutorService);
  private journalService = inject(LearningJournalService);
  private el = inject(ElementRef);

  protected state      = signal<UploadState>('idle');
  protected images     = signal<SelectedImage[]>([]);
  protected result     = signal<LearningJournalAnalysis | null>(null);
  protected saved      = signal(false);
  protected reflection = signal<string | null>(null);

  protected readonly reflectionOptions = REFLECTION_OPTIONS;

  addFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    this.images.update(prev => [...prev, ...files.map(f => ({ file: f, url: URL.createObjectURL(f) }))]);
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
    try {
      const result = await this.journalService.analyze(imgs.map(i => i.file));
      this.result.set(result);
      this.saved.set(result.readable && !result.duplicate);
    } catch {
      this.result.set({ readable: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่', documentType: '', topic: '', summary: '', highlights: [], keywords: [] });
      this.saved.set(false);
    }
    this.state.set('result');
    setTimeout(() => {
      const body = (this.el.nativeElement as HTMLElement).querySelector('.lj-body');
      body?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  }

  protected retake(): void {
    this.images().forEach(i => URL.revokeObjectURL(i.url));
    this.images.set([]);
    this.result.set(null);
    this.saved.set(false);
    this.reflection.set(null);
    this.state.set('idle');
  }

  protected async setReflection(value: string): Promise<void> {
    this.reflection.set(value);
    const id = this.result()?.id;
    if (!id) return;
    try { await this.journalService.setReflection(id, value); }
    catch { /* silent — UI already updated */ }
  }

  protected docType(type: string) {
    return DOC_TYPES[type] ?? { label: type || 'ไม่ทราบประเภท', icon: '📄', bg: '#f1f5f9', color: '#475569' };
  }

  protected formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  ngOnDestroy(): void {
    this.images().forEach(i => URL.revokeObjectURL(i.url));
  }
}
