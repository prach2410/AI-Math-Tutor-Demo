import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface LearningRecord {
  id: string;
  date: string;
  documentType: string;
  topic: string;
  summary: string;
  keywords: string[];
  createdAt: string;
  downloadedAt: string;
  reflection?: string;
  visionModel?: string;
  analysisStartedAt?: string;
  analysisEndedAt?: string;
}

interface HomeworkRead {
  id: number;
  date: string;
  topic: string;
  readable: boolean;
  reason: string;
  createdAt: string;
  visionModel?: string;
  analysisStartedAt?: string;
  analysisEndedAt?: string;
  taught?: boolean;
  studentName?: string;
}

interface HomeworkSession {
  id: string;
  date: string;
  topic: string;
  problemText: string;
  status: string;
  mode: string;
  createdAt: string;
  downloadedAt: string;
  visionModel?: string;
  analysisStartedAt?: string;
  analysisEndedAt?: string;
  studentName?: string;
}

interface DayGroup {
  date: string;
  learningRecords: LearningRecord[];
  homeworkReads: HomeworkRead[];
  homeworkSessions: HomeworkSession[];
}

interface ApiResponse {
  weekStart: string;
  weekEnd: string;
  learningRecords: LearningRecord[];
  homeworkReads: HomeworkRead[];
  homeworkSessions: HomeworkSession[];
}

interface RecallEvent {
  id: number;
  at: string;
  kind: string;        // shown | miss | answered
  topic: string;
  todayTopic: string;
}

interface RecallEventsData {
  counts: { shown: number; miss: number; answered: number };
  recent: RecallEvent[];
}

const MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

