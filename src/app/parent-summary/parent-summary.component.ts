import { Component, inject, signal } from '@angular/core';
import { TutorService } from '../tutor.service';

@Component({
  selector: 'app-parent-summary',
  standalone: true,
  host: { '[class.collapsed]': 'collapsed()' },
  template: `
    <div class="panel">
      <button class="panel-header" (click)="toggle()" type="button">
        <span class="panel-icon">👨‍👩‍👧</span>
        <h2 class="panel-title">สรุปสำหรับผู้ปกครอง</h2>
        <span class="toggle-icon">{{ collapsed() ? '▶' : '▼' }}</span>
      </button>
      @if (!collapsed()) {
        <div class="panel-body">
          @if (tutorService.parentSummary()) {
            <pre class="summary-content">{{ tutorService.parentSummary() }}</pre>
          } @else {
            <p class="empty-hint">สรุปจะปรากฏหลังจากเรียนได้สักพัก...</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }
    :host.collapsed { flex: 0 0 auto !important; min-height: 0 !important; }

    .panel {
      background: var(--color-summary-bg);
      border: 1px solid var(--color-summary-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #dcfce7;
      width: 100%;
      border: none;
      border-bottom: 1px solid var(--color-summary-border);
      cursor: pointer;
      font-family: inherit;
      text-align: left;
    }
    .panel-header:hover { background: #bbf7d0; }

    .panel-icon { font-size: 20px; }

    .panel-title {
      font-size: 15px;
      font-weight: 700;
      color: #14532d;
      flex: 1;
    }

    .toggle-icon {
      font-size: 11px;
      color: #14532d;
      opacity: 0.7;
    }

    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px;
    }

    .summary-content {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 13.5px;
      line-height: 1.7;
      color: var(--color-text);
    }

    .empty-hint {
      color: var(--color-text-muted);
      font-size: 13.5px;
      font-style: italic;
      text-align: center;
      padding-top: 20px;
    }
  `]
})
export class ParentSummaryComponent {
  protected tutorService = inject(TutorService);
  protected collapsed = signal(true);
  protected toggle() { this.collapsed.update(v => !v); }
}
