import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

interface DiscoveryNotes {
  keyObservations: string;
  validatedDiscoveries: string;
  unconfirmedSignals: string;
  productDecisions: string;
  nextQuestions: string;
}

interface BatchSummary {
  batchId: string;
  createdAt: string;
  reviewedAt: string | null;
  status: 'draft' | 'reviewed';
  sessionCount: number;
  notes: DiscoveryNotes;
}

const API = '/api/admin/discovery-batches';

@Component({
  selector: 'app-discovery-batches',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="admin-wrap">
      <div class="admin-container">

        <header class="admin-header">
          <div class="admin-header-row">
            <div>
              <h1 class="admin-title">🔍 Discovery Batch Review</h1>
              <p class="admin-sub">Internal tool — not visible to users</p>
            </div>
            <a class="btn btn-reset" href="/reset" title="ล้าง localStorage ทั้งหมด (student ID, ชื่อ, onboarding)">
              🗑 Reset LocalStorage
            </a>
          </div>
        </header>

        <!-- Unreviewed count + Create -->
        <div class="top-bar">
          <div class="unreviewed-badge">
            <span class="badge-label">Unreviewed Sessions</span>
            <span class="badge-count">{{ unreviewedCount() }}</span>
          </div>
          <button
            class="btn btn-primary"
            (click)="createBatch()"
            [disabled]="creating() || unreviewedCount() === 0"
          >
            {{ creating() ? 'Creating…' : '+ Create Batch From Latest 10 Sessions' }}
          </button>
        </div>

        @if (createError()) {
          <p class="error-msg">{{ createError() }}</p>
        }

        <!-- Batch List -->
        <section class="batch-list">
          <h2 class="section-title">Batch List</h2>

          @if (loading()) {
            <p class="loading-text">Loading…</p>
          } @else if (batches().length === 0) {
            <div class="empty-state">
              <p>ยังไม่มี Batch — กด Create เพื่อเริ่มต้น</p>
            </div>
          } @else {
            @for (batch of batches(); track batch.batchId) {
              <div class="batch-card" [class.reviewed]="batch.status === 'reviewed'">

                <div class="batch-header">
                  <div class="batch-meta">
                    <span class="batch-id">{{ batch.batchId }}</span>
                    <span class="batch-status" [class.status-reviewed]="batch.status === 'reviewed'">
                      {{ batch.status === 'reviewed' ? 'Reviewed' : 'Draft' }}
                    </span>
                  </div>
                  <div class="batch-info">
                    <span>Sessions: {{ batch.sessionCount }}</span>
                    <span>Created: {{ formatDate(batch.createdAt) }}</span>
                    @if (batch.reviewedAt) {
                      <span>Reviewed: {{ formatDate(batch.reviewedAt) }}</span>
                    }
                  </div>
                </div>

                <div class="batch-actions">
                  <button class="btn btn-sm btn-outline" (click)="downloadBatch(batch.batchId)">
                    ⬇ Download JSON
                  </button>
                  @if (batch.status === 'draft') {
                    <button class="btn btn-sm btn-outline" (click)="toggleNotes(batch.batchId)">
                      {{ editingBatchId() === batch.batchId ? '✕ Close Notes' : '✏ Edit Notes' }}
                    </button>
                    <button class="btn btn-sm btn-success" (click)="markReviewed(batch.batchId)">
                      ✅ Mark Reviewed
                    </button>
                  } @else {
                    <button class="btn btn-sm btn-outline" (click)="toggleNotes(batch.batchId)">
                      {{ editingBatchId() === batch.batchId ? '✕ Close Notes' : '📄 View Notes' }}
                    </button>
                  }
                </div>

                <!-- Notes form / view -->
                @if (editingBatchId() === batch.batchId) {
                  <div class="notes-panel">
                    <h3 class="notes-title">Discovery Notes</h3>
                    <div class="notes-grid">
                      @for (field of noteFields; track field.key) {
                        <div class="notes-field">
                          <label class="notes-label">{{ field.label }}</label>
                          @if (batch.status === 'draft') {
                            <textarea
                              class="notes-input"
                              [(ngModel)]="noteDrafts[batch.batchId + '.' + field.key]"
                              rows="3"
                              [placeholder]="field.placeholder"
                            ></textarea>
                          } @else {
                            <p class="notes-readonly">
                              {{ getNoteValue(batch, field.key) || '—' }}
                            </p>
                          }
                        </div>
                      }
                    </div>
                    @if (batch.status === 'draft') {
                      <button class="btn btn-primary" (click)="saveNotes(batch)">
                        💾 Save Notes
                      </button>
                    }
                  </div>
                }

              </div>
            }
          }
        </section>

      </div>
    </div>
  `,
  styles: [`
    .admin-wrap {
      min-height: 100vh;
      background: #f1f5f9;
      padding: 24px 16px;
      font-family: inherit;
    }

    .admin-container {
      max-width: 860px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .admin-header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
    .admin-header-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .admin-title  { font-size: 22px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
    .admin-sub    { font-size: 12px; color: #94a3b8; margin: 0; }
    .btn-reset    { background: #fee2e2; color: #991b1b; border: 1.5px solid #fca5a5; text-decoration: none; font-size: 12.5px; }
    .btn-reset:hover { background: #fecaca; opacity: 1; }

    .top-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .unreviewed-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 16px;
    }
    .badge-label { font-size: 13px; color: #475569; }
    .badge-count { font-size: 22px; font-weight: 700; color: #1e40af; }

    .btn {
      padding: 10px 18px;
      border-radius: 8px;
      border: none;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
      white-space: nowrap;
    }
    .btn:hover:not(:disabled) { opacity: 0.85; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary  { background: #2563eb; color: white; }
    .btn-success  { background: #16a34a; color: white; }
    .btn-outline  { background: white; color: #374151; border: 1.5px solid #d1d5db; }
    .btn-sm       { padding: 6px 12px; font-size: 12.5px; }

    .error-msg { color: #dc2626; font-size: 13px; margin: 0; }

    .section-title { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }

    .loading-text { color: #94a3b8; font-size: 13px; }

    .empty-state {
      background: white;
      border: 1px dashed #cbd5e1;
      border-radius: 10px;
      padding: 32px;
      text-align: center;
      color: #94a3b8;
      font-size: 13.5px;
    }

    .batch-list { display: flex; flex-direction: column; gap: 12px; }

    .batch-card {
      background: white;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    .batch-card.reviewed { border-color: #bbf7d0; background: #f0fdf4; }

    .batch-header {
      padding: 14px 16px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .batch-meta {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .batch-id {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      font-family: monospace;
    }

    .batch-status {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
      background: #fef9c3;
      color: #854d0e;
      text-transform: uppercase;
    }
    .batch-status.status-reviewed {
      background: #dcfce7;
      color: #15803d;
    }

    .batch-info {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #64748b;
      flex-wrap: wrap;
    }

    .batch-actions {
      padding: 0 16px 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .notes-panel {
      border-top: 1px solid #e2e8f0;
      padding: 16px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .notes-title { font-size: 13px; font-weight: 700; color: #1e293b; margin: 0; }

    .notes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    @media (max-width: 600px) {
      .notes-grid { grid-template-columns: 1fr; }
    }

    .notes-field { display: flex; flex-direction: column; gap: 4px; }

    .notes-label {
      font-size: 11.5px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .notes-input {
      padding: 8px 10px;
      border: 1.5px solid #e2e8f0;
      border-radius: 6px;
      font-family: inherit;
      font-size: 13px;
      color: #374151;
      resize: vertical;
    }
    .notes-input:focus { outline: none; border-color: #93c5fd; }

    .notes-readonly {
      font-size: 13px;
      color: #374151;
      line-height: 1.6;
      margin: 0;
      padding: 8px 10px;
      background: #f1f5f9;
      border-radius: 6px;
      min-height: 40px;
      white-space: pre-wrap;
    }
  `]
})
export class DiscoveryBatchesComponent implements OnInit {
  private http = inject(HttpClient);

  protected unreviewedCount = signal(0);
  protected batches = signal<BatchSummary[]>([]);
  protected loading = signal(true);
  protected creating = signal(false);
  protected createError = signal('');
  protected editingBatchId = signal('');

  protected noteDrafts: Record<string, string> = {};

  protected noteFields = [
    { key: 'keyObservations',    label: 'Key Observations',    placeholder: 'สิ่งที่สังเกตได้จาก session นี้...' },
    { key: 'validatedDiscoveries', label: 'Validated Discoveries', placeholder: 'Discovery ที่ได้รับการยืนยัน...' },
    { key: 'unconfirmedSignals',  label: 'Unconfirmed Signals',  placeholder: 'สัญญาณที่ยังต้องการข้อมูลเพิ่ม...' },
    { key: 'productDecisions',    label: 'Product Decisions',   placeholder: 'การตัดสินใจเกี่ยวกับ product...' },
    { key: 'nextQuestions',       label: 'Next Questions',      placeholder: 'คำถามที่ต้องหาคำตอบต่อ...' },
  ];

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadUnreviewedCount(), this.loadBatches()]);
    this.loading.set(false);
  }

  protected async createBatch(): Promise<void> {
    this.creating.set(true);
    this.createError.set('');
    try {
      await firstValueFrom(this.http.post(`${API}`, { maxSessions: 10 }));
      await Promise.all([this.loadUnreviewedCount(), this.loadBatches()]);
    } catch {
      this.createError.set('ไม่สามารถสร้าง Batch ได้ กรุณาลองใหม่');
    } finally {
      this.creating.set(false);
    }
  }

  protected async downloadBatch(batchId: string): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get(`${API}/${batchId}/export`));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${batchId}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('ไม่สามารถ Export ได้');
    }
  }

  protected toggleNotes(batchId: string): void {
    if (this.editingBatchId() === batchId) {
      this.editingBatchId.set('');
    } else {
      // Pre-fill draft from existing notes
      const batch = this.batches().find(b => b.batchId === batchId);
      if (batch) {
        for (const f of this.noteFields) {
          this.noteDrafts[`${batchId}.${f.key}`] =
            (batch.notes as any)[f.key] ?? '';
        }
      }
      this.editingBatchId.set(batchId);
    }
  }

  protected async saveNotes(batch: BatchSummary): Promise<void> {
    const notes: Record<string, string> = {};
    for (const f of this.noteFields) {
      notes[f.key] = this.noteDrafts[`${batch.batchId}.${f.key}`] ?? '';
    }
    try {
      await firstValueFrom(this.http.put(`${API}/${batch.batchId}/notes`, notes));
      await this.loadBatches();
    } catch {
      alert('ไม่สามารถบันทึก Notes ได้');
    }
  }

  protected async markReviewed(batchId: string): Promise<void> {
    if (!confirm(`Mark ${batchId} as Reviewed?`)) return;
    try {
      await firstValueFrom(this.http.post(`${API}/${batchId}/mark-reviewed`, {}));
      this.editingBatchId.set('');
      await this.loadBatches();
    } catch {
      alert('ไม่สามารถ Mark Reviewed ได้');
    }
  }

  protected getNoteValue(batch: BatchSummary, key: string): string {
    return (batch.notes as any)[key] ?? '';
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleString('th-TH', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  private async loadUnreviewedCount(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ unreviewedSessions: number }>(`${API}/unreviewed-count`)
      );
      this.unreviewedCount.set(res.unreviewedSessions);
    } catch { /* silent */ }
  }

  private async loadBatches(): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.get<BatchSummary[]>(`${API}`));
      this.batches.set(res);
    } catch { /* silent */ }
  }
}
