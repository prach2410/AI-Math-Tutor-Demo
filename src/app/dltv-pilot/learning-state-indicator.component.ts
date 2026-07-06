import { Component, input } from '@angular/core';
import { LearningState, STATE_LABELS } from './dltv-mock-script';

@Component({
  selector: 'app-learning-state-indicator',
  standalone: true,
  template: `
    <div class="state-chip" [style.border-color]="info().color" [style.color]="info().color">
      <span class="state-dot" [style.background]="info().color"></span>
      <span>{{ info().emoji }} {{ info().label }}</span>
    </div>
  `,
  styles: [`
    .state-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      border: 1.5px solid;
      font-size: 13px;
      font-weight: 600;
      background: #fff;
      animation: fadeIn 0.35s ease;
    }
    .state-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
  `],
})
export class LearningStateIndicatorComponent {
  readonly state = input.required<LearningState>();

  get info() {
    return () => STATE_LABELS[this.state()];
  }
}
