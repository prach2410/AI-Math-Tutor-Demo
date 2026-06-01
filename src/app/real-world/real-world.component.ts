import { Component, inject, signal } from '@angular/core';
import { TutorService } from '../tutor.service';

@Component({
  selector: 'app-real-world',
  standalone: true,
  host: { '[class.collapsed]': 'collapsed()' },
  template: `
    <div class="panel">
      <button class="panel-header" (click)="toggle()" type="button">
        <span class="panel-icon">💡</span>
        <h2 class="panel-title">ใช้ในชีวิตจริง</h2>
        <span class="toggle-icon">{{ collapsed() ? '▶' : '▼' }}</span>
      </button>
      @if (!collapsed()) {
        <div class="panel-body">
          @if (tutor.realWorldUses().length > 0) {
            <ul class="uses-list">
              @for (use of tutor.realWorldUses(); track use) {
                <li class="use-item">{{ use }}</li>
              }
            </ul>
          } @else {
            <p class="empty-hint">เลือก scenario เพื่อดูการใช้งานจริงครับ</p>
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
      background: #fff7ed;
      border: 1px solid #fed7aa;
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
      padding: 10px 14px;
      border-bottom: 1px solid #fed7aa;
      background: #ffedd5;
      width: 100%;
      border: none;
      border-bottom: 1px solid #fed7aa;
      cursor: pointer;
      font-family: inherit;
      text-align: left;
    }
    .panel-header:hover { background: #fde8c8; }

    .panel-icon { font-size: 18px; }

    .panel-title {
      font-size: 14px;
      font-weight: 700;
      color: #9a3412;
      flex: 1;
    }

    .toggle-icon {
      font-size: 11px;
      color: #9a3412;
      opacity: 0.7;
    }

    .panel-body {
      overflow-y: auto;
      padding: 12px 14px;
      max-height: 150px;
    }

    .uses-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .use-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13.5px;
      color: var(--color-text);
    }

    .use-item::before {
      content: '✓';
      color: #ea580c;
      font-weight: 700;
      flex-shrink: 0;
    }

    .empty-hint {
      color: var(--color-text-muted);
      font-size: 13px;
      font-style: italic;
    }
  `]
})
export class RealWorldComponent {
  protected tutor = inject(TutorService);
  protected collapsed = signal(false);
  protected toggle() { this.collapsed.update(v => !v); }
}
