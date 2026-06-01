import { Component, inject, signal } from '@angular/core';
import { TutorService } from '../tutor.service';

@Component({
  selector: 'app-learning-feedback',
  standalone: true,
  host: { '[class.collapsed]': 'collapsed()' },
  template: `
    @if (tutor.studentFeedback() || tutor.parentCoaching()) {
      <div class="panel">
        <button class="panel-header" (click)="toggle()" type="button">
          <span class="panel-icon">🌟</span>
          <h2 class="panel-title">Feedback จาก AI Tutor</h2>
          <span class="toggle-icon">{{ collapsed() ? '▶' : '▼' }}</span>
        </button>
        @if (!collapsed()) {
          <div class="panel-body">
            @if (tutor.studentFeedback()) {
              <pre class="feedback-content">{{ tutor.studentFeedback() }}</pre>
            }
            @if (tutor.parentCoaching()) {
              <hr class="divider" />
              <pre class="feedback-content coaching">{{ tutor.parentCoaching() }}</pre>
            }
          </div>
        }
      </div>
    }
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
      background: #fefce8;
      border: 1px solid #fde68a;
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
      background: #fef9c3;
      width: 100%;
      border: none;
      border-bottom: 1px solid #fde68a;
      cursor: pointer;
      font-family: inherit;
      text-align: left;
    }
    .panel-header:hover { background: #fef08a; }

    .panel-icon { font-size: 20px; }

    .panel-title {
      font-size: 15px;
      font-weight: 700;
      color: #713f12;
      flex: 1;
    }

    .toggle-icon {
      font-size: 11px;
      color: #713f12;
      opacity: 0.7;
    }

    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px;
    }

    .feedback-content {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 13px;
      line-height: 1.7;
      color: var(--color-text);
    }

    .coaching { color: #166534; }

    .divider {
      border: none;
      border-top: 1px solid #fde68a;
      margin: 12px 0;
    }
  `]
})
export class LearningFeedbackComponent {
  protected tutor = inject(TutorService);
  protected collapsed = signal(true);
  protected toggle() { this.collapsed.update(v => !v); }
}
