import { Component, inject, signal, OnInit } from '@angular/core';
import { TutorService } from '../tutor.service';
import { LearningRecordsService, DailyLogGroup } from './learning-records.service';

const DOC_TYPES: Record<string, { label: string; icon: string; bg: string; color: string }> = {
  Whiteboard: { label: 'กระดานในห้องเรียน', icon: '📋', bg: '#dbeafe', color: '#1e40af' },
  Notebook:   { label: 'สมุดจดของนักเรียน', icon: '📓', bg: '#ede9fe', color: '#5b21b6' },
  Textbook:   { label: 'หนังสือเรียน',       icon: '📕', bg: '#fee2e2', color: '#991b1b' },
  Worksheet:  { label: 'ใบงาน',              icon: '📄', bg: '#dcfce7', color: '#166534' },
  Homework:   { label: 'การบ้าน',            icon: '📝', bg: '#fef3c7', color: '#92400e' },
};

@Component({
  selector: 'app-daily-logs',
  standalone: true,
  template: `
    <div class="dl-container">
      <div class="dl-header">
        <button class="back-btn" (click)="tutor.exitDailyLogsMode()">← กลับ</button>
        <h2 class="dl-title">📋 บันทึกการเรียน</h2>
      </div>

      <div class="dl-body">
        @if (loading()) {
          <div class="state-center">
            <div class="spinner"></div>
            <p class="state-text">กำลังโหลด...</p>
          </div>
        } @else if (error()) {
          <div class="state-center">
            <p class="state-icon">⚠️</p>
            <p class="state-text">โหลดไม่ได้ กรุณาลองใหม่</p>
            <button class="btn-retry" (click)="load()">ลองใหม่</button>
          </div>
        } @else if (groups().length === 0) {
          <div class="state-center">
            <p class="state-icon">📚</p>
            <p class="state-text">ยังไม่มีบันทึก</p>
            <p class="state-sub">ลองถ่ายรูปกระดานหรือสมุดแล้วกด "สิ่งที่เรียนวันนี้"</p>
          </div>
        } @else {
          <div class="timeline">
            @for (group of groups(); track group.date) {
              <div class="day-group">
                <div class="day-header">{{ formatDate(group.date) }}</div>
                <div class="day-records">
                  @for (rec of group.records; track rec.id) {
                    <div class="record-card">
                      <div class="record-badge"
                           [style.background]="docType(rec.documentType).bg"
                           [style.color]="docType(rec.documentType).color">
                        {{ docType(rec.documentType).icon }} {{ docType(rec.documentType).label }}
                      </div>
                      <p class="record-topic">{{ rec.topic }}</p>
                      @if (rec.summary) {
                        <p class="record-summary">{{ truncate(rec.summary, 100) }}</p>
                      }
                      @if (rec.keywords.length > 0) {
                        <div class="record-keywords">
                          @for (kw of rec.keywords.slice(0, 4); track kw) {
                            <span class="kw-chip">{{ kw }}</span>
                          }
                        </div>
                      }

                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dl-container {
      display: flex; flex-direction: column; height: 100%;
      background: var(--color-surface, #f8fafc);
      border-radius: var(--radius, 12px);
      overflow: hidden;
      box-shadow: var(--shadow, 0 1px 4px rgba(0,0,0,0.08));
    }

    .dl-header {
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
    .dl-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; }

    .dl-body {
      flex: 1; overflow-y: auto;
      padding: 16px;
      display: flex; flex-direction: column;
    }

    .state-center {
      flex: 1;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px; padding: 40px 20px; text-align: center;
    }
    .state-icon  { font-size: 48px; line-height: 1; margin: 0; }
    .state-text  { font-size: 16px; color: #64748b; margin: 0; }
    .state-sub   { font-size: 13px; color: #94a3b8; margin: 0; }
    .btn-retry {
      margin-top: 8px; padding: 8px 20px;
      border-radius: 8px; border: 1.5px solid #cbd5e1;
      background: white; color: #334155;
      font-family: inherit; font-size: 14px; cursor: pointer;
    }
    .btn-retry:hover { background: #f1f5f9; }

    .spinner {
      width: 32px; height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: #7c3aed;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .timeline {
      display: flex; flex-direction: column; gap: 20px;
    }

    .day-group { display: flex; flex-direction: column; gap: 10px; }

    .day-header {
      font-size: 12px; font-weight: 700; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 0.06em;
      padding-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
    }

    .day-records { display: flex; flex-direction: column; gap: 10px; }

    .record-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex; flex-direction: column; gap: 8px;
    }

    .record-badge {
      align-self: flex-start;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px; font-weight: 700;
    }

    .record-topic {
      font-size: 15px; font-weight: 600; color: #1e293b; margin: 0;
    }

    .record-summary {
      font-size: 13px; color: #475569; line-height: 1.6; margin: 0;
    }

    .record-keywords {
      display: flex; flex-wrap: wrap; gap: 6px;
    }
    .kw-chip {
      padding: 3px 10px;
      background: #f1f5f9; border-radius: 16px;
      font-size: 12px; color: #64748b;
      border: 1px solid #e2e8f0;
    }

  `]
})
export class DailyLogsComponent implements OnInit {
  protected tutor = inject(TutorService);
  private recordsService = inject(LearningRecordsService);

  protected loading = signal(true);
  protected error   = signal(false);
  protected groups  = signal<DailyLogGroup[]>([]);

  ngOnInit(): void { this.load(); }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const data = await this.recordsService.getTimeline();
      this.groups.set(data);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected docType(type: string) {
    return DOC_TYPES[type] ?? { label: type || 'ไม่ทราบประเภท', icon: '📄', bg: '#f1f5f9', color: '#475569' };
  }

  protected formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  protected truncate(text: string, max: number): string {
    return text.length <= max ? text : text.slice(0, max) + '…';
  }

}