@Component({
  selector: 'app-admin-export',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="admin-wrap">
      <div class="admin-container">

        <header class="admin-header">
          <h1 class="admin-title">📤 Admin Export</h1>
          <div class="week-nav">
            <button class="nav-btn" (click)="prevWeek()">◀</button>
            <span class="week-label">{{ weekLabel() }}</span>
            <button class="nav-btn" (click)="nextWeek()">▶</button>
            <button class="today-btn" (click)="goToday()">สัปดาห์นี้</button>
          </div>
          @if (studentNames().length > 0) {
            <div class="student-filter">
              <span class="filter-label">👦 ดูของ:</span>
              <select class="filter-select" [(ngModel)]="studentFilterValue">
                <option value="">ทุกคน</option>
                @for (name of studentNames(); track name) {
                  <option [value]="name">{{ name }}</option>
                }
              </select>
            </div>
          }
        </header>

        @if (recall(); as rc) {
          <div class="recall-card">
            <div class="recall-head">
              <span class="recall-title">🔄 Session Continuity — Recall</span>
              <button class="recall-refresh" (click)="loadRecall()">↻</button>
            </div>
            <div class="recall-stats">
              <div class="recall-stat"><span class="rs-num">{{ rc.counts.shown }}</span><span class="rs-lbl">shown</span></div>
              <div class="recall-stat"><span class="rs-num">{{ rc.counts.miss }}</span><span class="rs-lbl">miss (R7)</span></div>
              <div class="recall-stat"><span class="rs-num">{{ rc.counts.answered }}</span><span class="rs-lbl">answered</span></div>
            </div>
            @if (rc.counts.shown + rc.counts.miss > 0) {
              <p class="recall-r7">R7 shown-rate: {{ recallShownRate(rc) }}% ({{ rc.counts.shown }}/{{ rc.counts.shown + rc.counts.miss }}) — ต่ำ = exact-match แคบไป</p>
            }
            @if (rc.recent.length > 0) {
              <ul class="recall-list">
                @for (e of rc.recent; track e.id) {
                  <li class="recall-item">
                    <span class="recall-kind" [class]="'rk-' + e.kind">{{ e.kind }}</span>
                    <span class="recall-topic">{{ e.topic }}{{ e.kind === 'miss' ? ' → ' + e.todayTopic : '' }}</span>
                    <span class="recall-at">{{ formatTime(e.at) }}</span>
                  </li>
                }
              </ul>
            } @else {
              <p class="recall-empty">ยังไม่มี recall event (forward-only — รอ learner กลับมาด้วย topic เดิม)</p>
            }
          </div>
        }

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
        } @else if (dayGroups().length === 0) {
          <div class="state-center">
            <p class="state-text">ไม่มีข้อมูลในสัปดาห์นี้</p>
          </div>
        } @else {
          <div class="timeline">
            @for (day of dayGroups(); track day.date) {
              <div class="day-group">
                <div class="day-header">{{ formatDay(day.date) }}</div>

                @if (day.learningRecords.length > 0) {
                  <div class="sub-section">
                    <div class="sub-title">📚 สิ่งที่เรียน</div>
                    <ul class="record-list">
                      @for (r of day.learningRecords; track r.id) {
                        <li class="record-item">
                          <span class="record-badge">{{ r.documentType }}</span>
                          <div class="record-main">
                            <span class="record-topic">{{ r.topic }}</span>
                            <span class="record-meta">
                              @if (r.visionModel) { ⚡ {{ r.visionModel }} · {{ analysisDuration(r) }}s · }{{ formatTime(r.createdAt) }}
                            </span>
                          </div>
                          @if (r.reflection) {
                            <span class="reflection-chip">{{ reflectionEmoji(r.reflection) }}</span>
                          }
                          @if (r.downloadedAt) {
                            <span class="dl-done-chip">✅ {{ fmtDl(r.downloadedAt) }}</span>
                          }
                          <button class="dl-btn" title="download .md" (click)="downloadLearning(r.id)">⬇️</button>
                          <button class="del-btn" title="ลบ" (click)="deleteLearning(r.id)">🗑️</button>
                        </li>
                      }
                    </ul>
                  </div>
                }

                @if (day.homeworkReads.length > 0) {
                  <div class="sub-section">
                    <div class="sub-title">📤 อัพโหลดการบ้าน</div>
                    <ul class="record-list">
                      @for (r of day.homeworkReads; track r.id) {
                        <li class="record-item">
                          <span class="record-badge">{{ r.readable ? '✅ อ่านได้' : '❌ อ่านไม่ได้' }}</span>
                          <div class="record-main">
                            <span class="record-topic">{{ r.topic || '(ไม่ระบุหัวข้อ)' }}</span>
                            <span class="record-meta">
                              @if (r.visionModel) { ⚡ {{ r.visionModel }} · {{ hrDuration(r) }}s · }{{ formatTime(r.createdAt) }}
                            </span>
                          </div>
                          @if (r.studentName) {
                            <span class="sname-chip">👦 {{ r.studentName }}</span>
                          }
                          <span class="taught-chip" [class.taught]="r.taught">
                            {{ r.taught ? '✅ สอนแล้ว' : '⏳ ยังไม่สอน' }}
                          </span>
                          <button class="del-btn" title="ลบ" (click)="deleteHomeworkRead(r.id)">🗑️</button>
                        </li>
                      }
                    </ul>
                  </div>
                }

                @if (day.homeworkSessions.length > 0) {
                  <div class="sub-section">
                    <div class="sub-title">📷 การบ้าน (สอน)</div>
                    <ul class="record-list">
                      @for (s of day.homeworkSessions; track s.id) {
                        <li class="record-item">
                          <div class="record-main">
                            <span class="record-topic">{{ hwTitle(s) }}</span>
                            <span class="record-meta">
                              @if (s.visionModel) { ⚡ {{ s.visionModel }} · {{ hwDuration(s) }}s · }{{ formatTime(s.createdAt) }}
                            </span>
                          </div>
                          @if (s.studentName) {
                            <span class="sname-chip">👦 {{ s.studentName }}</span>
                          }
                          <span class="status-chip" [class.done]="s.status === 'done'">
                            {{ s.status === 'done' ? '✅ เสร็จ' : '🔄 กำลังทำ' }}
                          </span>
                          @if (s.downloadedAt) {
                            <span class="dl-done-chip">✅ {{ fmtDl(s.downloadedAt) }}</span>
                          }
                          <button class="dl-btn" title="download .md" (click)="downloadHomework(s.id)">⬇️</button>
                          <button class="del-btn" title="ลบ" (click)="deleteHomeworkSession(s.id)">🗑️</button>
                        </li>
                      }
                    </ul>
                  </div>
                }

              </div>
            }
          </div>
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
    /* Recall observability card */
    .recall-card { margin: 14px 16px 0; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
    .recall-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .recall-title { font-size: 14px; font-weight: 700; color: #1e293b; }
    .recall-refresh { border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer; padding: 2px 8px; font-size: 13px; }
    .recall-stats { display: flex; gap: 10px; }
    .recall-stat { flex: 1; text-align: center; background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 4px; }
    .rs-num { display: block; font-size: 22px; font-weight: 800; color: #1d4ed8; }
    .rs-lbl { font-size: 11px; color: #64748b; }
    .recall-r7 { font-size: 12px; color: #475569; margin: 8px 0 0; }
    .recall-list { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; max-height: 220px; overflow-y: auto; }
    .recall-item { display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 4px 6px; border-radius: 6px; background: white; border: 1px solid #eef2f7; }
    .recall-kind { font-weight: 700; padding: 1px 7px; border-radius: 10px; font-size: 11px; white-space: nowrap; }
    .rk-shown { background: #dcfce7; color: #166534; }
    .rk-miss { background: #fee2e2; color: #991b1b; }
    .rk-answered { background: #dbeafe; color: #1e40af; }
    .recall-topic { flex: 1; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .recall-at { color: #94a3b8; white-space: nowrap; }
    .recall-empty { font-size: 12px; color: #94a3b8; margin: 10px 0 0; }
    .admin-container {
      max-width: 680px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .admin-header {
      background: #1e3a8a;
      color: white;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .admin-title { margin: 0; font-size: 18px; font-weight: 700; }
    .week-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nav-btn {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      border-radius: 6px;
      width: 30px; height: 30px;
      cursor: pointer;
      font-size: 13px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.1s;
    }
    .nav-btn:hover { background: rgba(255,255,255,0.25); }
    .week-label {
      font-size: 13px;
      font-weight: 600;
      min-width: 150px;
      text-align: center;
    }
    .today-btn {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 12px;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.1s;
    }
    .today-btn:hover { background: rgba(255,255,255,0.25); }

    .timeline {
      padding: 16px 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .day-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .day-header {
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
    }
    .sub-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .sub-title {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
    }
    .record-list {
      list-style: none;
      padding: 0; margin: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .record-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }
    .record-badge {
      font-size: 11px;
      background: #dbeafe;
      color: #1e40af;
      padding: 2px 8px;
      border-radius: 20px;
      white-space: nowrap;
      flex-shrink: 0;
      font-weight: 500;
    }
    .record-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .record-topic {
      font-size: 14px;
      font-weight: 500;
      color: #1e293b;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .record-meta {
      font-size: 11px;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .status-chip {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .status-chip.done { color: #16a34a; font-weight: 600; }
    .reflection-chip {
      font-size: 14px;
      flex-shrink: 0;
    }
    .dl-done-chip {
      font-size: 11px;
      background: #dcfce7;
      color: #166534;
      padding: 2px 8px;
      border-radius: 20px;
      white-space: nowrap;
      flex-shrink: 0;
      font-weight: 500;
    }
    .taught-chip {
      font-size: 11px;
      background: #fef9c3;
      color: #854d0e;
      padding: 2px 8px;
      border-radius: 20px;
      white-space: nowrap;
      flex-shrink: 0;
      font-weight: 500;
    }
    .taught-chip.taught {
      background: #dcfce7;
      color: #166534;
    }
    .sname-chip {
      font-size: 11px;
      background: #ede9fe;
      color: #5b21b6;
      padding: 2px 8px;
      border-radius: 20px;
      white-space: nowrap;
      flex-shrink: 0;
      font-weight: 500;
    }
    .student-filter {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }
    .filter-label {
      font-size: 12px;
      color: rgba(255,255,255,0.8);
      white-space: nowrap;
    }
    .filter-select {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
      outline: none;
    }
    .filter-select option { background: #1e3a8a; color: white; }

    .dl-btn {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 4px 10px;
      cursor: pointer;
      font-size: 14px;
      flex-shrink: 0;
      transition: background 0.1s, border-color 0.1s;
    }
    .dl-btn:hover { background: #eff6ff; border-color: #bfdbfe; }
    .del-btn {
      background: white; border: 1px solid #fecaca;
      border-radius: 6px; padding: 4px 10px;
      cursor: pointer; font-size: 14px; flex-shrink: 0;
      transition: background 0.1s, border-color 0.1s;
    }
    .del-btn:hover { background: #fef2f2; border-color: #f87171; }

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
  `]
})
export class AdminExportComponent implements OnInit {
  private http = inject(HttpClient);

  weekOf    = signal(this.todayLocal());
  weekStart = signal('');
  weekEnd   = signal('');
  loading   = signal(false);
  error     = signal('');

  private rawLr = signal<LearningRecord[]>([]);
  private rawHr = signal<HomeworkRead[]>([]);
  private rawHw = signal<HomeworkSession[]>([]);
  private studentFilter = signal('');

  get studentFilterValue(): string { return this.studentFilter(); }
  set studentFilterValue(v: string) { this.studentFilter.set(v); }

  studentNames = computed(() => {
    const names = new Set<string>();
    for (const r of this.rawHr()) if (r.studentName) names.add(r.studentName);
    for (const s of this.rawHw()) if (s.studentName) names.add(s.studentName);
    return [...names].sort();
  });

  dayGroups = computed(() => {
    const filter = this.studentFilter();
    const hr = filter ? this.rawHr().filter(r => r.studentName === filter) : this.rawHr();
    const hw = filter ? this.rawHw().filter(s => s.studentName === filter) : this.rawHw();
    return this.groupByDate(this.rawLr(), hr, hw);
  });

  weekLabel = computed(() => {
    const s = this.weekStart();
    const e = this.weekEnd();
    if (!s || !e) return '...';
    const [sy, sm, sd] = s.split('-').map(Number);
    const [, em, ed]   = e.split('-').map(Number);
    if (sm === em) return `${sd}–${ed} ${MONTHS_SHORT[sm-1]} ${sy}`;
    return `${sd} ${MONTHS_SHORT[sm-1]} – ${ed} ${MONTHS_SHORT[em-1]} ${sy}`;
  });

  // recall observability (session continuity) — R7 shown:miss
  recall = signal<RecallEventsData | null>(null);

  ngOnInit() { this.load(); this.loadRecall(); }

  async loadRecall() {
    try {
      this.recall.set(await firstValueFrom(this.http.get<RecallEventsData>('/api/admin/recall-events')));
    } catch { this.recall.set(null); }
  }

  recallShownRate(rc: RecallEventsData): number {
    const total = rc.counts.shown + rc.counts.miss;
    return total === 0 ? 0 : Math.round((rc.counts.shown / total) * 100);
  }

  prevWeek()  { this.weekOf.set(this.addDays(this.weekOf(), -7)); this.load(); }
  nextWeek()  { this.weekOf.set(this.addDays(this.weekOf(), 7));  this.load(); }
  goToday()   { this.weekOf.set(this.todayLocal()); this.load(); }

  async load() {
    this.loading.set(true);
    this.error.set('');
    this.studentFilter.set('');
    try {
      const data = await firstValueFrom(
        this.http.get<ApiResponse>(`/api/admin/sessions?weekOf=${this.weekOf()}`)
      );
      this.weekStart.set(data.weekStart);
      this.weekEnd.set(data.weekEnd);
      this.rawLr.set(data.learningRecords);
      this.rawHr.set(data.homeworkReads ?? []);
      this.rawHw.set(data.homeworkSessions);
    } catch {
      this.error.set('โหลดข้อมูลไม่ได้ กรุณาลองใหม่');
    } finally {
      this.loading.set(false);
    }
  }

  formatDay(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  downloadLearning(id: string) {
    const a = document.createElement('a');
    a.href = `/api/learning-records/${id}/export`;
    a.click();
    this.markDownloaded('learning', id);
  }

  downloadHomework(id: string) {
    const a = document.createElement('a');
    a.href = `/api/admin/export/homework/${id}`;
    a.click();
    this.markDownloaded('homework', id);
  }

  reflectionEmoji(val: string): string {
    const map: Record<string, string> = {
      'Understood':           '🟢',
      'StartingToUnderstand': '🟡',
      'StillConfused':        '🟠',
      'NotUnderstand':        '🔴',
    };
    return map[val] ?? '';
  }

  fmtDl(isoStr: string): string {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  }

  formatTime(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  hwDuration(s: HomeworkSession): string {
    if (!s.analysisStartedAt || !s.analysisEndedAt) return '?';
    const ms = new Date(s.analysisEndedAt).getTime() - new Date(s.analysisStartedAt).getTime();
    return (ms / 1000).toFixed(1);
  }

  // typed problems มี topic ว่าง (ไม่ผ่าน OCR จัดหมวด) → fallback เป็นตัวโจทย์ที่พิมพ์
  hwTitle(s: HomeworkSession): string {
    if (s.topic?.trim()) return s.topic;
    const t = s.problemText?.trim() ?? '';
    if (!t) return '(ไม่ระบุหัวข้อ)';
    return t.length > 60 ? t.slice(0, 60) + '…' : t;
  }

  hrDuration(r: HomeworkRead): string {
    if (!r.analysisStartedAt || !r.analysisEndedAt) return '?';
    const ms = new Date(r.analysisEndedAt).getTime() - new Date(r.analysisStartedAt).getTime();
    return (ms / 1000).toFixed(1);
  }

  analysisDuration(r: LearningRecord): string {
    if (!r.analysisStartedAt || !r.analysisEndedAt) return '?';
    const ms = new Date(r.analysisEndedAt).getTime() - new Date(r.analysisStartedAt).getTime();
    return (ms / 1000).toFixed(1);
  }

  async deleteLearning(id: string): Promise<void> {
    if (!confirm('ลบรายการนี้?')) return;
    await firstValueFrom(this.http.delete(`/api/admin/learning-record/${id}`));
    this.rawLr.update(items => items.filter(r => r.id !== id));
  }

  async deleteHomeworkRead(id: number): Promise<void> {
    if (!confirm('ลบรายการนี้?')) return;
    await firstValueFrom(this.http.delete(`/api/admin/homework-read/${id}`));
    this.rawHr.update(items => items.filter(r => r.id !== id));
  }

  async deleteHomeworkSession(id: string): Promise<void> {
    if (!confirm('ลบรายการนี้?')) return;
    await firstValueFrom(this.http.delete(`/api/admin/homework-session/${id}`));
    this.rawHw.update(items => items.filter(s => s.id !== id));
  }

  private markDownloaded(type: 'learning' | 'homework', id: string): void {
    const now = new Date().toISOString();
    if (type === 'learning') {
      this.rawLr.update(items => items.map(r => r.id === id ? { ...r, downloadedAt: now } : r));
    } else {
      this.rawHw.update(items => items.map(s => s.id === id ? { ...s, downloadedAt: now } : s));
    }
  }

  private groupByDate(lrs: LearningRecord[], hrs: HomeworkRead[], hws: HomeworkSession[]): DayGroup[] {
    const map = new Map<string, DayGroup>();
    const ensure = (date: string) => {
      if (!map.has(date)) map.set(date, { date, learningRecords: [], homeworkReads: [], homeworkSessions: [] });
      return map.get(date)!;
    };
    for (const r of lrs) ensure(r.date).learningRecords.push(r);
    for (const r of hrs) ensure(r.date).homeworkReads.push(r);
    for (const s of hws) ensure(s.date).homeworkSessions.push(s);
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  private todayLocal(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  }

  private addDays(dateStr: string, days: number): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d + days);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  }
}
