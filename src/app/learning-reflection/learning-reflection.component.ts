import { Component, inject } from '@angular/core';
import { TutorService } from '../tutor.service';

@Component({
  selector: 'app-learning-reflection',
  standalone: true,
  template: `
    @if (tutor.finished() && tutor.reflection().length > 0) {
      <div class="reflection-card">
        <div class="reflection-header">
          <span>🎉</span>
          <h2 class="reflection-title">วันนี้ได้เรียนรู้อะไร</h2>
        </div>
        <ul class="reflection-list">
          @for (item of tutor.reflection(); track item) {
            <li class="reflection-item">
              <span class="check">✓</span>
              <span>{{ item }}</span>
            </li>
          }
        </ul>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .reflection-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      border: 1.5px solid #4ade80;
      border-radius: var(--radius);
      padding: 14px 16px;
      margin: 8px 16px 0;
      animation: slideIn 0.4s ease;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .reflection-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 18px;
    }

    .reflection-title {
      font-size: 14px;
      font-weight: 700;
      color: #15803d;
    }

    .reflection-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .reflection-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13.5px;
      color: var(--color-text);
    }

    .check {
      color: #16a34a;
      font-weight: 700;
      flex-shrink: 0;
    }
  `]
})
export class LearningReflectionComponent {
  protected tutor = inject(TutorService);
}
