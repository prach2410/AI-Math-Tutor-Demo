import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

interface LearningRecord {
  id: string;
  documentType: string;
  topic: string;
  summary: string;
  keywords: string[];
  createdAt: string;
}

interface HomeworkSession {
  id: string;
  topic: string;
  problemText: string;
  status: string;
  mode: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-export',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="admin-wrap">
      <div class="admin-container">

        <header class="admin-header">
          <h1 class="admin-title">📤 Admin Export</h1>
          <div class="date-row">
            <label class="date-label">วันที่</label>
            <input
              type="date"
              class="date-input"
              [ngModel]="selectedDate()"
              (ngModelChange)="onDateChange($event)"
            />
          </div>
        </header>

        @if (loading()) {
          <div class="state-center">
            <div class="spinner"></div>
            <p class="state-text">กำลังโหลด...</p>
          </div>
        } @else if (error()) {
          <div class="state-center">
            <p class="error-text">{{ error() }}</p>
            <button class="retry-btn" (click)="load()">ลองใหม่</button>
          </div>
        } @else {

          <section class="section">
            <h2 class="section-title">📚 สิ่งที่เรียน ({{ learningRecords().length }} รายการ)</h2>
            @if (learningRecords().length === 0) {
              <p class="empty-text">ไม่มีข้อมูลสำหรับวันนี้</p>
            } @else {
              <ul class="record-list">
                @for (r of learningRecords(); track r.id) {
                  <li class="record-item">
                    <span class="record-badge">{{ r.documentType }}</span>
                    <span class="record-topic">{{ r.topic }}</span>
                    <button class="dl-btn" title="download .md" (click)="downloadLearning(r.id)">⬇️</button>
                  </li>
                }
              </ul>
            }
          </section>

          <section class="section">
            <h2 class="section-title">📷 โจทย์การบ้าน ({{ homeworkSessions().length }} รายการ)</h2>
            @if (homeworkSessions().length === 0) {
              <p class="empty-text">ไม่มีข้อมูลสำหรับวันนี้</p>
            } @else {
              <ul class="record-list">
                @for (s of homeworkSessions(); track s.id) {
                  <li class="record-item">
                    <span class="record-topic">{{ s.topic }}</span>
                    <span class="status-chip" [class.done]="s.status === 'done'">
                      {{ s.status === 'done' ? '✅ เสร็จ' : '🔄 กำลังทำ' }}
                    </span>
                    <button class="dl-btn" title="download .md" (click)="downloadHomework(s.id)">⬇️</button>
                  </li>
                }
              </ul>
            }
          </section>

        }

      </div>
    </div>
  `,
  styles: [`
    .admin-wrap {
      min-height: 100vh;
      background: #f1f5f9;
      padding: 32px 16px;
      box-sizing: border-box;
    }
    .admin-container {
      max-width: 640px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .admin-header {
      background: #1e3a8a;
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .admin-title { margin: 0; font-size: 18px; font-weight: 700; }
    .date-row { display: flex; align-items: center; gap: 8px; }
    .date-label { font-size: 14px; opacity: 0.85; }
    .date-input {
      padding: 6px 10px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      color: #1e293b;
      cursor: pointer;
    }
    .section {
      padding: 20px 24px;
      border-bottom: 1px solid #f1f5f9;
    }
    .section:last-child { border-bottom: none; }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e3a8a;
      margin: 0 0 12px;
    }
    .record-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .record-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }
    .record-badge {
      font-size: 11px;
      background: #dbeafe;
      color: #1e40af;
      padding: 3px 8px;
      border-radius: 20px;
      white-space: nowrap;
      flex-shrink: 0;
      font-weight: 500;
    }
    .record-topic {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #1e293b;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .status-chip {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .status-chip.done { color: #16a34a; font-weight: 600; }
    .dl-btn {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 5px 10px;
      cursor: pointer;
      font-size: 14px;
      flex-shrink: 0;
      transition: background 0.1s, border-color 0.1s;
    }
    .dl-btn:hover { background: #eff6ff; border-color: #bfdbfe; }
    .state-center {
      padding: 48px 24px;
      text-align: center;
      color: #64748b;
    }
    .spinner {
      width: 32px; height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: #1e3a8a;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 14px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .state-text { margin: 0; font-size: 14px; }
    .error-text { color: #dc2626; margin: 0 0 12px; }
    .retry-btn {
      padding: 8px 20px;
      background: #1e3a8a;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    }
    .empty-text { color: #94a3b8; font-size: 14px; margin: 4px 0; }
  `]
})
export class AdminExportComponent implements OnInit {
  private http = inject(HttpClient);

  selectedDate     = signal(new Date().toISOString().slice(0, 10));
  loading          = signal(false);
  error            = signal('');
  learningRecords  = signal<LearningRecord[]>([]);
  homeworkSessions = signal<HomeworkSession[]>([]);

  ngOnInit() { this.load(); }

  onDateChange(date: string) {
    this.selectedDate.set(date);
    this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      const data = await firstValueFrom(
        this.http.get<{ learningRecords: LearningRecord[]; homeworkSessions: HomeworkSession[] }>(
          `/api/admin/sessions?date=${this.selectedDate()}`
        )
      );
      this.learningRecords.set(data.learningRecords);
      this.homeworkSessions.set(data.homeworkSessions);
    } catch {
      this.error.set('โหลดข้อมูลไม่ได้ กรุณาลองใหม่');
    } finally {
      this.loading.set(false);
    }
  }

  downloadLearning(id: string) {
    const a = document.createElement('a');
    a.href = `/api/learning-records/${id}/export`;
    a.click();
  }

  downloadHomework(id: string) {
    const a = document.createElement('a');
    a.href = `/api/admin/export/homework/${id}`;
    a.click();
  }
}
