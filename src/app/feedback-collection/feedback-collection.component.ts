import { Component, signal } from '@angular/core';

const FORM_URL = 'https://forms.gle/q9eV47ktwTvXhT2NA';

@Component({
  selector: 'app-feedback-collection',
  standalone: true,
  host: { '[class.collapsed]': 'collapsed()' },
  template: `
    <div class="card">
      <button class="card-header" (click)="toggle()" type="button">
        <span class="card-icon">🙏</span>
        <h2 class="card-title">ช่วยพัฒนา AI Tutor</h2>
        <span class="toggle-icon">{{ collapsed() ? '▶' : '▼' }}</span>
      </button>
      @if (!collapsed()) {
        <div class="card-body">
          <p class="card-desc">
            โครงการนี้เริ่มต้นจากความตั้งใจของพ่อคนหนึ่ง<br>
            ที่อยากช่วยให้ลูกเรียนคณิตศาสตร์ได้ดีขึ้น
          </p>
          <p class="card-sub">
            ความคิดเห็นของคุณจะช่วยให้เราพัฒนาระบบ<br>
            ให้ตอบโจทย์นักเรียนและผู้ปกครองได้ดียิ่งขึ้น
          </p>
          <a class="feedback-btn" [href]="formUrl" target="_blank" rel="noopener">
            💬 ความคิดเห็น
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    :host.collapsed { flex: 0 0 auto; }

    .card {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #dbeafe;
      width: 100%;
      border: none;
      border-bottom: 1px solid #bfdbfe;
      cursor: pointer;
      font-family: inherit;
      text-align: left;
    }
    .card-header:hover { background: #bfdbfe; }

    .card-icon { font-size: 18px; }

    .card-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e3a8a;
      flex: 1;
    }

    .toggle-icon {
      font-size: 11px;
      color: #1e3a8a;
      opacity: 0.7;
    }

    .card-body {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-desc {
      font-size: 13px;
      line-height: 1.6;
      color: var(--color-text);
    }

    .card-sub {
      font-size: 12.5px;
      line-height: 1.6;
      color: var(--color-text-muted);
    }

    .feedback-btn {
      display: inline-block;
      margin-top: 4px;
      padding: 8px 18px;
      background: #2563eb;
      color: white;
      border-radius: 20px;
      font-size: 13.5px;
      font-weight: 600;
      text-decoration: none;
      text-align: center;
      transition: background 0.15s;
      align-self: flex-start;
    }

    .feedback-btn:hover { background: #1d4ed8; }
  `]
})
export class FeedbackCollectionComponent {
  protected formUrl = FORM_URL;
  protected collapsed = signal(true);
  protected toggle() { this.collapsed.update(v => !v); }
}
